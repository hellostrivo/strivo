// src/lib/audioRespiracion.js
// El tono de la respiración, generado en tiempo real (§6.12.1).
//
// **Sin un solo archivo de audio.** Osciladores y envolventes de ganancia: cero
// peso de descarga, cero latencia de carga, y el tono se sincroniza con la
// animación por construcción y no por coincidencia — el mismo reloj que mueve
// el círculo programa cada rampa, así que no hay dos temporizadores que puedan
// desfasarse.
//
// Perfil sonoro: barrido **ascendente** al inhalar con la ganancia subiendo
// desde el silencio, **descendente** al exhalar con la ganancia bajando hasta
// el silencio, y **silencio real** en la pausa — ganancia en cero, no un tono
// sostenido de fondo.
//
// Reglas duras que este módulo sostiene:
//   · RN-AUD-01 — Nunca suena sin un gesto previo. El contexto se crea dentro
//     de `iniciar()`, y `iniciar()` se llama desde el manejador del gesto.
//   · RN-AUD-04 — Limpieza completa al salir: osciladores detenidos, nodos
//     desconectados, contexto cerrado. Una fuga de audio en un producto de
//     calma es un fallo grave, no una imperfección.
//   · RN-AUD-05 — El sonido nunca sustituye a una señal visual. Todo el
//     ejercicio funciona en silencio.

/** §6.12.1 — Ganancia máxima contenida: alguien en la cama, con su pareja al lado. */
export const GANANCIA_MAX = 0.05

/** Barrido del tono, en hercios. Grave y cálido, sin transitorios bruscos. */
export const FRECUENCIA_BAJA = 196
export const FRECUENCIA_ALTA = 294

/** Rampa mínima para que un corte no se oiga como un chasquido. */
const SUAVIZADO = 0.08

function contextoPorDefecto() {
  const Contexto = typeof window === 'undefined' ? null : window.AudioContext
  if (!Contexto) return null
  return new Contexto()
}

/**
 * Crea el motor de audio del ejercicio.
 *
 * No suena nada hasta que se llama a `iniciar()`, y `iniciar()` está pensado
 * para llamarse **dentro del manejador del gesto** que arranca la respiración.
 *
 * @param {object} [opciones]
 * @param {Function} [opciones.crearContexto] - Fábrica del `AudioContext`.
 *   Existe para poder probar la limpieza sin un navegador: la prueba pasa un
 *   contexto de mentira y comprueba que al salir no queda nada vivo.
 * @returns {{iniciar: Function, fase: Function, silenciar: Function,
 *            detener: Function, activo: Function}}
 */
export function crearAudioRespiracion({ crearContexto = contextoPorDefecto } = {}) {
  let contexto = null
  let oscilador = null
  let envolvente = null
  let maestro = null
  let silenciado = false
  let cerrado = false

  const ahora = () => contexto?.currentTime ?? 0

  /** Corta cualquier rampa programada y parte del valor que suena ahora mismo. */
  function desdeElValorActual(parametro) {
    const t = ahora()
    parametro.cancelScheduledValues(t)
    parametro.setValueAtTime(parametro.value, t)
    return t
  }

  function aplicarSilencio(instante) {
    if (!maestro) return
    maestro.gain.cancelScheduledValues(instante)
    maestro.gain.setValueAtTime(maestro.gain.value, instante)
    maestro.gain.linearRampToValueAtTime(silenciado ? 0 : 1, instante + SUAVIZADO)
  }

  return {
    /**
     * Crea el contexto y arranca el oscilador **en silencio**: el tono existe
     * pero su envolvente está en cero, así que el primer sonido lo produce la
     * primera fase y no el arranque.
     */
    async iniciar() {
      if (contexto || cerrado) return Boolean(contexto)
      contexto = crearContexto()
      if (!contexto) return false

      oscilador = contexto.createOscillator()
      oscilador.type = 'sine'
      oscilador.frequency.setValueAtTime(FRECUENCIA_BAJA, ahora())

      envolvente = contexto.createGain()
      envolvente.gain.setValueAtTime(0, ahora())

      maestro = contexto.createGain()
      maestro.gain.setValueAtTime(silenciado ? 0 : 1, ahora())

      oscilador.connect(envolvente)
      envolvente.connect(maestro)
      maestro.connect(contexto.destination)
      oscilador.start()

      // Los navegadores entregan el contexto suspendido si no hubo gesto. Como
      // `iniciar()` se llama desde el gesto, esto lo reanuda ahí mismo.
      if (contexto.state === 'suspended') await contexto.resume()
      return true
    },

    /**
     * Programa la envolvente de una fase.
     *
     * `duracion` es lo que **le queda** a la fase, no lo que dura entera: al
     * retomar una pausa a mitad de una inhalación, el tono sigue desde donde
     * estaba en vez de volver a empezar.
     *
     * @param {'inhalar'|'exhalar'|'pausa'} fase
     * @param {number} duracion - Segundos.
     */
    fase(id, duracion) {
      if (!contexto || cerrado) return
      const segundos = Math.max(SUAVIZADO, Number(duracion) || 0)
      const t = desdeElValorActual(envolvente.gain)
      desdeElValorActual(oscilador.frequency)

      if (id === 'inhalar') {
        envolvente.gain.linearRampToValueAtTime(GANANCIA_MAX, t + segundos)
        oscilador.frequency.linearRampToValueAtTime(FRECUENCIA_ALTA, t + segundos)
        return
      }

      if (id === 'exhalar') {
        envolvente.gain.linearRampToValueAtTime(0, t + segundos)
        oscilador.frequency.linearRampToValueAtTime(FRECUENCIA_BAJA, t + segundos)
        return
      }

      // Pausa: silencio real. Baja a cero en la rampa corta y se queda ahí.
      envolvente.gain.linearRampToValueAtTime(0, t + SUAVIZADO)
      oscilador.frequency.linearRampToValueAtTime(FRECUENCIA_BAJA, t + SUAVIZADO)
    },

    /** RN-AUD-02 — Alcanzable en un toque durante el propio ejercicio. */
    silenciar(valor) {
      silenciado = Boolean(valor)
      if (contexto && !cerrado) aplicarSilencio(ahora())
      return silenciado
    },

    /**
     * RN-AUD-04 — Al salir no queda nada: ni oscilador sonando, ni nodo
     * conectado, ni contexto activo. Es idempotente: llamarlo dos veces, o sin
     * haber iniciado nunca, no rompe nada.
     */
    detener() {
      cerrado = true
      if (!contexto) return
      try {
        oscilador?.stop()
      } catch {
        // Ya estaba detenido. No hay nada que hacer y nada que contar.
      }
      oscilador?.disconnect()
      envolvente?.disconnect()
      maestro?.disconnect()
      contexto.close?.()
      oscilador = null
      envolvente = null
      maestro = null
      contexto = null
    },

    /** ¿Hay contexto vivo? Lo usan las pruebas y nada más. */
    activo() {
      return contexto !== null
    },
  }
}

export default crearAudioRespiracion
