// src/lib/__tests__/proveedoresNativos.test.js
// SPEC_21.2 — entrar y salir con Google y Apple, en web y en la app de iPhone.
//
// Firebase y el plugin son dobles. Lo que se prueba es el camino de cada
// plataforma (ventana emergente en web, credencial nativa en iPhone), que la
// respuesta tenga la misma forma en los dos, y cómo se traduce cada tropiezo a
// un motivo: cancelar no es un error, otro método tiene su frase, y lo que no
// se reconoce es genérico y nunca «falló la red».

import { beforeEach, describe, expect, it, vi } from 'vitest'

const instancia = { currentUser: null }
const firebase = { auth: instancia }

const respuestas = { popup: null, credencial: null, isNewUser: undefined, salir: null }
const llamadas = { popup: [], credencial: [], salir: 0 }

const plugin = {
  cargado: 0,
  apple: null,
  google: null,
  salir: null,
  llamadas: { apple: 0, google: 0, salir: 0 },
}

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
  signInWithPopup: async (_auth, proveedor) => {
    llamadas.popup.push(proveedor)
    return contestar(respuestas.popup)
  },
  signInWithCredential: async (_auth, credencial) => {
    llamadas.credencial.push(credencial)
    return contestar(respuestas.credencial)
  },
  getAdditionalUserInfo: () =>
    respuestas.isNewUser === undefined ? null : { isNewUser: respuestas.isNewUser },
  signOut: async () => {
    llamadas.salir += 1
    return contestar(respuestas.salir)
  },
  OAuthProvider: class {
    constructor(id) {
      this.id = id
    }
    credential(datos) {
      return { proveedor: this.id, ...datos }
    }
  },
  GoogleAuthProvider: { credential: (idToken) => ({ proveedor: 'google.com', idToken }) },
}))

// El plugin: la fábrica cuenta cuántas veces se carga, que es lo que dice si
// la web lo tocó.
vi.mock('@capacitor-firebase/authentication', () => {
  plugin.cargado += 1
  return {
    FirebaseAuthentication: {
      signInWithApple: async () => {
        plugin.llamadas.apple += 1
        return contestar(plugin.apple)
      },
      signInWithGoogle: async () => {
        plugin.llamadas.google += 1
        return contestar(plugin.google)
      },
      signOut: async () => {
        plugin.llamadas.salir += 1
        return contestar(plugin.salir)
      },
    },
  }
})

const { MOTIVOS, claveDeError, cerrarSesion, entrarConProveedor, esCorreoOculto } =
  await import('../cuenta.js')

const USUARIO = { user: { uid: 'UidDeFirebase', email: 'ale@ejemplo.com' } }
const APPLE = {
  credential: { idToken: 'token-apple', nonce: 'nonce' },
  user: { displayName: 'Ale' },
}
const GOOGLE = { credential: { idToken: 'token-google' } }

const CANCELAR_APPLE = new Error(
  'No se ha podido completar la operación. (com.apple.AuthenticationServices.AuthorizationError error 1001.)',
)
const CANCELAR_GOOGLE = new Error('The user canceled the sign-in flow.')

const NATIVA = { nativa: true }
const WEB = { nativa: false }

function conSesion(signInProvider) {
  instancia.currentUser = { getIdTokenResult: async () => ({ signInProvider }) }
}

beforeEach(() => {
  firebase.auth = instancia
  instancia.currentUser = null
  Object.assign(respuestas, {
    popup: USUARIO,
    credencial: USUARIO,
    isNewUser: undefined,
    salir: null,
  })
  llamadas.popup.length = 0
  llamadas.credencial.length = 0
  llamadas.salir = 0
  Object.assign(plugin, { apple: APPLE, google: GOOGLE, salir: null })
  plugin.llamadas = { apple: 0, google: 0, salir: 0 }
})

// Va primero a propósito: las pruebas nativas de abajo cargan el plugin, y lo
// que se comprueba aquí es que entrar por web no lo carga nunca.
describe('en web el plugin no se carga (criterio 3)', () => {
  it('entrar con Google por web no importa el plugin', async () => {
    await entrarConProveedor('google', WEB)
    conSesion('google.com')
    await cerrarSesion(WEB)
    expect(plugin.cargado).toBe(0)
  })
})

describe('en la app de iPhone: la hoja nativa y signInWithCredential', () => {
  it('Apple llega a signInWithCredential con idToken y rawNonce', async () => {
    const r = await entrarConProveedor('apple', NATIVA)
    expect(r).toEqual({ ok: true, uid: 'UidDeFirebase', email: 'ale@ejemplo.com', nueva: false })
    expect(llamadas.credencial).toEqual([
      { proveedor: 'apple.com', idToken: 'token-apple', rawNonce: 'nonce' },
    ])
    expect(llamadas.popup).toEqual([])
  })

  it('Google llega con su idToken', async () => {
    await entrarConProveedor('google', NATIVA)
    expect(llamadas.credencial).toEqual([{ proveedor: 'google.com', idToken: 'token-google' }])
    expect(plugin.llamadas).toMatchObject({ apple: 0, google: 1 })
  })

  it('el botón de Apple nunca abre la hoja de Google', async () => {
    await entrarConProveedor('apple', NATIVA)
    expect(plugin.llamadas).toMatchObject({ apple: 1, google: 0 })
  })

  it('`nueva` sale de isNewUser, como en web', async () => {
    respuestas.isNewUser = true
    expect((await entrarConProveedor('apple', NATIVA)).nueva).toBe(true)
    respuestas.isNewUser = false
    expect((await entrarConProveedor('google', NATIVA)).nueva).toBe(false)
  })

  it('el nombre que devuelve Apple no sale en la respuesta', async () => {
    const r = await entrarConProveedor('apple', NATIVA)
    expect(Object.keys(r).sort()).toEqual(['email', 'nueva', 'ok', 'uid'])
    expect(JSON.stringify(r)).not.toMatch(/Ale"|displayName/)
  })
})

describe('en web: la ventana emergente de siempre, y el plugin ni se carga', () => {
  it('Google por signInWithPopup', async () => {
    const cargadoAntes = plugin.cargado
    await entrarConProveedor('google', WEB)
    expect(llamadas.popup).toEqual([{ id: 'google' }])
    expect(llamadas.credencial).toEqual([])
    expect(plugin.cargado).toBe(cargadoAntes)
  })

  it('sin decirle la plataforma pregunta a esNativa, que en las pruebas es web', async () => {
    await entrarConProveedor('google')
    expect(llamadas.popup).toHaveLength(1)
    expect(plugin.llamadas.google).toBe(0)
  })
})

describe('cancelar no es un error (SPEC_21.2 §4.2)', () => {
  it('Apple: rechazado, y ningún texto', async () => {
    plugin.apple = CANCELAR_APPLE
    const r = await entrarConProveedor('apple', NATIVA)
    expect(r).toEqual({ ok: false, motivo: MOTIVOS.rechazado })
    expect(claveDeError(r.motivo)).toBeNull()
  })

  it('Apple con el mensaje en español, en el orden del español: también rechazado', async () => {
    plugin.apple = new Error(
      'No se ha podido completar la operación. (Error de com.apple.AuthenticationServices.AuthorizationError 1001).',
    )
    const r = await entrarConProveedor('apple', NATIVA)
    expect(r).toEqual({ ok: false, motivo: MOTIVOS.rechazado })
    expect(claveDeError(r.motivo)).toBeNull()
  })

  it('Google: rechazado, y ningún texto', async () => {
    plugin.google = CANCELAR_GOOGLE
    const r = await entrarConProveedor('google', NATIVA)
    expect(r.motivo).toBe(MOTIVOS.rechazado)
    expect(claveDeError(r.motivo)).toBeNull()
  })

  it('en web, cerrar la ventana tampoco', async () => {
    respuestas.popup = errorDeAuth('auth/popup-closed-by-user')
    expect((await entrarConProveedor('google', WEB)).motivo).toBe(MOTIVOS.rechazado)
  })
})

describe('los tropiezos de un proveedor tienen su propio mapeo', () => {
  it('account-exists-with-different-credential es otroMetodo, con su frase', async () => {
    respuestas.credencial = errorDeAuth('auth/account-exists-with-different-credential')
    const r = await entrarConProveedor('google', NATIVA)
    expect(r.motivo).toBe(MOTIVOS.otroMetodo)
    expect(claveDeError(r.motivo)).toBe('otroMetodo')
  })

  it('también en web', async () => {
    respuestas.popup = errorDeAuth('auth/account-exists-with-different-credential')
    expect((await entrarConProveedor('google', WEB)).motivo).toBe(MOTIVOS.otroMetodo)
  })

  it('invalid-credential de Google o Apple nunca es «correo en uso»', async () => {
    respuestas.credencial = errorDeAuth('auth/invalid-credential')
    for (const cual of ['apple', 'google']) {
      const r = await entrarConProveedor(cual, NATIVA)
      expect(r.motivo).toBe(MOTIVOS.generico)
      expect(r.motivo).not.toBe(MOTIVOS.correoEnUso)
    }
  })

  it('un rechazo del plugin sin código es genérico, nunca falloRed', async () => {
    plugin.apple = new Error('The operation couldn’t be completed. (… error 1000.)')
    const r = await entrarConProveedor('apple', NATIVA)
    expect(r.motivo).toBe(MOTIVOS.generico)
    expect(r.motivo).not.toBe(MOTIVOS.falloRed)
  })

  it('sin red es sinConexion', async () => {
    respuestas.credencial = errorDeAuth('auth/network-request-failed')
    expect((await entrarConProveedor('google', NATIVA)).motivo).toBe(MOTIVOS.sinConexion)
  })

  it('ninguna respuesta lleva un código a la vista', async () => {
    respuestas.credencial = errorDeAuth('auth/too-many-requests')
    expect(JSON.stringify(await entrarConProveedor('google', NATIVA))).not.toMatch(/auth\//)
  })

  it('sin configuración no se abre ninguna hoja', async () => {
    firebase.auth = undefined
    expect(await entrarConProveedor('apple', NATIVA)).toEqual({
      ok: false,
      motivo: MOTIVOS.sinConfigurar,
    })
    expect(plugin.llamadas.apple).toBe(0)
  })
})

describe('cerrar sesión cierra también la del plugin (DP-21.2.8)', () => {
  it.each(['google.com', 'apple.com'])('en nativo, tras entrar con %s', async (metodo) => {
    conSesion(metodo)
    await cerrarSesion(NATIVA)
    expect(llamadas.salir).toBe(1)
    expect(plugin.llamadas.salir).toBe(1)
  })

  it('con correo, el plugin no se toca: sin el plist cerraría la app', async () => {
    conSesion('password')
    await cerrarSesion(NATIVA)
    expect(llamadas.salir).toBe(1)
    expect(plugin.llamadas.salir).toBe(0)
  })

  it('si no se puede saber con qué se entró, tampoco', async () => {
    instancia.currentUser = {
      getIdTokenResult: async () => {
        throw errorDeAuth('auth/network-request-failed')
      },
    }
    await cerrarSesion(NATIVA)
    expect(plugin.llamadas.salir).toBe(0)
  })

  it('si el cierre del plugin falla, la salida sigue', async () => {
    conSesion('google.com')
    plugin.salir = new Error('el plugin no pudo')
    await expect(cerrarSesion(NATIVA)).resolves.toBeUndefined()
    expect(llamadas.salir).toBe(1)
  })

  it('en web, nunca', async () => {
    conSesion('google.com')
    await cerrarSesion(WEB)
    expect(plugin.llamadas.salir).toBe(0)
  })

  it('primero se cierra la de JavaScript: si esa falla, el plugin no se toca', async () => {
    conSesion('google.com')
    respuestas.salir = errorDeAuth('auth/internal-error')
    await expect(cerrarSesion(NATIVA)).rejects.toThrow()
    expect(plugin.llamadas.salir).toBe(0)
  })
})

describe('esCorreoOculto: el correo que inventa Apple (DP-21.2.6)', () => {
  it.each(['abc123@privaterelay.appleid.com', 'X@PrivateRelay.AppleID.com '])('%s, sí', (c) => {
    expect(esCorreoOculto(c)).toBe(true)
  })

  it.each(['ale@icloud.com', 'privaterelay.appleid.com@ejemplo.com', null, ''])('%s, no', (c) => {
    expect(esCorreoOculto(c)).toBe(false)
  })
})
