// tests/conteoHabitos.test.js
// La corrección del conteo (§26) y, sobre todo, lo que no puede romper: la
// constancia acumulada.

import { describe, it, expect } from 'vitest'
import { openDB } from 'idb'
import {
  upgradeSchema,
  saveHabit,
  markHabit,
  unmarkHabit,
  getHabit,
  getHabitLog,
  getConstancia,
  updateDailyEntry,
} from '@lib/db'
import { filasDe, habitoDePrueba } from './helpers/db.js'

const HOY = '2026-08-07'

describe('Marcar es un interruptor, no un contador (§26.3)', () => {
  it('diez toques seguidos dejan una sola marca y un solo ×1', async () => {
    await saveHabit(habitoDePrueba({ id: 'h1' }))

    for (let i = 0; i < 10; i += 1) await markHabit('h1', 'u1', HOY)

    expect(await filasDe('habitLogs')).toHaveLength(1)
    expect((await getHabit('h1')).totalCompletados).toBe(1)
  })

  it('diez toques a la vez tampoco inflan el contador', async () => {
    // El error original: dos escrituras en paralelo leían las dos "todavía no
    // está marcado" y sumaban las dos. La fila seguía siendo una y el contador
    // iba por ×5.
    await saveHabit(habitoDePrueba({ id: 'h1' }))

    await Promise.all(
      Array.from({ length: 10 }, () => markHabit('h1', 'u1', HOY))
    )

    expect(await filasDe('habitLogs')).toHaveLength(1)
    expect((await getHabit('h1')).totalCompletados).toBe(1)
  })

  it('marcar, desmarcar y volver a marcar nunca llega a ×2', async () => {
    await saveHabit(habitoDePrueba({ id: 'h1' }))

    await markHabit('h1', 'u1', HOY)
    await unmarkHabit('h1', HOY)
    await markHabit('h1', 'u1', HOY)

    expect(await filasDe('habitLogs')).toHaveLength(1)
    expect((await getHabit('h1')).totalCompletados).toBe(1)
  })

  it('desmarcar deja el día sin marca y el contador en su sitio', async () => {
    await saveHabit(habitoDePrueba({ id: 'h1' }))

    await markHabit('h1', 'u1', '2026-08-05')
    await markHabit('h1', 'u1', '2026-08-06')
    await unmarkHabit('h1', '2026-08-06')

    expect(await getHabitLog('h1', '2026-08-06')).toBeNull()
    expect(await getHabitLog('h1', '2026-08-05')).not.toBeNull()
    // Un día menos, no todos: lo de los días anteriores no se toca
    expect((await getHabit('h1')).totalCompletados).toBe(1)
  })

  it('el contador nunca baja de cero', async () => {
    await saveHabit(habitoDePrueba({ id: 'h1', totalCompletados: 0 }))

    await markHabit('h1', 'u1', HOY)
    await unmarkHabit('h1', HOY)
    await unmarkHabit('h1', HOY)

    expect((await getHabit('h1')).totalCompletados).toBe(0)
  })

  it('días distintos sí suman', async () => {
    await saveHabit(habitoDePrueba({ id: 'h1' }))

    await markHabit('h1', 'u1', '2026-08-05')
    await markHabit('h1', 'u1', '2026-08-06')
    await markHabit('h1', 'u1', '2026-08-07')

    expect(await filasDe('habitLogs')).toHaveLength(3)
    expect((await getHabit('h1')).totalCompletados).toBe(3)
  })
})

describe('La constancia no se toca (§26.4)', () => {
  it('cuenta días con actividad, no marcas de hábito', async () => {
    await saveHabit(habitoDePrueba({ id: 'h1' }))
    await updateDailyEntry('u1', '2026-08-05', { animo: 'tranquilo' })
    await updateDailyEntry('u1', '2026-08-06', { animo: 'tranquilo' })

    // Diez toques en un mismo día no inventan diez días de constancia
    for (let i = 0; i < 10; i += 1) await markHabit('h1', 'u1', '2026-08-06')

    expect(await getConstancia('u1')).toBe(2)
  })

  it('desmarcar un hábito de hoy no reinicia la constancia acumulada', async () => {
    await saveHabit(habitoDePrueba({ id: 'h1' }))
    for (const fecha of ['2026-08-01', '2026-08-02', '2026-08-03']) {
      await updateDailyEntry('u1', fecha, { animo: 'tranquilo' })
    }
    await markHabit('h1', 'u1', '2026-08-03')

    const antes = await getConstancia('u1')
    await unmarkHabit('h1', '2026-08-03')

    expect(await getConstancia('u1')).toBe(antes)
    expect(antes).toBe(3)
  })
})

describe('Migración a v5: deduplicar y rehacer el contador (§26.3)', () => {
  const NOMBRE = 'strivo-migracion-conteo'

  it('conserva la primera marca de cada día y recalcula el contador', async () => {
    const v4 = await openDB(NOMBRE, 4, {
      upgrade(db) {
        const hl = db.createObjectStore('habitLogs', { keyPath: 'id' })
        hl.createIndex('byHabitDate', ['habitId', 'fecha'])
        hl.createIndex('byUserDate', ['userId', 'fecha'])
        const h = db.createObjectStore('habits', { keyPath: 'id' })
        h.createIndex('byUser', 'userId')
        const de = db.createObjectStore('dailyEntries', { keyPath: 'id' })
        de.createIndex('byUserDate', ['userId', 'fecha'])
      },
    })

    // Un hábito con el contador inflado por el error, dos días registrados y
    // una marca duplicada que podría haber llegado de la sincronización
    await v4.put('habits', { id: 'h1', userId: 'u1', nombre: 'Beber agua', totalCompletados: 7 })
    await v4.put('habitLogs', { id: 'h1_2026-08-05', habitId: 'h1', userId: 'u1', fecha: '2026-08-05', hora: '1' })
    await v4.put('habitLogs', { id: 'h1_2026-08-06', habitId: 'h1', userId: 'u1', fecha: '2026-08-06', hora: '2' })
    await v4.put('habitLogs', { id: 'otro_id_mismo_dia', habitId: 'h1', userId: 'u1', fecha: '2026-08-06', hora: '3' })
    await v4.put('dailyEntries', { id: 'u1_2026-08-05', userId: 'u1', fecha: '2026-08-05' })
    await v4.put('dailyEntries', { id: 'u1_2026-08-06', userId: 'u1', fecha: '2026-08-06' })
    v4.close()

    const v5 = await openDB(NOMBRE, 5, { upgrade: upgradeSchema })
    const logs   = await v5.getAll('habitLogs')
    const habito = await v5.get('habits', 'h1')
    const dias   = await v5.getAll('dailyEntries')
    v5.close()

    // La duplicada se va y se conserva la primera
    expect(logs).toHaveLength(2)
    expect(logs.map(l => l.id)).toContain('h1_2026-08-06')
    expect(logs.map(l => l.id)).not.toContain('otro_id_mismo_dia')

    // El contador deja de ir por ×7: son dos días
    expect(habito.totalCompletados).toBe(2)

    // Y lo que sostiene la constancia sigue intacto: ninguna en cero
    expect(dias).toHaveLength(2)
  })
})
