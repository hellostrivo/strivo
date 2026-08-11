// src/lumia/__tests__/emociones.test.js
// Emociones de la mañana (§5.3, B3 · SPEC_06, criterios 8 y 10).

import { describe, expect, it } from 'vitest'

import {
  CATALOGO,
  IDS,
  MAX_EMOCIONES,
  alternarEmocion,
  etiquetaDe,
  soloDelCatalogo,
} from '../emociones.js'

const DIFICILES = ['triste', 'ansioso', 'frustrado', 'preocupado', 'melancolico', 'solo', 'cansado']

describe('emociones de la vista de mañana', () => {
  it('son quince, en orden fijo y con emoji', () => {
    expect(CATALOGO).toHaveLength(15)
    CATALOGO.forEach((emocion) => {
      expect(emocion.emoji).toBeTruthy()
      expect(emocion.label).toHaveProperty('n')
    })
  })

  it('son todas positivas: ninguna emoción difícil se ofrece a cultivar', () => {
    DIFICILES.forEach((id) => expect(IDS).not.toContain(id))
  })

  it('no se pueden seleccionar más de tres', () => {
    const tres = ['agradecido', 'en_paz', 'enfocado']
    const { seleccion, desplazada } = alternarEmocion(tres, 'feliz')
    expect(seleccion).toHaveLength(MAX_EMOCIONES)
    expect(seleccion).toEqual(['en_paz', 'enfocado', 'feliz'])
    expect(desplazada).toBe('agradecido')
  })

  it('la cuarta entra y sale la más antigua, no se rechaza el toque', () => {
    const { seleccion } = alternarEmocion(['agradecido', 'en_paz', 'enfocado'], 'valiente')
    expect(seleccion).toContain('valiente')
  })

  it('tocar una elegida la quita', () => {
    const { seleccion, desplazada } = alternarEmocion(['agradecido', 'en_paz'], 'en_paz')
    expect(seleccion).toEqual(['agradecido'])
    expect(desplazada).toBeNull()
  })

  it('resuelve la etiqueta al género del perfil', () => {
    expect(etiquetaDe('agradecido', 'f')).toBe('Agradecida')
    expect(etiquetaDe('agradecido', 'm')).toBe('Agradecido')
    expect(etiquetaDe('agradecido', 'n')).toBe('Con gratitud')
    expect(etiquetaDe('agradecido', undefined)).toBe('Con gratitud')
  })

  it('la forma neutra no es la masculina reutilizada ni la terminación en "-e"', () => {
    CATALOGO.forEach(({ label }) => {
      if (label.m === label.f) return // "Feliz", "Valiente": no hay marca que evitar
      expect(label.n).not.toBe(label.m)
      expect(label.n).not.toBe(`${label.m.slice(0, -1)}e`)
    })
  })

  it('descarta ids que no son del catálogo', () => {
    expect(soloDelCatalogo(['agradecido', 'inventada'])).toEqual(['agradecido'])
  })
})
