// src/breathing/data/esquema.js
// Forma de lo que Respiración guarda, y su normalización (SPEC_13 §8).
//
// **Este módulo corrige; no rechaza.** Es lo contrario de `lib/db/schema.js`,
// que lanza ante cualquier campo fuera del modelo (RN-DB4-08), y la diferencia
// es deliberada: allí los registros los escribe el código y un campo extraño es
// un error de programación; aquí los escribe una persona moviendo controles, y
// perder una sesión por un valor raro sería castigarla por explorar
// (RN-RE-DAT-08). La frontera entre las dos filosofías es esta carpeta.

import { validarDuracion } from '@lib/respiracion/maquinaSesion'
import { validarPatron } from '@lib/respiracion/motorRitmo'

import { ID_POR_DEFECTO, patronDe, resolverPatronBaseId } from './catalogoPatrones.js'

// ─── Rutas y colecciones ──────────────────────────────────────────────────────
// **Viven aquí y no en `lib/db/schema.js`, y es una decisión.** Ese archivo es
// el modelo canónico de §C5, cuyo árbol tiene exactamente tres raíces —`shared`,
// `lumia`, `formia`— y `breathing/` no es ninguna de ellas: SPEC_13 la añade y
// el blueprint todavía no la recoge.
//
// Ampliarlo habría puesto en rojo el criterio 9 de SPEC_08, que comprueba que el
// modelo canónico no tiene dónde guardar una respiración. Esa prueba **sigue
// diciendo la verdad**: la respiración diaria de Lumia no se registra en ninguna
// parte. Lo que registra es la herramienta, que es otra cosa y guarda lo suyo por
// su cuenta. Dos afirmaciones compatibles, cada una en su sitio.
//
// La forma es la de siempre —un número par de segmentos, colección + `items`—
// así que `local.js` las escribe y `sync.js` las espeja sin saber que existen.

export const rutas = Object.freeze({
  doc: (uid, doc) => `users/${uid}/breathing/${doc}`,
  item: (uid, coleccion, id) => `users/${uid}/breathing/${coleccion}/items/${id}`,
})

/** Etiqueta que agrupa los registros en el almacén local. */
export const COLECCIONES = Object.freeze({
  preferencias: 'breathing',
  favoritos: 'breathing/favoritos',
  recientes: 'breathing/recientes',
  sesiones: 'breathing/sesiones',
})

/** Segmento de la ruta de cada colección. */
export const SEGMENTOS = Object.freeze({
  favoritos: 'favoritos',
  recientes: 'recientes',
  sesiones: 'sesiones',
})

/** Las dos representaciones que SPEC_14 va a construir. */
export const VISUALES = Object.freeze(['circulo', 'linea'])
export const VISUAL_POR_DEFECTO = 'circulo'

/** Clave fija del documento único de preferencias. */
export const CLAVE_PREFERENCIAS = 'unica'

export const VERSION_ESQUEMA = 1

/** RN-RE-DAT-03 — Cinco recientes. La sexta desaloja a la más vieja. */
export const MAX_RECIENTES = 5

/** RN-RE-DAT-06 — Lo que pasa de aquí se purga al abrir la app. */
export const DIAS_RETENCION_SESIONES = 90

export const MAX_NOMBRE_FAVORITO = 40

/**
 * Preferencias de fábrica (§8.2).
 *
 * **RN-RE-DAT-01 — `guiaSonoraActiva` arranca en `false`.** Silencio por
 * defecto, sin excepciones (§6.12 del blueprint). Es exactamente el error que
 * SPEC_08 encontró en `initShared`, que sembraba `soundEnabled: true` y
 * contradecía la regla; cualquier semilla que ponga esto en `true` es un bug,
 * no una preferencia.
 */
export function preferenciasDeFabrica() {
  return {
    clave: CLAVE_PREFERENCIAS,
    schemaVersion: VERSION_ESQUEMA,
    ultimoPatronId: ID_POR_DEFECTO,
    ultimoPatron: patronDe(ID_POR_DEFECTO),
    visualPreferida: VISUAL_POR_DEFECTO,
    sonidoAmbienteId: null,
    volumenAmbiente: 0.6,
    guiaSonoraActiva: false,
    volumenGuia: 0.5,
    duracionPorDefecto: { modo: 'minutos', valor: 3 },
    mantenerPantallaEncendida: true,
    avisoSeguridadVisto: false,
    actualizadoEn: null,
  }
}

// ─── Normalizadores ───────────────────────────────────────────────────────────

function volumen(bruto, porDefecto) {
  const n = Number(bruto)
  if (!Number.isFinite(n)) return porDefecto
  return Math.min(1, Math.max(0, n))
}

function booleano(bruto, porDefecto) {
  return typeof bruto === 'boolean' ? bruto : porDefecto
}

function texto(bruto, maximo) {
  if (typeof bruto !== 'string') return null
  const limpio = bruto.trim().slice(0, maximo)
  return limpio.length === 0 ? null : limpio
}

function visual(bruto) {
  return VISUALES.includes(bruto) ? bruto : VISUAL_POR_DEFECTO
}

function ahoraISO() {
  return new Date().toISOString()
}

/** Un patrón y su preset, resueltos juntos: nunca se guarda uno sin el otro. */
function patronYBase(patronBruto, baseBruto) {
  const patron = validarPatron(patronBruto).patron
  return { patron, patronBaseId: resolverPatronBaseId(baseBruto, patron) }
}

/**
 * Mezcla un parcial sobre lo guardado y devuelve preferencias completas.
 * Cualquier campo que no exista en el modelo se descarta en silencio: es una
 * preferencia, no un registro, y no hay nada que reportar.
 */
export function normalizarPreferencias(guardadas, parcial = {}) {
  const base = { ...preferenciasDeFabrica(), ...(guardadas ?? {}) }
  const mezcla = { ...base, ...(parcial ?? {}) }
  const { patron, patronBaseId } = patronYBase(mezcla.ultimoPatron, mezcla.ultimoPatronId)

  return {
    clave: CLAVE_PREFERENCIAS,
    schemaVersion: VERSION_ESQUEMA,
    ultimoPatronId: patronBaseId,
    ultimoPatron: patron,
    visualPreferida: visual(mezcla.visualPreferida),
    sonidoAmbienteId: texto(mezcla.sonidoAmbienteId, 60),
    volumenAmbiente: volumen(mezcla.volumenAmbiente, 0.6),
    guiaSonoraActiva: booleano(mezcla.guiaSonoraActiva, false),
    volumenGuia: volumen(mezcla.volumenGuia, 0.5),
    duracionPorDefecto: validarDuracion(mezcla.duracionPorDefecto).duracion,
    mantenerPantallaEncendida: booleano(mezcla.mantenerPantallaEncendida, true),
    avisoSeguridadVisto: booleano(mezcla.avisoSeguridadVisto, false),
    actualizadoEn: ahoraISO(),
  }
}

/**
 * Un favorito completo (§8.3). Las reglas de negocio son de SPEC_15; aquí solo
 * la forma. Un favorito sin nombre recibe el del preset del que salió, porque
 * quedarse sin etiqueta lo volvería imposible de reconocer en una lista.
 */
export function normalizarFavorito(datos = {}, previo = null) {
  const base = { ...(previo ?? {}), ...(datos ?? {}) }
  const { patron, patronBaseId } = patronYBase(base.patron, base.patronBaseId)

  return {
    id: typeof base.id === 'string' && base.id.length > 0 ? base.id : null,
    nombre: texto(base.nombre, MAX_NOMBRE_FAVORITO),
    patron,
    patronBaseId,
    visual: visual(base.visual),
    sonidoAmbienteId: texto(base.sonidoAmbienteId, 60),
    volumenAmbiente: volumen(base.volumenAmbiente, 0.6),
    guiaSonoraActiva: booleano(base.guiaSonoraActiva, false),
    volumenGuia: volumen(base.volumenGuia, 0.5),
    duracion: validarDuracion(base.duracion).duracion,
    creadoEn: typeof base.creadoEn === 'string' ? base.creadoEn : ahoraISO(),
    actualizadoEn: ahoraISO(),
    ultimoUsoEn: typeof base.ultimoUsoEn === 'string' ? base.ultimoUsoEn : null,
    usos: Number.isFinite(Number(base.usos)) ? Math.max(0, Math.trunc(Number(base.usos))) : 0,
  }
}

/** Una configuración recién usada (§8.4). */
export function normalizarReciente(config = {}) {
  const { patron, patronBaseId } = patronYBase(config?.patron, config?.patronBaseId)
  return {
    id: typeof config?.id === 'string' && config.id.length > 0 ? config.id : null,
    patron,
    patronBaseId,
    visual: visual(config?.visual),
    sonidoAmbienteId: texto(config?.sonidoAmbienteId, 60),
    duracion: validarDuracion(config?.duracion).duracion,
    usadoEn: typeof config?.usadoEn === 'string' ? config.usadoEn : ahoraISO(),
  }
}

/**
 * El registro mínimo de una sesión (§8.5).
 *
 * **RN-RE-DAT-07 — de aquí no se derivan rachas, metas ni logros.** Es
 * telemetría local para alimentar recientes y poco más. Si algún día alguien
 * quiere construir una cuenta de constancia sobre esto, la respuesta está aquí.
 */
export function normalizarSesion(datos = {}) {
  const entero = (bruto) => {
    const n = Number(bruto)
    return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0
  }
  return {
    id: typeof datos?.id === 'string' && datos.id.length > 0 ? datos.id : null,
    iniciadaEn: typeof datos?.iniciadaEn === 'string' ? datos.iniciadaEn : ahoraISO(),
    patronBaseId: resolverPatronBaseId(
      datos?.patronBaseId,
      datos?.patron ?? patronDe(datos?.patronBaseId),
    ),
    ciclosCompletados: entero(datos?.ciclosCompletados),
    segundosActivos: entero(datos?.segundosActivos),
    terminadaPorPersona: booleano(datos?.terminadaPorPersona, false),
  }
}

/** Comparación de configuraciones para RN-RE-DAT-04. */
export function mismaConfiguracion(a, b) {
  return (
    a?.patron?.inhalar === b?.patron?.inhalar &&
    a?.patron?.retenerLleno === b?.patron?.retenerLleno &&
    a?.patron?.exhalar === b?.patron?.exhalar &&
    a?.patron?.retenerVacio === b?.patron?.retenerVacio &&
    a?.visual === b?.visual &&
    (a?.sonidoAmbienteId ?? null) === (b?.sonidoAmbienteId ?? null)
  )
}
