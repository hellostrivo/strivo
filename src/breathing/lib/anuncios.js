// src/breathing/lib/anuncios.js
// Qué oye quien no ve la visual (SPEC_14 §8). Pura, para poder contarlo.
//
// La regla que de verdad importa aquí es RN-RE-VIS-24: **una actualización por
// cambio de fase, ni una más.** Un `aria-live` que cambia sesenta veces por
// segundo no es accesibilidad, es un lector de pantalla inservible; y como el
// texto se recalcula en el render, la única forma de garantizarlo es que este
// módulo no dependa del tiempo, solo de la fase.

import { copy, interpolate } from '@copy'
import { ESTADOS } from '@lib/respiracion/maquinaSesion'

/** Los estados en los que no hay fase que anunciar. */
const SIN_FASE = new Set([ESTADOS.INACTIVO, ESTADOS.ACOMODANDO, ESTADOS.COMPLETADO])

/**
 * El texto del anuncio, o cadena vacía si no hay nada que decir.
 *
 * **Los segundos son los de la fase entera, no los que quedan**, y ahí está la
 * regla. Con el tiempo restante el texto cambiaba cada segundo —"durante 5",
 * "durante 4", "durante 3"— y un `aria-live` que se reescribe cinco veces por
 * fase interrumpe al lector de pantalla en mitad de la frase anterior. Lo que
 * hace falta oír al empezar a inhalar es cuánto dura la inhalación, una vez.
 * Medido: con el restante salían 39 anuncios en tres ciclos; con la duración,
 * 9, que son exactamente los cambios de fase (RN-RE-VIS-24).
 *
 * La cuenta regresiva visible sí baja de segundo en segundo, pero esa es otra
 * cosa: se mira, no se escucha, y la escribe `pintar()` sobre el nodo.
 *
 * RN-RE-VIS-26 — En pausa se dice una vez y se callan las fases. Seguir
 * cantando "Inhala" con el ejercicio detenido sería pedirle a alguien que haga
 * lo que la app acaba de parar.
 *
 * @param {?string} fase
 * @param {number} msFase - Lo que dura la fase entera.
 * @param {string} estadoSesion
 * @param {object} [textos] - El namespace `respiracion`. Se inyecta en pruebas.
 * @returns {string}
 */
export function mensajeAccesible(fase, msFase, estadoSesion, textos = copy.respiracion) {
  if (estadoSesion === ESTADOS.PAUSADO) return textos.estados.pausado
  if (SIN_FASE.has(estadoSesion)) return ''

  const plantilla = textos.fasesAccesibles[fase]
  if (!plantilla) return ''

  return interpolate(plantilla, { segundos: segundosDe(msFase) })
}

/**
 * Los segundos que se leen en voz alta.
 *
 * Se redondea hacia arriba porque es lo que se hace al contar en voz alta: a
 * falta de 3,4 s quedan "cuatro segundos", no tres. Redondear hacia abajo deja
 * a quien escucha siempre un poco por detrás del ejercicio.
 */
export function segundosDe(ms) {
  const n = Number(ms)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.ceil(n / 1000)
}

/**
 * ¿Este cambio merece volver a anunciar?
 *
 * Lo consulta el componente antes de tocar el nodo vivo. Comparar el texto y no
 * la fase resuelve de paso el caso de la pausa: entrar y salir de pausa dentro
 * de la misma fase sí son dos anuncios distintos, y dos frames de la misma fase
 * no son ninguno.
 */
export function cambioDeAnuncio(anterior, siguiente) {
  return anterior !== siguiente
}
