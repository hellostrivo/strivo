// src/lib/db/__tests__/shared.test.js
// La rama `shared/` y el árbol de un usuario nuevo (SPEC_02, criterio 6).
//
// **Revisión del paso 8 del plan de separación técnica (25 ago 2026).** El
// criterio 6 tenía dos casos y queda con uno. El árbol pierde una de sus tres
// raíces, así que "coincide con §C5.2" pasa a comprobar dos; y "no se monta sin
// identidad central" **se elimina** con la regla que custodiaba.

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
    const ramas = await initUserTree(UID, {
      profile: { name: 'Alejandra' },
      auth: { email: 'team@hellostrivo.com' },
    })

    // shared/ con sus cuatro ramas
    for (const doc of ['profile', 'auth', 'preferences', 'onboarding']) {
      expect(await readPath(paths.sharedDoc(UID, doc))).not.toBeNull()
    }
    expect(await readPath(paths.sharedDoc(UID, 'profile'))).toMatchObject({ name: 'Alejandra' })

    // diario/ nace vacío: no se inventa un día que nadie escribió
    expect(await readPath(paths.diarioDoc(UID, 'pinConfig'))).toBeNull()

    // Y no hay una tercera raíz. Era la que traía la identidad central y las 7
    // áreas del catálogo, y **con ella se va la única semilla que el árbol
    // pedía**: montar un usuario nuevo ya no exige contestar nada.
    expect(Object.keys(ramas).sort()).toEqual(['diario', 'shared'])
  })

  // **Se elimina "no se monta sin identidad central (RN-DB4-09)".** La regla
  // murió con el modelo que la sostenía: no hay identidad central que exigir, el
  // esquema ya no tiene ese código de error y `initUserTree` no rechaza nada. El
  // árbol se monta siempre — que es, además, lo que hizo falta para que la app
  // volviera a arrancar en el paso 2.
})
