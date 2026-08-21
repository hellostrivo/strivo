// src/breathing/lib/__tests__/formato.test.js
// Criterio 18 de SPEC_16: coma decimal, no punto (RN-RE-NAV-18).

import { describe, expect, it } from 'vitest'

import { reloj, segundosConDecimal, tiempoDeFase } from '../formato.js'

describe('los tiempos van con coma (criterio 18, RN-RE-NAV-18)', () => {
  it('5,0 s, no 5.0 s', () => {
    // El locale del producto es es-MX. `5.0 s` en una app en español se lee como
    // un descuido de quien la programó.
    expect(tiempoDeFase(50)).toBe('5,0 s')
    expect(tiempoDeFase(50)).not.toContain('.')
  })

  it('siempre con un decimal, también en los enteros', () => {
    // Una columna donde unos valores llevan decimal y otros no baila al pulsar
    // `−`/`+`, y lo que se está mirando es justo cómo cambia el número.
    expect(segundosConDecimal(40)).toBe('4,0')
    expect(segundosConDecimal(0)).toBe('0,0')
    expect(segundosConDecimal(200)).toBe('20,0')
  })

  it('las décimas se ven', () => {
    expect(segundosConDecimal(45)).toBe('4,5')
    expect(segundosConDecimal(7)).toBe('0,7')
  })

  it('no depende del navegador ni de los datos de región', () => {
    // `toLocaleString` da un separador que cambia de un teléfono a otro, y un
    // separador que cambia solo no es una decisión de producto: es una lotería.
    const todas = []
    for (let d = 0; d <= 200; d += 1) todas.push(segundosConDecimal(d))
    expect(todas.every((texto) => texto.includes(',') && !texto.includes('.'))).toBe(true)
  })

  it('un valor imposible no imprime NaN en pantalla', () => {
    expect(segundosConDecimal(NaN)).toBe('0,0')
    expect(segundosConDecimal(undefined)).toBe('0,0')
    expect(tiempoDeFase('hola')).toBe('0,0 s')
  })
})

describe('el reloj de la sesión', () => {
  it('los segundos siempre con dos cifras', () => {
    // `1:2` no es una hora, es un error.
    expect(reloj(62)).toBe('1:02')
    expect(reloj(9)).toBe('0:09')
  })

  it('cuenta minutos por encima de diez', () => {
    expect(reloj(642)).toBe('10:42')
  })

  it('en cero es 0:00, no vacío', () => {
    expect(reloj(0)).toBe('0:00')
  })

  it('un tiempo negativo o roto se queda en cero', () => {
    expect(reloj(-30)).toBe('0:00')
    expect(reloj(NaN)).toBe('0:00')
  })
})
