// src/diario/nocheEmociones.js
// "¿Cómo me siento al cerrar el día?" — el catálogo del tercer momento de la
// noche, enlazado con su copy (§7 de la actualización del 23 ago).
//
// Trece opciones más la palabra propia, **hasta tres** desde el 10 de
// septiembre de 2026. Nació de selección única —"nombrar cómo se cierra el día
// no es hacer un inventario"— y lo pidió el propietario del producto: nadie
// cierra el día sintiendo una sola cosa, y pedir que se elija cuál de dos es la
// verdadera es pedirle a alguien que se resuma justo cuando está terminando.
// Es la misma decisión que la mañana tomó el 30 de agosto, y ahora las tres
// preguntas emocionales del día admiten lo mismo.
//
// **Al llegar a tres, la cuarta no entra hasta soltar alguna**, como en la
// mañana: quitarle a alguien algo que acaba de decir de sí mismo para hacer
// sitio es peor que no añadir lo cuarto. Nada bloquea —ningún chip se apaga, la
// pregunta se puede dejar en blanco entera y el día se cierra igual—; lo único
// que no crece es el tope, y se dice en voz baja al tocar la cuarta.
//
// **Las emociones difíciles comparten jerarquía con las agradables.** No hay
// rojo, no hay aviso, no hay orden que las relegue al final y no hay ninguna
// que esté peor contestada que otra. La pregunta es qué hay, no qué convendría
// que hubiera.
//
// La mecánica —alternar, palabra propia, etiqueta de lo guardado— es la de
// `seleccionEmociones.js`, la misma que usan las dos preguntas emocionales de
// la mañana. Lo que no se comparte es el vocabulario: son tres catálogos
// distintos y ninguno se puede sustituir por otro.
//
// **De aquí sale el punto de ánimo del calendario, que es de cinco estados**, y
// con tres emociones hay que decir cuál manda: gana la más pesada
// (`animoDeCierre`). No es una regla nueva —es la que ya aplicaba `animoDerivado`
// a las noches de la versión 1, que admitían dos estados— y dice lo mismo que
// `grupoDeCierre` en la pregunta del reconocimiento: entre maquillar el día de
// alguien y no maquillarlo, la app no lo maquilla.
//
// RN-GEN-04 — Se persiste el `id`. La etiqueta se resuelve al pintar, así que
// cambiar el género del perfil reescribe también las noches ya guardadas. La
// palabra propia **no** pasa por el helper de género (RN-GEN-06).

import { copy } from '@copy'
import { crearSeleccion } from './seleccionEmociones.js'

export {
  ID_OTRA,
  MAX_PALABRA_PROPIA,
  etiquetaPropia,
  recortarPropia,
} from './seleccionEmociones.js'

const textos = copy.diario.noche.emocion

/**
 * Hasta tres, como las dos preguntas de la mañana. El número lo declara quien
 * crea la selección y de ahí lo toman los chips y el guardado: un tope escrito
 * en dos sitios se separa en cuanto alguien cambia uno.
 */
export const CIERRE = crearSeleccion(textos, { maximo: 3 })

/**
 * §8 — Las cuatro emociones que abren por su cuenta la tarjeta de descarga.
 *
 * Es una lista cerrada y explícita, no un análisis: la app no lee lo que
 * alguien escribe para decidir si está mal. Por eso la palabra propia **no**
 * entra aquí, y por eso el enlace para abrir la tarjeta a mano está debajo de
 * todas las emociones y no solo debajo de estas.
 */
export const EMOCIONES_DE_DESCARGA = Object.freeze(['inquieto', 'frustrado', 'triste', 'abrumado'])

/**
 * ¿Esta emoción ofrece la tarjeta de descarga sin que haya que pedirla?
 *
 * Admite una o varias. **Con una sola de las cuatro basta**: si alguien acaba de
 * decir que cierra el día inquieto, que además esté agradecido no lo desmiente.
 * Es la misma forma de mirar una lista que `grupoDeCierre`, y por el mismo
 * motivo: lo difícil no se tapa con lo sereno.
 *
 * @param {?string|string[]} emocion
 */
export function ofreceDescarga(emocion) {
  const elegidas = (Array.isArray(emocion) ? emocion : [emocion]).filter(Boolean)
  return elegidas.some((id) => EMOCIONES_DE_DESCARGA.includes(id))
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
  feliz: 'en_paz',
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

/**
 * La escala de cinco, **de lo más pesado a lo más ligero**.
 *
 * Vive aquí y en ningún otro sitio: la lee `animoDeCierre` para las noches de
 * hoy y `animoDerivado` para las de la versión 1, que también guardaron más de
 * un estado. Dos copias de este orden se separarían el día que alguien tocara
 * una, y las dos contestan la misma pregunta.
 */
export const ORDEN_DE_ANIMO = Object.freeze([
  'agotado',
  'inquieto',
  'normal',
  'tranquilo',
  'en_paz',
])

/** De varios ánimos, el más pesado. Sin ninguno reconocible, `normal`. */
export function animoMasPesado(animos) {
  const conocidos = (animos ?? []).filter((animo) => ORDEN_DE_ANIMO.includes(animo))
  if (conocidos.length === 0) return 'normal'
  return ORDEN_DE_ANIMO.find((animo) => conocidos.includes(animo)) ?? 'normal'
}

/**
 * El ánimo de cinco estados de cómo se cerró el día, con una emoción o con
 * tres.
 *
 * **Gana la más pesada.** Una noche que se cierra agradecida y agotada se pinta
 * como agotada: la app no maquilla el estado de nadie para que el calendario se
 * vea mejor, que es la misma regla que ya aplicaban las noches de la versión 1.
 * La palabra propia cae en `normal` y no arrastra a nada.
 *
 * @param {?string|string[]} emocion
 * @returns {'agotado'|'inquieto'|'normal'|'tranquilo'|'en_paz'}
 */
export function animoDeCierre(emocion) {
  const elegidas = (Array.isArray(emocion) ? emocion : [emocion]).filter(Boolean)
  if (elegidas.length === 0) return 'normal'
  return animoMasPesado(elegidas.map(animoDeEmocion))
}
