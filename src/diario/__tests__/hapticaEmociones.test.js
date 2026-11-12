// src/diario/__tests__/hapticaEmociones.test.js
// SPEC_23B — Elegir una emoción vibra; soltarla o chocar con el tope, no.
//
// `entroEnLaSeleccion` es la pregunta que hacen `ChipsCatalogo` y
// `ChipsEmociones` antes de pedir el toque. Se prueba contra las reglas reales
// de los cuatro catálogos, no contra listas escritas a mano.

import { describe, expect, it } from 'vitest'

import { ANIMO, INTENCION } from '../mananaEmociones.js'
import { CIERRE } from '../nocheEmociones.js'
import { alternarEmocion, IDS as IDS_JOURNAL } from '../emocionesJournal.js'
import { ID_OTRA, entroEnLaSeleccion } from '../seleccionEmociones.js'

/** Lo que haría el chip: aplicar la regla y preguntar. */
function tocarDia(catalogo, antes, id) {
  const { seleccion } = catalogo.alternarVarias(antes, id)
  return { seleccion, vibra: entroEnLaSeleccion(antes, seleccion, id) }
}

describe('las tres preguntas emocionales del día', () => {
  ;[
    ['cómo me siento esta mañana', ANIMO],
    ['cómo me gustaría sentirme', INTENCION],
    ['cómo me siento al cerrar el día', CIERRE],
  ].forEach(([nombre, catalogo]) => {
    const [a, b, c, d] = catalogo.IDS

    it(`${nombre}: elegir una vibra`, () => {
      expect(tocarDia(catalogo, [], a).vibra).toBe(true)
    })

    it(`${nombre}: soltarla no vibra`, () => {
      const { seleccion, vibra } = tocarDia(catalogo, [a], a)
      expect(seleccion).toEqual([])
      expect(vibra).toBe(false)
    })

    it(`${nombre}: la cuarta, con el tope lleno, no vibra`, () => {
      const { seleccion, vibra } = tocarDia(catalogo, [a, b, c], d)
      expect(seleccion).toEqual([a, b, c])
      expect(vibra).toBe(false)
    })

    it(`${nombre}: «Algo más» vibra al entrar`, () => {
      expect(tocarDia(catalogo, [a], ID_OTRA).vibra).toBe(true)
    })
  })
})

describe('el Journal', () => {
  const [a, b, c, d] = IDS_JOURNAL

  it('elegir una vibra', () => {
    const { seleccion } = alternarEmocion([], a)
    expect(entroEnLaSeleccion([], seleccion, a)).toBe(true)
  })

  it('la cuarta entra desplazando a la más antigua, y eso sí vibra', () => {
    const { seleccion, desplazada } = alternarEmocion([a, b, c], d)
    expect(desplazada).toBe(a)
    expect(entroEnLaSeleccion([a, b, c], seleccion, d)).toBe(true)
  })

  it('soltar una no vibra', () => {
    const { seleccion } = alternarEmocion([a, b], b)
    expect(entroEnLaSeleccion([a, b], seleccion, b)).toBe(false)
  })
})

describe('entroEnLaSeleccion, sin catálogo', () => {
  it('una lista que no cambió no vibra', () => {
    expect(entroEnLaSeleccion(['x'], ['x'], 'x')).toBe(false)
  })

  it('lo que no es una lista se lee como vacío', () => {
    expect(entroEnLaSeleccion(null, ['x'], 'x')).toBe(true)
    expect(entroEnLaSeleccion(['x'], undefined, 'x')).toBe(false)
  })
})
