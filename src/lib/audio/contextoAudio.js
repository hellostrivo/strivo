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
// entero: esto lo consumen el diario y Respiración, así que no puede vivir dentro
// de ninguno de los dos.
//
// **Préstamos, no propiedad.** Quien necesita audio lo pide y lo suelta. El
// contexto se cierra cuando lo suelta el último, y no antes: si `detener()` de
// la guía cerrara el contexto, el ambiente se quedaría mudo a media sesión sin
// que nadie entendiera por qué. Cerrarlo al llegar a cero es lo que mantiene
// intacta RN-AUD-04 —al salir del ejercicio diario no queda nada vivo—, que es
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
 * Los estados en los que no hay nada que reanudar. Todos los demás se intentan.
 *
 * D-21.13 — **No basta con mirar `'suspended'`.** WebKit en iOS tiene un cuarto
 * estado, `'interrupted'`, fuera del estándar: es en el que deja el contexto
 * cuando la app pasa a segundo plano. Preguntar solo por `'suspended'` hacía que
 * al volver no se intentara nada y la Respiración siguiera muda. Se enumera lo
 * que se excluye y no lo que se incluye, para que un estado que todavía no
 * conocemos se intente en vez de ignorarse.
 */
const NO_SE_REANUDA = new Set(['running', 'closed'])

/**
 * Cuánto se espera a `resume()` antes de dar el intento por perdido.
 *
 * WebKit puede dejar la promesa sin resolver cuando el contexto está
 * interrumpido y no hubo gesto: espera al gesto en lugar de rechazar. Sin techo,
 * quien espera `reanudar()` se quedaría colgado y nunca llegaría a pedir el
 * siguiente toque. Que llegue tarde no se pierde: si el contexto acaba
 * corriendo, el siguiente toque lo encuentra así y aplica el audio.
 */
export const ESPERA_DE_REANUDAR_MS = 1000

/**
 * Reanuda un contexto cualquiera si no está corriendo.
 *
 * Es la regla de D-21.13 sin el singleton: la usan `reanudar()`, sobre el único
 * contexto de la app, y la guía de «Respira un momento», que en las pruebas
 * trae su propio contexto y no puede pasar por el registro de préstamos.
 *
 * `resume()` se llama **antes del primer `await`**, así que llamado desde el
 * manejador de un toque corre dentro del gesto, que es lo que pide WebKit.
 *
 * @param {?AudioContext} ctx
 * @param {{espera?: number}} [opciones] - El techo existe para las pruebas.
 * @returns {Promise<boolean>} Si quedó corriendo.
 */
export async function reanudarContexto(ctx, { espera = ESPERA_DE_REANUDAR_MS } = {}) {
  if (!ctx) return false
  if (!NO_SE_REANUDA.has(ctx.state)) {
    let techo = null
    try {
      await Promise.race([
        ctx.resume(),
        new Promise((resolver) => {
          techo = setTimeout(resolver, espera)
        }),
      ])
    } catch {
      return false
    } finally {
      clearTimeout(techo)
    }
  }
  return ctx.state === 'running'
}

/**
 * Reanuda el contexto de la app si no está corriendo.
 *
 * RN-RE-SND-24 — Al recuperar el foco no basta con `resume()`: el volumen se
 * restablece con rampa, y de eso se encarga el mezclador. Aquí solo se despierta
 * el contexto.
 *
 * @param {{espera?: number}} [opciones]
 * @returns {Promise<boolean>} Si quedó corriendo.
 */
export async function reanudar(opciones) {
  const ctx = contexto
  if (ctx === null) return false
  const corriendo = await reanudarContexto(ctx, opciones)
  // Si mientras tanto se soltó y se creó otro, este ya no es el de nadie.
  return corriendo && ctx === contexto
}

/**
 * Los eventos que WebKit cuenta como gesto. Se escuchan todos porque un mismo
 * toque dispara varios y no todos los navegadores dan permiso en el mismo:
 * `touchend` en iOS, `pointerup` y `click` en el resto, `keydown` con teclado.
 */
const EVENTOS_DE_GESTO = ['touchend', 'pointerup', 'click', 'keydown']

/**
 * D-21.13 — Reanuda el contexto con el siguiente toque de la persona.
 *
 * Es el camino de vuelta cuando reanudar no lo consiguió por su cuenta: al
 * volver a la app, WebKit puede exigir un gesto para despertar el contexto. No
 * se pide ese gesto —no hay texto ni botón nuevo—; se aprovecha el primero que
 * llegue, sea cual sea.
 *
 * Escucha en fase de captura y en pasivo: no impide nada ni cambia lo que el
 * toque hace donde cae. **`alCorrer` se llama una sola vez**, cuando el contexto
 * queda corriendo, y en ese momento se retira. Un toque que el navegador no
 * cuente como gesto —uno que acaba en desplazamiento— no la gasta: el oyente
 * sigue esperando al siguiente.
 *
 * @param {EventTarget} objetivo - Normalmente `document`.
 * @param {Function} alCorrer - Qué hacer cuando vuelve a sonar.
 * @param {{reanudar?: Function}} [opciones] - Qué contexto despertar; por
 *   defecto, el de la app.
 * @returns {Function} Retira el oyente. Idempotente.
 */
export function reanudarConElSiguienteToque(
  objetivo,
  alCorrer,
  { reanudar: intentar = reanudar } = {},
) {
  if (!objetivo?.addEventListener) return () => {}
  let vivo = true

  function retirar() {
    if (!vivo) return
    vivo = false
    EVENTOS_DE_GESTO.forEach((tipo) => objetivo.removeEventListener(tipo, alTocar, true))
  }

  function alTocar() {
    if (!vivo) return
    intentar().then((corriendo) => {
      if (!vivo || !corriendo) return
      retirar()
      alCorrer()
    })
  }

  EVENTOS_DE_GESTO.forEach((tipo) =>
    objetivo.addEventListener(tipo, alTocar, { capture: true, passive: true }),
  )
  return retirar
}

/**
 * D-21.13 — Despierta el audio al volver a la app: lo intenta ya y, si no
 * corre, espera al siguiente toque. `alCorrer` se llama una sola vez, en
 * cuanto el contexto vuelve a correr por cualquiera de los dos caminos.
 *
 * Es lo que comparten la Respiración y «Respira un momento». Cada uno decide
 * qué es volver a aplicar su audio; esto solo decide cuándo.
 *
 * @param {EventTarget} objetivo - Normalmente `document`.
 * @param {Function} alCorrer
 * @param {{reanudar?: Function}} [opciones]
 * @returns {Function} Lo cancela todo: el intento en vuelo y el oyente.
 */
export function despertarAlVolver(objetivo, alCorrer, { reanudar: intentar = reanudar } = {}) {
  let vivo = true
  let retirarToque = null
  intentar().then((corriendo) => {
    if (!vivo) return
    if (corriendo) {
      vivo = false
      alCorrer()
      return
    }
    retirarToque = reanudarConElSiguienteToque(
      objetivo,
      () => {
        vivo = false
        alCorrer()
      },
      { reanudar: intentar },
    )
  })
  return () => {
    vivo = false
    retirarToque?.()
    retirarToque = null
  }
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
