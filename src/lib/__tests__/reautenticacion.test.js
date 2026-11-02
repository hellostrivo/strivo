// src/lib/__tests__/reautenticacion.test.js
// SPEC_21.2 §4.6 — reautenticar con Google o con Apple, en web y en la app de
// iPhone. La usa hoy el PIN y la usará SPEC_24 para borrar la cuenta.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aTiempo } from './dobleDeCapacitor.js'

const llamadas = { conCredencial: [], popup: [] }
const plugin = { apple: null, google: null, llamadas: { apple: 0, google: 0 } }

vi.mock('firebase/auth', () => ({
  reauthenticateWithCredential: async (usuario, credencial) => {
    llamadas.conCredencial.push(credencial)
    return { user: usuario }
  },
  reauthenticateWithPopup: async (usuario, proveedor) => {
    llamadas.popup.push(proveedor)
    return { user: usuario }
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

// Un Proxy como el de Capacitor, que contesta también a `then`: si el plugin
// sale de una promesa, reautenticar se cuelga.
vi.mock('@capacitor-firebase/authentication', async () => {
  const { pluginDeCapacitor } = await import('./dobleDeCapacitor.js')
  return {
    FirebaseAuthentication: pluginDeCapacitor({
      signInWithApple: async () => {
        plugin.llamadas.apple += 1
        if (plugin.apple instanceof Error) throw plugin.apple
        return plugin.apple
      },
      signInWithGoogle: async () => {
        plugin.llamadas.google += 1
        if (plugin.google instanceof Error) throw plugin.google
        return plugin.google
      },
    }),
  }
})

const { metodoDeSesion, reautenticarConProveedor } = await import('../reautenticacion.js')

const USUARIO = { uid: 'u' }
const PROVEEDORES = { appleProvider: { id: 'apple' }, googleProvider: { id: 'google' } }

beforeEach(() => {
  llamadas.conCredencial.length = 0
  llamadas.popup.length = 0
  plugin.apple = { credential: { idToken: 'token-apple', nonce: 'nonce' } }
  plugin.google = { credential: { idToken: 'token-google' } }
  plugin.llamadas = { apple: 0, google: 0 }
})

describe('metodoDeSesion: con qué se entró, según el token', () => {
  it.each(['password', 'google.com', 'apple.com'])('%s', async (signInProvider) => {
    const usuario = { getIdTokenResult: async () => ({ signInProvider }) }
    expect(await metodoDeSesion(usuario)).toBe(signInProvider)
  })

  it('sin usuario, null', async () => {
    expect(await metodoDeSesion(null)).toBeNull()
  })

  it('no mira providerData', async () => {
    const usuario = {
      providerData: [{ providerId: 'password' }],
      getIdTokenResult: async () => ({ signInProvider: 'apple.com' }),
    }
    expect(await metodoDeSesion(usuario)).toBe('apple.com')
  })

  it('si el token no se puede leer, lanza: quien pregunta va a necesitar la red', async () => {
    const usuario = {
      getIdTokenResult: async () => {
        throw Object.assign(new Error('red'), { code: 'auth/network-request-failed' })
      },
    }
    await expect(metodoDeSesion(usuario)).rejects.toMatchObject({
      code: 'auth/network-request-failed',
    })
  })
})

describe('reautenticarConProveedor en la app de iPhone', () => {
  it('Google: la hoja nativa y reauthenticateWithCredential', async () => {
    await aTiempo(reautenticarConProveedor(USUARIO, 'google.com', { nativa: true }))
    expect(llamadas.conCredencial).toEqual([{ proveedor: 'google.com', idToken: 'token-google' }])
    expect(llamadas.popup).toEqual([])
  })

  it('Apple: con idToken y rawNonce', async () => {
    await aTiempo(reautenticarConProveedor(USUARIO, 'apple.com', { nativa: true }))
    expect(llamadas.conCredencial).toEqual([
      { proveedor: 'apple.com', idToken: 'token-apple', rawNonce: 'nonce' },
    ])
    expect(plugin.llamadas).toEqual({ apple: 1, google: 0 })
  })

  it('cerrar la hoja se deja pasar: quien llama lo traduce', async () => {
    plugin.google = new Error('The user canceled the sign-in flow.')
    await expect(
      aTiempo(reautenticarConProveedor(USUARIO, 'google.com', { nativa: true })),
    ).rejects.toThrow('canceled')
    expect(llamadas.conCredencial).toEqual([])
  })
})

describe('reautenticarConProveedor en web', () => {
  it('por ventana emergente, con el proveedor que toca', async () => {
    await reautenticarConProveedor(USUARIO, 'apple.com', {
      nativa: false,
      proveedores: PROVEEDORES,
    })
    await reautenticarConProveedor(USUARIO, 'google.com', {
      nativa: false,
      proveedores: PROVEEDORES,
    })
    expect(llamadas.popup).toEqual([{ id: 'apple' }, { id: 'google' }])
    expect(llamadas.conCredencial).toEqual([])
    expect(plugin.llamadas).toEqual({ apple: 0, google: 0 })
  })
})
