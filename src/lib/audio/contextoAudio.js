// src/lib/audio/contextoAudio.js
// Un solo `AudioContext` para toda la app (SPEC_15 §2.1).
//
// **Por qué uno solo.** Los navegadores limitan cuántos contextos de audio
// puede abrir una pestaña —seis en varios de ellos— y cada uno arrastra su
// propio hilo de render. Con la guía sonora por un lado y el sonido ambiente
// por otro, dos contextos serían además dos relojes: `currentTime` no es
// comparable entre contextos, así que programar un pulso en uno y un fundido en
// el otro deja de tener una referencia común. Es el mismo argumento que sostiene
// que el círculo y el tono compartan reloj en SPEC_08.
//
// **Por qué vive en `lib/audio/` y no en `src/shared/audio/`, que es donde lo
// pedía §2.1.** `src/shared/` no existe en este repo, y crearlo dejaría dos
// carpetas con el mismo significado —`lib/` ya es el territorio neutral, donde
// están `constancia.js`, `timeSlot.js` y el motor de respiración— sin ninguna
// regla que dijera cuál usar. Es la misma decisión que tomó SPEC_13 con
// `lib/respiracion/`, y por el mismo motivo. El razonamiento de §2.1 se cumple
// entero: esto lo consumen Lumia y Respiración, así que no puede vivir dentro
// de ninguno de los dos.
//
// **Préstamos, no propiedad.** Quien necesita audio lo pide y lo suelta. El
// contexto se cierra cuando lo suelta el último, y no antes: si `detener()` de
// la guía cerrara el contexto, el ambiente se quedaría mudo a media sesión sin
// que nadie entendiera por qué. Cerrarlo al llegar a cero es lo que mantiene
// intacta RN-AUD-04 —al salir del ejercicio de Lumia no queda nada vivo—, que es
// exactamente lo que la prueba de SPEC_08 comprueba desde entonces.

let contexto = null
let prestamos = 0

function crearPorDefecto() {
  if (typeof window === 'undefined') return null
  const Contexto = window.AudioContext ?? window.webkitAudioContext
  if (!Contexto) return null
  return new Contexto()
}

/**
 * Pide el contexto. Lo crea si no lo había.
 *
 * **RN-AUD-01 / §2.2 — Se llama desde el manejador del gesto, nunca al montar.**
 * Un contexto creado fuera de un gesto llega suspendido y no suena; peor, llega
 * suspendido en silencio, sin error, y el fallo aparece en el teléfono de otra
 * persona. Quien llame a esto tiene que estar dentro de un `onClick`.
 *
 * @param {{crear?: Function}} [opciones] - La fábrica existe para las pruebas.
 * @returns {?AudioContext} `null` si el navegador no tiene Web Audio (caso 6.1).
 */
export function adquirir({ crear = crearPorDefecto } = {}) {
  if (contexto !== null && contexto.state === 'closed') {
    contexto = null
    prestamos = 0
  }
  if (contexto === null) {
    contexto = crear()
    prestamos = 0
  }
  if (contexto === null) return null
  prestamos += 1
  return contexto
}

/**
 * Suelta un préstamo. Cierra el contexto solo cuando no queda ninguno.
 *
 * Es idempotente y soporta que la llamen de más: nunca baja de cero y nunca
 * cierra dos veces.
 */
export function liberar() {
  if (contexto === null) return
  prestamos = Math.max(0, prestamos - 1)
  if (prestamos > 0) return
  try {
    contexto.close?.()
  } catch {
    // Ya estaba cerrado. No hay nada que hacer y nada que contar.
  }
  contexto = null
}

/**
 * Reanuda el contexto si el navegador lo tenía suspendido.
 *
 * RN-RE-SND-24 — Al recuperar el foco no basta con `resume()`: el volumen se
 * restablece con rampa, y de eso se encarga el mezclador. Aquí solo se despierta
 * el contexto.
 *
 * @returns {Promise<boolean>} Si quedó corriendo.
 */
export async function reanudar() {
  if (contexto === null) return false
  if (contexto.state === 'suspended') {
    try {
      await contexto.resume()
    } catch {
      return false
    }
  }
  return contexto.state === 'running'
}

/** El contexto vivo, o `null`. Lo usan el mezclador y las pruebas. */
export function actual() {
  return contexto
}

/** Cuántos préstamos hay en pie. Solo para pruebas y diagnóstico. */
export function prestamosVivos() {
  return prestamos
}

/** ¿Hay Web Audio en este navegador? (caso 6.1) */
export function haySoporte() {
  if (typeof window === 'undefined') return false
  return Boolean(window.AudioContext ?? window.webkitAudioContext)
}

/**
 * Olvida el contexto sin cerrarlo.
 * Existe para que una prueba no arrastre el estado a la siguiente; en la app no
 * la llama nadie, porque olvidar un contexto sin cerrarlo es una fuga.
 */
export function reiniciarParaPruebas() {
  contexto = null
  prestamos = 0
}
