import { beforeEach, describe, expect, it } from 'vitest'

import * as lumia from '../lumia.js'
import { ERROR_CODES } from '../schema.js'
import { listQueue } from '../local.js'
import { UID, resetLocalDB } from './helpers.js'

const DATE = '2026-08-10'

beforeEach(resetLocalDB)

describe('journal', () => {
  it('crea, lee y actualiza una entrada', async () => {
    const entry = await lumia.createJournalEntry(UID, {
      date: DATE,
      text: 'Hoy escribí sin pensarlo mucho.',
      emotions: ['calma'],
    })

    expect(entry.id).toBeTruthy()
    expect(entry.createdAt).toBeTruthy()

    await lumia.updateJournalEntry(UID, entry.id, { text: 'Corregido.' })
    const stored = await lumia.getJournalEntry(UID, entry.id)

    expect(stored.text).toBe('Corregido.')
    expect(stored.date).toBe(DATE)
    expect(stored.updatedAt >= stored.createdAt).toBe(true)
  })

  it('lista por fecha', async () => {
    await lumia.createJournalEntry(UID, { date: DATE, text: 'una' })
    await lumia.createJournalEntry(UID, { date: DATE, text: 'otra' })
    await lumia.createJournalEntry(UID, { date: '2026-08-11', text: 'de otro día' })

    expect(await lumia.listJournalEntriesByDate(UID, DATE)).toHaveLength(2)
    expect(await lumia.listJournalEntries(UID)).toHaveLength(3)
  })

  it('rechaza un campo fuera del modelo', async () => {
    await expect(
      lumia.createJournalEntry(UID, { text: 'x', privada: true }),
    ).rejects.toMatchObject({ code: ERROR_CODES.UNKNOWN_FIELD })
  })
})

describe('registros por fecha', () => {
  it('dailyIntention, morningEntry y nightRitual son un registro por día', async () => {
    await lumia.saveDailyIntention(UID, DATE, { intentionText: 'Ir despacio.' })
    await lumia.saveMorningEntry(UID, DATE, { granVision: 'Un día tranquilo.' })
    await lumia.saveNightRitual(UID, DATE, { learning: 'Descansar también cuenta.' })

    expect((await lumia.getDailyIntention(UID, DATE)).intentionText).toBe('Ir despacio.')
    expect((await lumia.getMorningEntry(UID, DATE)).granVision).toBe('Un día tranquilo.')
    expect((await lumia.getNightRitual(UID, DATE)).learning).toBe('Descansar también cuenta.')
  })

  it('el ritual de noche se guarda por partes sin perder lo anterior', async () => {
    await lumia.saveNightRitual(UID, DATE, { newWins: ['Salí a caminar'] })
    await lumia.saveNightRitual(UID, DATE, { gratitude: ['El café de la mañana'] })
    await lumia.saveNightRitual(UID, DATE, { sleepState: 'tranquilo' })

    const ritual = await lumia.getNightRitual(UID, DATE)
    expect(ritual.newWins).toEqual(['Salí a caminar'])
    expect(ritual.gratitude).toEqual(['El café de la mañana'])
    expect(ritual.sleepState).toBe('tranquilo')
  })

  it('morningEntry solo admite los tres campos de SPEC_02 §5', async () => {
    await expect(
      lumia.saveMorningEntry(UID, DATE, { smallAction: 'x' }),
    ).rejects.toMatchObject({ code: ERROR_CODES.UNKNOWN_FIELD })
  })

  it('exige una fecha con forma YYYY-MM-DD', async () => {
    await expect(
      lumia.saveDailyIntention(UID, '10-08-2026', { intentionText: 'x' }),
    ).rejects.toMatchObject({ code: ERROR_CODES.DATE_INVALID })
  })
})

describe('victorias', () => {
  it('se guardan sin identidad', async () => {
    const victory = await lumia.createVictory(UID, {
      text: 'Terminé lo que había empezado',
      date: DATE,
      state: 'lograda',
    })

    expect(victory.id).toBeTruthy()
    expect(victory.identityRef).toBeUndefined()
    expect(await lumia.listVictoriesByDate(UID, DATE)).toHaveLength(1)
  })

  it('admiten identidad cuando la hay', async () => {
    const victory = await lumia.createVictory(UID, {
      text: 'Caminé media hora',
      date: DATE,
      identityRef: 'salud',
    })
    expect(victory.identityRef).toBe('salud')
  })
})

describe('dayState', () => {
  it('guarda el ánimo del día', async () => {
    await lumia.saveDayState(UID, DATE, { mood: 'tranquilo' })
    expect((await lumia.getDayState(UID, DATE)).mood).toBe('tranquilo')
    expect(await lumia.listDayStates(UID)).toHaveLength(1)
  })

  it('la escala de ánimo es cerrada (§6.3.5)', async () => {
    await expect(lumia.saveDayState(UID, DATE, { mood: 'bien' })).rejects.toMatchObject({
      code: ERROR_CODES.MOOD_INVALID,
    })
  })
})

describe('pinConfig (RN-DB-04)', () => {
  it('se guarda en local y nunca se encola hacia la red', async () => {
    await lumia.savePinConfig(UID, {
      salt: 'sal',
      hash: 'huella',
      iterations: 210000,
      algorithm: 'PBKDF2-SHA256',
      enabled: true,
    })

    expect((await lumia.getPinConfig(UID)).enabled).toBe(true)

    const queue = await listQueue(UID)
    expect(queue.some((entry) => entry.path.includes('pinConfig'))).toBe(false)
  })

  it('quitarlo tampoco sale del dispositivo', async () => {
    await lumia.savePinConfig(UID, { enabled: true })
    await lumia.clearPinConfig(UID)

    expect(await lumia.getPinConfig(UID)).toBeNull()
    const queue = await listQueue(UID)
    expect(queue.some((entry) => entry.path.includes('pinConfig'))).toBe(false)
  })
})
