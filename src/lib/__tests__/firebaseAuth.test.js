// src/lib/__tests__/firebaseAuth.test.js
// SPEC_21.1 §4.3 — qué Auth se crea en web y qué Auth se crea en la app de
// iPhone. Va en un archivo aparte de plataforma.test.js porque aquí la
// plataforma se finge con un mock, y allí se prueba la de verdad.

import { afterEach, describe, expect, it, vi } from 'vitest'

const persistencia = { type: 'LOCAL', nombre: 'indexedDB' }
const sdk = vi.hoisted(() => ({
  getAuth: vi.fn(() => ({ de: 'getAuth' })),
  initializeAuth: vi.fn(() => ({ de: 'initializeAuth' })),
}))

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({ app: true })) }))
vi.mock('firebase/firestore', () => ({ getFirestore: vi.fn(() => ({ db: true })) }))
vi.mock('firebase/auth', () => ({
  getAuth: sdk.getAuth,
  initializeAuth: sdk.initializeAuth,
  indexedDBLocalPersistence: { type: 'LOCAL', nombre: 'indexedDB' },
  GoogleAuthProvider: class {},
  OAuthProvider: class {},
}))

const plataforma = vi.hoisted(() => ({ nativa: false }))
vi.mock('../plataforma.js', () => ({ esNativa: () => plataforma.nativa }))

async function firebaseCon({ nativa }) {
  vi.resetModules()
  sdk.getAuth.mockClear()
  sdk.initializeAuth.mockClear()
  plataforma.nativa = nativa
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'clave-de-prueba')
  return import('../firebase.js')
}

describe('opcionesDeAuth (SPEC_21.1 §4.3)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('en web no hay opciones: se usa getAuth, como siempre', async () => {
    const { opcionesDeAuth } = await firebaseCon({ nativa: false })
    expect(opcionesDeAuth(false)).toBeNull()
  })

  it('en nativo, IndexedDB y sin resolvedor de ventanas emergentes', async () => {
    const { opcionesDeAuth } = await firebaseCon({ nativa: false })
    const opciones = opcionesDeAuth(true)
    expect(opciones).toEqual({ persistence: persistencia })
    expect(opciones).not.toHaveProperty('popupRedirectResolver')
  })

  it('en web la instancia sale de getAuth y no de initializeAuth', async () => {
    const { auth } = await firebaseCon({ nativa: false })
    expect(sdk.getAuth).toHaveBeenCalledTimes(1)
    expect(sdk.initializeAuth).not.toHaveBeenCalled()
    expect(auth).toEqual({ de: 'getAuth' })
  })

  it('en nativo la instancia sale de initializeAuth, con esas opciones', async () => {
    const { auth } = await firebaseCon({ nativa: true })
    expect(sdk.getAuth).not.toHaveBeenCalled()
    expect(sdk.initializeAuth).toHaveBeenCalledWith({ app: true }, { persistence: persistencia })
    expect(auth).toEqual({ de: 'initializeAuth' })
  })
})
