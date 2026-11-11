// src/lib/avisos/__tests__/pedido.test.js
// SPEC_22 — Pedir sin saber cómo se hace (DP-22.9).

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import {
  alCerrarMomento,
  alReconciliar,
  contarResultado,
  escucharPedidos,
  olvidarResultado,
  pedirReconciliacion,
} from '../pedido.js'

describe('pedir', () => {
  it('sin nadie escuchando —la web, el onboarding— no hace nada y no rompe', () => {
    expect(() => pedirReconciliacion()).not.toThrow()
  })

  it('quien escucha recibe el pedido, y cerrar un momento dice cuál', () => {
    const recibidos = []
    const dejar = escucharPedidos((d) => recibidos.push(d))
    pedirReconciliacion()
    alCerrarMomento('2026-11-11', 'noche')
    dejar()
    pedirReconciliacion()
    expect(recibidos).toEqual([{}, { cerrado: { fecha: '2026-11-11', momento: 'noche' } }])
  })

  it('un oyente que falla no rompe a quien pide', () => {
    const dejar = escucharPedidos(() => {
      throw new Error('roto')
    })
    expect(() => pedirReconciliacion()).not.toThrow()
    dejar()
  })

  it('no importa nada: ni el plugin, ni la base, ni la reconciliación', () => {
    expect(readFileSync('src/lib/avisos/pedido.js', 'utf8')).not.toMatch(/^import /m)
  })
})

describe('contar el resultado', () => {
  it('quien llega tarde recibe el último en el acto; al cerrar sesión se olvida', () => {
    contarResultado({ permiso: 'concedido', programados: 3 })
    const vistos = []
    const dejar = alReconciliar((r) => vistos.push(r.programados))
    contarResultado({ permiso: 'concedido', programados: 4 })
    dejar()
    expect(vistos).toEqual([3, 4])
    olvidarResultado()
    const tarde = []
    alReconciliar((r) => tarde.push(r))()
    expect(tarde).toEqual([])
  })
})
