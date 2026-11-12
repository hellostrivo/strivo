// src/lib/__tests__/salidaFaceId.test.js
// SPEC_23A (DP-23.12) — Cerrar sesión borra la clave de Face ID, sin frenar la
// salida, y solo en la app de iPhone.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as shared from '@lib/db/shared'
import { resetLocalDB } from '@lib/db/__tests__/helpers.js'
import { reiniciarTelefono, telefono } from './caraDeMentira.js'
import { NOMBRE_DE_LA_CLAVE } from '../biometria.js'

const CUENTA = 'AbC123firebaseUid'

const plataforma = vi.hoisted(() => ({ iphone: true }))
vi.mock('../plataforma.js', () => ({
  esNativa: () => plataforma.iphone,
  esIPhone: () => plataforma.iphone,
}))
vi.mock('../cuenta.js', () => ({ cerrarSesion: async () => {} }))
vi.mock('../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: async () => {},
  deleteDoc: async () => {},
}))
vi.mock('../avisos/reconciliar.js', () => ({ apagarAvisos: async () => {} }))
vi.mock('@capgo/capacitor-native-biometric', async () => ({
  NativeBiometric: (await import('./caraDeMentira.js')).telefono.plugin,
}))

const { salirDeCuenta } = await import('../salidaCuenta.js')

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

beforeEach(async () => {
  plataforma.iphone = true
  reiniciarTelefono()
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
  await shared.initShared(CUENTA, { profile: { name: 'Ale' } })
})

afterEach(() => vi.unstubAllGlobals())

describe('cerrar sesión y Face ID', () => {
  it('en el iPhone, salir borra la clave de la Keychain', async () => {
    telefono.estado.keychain.set(NOMBRE_DE_LA_CLAVE, 'k')
    expect(await salirDeCuenta(CUENTA)).toEqual({ ok: true })
    expect(telefono.estado.keychain.has(NOMBRE_DE_LA_CLAVE)).toBe(false)
    expect(telefono.estado.lecturas).toBe(0)
  })

  it('si el plugin falla, la salida sigue', async () => {
    const borrar = telefono.estado.keychain.delete
    telefono.estado.keychain.delete = () => {
      throw new Error('la Keychain dijo que no')
    }
    try {
      expect(await salirDeCuenta(CUENTA)).toEqual({ ok: true })
    } finally {
      telefono.estado.keychain.delete = borrar
    }
  })

  it('en la web no se toca el plugin', async () => {
    plataforma.iphone = false
    expect(await salirDeCuenta(CUENTA)).toEqual({ ok: true })
    expect(telefono.estado.llamadas).toEqual([])
  })
})
