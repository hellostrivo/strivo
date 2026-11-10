// src/lib/__tests__/firebaseFirestore.test.js
// SPEC_31, DP-31.1 — qué Firestore se crea en web y qué Firestore se crea en
// la app de iPhone. En web, `getFirestore` y nada más; en nativo,
// `initializeFirestore` con long polling forzado.

import { afterEach, describe, expect, it, vi } from 'vitest'

const sdk = vi.hoisted(() => ({
  getFirestore: vi.fn(() => ({ de: 'getFirestore' })),
  initializeFirestore: vi.fn(() => ({ de: 'initializeFirestore' })),
}))

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({ app: true })) }))
vi.mock('firebase/firestore', () => ({
  getFirestore: sdk.getFirestore,
  initializeFirestore: sdk.initializeFirestore,
}))
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  initializeAuth: vi.fn(() => ({})),
  indexedDBLocalPersistence: {},
  GoogleAuthProvider: class {},
  OAuthProvider: class {},
}))

const plataforma = vi.hoisted(() => ({ nativa: false }))
vi.mock('../plataforma.js', () => ({ esNativa: () => plataforma.nativa }))

async function firebaseCon({ nativa }) {
  vi.resetModules()
  sdk.getFirestore.mockClear()
  sdk.initializeFirestore.mockClear()
  plataforma.nativa = nativa
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'clave-de-prueba')
  return import('../firebase.js')
}

describe('opcionesDeFirestore (SPEC_31, DP-31.1)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('en web no hay opciones', async () => {
    const { opcionesDeFirestore } = await firebaseCon({ nativa: false })
    expect(opcionesDeFirestore(false)).toBeNull()
  })

  it('en nativo, long polling forzado y nada más', async () => {
    const { opcionesDeFirestore } = await firebaseCon({ nativa: false })
    expect(opcionesDeFirestore(true)).toEqual({ experimentalForceLongPolling: true })
  })

  it('en web la instancia sale de getFirestore y no de initializeFirestore', async () => {
    const { db } = await firebaseCon({ nativa: false })
    expect(sdk.getFirestore).toHaveBeenCalledTimes(1)
    expect(sdk.initializeFirestore).not.toHaveBeenCalled()
    expect(db).toEqual({ de: 'getFirestore' })
  })

  it('en nativo la instancia sale de initializeFirestore, con long polling', async () => {
    const { db } = await firebaseCon({ nativa: true })
    expect(sdk.getFirestore).not.toHaveBeenCalled()
    expect(sdk.initializeFirestore).toHaveBeenCalledWith(
      { app: true },
      { experimentalForceLongPolling: true },
    )
    expect(db).toEqual({ de: 'initializeFirestore' })
  })
})
