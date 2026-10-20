// src/lib/__tests__/salidaCuenta.test.js
// Cerrar sesión sin perder lo que no subió (SPEC_19.1 §4.7; criterio 6).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as shared from '@lib/db/shared'
import * as diario from '@lib/db/diario'
import { pendingCount } from '@lib/db/local'
import { hayMarcaDeRestauracion } from '@lib/db/restaurar'
import { resetLocalDB } from '@lib/db/__tests__/helpers.js'

const CUENTA = 'AbC123firebaseUid'
const OTRA = 'local-de-antes'
const T0 = '2026-09-17T12:00:00.000Z'

const sesion = { cerradas: 0 }
vi.mock('../cuenta.js', () => ({
  cerrarSesion: async () => {
    sesion.cerradas += 1
  },
}))

const nube = { colgar: false, soltar: null }
vi.mock('../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: async () => {
    if (nube.colgar) await new Promise((resolve) => (nube.soltar = resolve))
  },
  deleteDoc: async () => {},
}))

const { SALIDA, comprobarSalida, salirDeCuenta } = await import('../salidaCuenta.js')

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

beforeEach(async () => {
  sesion.cerradas = 0
  nube.colgar = false
  nube.soltar = null
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
  await shared.initShared(CUENTA, { profile: { name: 'Ale' } })
  await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'x', updatedAt: T0 })
  localStorage.setItem(`strivo.restaurado.${CUENTA}`, T0)
})

afterEach(() => vi.unstubAllGlobals())

describe('criterio 6: con la cola pendiente no se sale', () => {
  it('sin red, la comprobación dice pendiente', async () => {
    vi.stubGlobal('navigator', { onLine: false })
    expect(await comprobarSalida(CUENTA)).toBe(SALIDA.pendiente)
  })

  it('y salir no llama a signOut ni borra nada', async () => {
    vi.stubGlobal('navigator', { onLine: false })
    expect(await salirDeCuenta(CUENTA)).toEqual({ ok: false, motivo: 'pendiente' })
    expect(sesion.cerradas).toBe(0)
    expect((await shared.getProfile(CUENTA)).name).toBe('Ale')
    expect(await pendingCount(CUENTA)).toBeGreaterThan(0)
    expect(hayMarcaDeRestauracion(CUENTA)).toBe(true)
  })
})

describe('con la cola vacía, se sale y se borra todo lo del uid', () => {
  it('con red, la comprobación sube lo pendiente y dice libre', async () => {
    expect(await comprobarSalida(CUENTA)).toBe(SALIDA.libre)
    expect(await pendingCount(CUENTA)).toBe(0)
  })

  it('salir cierra la sesión, borra registros, cola y marca, y no toca otro uid', async () => {
    await shared.initShared(OTRA, { profile: { name: 'De antes' } })

    expect(await salirDeCuenta(CUENTA)).toEqual({ ok: true })

    expect(sesion.cerradas).toBe(1)
    expect(await shared.getProfile(CUENTA)).toBeNull()
    expect(await diario.getMorningEntry(CUENTA, '2026-09-18')).toBeNull()
    expect(await pendingCount(CUENTA)).toBe(0)
    expect(hayMarcaDeRestauracion(CUENTA)).toBe(false)
    expect((await shared.getProfile(OTRA)).name).toBe('De antes')
  })

  it('si ya había un vaciado en marcha, espera a que termine antes de contar', async () => {
    nube.colgar = true
    const { flush } = await import('@lib/db/sync')
    const enMarcha = flush(CUENTA)
    while (!nube.soltar) await new Promise((r) => setTimeout(r, 0))

    const comprobacion = comprobarSalida(CUENTA)
    await new Promise((r) => setTimeout(r, 0))
    nube.colgar = false
    nube.soltar()

    await enMarcha
    // Contar a mitad habría dicho "pendiente" de lo que estaba subiendo.
    expect(await comprobacion).toBe(SALIDA.libre)
  })
})
