// tests/habitosDiasYEdicion.test.js
// Los días que le tocan a un hábito, los dos momentos y la edición (§5.7).
//
// El bug: un hábito con el sábado desactivado seguía apareciendo el sábado en la
// pestaña de Hábitos. Los rituales y las vistas sí filtraban —la prueba de
// habitos.test.js lo cubría—, pero la lista los mostraba todos: era a la vez el
// checklist de hoy y el sitio donde se administran, y no distinguía.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { openDB } from 'idb'
import { copy } from '@copy'
import { upgradeSchema, getActiveHabitsForMoment, getHabitLogsByDate, markHabit } from '@lib/db'
import {
  MOMENTOS,
  agruparPorMomento,
  crearHabito,
  actualizarHabito,
  loadHabitos,
  normalizarMomento,
  leTocaHoy,
  DIAS_TODOS,
} from '@lib/habits'
import { getWeekDay } from '@lib/timeSlot'
import { getCurrentUserId } from '@lib/user'

// 5 ago 2026 es miércoles → índice 2 (0 = lunes)
const UN_MIERCOLES = new Date(2026, 7, 5, 8, 0)
const MIERCOLES = 2
const SABADO    = 5

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UN_MIERCOLES)
})
afterEach(() => vi.useRealTimers())

describe('Qué día de la semana es', () => {
  it('sin argumento, el de hoy', () => {
    expect(getWeekDay()).toBe(MIERCOLES)
  })

  it('con una fecha, la de esa fecha', () => {
    expect(getWeekDay('2026-08-08')).toBe(SABADO)
    expect(getWeekDay('2026-08-03')).toBe(0)   // lunes
    expect(getWeekDay('2026-08-09')).toBe(6)   // domingo
  })

  // El día de Strivo termina a las 03:00: a la 1:30 de un domingo todavía se
  // está cerrando el sábado, y los hábitos que tocan son los del sábado.
  it('la madrugada pertenece al día anterior, no al del reloj', () => {
    vi.setSystemTime(new Date(2026, 7, 9, 1, 30))   // domingo 01:30
    expect(getWeekDay()).toBe(6)                    // el reloj dice domingo
    expect(getWeekDay('2026-08-08')).toBe(SABADO)   // el día de Strivo, sábado
  })
})

describe('Un hábito solo aparece los días que le tocan', () => {
  const conDias = (nombre, diasSemana, momento = 'manana') =>
    crearHabito(getCurrentUserId(), { nombre, momento, diasSemana })

  it('creado excluyendo hoy, hoy no aparece', async () => {
    await conDias('Solo fines de semana', [SABADO, 6])
    const habitos = await loadHabitos(getCurrentUserId())

    const { grupos } = agruparPorMomento(habitos, MIERCOLES)
    expect(grupos.flatMap(g => g.habitos.map(h => h.nombre))).toEqual([])
  })

  it('pero no desaparece: baja a los de otros días, desde donde se abre', async () => {
    await conDias('Solo fines de semana', [SABADO, 6])
    const habitos = await loadHabitos(getCurrentUserId())

    const { otrosDias, totalActivos } = agruparPorMomento(habitos, MIERCOLES)
    expect(otrosDias.map(h => h.nombre)).toEqual(['Solo fines de semana'])
    expect(totalActivos).toBe(1)
  })

  it('en un día habilitado sí aparece', async () => {
    await conDias('Lunes, miércoles y viernes', [0, MIERCOLES, 4])
    const habitos = await loadHabitos(getCurrentUserId())

    const { grupos, otrosDias } = agruparPorMomento(habitos, MIERCOLES)
    expect(grupos.flatMap(g => g.habitos.map(h => h.nombre)))
      .toEqual(['Lunes, miércoles y viernes'])
    expect(otrosDias).toEqual([])
  })

  it('el sábado, el mismo hábito ya no aparece', async () => {
    await conDias('Lunes, miércoles y viernes', [0, MIERCOLES, 4])
    const habitos = await loadHabitos(getCurrentUserId())

    const { grupos, otrosDias } = agruparPorMomento(habitos, SABADO)
    expect(grupos).toEqual([])
    expect(otrosDias.map(h => h.nombre)).toEqual(['Lunes, miércoles y viernes'])
  })

  it('sin día, la lista los trae todos (es la vista de administración)', async () => {
    await conDias('Solo fines de semana', [SABADO, 6])
    const habitos = await loadHabitos(getCurrentUserId())

    const { grupos } = agruparPorMomento(habitos)
    expect(grupos.flatMap(g => g.habitos.map(h => h.nombre)))
      .toEqual(['Solo fines de semana'])
  })

  it('la misma regla que usan los rituales y las vistas', async () => {
    const userId = getCurrentUserId()
    await conDias('Miércoles', [MIERCOLES])

    expect(await getActiveHabitsForMoment(userId, 'manana', MIERCOLES)).toHaveLength(1)
    expect(await getActiveHabitsForMoment(userId, 'manana', SABADO)).toHaveLength(0)
  })

  it('leTocaHoy aguanta un hábito sin días bien formados', () => {
    expect(leTocaHoy({ diasSemana: undefined }, MIERCOLES)).toBe(false)
    expect(leTocaHoy({ diasSemana: [] }, MIERCOLES)).toBe(false)
  })
})

describe('Solo hay dos momentos', () => {
  it('mañana y noche, y nada más', () => {
    expect(MOMENTOS).toEqual(['manana', 'noche'])
  })

  it('el momento retirado se lee como de mañana', () => {
    expect(normalizarMomento('dia')).toBe('manana')
    expect(normalizarMomento(undefined)).toBe('manana')
    expect(normalizarMomento('inventado')).toBe('manana')
    expect(normalizarMomento('noche')).toBe('noche')
  })

  it('un hábito de mañana solo sale en mañana', async () => {
    const userId = getCurrentUserId()
    await crearHabito(userId, { nombre: 'Estirar', momento: 'manana' })

    expect(await getActiveHabitsForMoment(userId, 'manana', MIERCOLES)).toHaveLength(1)
    expect(await getActiveHabitsForMoment(userId, 'noche', MIERCOLES)).toHaveLength(0)
  })

  it('uno de noche solo sale en noche', async () => {
    const userId = getCurrentUserId()
    await crearHabito(userId, { nombre: 'Leer', momento: 'noche' })

    expect(await getActiveHabitsForMoment(userId, 'noche', MIERCOLES)).toHaveLength(1)
    expect(await getActiveHabitsForMoment(userId, 'manana', MIERCOLES)).toHaveLength(0)
  })

  it('el copy ya no nombra el momento retirado', () => {
    expect(JSON.stringify(copy)).not.toContain('A lo largo del día')
  })
})

describe('Editar un hábito que ya existe', () => {
  const unHabito = () => crearHabito(getCurrentUserId(), {
    nombre: 'Beber agua',
    momento: 'manana',
    diasSemana: DIAS_TODOS,
  })

  it('conserva el id: no nace uno nuevo', async () => {
    const original = await unHabito()
    const editado  = await actualizarHabito(original, { nombre: 'Beber más agua' })

    expect(editado.id).toBe(original.id)
    expect(await loadHabitos(getCurrentUserId())).toHaveLength(1)
  })

  it('cambiar los días manda desde ese momento', async () => {
    const original = await unHabito()
    await actualizarHabito(original, { diasSemana: [0, 4] })   // lunes y viernes

    const userId = getCurrentUserId()
    expect(await getActiveHabitsForMoment(userId, 'manana', MIERCOLES)).toHaveLength(0)
    expect(await getActiveHabitsForMoment(userId, 'manana', 0)).toHaveLength(1)
  })

  it('cambiar de mañana a noche lo mueve de sección', async () => {
    const original = await unHabito()
    await actualizarHabito(original, { momento: 'noche' })

    const userId = getCurrentUserId()
    expect(await getActiveHabitsForMoment(userId, 'manana', MIERCOLES)).toHaveLength(0)
    expect(await getActiveHabitsForMoment(userId, 'noche', MIERCOLES)).toHaveLength(1)
  })

  it('y de noche a mañana, igual', async () => {
    const userId = getCurrentUserId()
    const original = await crearHabito(userId, { nombre: 'Leer', momento: 'noche' })
    await actualizarHabito(original, { momento: 'manana' })

    expect(await getActiveHabitsForMoment(userId, 'manana', MIERCOLES)).toHaveLength(1)
  })

  // Editar no es empezar de cero: las marcas viven aparte, en habitLogs.
  it('no se pierde el histórico ni el contador', async () => {
    const userId = getCurrentUserId()
    const original = await unHabito()
    await markHabit(original.id, userId, '2026-08-05')

    const antes = await getHabitLogsByDate(userId, '2026-08-05')
    const editado = await actualizarHabito(original, { nombre: 'Otro nombre', momento: 'noche' })

    expect(await getHabitLogsByDate(userId, '2026-08-05')).toHaveLength(antes.length)
    expect(editado.totalCompletados).toBe(original.totalCompletados)
    expect(editado.creadoEn).toBe(original.creadoEn)
    expect(editado.estado).toBe('activo')
  })

  it('lo que no se toca se queda como estaba', async () => {
    const original = await unHabito()
    const editado  = await actualizarHabito(original, { nombre: 'Beber más agua' })

    expect(editado.momento).toBe(original.momento)
    expect(editado.diasSemana).toEqual(original.diasSemana)
    expect(editado.areaId).toBe(original.areaId)
  })

  it('editar uno del momento retirado lo normaliza', async () => {
    const original = await unHabito()
    const editado  = await actualizarHabito({ ...original, momento: 'dia' }, {})
    expect(editado.momento).toBe('manana')
  })
})

describe('Migración v7 del almacén local', () => {
  const NOMBRE = 'strivo-migracion-momentos'

  it('los hábitos de "a lo largo del día" pasan a la mañana, intactos', async () => {
    const v6 = await openDB(NOMBRE, 6, {
      upgrade(db) {
        const h = db.createObjectStore('habits', { keyPath: 'id' })
        h.createIndex('byUser', 'userId')
        h.createIndex('byUserArea', ['userId', 'areaId'])
      },
    })
    await v6.put('habits', {
      id: 'h1', userId: 'u1', nombre: 'Respirar', momento: 'dia',
      diasSemana: [0, 1, 2], estado: 'activo', totalCompletados: 12,
    })
    await v6.put('habits', {
      id: 'h2', userId: 'u1', nombre: 'Leer', momento: 'noche',
      diasSemana: [3], estado: 'activo', totalCompletados: 4,
    })
    v6.close()

    const v7 = await openDB(NOMBRE, 7, { upgrade: upgradeSchema })
    const uno = await v7.get('habits', 'h1')
    const dos = await v7.get('habits', 'h2')
    v7.close()

    expect(uno.momento).toBe('manana')
    expect(dos.momento).toBe('noche')   // los demás no se tocan

    // Y lo suyo sigue ahí
    expect(uno.diasSemana).toEqual([0, 1, 2])
    expect(uno.totalCompletados).toBe(12)
    expect(uno.nombre).toBe('Respirar')
  })
})
