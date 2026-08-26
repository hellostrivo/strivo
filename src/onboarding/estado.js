// src/onboarding/estado.js
// Lo que el onboarding tiene en la mano y lo que de eso llega al árbol de datos.
//
// Está separado del hook a propósito: aquí no hay React, así que qué se guarda
// —y qué no— se puede leer y probar sin montar una pantalla.
//
// **Cada campo va a su sitio del modelo canónico**, y ninguno es nuevo salvo
// los que el spec añadió: el nombre, el género, la identidad y los horarios son
// `shared/profile`; el motivo y por dónde va el recorrido son
// `shared/onboarding`; los avisos son `shared/preferences`. Un campo fuera de
// esas listas lanza `UNKNOWN_FIELD` al escribir (RN-DB-03), que es lo que
// mantiene honesto este archivo.

import { interpolate } from '@copy'
import { generoDe } from './genero.js'
import { paraGuardar as identidadParaGuardar, paraCierre } from './identidad.js'
import { paraGuardar as motivosParaGuardar } from './motivos.js'
import { normalizarHora, DESPERTAR_SUGERIDO, DORMIR_SUGERIDO } from './horarios.js'
import { ORDEN, VERSION } from './pasos.js'

/**
 * Lo que hay antes de contestar nada.
 *
 * Los dos horarios arrancan con una hora propuesta y no en blanco: un
 * `<input type="time">` vacío es una casilla que hay que rellenar, y ninguna
 * pregunta de este producto lo es. Cambiarla es tocarla; dejarla es aceptarla.
 */
export const RESPUESTAS_INICIALES = Object.freeze({
  nombre: '',
  genero: null,
  motivos: Object.freeze([]),
  motivoOtro: '',
  identidad: '',
  despertar: DESPERTAR_SUGERIDO,
  dormir: DORMIR_SUGERIDO,
})

/**
 * Lo que se escribe en `shared/profile`.
 *
 * Se escriben también los que quedaron en blanco, como `null`: dejar una
 * pregunta sin contestar es una respuesta, y guardarla como tal es lo que evita
 * que un campo vacío se lea después como un dato que falta (RN-02, RN-DB-02).
 */
export function perfilDesde(respuestas) {
  return {
    name: String(respuestas.nombre ?? '').trim() || null,
    gender: generoDe(respuestas.genero),
    identidadCentral: identidadParaGuardar(respuestas.identidad),
    wakeTime: normalizarHora(respuestas.despertar),
    sleepTime: normalizarHora(respuestas.dormir),
  }
}

/** Lo que se escribe en `shared/onboarding` del motivo (P3). */
export function motivoDesde(respuestas) {
  return motivosParaGuardar(respuestas.motivos, respuestas.motivoOtro)
}

/**
 * Anota un paso como recorrido.
 *
 * Se ordena por el recorrido y no por cuándo se pasó: la lista dice **qué
 * pantallas se vieron**, no en qué orden se navegó, y alguien que vuelve atrás
 * y avanza otra vez no aparece con el recorrido descolocado. Sin
 * duplicados por el mismo motivo.
 */
export function anotarPaso(completedSteps, id) {
  const vistos = new Set([...(completedSteps ?? []), id])
  return ORDEN.filter((paso) => vistos.has(paso))
}

/**
 * El expediente que se guarda al llegar a un paso.
 *
 * `completedAt` **no se toca aquí**: lo escribe el final del recorrido y solo
 * él, porque es la única marca de que el onboarding terminó (RN-DB-09).
 */
export function expedienteDe(paso, completedSteps) {
  return {
    version: VERSION,
    currentStep: paso,
    completedSteps: anotarPaso(completedSteps, paso),
  }
}

/**
 * El cierre (P8): la frase y, si hay hora de despertar, cuándo se vuelven a ver.
 *
 * **Nunca arma una frase con áreas.** Hay dos redacciones y solo dos: con
 * identidad y sin ella. La versión con áreas del modelo anterior no existe en
 * el copy y no tiene de dónde salir.
 *
 * @param {object} textos - `copy.diario.onboarding.p8`
 * @returns {{frase: string, proxima: ?string}}
 */
export function cierreDe(textos, { identidad, despertar } = {}) {
  const frase = identidad
    ? interpolate(textos.closingTemplate, { identidad: paraCierre(identidad) })
    : textos.closingPlain

  const hora = normalizarHora(despertar)
  return {
    frase,
    proxima: hora ? interpolate(textos.nextTemplate, { hora }) : null,
  }
}
