// SPEC_25 — Cuándo empieza la prueba y cómo se fusiona (criterio 3).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as shared from '@lib/db/shared'
import { listQueue, mudarUid, readPath, writePath } from '@lib/db/local'
import { ganaOrigenAlMudar, hechosQueFaltan } from '@lib/db/conflictos'
import { paths } from '@lib/db/schema'
import { resetLocalDB } from '@lib/db/__tests__/helpers.js'

vi.mock('@lib/firebase', () => ({ db: null }))
const { inicioDePrueba } = await import('../inicioDePrueba.js')
const { terminarRecorrido } = await import('@/onboarding/escritura')
const { RESPUESTAS_INICIALES } = await import('@/onboarding/estado')

const LOCAL = 'local-a'
const CUENTA = 'AbC123firebaseUid'
const VIEJA = '2026-11-01T10:00:00.000Z'
const NUEVA = '2026-11-20T10:00:00.000Z'
const AHORA = new Date('2026-11-30T15:00:00.000Z')
const fechaDe = async (uid) => (await shared.getOnboarding(uid))?.fechaInicioPrueba

beforeEach(async () => {
  const m = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  })
  await resetLocalDB()
  await shared.initShared(LOCAL)
  await shared.initShared(CUENTA)
})
afterEach(() => vi.unstubAllGlobals())

describe('al terminar el onboarding', () => {
  const terminar = (iphone) =>
    terminarRecorrido(LOCAL, null, {
      respuestas: RESPUESTAS_INICIALES,
      paso: 'p8',
      recorridos: [],
      iphone,
    })

  it('en el iPhone se escribe con completedAt, el mismo instante', async () => {
    await terminar(true)
    const e = await shared.getOnboarding(LOCAL)
    expect(e.completedAt).toBeTruthy()
    expect(e.fechaInicioPrueba).toBe(e.completedAt)
  })

  it('en la web no (D3)', async () => {
    await terminar(false)
    expect((await shared.getOnboarding(LOCAL)).completedAt).toBeTruthy()
    expect(await fechaDe(LOCAL)).toBeUndefined()
  })

  it('la siembra no la trae', async () => {
    expect(await fechaDe(LOCAL)).toBeUndefined()
  })
})

describe('quien ya lo había terminado', () => {
  it('la recibe la primera vez, y una sola', async () => {
    await shared.updateOnboarding(LOCAL, { completedAt: VIEJA })
    const a = await inicioDePrueba(LOCAL, { sesion: 'sinCuenta', ahora: AHORA })
    const b = await inicioDePrueba(LOCAL, { sesion: 'sinCuenta', ahora: new Date() })
    expect(a).toBe(AHORA.toISOString())
    expect(b).toBe(a)
  })

  it('dos a la vez son una', async () => {
    await shared.updateOnboarding(LOCAL, { completedAt: VIEJA })
    const [a, b] = await Promise.all([
      inicioDePrueba(LOCAL, { sesion: 'sinCuenta', ahora: AHORA }),
      inicioDePrueba(LOCAL, { sesion: 'sinCuenta', ahora: new Date() }),
    ])
    expect(a).toBe(b)
  })

  it('sin onboarding terminado no empieza nada', async () => {
    expect(await inicioDePrueba(LOCAL, { sesion: 'sinCuenta', ahora: AHORA })).toBeNull()
    expect(await fechaDe(LOCAL)).toBeUndefined()
  })

  it('con cuenta, espera a que haya bajado lo suyo', async () => {
    await shared.updateOnboarding(CUENTA, { completedAt: VIEJA })
    expect(await inicioDePrueba(CUENTA, { sesion: 'conCuenta', ahora: AHORA })).toBeNull()
    localStorage.setItem(`strivo.restaurado.${CUENTA}`, VIEJA)
    expect(await inicioDePrueba(CUENTA, { sesion: 'conCuenta', ahora: AHORA })).toBe(
      AHORA.toISOString(),
    )
  })

  it('con la sesión vencida y ya bajada, también', async () => {
    await shared.updateOnboarding(CUENTA, { completedAt: VIEJA })
    localStorage.setItem(`strivo.restaurado.${CUENTA}`, VIEJA)
    expect(await inicioDePrueba(CUENTA, { sesion: 'vencida', ahora: AHORA })).toBeTruthy()
  })

  it('nunca toca el perfil', async () => {
    await shared.updateOnboarding(LOCAL, { completedAt: VIEJA })
    const antes = await shared.getProfile(LOCAL)
    await inicioDePrueba(LOCAL, { sesion: 'sinCuenta', ahora: AHORA })
    expect(await shared.getProfile(LOCAL)).toEqual(antes)
  })
})

describe('entre dos fechas gana la más antigua', () => {
  it.each([
    ['el ganador no la trae', {}, { fechaInicioPrueba: VIEJA }, { fechaInicioPrueba: VIEJA }],
    [
      'la del perdedor es más antigua',
      { fechaInicioPrueba: NUEVA },
      { fechaInicioPrueba: VIEJA },
      { fechaInicioPrueba: VIEJA },
    ],
    [
      'la del ganador es más antigua',
      { fechaInicioPrueba: VIEJA },
      { fechaInicioPrueba: NUEVA },
      {},
    ],
    ['iguales', { fechaInicioPrueba: VIEJA }, { fechaInicioPrueba: VIEJA }, {}],
    [
      'la del perdedor es ilegible',
      { fechaInicioPrueba: NUEVA },
      { fechaInicioPrueba: 'ayer' },
      {},
    ],
    [
      'la del ganador es ilegible: no se corrige',
      { fechaInicioPrueba: 'ayer' },
      { fechaInicioPrueba: VIEJA },
      {},
    ],
    ['el perdedor no la trae', { fechaInicioPrueba: NUEVA }, {}, {}],
  ])('%s', (_n, ganador, perdedor, faltan) => {
    expect(hechosQueFaltan(ganador, perdedor)).toEqual(faltan)
  })
})

describe('al mudar a una cuenta', () => {
  const mudar = () => mudarUid(LOCAL, CUENTA, { politica: ganaOrigenAlMudar })

  it('la cuenta con una más antigua la conserva', async () => {
    await shared.updateOnboarding(LOCAL, { completedAt: NUEVA, fechaInicioPrueba: NUEVA })
    await shared.updateOnboarding(CUENTA, { completedAt: VIEJA, fechaInicioPrueba: VIEJA })
    await mudar()
    expect(await fechaDe(CUENTA)).toBe(VIEJA)
  })

  it('la cuenta con una más nueva toma la del teléfono, y se encola', async () => {
    await shared.updateOnboarding(LOCAL, { completedAt: VIEJA, fechaInicioPrueba: VIEJA })
    await shared.updateOnboarding(CUENTA, { completedAt: NUEVA, fechaInicioPrueba: NUEVA })
    await mudar()
    expect(await fechaDe(CUENTA)).toBe(VIEJA)
    const cola = await listQueue(CUENTA)
    expect(cola.at(-1).data.fechaInicioPrueba).toBe(VIEJA)
  })

  it('una cuenta que aún no la tenía la recibe', async () => {
    await shared.updateOnboarding(LOCAL, { completedAt: NUEVA, fechaInicioPrueba: NUEVA })
    await shared.updateOnboarding(CUENTA, { completedAt: VIEJA })
    await mudar()
    expect(await fechaDe(CUENTA)).toBe(NUEVA)
  })

  it('volver a entrar a la misma cuenta no la reinicia', async () => {
    await shared.updateOnboarding(CUENTA, { completedAt: VIEJA, fechaInicioPrueba: VIEJA })
    localStorage.setItem(`strivo.restaurado.${CUENTA}`, VIEJA)
    expect(await inicioDePrueba(CUENTA, { sesion: 'conCuenta', ahora: AHORA })).toBe(VIEJA)
  })
})

it('viaja a la nube con el expediente y el modelo la admite', async () => {
  await shared.updateOnboarding(CUENTA, { completedAt: VIEJA, fechaInicioPrueba: VIEJA })
  const cola = await listQueue(CUENTA)
  expect(cola.map(({ path }) => path)).toContain(paths.sharedDoc(CUENTA, 'onboarding'))
  await writePath({
    uid: CUENTA,
    path: 'users/x/shared/onboarding',
    collection: 'shared',
    id: 'onboarding',
    data: { fechaInicioPrueba: VIEJA },
    sync: false,
  })
  expect(await readPath('users/x/shared/onboarding')).toEqual({ fechaInicioPrueba: VIEJA })
})
