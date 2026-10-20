// src/onboarding/motivos.js
// P3 — qué le gustaría a alguien encontrar aquí.
//
// **Cinco motivos y una palabra propia. Sin la opción de construir hábitos**,
// que era del alcance retirado y no vuelve: un motivo que este producto no
// puede atender no es un motivo, es una promesa.
//
// Es de **selección múltiple y sin tope**, que es lo que la separa de las tres
// preguntas emocionales del día: aquellas admiten un número corto de estados
// —una la noche, hasta tres la mañana— y esta pregunta por lo que se busca, que
// rara vez es una sola cosa y no tiene por qué caber en tres. Por eso no
// reutiliza `seleccionEmociones`: son dos reglas distintas, no dos copias.
//
// **No hay tope de cuántos se eligen.** Un máximo aquí sería pedirle a alguien
// que priorice lo que vino a buscar antes de haber entrado.
//
// RN-DB-06 — Se persisten los identificadores, nunca las etiquetas: cambiar la
// redacción de una opción no reescribe lo que alguien contestó.

/** El id de la opción que abre el campo de texto. */
export const ID_OTRO = 'otro'

/** Los cinco motivos y la palabra propia, en el orden en que se ofrecen. */
export const OPCIONES = Object.freeze(['paz', 'avance', 'escucha', 'sueno', 'espacio', ID_OTRO])

/**
 * El largo de la palabra propia.
 *
 * Es una sugerencia, no una validación (RN-DB-07): se recorta al escribir y no
 * hay nada que se ponga en rojo ni que impida continuar. Sesenta y no treinta
 * —lo que admite una emoción del día— porque aquí no se nombra un estado, se
 * dice una frase corta.
 */
export const MAX_OTRO = 60

/** Recorta la palabra propia sin transformarla de ninguna otra forma. */
export function recortarOtro(texto) {
  return String(texto ?? '').slice(0, MAX_OTRO)
}

/** ¿Es una de las opciones del catálogo? */
export function es(id) {
  return OPCIONES.includes(id)
}

/**
 * Toca una opción: la añade si no estaba, la quita si estaba.
 *
 * Lo elegido se devuelve **en el orden del catálogo y no en el de los toques**.
 * Guardar el orden en que se tocaron convertiría la lista en una prioridad que
 * nadie expresó, y la prioridad es una medida (no-negociable 2).
 */
export function alternar(seleccion, id) {
  const previa = Array.isArray(seleccion) ? seleccion : []
  if (!es(id)) return previa
  const siguiente = previa.includes(id)
    ? previa.filter((elegido) => elegido !== id)
    : [...previa, id]
  return OPCIONES.filter((opcion) => siguiente.includes(opcion))
}

/**
 * Lo que de verdad se guarda.
 *
 * Si se tocó "Otro" y no se escribió nada, la opción se descarta: no se guarda
 * un motivo vacío. Es la misma regla que `seleccionEmociones.paraGuardar` aplica a
 * la palabra propia de las emociones.
 *
 * @returns {{motivos: string[], motivoOtro: ?string}}
 */
export function paraGuardar(seleccion, otro) {
  const elegidos = OPCIONES.filter((opcion) => (seleccion ?? []).includes(opcion))
  const palabra = recortarOtro(otro).trim()

  if (elegidos.includes(ID_OTRO) && palabra === '') {
    return { motivos: elegidos.filter((id) => id !== ID_OTRO), motivoOtro: null }
  }
  return {
    motivos: elegidos,
    motivoOtro: elegidos.includes(ID_OTRO) ? palabra : null,
  }
}
