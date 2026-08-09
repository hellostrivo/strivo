// tests/timeSlot.test.js
// El día de Strivo no termina a medianoche (§7.2): termina a `diaTerminaA`.
// De esta fecha cuelga todo lo demás, así que conviene tenerla sujeta.

import { describe, it, expect } from 'vitest'
import { todayKey, strivoDayKey, previousDayKey, getTimeSlot } from '@lib/timeSlot'

describe('todayKey', () => {
  it('usa la hora local, no UTC', () => {
    // A las 23:30 en UTC-6, toISOString() daría ya el día siguiente
    expect(todayKey(new Date(2026, 7, 5, 23, 30))).toBe('2026-08-05')
  })

  it('rellena mes y día con cero', () => {
    expect(todayKey(new Date(2026, 0, 9, 12, 0))).toBe('2026-01-09')
  })
})

describe('strivoDayKey', () => {
  it('a las 23:30 el día es el de hoy', () => {
    expect(strivoDayKey('03:00', new Date(2026, 7, 5, 23, 30))).toBe('2026-08-05')
  })

  it('a la 1:30 se sigue cerrando el día de ayer', () => {
    expect(strivoDayKey('03:00', new Date(2026, 7, 6, 1, 30))).toBe('2026-08-05')
  })

  it('justo a las 03:00 empieza el día nuevo', () => {
    expect(strivoDayKey('03:00', new Date(2026, 7, 6, 3, 0))).toBe('2026-08-06')
  })

  it('respeta la hora que tenga cada quien', () => {
    const lasCuatro = new Date(2026, 7, 6, 4, 30)
    expect(strivoDayKey('03:00', lasCuatro)).toBe('2026-08-06')
    expect(strivoDayKey('05:00', lasCuatro)).toBe('2026-08-05')
  })

  it('cruza el cambio de mes', () => {
    expect(strivoDayKey('03:00', new Date(2026, 8, 1, 1, 0))).toBe('2026-08-31')
  })
})

describe('previousDayKey', () => {
  it('cruza el cambio de mes', () => {
    expect(previousDayKey('2026-08-01')).toBe('2026-07-31')
  })

  it('cruza el cambio de año', () => {
    expect(previousDayKey('2026-01-01')).toBe('2025-12-31')
  })

  it('conoce los años bisiestos', () => {
    expect(previousDayKey('2028-03-01')).toBe('2028-02-29')
  })
})

describe('franjas horarias', () => {
  it('cada hora cae en una franja con nombre', () => {
    const franjas = new Set(['amanecer', 'dia', 'atardecer', 'noche', 'madrugada'])
    for (let hora = 0; hora < 24; hora++) {
      expect(franjas.has(getTimeSlot('07:00', '23:00'))).toBe(true)
    }
  })
})
