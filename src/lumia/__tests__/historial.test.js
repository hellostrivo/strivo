// src/lumia/__tests__/historial.test.js
// El Historial (§5.10) y el alcance de la vista de día completo (§C7.7.2).

import { beforeEach, describe, expect, it } from 'vitest'

import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { lumia } from '@/lib/db'
import {
  ANIMOS,
  cargarDia,
  cargarMes,
  diaVacio,
  diasDelMes,
  huecoInicial,
  mesDe,
  nombreDelMes,
  numeroDeDia,
  sumarMeses,
} from '../historial.js'
import { entradaNueva, guardar } from '../journal.js'

const AGOSTO = { year: 2026, month: 8 }

beforeEach(async () => {
  await resetLocalDB()
})

describe('la retícula del mes', () => {
  it('agosto tiene 31 días y febrero de año bisiesto, 29', () => {
    expect(diasDelMes(AGOSTO)).toHaveLength(31)
    expect(diasDelMes({ year: 2028, month: 2 })).toHaveLength(29)
  })

  it('cada día cae en su columna', () => {
    // 1 de agosto de 2026 es sábado: cinco huecos con la semana en lunes.
    expect(huecoInicial(AGOSTO)).toBe(5)
  })

  it('navegar de mes cruza el cambio de año sin romperse', () => {
    expect(sumarMeses({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
    expect(sumarMeses({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
  })

  it('lee el mes de una fecha y lo nombra', () => {
    expect(mesDe('2026-08-10')).toEqual(AGOSTO)
    expect(nombreDelMes(AGOSTO)).toMatch(/agosto/i)
    expect(numeroDeDia('2026-08-10')).toBe(10)
  })
})

describe('puntos de ánimo (§5.10 · §6.3.5)', () => {
  it('un día sin registro no tiene punto: la ausencia no se dibuja', async () => {
    const dias = await cargarMes(UID, AGOSTO)
    expect(dias.every((dia) => dia.animo === null)).toBe(true)
    expect(dias.every((dia) => dia.hayContenido === false)).toBe(true)
  })

  it('el punto sale del estado de sueño, derivado al vuelo', async () => {
    await lumia.saveNightRitual(UID, '2026-08-10', { sleepState: ['en_paz'] })
    const dias = await cargarMes(UID, AGOSTO)
    expect(dias.find((dia) => dia.fecha === '2026-08-10').animo).toBe('en_paz')
  })

  it('con dos estados gana el más pesado: la app no maquilla el día', async () => {
    await lumia.saveNightRitual(UID, '2026-08-10', { sleepState: ['agradecido', 'cansado'] })
    const dias = await cargarMes(UID, AGOSTO)
    expect(dias.find((dia) => dia.fecha === '2026-08-10').animo).toBe('agotado')
  })

  it('un día con algo escrito pero sin estado de sueño se marca en normal', async () => {
    await guardar(UID, { ...entradaNueva('2026-08-11'), text: 'Escribí sin cerrar el día' })
    const dias = await cargarMes(UID, AGOSTO)
    const dia = dias.find((entrada) => entrada.fecha === '2026-08-11')
    expect(dia.hayContenido).toBe(true)
    expect(dia.animo).toBe('normal')
  })

  it('todo ánimo que se pinta está en la paleta de cinco', async () => {
    await lumia.saveNightRitual(UID, '2026-08-10', { sleepState: ['inquieto'] })
    const dias = await cargarMes(UID, AGOSTO)
    dias
      .filter((dia) => dia.animo !== null)
      .forEach((dia) => expect(ANIMOS).toContain(dia.animo))
  })

  it('el ánimo no se persiste: `dayState` sigue sin escribirse (§5.4.1)', async () => {
    await lumia.saveNightRitual(UID, '2026-08-10', { sleepState: ['en_paz'] })
    await cargarMes(UID, AGOSTO)
    expect(await lumia.getDayState(UID, '2026-08-10')).toBeNull()
  })
})

describe('vista de día completo: solo Lumia (§C7.7.2)', () => {
  it('trae mañana, noche, victorias y journal', async () => {
    await lumia.saveMorningEntry(UID, '2026-08-10', { gratitude: ['el café'] })
    await lumia.saveNightRitual(UID, '2026-08-10', { learning: 'Que se puede pedir ayuda' })
    await lumia.createVictory(UID, { text: 'Salir a caminar', date: '2026-08-10', state: 'lograda' })
    await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Hoy escribí' })

    const dia = await cargarDia(UID, '2026-08-10')
    expect(dia.morning.gratitude).toEqual(['el café'])
    expect(dia.night.learning).toBe('Que se puede pedir ayuda')
    expect(dia.victorias).toHaveLength(1)
    expect(dia.journal).toHaveLength(1)
  })

  it('lo devuelto no tiene ni un campo de hábitos', async () => {
    await lumia.saveNightRitual(UID, '2026-08-10', { gratitude: ['algo'] })
    const dia = await cargarDia(UID, '2026-08-10')
    expect(Object.keys(dia).sort()).toEqual(['fecha', 'journal', 'morning', 'night', 'victorias'])
    expect(JSON.stringify(dia)).not.toMatch(/habit/i)
  })

  it('una victoria soltada no reaparece en el día', async () => {
    await lumia.createVictory(UID, { text: 'Llamar', date: '2026-08-10', state: 'soltada' })
    expect((await cargarDia(UID, '2026-08-10')).victorias).toHaveLength(0)
  })

  it('un día en blanco se reconoce como tal, sin llamarlo perdido', async () => {
    expect(diaVacio(await cargarDia(UID, '2026-08-10'))).toBe(true)
  })
})

describe('con PIN puesto, el journal no se lee desde aquí (RN-JR-PIN-01)', () => {
  it('las entradas no se cargan, no solo no se pintan', async () => {
    await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Algo que no le contaría a nadie' })

    const conPin = await cargarDia(UID, '2026-08-10', { conJournal: false })
    expect(conPin.journal).toEqual([])
    expect(JSON.stringify(conPin)).not.toContain('no le contaría')
  })

  it('el resto del día se sigue viendo entero', async () => {
    await lumia.saveNightRitual(UID, '2026-08-10', { gratitude: ['el café'] })
    await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Privado' })

    const conPin = await cargarDia(UID, '2026-08-10', { conJournal: false })
    expect(conPin.night.gratitude).toEqual(['el café'])
    expect(conPin.journal).toEqual([])
  })
})
