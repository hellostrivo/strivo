// src/lib/db/__tests__/sellos.test.js
// El sello de última escritura (SPEC_17A §4.1, criterio 9).
//
// La restauración decide con `updatedAt` si lo que baja de la nube es más
// nuevo que lo que hay aquí, así que dos cosas tienen que ser ciertas a la
// vez: toda escritura de `shared/` y de `dayState` lo lleva dentro del dato
// —no en la fila de IndexedDB, que no viaja—, y **la siembra no lo lleva**.
// Un árbol recién montado que reclamara un instante le ganaría al perfil que
// esa persona sí escribió y que está esperando en la nube (D13).
//
// Y la siembra **tampoco sube** (D14): `sync.js` escribe con `setDoc` sin
// `merge`, así que una semilla encolada reemplazaría en la nube el perfil real
// de quien reinstala justo cuando la restauración falló y no hay otra copia.

import { beforeEach, describe, expect, it } from 'vitest'

import * as shared from '../shared.js'
import * as diario from '../diario.js'
import { listQueue, pendingCount } from '../local.js'
import { ERROR_CODES, FIELDS } from '../schema.js'
import { UID, resetLocalDB } from './helpers.js'

beforeEach(resetLocalDB)

const DOCS = ['profile', 'auth', 'preferences', 'onboarding']

function esInstanteISO(valor) {
  return typeof valor === 'string' && !Number.isNaN(Date.parse(valor)) && valor.endsWith('Z')
}

describe('el modelo admite el sello', () => {
  it('en los cuatro documentos de shared/ y en dayState', () => {
    for (const doc of DOCS) expect(FIELDS[doc]).toContain('updatedAt')
    expect(FIELDS.dayState).toContain('updatedAt')
  })

  it('y el resto de la lista no cambió', () => {
    expect(FIELDS.dayState).toEqual(['mood', 'updatedAt'])
    expect(FIELDS.auth).toEqual(['uid', 'email', 'phone', 'updatedAt'])
  })
})

describe('criterio 9: la siembra no sella', () => {
  it('ninguno de los cuatro documentos sembrados trae updatedAt', async () => {
    await shared.initShared(UID, { profile: { name: 'Alejandra' } })
    expect(await shared.getProfile(UID)).not.toHaveProperty('updatedAt')
    expect(await shared.getAuthRecord(UID)).not.toHaveProperty('updatedAt')
    expect(await shared.getPreferences(UID)).not.toHaveProperty('updatedAt')
    expect(await shared.getOnboarding(UID)).not.toHaveProperty('updatedAt')
  })

  it('la siembra sigue validando: una semilla fuera del modelo se rechaza', async () => {
    await expect(shared.initShared(UID, { profile: { areas: [] } })).rejects.toMatchObject({
      code: ERROR_CODES.UNKNOWN_FIELD,
    })
  })

  it('D14: la siembra no encola ninguno de los cuatro documentos', async () => {
    await shared.initShared(UID)
    expect(await pendingCount(UID)).toBe(0)
  })

  it('criterio 12: con la restauración fallida, la siembra que viene detrás no sube nada', async () => {
    // Una restauración que falla no escribe nada: el árbol local sigue vacío
    // y el arranque siembra. Lo que hay que impedir es que esa semilla salga a
    // la nube y reemplace allí el perfil que esa persona sí escribió.
    expect(await shared.getProfile(UID)).toBeNull()
    await shared.initShared(UID)
    const rutas = (await listQueue(UID)).map((e) => e.path)
    for (const doc of DOCS) expect(rutas).not.toContain(`users/${UID}/shared/${doc}`)
  })

  it('D16: la siembra no pisa nada que ya esté escrito, documento a documento', async () => {
    // Es lo que protege el hueco entre el techo del velo y una bajada que
    // sigue por detrás: si el perfil real llegó primero, la semilla no entra.
    await shared.saveProfile(UID, { name: 'Alejandra', gender: 'f' })
    await shared.initShared(UID)
    const perfil = await shared.getProfile(UID)
    expect(perfil.name).toBe('Alejandra')
    expect(perfil.gender).toBe('f')
    // Lo que no estaba, sí se siembra.
    expect((await shared.getOnboarding(UID)).completedAt).toBeNull()
  })

  it('lo escrito después de sembrar sí sube: la excepción es solo la siembra', async () => {
    await shared.initShared(UID)
    await shared.updateProfile(UID, { name: 'Ale' })
    const [entrada] = await listQueue(UID)
    expect(entrada.path).toBe(`users/${UID}/shared/profile`)
    expect(entrada.data.name).toBe('Ale')
    expect(esInstanteISO(entrada.data.updatedAt)).toBe(true)
  })
})

describe('criterio 9: el resto de escrituras de shared/ sí sella', () => {
  it('saveProfile y updateProfile', async () => {
    await shared.saveProfile(UID, { name: 'Ale' })
    expect(esInstanteISO((await shared.getProfile(UID)).updatedAt)).toBe(true)

    const antes = (await shared.getProfile(UID)).updatedAt
    await new Promise((r) => setTimeout(r, 5))
    await shared.updateProfile(UID, { wakeTime: '06:30' })
    const despues = await shared.getProfile(UID)
    expect(despues.name).toBe('Ale')
    expect(Date.parse(despues.updatedAt)).toBeGreaterThan(Date.parse(antes))
  })

  it('saveAuthRecord', async () => {
    await shared.saveAuthRecord(UID, { uid: UID, email: 'a@b.c', phone: null })
    expect(esInstanteISO((await shared.getAuthRecord(UID)).updatedAt)).toBe(true)
  })

  it('savePreferences y updatePreferences', async () => {
    await shared.savePreferences(UID, { soundEnabled: false })
    expect(esInstanteISO((await shared.getPreferences(UID)).updatedAt)).toBe(true)
    await shared.updatePreferences(UID, { reducedMotion: true })
    const prefs = await shared.getPreferences(UID)
    expect(prefs.soundEnabled).toBe(false)
    expect(esInstanteISO(prefs.updatedAt)).toBe(true)
  })

  it('saveOnboarding y updateOnboarding', async () => {
    await shared.saveOnboarding(UID, { completedSteps: [] })
    expect(esInstanteISO((await shared.getOnboarding(UID)).updatedAt)).toBe(true)
    await shared.updateOnboarding(UID, { completedAt: '2026-09-17T10:00:00.000Z' })
    const onb = await shared.getOnboarding(UID)
    expect(onb.completedSteps).toEqual([])
    expect(esInstanteISO(onb.updatedAt)).toBe(true)
  })

  it('actualizar sobre un documento sembrado le da su primera marca', async () => {
    await shared.initShared(UID)
    expect(await shared.getProfile(UID)).not.toHaveProperty('updatedAt')
    await shared.updateProfile(UID, { name: 'Ale' })
    expect(esInstanteISO((await shared.getProfile(UID)).updatedAt)).toBe(true)
  })

  it('el sello lo pone la capa: lo que traiga la pantalla no manda', async () => {
    await shared.saveProfile(UID, { name: 'Ale', updatedAt: '2000-01-01T00:00:00.000Z' })
    expect(Date.parse((await shared.getProfile(UID)).updatedAt)).toBeGreaterThan(
      Date.parse('2020-01-01T00:00:00.000Z'),
    )
  })

  it('se sella después de validar: un campo fuera del modelo se sigue rechazando', async () => {
    await expect(shared.saveProfile(UID, { racha: 3 })).rejects.toMatchObject({
      code: ERROR_CODES.UNKNOWN_FIELD,
    })
  })

  it('el sello viaja dentro del dato que sale a la cola', async () => {
    await shared.saveProfile(UID, { name: 'Ale' })
    const [entrada] = await listQueue(UID)
    expect(esInstanteISO(entrada.data.updatedAt)).toBe(true)
  })
})

describe('dayState sella; la mañana, la noche y el journal siguen como estaban', () => {
  it('saveDayState lleva updatedAt dentro del dato', async () => {
    await diario.saveDayState(UID, '2026-09-17', { mood: 'tranquilo' })
    const estado = await diario.getDayState(UID, '2026-09-17')
    expect(estado.mood).toBe('tranquilo')
    expect(esInstanteISO(estado.updatedAt)).toBe(true)
  })

  it('la mañana no recibe un sello de la capa: lo trae quien escribe, con su formato', async () => {
    await diario.saveMorningEntry(UID, '2026-09-17', {
      action: 'Salir.',
      updatedAt: '2026-09-17T07:10:00-05:00',
    })
    expect((await diario.getMorningEntry(UID, '2026-09-17')).updatedAt).toBe(
      '2026-09-17T07:10:00-05:00',
    )
  })

  it('una mañana guardada sin marca sigue sin marca: nadie la fabrica', async () => {
    await diario.saveMorningEntry(UID, '2026-09-17', { action: 'Salir.' })
    expect(await diario.getMorningEntry(UID, '2026-09-17')).not.toHaveProperty('updatedAt')
  })
})
