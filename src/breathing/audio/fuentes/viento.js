// src/breathing/audio/fuentes/viento.js
// Entre los árboles, a lo lejos (§3.3).
//
// Un paso-banda estrecho sobre ruido rosa, con dos LFO que no comparten
// frecuencia: uno mueve dónde está la banda (0,05 Hz) y otro cuán estrecha es
// (0,03 Hz). Que no coincidan es lo que hace que el patrón no se repita — vuelven
// a alinearse cada cien segundos, y para entonces el oído ya no lo relaciona.
// Con la misma frecuencia en los dos, el viento respiraría a compás y competiría
// con el ejercicio (RN-RE-SND-07).

import { crearBufferRuido, crearFuenteEnBucle } from '@lib/audio/ruido'
import { centroYAmplitud } from './olas.js'

export const PARAMETROS = Object.freeze({
  frecuenciaLfoHz: 0.05,
  frecuenciaHzMin: 300,
  frecuenciaHzMax: 900,
  qLfoHz: 0.03,
  qMin: 1.5,
  qMax: 6,
  ganancia: 0.45,
})

export function crear(ctx, destino, { azar = Math.random } = {}) {
  const fuente = crearFuenteEnBucle(ctx, crearBufferRuido(ctx, 'rosa', { azar }))

  const filtro = ctx.createBiquadFilter()
  filtro.type = 'bandpass'
  const banda = centroYAmplitud(PARAMETROS.frecuenciaHzMin, PARAMETROS.frecuenciaHzMax)
  const anchura = centroYAmplitud(PARAMETROS.qMin, PARAMETROS.qMax)
  filtro.frequency.setValueAtTime(banda.centro, ctx.currentTime)
  filtro.Q.setValueAtTime(anchura.centro, ctx.currentTime)

  const ganancia = ctx.createGain()
  ganancia.gain.setValueAtTime(PARAMETROS.ganancia, ctx.currentTime)

  const lfoFrecuencia = ctx.createOscillator()
  lfoFrecuencia.type = 'sine'
  lfoFrecuencia.frequency.setValueAtTime(PARAMETROS.frecuenciaLfoHz, ctx.currentTime)
  const profundidadFrecuencia = ctx.createGain()
  profundidadFrecuencia.gain.setValueAtTime(banda.amplitud, ctx.currentTime)

  const lfoQ = ctx.createOscillator()
  lfoQ.type = 'sine'
  lfoQ.frequency.setValueAtTime(PARAMETROS.qLfoHz, ctx.currentTime)
  const profundidadQ = ctx.createGain()
  profundidadQ.gain.setValueAtTime(anchura.amplitud, ctx.currentTime)

  lfoFrecuencia.connect(profundidadFrecuencia)
  profundidadFrecuencia.connect(filtro.frequency)
  lfoQ.connect(profundidadQ)
  profundidadQ.connect(filtro.Q)

  fuente.connect(filtro)
  filtro.connect(ganancia)
  ganancia.connect(destino)

  const todos = [fuente, filtro, ganancia, lfoFrecuencia, lfoQ, profundidadFrecuencia, profundidadQ]
  let arrancado = false

  return {
    iniciar() {
      if (arrancado) return
      arrancado = true
      const ahora = ctx.currentTime
      fuente.start(ahora)
      lfoFrecuencia.start(ahora)
      lfoQ.start(ahora)
    },
    detener() {
      // Continuo: no hay eventos programados que cancelar.
    },
    liberar() {
      ;[fuente, lfoFrecuencia, lfoQ].forEach((nodo) => {
        try {
          nodo.stop?.()
        } catch {
          // No había arrancado.
        }
      })
      todos.forEach((nodo) => nodo.disconnect?.())
      arrancado = false
    },
  }
}
