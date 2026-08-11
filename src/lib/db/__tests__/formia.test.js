import { beforeEach, describe, expect, it } from 'vitest'

import * as formia from '../formia.js'
import { ERROR_CODES, StrivoDataError } from '../schema.js'
import { listQueue } from '../local.js'
import { UID, resetLocalDB } from './helpers.js'

const DATE = '2026-08-10'

beforeEach(async () => {
  await resetLocalDB()
  await formia.initFormia(UID, { identityCentral: 'Alguien que crece' })
})

describe('identidad (RN-ID-01, RN-DB4-09)', () => {
  it('un usuario nuevo ya tiene identidad central y las 7 áreas', async () => {
    const identity = await formia.getIdentity(UID)
    expect(identity.central).toBe('Alguien que crece')
    expect(Object.keys(identity.areas)).toHaveLength(7)
    expect(await formia.listSelectedAreas(UID)).toEqual([])
  })

  it('no monta el árbol sin identidad central', async () => {
    await resetLocalDB()
    await expect(formia.initFormia(UID, {})).rejects.toMatchObject({
      code: ERROR_CODES.IDENTITY_CENTRAL_REQUIRED,
    })
  })

  it('cambiarla cierra la versión anterior y conserva las dos', async () => {
    await formia.setCentralIdentity(UID, 'Alguien que se cuida')
    const history = await formia.getIdentityHistory(UID)

    expect(history).toHaveLength(2)
    expect(history[0].text).toBe('Alguien que crece')
    expect(history[0].to).not.toBeNull()
    expect(history[1].text).toBe('Alguien que se cuida')
    expect(history[1].to).toBeNull()
    expect(await formia.getCentralIdentity(UID)).toBe('Alguien que se cuida')
  })

  it('RN-ID-04: pausar un área conserva su identityText', async () => {
    await formia.updateArea(UID, 'salud', {
      selected: true,
      identityText: 'alguien que cuida su cuerpo',
    })
    await formia.updateArea(UID, 'salud', { selected: false, state: 'pausada' })

    const areas = await formia.getAreas(UID)
    expect(areas.salud.identityText).toBe('alguien que cuida su cuerpo')
    expect(areas.salud.state).toBe('pausada')
  })
})

describe('createHabit (RN-DB4-05)', () => {
  it('criterio 1: identityRef null lanza y no guarda nada', async () => {
    await expect(formia.createHabit(UID, { name: 'Caminar', identityRef: null })).rejects.toThrow(
      StrivoDataError,
    )
    expect(await formia.listHabits(UID)).toEqual([])
  })

  it('tampoco pasa con undefined ni con cadena vacía', async () => {
    await expect(formia.createHabit(UID, { name: 'Caminar' })).rejects.toMatchObject({
      code: ERROR_CODES.HABIT_IDENTITY_REQUIRED,
    })
    await expect(
      formia.createHabit(UID, { name: 'Caminar', identityRef: '' }),
    ).rejects.toMatchObject({ code: ERROR_CODES.HABIT_IDENTITY_REQUIRED })
    expect(await formia.listHabits(UID)).toEqual([])
  })

  it('criterio 2: identityRef "central" guarda correctamente', async () => {
    const habit = await formia.createHabit(UID, { name: 'Caminar', identityRef: 'central' })

    expect(habit.id).toBeTruthy()
    expect(habit.identityRef).toBe('central')
    expect(habit.state).toBe('activo')
    expect(habit.context).toBeNull()

    const stored = await formia.getHabit(UID, habit.id)
    expect(stored.name).toBe('Caminar')
  })

  it('guarda con un areaId del catálogo, aunque el área no esté elegida', async () => {
    const habit = await formia.createHabit(UID, { name: 'Estirar', identityRef: 'salud' })
    expect(habit.identityRef).toBe('salud')
  })

  it('no acepta una identidad inventada', async () => {
    await expect(
      formia.createHabit(UID, { name: 'Correr', identityRef: 'deportes' }),
    ).rejects.toMatchObject({ code: ERROR_CODES.HABIT_IDENTITY_UNKNOWN })
  })

  it('RN-FO-H3-03: editar cambia de identidad, no la quita', async () => {
    const habit = await formia.createHabit(UID, { name: 'Caminar', identityRef: 'central' })

    const cambiado = await formia.updateHabit(UID, habit.id, { identityRef: 'salud' })
    expect(cambiado.identityRef).toBe('salud')

    await expect(formia.updateHabit(UID, habit.id, { identityRef: null })).rejects.toMatchObject({
      code: ERROR_CODES.HABIT_IDENTITY_REQUIRED,
    })
  })

  it('RN-FO-ID-04: agrupar por identidad es una consulta', async () => {
    await formia.createHabit(UID, { name: 'Caminar', identityRef: 'salud' })
    await formia.createHabit(UID, { name: 'Estirar', identityRef: 'salud' })
    await formia.createHabit(UID, { name: 'Leer', identityRef: 'central' })

    expect(await formia.listHabitsByIdentity(UID, 'salud')).toHaveLength(2)
    expect(await formia.listHabitsByIdentity(UID, 'central')).toHaveLength(1)
  })
})

describe('habitLogs (RN-06)', () => {
  it('criterio 4: marcar cinco veces produce un solo registro', async () => {
    const habit = await formia.createHabit(UID, { name: 'Beber agua', identityRef: 'central' })

    const marcas = []
    for (let i = 0; i < 5; i += 1) {
      marcas.push(await formia.markHabit(UID, habit.id, DATE))
    }

    const logs = await formia.listHabitLogsByHabit(UID, habit.id)
    expect(logs).toHaveLength(1)
    expect(await formia.listHabitLogs(UID)).toHaveLength(1)

    // Idempotente de verdad: la hora de la primera marca no se mueve.
    const horas = new Set(marcas.map((marca) => marca.completedAt))
    expect(horas.size).toBe(1)

    // Y la cola tampoco acumula cinco envíos para la misma fila.
    const queue = await listQueue(UID)
    expect(queue.filter((entry) => entry.path.includes('habitLogs'))).toHaveLength(1)
  })

  it('un mismo hábito en dos días son dos registros', async () => {
    const habit = await formia.createHabit(UID, { name: 'Beber agua', identityRef: 'central' })
    await formia.markHabit(UID, habit.id, '2026-08-10')
    await formia.markHabit(UID, habit.id, '2026-08-11')

    expect(await formia.listHabitLogsByHabit(UID, habit.id)).toHaveLength(2)
    expect(await formia.listHabitLogsByDate(UID, '2026-08-10')).toHaveLength(1)
  })

  it('desmarcar borra la fila: la ausencia vuelve a ser ausencia', async () => {
    const habit = await formia.createHabit(UID, { name: 'Beber agua', identityRef: 'central' })
    await formia.markHabit(UID, habit.id, DATE)
    await formia.unmarkHabit(UID, habit.id, DATE)

    expect(await formia.getHabitLog(UID, habit.id, DATE)).toBeNull()
    expect(await formia.listHabitLogs(UID)).toEqual([])
  })
})

describe('RN-DB4-08: nada se corrige en silencio', () => {
  it('un hábito con identidad sin destino se marca para revisión, no se repara', async () => {
    const sano = await formia.createHabit(UID, { name: 'Caminar', identityRef: 'central' })

    // Simula lo que llegaría de una copia de seguridad: se escribe por debajo
    // de las validaciones, como haría una restauración.
    const { writePath } = await import('../local.js')
    const { paths, COLLECTIONS } = await import('../schema.js')
    await writePath({
      uid: UID,
      path: paths.formiaItem(UID, 'habits', 'h-heredado'),
      collection: COLLECTIONS.habits,
      id: 'h-heredado',
      data: { name: 'Hábito heredado', identityRef: null, state: 'activo' },
    })

    const revisar = await formia.findHabitsNeedingReview(UID)
    expect(revisar.map((habit) => habit.id)).toEqual(['h-heredado'])

    // Sigue tal cual: nadie le asignó una identidad por su cuenta.
    const heredado = await formia.getHabit(UID, 'h-heredado')
    expect(heredado.identityRef).toBeNull()
    expect(await formia.getHabit(UID, sano.id)).toBeTruthy()
  })
})
