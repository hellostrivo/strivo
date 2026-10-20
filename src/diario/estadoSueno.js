// src/diario/estadoSueno.js
// "¿Cómo te vas a dormir?" — **catálogo heredado, solo lectura** (§5.4.1).
//
// La pregunta se retiró el 23 ago: la sustituyó "¿Cómo me siento al cerrar el
// día?", que es de selección única y vive en `nocheEmociones.js`. Este módulo se
// queda por el mismo motivo que `emociones.js` en la mañana: las noches
// escritas antes de esa fecha guardaron hasta dos estados en
// `nightRitual.sleepState`, y §11 pide que nada de lo ya escrito se sobrescriba
// ni desaparezca. El Historial las sigue leyendo enteras.
//
// **Aquí ya no hay nada de escritura.** Se fueron con la pregunta `alternar`,
// `paraGuardar`, el máximo de dos estados y `disparaCompasion` —el cierre
// compasivo dejó de existir cuando §10 fijó las dos líneas del cierre—. Dejar
// un escritor en un catálogo retirado es invitar a que alguien lo reabra sin
// darse cuenta.
//
// RN-GEN-04 — Se persistieron los `id`, que son opacos y estables. Su forma
// masculina es un accidente del código, no una etiqueta: nunca se muestran.

import { copy } from '@copy'
import { resolveGender } from '@copy/gender'
import { animoMasPesado } from './nocheEmociones.js'

const textos = copy.diario.noche.sueno

export const OPCIONES = Object.freeze(textos.opciones)
export const IDS = Object.freeze(OPCIONES.map((opcion) => opcion.id))

/** El único id que abrió un campo de texto. */
export const ID_OTRO = 'otro'

/** Longitud de la palabra de "Algo más" con la que se guardó. */
export const MAX_PALABRA = 24

export function esEstado(id) {
  return IDS.includes(id)
}

export function etiquetaDe(id, genero) {
  const opcion = OPCIONES.find((estado) => estado.id === id)
  return opcion ? resolveGender(opcion.label, genero) : ''
}

/** La palabra propia tal como se guardó: una sola, sin transformar. */
export function primeraPalabra(texto) {
  const limpio = String(texto ?? '').trim()
  if (limpio === '') return ''
  return limpio.split(/\s+/)[0].slice(0, MAX_PALABRA)
}

/**
 * Etiquetas para presentar el estado guardado (§5.4.1):
 * "Te fuiste a dormir: En paz · Agradecida". La palabra propia va entrecomillada
 * y sin transformar (RN-GEN-06).
 */
export function etiquetasDe(seleccion, otro, genero) {
  return (seleccion ?? []).map((id) =>
    id === ID_OTRO ? `«${primeraPalabra(otro)}»` : etiquetaDe(id, genero),
  )
}

// ─── animoDerivado (§5.4.1) ───────────────────────────────────────────────────
// Es una **vista, no un dato**: se calcula al vuelo y no se escribe nunca, ni en
// IndexedDB ni en Firestore. Hoy solo la llama `animoDeNoche` de `noche.js`,
// para las noches de la versión 1.

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

// Con dos selecciones gana el más pesado, y ese orden ya no vive aquí: lo
// declara `nocheEmociones.js`, que contesta la misma pregunta para las noches de
// hoy —que desde el 10 de septiembre de 2026 también admiten más de una—. Dos
// copias del mismo orden se separan el día que alguien toque una.

/**
 * El ánimo de cinco estados de una noche de la versión 1.
 *
 * Una noche en que alguien se fue "Agradecida y Cansada" se representa como
 * agotado: la app no maquilla el estado de nadie para que el calendario se vea
 * mejor.
 *
 * @param {string[]} seleccion
 * @returns {'agotado'|'inquieto'|'normal'|'tranquilo'|'en_paz'}
 */
export function animoDerivado(seleccion) {
  return animoMasPesado((seleccion ?? []).map((id) => ANIMO_POR_ESTADO[id]))
}
