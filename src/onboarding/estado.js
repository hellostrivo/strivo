// src/onboarding/estado.js
// Lo que el onboarding tiene en la mano y lo que de eso llega al árbol de datos.
//
// Está separado del hook a propósito: aquí no hay React, así que qué se guarda
// —y qué no— se puede leer y probar sin montar una pantalla.
//
// **Cada campo va a su sitio del modelo canónico**, y ninguno es nuevo: el
// nombre, el género y los horarios son `shared/profile`; el motivo y por dónde
// va el recorrido son `shared/onboarding`; los avisos son
// `shared/preferences`. Un campo fuera de esas listas lanza `UNKNOWN_FIELD` al
// escribir (RN-DB-03), que es lo que mantiene honesto este archivo.
//
// **`identidadCentral` ya no se escribe desde aquí.** P4 se retiró del
// recorrido, así que nadie vuelve a poner esa frase; la que ya esté guardada se
// queda donde está y `updateProfile` no la toca (RN-DB-04).

import { interpolate } from '@copy'
import { resolveGender } from '@copy/gender'
import { generoDe } from './genero.js'
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
 * El cierre (P8): el saludo de bienvenida, con el nombre y en su género.
 *
 * **Es lo único que se dice en esa pantalla.** Antes llevaba una frase armada
 * con la identidad central y la hora de la vuelta debajo; la identidad se
 * retiró del recorrido y lo demás se retira con ella. Una última pantalla que
 * saluda y abre la puerta no necesita un segundo mensaje explicando el primero.
 *
 * Sin nombre se saluda igual, sin hueco y sin coma colgando: dejar el nombre en
 * blanco es una respuesta válida (RN-02) y el cierre no es sitio para
 * señalarla.
 *
 * @param {object} textos - `copy.diario.onboarding.p8`
 * @param {{nombre?: string, genero?: 'm'|'f'|'n'}} respuesta
 * @returns {string}
 */
export function bienvenidaDe(textos, { nombre, genero } = {}) {
  const suyo = String(nombre ?? '').trim()
  const plantilla = resolveGender(suyo ? textos.welcomeTemplate : textos.welcomePlain, genero)
  return suyo ? interpolate(plantilla, { nombre: suyo }) : plantilla
}
