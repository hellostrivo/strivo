// src/lib/db/__tests__/onboarding.test.js
// Lo que F-1B añadió a la capa de datos: los campos del onboarding, la marca
// que dice que terminó, y la mudanza del árbol al crear una cuenta.
//
// La mudanza es la parte delicada. Hasta P7 se escribe bajo un uid local, y las
// reglas de Firestore exigen que el segmento de la ruta sea el uid autenticado:
// sin mover el árbol, lo escrito en los pasos anteriores no lo encontraría la
// sesión nueva ni podría subir nunca. Y al moverlo, lo que **no** puede pasar
// es que pise nada (RN-DB-04).

import { beforeEach, describe, expect, it } from 'vitest'

import * as shared from '../shared.js'
import * as diario from '../diario.js'
import { initUserTree } from '../index.js'
import { listQueue, mudarUid, readPath } from '../local.js'
import { ERROR_CODES, FIELDS, paths } from '../schema.js'
import { UID, resetLocalDB } from './helpers.js'

const CUENTA = 'uid-de-la-cuenta'

beforeEach(resetLocalDB)

describe('los campos que el onboarding escribe', () => {
  it('el árbol nuevo nace con ellos, y en blanco', async () => {
    await initUserTree(UID)

    const perfil = await shared.getProfile(UID)
    const preferencias = await shared.getPreferences(UID)
    const expediente = await shared.getOnboarding(UID)

    expect(perfil.identidadCentral).toBeNull()
    expect(preferencias.remindersEnabled).toBe(false)
    expect(expediente).toMatchObject({
      completedSteps: [],
      currentStep: null,
      completedAt: null,
      motivos: [],
      motivoOtro: null,
    })
  })

  it('la identidad central es una frase suelta, sin nada con qué combinarse', () => {
    expect(FIELDS.profile).toContain('identidadCentral')
    // Lo que este spec vino a evitar: ni áreas, ni identidad por área.
    FIELDS.profile.forEach((campo) => expect(campo).not.toMatch(/[áa]rea/i))
    FIELDS.onboarding.forEach((campo) => expect(campo).not.toMatch(/[áa]rea/i))
  })

  it('un campo de áreas se rechaza al escribir, no se ignora', async () => {
    await initUserTree(UID)
    await expect(shared.updateProfile(UID, { areas: ['salud'] })).rejects.toMatchObject({
      code: ERROR_CODES.UNKNOWN_FIELD,
    })
    await expect(
      shared.updateOnboarding(UID, { identidadPorArea: { salud: 'x' } }),
    ).rejects.toMatchObject({ code: ERROR_CODES.UNKNOWN_FIELD })
  })

  it('los motivos tienen que ser una lista, no una cadena con comas', async () => {
    await initUserTree(UID)
    await expect(shared.updateOnboarding(UID, { motivos: 'paz,sueno' })).rejects.toMatchObject({
      code: ERROR_CODES.FIELD_TYPE,
    })
  })
})

describe('cuándo queda onboarding pendiente (RN-DB-09)', () => {
  it('un árbol recién creado lo tiene pendiente', async () => {
    await initUserTree(UID)
    expect(await shared.onboardingPendiente(UID)).toBe(true)
  })

  it('un árbol de antes de que existiera también, porque nunca lo vio', async () => {
    await initUserTree(UID)
    await shared.saveOnboarding(UID, { completedSteps: [], currentStep: null })
    expect(await shared.onboardingPendiente(UID)).toBe(true)
  })

  it('lo decide la marca de cierre y no cuántos pasos se recorrieron', async () => {
    await initUserTree(UID)

    // Ocho pasos anotados y sin marca: sigue pendiente.
    await shared.updateOnboarding(UID, {
      completedSteps: ['p1', 'p2', 'p2a', 'p3', 'p4', 'p5', 'p6', 'p7'],
    })
    expect(await shared.onboardingPendiente(UID)).toBe(true)

    // Ni un paso anotado y con marca: hecho. Saltárselo todo es hacerlo.
    await shared.updateOnboarding(UID, {
      completedSteps: [],
      completedAt: new Date().toISOString(),
    })
    expect(await shared.onboardingPendiente(UID)).toBe(false)
  })
})

describe('mudar el árbol a la cuenta (P7)', () => {
  it('lo escrito antes de la cuenta se encuentra después bajo el uid nuevo', async () => {
    await initUserTree(UID)
    await shared.updateProfile(UID, { name: 'Alejandra', identidadCentral: 'se cuida.' })

    const { mudados } = await mudarUid(UID, CUENTA)

    expect(mudados).toBeGreaterThan(0)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect((await shared.getProfile(CUENTA)).identidadCentral).toBe('se cuida.')
    expect(await shared.getProfile(UID)).toBeNull()
  })

  it('lo mudado se reencola entero: son rutas que Firestore no ha visto', async () => {
    await initUserTree(UID)
    await mudarUid(UID, CUENTA)

    const cola = await listQueue()
    expect(cola.length).toBeGreaterThan(0)
    cola.forEach((entrada) => {
      expect(entrada.uid).toBe(CUENTA)
      expect(entrada.path).toContain(`users/${CUENTA}/`)
    })
    // Nada apunta ya al uid viejo: esas rutas no podría escribirlas nadie.
    expect(await listQueue(UID)).toEqual([])
  })

  it('el PIN se muda con el resto y sigue sin salir del dispositivo (RN-DB-04)', async () => {
    await initUserTree(UID)
    await diario.savePinConfig(UID, {
      salt: 'sal',
      hash: 'huella',
      iterations: 100000,
      algorithm: 'PBKDF2',
      enabled: true,
    })

    await mudarUid(UID, CUENTA)

    expect((await diario.getPinConfig(CUENTA)).enabled).toBe(true)
    const cola = await listQueue()
    expect(cola.some((entrada) => entrada.path.endsWith('/diario/pinConfig'))).toBe(false)
  })

  it('no pisa nada de lo que ya hubiera en la cuenta', async () => {
    // Alguien que vuelve a entrar en una cuenta que ya usó no pierde su
    // historial por haber escrito tres cosas en una sesión anónima.
    await initUserTree(CUENTA)
    await shared.updateProfile(CUENTA, { name: 'lo de siempre' })
    await initUserTree(UID)
    await shared.updateProfile(UID, { name: 'lo de esta sesión' })

    const { conservados } = await mudarUid(UID, CUENTA)

    expect(conservados).toBeGreaterThan(0)
    expect((await shared.getProfile(CUENTA)).name).toBe('lo de siempre')
    // Y lo que no se pudo mudar sigue donde estaba: no se descarta en silencio.
    expect((await shared.getProfile(UID)).name).toBe('lo de esta sesión')
  })

  it('mudar a uno mismo no hace nada', async () => {
    await initUserTree(UID)
    expect(await mudarUid(UID, UID)).toEqual({ mudados: 0, conservados: 0 })
    expect(await readPath(paths.sharedDoc(UID, 'profile'))).not.toBeNull()
  })
})
