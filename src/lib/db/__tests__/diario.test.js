import { beforeEach, describe, expect, it } from 'vitest'

import * as diario from '../diario.js'
import { ERROR_CODES } from '../schema.js'
import { listQueue, writePath } from '../local.js'
import { UID, resetLocalDB } from './helpers.js'

const DATE = '2026-08-10'

beforeEach(resetLocalDB)

describe('journal', () => {
  it('crea, lee y actualiza una entrada', async () => {
    const entry = await diario.createJournalEntry(UID, {
      date: DATE,
      text: 'Hoy escribí sin pensarlo mucho.',
      emotions: ['calma'],
    })

    expect(entry.id).toBeTruthy()
    expect(entry.createdAt).toBeTruthy()

    await diario.updateJournalEntry(UID, entry.id, { text: 'Corregido.' })
    const stored = await diario.getJournalEntry(UID, entry.id)

    expect(stored.text).toBe('Corregido.')
    expect(stored.date).toBe(DATE)
    expect(stored.updatedAt >= stored.createdAt).toBe(true)
  })

  it('lista por fecha', async () => {
    await diario.createJournalEntry(UID, { date: DATE, text: 'una' })
    await diario.createJournalEntry(UID, { date: DATE, text: 'otra' })
    await diario.createJournalEntry(UID, { date: '2026-08-11', text: 'de otro día' })

    expect(await diario.listJournalEntriesByDate(UID, DATE)).toHaveLength(2)
    expect(await diario.listJournalEntries(UID)).toHaveLength(3)
  })

  it('rechaza un campo fuera del modelo', async () => {
    await expect(
      diario.createJournalEntry(UID, { text: 'x', privada: true }),
    ).rejects.toMatchObject({ code: ERROR_CODES.UNKNOWN_FIELD })
  })
})

describe('registros por fecha', () => {
  it('morningEntry y nightRitual son un registro por día', async () => {
    await diario.saveMorningEntry(UID, DATE, { action: 'Salir a caminar.' })
    await diario.saveNightRitual(UID, DATE, { reflection: 'Descansar también cuenta.' })

    expect((await diario.getMorningEntry(UID, DATE)).action).toBe('Salir a caminar.')
    expect((await diario.getNightRitual(UID, DATE)).reflection).toBe('Descansar también cuenta.')
  })

  it('el ritual de noche se guarda por partes sin perder lo anterior', async () => {
    await diario.saveNightRitual(UID, DATE, { reflection: 'Que se puede pedir ayuda' })
    await diario.saveNightRitual(UID, DATE, { recognized: ['El café de la mañana'] })
    await diario.saveNightRitual(UID, DATE, { closingFeeling: 'tranquilo' })

    const ritual = await diario.getNightRitual(UID, DATE)
    expect(ritual.reflection).toBe('Que se puede pedir ayuda')
    expect(ritual.recognized).toEqual(['El café de la mañana'])
    expect(ritual.closingFeeling).toBe('tranquilo')
  })

  // El checklist de logros se retiró el 23 ago con las victorias. El campo sale
  // del modelo canónico, así que volver a escribirlo se rechaza como cualquier
  // otro campo fuera de lista (RN-DB4-08): nada se corrige en silencio.
  it('el ritual de noche ya no admite los cuatro campos de la versión 1', async () => {
    // "¿Qué agradezco de este día?", el aprendizaje y el estado de sueño se
    // retiraron el 23 ago con la actualización de la noche. Las noches ya
    // escritas los conservan y el Historial los lee; nadie los vuelve a
    // escribir, y un intento se rechaza como cualquier campo fuera de lista.
    for (const campo of ['gratitude', 'learning', 'sleepState', 'sleepStateOther']) {
      await expect(diario.saveNightRitual(UID, DATE, { [campo]: 'x' })).rejects.toMatchObject({
        code: 'UNKNOWN_FIELD',
      })
    }
  })

  it('las noches guardadas se siguen leyendo enteras', async () => {
    // Escribir es lo que se cierra; leer, no. Un registro con los campos
    // viejos ya en el almacén se devuelve tal cual (§11).
    await diario.saveNightRitual(UID, DATE, { recognized: ['algo'] })
    expect((await diario.getNightRitual(UID, DATE)).recognized).toEqual(['algo'])
  })

  it('todas las noches se pueden listar, para no repetir una pregunta', async () => {
    await diario.saveNightRitual(UID, '2026-07-20', { reflectionId: 'general' })
    await diario.saveNightRitual(UID, '2026-07-21', { reflectionId: 'memoria' })
    const noches = await diario.listNightRituals(UID)
    expect(noches.map((noche) => noche.id).sort()).toEqual(['2026-07-20', '2026-07-21'])
  })

  it('el ritual de noche ya no admite newWins ni inheritedWins', async () => {
    await expect(diario.saveNightRitual(UID, DATE, { newWins: ['x'] })).rejects.toMatchObject({
      code: ERROR_CODES.UNKNOWN_FIELD,
    })
    await expect(diario.saveNightRitual(UID, DATE, { inheritedWins: [] })).rejects.toMatchObject({
      code: ERROR_CODES.UNKNOWN_FIELD,
    })
  })

  // La Vista de Mañana escribe dos campos del mismo día casi a la vez: marcar
  // una emoción se guarda al instante mientras el autoguardado de un texto va
  // en camino. Cuando `mergePath` leía y escribía en transacciones distintas,
  // la segunda partía de una copia vieja y borraba lo de la primera.
  it('dos escrituras simultáneas del mismo día no se pisan', async () => {
    await Promise.all([
      diario.saveMorningEntry(UID, DATE, { gratitude: ['El café'] }),
      diario.saveMorningEntry(UID, DATE, { feelings: ['calma'] }),
      diario.saveMorningEntry(UID, DATE, { action: 'Salir a caminar.' }),
    ])

    expect(await diario.getMorningEntry(UID, DATE)).toEqual({
      gratitude: ['El café'],
      feelings: ['calma'],
      action: 'Salir a caminar.',
    })
  })

  it('morningEntry solo admite los campos de su lista', async () => {
    await expect(diario.saveMorningEntry(UID, DATE, { smallAction: 'x' })).rejects.toMatchObject({
      code: ERROR_CODES.UNKNOWN_FIELD,
    })
  })

  // Las dos preguntas de la versión 1 salieron de la lista con la actualización
  // del 23 ago. Los días que las tienen se siguen leyendo enteros; lo que ya no
  // se puede es volver a escribirlas, que es lo que las mantendría vivas.
  it('la mañana ya no admite emotions ni granVision', async () => {
    for (const campo of [{ emotions: ['en_paz'] }, { granVision: 'x' }]) {
      await expect(diario.saveMorningEntry(UID, DATE, campo)).rejects.toMatchObject({
        code: ERROR_CODES.UNKNOWN_FIELD,
      })
    }
  })

  it('un día escrito con la versión anterior se sigue leyendo entero', async () => {
    // Se escribe por debajo de la capa de datos, como habría quedado en el
    // almacén antes de la actualización.
    await writePath({
      uid: UID,
      path: `users/${UID}/diario/morningEntry/items/${DATE}`,
      collection: 'diario/morningEntry',
      id: DATE,
      data: { emotions: ['en_paz'], granVision: 'Un día sin prisa.' },
    })

    expect(await diario.getMorningEntry(UID, DATE)).toEqual({
      emotions: ['en_paz'],
      granVision: 'Un día sin prisa.',
    })
  })

  it('exige una fecha con forma YYYY-MM-DD', async () => {
    await expect(diario.saveMorningEntry(UID, '10-08-2026', { action: 'x' })).rejects.toMatchObject(
      {
        code: ERROR_CODES.DATE_INVALID,
      },
    )
  })
})

// La colección `diario/victories` se eliminó el 23 ago junto con el bloque de
// victorias de la mañana y el checklist de la noche. Los registros ya escritos
// se quedan inertes en el almacén: nada los lee y nada los borra.
describe('victorias (retiradas)', () => {
  it('la capa de datos no ofrece ninguna función de victoria', () => {
    for (const nombre of [
      'createVictory',
      'updateVictory',
      'getVictory',
      'listVictories',
      'listVictoriesByDate',
      'deleteVictory',
    ]) {
      expect(diario[nombre]).toBeUndefined()
    }
  })
})

describe('dayState', () => {
  it('guarda el ánimo del día', async () => {
    await diario.saveDayState(UID, DATE, { mood: 'tranquilo' })
    expect((await diario.getDayState(UID, DATE)).mood).toBe('tranquilo')
    expect(await diario.listDayStates(UID)).toHaveLength(1)
  })

  it('la escala de ánimo es cerrada (§6.3.5)', async () => {
    await expect(diario.saveDayState(UID, DATE, { mood: 'bien' })).rejects.toMatchObject({
      code: ERROR_CODES.MOOD_INVALID,
    })
  })
})

describe('pinConfig (RN-DB-04)', () => {
  it('se guarda en local y nunca se encola hacia la red', async () => {
    await diario.savePinConfig(UID, {
      salt: 'sal',
      hash: 'huella',
      iterations: 210000,
      algorithm: 'PBKDF2-SHA256',
      enabled: true,
    })

    expect((await diario.getPinConfig(UID)).enabled).toBe(true)

    const queue = await listQueue(UID)
    expect(queue.some((entry) => entry.path.includes('pinConfig'))).toBe(false)
  })

  it('quitarlo tampoco sale del dispositivo', async () => {
    await diario.savePinConfig(UID, { enabled: true })
    await diario.clearPinConfig(UID)

    expect(await diario.getPinConfig(UID)).toBeNull()
    const queue = await listQueue(UID)
    expect(queue.some((entry) => entry.path.includes('pinConfig'))).toBe(false)
  })
})
