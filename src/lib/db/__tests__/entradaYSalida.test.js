// src/lib/db/__tests__/entradaYSalida.test.js
// Las piezas de datos de entrar a una cuenta y de salir de ella (SPEC_19.1
// §4.4, §4.6 y §4.10; criterios 3 y 5, y la mitad de datos del 2).
//
// Aquí se prueban las piezas sueltas: la política de mudanza fila a fila,
// el borrado por uid y la promesa del vaciado en curso. El algoritmo entero
// —restaurar, mudar, anotar el correo— es `lib/__tests__/entradaCuenta.test.js`.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as shared from '../shared.js'
import * as diario from '../diario.js'
import { initUserTree } from '../index.js'
import { borrarUid, enqueue, listQueue, mudarUid, readPath, writePath } from '../local.js'
import { cancelRetries, flush, flushEnCurso } from '../sync.js'
import { ganaOrigenAlMudar } from '../conflictos.js'
import { paths } from '../schema.js'
import { UID, resetLocalDB } from './helpers.js'

const CUENTA = 'AbC123firebaseUid'
const T0 = '2026-09-17T12:00:00.000Z'
const T1 = '2026-09-18T12:00:00.000Z'

// Firestore de mentira con un setDoc que se puede dejar colgado.
const nube = { colgar: false, soltar: null }
vi.mock('../../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: async () => {
    if (nube.colgar) await new Promise((resolve) => (nube.soltar = resolve))
  },
  deleteDoc: async () => {},
}))

beforeEach(async () => {
  nube.colgar = false
  nube.soltar = null
  await resetLocalDB()
  vi.stubGlobal('navigator', { onLine: true })
})

afterEach(() => {
  cancelRetries()
  vi.unstubAllGlobals()
})

const rutas = async (uid) => (await listQueue(uid)).map((entrada) => entrada.path)

describe('ganaOrigenAlMudar: las dos reglas de siempre, juntas', () => {
  it('destino vacío: el origen se muda, sea cual sea la colección', () => {
    expect(ganaOrigenAlMudar('shared', { name: 'Ale' }, null)).toBe(true)
    expect(ganaOrigenAlMudar('diario/morningEntry', { action: 'x' }, null)).toBe(true)
  })

  it('shared: gana la cuenta aunque el origen sea más nuevo', () => {
    expect(
      ganaOrigenAlMudar(
        'shared',
        { name: 'Anónima', updatedAt: T1 },
        { name: 'Ale', updatedAt: T0 },
      ),
    ).toBe(false)
  })

  it('shared: si lo de la cuenta es semilla, entra el origen', () => {
    expect(ganaOrigenAlMudar('shared', { name: 'Ale', updatedAt: T0 }, { name: null })).toBe(true)
  })

  it('diario: gana lo más nuevo; el empate se queda en el destino', () => {
    const col = 'diario/morningEntry'
    expect(ganaOrigenAlMudar(col, { updatedAt: T1 }, { updatedAt: T0 })).toBe(true)
    expect(ganaOrigenAlMudar(col, { updatedAt: T0 }, { updatedAt: T1 })).toBe(false)
    expect(ganaOrigenAlMudar(col, { updatedAt: T0 }, { updatedAt: T0 })).toBe(false)
  })

  it('diario: un origen sin marca legible no le gana a nada escrito', () => {
    expect(ganaOrigenAlMudar('diario/morningEntry', { updatedAt: 'ayer' }, { updatedAt: T0 })).toBe(
      false,
    )
  })

  it('respiración usa su propio campo de marca', () => {
    const col = 'breathing/favoritos'
    expect(ganaOrigenAlMudar(col, { actualizadoEn: T1 }, { actualizadoEn: T0 })).toBe(true)
    expect(ganaOrigenAlMudar('breathing/sesiones', { a: 1 }, { a: 2 })).toBe(false)
  })
})

describe('mudarUid con política', () => {
  it('el origen que gana reemplaza al destino y se encola', async () => {
    await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'cuenta', updatedAt: T0 })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T1 })

    const r = await mudarUid(UID, CUENTA, { politica: ganaOrigenAlMudar })

    expect(r).toEqual({ mudados: 1, conservados: 0 })
    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('anónima')
    expect(await diario.getMorningEntry(UID, '2026-09-18')).toBeNull()
    expect(await rutas(CUENTA)).toContain(paths.diarioItem(CUENTA, 'morningEntry', '2026-09-18'))
  })

  it('el origen que pierde se queda bajo su uid y cuenta como conservado', async () => {
    await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'cuenta', updatedAt: T1 })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T0 })

    const r = await mudarUid(UID, CUENTA, { politica: ganaOrigenAlMudar })

    expect(r).toEqual({ mudados: 0, conservados: 1 })
    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('cuenta')
    expect((await diario.getMorningEntry(UID, '2026-09-18')).action).toBe('anónima')
  })

  it('la política decide también con el destino vacío', async () => {
    await shared.initShared(UID, { profile: { name: 'Ale' } })
    const nunca = () => false
    const r = await mudarUid(UID, CUENTA, { politica: nunca })
    expect(r.mudados).toBe(0)
    expect(await shared.getProfile(CUENTA)).toBeNull()
    expect((await shared.getProfile(UID)).name).toBe('Ale')
  })

  it('D4: de la cola del origen se retira solo lo que se mudó', async () => {
    const VENCIDA = 'cuentaVencida'
    await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'cuenta', updatedAt: T1 })
    await diario.saveMorningEntry(VENCIDA, '2026-09-18', { action: 'vencida', updatedAt: T0 })
    await diario.saveMorningEntry(VENCIDA, '2026-09-19', { action: 'vencida', updatedAt: T0 })
    expect(await rutas(VENCIDA)).toHaveLength(2)

    await mudarUid(VENCIDA, CUENTA, { politica: ganaOrigenAlMudar })

    // El 18 se conservó: su subida pendiente a la cuenta vencida sigue ahí.
    expect(await rutas(VENCIDA)).toEqual([paths.diarioItem(VENCIDA, 'morningEntry', '2026-09-18')])
    expect(await rutas(CUENTA)).toContain(paths.diarioItem(CUENTA, 'morningEntry', '2026-09-19'))
  })

  it('sin política, la cola del origen se vacía entera, como antes', async () => {
    await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'cuenta', updatedAt: T1 })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T0 })
    await mudarUid(UID, CUENTA)
    expect(await rutas(UID)).toEqual([])
  })

  it('la semilla no sube tampoco con política (DP-17.10)', async () => {
    await initUserTree(UID)
    await mudarUid(UID, CUENTA, { politica: ganaOrigenAlMudar })
    expect(await shared.getProfile(CUENTA)).not.toBeNull()
    expect(await rutas(CUENTA)).toEqual([])
  })
})

describe('criterio 5: borrarUid', () => {
  it('borra los registros y la cola del uid, PIN incluido', async () => {
    await initUserTree(CUENTA)
    await shared.updateProfile(CUENTA, { name: 'Ale' })
    await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'x', updatedAt: T0 })
    await writePath({
      uid: CUENTA,
      path: paths.diarioDoc(CUENTA, 'pinConfig'),
      collection: 'diario',
      id: 'pinConfig',
      data: { enabled: true },
      sync: false,
    })

    const r = await borrarUid(CUENTA)

    expect(r.registros).toBeGreaterThan(0)
    expect(r.cola).toBeGreaterThan(0)
    expect(await shared.getProfile(CUENTA)).toBeNull()
    expect(await readPath(paths.diarioDoc(CUENTA, 'pinConfig'))).toBeNull()
    expect(await diario.getMorningEntry(CUENTA, '2026-09-18')).toBeNull()
    expect(await rutas(CUENTA)).toEqual([])
  })

  it('no toca a otro uid, ni sus registros ni su cola', async () => {
    await shared.initShared(CUENTA, { profile: { name: 'Ale' } })
    await shared.initShared(UID, { profile: { name: 'Otra' } })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'otra', updatedAt: T0 })
    await enqueue({ uid: CUENTA, path: `users/${CUENTA}/x`, op: 'put', data: {} })

    await borrarUid(CUENTA)

    expect((await shared.getProfile(UID)).name).toBe('Otra')
    expect((await diario.getMorningEntry(UID, '2026-09-18')).action).toBe('otra')
    expect(await rutas(UID)).toHaveLength(1)
  })

  it('sin uid es un error de programación', async () => {
    await expect(borrarUid('')).rejects.toThrow()
  })
})

describe('D2: flushEnCurso, solo lectura', () => {
  it('sin vaciado en marcha es null', () => {
    expect(flushEnCurso()).toBeNull()
  })

  it('durante un vaciado devuelve su promesa, que resuelve al terminar', async () => {
    await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'x', updatedAt: T0 })
    nube.colgar = true
    const primero = flush(CUENTA)
    while (!nube.soltar) await new Promise((r) => setTimeout(r, 0))

    const segundo = await flush(CUENTA)
    expect(segundo.skipped).toBe('en_curso')
    const enVuelo = flushEnCurso()
    expect(enVuelo).toBeInstanceOf(Promise)

    nube.soltar()
    await enVuelo
    expect(await primero).toMatchObject({ sent: 1, pending: 0 })
    expect(flushEnCurso()).toBeNull()
  })
})
