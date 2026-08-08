// tests/historial.test.js
// Historial (§5.10): el calendario de ánimo y la vista de un día completo.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { copy } from '@copy'
import { colors } from '@tokens'
import { updateDailyEntry, saveVictory, saveHabit, markHabit } from '@lib/db'
import {
  loadMes,
  loadDia,
  colorDeAnimo,
  tieneRegistro,
  nombreDeEstado,
  COLOR_DE_ANIMO,
} from '@lib/historial'
import { ANIMOS } from '@lib/animos'
import { guardarEntrada, entradaNueva } from '@lib/journal'
import { getCurrentUserId } from '@lib/user'
import { rejillaDelMes, fechaConDiaSemana, mesEnPalabras, mesAnterior, mesSiguiente } from '@lib/fechas'
import { habitoDePrueba, victoriaDePrueba } from './helpers/db.js'

const UN_MIERCOLES = new Date(2026, 7, 5, 20, 0)
const HOY = '2026-08-05'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UN_MIERCOLES)
})
afterEach(() => vi.useRealTimers())

describe('colores de ánimo', () => {
  it('los cinco estados del cierre tienen color y nombre', () => {
    for (const { id } of ANIMOS) {
      expect(COLOR_DE_ANIMO[id], id).toBeTruthy()
      expect(copy.ritualNoche.n6.states[id], id).toBeTruthy()
    }
  })

  // El catálogo y el copy se leen por el mismo id: si uno gana una entrada que
  // el otro no tiene, el chip se queda sin nombre o el punto sin color.
  it('el catálogo y el copy nombran exactamente los mismos estados', () => {
    expect(ANIMOS.map(a => a.id).sort())
      .toEqual(Object.keys(copy.ritualNoche.n6.states).sort())
  })

  it('ninguno es rojo, ni siquiera el clay que el sistema usa para errores', () => {
    const usados = Object.values(COLOR_DE_ANIMO)

    expect(usados).not.toContain(colors.clay)
    for (const color of usados) {
      const [, r, g, b] = color.match(/#(\w{2})(\w{2})(\w{2})/).map(v => parseInt(v, 16))
      // Rojo = mucho rojo y poco de lo demás. Ninguno de la paleta lo es.
      expect(r > 200 && g < 120 && b < 120).toBe(false)
    }
  })

  it('un día registrado sin ánimo también tiene su punto', () => {
    expect(colorDeAnimo(null)).toBeTruthy()
    expect(colorDeAnimo('Inventado')).toBe(colorDeAnimo(null))
  })
})

describe('¿quedó algo del día?', () => {
  it('cualquier cosa cuenta', () => {
    expect(tieneRegistro({ intencion: 'Con calma' })).toBe(true)
    expect(tieneRegistro({ animoCierre: 'tranquilo' })).toBe(true)
    expect(tieneRegistro({ agradecimientos: ['Mi familia'] })).toBe(true)
    expect(tieneRegistro({ emociones: ['tranquilo'] })).toBe(true)
    expect(tieneRegistro({ ritualMananaCompletadoEn: '2026-08-05T07:00:00Z' })).toBe(true)
  })

  it('lo vacío no cuenta', () => {
    expect(tieneRegistro(null)).toBe(false)
    expect(tieneRegistro({})).toBe(false)
    expect(tieneRegistro({ intencion: '', agradecimientos: ['  ', ''] })).toBe(false)
  })
})

describe('el mes del calendario', () => {
  it('solo trae los días con algo, con su color', async () => {
    const userId = getCurrentUserId()
    await updateDailyEntry(userId, '2026-08-03', { animoCierre: 'tranquilo' })
    await updateDailyEntry(userId, '2026-08-04', { animoCierre: 'inquieto' })
    await updateDailyEntry(userId, '2026-08-10', { intencion: '' })   // vacío: no cuenta

    const dias = await loadMes(userId, 2026, 8)

    expect([...dias.keys()].sort()).toEqual(['2026-08-03', '2026-08-04'])
    expect(dias.get('2026-08-03').color).toBe(colors.sage)
    expect(dias.get('2026-08-04').color).toBe(colors.amber)
  })

  it('un día en el que solo se escribió una victoria también estuvo', async () => {
    const userId = getCurrentUserId()
    await saveVictory(victoriaDePrueba({ userId, fecha: '2026-08-07' }))

    const dias = await loadMes(userId, 2026, 8)
    expect(dias.has('2026-08-07')).toBe(true)
    expect(dias.get('2026-08-07').animo).toEqual([])
  })

  it('no se cuela nada de otros meses', async () => {
    const userId = getCurrentUserId()
    await updateDailyEntry(userId, '2026-07-31', { animoCierre: 'tranquilo' })
    await updateDailyEntry(userId, '2026-08-01', { animoCierre: 'tranquilo' })
    await updateDailyEntry(userId, '2026-09-01', { animoCierre: 'tranquilo' })

    const dias = await loadMes(userId, 2026, 8)
    expect([...dias.keys()]).toEqual(['2026-08-01'])
  })

  it('un mes sin nada devuelve un calendario vacío, no un error', async () => {
    expect((await loadMes(getCurrentUserId(), 2025, 1)).size).toBe(0)
  })
})

describe('la vista de un día', () => {
  it('reúne todo lo que quedó de ese día', async () => {
    const userId = getCurrentUserId()

    await updateDailyEntry(userId, HOY, {
      intencion: 'Con calma',
      emociones: ['tranquilo', 'enfocado'],
      emocionesNecesito: 'Dormir bien',
      granDia: 'Sin prisas',
      agradecimientos: ['Mi familia', '   '],
      aprendizaje: 'Pedir ayuda antes',
      animoCierre: 'tranquilo',
    })
    await saveVictory(victoriaDePrueba({ userId, fecha: HOY, estado: 'lograda' }))
    await saveHabit(habitoDePrueba({ id: 'h1', userId }))
    await markHabit('h1', userId, HOY)
    await guardarEntrada({ ...entradaNueva(userId, HOY), texto: 'Lo escribí aquí' })

    const dia = await loadDia(userId, HOY)

    expect(dia.vacio).toBe(false)
    expect(dia.intencion).toBe('Con calma')
    expect(dia.emociones).toEqual(['tranquilo', 'enfocado'])
    expect(dia.necesito).toBe('Dormir bien')
    expect(dia.granDia).toBe('Sin prisas')
    expect(dia.agradecimientos).toEqual(['Mi familia'])   // los blancos fuera
    expect(dia.aprendizaje).toBe('Pedir ayuda antes')
    expect(dia.animo).toEqual(['tranquilo'])
    expect(dia.victorias.map(v => v.estado)).toEqual(['lograda'])
    expect(dia.habitos.map(h => h.nombre)).toEqual(['Beber agua'])
    expect(dia.journal.map(e => e.texto)).toEqual(['Lo escribí aquí'])
  })

  it('solo lista los hábitos que se marcaron ese día', async () => {
    const userId = getCurrentUserId()
    await saveHabit(habitoDePrueba({ id: 'hecho', userId, nombre: 'Beber agua' }))
    await saveHabit(habitoDePrueba({ id: 'sin-marcar', userId, nombre: 'Estirar' }))
    await markHabit('hecho', userId, HOY)

    const dia = await loadDia(userId, HOY)
    expect(dia.habitos.map(h => h.nombre)).toEqual(['Beber agua'])
  })

  it('un día sin nada se resuelve en una línea', async () => {
    const dia = await loadDia(getCurrentUserId(), '2026-01-01')

    expect(dia.vacio).toBe(true)
    expect(dia.victorias).toEqual([])
    expect(dia.habitos).toEqual([])
    expect(dia.journal).toEqual([])
  })

  it('los estados de las victorias se dicen sin reproche', () => {
    expect(nombreDeEstado('no_se_dio')).toBe('No se dio')
    expect(nombreDeEstado('soltada')).toBe('La dejaste ir')
    expect(Object.values(copy.historial.victoryStates).join(' '))
      .not.toMatch(/fall|incumpl|perdi/i)
  })
})

describe('la rejilla del calendario', () => {
  it('empieza en lunes y coloca el día 1 en su columna', () => {
    // 1 de agosto de 2026 es sábado → 5 huecos antes (lu, ma, mi, ju, vi)
    const rejilla = rejillaDelMes(2026, 8)
    expect(rejilla.slice(0, 5).every(c => c === null)).toBe(true)
    expect(rejilla[5]).toBe('2026-08-01')
    expect(rejilla.filter(Boolean)).toHaveLength(31)
  })

  it('cuenta bien los meses cortos y los bisiestos', () => {
    expect(rejillaDelMes(2026, 2).filter(Boolean)).toHaveLength(28)
    expect(rejillaDelMes(2028, 2).filter(Boolean)).toHaveLength(29)
    expect(rejillaDelMes(2026, 4).filter(Boolean)).toHaveLength(30)
  })

  it('navega entre meses cruzando el año', () => {
    expect(mesAnterior(2026, 1)).toEqual({ ano: 2025, mes: 12 })
    expect(mesSiguiente(2026, 12)).toEqual({ ano: 2027, mes: 1 })
  })
})

describe('fechas en palabras', () => {
  it('dice el día de la semana y el mes', () => {
    expect(fechaConDiaSemana(HOY, 2026)).toBe('Miércoles, 5 de agosto')
  })

  it('añade el año cuando no es el actual', () => {
    expect(fechaConDiaSemana('2025-12-31', 2026)).toBe('Miércoles, 31 de diciembre de 2025')
  })

  it('nombra el mes del calendario', () => {
    expect(mesEnPalabras(2026, 8)).toBe('agosto de 2026')
  })
})
