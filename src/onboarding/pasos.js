// src/onboarding/pasos.js
// El recorrido del onboarding: qué pasos hay, en qué orden y cuáles cuentan.
//
// **Ocho pasos y un sub-paso.** El género (P2A) no es un paso: es una pregunta
// que cuelga del nombre, para saber cómo hablarle a quien acaba de escribirlo.
// Por eso no entra en la cuenta del indicador — la misma razón por la que la
// pausa opcional de la mañana no entra en la suya (RN-MAN-02): un total que
// cambia de una persona a otra deja de orientar.
//
// **Y por eso el indicador no se pinta durante el sub-paso**, en vez de repetir
// el número del paso anterior. Es lo que ya hace la mañana con su pausa
// (`DiarioManana.jsx`: el indicador se oculta mientras dura). Un sub-paso que
// enseña un número reclama un sitio en la cuenta que no tiene.
//
// Aquí no hay copy y no hay componentes: solo el orden. Quién pinta cada paso
// lo decide `components/onboarding/Onboarding.jsx`, que es el único que conoce
// las dos listas a la vez.

/**
 * Versión del recorrido, guardada con el expediente del onboarding.
 *
 * 1 — los ocho pasos de F-1B. Sirve para leer un onboarding viejo sabiendo qué
 * se le preguntó, igual que la versión de la mañana y la de la noche.
 */
export const VERSION = 1

/** Los identificadores estables. Es lo que se anota en `completedSteps`. */
export const PASOS = Object.freeze({
  bienvenida: 'p1',
  nombre: 'p2',
  genero: 'p2a',
  motivo: 'p3',
  identidad: 'p4',
  horarios: 'p5',
  recordatorios: 'p6',
  cuenta: 'p7',
  cierre: 'p8',
})

/** El orden en que se recorren, sub-paso incluido. */
export const ORDEN = Object.freeze(['p1', 'p2', 'p2a', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])

/** Los que cuentan para el indicador. El sub-paso no está y no va a estar. */
export const CONTADOS = Object.freeze(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])

/** Lo que dice el indicador: "Paso {n} de {total}". */
export const TOTAL = CONTADOS.length

/** ¿Es un paso del recorrido? */
export function es(id) {
  return ORDEN.includes(id)
}

/** ¿Cuelga de otro paso en vez de ser uno? */
export function esSubPaso(id) {
  return es(id) && !CONTADOS.includes(id)
}

/**
 * Qué número enseña el indicador en este paso.
 * `null` en el sub-paso: no tiene número porque no ocupa sitio en la cuenta.
 *
 * @returns {?{n: number, total: number}}
 */
export function indicadorDe(id) {
  const posicion = CONTADOS.indexOf(id)
  return posicion === -1 ? null : { n: posicion + 1, total: TOTAL }
}

/** El siguiente, o `null` si este era el último. */
export function siguiente(id) {
  const posicion = ORDEN.indexOf(id)
  if (posicion === -1) return ORDEN[0]
  return ORDEN[posicion + 1] ?? null
}

/** El anterior, o `null` si este era el primero. */
export function anterior(id) {
  const posicion = ORDEN.indexOf(id)
  if (posicion <= 0) return null
  return ORDEN[posicion - 1]
}

/**
 * Por dónde retomar un onboarding que se dejó a medias.
 *
 * Se vuelve al paso donde estaba, no al principio: RN-09 dice que toda pantalla
 * se abandona sin coste, y volver a empezar sería el coste. Un `currentStep`
 * que ya no existe —una versión anterior del recorrido— retoma por el primero
 * en vez de dejar a nadie en una pantalla que no está.
 */
export function retomarEn(currentStep) {
  return es(currentStep) ? currentStep : ORDEN[0]
}
