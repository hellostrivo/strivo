// src/lib/audio/__tests__/contextoAudio.test.js
// Criterios 3 y 4 de SPEC_15: un solo contexto, y nunca creado al montar.

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  actual,
  adquirir,
  haySoporte,
  liberar,
  prestamosVivos,
  reanudar,
  reiniciarParaPruebas,
} from '../contextoAudio.js'
import { crearContextoFalso } from '@/breathing/audio/__tests__/dobleAudio.js'

afterEach(() => {
  reiniciarParaPruebas()
  delete globalThis.window
})

describe('un solo AudioContext en toda la app (criterio 3)', () => {
  it('dos peticiones devuelven exactamente el mismo objeto', () => {
    const contexto = crearContextoFalso()
    const guia = adquirir({ crear: () => contexto })
    const ambiente = adquirir({ crear: () => contexto })

    // Identidad referencial, no equivalencia: dos contextos distintos serían dos
    // relojes, y `currentTime` no es comparable entre ellos.
    expect(guia).toBe(ambiente)
    expect(prestamosVivos()).toBe(2)
  })

  it('la fábrica solo se llama una vez por mucho que se pida', () => {
    const fabrica = vi.fn(() => crearContextoFalso())
    adquirir({ crear: fabrica })
    adquirir({ crear: fabrica })
    adquirir({ crear: fabrica })
    expect(fabrica).toHaveBeenCalledTimes(1)
  })

  it('soltar uno no cierra el contexto mientras quede otro', () => {
    const contexto = crearContextoFalso()
    adquirir({ crear: () => contexto })
    adquirir({ crear: () => contexto })

    liberar()

    // Es la razón de ser del préstamo: si la guía cerrara el contexto al
    // terminar, el ambiente se quedaría mudo a media sesión.
    expect(contexto.cerrado).toBe(false)
    expect(actual()).toBe(contexto)
    expect(prestamosVivos()).toBe(1)
  })

  it('al soltar el último sí se cierra (RN-AUD-04)', () => {
    const contexto = crearContextoFalso()
    adquirir({ crear: () => contexto })
    adquirir({ crear: () => contexto })

    liberar()
    liberar()

    expect(contexto.cerrado).toBe(true)
    expect(actual()).toBeNull()
    expect(prestamosVivos()).toBe(0)
  })

  it('soltar de más no baja de cero ni cierra dos veces', () => {
    const contexto = crearContextoFalso()
    adquirir({ crear: () => contexto })
    liberar()
    expect(() => {
      liberar()
      liberar()
    }).not.toThrow()
    expect(contexto.close).toHaveBeenCalledTimes(1)
    expect(prestamosVivos()).toBe(0)
  })

  it('tras cerrarlo, la siguiente petición crea uno nuevo', () => {
    const primero = crearContextoFalso()
    const segundo = crearContextoFalso()
    adquirir({ crear: () => primero })
    liberar()
    expect(adquirir({ crear: () => segundo })).toBe(segundo)
  })

  it('un contexto que el navegador cerró por su cuenta se reemplaza', () => {
    const muerto = crearContextoFalso()
    adquirir({ crear: () => muerto })
    muerto.state = 'closed'
    const nuevo = crearContextoFalso()
    expect(adquirir({ crear: () => nuevo })).toBe(nuevo)
  })
})

describe('no se crea al montar (criterio 4, §2.2)', () => {
  it('importar el módulo no crea ningún contexto', () => {
    // Si crear el contexto ocurriera al importar, el gesto habría pasado en otra
    // pantalla y el navegador entregaría un contexto suspendido: sin sonido, sin
    // error, y el fallo aparece en el teléfono de otra persona.
    expect(actual()).toBeNull()
    expect(prestamosVivos()).toBe(0)
  })

  it('solo `adquirir` lo crea, y a `adquirir` la llama un gesto', () => {
    const fabrica = vi.fn(() => crearContextoFalso())
    expect(actual()).toBeNull()
    adquirir({ crear: fabrica })
    expect(fabrica).toHaveBeenCalledTimes(1)
  })

  it('un contexto suspendido se reanuda al pedirlo', async () => {
    const contexto = crearContextoFalso()
    contexto.state = 'suspended'
    adquirir({ crear: () => contexto })

    expect(await reanudar()).toBe(true)
    expect(contexto.resume).toHaveBeenCalled()
  })

  it('reanudar sin contexto no rompe nada', async () => {
    expect(await reanudar()).toBe(false)
  })
})

describe('sin Web Audio nada se rompe (caso 6.1)', () => {
  it('adquirir devuelve null en vez de lanzar', () => {
    expect(adquirir({ crear: () => null })).toBeNull()
    expect(prestamosVivos()).toBe(0)
  })

  it('liberar sobre la nada tampoco', () => {
    expect(() => liberar()).not.toThrow()
  })

  it('`haySoporte` lo dice sin crear nada', () => {
    globalThis.window = {}
    expect(haySoporte()).toBe(false)
    globalThis.window = { AudioContext: function Falso() {} }
    expect(haySoporte()).toBe(true)
    expect(actual()).toBeNull()
  })

  it('sin `window` en absoluto devuelve que no', () => {
    delete globalThis.window
    expect(haySoporte()).toBe(false)
  })
})
