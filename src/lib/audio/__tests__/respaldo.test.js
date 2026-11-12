// src/lib/audio/__tests__/respaldo.test.js
// SPEC_23 Parte 2 (DP-23.21 y 23.23) — Cuándo el audio está mudo al volver, y
// si sonó mientras la app estaba fuera (criterios 4 y 5).

import { describe, expect, it, vi } from 'vitest'

import {
  AVANCE_MINIMO_S,
  MS_MINIMOS_DE_MEDIDA,
  alSiguienteToque,
  audioMudo,
  medirReloj,
  sonoFuera,
} from '../contextoAudio.js'

describe('audioMudo', () => {
  it('«en marcha» con el reloj quieto es mudo: lo que el diagnóstico vio en D1', () => {
    expect(audioMudo({ avanceAudio: 0, msPared: 500, estado: 'running' })).toBe(true)
  })

  it('con el reloj avanzando no es mudo', () => {
    expect(audioMudo({ avanceAudio: 0.5, msPared: 500, estado: 'running' })).toBe(false)
  })

  it('justo por debajo del avance mínimo, mudo', () => {
    expect(
      audioMudo({ avanceAudio: AVANCE_MINIMO_S - 0.01, msPared: 500, estado: 'running' }),
    ).toBe(true)
  })

  it('un contexto que no está en marcha es mudo', () => {
    ;['suspended', 'interrupted', 'closed', null].forEach((estado) =>
      expect(audioMudo({ avanceAudio: 0.5, msPared: 500, estado })).toBe(true),
    )
  })

  it('si pasó por «interrumpido» fuera, mudo aunque ahora avance', () => {
    expect(
      audioMudo({ avanceAudio: 0.5, msPared: 500, estado: 'running', pasoPorInterrumpido: true }),
    ).toBe(true)
  })

  it('sin falsos positivos: si el temporizador no esperó lo bastante, no se decide', () => {
    expect(
      audioMudo({ avanceAudio: 0, msPared: MS_MINIMOS_DE_MEDIDA - 1, estado: 'running' }),
    ).toBeNull()
  })
})

describe('sonoFuera (el caso 9.4 con sonido)', () => {
  it('el reloj del audio avanzó casi todo el tiempo fuera: sonó', () => {
    expect(sonoFuera({ avanceAudio: 49.4, segundosFuera: 49.4 })).toBe(true)
    expect(sonoFuera({ avanceAudio: 40, segundosFuera: 49 })).toBe(true)
  })

  it('el reloj quieto fuera: no sonó', () => {
    expect(sonoFuera({ avanceAudio: 0, segundosFuera: 20 })).toBe(false)
    expect(sonoFuera({ avanceAudio: 10, segundosFuera: 20 })).toBe(false)
  })

  it('sin tiempo fuera no hay nada que decir', () => {
    expect(sonoFuera({ avanceAudio: 0, segundosFuera: 0 })).toBe(false)
  })
})

describe('medirReloj', () => {
  it('mide el avance del reloj del audio frente al de pared', async () => {
    const ctx = { currentTime: 10, state: 'running' }
    let pared = 1000
    const medida = await medirReloj(ctx, {
      ahora: () => pared,
      esperar: async () => {
        pared += 500
        ctx.currentTime += 0.5
      },
    })
    expect(medida).toEqual({ avanceAudio: 0.5, msPared: 500, estado: 'running' })
  })
})

describe('alSiguienteToque', () => {
  function documento() {
    const oyentes = new Map()
    return {
      addEventListener: (tipo, fn) => oyentes.set(tipo, fn),
      removeEventListener: (tipo) => oyentes.delete(tipo),
      tocar: (tipo = 'touchend') => oyentes.get(tipo)?.(),
      oyentes,
    }
  }

  it('llama dentro del toque, una sola vez', () => {
    const doc = documento()
    const fn = vi.fn()
    alSiguienteToque(doc, fn)
    doc.tocar()
    doc.tocar('click')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(doc.oyentes.size).toBe(0)
  })

  it('cancelar retira la espera', () => {
    const doc = documento()
    const fn = vi.fn()
    alSiguienteToque(doc, fn)()
    doc.tocar()
    expect(fn).not.toHaveBeenCalled()
  })
})
