// tests/db.test.js
// El almacén local (§7.2, RN-02). Es la base de todo lo demás: si esto miente,
// mienten los rituales y las vistas.

import { describe, it, expect } from 'vitest'
import {
  saveHabit,
  markHabit,
  unmarkHabit,
  getHabitLog,
  getHabitLogsByDate,
  getDailyEntry,
  updateDailyEntry,
  getVictoriesByDate,
  saveVictory,
  getActiveHabitsForMoment,
  getPendingSyncItems,
} from '@lib/db'
import { filasDe, fila, habitoDePrueba, victoriaDePrueba } from './helpers/db.js'

const HOY = '2026-08-05'

describe('marcar hábitos', () => {
  it('crea una fila al marcar y la borra al desmarcar', async () => {
    await saveHabit(habitoDePrueba())

    await markHabit('h-agua', 'u1', HOY)
    expect(await getHabitLog('h-agua', HOY)).toMatchObject({ habitId: 'h-agua', fecha: HOY })

    await unmarkHabit('h-agua', HOY)
    expect(await getHabitLog('h-agua', HOY)).toBeNull()
  })

  it('nunca escribe una fila de "no hecho": la ausencia es ausencia', async () => {
    await saveHabit(habitoDePrueba())
    await markHabit('h-agua', 'u1', HOY)
    await unmarkHabit('h-agua', HOY)

    expect(await filasDe('habitLogs')).toHaveLength(0)
  })

  it('marcar dos veces el mismo día no duplica ni infla el contador', async () => {
    await saveHabit(habitoDePrueba())

    await markHabit('h-agua', 'u1', HOY)
    await markHabit('h-agua', 'u1', HOY)

    expect(await getHabitLogsByDate('u1', HOY)).toHaveLength(1)
    expect((await fila('habits', 'h-agua')).totalCompletados).toBe(1)
  })

  it('el contador sube con cada día nuevo', async () => {
    await saveHabit(habitoDePrueba())

    await markHabit('h-agua', 'u1', '2026-08-04')
    await markHabit('h-agua', 'u1', HOY)

    expect((await fila('habits', 'h-agua')).totalCompletados).toBe(2)
  })

  // Antes el contador solo crecía, y marcar por error y desmarcar lo dejaba una
  // unidad alto para siempre. Peor: marcar, desmarcar y volver a marcar el
  // mismo día sumaba dos. Era una de las vías del ×5 de §26, así que desmarcar
  // devuelve el contador a donde estaba.
  //
  // Esto no toca la Constancia, que cuenta días con actividad en `dailyEntries`
  // y nunca se reinicia (RN-06).
  it('desmarcar devuelve el contador a donde estaba', async () => {
    await saveHabit(habitoDePrueba())

    await markHabit('h-agua', 'u1', HOY)
    await unmarkHabit('h-agua', HOY)

    expect((await fila('habits', 'h-agua')).totalCompletados).toBe(0)
  })
})

describe('proyección de hábitos a los rituales', () => {
  it('devuelve solo los activos del momento y del día pedido', async () => {
    await saveHabit(habitoDePrueba({ id: 'manana', momento: 'manana' }))
    await saveHabit(habitoDePrueba({ id: 'noche', momento: 'noche' }))
    await saveHabit(habitoDePrueba({ id: 'pausado', momento: 'manana', estado: 'pausado' }))
    await saveHabit(habitoDePrueba({ id: 'otro-dia', momento: 'manana', diasSemana: [] }))

    const deManana = await getActiveHabitsForMoment('u1', 'manana', 2)
    expect(deManana.map(h => h.id)).toEqual(['manana'])
  })

  it('un hábito pausado conserva su historial', async () => {
    await saveHabit(habitoDePrueba())
    await markHabit('h-agua', 'u1', HOY)
    await saveHabit({ ...habitoDePrueba(), estado: 'pausado', totalCompletados: 1 })

    expect(await getHabitLogsByDate('u1', HOY)).toHaveLength(1)
  })
})

describe('entrada del día', () => {
  it('crea la entrada si no existe', async () => {
    await updateDailyEntry('u1', HOY, { intencion: 'Con calma' })

    expect(await getDailyEntry('u1', HOY)).toMatchObject({
      userId: 'u1',
      fecha: HOY,
      intencion: 'Con calma',
    })
  })

  it('cada bloque parchea sin pisar lo que escribieron los demás', async () => {
    await updateDailyEntry('u1', HOY, { intencion: 'Con calma' })
    await updateDailyEntry('u1', HOY, { agradecimientos: ['Mi familia'] })
    await updateDailyEntry('u1', HOY, { animoCierre: 'tranquilo' })

    const entrada = await getDailyEntry('u1', HOY)
    expect(entrada).toMatchObject({
      intencion: 'Con calma',
      agradecimientos: ['Mi familia'],
      animoCierre: 'tranquilo',
    })
    expect(await filasDe('dailyEntries')).toHaveLength(1)
  })

  it('cada usuario y cada fecha tienen la suya', async () => {
    await updateDailyEntry('u1', HOY, { intencion: 'a' })
    await updateDailyEntry('u1', '2026-08-06', { intencion: 'b' })
    await updateDailyEntry('u2', HOY, { intencion: 'c' })

    expect((await getDailyEntry('u1', HOY)).intencion).toBe('a')
    expect((await getDailyEntry('u1', '2026-08-06')).intencion).toBe('b')
    expect((await getDailyEntry('u2', HOY)).intencion).toBe('c')
  })
})

describe('victorias', () => {
  it('se leen por usuario y fecha', async () => {
    await saveVictory(victoriaDePrueba())
    await saveVictory(victoriaDePrueba({ id: 'v2', fecha: '2026-08-06' }))

    const deHoy = await getVictoriesByDate('u1', HOY)
    expect(deHoy.map(v => v.id)).toEqual(['v1'])
  })
})

describe('cola de sincronización', () => {
  it('encola cada cambio local para subirlo después (RN-02)', async () => {
    await saveHabit(habitoDePrueba())
    await markHabit('h-agua', 'u1', HOY)

    const pendientes = await getPendingSyncItems()
    const colecciones = pendientes.map(p => p.collection)

    expect(colecciones).toContain('habits')
    expect(colecciones).toContain('habitLogs')
    expect(pendientes.every(p => p.status === 'pending')).toBe(true)
  })
})
