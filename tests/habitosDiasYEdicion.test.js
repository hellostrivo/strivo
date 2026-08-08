// tests/habitosDiasYEdicion.test.js
// La frecuencia semanal de los hábitos, los dos momentos y la edición (§5.7).
//
// El cambio de fondo: un hábito deja de atarse a días concretos —"lunes,
// miércoles y viernes"— y pasa a una intención semanal —"tres veces, y yo
// decido cuándo"—. De ahí que esté disponible todos los días y que cumplir la
// meta no lo retire: quien quiera hacerlo una vez más, puede.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { openDB } from 'idb'
import { copy } from '@copy'
import {
  upgradeSchema,
  getActiveHabitsForMoment,
  getHabitLogsByDate,
  getHabitLogsBetween,
  markHabit,
} from '@lib/db'
import {
  MOMENTOS,
  FRECUENCIAS,
  FRECUENCIA_POR_DEFECTO,
  agruparPorMomento,
  crearHabito,
  actualizarHabito,
  cargarProgresoSemanal,
  loadHabitos,
  metaSemanalDe,
  normalizarFrecuencia,
  normalizarMomento,
  progresoSemanal,
} from '@lib/habits'
import { semanaDe } from '@lib/fechas'
import { getCurrentUserId } from '@lib/user'

// 5 ago 2026 es miércoles
const UN_MIERCOLES = new Date(2026, 7, 5, 8, 0)
const MIERCOLES = '2026-08-05'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UN_MIERCOLES)
})
afterEach(() => vi.useRealTimers())

const unHabito = (extra = {}) => crearHabito(getCurrentUserId(), {
  nombre: 'Cocinar',
  momento: 'noche',
  frecuenciaSemanal: 2,
  ...extra,
})

describe('La semana empieza en lunes', () => {
  it('un miércoles pertenece a la semana de su lunes', () => {
    expect(semanaDe('2026-08-05')).toEqual({ desde: '2026-08-03', hasta: '2026-08-09' })
  })

  it('el propio lunes abre su semana', () => {
    expect(semanaDe('2026-08-03').desde).toBe('2026-08-03')
  })

  it('y el domingo la cierra, sin saltar a la siguiente', () => {
    expect(semanaDe('2026-08-09')).toEqual({ desde: '2026-08-03', hasta: '2026-08-09' })
  })

  it('el lunes siguiente ya es otra semana', () => {
    expect(semanaDe('2026-08-10').desde).toBe('2026-08-10')
  })

  it('cruza el cambio de mes sin romperse', () => {
    expect(semanaDe('2026-09-01')).toEqual({ desde: '2026-08-31', hasta: '2026-09-06' })
  })
})

describe('Un hábito está disponible todos los días', () => {
  it('con meta de 2 por semana, aparece igual un miércoles', async () => {
    const userId = getCurrentUserId()
    await unHabito()

    expect(await getActiveHabitsForMoment(userId, 'noche')).toHaveLength(1)
  })

  it('cumplir la meta no lo retira', async () => {
    const userId = getCurrentUserId()
    const habito = await unHabito()
    await markHabit(habito.id, userId, '2026-08-03')
    await markHabit(habito.id, userId, '2026-08-04')

    const progreso = await cargarProgresoSemanal(userId, [habito], MIERCOLES)
    expect(progreso.get(habito.id).cumplida).toBe(true)
    // Sigue ahí, por si quiere hacerlo una vez más
    expect(await getActiveHabitsForMoment(userId, 'noche')).toHaveLength(1)
  })

  it('la lista no esconde nada por el día que sea', async () => {
    await unHabito()
    const { grupos } = agruparPorMomento(await loadHabitos(getCurrentUserId()))
    expect(grupos.flatMap(g => g.habitos.map(h => h.nombre))).toEqual(['Cocinar'])
  })

  it('ya no se pregunta por días de la semana', () => {
    expect(copy.habits.create.frequencyLabel)
      .toBe('¿Cuántas veces quieres hacerlo por semana?')
    expect(copy.habits.create.daysLabel).toBeUndefined()
    expect(copy.habits.create.frequencyOptions).toHaveLength(7)
  })
})

describe('El progreso de la semana', () => {
  const progresoDe = hechas => progresoSemanal({ frecuenciaSemanal: 2 }, hechas)

  it('0 de 2: todavía no ha empezado, y no se le llama falta', () => {
    const p = progresoDe(0)
    expect(p).toMatchObject({ hechas: 0, meta: 2, cumplida: false, extra: 0 })
  })

  it('1 de 2: va por la mitad', () => {
    expect(progresoDe(1)).toMatchObject({ hechas: 1, cumplida: false, extra: 0 })
  })

  it('2 de 2: meta cumplida', () => {
    expect(progresoDe(2)).toMatchObject({ cumplida: true, extra: 0 })
  })

  it('3 de 2: cumplida y con un extra', () => {
    expect(progresoDe(3)).toMatchObject({ cumplida: true, extra: 1 })
  })

  it('4 de 2: sigue sumando extras', () => {
    expect(progresoDe(4)).toMatchObject({ cumplida: true, extra: 2 })
  })

  it('cuenta solo las marcas de esta semana', async () => {
    const userId = getCurrentUserId()
    const habito = await unHabito()

    await markHabit(habito.id, userId, '2026-07-29')   // semana anterior
    await markHabit(habito.id, userId, '2026-08-04')   // esta

    const progreso = await cargarProgresoSemanal(userId, [habito], MIERCOLES)
    expect(progreso.get(habito.id).hechas).toBe(1)
  })

  it('la semana nueva empieza en cero y la meta se queda igual', async () => {
    const userId = getCurrentUserId()
    const habito = await unHabito()
    await markHabit(habito.id, userId, '2026-08-03')
    await markHabit(habito.id, userId, '2026-08-04')
    await markHabit(habito.id, userId, '2026-08-05')

    expect((await cargarProgresoSemanal(userId, [habito], MIERCOLES)).get(habito.id))
      .toMatchObject({ hechas: 3, meta: 2, extra: 1 })

    const siguiente = (await cargarProgresoSemanal(userId, [habito], '2026-08-10')).get(habito.id)
    expect(siguiente).toMatchObject({ hechas: 0, meta: 2, cumplida: false })
  })

  it('lo de semanas anteriores no se borra: sigue en el historial', async () => {
    const userId = getCurrentUserId()
    const habito = await unHabito()
    await markHabit(habito.id, userId, '2026-07-29')
    await markHabit(habito.id, userId, '2026-08-04')

    await cargarProgresoSemanal(userId, [habito], '2026-08-10')

    expect(await getHabitLogsBetween(userId, '2026-07-01', '2026-08-31')).toHaveLength(2)
    expect(await getHabitLogsByDate(userId, '2026-07-29')).toHaveLength(1)
  })

  it('ninguno de los textos de progreso regaña', () => {
    const textos = [
      copy.habits.list.weekProgressTemplate,
      copy.habits.list.weekDone,
      copy.habits.list.weekExtraTemplate,
      copy.habits.list.weekExtraJustNow,
    ]
    for (const texto of textos) {
      expect(texto).toBeTruthy()
      expect(texto).not.toMatch(/atrasad|falta|incumpl|fall|deber|pendiente/i)
    }
  })
})

describe('La meta semanal', () => {
  it('va de 1 a 7', () => {
    expect(FRECUENCIAS).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(FRECUENCIA_POR_DEFECTO).toBe(7)
  })

  it('se recorta a lo posible, sin fallar', () => {
    expect(normalizarFrecuencia(0)).toBe(1)
    expect(normalizarFrecuencia(99)).toBe(7)
    expect(normalizarFrecuencia('3')).toBe(3)
    expect(normalizarFrecuencia(undefined)).toBe(7)
    expect(normalizarFrecuencia('cualquier cosa')).toBe(7)
  })

  // Quien había marcado tres días quería hacerlo tres veces por semana.
  it('un hábito de antes hereda su meta de los días que tenía', () => {
    expect(metaSemanalDe({ diasSemana: [0, 2, 4] })).toBe(3)
    expect(metaSemanalDe({ diasSemana: [0, 1, 2, 3, 4, 5, 6] })).toBe(7)
    expect(metaSemanalDe({})).toBe(7)
  })

  it('si ya tiene meta, manda la suya', () => {
    expect(metaSemanalDe({ frecuenciaSemanal: 2, diasSemana: [0, 1, 2, 3, 4] })).toBe(2)
  })
})

describe('Solo hay dos momentos', () => {
  it('mañana y noche, y nada más', () => {
    expect(MOMENTOS).toEqual(['manana', 'noche'])
    expect(JSON.stringify(copy)).not.toContain('A lo largo del día')
  })

  it('el momento retirado se lee como de mañana', () => {
    expect(normalizarMomento('dia')).toBe('manana')
    expect(normalizarMomento(undefined)).toBe('manana')
  })

  it('uno de mañana solo sale en mañana', async () => {
    const userId = getCurrentUserId()
    await crearHabito(userId, { nombre: 'Estirar', momento: 'manana' })

    expect(await getActiveHabitsForMoment(userId, 'manana')).toHaveLength(1)
    expect(await getActiveHabitsForMoment(userId, 'noche')).toHaveLength(0)
  })

  it('uno de noche solo sale en noche', async () => {
    const userId = getCurrentUserId()
    await unHabito()

    expect(await getActiveHabitsForMoment(userId, 'noche')).toHaveLength(1)
    expect(await getActiveHabitsForMoment(userId, 'manana')).toHaveLength(0)
  })
})

describe('El símbolo de cada hábito', () => {
  it('se guarda el que se eligió', async () => {
    const habito = await unHabito({ emoji: '🍳' })
    expect(habito.emoji).toBe('🍳')
  })

  it('sin elegir ninguno, no se le inventa uno', async () => {
    const habito = await crearHabito(getCurrentUserId(), { nombre: 'Leer' })
    expect(habito.emoji).toBeNull()
  })

  it('se puede cambiar después, y se conserva', async () => {
    const habito  = await unHabito({ emoji: '🍳' })
    const editado = await actualizarHabito(habito, { emoji: '🥗' })

    expect(editado.emoji).toBe('🥗')
    expect((await loadHabitos(getCurrentUserId()))[0].emoji).toBe('🥗')
  })

  it('editar otra cosa no le quita el suyo', async () => {
    const habito  = await unHabito({ emoji: '🍳' })
    const editado = await actualizarHabito(habito, { nombre: 'Cocinar sano' })
    expect(editado.emoji).toBe('🍳')
  })
})

describe('Editar un hábito que ya existe', () => {
  it('conserva el id: no nace uno nuevo', async () => {
    const original = await unHabito()
    const editado  = await actualizarHabito(original, { nombre: 'Cocinar sano' })

    expect(editado.id).toBe(original.id)
    expect(await loadHabitos(getCurrentUserId())).toHaveLength(1)
  })

  it('cambiar la meta manda desde ese momento', async () => {
    const userId = getCurrentUserId()
    const original = await unHabito()
    await markHabit(original.id, userId, '2026-08-03')

    const editado = await actualizarHabito(original, { frecuenciaSemanal: 1 })
    const progreso = await cargarProgresoSemanal(userId, [editado], MIERCOLES)

    expect(progreso.get(editado.id)).toMatchObject({ hechas: 1, meta: 1, cumplida: true })
  })

  it('cambiar de noche a mañana lo mueve de sección', async () => {
    const userId = getCurrentUserId()
    const original = await unHabito()
    await actualizarHabito(original, { momento: 'manana' })

    expect(await getActiveHabitsForMoment(userId, 'manana')).toHaveLength(1)
    expect(await getActiveHabitsForMoment(userId, 'noche')).toHaveLength(0)
  })

  it('no se pierde el histórico ni el contador', async () => {
    const userId = getCurrentUserId()
    const original = await unHabito()
    await markHabit(original.id, userId, '2026-08-05')

    const editado = await actualizarHabito(original, { nombre: 'Otro', momento: 'manana' })

    expect(await getHabitLogsByDate(userId, '2026-08-05')).toHaveLength(1)
    expect(editado.creadoEn).toBe(original.creadoEn)
    expect(editado.estado).toBe('activo')
  })

  it('lo que no se toca se queda como estaba', async () => {
    const original = await unHabito({ emoji: '🍳' })
    const editado  = await actualizarHabito(original, { nombre: 'Cocinar sano' })

    expect(editado.momento).toBe(original.momento)
    expect(editado.frecuenciaSemanal).toBe(original.frecuenciaSemanal)
    expect(editado.areaId).toBe(original.areaId)
  })
})

describe('Migración v8 del almacén local', () => {
  const NOMBRE = 'strivo-migracion-frecuencia'

  it('los días fijos se convierten en meta semanal, sin perder nada', async () => {
    const v7 = await openDB(NOMBRE, 7, {
      upgrade(db) {
        const h = db.createObjectStore('habits', { keyPath: 'id' })
        h.createIndex('byUser', 'userId')
        h.createIndex('byUserArea', ['userId', 'areaId'])
      },
    })
    await v7.put('habits', {
      id: 'h1', userId: 'u1', nombre: 'Correr', momento: 'manana',
      diasSemana: [0, 2, 4], estado: 'activo', totalCompletados: 20, emoji: '👟',
    })
    await v7.put('habits', {
      id: 'h2', userId: 'u1', nombre: 'Leer', momento: 'noche',
      diasSemana: [0, 1, 2, 3, 4, 5, 6], estado: 'activo', totalCompletados: 3,
    })
    v7.close()

    const v8 = await openDB(NOMBRE, 8, { upgrade: upgradeSchema })
    const uno = await v8.get('habits', 'h1')
    const dos = await v8.get('habits', 'h2')
    v8.close()

    // Tres días marcados = quería hacerlo tres veces por semana
    expect(uno.frecuenciaSemanal).toBe(3)
    expect(dos.frecuenciaSemanal).toBe(7)

    // Y lo suyo sigue ahí, incluidos los días que eligió en su momento
    expect(uno.diasSemana).toEqual([0, 2, 4])
    expect(uno.totalCompletados).toBe(20)
    expect(uno.emoji).toBe('👟')
    expect(uno.nombre).toBe('Correr')
  })
})

describe('La nota del onboarding', () => {
  it('dice exactamente lo que tiene que decir', () => {
    expect(copy.onboardingHabitosNota)
      .toBe('Puedes editar esto posteriormente en la sección Hábitos.')
  })
})
