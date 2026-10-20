// src/lib/__tests__/pantallaArranque.test.js
// SPEC_21.1 §4.7 y D-21.9 — cuándo y cómo se retira la pantalla de arranque de
// iOS. El orden importa más que nada: el fundido no puede empezar antes de la
// espera, porque entonces corre sin verse y el destape cae a mitad. Y la
// retirada no puede dejar de ocurrir nunca: con `launchAutoHide: false`, un
// `hide()` que no llega deja la app en la «S» para siempre.

import { describe, expect, it } from 'vitest'
import {
  ESPERA_ANTES_DE_RETIRAR,
  FUNDIDO_DE_SALIDA,
  TECHO_DE_RETIRADA,
  planDeRetirada,
  retirarPantallaDeArranque,
} from '../pantallaArranque.js'

/**
 * Un reloj de mentira con tiempo virtual. Los fotogramas se dan a mano
 * (`cuadro()`), los temporizadores corren con `avanzar(ms)`. Con `sinCuadros`
 * los fotogramas no llegan nunca, como en una página oculta.
 */
function relojDePrueba({ sinCuadros = false } = {}) {
  let ahora = 0
  let siguienteId = 1
  let cuadros = []
  const timers = new Map()
  return {
    siguienteCuadro(fn) {
      if (!sinCuadros) cuadros.push(fn)
    },
    esperar(fn, ms) {
      const id = siguienteId++
      timers.set(id, { fn, en: ahora + ms })
      return id
    },
    cancelar(id) {
      timers.delete(id)
    },
    cuadro() {
      const pendientes = cuadros
      cuadros = []
      pendientes.forEach((fn) => fn())
    },
    avanzar(ms) {
      const hasta = ahora + ms
      for (;;) {
        const vencidos = [...timers.entries()]
          .filter(([, t]) => t.en <= hasta)
          .sort((a, b) => a[1].en - b[1].en)
        if (vencidos.length === 0) break
        const [id, t] = vencidos[0]
        timers.delete(id)
        ahora = t.en
        t.fn()
      }
      ahora = hasta
    },
    get pendientes() {
      return timers.size
    },
  }
}

/** Un `hide()` de mentira que apunta con qué se llamó. */
function ocultarDePrueba(comportamiento = () => Promise.resolve()) {
  const llamadas = []
  const ocultar = (opciones) => {
    llamadas.push(opciones)
    return comportamiento(llamadas.length)
  }
  return { ocultar, llamadas }
}

// Deja correr las promesas ya resueltas o rechazadas.
const vaciarPromesas = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}

describe('planDeRetirada', () => {
  it('en web no hay nada que retirar', () => {
    expect(planDeRetirada({ nativa: false, menosMovimiento: false })).toBeNull()
    expect(planDeRetirada({ nativa: false, menosMovimiento: true })).toBeNull()
  })

  it('en nativo: la espera y después el fundido completo', () => {
    expect(planDeRetirada({ nativa: true, menosMovimiento: false })).toEqual({
      espera: ESPERA_ANTES_DE_RETIRAR,
      fadeOutDuration: FUNDIDO_DE_SALIDA,
    })
  })

  it('con «reducir movimiento», sin espera y sin fundido (§4.7)', () => {
    expect(planDeRetirada({ nativa: true, menosMovimiento: true })).toEqual({
      espera: 0,
      fadeOutDuration: 0,
    })
  })

  it('el fundido está dentro del rango de movimiento de la marca', () => {
    expect(FUNDIDO_DE_SALIDA).toBeGreaterThanOrEqual(120)
    expect(FUNDIDO_DE_SALIDA).toBeLessThanOrEqual(900)
  })

  it('la espera cubre los 131 ms medidos en un iPhone 17, y no se dispara', () => {
    // 0,41 × 320: lo que el fundido corría sin verse antes de que iOS destapara.
    expect(ESPERA_ANTES_DE_RETIRAR).toBeGreaterThan(Math.round(0.41 * 320) * 2)
    expect(ESPERA_ANTES_DE_RETIRAR).toBeLessThanOrEqual(900)
  })

  it('el techo solo actúa si el camino normal se atasca', () => {
    expect(TECHO_DE_RETIRADA).toBeGreaterThan(ESPERA_ANTES_DE_RETIRAR * 3)
  })
})

describe('retirarPantallaDeArranque: el orden (D-21.9)', () => {
  it('no oculta antes de dos fotogramas y la espera, y oculta con el fundido completo', () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })

    reloj.cuadro()
    reloj.cuadro()
    reloj.avanzar(ESPERA_ANTES_DE_RETIRAR - 1)
    expect(llamadas).toEqual([])

    reloj.avanzar(1)
    expect(llamadas).toEqual([{ fadeOutDuration: FUNDIDO_DE_SALIDA }])
  })

  it('la espera cuenta desde el segundo fotograma, no desde la llamada', () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })

    reloj.avanzar(ESPERA_ANTES_DE_RETIRAR)
    expect(llamadas).toEqual([])
    reloj.cuadro()
    reloj.cuadro()
    reloj.avanzar(ESPERA_ANTES_DE_RETIRAR)
    expect(llamadas).toHaveLength(1)
  })

  it('oculta una sola vez: el techo no la repite', () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })
    reloj.cuadro()
    reloj.cuadro()
    reloj.avanzar(TECHO_DE_RETIRADA * 2)
    expect(llamadas).toHaveLength(1)
    expect(reloj.pendientes).toBe(0)
  })

  it('con «reducir movimiento», tras el primer pintado, sin espera y sin fundido', () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: true, ocultar, reloj })

    reloj.cuadro()
    expect(llamadas).toEqual([])
    reloj.cuadro()
    reloj.avanzar(0)
    expect(llamadas).toEqual([{ fadeOutDuration: 0 }])
  })

  it('en web no oculta nada ni arma ningún reloj', () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: false, menosMovimiento: false, ocultar, reloj })
    reloj.cuadro()
    reloj.cuadro()
    reloj.avanzar(TECHO_DE_RETIRADA * 2)
    expect(llamadas).toEqual([])
    expect(reloj.pendientes).toBe(0)
  })
})

describe('retirarPantallaDeArranque: se retira siempre', () => {
  it('si los fotogramas no llegan nunca, el techo la retira', () => {
    const reloj = relojDePrueba({ sinCuadros: true })
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })

    reloj.avanzar(TECHO_DE_RETIRADA - 1)
    expect(llamadas).toEqual([])
    reloj.avanzar(1)
    expect(llamadas).toEqual([{ fadeOutDuration: FUNDIDO_DE_SALIDA }])
  })

  it('si pedir un fotograma lanza, la retira en el acto', () => {
    const reloj = relojDePrueba()
    reloj.siguienteCuadro = () => {
      throw new Error('sin fotogramas')
    }
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })
    expect(llamadas).toEqual([{ fadeOutDuration: FUNDIDO_DE_SALIDA }])
  })

  it('si ni el techo se puede armar, el camino normal sigue retirándola', () => {
    const reloj = relojDePrueba()
    const esperar = reloj.esperar
    let primera = true
    reloj.esperar = (fn, ms) => {
      if (primera) {
        primera = false
        throw new Error('sin temporizadores')
      }
      return esperar(fn, ms)
    }
    const { ocultar, llamadas } = ocultarDePrueba()
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })
    reloj.cuadro()
    reloj.cuadro()
    reloj.avanzar(ESPERA_ANTES_DE_RETIRAR)
    expect(llamadas).toEqual([{ fadeOutDuration: FUNDIDO_DE_SALIDA }])
  })

  it('si hide() lanza, lo intenta otra vez sin fundido', () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba((n) => {
      if (n === 1) throw new Error('puente no listo')
      return Promise.resolve()
    })
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })
    reloj.cuadro()
    reloj.cuadro()
    reloj.avanzar(ESPERA_ANTES_DE_RETIRAR)
    expect(llamadas).toEqual([{ fadeOutDuration: FUNDIDO_DE_SALIDA }, { fadeOutDuration: 0 }])
  })

  it('si hide() se rechaza, lo intenta otra vez sin fundido', async () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba((n) =>
      n === 1 ? Promise.reject(new Error('rechazo')) : Promise.resolve(),
    )
    retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })
    reloj.cuadro()
    reloj.cuadro()
    reloj.avanzar(ESPERA_ANTES_DE_RETIRAR)
    await vaciarPromesas()
    expect(llamadas).toEqual([{ fadeOutDuration: FUNDIDO_DE_SALIDA }, { fadeOutDuration: 0 }])
  })

  it('si el segundo intento también falla, no escapa nada', async () => {
    const reloj = relojDePrueba()
    const { ocultar, llamadas } = ocultarDePrueba((n) => {
      if (n === 1) return Promise.reject(new Error('rechazo'))
      throw new Error('otra vez')
    })
    expect(() => {
      retirarPantallaDeArranque({ nativa: true, menosMovimiento: false, ocultar, reloj })
      reloj.cuadro()
      reloj.cuadro()
      reloj.avanzar(ESPERA_ANTES_DE_RETIRAR)
    }).not.toThrow()
    await vaciarPromesas()
    expect(llamadas).toHaveLength(2)
  })
})
