// src/lib/respiracion/relojSesion.js
// El motor es puro; esto es lo que lo pone en marcha.
//
// Un solo reloj gobierna el círculo, la línea y el sonido (SPEC_13 §6.3). Es la
// misma decisión que tomó SPEC_08 para la respiración de Lumia y por el mismo
// motivo: dos relojes con la misma cuenta atrás se separan, y lo que se ve deja
// de coincidir con lo que se oye justo cuando alguien intenta seguirlo.
//
// El tiempo **no se acumula por fotograma**. Sumar deltas parece natural y
// deriva: sesenta redondeos por segundo durante veinte minutos son segundos de
// error. Se calcula siempre contra el origen (RN-RE-MOT-11).

import { CURVA_POR_DEFECTO } from './curvas.js'
import { resolverEstado } from './motorRitmo.js'

/**
 * `performance.now()` y no `Date.now()`: es monotónico, así que un cambio de
 * hora del sistema —o un ajuste de horario de verano a media sesión— no mueve
 * el ejercicio ni un milisegundo (caso 9.5).
 */
const ahoraPorDefecto = () =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()

// En un entorno sin `requestAnimationFrame` —las pruebas corren en Node— se
// degrada a un temporizador. No es lo que se usa en la app; es lo que evita que
// el módulo se caiga al importarse fuera del navegador.
const programarPorDefecto = (fn) =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16)

const cancelarPorDefecto = (id) => {
  if (id === null || id === undefined) return
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id)
  else clearTimeout(id)
}

/**
 * Crea un reloj para un patrón.
 *
 * @param {object} opciones
 * @param {object} opciones.patron
 * @param {(estado: object, ms: number) => void} [opciones.alActualizar]
 * @param {(estado: object, ms: number) => void} [opciones.alCambiarFase]
 * @param {(t: number) => number} [opciones.curva]
 * @param {() => number} [opciones.ahora] - Inyectable para poder probarlo.
 * @param {(fn: Function) => *} [opciones.programarFrame]
 * @param {(id: *) => void} [opciones.cancelarFrame]
 */
export function crearReloj({
  patron,
  alActualizar = null,
  alCambiarFase = null,
  curva = CURVA_POR_DEFECTO,
  ahora = ahoraPorDefecto,
  programarFrame = programarPorDefecto,
  cancelarFrame = cancelarPorDefecto,
} = {}) {
  let actualizar = alActualizar
  let cambiarFase = alCambiarFase
  let origen = null
  let msPausados = 0
  let congeladoEn = null
  let idFrame = null
  let corriendo = false
  let faseAnterior = null
  let cicloAnterior = null

  /** RN-RE-MOT-11 — siempre contra el origen, nunca acumulando. */
  function obtenerMs() {
    if (origen === null) return 0
    const referencia = congeladoEn === null ? ahora() : congeladoEn
    return Math.max(0, referencia - origen - msPausados)
  }

  function emitir() {
    const ms = obtenerMs()
    const estado = resolverEstado(patron, ms, { curva })

    // RN-RE-MOT-12 — solo cuando la fase resuelta cambia respecto al fotograma
    // anterior. La primera resolución cuenta como cambio: se venía de nada.
    if (estado.fase !== faseAnterior || estado.cicloActual !== cicloAnterior) {
      faseAnterior = estado.fase
      cicloAnterior = estado.cicloActual
      cambiarFase?.(estado, ms)
    }
    actualizar?.(estado, ms)
    return estado
  }

  function siguienteFrame() {
    idFrame = null
    if (!corriendo || congeladoEn !== null) return
    emitir()
    if (!corriendo || congeladoEn !== null) return
    idFrame = programarFrame(siguienteFrame)
  }

  function detenerFrame() {
    cancelarFrame(idFrame)
    idFrame = null
  }

  return {
    /**
     * Arranca en cero.
     *
     * Caso 9.10 — Una segunda llamada sin `detener()` de por medio no hace
     * nada. React en modo estricto monta dos veces en desarrollo, y sin esto la
     * segunda sesión pisaba el origen de la primera y el ejercicio saltaba.
     */
    iniciar() {
      if (corriendo) {
        console.warn('[respiracion] El reloj ya estaba corriendo: iniciar() no hace nada.')
        return
      }
      origen = ahora()
      msPausados = 0
      congeladoEn = null
      faseAnterior = null
      cicloAnterior = null
      corriendo = true
      siguienteFrame()
    },

    /** RN-RE-MOT-13 — congela el punto exacto. No reinicia el ciclo. */
    pausar() {
      if (!corriendo || congeladoEn !== null) return
      congeladoEn = ahora()
      detenerFrame()
    },

    /** Retoma donde se quedó: lo pausado se descuenta, no se pierde. */
    reanudar() {
      if (!corriendo || congeladoEn === null) return
      msPausados += ahora() - congeladoEn
      congeladoEn = null
      siguienteFrame()
    },

    /** RN-RE-MOT-15 — libera el fotograma y anula los avisos. Idempotente. */
    detener() {
      if (congeladoEn === null && origen !== null) congeladoEn = ahora()
      corriendo = false
      detenerFrame()
      actualizar = null
      cambiarFase = null
    },

    obtenerMs,

    /** Resuelve el estado ahora mismo, sin esperar al siguiente fotograma. */
    estadoActual() {
      return resolverEstado(patron, obtenerMs(), { curva })
    },

    estaCorriendo: () => corriendo,
    estaPausado: () => corriendo && congeladoEn !== null,
  }
}
