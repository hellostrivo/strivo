// src/breathing/lib/__tests__/preferenciaMovimiento.test.js
// Criterios 15 y 16 de SPEC_14 (RN-RE-VIS-21 y 22).

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CONSULTA,
  combinarPreferencia,
  leerPreferenciaSistema,
  observarPreferenciaSistema,
} from '../preferenciaMovimiento.js'

/** Un `matchMedia` de mentira al que se le puede cambiar de opinión. */
function montarMatchMedia(inicial = false) {
  const oyentes = new Set()
  const consulta = {
    matches: inicial,
    media: CONSULTA,
    addEventListener: (_tipo, fn) => oyentes.add(fn),
    removeEventListener: (_tipo, fn) => oyentes.delete(fn),
  }
  globalThis.window = {
    matchMedia: vi.fn(() => consulta),
  }
  return {
    consulta,
    oyentes,
    cambiar(valor) {
      consulta.matches = valor
      oyentes.forEach((fn) => fn({ matches: valor }))
    },
  }
}

afterEach(() => {
  delete globalThis.window
})

describe('las dos fuentes se combinan (criterio 15, RN-RE-VIS-22)', () => {
  it('el interruptor manual basta, con el sistema desactivado', () => {
    expect(combinarPreferencia(false, true)).toBe(true)
  })

  it('el sistema basta, con el interruptor manual apagado', () => {
    expect(combinarPreferencia(true, false)).toBe(true)
  })

  it('las dos a la vez siguen siendo una', () => {
    expect(combinarPreferencia(true, true)).toBe(true)
  })

  it('sin ninguna, no', () => {
    expect(combinarPreferencia(false, false)).toBe(false)
  })

  it('ninguna manda sobre la otra: nadie queda atrapado en el modo del sistema', () => {
    // Al revés también importa. Si el sistema pudiera imponerlo, alguien con la
    // preferencia puesta en su teléfono no podría salirse aquí; y si el manual
    // pudiera anularlo, la preferencia del sistema sería decorativa.
    expect(combinarPreferencia(false, true)).toBe(combinarPreferencia(true, false))
  })

  it('trata los valores raros como un no', () => {
    expect(combinarPreferencia(undefined, undefined)).toBe(false)
    expect(combinarPreferencia(null, 0)).toBe(false)
  })
})

describe('se escucha, no se lee una sola vez (criterio 16, RN-RE-VIS-21)', () => {
  it('consulta exactamente `prefers-reduced-motion: reduce`', () => {
    montarMatchMedia(false)
    leerPreferenciaSistema()
    expect(globalThis.window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('lee el valor de partida', () => {
    montarMatchMedia(true)
    expect(leerPreferenciaSistema()).toBe(true)
  })

  it('un cambio en vivo llega al oyente, sin remontar nada', () => {
    const medio = montarMatchMedia(false)
    const visto = []
    observarPreferenciaSistema((valor) => visto.push(valor))

    medio.cambiar(true)
    medio.cambiar(false)

    expect(visto).toEqual([true, false])
  })

  it('dejar de escuchar suelta el oyente de verdad', () => {
    const medio = montarMatchMedia(false)
    const visto = []
    const soltar = observarPreferenciaSistema((valor) => visto.push(valor))

    medio.cambiar(true)
    soltar()
    medio.cambiar(false)

    expect(visto).toEqual([true])
    expect(medio.oyentes.size).toBe(0)
  })

  it('sin `matchMedia` no se rompe: devuelve que no y algo que se puede llamar', () => {
    globalThis.window = {}
    expect(leerPreferenciaSistema()).toBe(false)
    expect(() => observarPreferenciaSistema(() => {})()).not.toThrow()
  })

  it('sin `window` tampoco: es lo que ocurre al renderizar fuera del navegador', () => {
    delete globalThis.window
    expect(leerPreferenciaSistema()).toBe(false)
    expect(() => observarPreferenciaSistema(() => {})()).not.toThrow()
  })
})
