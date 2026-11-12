// src/lib/respiracion/relojDeFondo.js
// Quién mueve la sesión cuando no hay fotogramas (SPEC_23 Parte 2, DP-23.22).
//
// Con la pantalla bloqueada o la app fuera, `requestAnimationFrame` no llega.
// Este temporizador lo sustituye mientras dura: en cada tic, quien lo monta
// avanza su reloj una pasada y programa en la guía las fases de los próximos
// segundos. iOS lo alinea a un segundo y en la práctica llega cada uno o dos
// (el diagnóstico contó 25 tics en 49 s): por eso la guía va por delante y no
// depende de que el tic llegue a tiempo.
//
// Solo se enciende con una sesión con sonido. Sin sonido no hay nada que
// acompañar fuera, y la sesión se pausa al volver como siempre (caso 9.4).

/** Lo que se pide al temporizador; iOS decide cuándo llega de verdad. */
export const MS_TIC_DE_FONDO = 250

/** Cuánto se programa por delante: holgura de sobra para tics de 2 s. */
export const MS_VENTANA = 10_000

/**
 * @param {object} opciones
 * @param {() => void} opciones.alTic
 * @param {number} [opciones.msTic]
 * @param {Function} [opciones.programar] - `setInterval`; existe para las pruebas.
 * @param {Function} [opciones.cancelar] - `clearInterval`.
 */
export function crearRelojDeFondo({
  alTic,
  msTic = MS_TIC_DE_FONDO,
  programar = (fn, ms) => setInterval(fn, ms),
  cancelar = (id) => clearInterval(id),
}) {
  let id = null

  function tic() {
    try {
      alTic()
    } catch {
      // Un tic que falla no para los siguientes.
    }
  }

  return {
    /** Arranca con un tic inmediato. Idempotente. */
    iniciar() {
      if (id !== null) return
      tic()
      id = programar(tic, msTic)
    },

    detener() {
      if (id === null) return
      cancelar(id)
      id = null
    },

    activo: () => id !== null,
  }
}
