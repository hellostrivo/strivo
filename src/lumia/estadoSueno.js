// src/lumia/estadoSueno.js
// "¿Cómo te vas a dormir?" — el último bloque de la Vista de Noche (§5.4.1).
//
// Nueve opciones en orden fijo, de lo más ligero a lo más pesado, con "Algo
// más" siempre al final. El orden no se personaliza ni se reordena por uso: la
// estabilidad de posición es parte de la calma de la pantalla.
//
// El catálogo **incluye estados difíciles** a propósito. Cerrar el día en falso
// no le sirve a nadie (§3.4).
//
// RN-GEN-04 — Se persisten los `id`, que son opacos y estables. Su forma
// masculina es un accidente del código, no una etiqueta: nunca se muestran.

import { copy } from '@copy'
import { resolveGender } from '@copy/gender'

const textos = copy.lumia.diario.noche.sueno

export const OPCIONES = Object.freeze(textos.opciones)
export const IDS = Object.freeze(OPCIONES.map((opcion) => opcion.id))

/** El único id que abre un campo de texto. */
export const ID_OTRO = 'otro'

/** §5.4.1 — Máximo dos. Mínimo cero: el bloque nunca bloquea el cierre. */
export const MAX_ESTADOS = 2

/** Longitud máxima de la palabra de "Algo más". */
export const MAX_PALABRA = 24

export function esEstado(id) {
  return IDS.includes(id)
}

export function etiquetaDe(id, genero) {
  const opcion = OPCIONES.find((estado) => estado.id === id)
  return opcion ? resolveGender(opcion.label, genero) : ''
}

/**
 * Toca un estado. Igual que las emociones de la mañana: la tercera entra y la
 * más antigua sale, sin mensaje de error.
 *
 * @returns {{seleccion: string[], desplazada: string|null}}
 */
export function alternarEstado(seleccion, id) {
  const actual = Array.isArray(seleccion) ? seleccion : []
  if (!esEstado(id)) return { seleccion: actual, desplazada: null }

  if (actual.includes(id)) {
    return { seleccion: actual.filter((otro) => otro !== id), desplazada: null }
  }

  if (actual.length < MAX_ESTADOS) {
    return { seleccion: [...actual, id], desplazada: null }
  }

  const [masAntiguo, ...resto] = actual
  return { seleccion: [...resto, id], desplazada: masAntiguo }
}

/**
 * "Algo más" acepta **una** palabra y solo una: los espacios no crean una
 * segunda. Se guarda tal cual, sin autocorrección y sin pasar por el helper de
 * género (RN-GEN-06).
 */
export function primeraPalabra(texto) {
  const limpio = String(texto ?? '').trim()
  if (limpio === '') return ''
  return limpio.split(/\s+/)[0].slice(0, MAX_PALABRA)
}

/**
 * Lo que de verdad se guarda. Si alguien eligió "Algo más" y no escribió nada,
 * la selección se descarta al salir del bloque: no se guarda una opción vacía.
 */
export function paraGuardar(seleccion, otro) {
  const palabra = primeraPalabra(otro)
  const estados = (seleccion ?? []).filter((id) => id !== ID_OTRO || palabra !== '')
  return {
    sleepState: estados,
    sleepStateOther: estados.includes(ID_OTRO) ? palabra : null,
  }
}

/**
 * Etiquetas para presentar el estado guardado (§5.4.1):
 * "Te fuiste a dormir: En paz · Agradecida". La palabra propia va entrecomillada
 * y sin transformar.
 */
export function etiquetasDe(seleccion, otro, genero) {
  return (seleccion ?? []).map((id) =>
    id === ID_OTRO ? `«${primeraPalabra(otro)}»` : etiquetaDe(id, genero),
  )
}

// ─── animoDerivado (§5.4.1) ───────────────────────────────────────────────────
// Es una **vista, no un dato**: se calcula al vuelo y no se escribe nunca, ni en
// IndexedDB ni en Firestore. Si mañana cambia el catálogo, cambia esta tabla y
// no hay migración que hacer.

const ANIMO_POR_ESTADO = Object.freeze({
  en_paz: 'en_paz',
  agradecido: 'en_paz',
  orgulloso: 'en_paz',
  contento: 'en_paz',
  tranquilo: 'tranquilo',
  pensativo: 'normal',
  cansado: 'agotado',
  inquieto: 'inquieto',
  otro: 'normal',
})

/** De lo más pesado a lo más ligero. Con dos selecciones, gana el más pesado. */
const ORDEN_DE_PESO = Object.freeze(['agotado', 'inquieto', 'normal', 'tranquilo', 'en_paz'])

/**
 * El ánimo de cinco estados que necesitan el Historial y los Insights.
 *
 * Un día en que alguien se va "Agradecida y Cansada" se representa como
 * agotado: la app no maquilla el estado de nadie para que el calendario se vea
 * mejor.
 *
 * @param {string[]} seleccion
 * @returns {'agotado'|'inquieto'|'normal'|'tranquilo'|'en_paz'}
 */
export function animoDerivado(seleccion) {
  const animos = (seleccion ?? [])
    .map((id) => ANIMO_POR_ESTADO[id])
    .filter((animo) => animo !== undefined)
  if (animos.length === 0) return 'normal'
  return ORDEN_DE_PESO.find((animo) => animos.includes(animo)) ?? 'normal'
}

/**
 * RN-VN-04 y regla de sensibilidad de §5.4.1: `cansado` e `inquieto` cambian la
 * secuencia de cierre a la variante compasiva, sin celebración.
 *
 * `pensativo` **no** la dispara: pensar mucho no es lo mismo que estar mal.
 */
export function disparaCompasion(seleccion) {
  return (seleccion ?? []).some((id) => id === 'cansado' || id === 'inquieto')
}
