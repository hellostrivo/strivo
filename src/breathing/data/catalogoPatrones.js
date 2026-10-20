// src/breathing/data/catalogoPatrones.js
// Los patrones que Respiración ofrece (SPEC_13 §5.2).
//
// **Corto y curado a propósito.** La referencia externa ofrece decenas y el
// efecto es que nadie elige: quien abre la app para bajar el ritmo acaba
// comparando tablas. Seis presets y uno a medida cubren el terreno entero.
//
// Aquí no hay ni un nombre ni una descripción: cada entrada apunta a su clave en
// `copy/`, que es donde vive todo lo que se lee (criterio 19).

import { FASES_RETENCION, PATRON_BASE, esCaja, sonIguales } from '@lib/respiracion/motorRitmo'

/** Modos de edición de §5.2. */
export const EDICION = Object.freeze({
  FASES: 'fases',
  LADO_UNICO: 'ladoUnico',
  LIBRE: 'libre',
})

export const ID_PERSONALIZADO = 'personalizado'
export const ID_CAJA = 'caja'

/**
 * `calma-553` es el ritmo de la casa y el preset por defecto.
 * Es el puente de identidad entre la herramienta y el resto de la app: quien
 * respira en Hoy y quien entra a Respiración empiezan en el mismo sitio.
 */
export const ID_POR_DEFECTO = 'calma-553'

/** Rango del lado de la caja, en décimas: 3,0 s a 8,0 s (§5.2). */
export const LADO_CAJA_MIN = 30
export const LADO_CAJA_MAX = 80

function preset({ id, claveCopy, patron, editable, recomendadoPrimeraVez, orden }) {
  return Object.freeze({
    id,
    claveCopy,
    patron: Object.freeze({ ...patron }),
    editable,
    recomendadoPrimeraVez,
    // Mecánico, no editorial: cualquier retención por encima de cero. Es el dato
    // del que cuelga la nota de §7.4, no una etiqueta que alguien elige a mano.
    tieneRetenciones: FASES_RETENCION.some((fase) => patron[fase] > 0),
    orden,
  })
}

export const CATALOGO_PATRONES = Object.freeze([
  preset({
    id: ID_POR_DEFECTO,
    claveCopy: 'calma553',
    patron: { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 },
    editable: EDICION.FASES,
    recomendadoPrimeraVez: false,
    orden: 1,
  }),
  preset({
    id: ID_CAJA,
    claveCopy: 'caja',
    patron: { inhalar: 40, retenerLleno: 40, exhalar: 40, retenerVacio: 40 },
    // Un solo control mueve las cuatro fases: es lo que la hace una caja.
    editable: EDICION.LADO_UNICO,
    recomendadoPrimeraVez: false,
    orden: 2,
  }),
  preset({
    id: 'cuatro-siete-ocho',
    claveCopy: 'cuatroSieteOcho',
    patron: { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 },
    editable: EDICION.FASES,
    recomendadoPrimeraVez: false,
    orden: 3,
  }),
  preset({
    id: 'exhalacion-larga',
    claveCopy: 'exhalacionLarga',
    patron: { inhalar: 40, retenerLleno: 0, exhalar: 80, retenerVacio: 0 },
    editable: EDICION.FASES,
    recomendadoPrimeraVez: false,
    orden: 4,
  }),
  preset({
    id: 'coherencia',
    claveCopy: 'coherencia',
    patron: { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 0 },
    editable: EDICION.FASES,
    recomendadoPrimeraVez: false,
    orden: 5,
  }),
  preset({
    id: 'entrada-suave',
    claveCopy: 'entradaSuave',
    patron: { inhalar: 40, retenerLleno: 0, exhalar: 60, retenerVacio: 0 },
    editable: EDICION.FASES,
    // Sin retenciones y sin esfuerzo: es por donde se empieza.
    recomendadoPrimeraVez: true,
    orden: 6,
  }),
  preset({
    id: ID_PERSONALIZADO,
    claveCopy: 'personalizado',
    // Arranca donde arranca todo. Deja de parecerse en cuanto se toca.
    patron: { ...PATRON_BASE },
    editable: EDICION.LIBRE,
    recomendadoPrimeraVez: false,
    orden: 7,
  }),
])

const POR_ID = Object.freeze(
  Object.fromEntries(CATALOGO_PATRONES.map((entrada) => [entrada.id, entrada])),
)

export const IDS_PATRON = Object.freeze(CATALOGO_PATRONES.map((entrada) => entrada.id))

/** Devuelve la entrada del catálogo, o `null` si el id no existe. */
export function obtenerPreset(id) {
  return POR_ID[id] ?? null
}

/** El patrón de un preset. Si el id no existe, el de por defecto. */
export function patronDe(id) {
  return { ...(obtenerPreset(id) ?? POR_ID[ID_POR_DEFECTO]).patron }
}

/** El preset que se ofrece a quien nunca ha respirado aquí. */
export function presetPrimeraVez() {
  return (
    CATALOGO_PATRONES.find((entrada) => entrada.recomendadoPrimeraVez) ?? POR_ID[ID_POR_DEFECTO]
  )
}

/** Las cuatro fases de una caja de lado `lado` (en décimas). */
export function patronDeLado(lado) {
  const n = Math.min(LADO_CAJA_MAX, Math.max(LADO_CAJA_MIN, Math.round(Number(lado) || 0)))
  return { inhalar: n, retenerLleno: n, exhalar: n, retenerVacio: n }
}

/**
 * RN-RE-MOT-08 — Qué preset es realmente un patrón.
 *
 * Un patrón que ya no coincide con el preset del que salió deja de llevar su
 * nombre: pasa a `personalizado`. La caja es la excepción y por eso existe esta
 * función: mover su lado único de 4,0 s a 5,0 s **sigue siendo una caja**, así
 * que no basta con comparar contra el preset guardado; lo que la define es que
 * sus cuatro fases valgan lo mismo. Editar una sola fase la rompe, y entonces sí
 * deja de serlo.
 */
export function resolverPatronBaseId(patronBaseId, patron) {
  const entrada = obtenerPreset(patronBaseId)
  if (entrada === null || entrada.id === ID_PERSONALIZADO) return ID_PERSONALIZADO

  if (entrada.id === ID_CAJA) {
    const lado = Number(patron?.inhalar)
    const dentroDeRango = lado >= LADO_CAJA_MIN && lado <= LADO_CAJA_MAX
    return esCaja(patron) && dentroDeRango ? ID_CAJA : ID_PERSONALIZADO
  }

  return sonIguales(patron, entrada.patron) ? entrada.id : ID_PERSONALIZADO
}
