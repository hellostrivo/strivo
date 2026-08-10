// src/formia/identidad.js
// Lógica del espacio de identidad de Formia (SPEC_03, §C3.3).
//
// Aquí vive todo lo que se puede decidir sin pintar nada: qué áreas se ven, si
// cabe una más, qué pasa cuando alguien vacía su identidad central. El hook
// `useIdentidad.js` solo le pone estado de React encima, y los componentes no
// deciden nada por su cuenta.
//
// RN-DB4-01 — Este módulo no lee `lumia/`. En este espacio no hay journal, ni
// ánimo, ni victorias: la identidad se sostiene sola.
//
// Dónde vive cada texto (§5.1.1, §C3.3):
//   · `identity/central` guarda la frase entera — "alguien que crece".
//   · `areas[id].identityText` guarda solo el complemento — "cuida su cuerpo",
//     porque el área ya pone el sujeto: "En Salud, alguien que cuida su cuerpo".

import { AREA_CATALOG, AREA_IDS, MAX_SELECTED_AREAS, formia } from '@/lib/db'

/** Prefijo con el que se escribe la identidad central desde el onboarding (P3). */
export const PREFIJO_CENTRAL = 'alguien que'

// ─── Texto ────────────────────────────────────────────────────────────────────

export function textoLimpio(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

/** Quita el prefijo para que el editor muestre solo lo que la persona escribió. */
export function sinPrefijoCentral(texto) {
  return textoLimpio(texto).replace(/^alguien que\s+/i, '')
}

/** Devuelve la frase entera a partir de lo que hay en el campo del editor. */
export function conPrefijoCentral(texto) {
  const complemento = sinPrefijoCentral(texto)
  return complemento === '' ? '' : `${PREFIJO_CENTRAL} ${complemento}`
}

/**
 * RN-ID-01 — La identidad central no puede quedarse vacía. Si el campo vuelve
 * en blanco, se conserva la que ya había: no se ha perdido nada y no hay nada
 * que reprochar. `restaurada` existe para poder decirlo con calma, no para
 * marcar un error.
 */
export function resolverCentral(texto, actual) {
  const propuesta = conPrefijoCentral(texto)
  if (propuesta === '') return { central: actual, guardar: false, restaurada: true }
  if (propuesta === actual) return { central: actual, guardar: false, restaurada: false }
  return { central: propuesta, guardar: true, restaurada: false }
}

/** RN-ID-03 — La identidad de área es opcional: dejarla en blanco es válido. */
export function resolverIdentidadArea(texto) {
  const limpio = textoLimpio(texto)
  return limpio === '' ? null : limpio
}

// ─── Áreas ────────────────────────────────────────────────────────────────────

/**
 * Las 7 del catálogo, en su orden, con lo que el usuario haya puesto encima.
 * El catálogo manda en color, ícono y orden; el usuario manda en `selected`,
 * `identityText` y `state`.
 */
export function listarAreas(areas) {
  const mapa = areas ?? {}
  return AREA_IDS.map((id) => ({
    id,
    selected: false,
    identityText: null,
    state: 'activa',
    ...AREA_CATALOG[id],
    ...mapa[id],
  })).sort((a, b) => a.order - b.order)
}

export function areasElegidas(areas) {
  return listarAreas(areas).filter((area) => area.selected === true)
}

/** Las que se ven arriba: elegidas y en marcha. */
export function areasEnMarcha(areas) {
  return areasElegidas(areas).filter((area) => area.state === 'activa')
}

/** RN-ID-04 — Pausadas: salen de la vista activa, no de los datos. */
export function areasPausadas(areas) {
  return areasElegidas(areas).filter((area) => area.state === 'pausada')
}

/** ¿Cabe otra? El tope de 3 se comprueba antes de escribir, no después. */
export function quedaSitio(areas) {
  return areasElegidas(areas).length < MAX_SELECTED_AREAS
}

// ─── Historial de la identidad central ────────────────────────────────────────

/** De la más reciente a la más antigua. La vigente es la que tiene `to: null`. */
export function versionesRecientes(history) {
  return [...(history ?? [])].sort((a, b) => String(b.from).localeCompare(String(a.from)))
}

// ─── Acciones sobre la capa de datos ──────────────────────────────────────────
// Cada una devuelve el estado completo recién leído. Escribir y volver a leer
// cuesta dos accesos a IndexedDB —ambos locales e inmediatos (RN-02)— y a
// cambio la pantalla nunca muestra una versión que la base no tenga.

export async function cargarIdentidad(uid) {
  const [identity, history] = await Promise.all([
    formia.getIdentity(uid),
    formia.getIdentityHistory(uid),
  ])
  return {
    existe: identity !== null,
    central: identity?.central ?? null,
    areas: identity?.areas ?? null,
    history,
  }
}

/**
 * Guardar la central cierra la versión anterior y abre la nueva
 * (`formia.setCentralIdentity` lo hace en la capa de datos). Un texto idéntico
 * al vigente no crea versión: cambiar de opinión y volver atrás no es un cambio.
 */
export async function guardarCentral(uid, texto, actual) {
  const { central, guardar, restaurada } = resolverCentral(texto, actual)
  if (guardar) await formia.setCentralIdentity(uid, central)
  return { estado: await cargarIdentidad(uid), restaurada }
}

export async function guardarIdentidadArea(uid, areaId, texto) {
  await formia.updateArea(uid, areaId, { identityText: resolverIdentidadArea(texto) })
  return { estado: await cargarIdentidad(uid) }
}

/**
 * Tope de 3: cuando no cabe otra, no se escribe nada y se devuelve `tope: true`
 * para que la pantalla lo explique. No es un error ni una infracción.
 */
export async function elegirArea(uid, areaId, areas) {
  if (!quedaSitio(areas)) return { estado: await cargarIdentidad(uid), tope: true }
  // `state` no se toca: un área que se dejó pausada vuelve pausada, y quien la
  // quiera en marcha la reanuda. Nada se corrige solo (RN-DB4-08).
  await formia.updateArea(uid, areaId, { selected: true })
  return { estado: await cargarIdentidad(uid), tope: false }
}

/**
 * RN-04 / RN-DB4-08 — Quitar un área solo cambia `selected`. Su identidad de
 * área, su estado y sus hábitos siguen exactamente donde estaban: los hábitos
 * conservan su `identityRef` (RN-FO-ID-02) y nadie los reasigna en silencio.
 */
export async function quitarArea(uid, areaId) {
  await formia.updateArea(uid, areaId, { selected: false })
  return { estado: await cargarIdentidad(uid) }
}

/** RN-ID-04 — Pausar cambia lo que se muestra, nunca lo que existe. */
export async function pausarArea(uid, areaId) {
  await formia.updateArea(uid, areaId, { state: 'pausada' })
  return { estado: await cargarIdentidad(uid) }
}

export async function reanudarArea(uid, areaId) {
  await formia.updateArea(uid, areaId, { state: 'activa' })
  return { estado: await cargarIdentidad(uid) }
}
