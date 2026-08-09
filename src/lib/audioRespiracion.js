// src/lib/audioRespiracion.js
// La voz del ejercicio de respiración (bloque 05, D.3).
//
// El sonido se genera con la Web Audio API en vez de traer archivos: dos senos
// puros (fundamental y octava) por un paso bajo, con una envolvente larguísima.
// Sin dependencias, sin binarios en el repo y sincronizado con las fases por
// construcción, porque el tono dura exactamente lo que dura la fase.
//
// Tres reglas que no se rompen:
//
// 1. Nunca suena sin un gesto previo. El AudioContext no se crea hasta que
//    alguien llama a despertar(); si el navegador lo deja suspendido, tono()
//    no programa nada y el ejercicio sigue igual, en silencio y sin avisos.
// 2. Nunca hay un clic. Todo entra y sale con rampas exponenciales; ninguna
//    ganancia salta a cero de golpe, ni siquiera al cerrar.
// 3. Nunca queda audio vivo fuera de la pantalla. dormir() suspende y cerrar()
//    cierra; quien monta la voz llama a uno de los dos al irse.

// Baja a propósito: es un acompañamiento, no una pista (D.3).
const GANANCIA     = 0.18
// Web Audio no admite rampas exponenciales hacia cero: este es el "silencio".
const CASI_CERO    = 0.0001
// Corta los armónicos duros del oscilador y deja el aire de abajo
const CORTE_HZ     = 1400
// Sol3 y Re4: una quinta justa, grave y sin tensión. Un tono más abajo (Fa3)
// suena mejor con auriculares y desaparece en el altavoz de un portátil, que es
// donde se va a escuchar casi siempre.
const GRAVE_HZ     = 196.00
const ALTA_HZ      = 293.66
// La octava, por debajo de la fundamental: da cuerpo, no melodía. Pesa lo que
// pesa porque es la que de verdad se oye en un altavoz pequeño.
const MEZCLA_OCTAVA = 0.45
// Lo que tarda en apagarse un tono que se interrumpe (s)
const DESVANECIDO  = 0.25
// Lo que tarda en apagarse todo al cerrar (s). Más corto: nadie lo oye.
const CIERRE       = 0.12

function claseDeContexto() {
  if (typeof window === 'undefined') return null
  return window.AudioContext || window.webkitAudioContext || null
}

// Deja una ganancia congelada en su valor actual, sin saltos, lista para que le
// programen una rampa nueva encima.
function congelar(parametro, ahora) {
  if (typeof parametro.cancelAndHoldAtTime === 'function') {
    parametro.cancelAndHoldAtTime(ahora)
    return
  }
  const valor = Math.max(parametro.value, CASI_CERO)
  parametro.cancelScheduledValues(ahora)
  parametro.setValueAtTime(valor, ahora)
}

export function crearVozDeRespiracion() {
  const Contexto = claseDeContexto()

  let ctx     = null
  let maestro = null
  const vivos = new Set()

  // Se llama desde el gesto que inicia el ejercicio (o desde el control de
  // sonido, que también es un toque). Devuelve si hay audio disponible; si el
  // navegador lo bloquea, devuelve false y nadie tiene que enterarse.
  async function despertar() {
    if (!Contexto) return false

    // Si la página todavía no ha recibido ningún gesto, ni se crea el contexto:
    // crearlo antes de tiempo no adelanta nada y deja un aviso en la consola.
    // Donde no existe userActivation (Safari) se sigue como siempre: el intento
    // falla en silencio si el navegador no lo deja.
    if (!ctx && navigator.userActivation?.hasBeenActive === false) return false

    try {
      if (!ctx) {
        ctx = new Contexto()

        maestro = ctx.createGain()
        maestro.gain.setValueAtTime(1, ctx.currentTime)

        const filtro = ctx.createBiquadFilter()
        filtro.type = 'lowpass'
        filtro.frequency.setValueAtTime(CORTE_HZ, ctx.currentTime)

        maestro.connect(filtro)
        filtro.connect(ctx.destination)
      }

      if (ctx.state === 'suspended') await ctx.resume()
      return ctx.state === 'running'
    } catch {
      // Autoplay bloqueado, dispositivo sin salida, permisos: da igual cuál.
      // El ejercicio se ve y se comporta exactamente igual, sin sonido.
      return false
    }
  }

  // Apaga con un desvanecido corto todo lo que esté sonando. Nunca corta.
  function apagar() {
    if (!ctx) return
    const ahora = ctx.currentTime

    for (const voz of vivos) {
      try {
        congelar(voz.sobre.gain, ahora)
        voz.sobre.gain.exponentialRampToValueAtTime(CASI_CERO, ahora + DESVANECIDO)
        for (const osc of voz.osciladores) osc.stop(ahora + DESVANECIDO + 0.02)
      } catch {
        // El oscilador ya se había detenido solo: no hay nada que apagar
      }
    }
  }

  function oscilador(desdeHz, hastaHz, t0, segundos, destino) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(desdeHz, t0)
    osc.frequency.exponentialRampToValueAtTime(hastaHz, t0 + segundos)
    osc.connect(destino)
    osc.start(t0)
    // Un pelo después del final de la envolvente, que ya llegó a CASI_CERO
    osc.stop(t0 + segundos + 0.05)
    return osc
  }

  // Un tono que recorre la fase entera: sube en la inhalación, baja en la
  // exhalación. La envolvente ocupa los tres tramos de la fase (ataque largo,
  // meseta corta, caída larga), así que nunca hay un borde audible.
  function tono(desdeHz, hastaHz, segundos) {
    if (!ctx || ctx.state !== 'running') return

    // Lo que sonara antes se va desvaneciendo mientras este entra: dos rampas
    // suaves cruzándose, nunca un corte
    apagar()

    const t0 = ctx.currentTime

    const sobre = ctx.createGain()
    sobre.gain.setValueAtTime(CASI_CERO, t0)
    sobre.gain.exponentialRampToValueAtTime(GANANCIA, t0 + segundos * 0.4)
    sobre.gain.setValueAtTime(GANANCIA, t0 + segundos * 0.6)
    sobre.gain.exponentialRampToValueAtTime(CASI_CERO, t0 + segundos)
    sobre.connect(maestro)

    const octava = ctx.createGain()
    octava.gain.setValueAtTime(MEZCLA_OCTAVA, t0)
    octava.connect(sobre)

    const voz = {
      sobre,
      osciladores: [
        oscilador(desdeHz, hastaHz, t0, segundos, sobre),
        oscilador(desdeHz * 2, hastaHz * 2, t0, segundos, octava),
      ],
    }

    voz.osciladores[0].onended = () => {
      vivos.delete(voz)
      try {
        octava.disconnect()
        sobre.disconnect()
      } catch {
        // Ya estaba desconectado: cerrar() pasó primero
      }
    }

    vivos.add(voz)
  }

  return {
    despertar,

    // Nota grave que asciende durante la inhalación
    inhalar(segundos) { tono(GRAVE_HZ, ALTA_HZ, segundos) },

    // Y desciende durante la exhalación. En el reposo no se llama a nada: la
    // cola de la exhalación se apaga sola y esos 3 s son silencio.
    exhalar(segundos) { tono(ALTA_HZ, GRAVE_HZ, segundos) },

    // Apaga lo que suene con un desvanecido corto. Sin pop.
    callar: apagar,

    // Al pasar la pestaña a segundo plano: se calla y el contexto se suspende,
    // así no queda nada sonando ni consumiendo fuera de la pantalla.
    dormir() {
      if (!ctx) return
      apagar()
      ctx.suspend().catch(() => {})
    },

    // Al desmontar. Se baja la salida general antes de cerrar, porque cerrar en
    // seco sí chasquea.
    cerrar() {
      if (!ctx) return

      const contexto = ctx
      const salida   = maestro
      ctx     = null
      maestro = null
      vivos.clear()

      try {
        const ahora = contexto.currentTime
        congelar(salida.gain, ahora)
        salida.gain.exponentialRampToValueAtTime(CASI_CERO, ahora + CIERRE)
      } catch {
        // Si no se pudo programar la bajada, cerrar igual es mejor que dejarlo
      }

      setTimeout(() => contexto.close().catch(() => {}), CIERRE * 1000 + 40)
    },
  }
}
