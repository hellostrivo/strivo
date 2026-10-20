// src/breathing/audio/fuentes/olas.js
// Van y vienen, muy lentas (§3.3).
//
// Ruido rosa con un LFO de 0,08 Hz —una vuelta cada doce segundos y medio—
// moviendo a la vez el filtro y el volumen. Que las dos modulaciones vayan
// **desfasadas 0,7 rad** es lo que evita que suene a alguien girando una perilla:
// en una ola de verdad el brillo no llega exactamente con el volumen, llega un
// poco antes, cuando la cresta rompe.
//
// **Sin planificador y sin eventos**: aquí no hay nada que disparar. La
// modulación es continua y la lleva el propio grafo, que es lo más barato y lo
// más preciso que puede hacerse.

import { crearBufferRuido, crearFuenteEnBucle } from '@lib/audio/ruido'
import { retardoDeFase } from '../planificador.js'

export const PARAMETROS = Object.freeze({
  lfoHz: 0.08,
  filtroHzMin: 380,
  filtroHzMax: 1400,
  gananciaMin: 0.18,
  gananciaMax: 0.62,
  desfaseRad: 0.7,
})

/** El centro y la amplitud de una modulación que va de `min` a `max`. */
export function centroYAmplitud(min, max) {
  return { centro: (min + max) / 2, amplitud: (max - min) / 2 }
}

export function crear(ctx, destino, { azar = Math.random } = {}) {
  const fuente = crearFuenteEnBucle(ctx, crearBufferRuido(ctx, 'rosa', { azar }))

  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  const banda = centroYAmplitud(PARAMETROS.filtroHzMin, PARAMETROS.filtroHzMax)
  filtro.frequency.setValueAtTime(banda.centro, ctx.currentTime)

  const ganancia = ctx.createGain()
  const volumen = centroYAmplitud(PARAMETROS.gananciaMin, PARAMETROS.gananciaMax)
  ganancia.gain.setValueAtTime(volumen.centro, ctx.currentTime)

  // Dos osciladores a la misma frecuencia, el segundo arrancado con retardo:
  // es la única forma de conseguir un desfase, porque Web Audio no deja fijar
  // la fase de un oscilador, solo cuándo empieza.
  const lfoFiltro = ctx.createOscillator()
  lfoFiltro.type = 'sine'
  lfoFiltro.frequency.setValueAtTime(PARAMETROS.lfoHz, ctx.currentTime)

  const profundidadFiltro = ctx.createGain()
  profundidadFiltro.gain.setValueAtTime(banda.amplitud, ctx.currentTime)

  const lfoGanancia = ctx.createOscillator()
  lfoGanancia.type = 'sine'
  lfoGanancia.frequency.setValueAtTime(PARAMETROS.lfoHz, ctx.currentTime)

  const profundidadGanancia = ctx.createGain()
  profundidadGanancia.gain.setValueAtTime(volumen.amplitud, ctx.currentTime)

  lfoFiltro.connect(profundidadFiltro)
  profundidadFiltro.connect(filtro.frequency)
  lfoGanancia.connect(profundidadGanancia)
  profundidadGanancia.connect(ganancia.gain)

  fuente.connect(filtro)
  filtro.connect(ganancia)
  ganancia.connect(destino)

  const todos = [
    fuente,
    filtro,
    ganancia,
    lfoFiltro,
    lfoGanancia,
    profundidadFiltro,
    profundidadGanancia,
  ]
  let arrancado = false

  return {
    iniciar() {
      if (arrancado) return
      arrancado = true
      const ahora = ctx.currentTime
      fuente.start(ahora)
      lfoFiltro.start(ahora)
      lfoGanancia.start(ahora + retardoDeFase(PARAMETROS.desfaseRad, PARAMETROS.lfoHz))
    },
    detener() {
      // Las olas no tienen eventos pendientes que cancelar: lo que hay que
      // parar es el volumen, y de eso se encarga el mezclador.
    },
    liberar() {
      ;[fuente, lfoFiltro, lfoGanancia].forEach((nodo) => {
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
