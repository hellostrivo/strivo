// src/copy/__tests__/gender.test.js
// El helper de género (§3.6.5, RN-GEN-01..06).

import { describe, expect, it } from 'vitest'

import { resolveAll, resolveGender } from '../gender.js'

const TRANQUILO = { m: 'Tranquilo', f: 'Tranquila', n: 'En calma' }

describe('resolveGender', () => {
  it('devuelve las cadenas sin tocarlas', () => {
    expect(resolveGender('Buenas noches', 'f')).toBe('Buenas noches')
  })

  it('resuelve las tres formas', () => {
    expect(resolveGender(TRANQUILO, 'm')).toBe('Tranquilo')
    expect(resolveGender(TRANQUILO, 'f')).toBe('Tranquila')
    expect(resolveGender(TRANQUILO, 'n')).toBe('En calma')
  })

  it('sin género declarado, el neutro es el comportamiento por defecto', () => {
    expect(resolveGender(TRANQUILO, undefined)).toBe('En calma')
    expect(resolveGender(TRANQUILO, null)).toBe('En calma')
    expect(resolveGender(TRANQUILO, 'x')).toBe('En calma')
  })

  it('si falta la forma pedida cae al neutro, y después a la masculina', () => {
    expect(resolveGender({ m: 'Solo', n: 'En soledad' }, 'f')).toBe('En soledad')
    expect(resolveGender({ m: 'Solo' }, 'f')).toBe('Solo')
  })

  it('nunca lanza: una cadena vacía es mejor que una pantalla rota', () => {
    expect(resolveGender(undefined, 'f')).toBe('')
    expect(resolveGender(null, 'f')).toBe('')
    expect(resolveGender(42, 'f')).toBe('')
  })

  it('resuelve listas enteras con el mismo género', () => {
    expect(resolveAll([TRANQUILO, 'Feliz'], 'f')).toEqual(['Tranquila', 'Feliz'])
  })
})
