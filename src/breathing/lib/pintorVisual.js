// src/breathing/lib/pintorVisual.js
// Qué se escribe sobre el SVG en cada frame, y sobre todo **cuándo no se
// escribe nada** (SPEC_14 §7 y §10).
//
// Está separado de los `.jsx` por la misma razón que la geometría (§2.2): la
// regla que decide si esto se siente suave —RN-RE-VIS-33, ni un `setState` por
// frame— solo se puede *demostrar* si se puede contar, y contar renders de
// React sin navegador no se puede. Contar llamadas a una función pura, sí.
//
// Un pintor recuerda lo último que entregó y devuelve `null` cuando el frame
// nuevo no tiene nada que decir. Con movimiento reducido eso es casi siempre:
// la amplitud solo toma cuatro valores y el arco avanza de segundo en segundo,
// así que de sesenta frames por segundo sobreviven uno o dos (RN-RE-VIS-20).

import {
  OPACIDAD_HALO_QUIETA,
  RADIO_BASE,
  calcularArco,
  calcularRadios,
  cuantizarAmplitud,
  cuantizarProgreso,
} from './geometriaCirculo.js'
import { generarOnda, generarOndaEstatica, msDeEstado } from './geometriaLinea.js'

/**
 * El pintor del círculo.
 *
 * @param {{movimientoReducido?: boolean, msFase?: number, radioBase?: number}} opciones
 * @returns {{calcular: Function, reiniciar: Function}}
 */
export function crearPintorCirculo({
  movimientoReducido = false,
  msFase = 0,
  radioBase = RADIO_BASE,
} = {}) {
  let ultimo = { amplitud: null, progreso: null, segundo: null }

  return {
    /** @returns {?{radioDisco, radioHalo, opacidadHalo, desfase}} `null` si no hay cambio. */
    calcular(estado) {
      if (!estado) return null

      // RN-RE-VIS-20 — Con movimiento reducido se escribe **como mucho una vez
      // por segundo**, y el portero es el segundo transcurrido de la fase, no
      // cada valor por su cuenta. Los dos escalonados de §7 —cuatro pasos de
      // amplitud y un paso de arco por segundo— no caen en los mismos
      // instantes: gobernados por separado se turnaban para escribir y salían
      // diecinueve actualizaciones en un ciclo de trece segundos. Un solo reloj
      // los ordena, que es la misma idea que sostiene el motor entero.
      if (movimientoReducido && msFase > 0) {
        const segundo = Math.floor((estado.progresoFase * msFase) / 1000)
        if (segundo === ultimo.segundo) return null
        ultimo.segundo = segundo
      }

      const amplitud = movimientoReducido ? cuantizarAmplitud(estado.amplitud) : estado.amplitud
      const progreso = movimientoReducido
        ? cuantizarProgreso(estado.progresoFase, msFase)
        : estado.progresoFase

      if (ultimo.amplitud === amplitud && ultimo.progreso === progreso) return null
      ultimo = { ...ultimo, amplitud, progreso }

      const radios = calcularRadios(amplitud, radioBase)
      return {
        radioDisco: radios.radioDisco,
        radioHalo: radios.radioHalo,
        // §7 — Con movimiento reducido el halo deja de latir y se queda fijo.
        opacidadHalo: movimientoReducido ? OPACIDAD_HALO_QUIETA : radios.opacidadHalo,
        desfase: calcularArco(progreso, radioBase).desfase,
      }
    },

    /** Al cambiar de fase React repinta y el pintor vuelve a partir de cero. */
    reiniciar() {
      ultimo = { amplitud: null, progreso: null, segundo: null }
    },
  }
}

/**
 * El pintor de la línea.
 *
 * Por frame se mueve un `translate` y nada más (RN-RE-VIS-32): la forma de la
 * onda sale de la memoria de `geometriaLinea` y no se recalcula.
 */
export function crearPintorLinea({ patron, movimientoReducido = false } = {}) {
  let ultimo = null

  return {
    calcular(estado) {
      if (!estado) return null
      const ms = msDeEstado(patron, estado)

      if (movimientoReducido) {
        const dibujo = generarOndaEstatica(patron, ms)
        if (ultimo === dibujo.marcador.x) return null
        ultimo = dibujo.marcador.x
        return { reducido: true, x: dibujo.marcador.x, y: dibujo.marcador.y }
      }

      const dibujo = generarOnda(patron, ms)
      if (ultimo === dibujo.desplazamiento) return null
      ultimo = dibujo.desplazamiento
      // RN-RE-VIS-09 — La Y viene de la amplitud del motor, no de leer el path.
      return { reducido: false, desplazamiento: dibujo.desplazamiento, y: dibujo.puntoBolita.y }
    },

    reiniciar() {
      ultimo = null
    },
  }
}
