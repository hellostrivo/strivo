// src/lib/avisos/__tests__/plan.test.js
// SPEC_22 — Qué avisos tienen que estar programados (criterio 2).
//
// Lógica pura: el reloj, las horas y lo cerrado entran por argumentos.

import { afterEach, describe, expect, it } from 'vitest'
import {
  DIAS_DE_VENTANA,
  MARGEN_MS,
  idDeAviso,
  instanteDe,
  planDeAvisos,
  proximosPorMomento,
} from '../plan.js'

const TZ_ORIGINAL = process.env.TZ

afterEach(() => {
  if (TZ_ORIGINAL === undefined) delete process.env.TZ
  else process.env.TZ = TZ_ORIGINAL
})

/** 11 nov 2026 a la hora que se diga, en hora local. */
const el11 = (hora, minuto = 0) => new Date(2026, 10, 11, hora, minuto, 0, 0)

const BASE = {
  despertar: '07:00',
  dormir: '23:00',
  diaTerminaA: '00:00',
  encendidos: true,
}

describe('las horas exactas', () => {
  it('cada aviso a la hora de «Cómo son tus días», con su momento', () => {
    const plan = planDeAvisos({ ...BASE, ahora: el11(6) })
    expect(plan[0]).toMatchObject({
      momento: 'manana',
      fecha: '2026-11-11',
      on: { year: 2026, month: 11, day: 11, hour: 7, minute: 0 },
    })
    expect(plan[1]).toMatchObject({
      momento: 'noche',
      fecha: '2026-11-11',
      on: { year: 2026, month: 11, day: 11, hour: 23, minute: 0 },
    })
  })

  it('van en orden de llegada', () => {
    const plan = planDeAvisos({ ...BASE, ahora: el11(6) })
    const instantes = plan.map((aviso) => aviso.cuando)
    expect(instantes).toEqual([...instantes].sort((a, b) => a - b))
  })

  it('con minutos que no son en punto', () => {
    const plan = planDeAvisos({ ...BASE, despertar: '06:45', ahora: el11(6) })
    expect(plan[0].on).toMatchObject({ hour: 6, minute: 45 })
  })
})

describe('lo que ya pasó no se programa', () => {
  it('a las 08:00, la mañana de hoy ya no está; la de mañana sí', () => {
    const plan = planDeAvisos({ ...BASE, ahora: el11(8) })
    expect(plan.find((a) => a.fecha === '2026-11-11' && a.momento === 'manana')).toBeUndefined()
    expect(plan[0]).toMatchObject({ momento: 'noche', fecha: '2026-11-11' })
    expect(plan[1]).toMatchObject({ momento: 'manana', fecha: '2026-11-12' })
  })

  it('con un minuto de margen: nada se manda «ya»', () => {
    const casiLas7 = new Date(el11(7).getTime() - MARGEN_MS + 1)
    const plan = planDeAvisos({ ...BASE, ahora: casiLas7 })
    expect(plan.find((a) => a.fecha === '2026-11-11' && a.momento === 'manana')).toBeUndefined()
    const conTiempo = new Date(el11(7).getTime() - MARGEN_MS)
    expect(planDeAvisos({ ...BASE, ahora: conTiempo })[0]).toMatchObject({
      fecha: '2026-11-11',
      momento: 'manana',
    })
  })
})

describe('si ya pasaste por ese momento, ese día no llega (DP-22.6)', () => {
  it('la mañana cerrada hoy no se programa; la noche de hoy y la mañana de mañana, sí', () => {
    const plan = planDeAvisos({
      ...BASE,
      ahora: el11(6),
      cerrados: [{ fecha: '2026-11-11', momento: 'manana' }],
    })
    expect(plan[0]).toMatchObject({ momento: 'noche', fecha: '2026-11-11' })
    expect(plan[1]).toMatchObject({ momento: 'manana', fecha: '2026-11-12' })
  })

  it('cerrar la noche no quita la mañana', () => {
    const plan = planDeAvisos({
      ...BASE,
      ahora: el11(6),
      cerrados: [{ fecha: '2026-11-11', momento: 'noche' }],
    })
    expect(plan.filter((a) => a.fecha === '2026-11-11').map((a) => a.momento)).toEqual(['manana'])
  })
})

describe('sin nada que avisar, lista vacía', () => {
  it('con el interruptor apagado', () => {
    expect(planDeAvisos({ ...BASE, encendidos: false, ahora: el11(6) })).toEqual([])
  })

  it('sin ninguna hora', () => {
    expect(planDeAvisos({ ...BASE, despertar: null, dormir: '', ahora: el11(6) })).toEqual([])
  })

  it('con una sola hora, solo ese momento', () => {
    const plan = planDeAvisos({ ...BASE, dormir: null, ahora: el11(6) })
    expect(new Set(plan.map((a) => a.momento))).toEqual(new Set(['manana']))
  })

  it('una hora que no es una hora no se programa', () => {
    expect(planDeAvisos({ ...BASE, despertar: '25:00', dormir: 'tarde', ahora: el11(6) })).toEqual(
      [],
    )
  })
})

describe('el día al que pertenece cada aviso lo dice strivoDateKey', () => {
  it('una noche a las 00:30 con el día terminando a las 03:00 es la del día anterior', () => {
    const plan = planDeAvisos({
      ...BASE,
      dormir: '00:30',
      diaTerminaA: '03:00',
      ahora: el11(20),
    })
    const noche = plan.find((a) => a.momento === 'noche')
    // Llega el 12 a las 00:30 de reloj, y es la noche del 11.
    expect(noche.on).toMatchObject({ day: 12, hour: 0, minute: 30 })
    expect(noche.fecha).toBe('2026-11-11')
  })

  it('y si esa noche ya se cerró, no llega', () => {
    const plan = planDeAvisos({
      ...BASE,
      dormir: '00:30',
      diaTerminaA: '03:00',
      ahora: el11(20),
      cerrados: [{ fecha: '2026-11-11', momento: 'noche' }],
    })
    expect(plan.find((a) => a.momento === 'noche' && a.fecha === '2026-11-11')).toBeUndefined()
  })

  it('pasada la medianoche, la de esta noche todavía se programa (desde ayer)', () => {
    // A las 00:10 del 12, con corte a las 03:00, la noche del 11 llega a las 00:30.
    const plan = planDeAvisos({
      ...BASE,
      dormir: '00:30',
      diaTerminaA: '03:00',
      ahora: new Date(2026, 10, 12, 0, 10),
    })
    expect(plan[0]).toMatchObject({ momento: 'noche', fecha: '2026-11-11' })
  })
})

describe('la hora de pared, sea cual sea la zona horaria', () => {
  for (const zona of ['America/Monterrey', 'America/Bogota', 'Europe/Madrid', 'Asia/Tokyo']) {
    it(`en ${zona}, las 07:00 son las 07:00`, () => {
      process.env.TZ = zona
      const ahora = new Date(2026, 10, 11, 6, 0)
      const plan = planDeAvisos({ ...BASE, ahora })
      for (const aviso of plan) {
        expect(aviso.on.hour).toBe(aviso.momento === 'manana' ? 7 : 23)
        expect(aviso.on.minute).toBe(0)
      }
      expect(plan[0].on).toMatchObject({ year: 2026, month: 11, day: 11 })
    })
  }
})

describe('la ventana', () => {
  it('catorce días son como mucho veintiocho avisos', () => {
    expect(DIAS_DE_VENTANA).toBe(14)
    for (const hora of [0, 6, 7, 12, 22, 23]) {
      const plan = planDeAvisos({ ...BASE, ahora: el11(hora) })
      expect(plan.length).toBeLessThanOrEqual(28)
      expect(plan.length).toBeGreaterThanOrEqual(26)
    }
  })

  it('nada más allá de catorce días', () => {
    const ahora = el11(6)
    const plan = planDeAvisos({ ...BASE, ahora })
    const limite = ahora.getTime() + 14 * 24 * 60 * 60 * 1000
    expect(plan.every((a) => a.cuando < limite)).toBe(true)
  })
})

describe('los identificadores', () => {
  it('YYYYMMDD × 10 + 1 mañana | 2 noche', () => {
    expect(idDeAviso('2026-11-11', 'manana')).toBe(202611111)
    expect(idDeAviso('2026-11-11', 'noche')).toBe(202611112)
  })

  it('caben en 32 bits', () => {
    expect(idDeAviso('2147-12-31', 'noche')).toBeLessThan(2 ** 31)
  })

  it('únicos y estables: dos planes iguales dan los mismos números, sin repetir', () => {
    const uno = planDeAvisos({ ...BASE, ahora: el11(6) }).map((a) => a.id)
    const otro = planDeAvisos({ ...BASE, ahora: el11(6) }).map((a) => a.id)
    expect(otro).toEqual(uno)
    expect(new Set(uno).size).toBe(uno.length)
  })

  it('una fecha o un momento que no lo son no dan número', () => {
    expect(idDeAviso('11/11/2026', 'manana')).toBeNull()
    expect(idDeAviso('2026-11-11', 'tarde')).toBeNull()
  })
})

describe('el próximo de cada momento, entre lo programado de verdad', () => {
  it('el más cercano en el futuro, por momento', () => {
    const ahora = el11(8)
    const pendientes = planDeAvisos({ ...BASE, ahora: el11(6) }).map((a) => ({
      id: a.id,
      schedule: { on: a.on },
      extra: { strivo: true, momento: a.momento, fecha: a.fecha },
    }))
    const proximos = proximosPorMomento(pendientes, ahora)
    expect(proximos.manana).toEqual(new Date(2026, 10, 12, 7, 0))
    expect(proximos.noche).toEqual(el11(23))
  })

  it('sin nada programado, ninguno', () => {
    expect(proximosPorMomento([], el11(8))).toEqual({ manana: null, noche: null })
  })

  it('instanteDe vuelve de los componentes a un instante local', () => {
    expect(instanteDe({ year: 2026, month: 11, day: 11, hour: 7, minute: 0 })).toEqual(el11(7))
    expect(instanteDe(null)).toBeNull()
  })
})
