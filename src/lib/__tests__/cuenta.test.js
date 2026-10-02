// src/lib/__tests__/cuenta.test.js
// Entrar, recuperar, salir y el campo `nueva` (SPEC_19.1 §4.5; criterios 7, 8 y 12).
//
// Firebase Auth se sustituye por un doble: aquí no se prueba Firebase, se
// prueba qué hace la app con cada respuesta suya. Cada prueba dice qué debe
// contestar el doble y comprueba la traducción a un motivo sin código.

import { beforeEach, describe, expect, it, vi } from 'vitest'

const instancia = { languageCode: null }
const firebase = { auth: instancia }

const respuestas = {
  crear: null,
  entrar: null,
  popup: null,
  recuperar: null,
  isNewUser: undefined,
}
const llamadas = { crear: 0, entrar: 0, recuperar: 0, salir: 0 }

function contestar(respuesta) {
  if (respuesta instanceof Error) throw respuesta
  return respuesta
}

function errorDeAuth(code) {
  return Object.assign(new Error(code), { code })
}

vi.mock('@lib/firebase', () => ({
  get auth() {
    return firebase.auth
  },
  googleProvider: { id: 'google' },
  appleProvider: { id: 'apple' },
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: async () => {
    llamadas.crear += 1
    return contestar(respuestas.crear)
  },
  signInWithEmailAndPassword: async () => {
    llamadas.entrar += 1
    return contestar(respuestas.entrar)
  },
  signInWithPopup: async () => contestar(respuestas.popup),
  getAdditionalUserInfo: () =>
    respuestas.isNewUser === undefined ? null : { isNewUser: respuestas.isNewUser },
  sendPasswordResetEmail: async () => {
    llamadas.recuperar += 1
    return contestar(respuestas.recuperar)
  },
  signOut: async () => {
    llamadas.salir += 1
  },
}))

const {
  MOTIVOS,
  PROVEEDORES_WEB,
  cerrarSesion,
  crearConCorreo,
  entrarConCorreo,
  entrarConProveedor,
  recuperarContrasena,
} = await import('../cuenta.js')

const USUARIO = { user: { uid: 'AbC123firebaseUid', email: 'ale@ejemplo.com' } }

beforeEach(() => {
  firebase.auth = instancia
  instancia.languageCode = null
  Object.assign(respuestas, {
    crear: USUARIO,
    entrar: USUARIO,
    popup: USUARIO,
    recuperar: undefined,
    isNewUser: undefined,
  })
  Object.keys(llamadas).forEach((k) => (llamadas[k] = 0))
})

describe('entrarConCorreo: entra, nunca crea', () => {
  it('con credenciales correctas devuelve el uid y el correo', async () => {
    expect(await entrarConCorreo('ale@ejemplo.com', 'secreto123')).toEqual({
      ok: true,
      uid: 'AbC123firebaseUid',
      email: 'ale@ejemplo.com',
    })
    expect(llamadas.crear).toBe(0)
  })

  it('criterio 8: invalid-credential es "credenciales"', async () => {
    respuestas.entrar = errorDeAuth('auth/invalid-credential')
    expect(await entrarConCorreo('a@b.c', 'x')).toEqual({
      ok: false,
      motivo: MOTIVOS.credenciales,
    })
  })

  it.each(['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'])(
    '%s también: no se dice si el correo tiene cuenta',
    async (code) => {
      respuestas.entrar = errorDeAuth(code)
      expect((await entrarConCorreo('a@b.c', 'x')).motivo).toBe(MOTIVOS.credenciales)
    },
  )

  it('sin red es "sinConexion"', async () => {
    respuestas.entrar = errorDeAuth('auth/network-request-failed')
    expect((await entrarConCorreo('a@b.c', 'x')).motivo).toBe(MOTIVOS.sinConexion)
  })

  it('cualquier otra cosa es "generico", sin código a la vista', async () => {
    respuestas.entrar = errorDeAuth('auth/too-many-requests')
    const r = await entrarConCorreo('a@b.c', 'x')
    expect(r.motivo).toBe(MOTIVOS.generico)
    expect(JSON.stringify(r)).not.toMatch(/auth\//)
  })

  it('sin configuración no toca nada', async () => {
    firebase.auth = undefined
    expect(await entrarConCorreo('a@b.c', 'x')).toEqual({
      ok: false,
      motivo: MOTIVOS.sinConfigurar,
    })
    expect(llamadas.entrar).toBe(0)
  })
})

describe('recuperarContrasena: la misma respuesta exista o no la cuenta', () => {
  it('criterio 7: user-not-found devuelve ok', async () => {
    respuestas.recuperar = errorDeAuth('auth/user-not-found')
    expect(await recuperarContrasena('nadie@ejemplo.com')).toEqual({ ok: true })
  })

  it('un correo que existe devuelve exactamente lo mismo', async () => {
    expect(await recuperarContrasena('ale@ejemplo.com')).toEqual({ ok: true })
    expect(llamadas.recuperar).toBe(1)
  })

  it('invalid-email y otros tropiezos también devuelven ok', async () => {
    respuestas.recuperar = errorDeAuth('auth/invalid-email')
    expect(await recuperarContrasena('no-es-correo')).toEqual({ ok: true })
    respuestas.recuperar = errorDeAuth('auth/too-many-requests')
    expect(await recuperarContrasena('a@b.c')).toEqual({ ok: true })
  })

  it('solo la falta de red se dice', async () => {
    respuestas.recuperar = errorDeAuth('auth/network-request-failed')
    expect(await recuperarContrasena('a@b.c')).toEqual({
      ok: false,
      motivo: MOTIVOS.sinConexion,
    })
  })

  it('y la de configuración', async () => {
    firebase.auth = undefined
    expect(await recuperarContrasena('a@b.c')).toEqual({
      ok: false,
      motivo: MOTIVOS.sinConfigurar,
    })
  })

  it('pide el correo en español', async () => {
    await recuperarContrasena('a@b.c')
    expect(instancia.languageCode).toBe('es')
  })
})

describe('cerrarSesion', () => {
  it('llama a signOut', async () => {
    await cerrarSesion()
    expect(llamadas.salir).toBe(1)
  })

  it('sin configuración no hace nada y no lanza', async () => {
    firebase.auth = undefined
    await expect(cerrarSesion()).resolves.toBeUndefined()
    expect(llamadas.salir).toBe(0)
  })
})

describe('`nueva`: si la cuenta se acaba de crear', () => {
  it('crearConCorreo que crea: nueva', async () => {
    expect((await crearConCorreo('a@b.c', 'secreto123')).nueva).toBe(true)
  })

  it('crearConCorreo que acaba entrando a una que existía: no nueva', async () => {
    respuestas.crear = errorDeAuth('auth/email-already-in-use')
    const r = await crearConCorreo('a@b.c', 'secreto123')
    expect(r.ok).toBe(true)
    expect(r.nueva).toBe(false)
  })

  it('P7 conserva su mapeo: contraseña que no coincide sigue siendo "correo en uso"', async () => {
    respuestas.crear = errorDeAuth('auth/email-already-in-use')
    respuestas.entrar = errorDeAuth('auth/invalid-credential')
    expect((await crearConCorreo('a@b.c', 'x')).motivo).toBe(MOTIVOS.correoEnUso)
  })

  it('Google con cuenta recién creada: nueva', async () => {
    respuestas.isNewUser = true
    expect((await entrarConProveedor('google')).nueva).toBe(true)
  })

  it('Google con cuenta que ya existía, o sin información adicional: no nueva', async () => {
    respuestas.isNewUser = false
    expect((await entrarConProveedor('google')).nueva).toBe(false)
    respuestas.isNewUser = undefined
    expect((await entrarConProveedor('google')).nueva).toBe(false)
  })
})

describe('criterio 12: Apple no se ofrece en web (DP-19.4)', () => {
  it('la lista de proveedores web es solo Google', () => {
    expect(PROVEEDORES_WEB).toEqual(['google'])
  })
})
