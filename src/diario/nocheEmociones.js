// src/diario/nocheEmociones.js
// "¿Cómo me siento al cerrar el día?" — el catálogo del tercer momento de la
// noche, enlazado con su copy (§7 de la actualización del 23 ago).
//
// Doce opciones más la palabra propia, **selección única**. Sustituye a
// "¿Cómo te vas a dormir?", que admitía dos: nombrar cómo se cierra el día no
// es hacer un inventario, y con dos respuestas la pregunta deja de tener una.
//
// **Las emociones difíciles comparten jerarquía con las agradables.** No hay
// rojo, no hay aviso, no hay orden que las relegue al final y no hay ninguna
// que esté peor contestada que otra. La pregunta es qué hay, no qué convendría
// que hubiera.
//
// La mecánica —alternar, palabra propia, etiqueta de lo guardado— es la de
// `seleccionUnica.js`, la misma que usan las dos preguntas emocionales de la
// mañana. Lo que no se comparte es el vocabulario: son tres catálogos distintos
// y ninguno se puede sustituir por otro.
//
// RN-GEN-04 — Se persiste el `id`. La etiqueta se resuelve al pintar, así que
// cambiar el género del perfil reescribe también las noches ya guardadas. La
// palabra propia **no** pasa por el helper de género (RN-GEN-06).

import { copy } from '@copy'
import { crearSeleccion } from './seleccionUnica.js'

export { ID_OTRA, MAX_PALABRA_PROPIA, etiquetaPropia, recortarPropia } from './seleccionUnica.js'

const textos = copy.diario.noche.emocion

export const CIERRE = crearSeleccion(textos)

/**
 * §8 — Las cuatro emociones que abren por su cuenta la tarjeta de descarga.
 *
 * Es una lista cerrada y explícita, no un análisis: la app no lee lo que
 * alguien escribe para decidir si está mal. Por eso la palabra propia **no**
 * entra aquí, y por eso el enlace para abrir la tarjeta a mano está debajo de
 * todas las emociones y no solo debajo de estas.
 */
export const EMOCIONES_DE_DESCARGA = Object.freeze(['inquieto', 'frustrado', 'triste', 'abrumado'])

/** ¿Esta emoción ofrece la tarjeta de descarga sin que haya que pedirla? */
export function ofreceDescarga(id) {
  return EMOCIONES_DE_DESCARGA.includes(id)
}

// ─── El ánimo de cinco estados (§5.4.1) ───────────────────────────────────────
// Es una **vista, no un dato**: se calcula al vuelo y no se escribe nunca. Lo
// consumen el punto del calendario del Historial y el repertorio de frases del
// día, que son los dos sitios que necesitan una escala corta.
//
// **La escala de cinco no crece con esta actualización**, y tiene un coste
// medido: `triste`, `frustrado` y `abrumado` caen en `inquieto`, que el
// Historial rotula "Con inquietud". Es una etiqueta gruesa para tres estados
// distintos. Ampliarla exigiría un color de marca nuevo en §6.3.5 —y ningún hex
// se escribe a mano—, así que la respuesta exacta se lee donde está: en la
// vista del día, que muestra la emoción tal como se eligió.

const ANIMO_POR_EMOCION = Object.freeze({
  en_paz: 'en_paz',
  agradecido: 'en_paz',
  orgulloso: 'en_paz',
  tranquilo: 'tranquilo',
  aliviado: 'tranquilo',
  pensativo: 'normal',
  neutral: 'normal',
  cansado: 'agotado',
  inquieto: 'inquieto',
  frustrado: 'inquieto',
  triste: 'inquieto',
  abrumado: 'inquieto',
})

/**
 * El ánimo de cinco estados de una emoción de cierre.
 *
 * La palabra propia devuelve `normal`: interpretar lo que alguien escribió para
 * colocarlo en una escala sería exactamente el diagnóstico que §9 prohíbe. Un
 * día existió y se registró; de qué color es su punto, la app no lo deduce.
 *
 * @param {?string} id
 * @returns {'agotado'|'inquieto'|'normal'|'tranquilo'|'en_paz'}
 */
export function animoDeEmocion(id) {
  return ANIMO_POR_EMOCION[id] ?? 'normal'
}
