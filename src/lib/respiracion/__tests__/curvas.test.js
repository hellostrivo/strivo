// src/lib/respiracion/__tests__/curvas.test.js
// La curva es un parámetro, no una constante escondida (RN-RE-MOT-10). Estas
// pruebas fijan lo único que el motor da por hecho de cualquier curva que le
// pasen: que empieza en 0, termina en 1 y no retrocede por el camino.

import { describe, expect, it } from 'vitest'

import { CURVA_POR_DEFECTO, cosenoElevado, lineal, recortar } from '../curvas.js'

describe('las curvas de suavizado (SPEC_13 §6.4)', () => {
  it('el coseno elevado va de 0 a 1', () => {
    expect(cosenoElevado(0)).toBe(0)
    expect(cosenoElevado(1)).toBe(1)
    expect(cosenoElevado(0.5)).toBeCloseTo(0.5, 10)
  })

  it('crece sin retroceder', () => {
    let anterior = -Infinity
    for (let t = 0; t <= 1; t += 0.01) {
      const valor = cosenoElevado(t)
      expect(valor).toBeGreaterThanOrEqual(anterior)
      anterior = valor
    }
  })

  it('arranca y llega despacio: es lo que la hace orgánica', () => {
    // La velocidad nace en cero y muere en cero. Un tramo cerca del borde
    // recorre mucho menos que el mismo tramo en el centro.
    const borde = cosenoElevado(0.05) - cosenoElevado(0)
    const centro = cosenoElevado(0.55) - cosenoElevado(0.5)
    expect(borde).toBeLessThan(centro / 4)
  })

  it('la lineal es la recta, y está para poder comparar', () => {
    expect(lineal(0.37)).toBe(0.37)
  })

  it('un progreso fuera de rango se recorta en vez de romper', () => {
    expect(recortar(-3)).toBe(0)
    expect(recortar(4)).toBe(1)
    expect(recortar(NaN)).toBe(0)
    expect(recortar(undefined)).toBe(0)
    expect(cosenoElevado(-1)).toBe(0)
    expect(cosenoElevado(2)).toBe(1)
  })

  it('la de por defecto es el coseno elevado', () => {
    expect(CURVA_POR_DEFECTO).toBe(cosenoElevado)
  })
})
