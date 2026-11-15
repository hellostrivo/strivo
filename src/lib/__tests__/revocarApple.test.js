// SPEC_24B — Revocar el token de Apple (DP-24.11, camino (c)) y reautenticar
// para borrar sin el PIN (DP-24.18).

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aTiempo, pluginDeCapacitor } from './dobleDeCapacitor.js'
import { BUNDLE_ID, URL_DE_REVOCACION, cuerpoDeRevocacion, revocarApple } from '../revocarApple.js'
import { codigoDeAutorizacion, credencialNativa, datosDeCredencial } from '../credencialNativa.js'

describe('revocarApple', () => {
  it('manda lo mismo que el SDK de iOS: tokenType "3", el código y el idToken', () => {
    expect(cuerpoDeRevocacion('codigo', 'id')).toEqual({
      providerId: 'apple.com',
      tokenType: '3',
      token: 'codigo',
      idToken: 'id',
    })
  })

  it('a v2/accounts:revokeToken con la clave web y la cabecera del bundle', async () => {
    const pedir = vi.fn(async () => ({ ok: true, status: 200 }))
    await revocarApple({ codigo: 'c', idToken: 'i', apiKey: 'clave web' }, { pedir })
    const [url, opciones] = pedir.mock.calls[0]
    expect(url).toBe(`${URL_DE_REVOCACION}?key=clave%20web`)
    expect(URL_DE_REVOCACION).toBe('https://identitytoolkit.googleapis.com/v2/accounts:revokeToken')
    expect(opciones.method).toBe('POST')
    expect(opciones.headers).toEqual({
      'Content-Type': 'application/json',
      'X-Ios-Bundle-Identifier': BUNDLE_ID,
    })
    expect(BUNDLE_ID).toBe('com.hellostrivo.strivo')
    expect(JSON.parse(opciones.body)).toEqual(cuerpoDeRevocacion('c', 'i'))
  })

  it('una respuesta que no es ok lanza: el borrado se para antes de la nube', async () => {
    const pedir = async () => ({ ok: false, status: 400 })
    await expect(
      revocarApple({ codigo: 'c', idToken: 'i', apiKey: 'k' }, { pedir }),
    ).rejects.toThrow()
  })

  it('sin código, sin token o sin clave, lanza sin llamar a nadie', async () => {
    const pedir = vi.fn()
    for (const datos of [
      { idToken: 'i', apiKey: 'k' },
      { codigo: 'c', apiKey: 'k' },
      { codigo: 'c', idToken: 'i' },
    ]) {
      await expect(revocarApple(datos, { pedir })).rejects.toThrow()
    }
    expect(pedir).not.toHaveBeenCalled()
  })

  it('una red colgada no se queda esperando para siempre', async () => {
    const pedir = () => new Promise(() => {})
    await expect(
      aTiempo(revocarApple({ codigo: 'c', idToken: 'i', apiKey: 'k' }, { pedir, limiteMs: 20 })),
    ).rejects.toThrow()
  })
})

describe('el código de autorización de Apple (criterio 12)', () => {
  const respuesta = {
    credential: { idToken: 'token', nonce: 'nonce', authorizationCode: 'codigo' },
    additionalUserInfo: { profile: { name: 'Nombre De Apple' } },
  }

  it('datosDeCredencial sigue sin tomar ni el código ni el nombre', () => {
    const datos = datosDeCredencial('apple', respuesta)
    expect(datos).toEqual({ idToken: 'token', rawNonce: 'nonce' })
    expect(JSON.stringify(datos)).not.toMatch(/codigo|Nombre/)
  })

  it('codigoDeAutorizacion lo toma solo para el borrado', () => {
    expect(codigoDeAutorizacion(respuesta)).toBe('codigo')
    expect(codigoDeAutorizacion({ credential: {} })).toBe(null)
  })

  it('con conCodigo, una sola hoja da la credencial y el código; sin él, solo la credencial', async () => {
    let hojas = 0
    const cargar = async () => ({
      plugin: pluginDeCapacitor({
        signInWithApple: async () => {
          hojas += 1
          return respuesta
        },
      }),
    })
    const firebaseAuth = async () => ({
      OAuthProvider: class {
        constructor(id) {
          this.id = id
        }
        credential(datos) {
          return { proveedor: this.id, ...datos }
        }
      },
      GoogleAuthProvider: {},
    })
    const conCodigo = await aTiempo(
      credencialNativa('apple', { cargar, firebaseAuth, conCodigo: true }),
    )
    expect(conCodigo).toEqual({
      credencial: { proveedor: 'apple.com', idToken: 'token', rawNonce: 'nonce' },
      codigo: 'codigo',
    })
    const sinCodigo = await aTiempo(credencialNativa('apple', { cargar, firebaseAuth }))
    expect(sinCodigo).toEqual({ proveedor: 'apple.com', idToken: 'token', rawNonce: 'nonce' })
    expect(hojas).toBe(2)
  })
})

// ─── reautenticarCuenta (DP-24.18) ───────────────────────────────────────────

const sesion = { usuario: null, fallo: null, codigo: 'codigo-apple' }
const llamadas = []

vi.mock('../firebase.js', () => ({
  get auth() {
    return { currentUser: sesion.usuario }
  },
  get db() {
    return null
  },
  googleProvider: { id: 'google' },
  appleProvider: { id: 'apple' },
}))
vi.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: (email, contrasena) => ({ email, contrasena }) },
  reauthenticateWithCredential: async (_u, credencial) => {
    llamadas.push(['credencial', credencial])
    if (sesion.fallo) throw Object.assign(new Error('x'), { code: sesion.fallo })
  },
  reauthenticateWithPopup: async (_u, proveedor) => {
    llamadas.push(['popup', proveedor])
    if (sesion.fallo) throw Object.assign(new Error('x'), { code: sesion.fallo })
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
vi.mock('@capacitor-firebase/authentication', async () => {
  const { pluginDeCapacitor: doble } = await import('./dobleDeCapacitor.js')
  return {
    FirebaseAuthentication: doble({
      signInWithApple: async () => ({
        credential: { idToken: 't', nonce: 'n', authorizationCode: sesion.codigo },
      }),
      signInWithGoogle: async () => ({ credential: { idToken: 'g' } }),
    }),
  }
})

const { reautenticarCuenta, motivoDeReautenticacion } = await import('../reautenticacion.js')

function con(proveedor) {
  sesion.usuario = {
    uid: 'u',
    email: 'a@b.c',
    getIdTokenResult: async () => ({ signInProvider: proveedor }),
  }
}

beforeEach(() => {
  sesion.usuario = null
  sesion.fallo = null
  llamadas.length = 0
})

describe('reautenticarCuenta', () => {
  it('sin sesión, lo dice', async () => {
    expect(await reautenticarCuenta()).toMatchObject({ ok: false, motivo: 'sin-sesion' })
  })

  it('con correo y sin contraseña, la pide; con ella, verifica', async () => {
    con('password')
    expect(await reautenticarCuenta()).toEqual({
      ok: false,
      motivo: 'pide-contrasena',
      metodo: 'password',
    })
    expect(await reautenticarCuenta({ contrasena: 'x' })).toEqual({ ok: true, metodo: 'password' })
    expect(llamadas[0]).toEqual(['credencial', { email: 'a@b.c', contrasena: 'x' }])
  })

  it('B4: contraseña equivocada, las veces que haga falta, sin bloqueo', async () => {
    con('password')
    sesion.fallo = 'auth/invalid-credential'
    for (let i = 0; i < 3; i += 1) {
      expect(await reautenticarCuenta({ contrasena: 'mal' })).toEqual({
        ok: false,
        motivo: 'credenciales',
      })
    }
  })

  it('con Google en web, por ventana emergente', async () => {
    con('google.com')
    expect(await reautenticarCuenta({ conCodigoDeApple: true })).toEqual({
      ok: true,
      metodo: 'google.com',
    })
    expect(llamadas[0]).toEqual(['popup', { id: 'google' }])
  })

  it('motivos sin códigos: cancelar, credenciales, red, cuenta inexistente y lo demás', () => {
    expect(motivoDeReautenticacion({ code: 'auth/popup-closed-by-user' })).toBe('cancelado')
    expect(motivoDeReautenticacion({ message: 'The user canceled the sign-in flow.' })).toBe(
      'cancelado',
    )
    expect(motivoDeReautenticacion({ code: 'auth/wrong-password' })).toBe('credenciales')
    expect(motivoDeReautenticacion({ code: 'auth/network-request-failed' })).toBe('sin-conexion')
    expect(motivoDeReautenticacion({ code: 'auth/user-not-found' })).toBe('sin-cuenta')
    expect(motivoDeReautenticacion({ code: 'auth/algo-raro' })).toBe('no-verificado')
  })
})
