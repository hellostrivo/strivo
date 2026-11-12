// src/lib/audio/sesionAudio.js
// La sesión de audio de WebKit y el cuadro de la pantalla de bloqueo
// (SPEC_23 Parte 2, DP-23.19, 23.20, 23.24 y 23.25).
//
// **Por qué existe.** El diagnóstico de la Parte 1 confirmó la hipótesis 4: con
// el tipo de sesión de audio de fábrica (`'auto'`), iOS trata el sonido de
// Strivo como sonido de fondo. Al irse la app WebKit lo interrumpe, y al volver
// el contexto dice «en marcha» con el reloj quieto y no suena (D-21.13). Con
// `navigator.audioSession.type = 'playback'` sigue sonando fuera, con la
// pantalla bloqueada y en modo silencio. Es Web Audio, sin archivos y sin
// plugins: el motor de síntesis sigue siendo el único origen del sonido.
//
// **Solo con sonido** (SPEC_23 §3.3, RN-RE-11). Una sesión en silencio no
// reclama nada: ni «reproducción», ni cuadro, ni toca la música de nadie.
//
// **Dónde vale: donde exista la API** (DP-23.20), en la app de iPhone y en la
// PWA de Safari por igual (iOS 17 o más). Sin ella, nada nuevo.
//
// **Soltar es `'auto'` y después cerrar el contexto, en ese orden.** Leído en el
// código de WebKit: volver a `'auto'` solo cambia la categoría a «ambiente», sin
// desactivar la sesión, e iOS devuelve el volumen a la música ajena al
// desactivarla. La desactivación llega al cerrar el contexto. Lo cierra quien
// lo prestó (`contextoAudio.liberar`); aquí solo se cambia el tipo.
//
// **Los botones de la pantalla de bloqueo no llaman a nuestro código** con Web
// Audio: WebKit suspende y reanuda el contexto él solo. Por eso `vigilar` lee
// los cambios de estado del contexto: «suspendido» —que este código no provoca
// nunca— es la pausa de la pantalla de bloqueo; la vuelta a «en marcha»,
// reproducir; «interrumpido», una llamada u otra app. Los manejadores `play` y
// `pause` se registran igual: con ellos iOS enseña solo esos dos botones.
//
// No conoce `breathing/` ni `diario/`: el título y el subtítulo le llegan.

import { avisar } from './observadorAudio.js'

const nav = () => (typeof navigator === 'undefined' ? null : navigator)

// ─── El tipo de sesión de audio (DP-23.19) ────────────────────────────────────

/** ¿Existe `navigator.audioSession`? iOS 17 o más. */
export function hayTipoDeSesion() {
  const n = nav()
  return n !== null && 'audioSession' in n && n.audioSession !== null
}

function ponerTipo(tipo) {
  if (!hayTipoDeSesion()) return false
  try {
    navigator.audioSession.type = tipo
    return true
  } catch {
    return false
  }
}

/**
 * Reclama «reproducción». **Dentro del toque y antes de crear o reanudar el
 * contexto.** Vale al instante también para un contexto que ya suena.
 */
export function reclamar() {
  return ponerTipo('playback')
}

/** Vuelve a `'auto'`. Después, quien lo prestó cierra el contexto. */
export function soltar() {
  return ponerTipo('auto')
}

/** El tipo que rige, o `null` sin la API. */
export function tipoActual() {
  if (!hayTipoDeSesion()) return null
  try {
    return navigator.audioSession.type ?? null
  } catch {
    return null
  }
}

// ─── El cuadro de la pantalla de bloqueo (DP-23.24) ───────────────────────────

let puesto = false

function hayCuadro() {
  const n = nav()
  return n !== null && 'mediaSession' in n && typeof globalThis.MediaMetadata === 'function'
}

/**
 * Pone el cuadro: título, subtítulo y, si se da, la imagen. Sin la API no
 * hace nada. No lleva datos personales: solo el nombre del patrón.
 *
 * @param {{titulo: string, subtitulo?: string, imagen?: string}} cuadro
 */
export function ponerCuadro({ titulo, subtitulo = '', imagen = null } = {}) {
  if (!hayCuadro()) return false
  try {
    navigator.mediaSession.metadata = new globalThis.MediaMetadata({
      title: titulo,
      artist: subtitulo,
      artwork: imagen ? [{ src: imagen, sizes: '512x512', type: 'image/png' }] : [],
    })
    // Con Web Audio estos manejadores no se llaman (WebKit actúa solo sobre el
    // contexto), pero registrarlos es lo que deja solo pausa y reproducir.
    navigator.mediaSession.setActionHandler('play', () => {})
    navigator.mediaSession.setActionHandler('pause', () => {})
    navigator.mediaSession.playbackState = 'playing'
    puesto = true
    if (import.meta.env.VITE_DIAG_AUDIO === '1') avisar('cuadro', true)
    return true
  } catch {
    return false
  }
}

/** Dice si suena o está en pausa. */
export function estadoDelCuadro(sonando) {
  if (!puesto || !hayCuadro()) return
  try {
    navigator.mediaSession.playbackState = sonando ? 'playing' : 'paused'
  } catch {
    // Sin estado: el cuadro sigue igual.
  }
}

/** Quita el cuadro. Al cerrar el contexto, iOS lo retira del todo. */
export function quitarCuadro() {
  if (!puesto) return
  puesto = false
  if (import.meta.env.VITE_DIAG_AUDIO === '1') avisar('cuadro', false)
  if (!hayCuadro()) return
  try {
    navigator.mediaSession.metadata = null
    navigator.mediaSession.setActionHandler('play', null)
    navigator.mediaSession.setActionHandler('pause', null)
    navigator.mediaSession.playbackState = 'none'
  } catch {
    // Nada que hacer.
  }
}

/** ¿Está puesto? Lo lee el diagnóstico. */
export function cuadroPuesto() {
  return puesto
}

// ─── Lo que hace WebKit con el contexto (DP-23.24 y 23.25) ────────────────────

/**
 * Vigila los cambios de estado del contexto de una sesión con sonido.
 *
 * - `alSuspender`: pasó de «en marcha» a «suspendido» sin que lo pidiera este
 *   código (que nunca llama a `suspend()`): la pausa de la pantalla de bloqueo.
 * - `alReanudar`: volvió a «en marcha» después de esa suspensión: reproducir.
 * - `alInterrumpir`: «interrumpido», una llamada u otra app que toma el audio.
 *
 * @returns {{cancelar: () => void, pasoPorInterrumpido: () => boolean, olvidarInterrupcion: () => void}}
 */
export function vigilar(ctx, { alSuspender, alReanudar, alInterrumpir } = {}) {
  if (!ctx?.addEventListener) {
    return { cancelar: () => {}, pasoPorInterrumpido: () => false, olvidarInterrupcion: () => {} }
  }
  let anterior = ctx.state
  let suspendidoFuera = false
  let interrumpido = false

  function alCambiar() {
    const estado = ctx.state
    if (estado === 'suspended' && anterior === 'running') {
      suspendidoFuera = true
      alSuspender?.()
    } else if (estado === 'running' && suspendidoFuera) {
      suspendidoFuera = false
      alReanudar?.()
    } else if (estado === 'interrupted') {
      interrumpido = true
      suspendidoFuera = false
      alInterrumpir?.()
    }
    anterior = estado
  }

  ctx.addEventListener('statechange', alCambiar)
  return {
    cancelar: () => ctx.removeEventListener?.('statechange', alCambiar),
    pasoPorInterrumpido: () => interrumpido,
    olvidarInterrupcion: () => {
      interrumpido = false
    },
  }
}
