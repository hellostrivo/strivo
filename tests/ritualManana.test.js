// tests/ritualManana.test.js
// El Ritual de Mañana (§5.5): qué lee al abrirse y qué deja escrito.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { saveHabit, saveUserProfile, saveArea, markHabit, updateDailyEntry } from '@lib/db'
import {
  loadRitualManana,
  guardarIntencion,
  completarRitualManana,
  ritualMananaHecho,
  elegirAreaDelDia,
} from '@lib/ritualManana'
import { getDailyEntry } from '@lib/db'
import { habitoDePrueba } from './helpers/db.js'

const UN_MIERCOLES = new Date(2026, 7, 5, 7, 30)   // 5 ago 2026, 07:30
const HOY  = '2026-08-05'
const AYER = '2026-08-04'

// Solo se congela la fecha: los temporizadores reales los necesita IndexedDB
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UN_MIERCOLES)
})
afterEach(() => vi.useRealTimers())

const perfil = (extra = {}) => ({
  userId: 'u1',
  nombre: 'Alejandra',
  identidadCentral: 'crece cada día',
  horaDespertar: '06:45',
  horaDormir: '22:30',
  diaTerminaA: '03:00',
  ...extra,
})

// getCurrentUserId() devuelve el id local mientras no haya cuenta; las pruebas
// escriben con ese mismo id para que el ritual encuentre lo suyo.
async function conUsuario() {
  const { getCurrentUserId } = await import('@lib/user')
  return getCurrentUserId()
}

describe('abrir el ritual', () => {
  it('trae los hábitos de la mañana de hoy y lo ya marcado', async () => {
    const userId = await conUsuario()
    await saveUserProfile(perfil({ userId }))
    await saveHabit(habitoDePrueba({ id: 'h1', userId, momento: 'manana' }))
    await saveHabit(habitoDePrueba({ id: 'h2', userId, momento: 'manana', nombre: 'Estirar' }))
    await saveHabit(habitoDePrueba({ id: 'h3', userId, momento: 'noche' }))
    await markHabit('h1', userId, HOY)

    const datos = await loadRitualManana()

    expect(datos.fecha).toBe(HOY)
    expect(datos.habitos.map(h => h.id).sort()).toEqual(['h1', 'h2'])
    expect(datos.hechos.has('h1')).toBe(true)
    expect(datos.hechos.has('h2')).toBe(false)
    expect(datos.perfil.identidadCentral).toBe('crece cada día')
  })

  it('saluda distinto si ayer se cerró el día cansado', async () => {
    const userId = await conUsuario()
    await saveUserProfile(perfil({ userId }))
    await updateDailyEntry(userId, AYER, { animoCierre: 'cansado' })

    expect((await loadRitualManana()).diaDificil).toBe(true)
  })

  it('un cierre tranquilo no activa el día difícil', async () => {
    const userId = await conUsuario()
    await saveUserProfile(perfil({ userId }))
    await updateDailyEntry(userId, AYER, { animoCierre: 'tranquilo' })

    expect((await loadRitualManana()).diaDificil).toBe(false)
  })

  it('sin nada de ayer, tampoco', async () => {
    await saveUserProfile(perfil({ userId: await conUsuario() }))
    expect((await loadRitualManana()).diaDificil).toBe(false)
  })

  it('recupera la intención ya escrita hoy', async () => {
    const userId = await conUsuario()
    await saveUserProfile(perfil({ userId }))
    await guardarIntencion(userId, HOY, 'Con calma')

    expect((await loadRitualManana()).intencion).toBe('Con calma')
  })
})

describe('cerrar el ritual', () => {
  it('lo completa aunque no se haya marcado ningún hábito (RN-03)', async () => {
    const userId = await conUsuario()
    await saveHabit(habitoDePrueba({ userId }))

    await completarRitualManana(userId, HOY, 'Con calma')

    const entrada = await getDailyEntry(userId, HOY)
    expect(ritualMananaHecho(entrada)).toBe(true)
    expect(entrada.intencion).toBe('Con calma')
  })

  it('salir por la ruta express no borra la intención ya guardada', async () => {
    const userId = await conUsuario()
    await guardarIntencion(userId, HOY, 'Con calma')

    // La ruta express cierra sin pasar por R5: no manda intención
    await completarRitualManana(userId, HOY, undefined)

    const entrada = await getDailyEntry(userId, HOY)
    expect(entrada.intencion).toBe('Con calma')
    expect(ritualMananaHecho(entrada)).toBe(true)
  })
})

describe('el área del día (R3)', () => {
  const areas = [
    { id: 'a-salud',   tipo: 'salud',   nombre: 'Salud',   estado: 'activa' },
    { id: 'a-trabajo', tipo: 'trabajo', nombre: 'Trabajo', estado: 'activa' },
  ]

  it('gana el área con más hábitos de hoy', () => {
    const habitos = [
      { areaId: 'a-salud' }, { areaId: 'a-salud' }, { areaId: 'a-trabajo' },
    ]
    expect(elegirAreaDelDia(areas, habitos, HOY).tipo).toBe('salud')
  })

  it('en empate elige una de las empatadas, siempre la misma ese día', () => {
    const habitos = [{ areaId: 'a-salud' }, { areaId: 'a-trabajo' }]
    const primera = elegirAreaDelDia(areas, habitos, HOY)

    expect(['salud', 'trabajo']).toContain(primera.tipo)
    expect(elegirAreaDelDia(areas, habitos, HOY).tipo).toBe(primera.tipo)
  })

  it('sin hábitos rota, y la rotación cambia de un día a otro', () => {
    const hoy    = elegirAreaDelDia(areas, [], HOY)
    const manana = elegirAreaDelDia(areas, [], '2026-08-06')

    expect(hoy).toBeTruthy()
    expect(manana.tipo).not.toBe(hoy.tipo)
  })

  it('las áreas pausadas o archivadas no salen', () => {
    const pausadas = [
      { id: 'a1', tipo: 'salud',   estado: 'pausada' },
      { id: 'a2', tipo: 'trabajo', estado: 'archivada' },
    ]
    expect(elegirAreaDelDia(pausadas, [], HOY)).toBeNull()
  })

  it('sin áreas no hay área del día', () => {
    expect(elegirAreaDelDia([], [], HOY)).toBeNull()
  })
})
