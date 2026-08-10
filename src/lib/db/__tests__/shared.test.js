import { beforeEach, describe, expect, it } from 'vitest'

import * as shared from '../shared.js'
import { readPath } from '../local.js'
import { ERROR_CODES, paths } from '../schema.js'
import { initUserTree } from '../index.js'
import { UID, resetLocalDB } from './helpers.js'

beforeEach(resetLocalDB)

describe('shared/', () => {
  it('guarda y lee las cuatro ramas', async () => {
    await shared.initShared(UID, { profile: { name: 'Alejandra' } })

    expect((await shared.getProfile(UID)).name).toBe('Alejandra')
    expect((await shared.getAuthRecord(UID)).uid).toBe(UID)
    expect((await shared.getPreferences(UID)).reducedMotion).toBe(false)
    expect((await shared.getOnboarding(UID)).completedSteps).toEqual([])
  })

  it('RN-DB-01: diaTerminaA sale del perfil', async () => {
    await shared.initShared(UID, { profile: { diaTerminaA: '03:00' } })
    expect(await shared.getDiaTerminaA(UID)).toBe('03:00')
  })

  it('sin perfil devuelve el valor por defecto sin escribirlo', async () => {
    expect(await shared.getDiaTerminaA(UID)).toBe('00:00')
    expect(await shared.getProfile(UID)).toBeNull()
  })

  it('un campo fuera del modelo se rechaza', async () => {
    await expect(shared.savePreferences(UID, { tamanoTexto: 'grande' })).rejects.toMatchObject({
      code: ERROR_CODES.UNKNOWN_FIELD,
    })
  })

  it('actualizar el perfil conserva lo que no se toca', async () => {
    await shared.initShared(UID, { profile: { name: 'Alejandra', wakeTime: '07:00' } })
    await shared.updateProfile(UID, { sleepTime: '23:00' })

    const profile = await shared.getProfile(UID)
    expect(profile.name).toBe('Alejandra')
    expect(profile.wakeTime).toBe('07:00')
    expect(profile.sleepTime).toBe('23:00')
  })
})

describe('criterio 6: el árbol de un usuario nuevo', () => {
  it('coincide con §C5.2', async () => {
    await initUserTree(UID, {
      identityCentral: 'Alguien que crece',
      profile: { name: 'Alejandra' },
      auth: { email: 'team@hellostrivo.com' },
    })

    // shared/ con sus cuatro ramas
    for (const doc of ['profile', 'auth', 'preferences', 'onboarding']) {
      expect(await readPath(paths.sharedDoc(UID, doc))).not.toBeNull()
    }

    // formia/ con la identidad central y las 7 áreas del catálogo
    const identity = await readPath(paths.formiaDoc(UID, 'identity'))
    expect(identity.central).toBe('Alguien que crece')
    expect(Object.keys(identity.areas)).toHaveLength(7)

    const history = await readPath(paths.formiaDoc(UID, 'identityHistory'))
    expect(history.versions).toHaveLength(1)

    // lumia/ nace vacío: no se inventa un día que nadie escribió
    expect(await readPath(paths.lumiaDoc(UID, 'pinConfig'))).toBeNull()
  })

  it('no se monta sin identidad central (RN-DB4-09)', async () => {
    await expect(initUserTree(UID, {})).rejects.toMatchObject({
      code: ERROR_CODES.IDENTITY_CENTRAL_REQUIRED,
    })
  })
})
