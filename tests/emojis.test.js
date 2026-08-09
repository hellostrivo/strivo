// tests/emojis.test.js
// El símbolo de cada hábito (§16): el catálogo, las sugerencias de P7 y P8, y
// lo que se guarda con el hábito.

import { describe, it, expect } from 'vitest'
import { copy } from '@copy'
import { EMOJIS, EMOJI_CATEGORIAS, EMOJI_POR_DEFECTO } from '@lib/emojis'
import { suggestionsFor } from '@lib/habitSuggestions'
import { AREA_TYPES } from '@lib/areas'
import { emptyDraft } from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { filasDe } from './helpers/db.js'

const sugerenciasDe = momento =>
  Object.entries(copy.onboarding[momento === 'manana' ? 'p7' : 'p8'].suggestions)

describe('Catálogo de símbolos (§16.3.B)', () => {
  it('tiene entre 40 y 60, en siete categorías con nombre', () => {
    expect(EMOJIS.length).toBeGreaterThanOrEqual(40)
    expect(EMOJIS.length).toBeLessThanOrEqual(60)
    expect(EMOJI_CATEGORIAS).toHaveLength(7)

    for (const categoria of EMOJI_CATEGORIAS) {
      expect(copy.habits.emoji.categories[categoria.id], categoria.id).toBeDefined()
    }
  })

  it('ninguno se repite', () => {
    expect(new Set(EMOJIS).size).toBe(EMOJIS.length)
  })

  it('todos tienen nombre para el lector de pantalla', () => {
    for (const emoji of EMOJIS) {
      expect(copy.habits.emoji.names[emoji], emoji).toBeDefined()
    }
  })

  it('el de por defecto está en el catálogo', () => {
    expect(EMOJIS).toContain(EMOJI_POR_DEFECTO)
  })
})

describe('Sugerencias de P7 y P8 (§16.3.A)', () => {
  it('cada hábito sugerido trae su símbolo, y su nombre', () => {
    for (const momento of ['manana', 'noche']) {
      for (const [area, sugerencias] of sugerenciasDe(momento)) {
        for (const sugerencia of sugerencias) {
          expect(sugerencia.texto, `${momento}/${area}`).toBeTruthy()
          expect(sugerencia.emoji, `${momento}/${area}/${sugerencia.texto}`).toBeTruthy()
          expect(copy.habits.emoji.names[sugerencia.emoji], sugerencia.emoji).toBeDefined()
        }
      }
    }
  })

  it('no se repite ningún símbolo dentro de la misma pantalla', () => {
    // El caso más exigente: las siete áreas elegidas a la vez. Aunque P4B ya no
    // deja pasar de tres, si dos hábitos compartieran símbolo se volverían
    // indistinguibles de un vistazo, que es justo lo que viene a resolver.
    for (const momento of ['manana', 'noche']) {
      const sugerencias = suggestionsFor(momento, AREA_TYPES)
      const simbolos    = sugerencias.map(s => s.emoji)
      expect(new Set(simbolos).size, momento).toBe(simbolos.length)
    }
  })

  it('ninguna sugerencia cambió de nombre ni desapareció', () => {
    // Los textos son los mismos de antes de añadir los símbolos (§16.2)
    expect(suggestionsFor('manana', ['salud']).map(s => s.texto))
      .toEqual(['Beber agua', 'Estirar', 'Caminar 10 min'])
    expect(suggestionsFor('noche', ['relaciones']).map(s => s.texto))
      .toEqual(['Dar las gracias a alguien', 'Escuchar de verdad'])
  })

  it('sin áreas se ofrece la lista general, también con símbolos', () => {
    const general = suggestionsFor('manana', [])
    expect(general.map(s => s.texto)).toEqual([
      'Beber agua', 'Respirar', 'Estirar', 'Escribir una idea',
    ])
    expect(general.every(s => s.emoji)).toBe(true)
    expect(general.every(s => s.areaId === null)).toBe(true)
  })
})

describe('El símbolo viaja con el hábito (§16.4)', () => {
  it('se guarda en la fila del hábito', async () => {
    await finishOnboarding({
      ...emptyDraft,
      identidadCentral: 'crece cada día',
      habitosManana: [
        { id: 'h1', texto: 'Beber agua', emoji: '💧', areaId: 'salud', momento: 'manana' },
      ],
      areas: ['salud'],
    })

    const [habito] = await filasDe('habits')
    expect(habito).toMatchObject({ nombre: 'Beber agua', emoji: '💧' })
  })

  it('un hábito sin símbolo se guarda con null, no con el de por defecto', async () => {
    // Elegirlo es suyo: la app no le escribe uno que nadie escogió
    await finishOnboarding({
      ...emptyDraft,
      identidadCentral: 'crece cada día',
      habitosNoche: [
        { id: 'h2', texto: 'Guardar el teléfono', areaId: null, momento: 'noche' },
      ],
    })

    const [habito] = await filasDe('habits')
    expect(habito.emoji).toBeNull()
  })
})
