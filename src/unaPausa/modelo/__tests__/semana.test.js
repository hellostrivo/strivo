// SPEC_28.1 §4.2 — qué semana es en Monterrey.
import { describe, expect, it } from 'vitest'
import {
  LIMITE_VALIDACION_FINAL,
  ZONA,
  esClave,
  esLunes,
  esMarca,
  fechaEnZona,
  instanteEnZona,
  limiteValidacionFinal,
  lunesDe,
  restarDias,
  sumarDias,
} from '../semana.js'

describe('lunesDe (criterio 1)', () => {
  it('el domingo 23:59:59 y el lunes 00:00:00 de Monterrey caen en semanas distintas', () => {
    expect(lunesDe('2026-10-11T23:59:59-06:00')).toBe('2026-10-05')
    expect(lunesDe('2026-10-12T00:00:00-06:00')).toBe('2026-10-12')
  })

  it('lee el instante, no el desfase con que se escribió', () => {
    // Las 05:59:59 en UTC del lunes siguen siendo domingo en Monterrey.
    expect(lunesDe('2026-10-12T05:59:59Z')).toBe('2026-10-05')
    expect(lunesDe('2026-10-12T06:00:00Z')).toBe('2026-10-12')
    expect(lunesDe(new Date('2026-10-12T14:59:59+09:00'))).toBe('2026-10-05')
  })

  it('una semana va de lunes a domingo, también cruzando mes y año', () => {
    expect(lunesDe('2026-12-31T12:00:00-06:00')).toBe('2026-12-28')
    expect(lunesDe('2027-01-03T23:00:00-06:00')).toBe('2026-12-28')
    expect(lunesDe('2027-01-04T00:00:00-06:00')).toBe('2027-01-04')
  })

  it('un instante ilegible no tiene semana', () => {
    expect(lunesDe('ayer')).toBeNull()
    expect(lunesDe(undefined)).toBeNull()
  })
})

describe('claves y marcas', () => {
  it('ZONA es la de Monterrey', () => expect(ZONA).toBe('America/Monterrey'))

  it('esClave exige un día que exista', () => {
    expect(esClave('2026-10-12')).toBe(true)
    expect(esClave('2028-02-29')).toBe(true)
    expect(esClave('2026-02-29')).toBe(false)
    expect(esClave('2026-02-31')).toBe(false)
    expect(esClave('2026-1-5')).toBe(false)
    expect(esClave(null)).toBe(false)
  })

  it('esLunes', () => {
    expect(esLunes('2026-12-07')).toBe(true)
    expect(esLunes('2026-12-08')).toBe(false)
    expect(esLunes('no')).toBe(false)
  })

  it('esMarca exige desfase', () => {
    expect(esMarca('2026-12-02T23:59:59-06:00')).toBe(true)
    expect(esMarca('2026-12-02T23:59:59.123Z')).toBe(true)
    expect(esMarca('2026-12-02T23:59:59')).toBe(false)
    expect(esMarca('2026-12-02')).toBe(false)
    expect(esMarca('2026-13-02T10:00:00Z')).toBe(false)
  })

  it('sumar y restar días no pasa por la hora local', () => {
    expect(sumarDias('2026-12-28', 7)).toBe('2027-01-04')
    expect(restarDias('2026-12-07', 28)).toBe('2026-11-09')
    expect(sumarDias('2028-02-28', 1)).toBe('2028-02-29')
    expect(sumarDias('2026-02-31', 1)).toBeNull()
    expect(sumarDias('2026-02-01', 1.5)).toBeNull()
  })

  it('fechaEnZona da el día de Monterrey', () => {
    expect(fechaEnZona('2026-10-12T05:59:59Z')).toBe('2026-10-11')
    expect(fechaEnZona(Date.parse('2026-10-12T06:00:00Z'))).toBe('2026-10-12')
    expect(fechaEnZona('nunca')).toBeNull()
  })

  it('instanteEnZona es la hora de pared de Monterrey', () => {
    expect(new Date(instanteEnZona('2026-10-12')).toISOString()).toBe('2026-10-12T06:00:00.000Z')
    expect(Number.isNaN(instanteEnZona('2026-02-31'))).toBe(true)
  })
})

describe('limiteValidacionFinal (DP-28.9, provisional)', () => {
  it('es el miércoles previo, 23:59:59 en Monterrey, con el segundo entero', () => {
    expect(LIMITE_VALIDACION_FINAL).toEqual({ diasAntes: 5, hora: '23:59:59' })
    const limite = limiteValidacionFinal('2026-12-07')
    expect(new Date(limite).toISOString()).toBe('2026-12-03T05:59:59.999Z')
    expect(Date.parse('2026-12-02T23:59:59-06:00')).toBeLessThanOrEqual(limite)
    expect(Date.parse('2026-12-03T00:00:00-06:00')).toBeGreaterThan(limite)
  })

  it('sin semana válida no hay límite', () => {
    expect(Number.isNaN(limiteValidacionFinal(null))).toBe(true)
  })
})
