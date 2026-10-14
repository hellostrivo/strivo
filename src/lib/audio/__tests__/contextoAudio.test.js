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
  reanudarConElSiguienteToque,
  reiniciarParaPruebas,
} from '../contextoAudio.js'
import { crearContextoFalso } from '@/breathing/audio/__tests__/dobleAudio.js'

afterEach(() => {
  reiniciarParaPruebas()
  delete globalThis.window
  vi.useRealTimers()
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

describe('D-21.13 — reanudar al volver a la app (RN-RE-SND-24)', () => {
  /** Un `document` de mentira: apunta oyentes y deja dispararlos a mano. */
  function objetivoFalso() {
    const oyentes = new Map()
    return {
      addEventListener: vi.fn((tipo, fn, opciones) => oyentes.set(tipo, { fn, opciones })),
      removeEventListener: vi.fn((tipo, fn) => {
        if (oyentes.get(tipo)?.fn === fn) oyentes.delete(tipo)
      }),
      tocar(tipo = 'touchend') {
        oyentes.get(tipo)?.fn({ type: tipo })
      },
      oyentes,
    }
  }

  /** Deja correr las promesas pendientes. */
  const asentar = () => new Promise((resolver) => setTimeout(resolver, 0))

  it("un contexto 'interrupted' se reanuda (iOS al volver de segundo plano)", async () => {
    // Era el defecto: WebKit deja el contexto en `interrupted`, no en
    // `suspended`, y `reanudar()` ni lo intentaba.
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    adquirir({ crear: () => contexto })

    expect(await reanudar()).toBe(true)
    expect(contexto.resume).toHaveBeenCalledTimes(1)
  })

  it("un contexto 'suspended' se sigue reanudando", async () => {
    const contexto = crearContextoFalso()
    contexto.state = 'suspended'
    adquirir({ crear: () => contexto })

    expect(await reanudar()).toBe(true)
    expect(contexto.resume).toHaveBeenCalledTimes(1)
  })

  it('uno que ya corre o que está cerrado no se toca', async () => {
    const corriendo = crearContextoFalso()
    adquirir({ crear: () => corriendo })
    expect(await reanudar()).toBe(true)
    expect(corriendo.resume).not.toHaveBeenCalled()

    corriendo.state = 'closed'
    expect(await reanudar()).toBe(false)
    expect(corriendo.resume).not.toHaveBeenCalled()
  })

  it('si `resume()` rechaza, devuelve que no y no lanza', async () => {
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    contexto.resume = vi.fn(async () => {
      throw new Error('NotAllowedError')
    })
    adquirir({ crear: () => contexto })

    expect(await reanudar()).toBe(false)
  })

  it('si `resume()` resuelve sin que el contexto corra, devuelve que no', async () => {
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    contexto.resume = vi.fn(async () => {})
    adquirir({ crear: () => contexto })

    expect(await reanudar()).toBe(false)
  })

  it('si `resume()` no vuelve nunca, el techo lo da por perdido', async () => {
    // WebKit puede dejar la promesa esperando un gesto. Sin techo, quien espera
    // no llegaría nunca a pedir el siguiente toque.
    vi.useFakeTimers()
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    contexto.resume = vi.fn(() => new Promise(() => {}))
    adquirir({ crear: () => contexto })

    const resultado = reanudar({ espera: 50 })
    await vi.advanceTimersByTimeAsync(50)
    expect(await resultado).toBe(false)
  })

  it('el siguiente toque reanuda y vuelve a aplicar el audio, una sola vez', async () => {
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    // El primer intento, sin gesto, no lo consigue; el del toque sí.
    contexto.resume = vi
      .fn()
      .mockImplementationOnce(async () => {
        throw new Error('NotAllowedError')
      })
      .mockImplementation(async () => {
        contexto.state = 'running'
      })
    adquirir({ crear: () => contexto })
    expect(await reanudar()).toBe(false)

    const objetivo = objetivoFalso()
    const alCorrer = vi.fn()
    reanudarConElSiguienteToque(objetivo, alCorrer)

    objetivo.tocar('touchend')
    await asentar()
    expect(alCorrer).toHaveBeenCalledTimes(1)
    // Se retira: los toques siguientes no vuelven a aplicar nada.
    expect(objetivo.oyentes.size).toBe(0)
    objetivo.tocar('touchend')
    objetivo.tocar('click')
    await asentar()
    expect(alCorrer).toHaveBeenCalledTimes(1)
  })

  it('escucha en captura y en pasivo: no cambia lo que hace el toque', () => {
    const objetivo = objetivoFalso()
    reanudarConElSiguienteToque(objetivo, () => {})
    for (const { opciones } of objetivo.oyentes.values()) {
      expect(opciones).toEqual({ capture: true, passive: true })
    }
    expect([...objetivo.oyentes.keys()]).toContain('touchend')
  })

  it('un toque que no despierta el contexto no gasta el reintento', async () => {
    // Un toque que el navegador no cuenta como gesto —uno que acaba en
    // desplazamiento— dejaría la sesión muda si se llevara el único intento.
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    contexto.resume = vi
      .fn()
      .mockImplementationOnce(async () => {})
      .mockImplementation(async () => {
        contexto.state = 'running'
      })
    adquirir({ crear: () => contexto })

    const objetivo = objetivoFalso()
    const alCorrer = vi.fn()
    reanudarConElSiguienteToque(objetivo, alCorrer)

    objetivo.tocar('touchend')
    await asentar()
    expect(alCorrer).not.toHaveBeenCalled()
    expect(objetivo.oyentes.size).toBeGreaterThan(0)

    objetivo.tocar('touchend')
    await asentar()
    expect(alCorrer).toHaveBeenCalledTimes(1)
  })

  it('varios eventos del mismo toque aplican el audio una sola vez', async () => {
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    adquirir({ crear: () => contexto })

    const objetivo = objetivoFalso()
    const alCorrer = vi.fn()
    reanudarConElSiguienteToque(objetivo, alCorrer)

    objetivo.tocar('touchend')
    objetivo.tocar('pointerup')
    objetivo.tocar('click')
    await asentar()
    expect(alCorrer).toHaveBeenCalledTimes(1)
  })

  it('retirarlo antes del toque deja el toque sin efecto, y es idempotente', async () => {
    const contexto = crearContextoFalso()
    contexto.state = 'interrupted'
    adquirir({ crear: () => contexto })

    const objetivo = objetivoFalso()
    const alCorrer = vi.fn()
    const retirar = reanudarConElSiguienteToque(objetivo, alCorrer)
    retirar()
    expect(() => retirar()).not.toThrow()
    expect(objetivo.oyentes.size).toBe(0)
    expect(contexto.resume).not.toHaveBeenCalled()
    expect(alCorrer).not.toHaveBeenCalled()
  })

  it('sin objetivo no rompe nada', () => {
    expect(() => reanudarConElSiguienteToque(null, () => {})()).not.toThrow()
  })
})
