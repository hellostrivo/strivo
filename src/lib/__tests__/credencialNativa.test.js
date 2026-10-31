// src/lib/__tests__/credencialNativa.test.js
// SPEC_21.2 §4.2 — la credencial que consigue el plugin en la app de iPhone.
//
// El plugin y Firebase son dobles: aquí se prueba qué se toma de la respuesta
// del plugin (el token y el nonce, nunca el nombre), cómo se construye la
// credencial de Firebase y qué cuenta como cerrar la hoja.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

import {
  PROVEEDOR_DE_FIREBASE,
  cerrarSesionNativa,
  credencialNativa,
  datosDeCredencial,
  esCancelacion,
} from '../credencialNativa.js'

/** Lo que devuelve el plugin con Apple: trae el nombre, y no debe salir. */
const RESPUESTA_APPLE = {
  user: { displayName: 'Alejandra Treviño', email: 'x@privaterelay.appleid.com' },
  credential: {
    providerId: 'apple.com',
    idToken: 'token-de-apple',
    nonce: 'nonce-en-claro',
    authorizationCode: 'codigo',
  },
  additionalUserInfo: { profile: { name: 'Alejandra' } },
}

const RESPUESTA_GOOGLE = {
  user: { displayName: 'Ale', email: 'ale@gmail.com' },
  credential: { providerId: 'google.com', idToken: 'token-de-google', accessToken: 'acceso' },
}

function dobles({ apple = RESPUESTA_APPLE, google = RESPUESTA_GOOGLE } = {}) {
  const llamadas = { apple: [], google: [], oauth: [], salir: 0 }
  const plugin = async () => ({
    signInWithApple: async (opciones) => {
      llamadas.apple.push(opciones)
      if (apple instanceof Error) throw apple
      return apple
    },
    signInWithGoogle: async (opciones) => {
      llamadas.google.push(opciones)
      if (google instanceof Error) throw google
      return google
    },
    signOut: async () => {
      llamadas.salir += 1
    },
  })
  const firebaseAuth = async () => ({
    OAuthProvider: class {
      constructor(id) {
        this.id = id
      }
      credential(datos) {
        llamadas.oauth.push({ id: this.id, datos })
        return { proveedor: this.id, ...datos }
      }
    },
    GoogleAuthProvider: { credential: (idToken) => ({ proveedor: 'google.com', idToken }) },
  })
  return { llamadas, plugin, firebaseAuth }
}

describe('datosDeCredencial: el token y el nonce, y nada más', () => {
  it('Apple: idToken y rawNonce, sin el nombre ni el correo', () => {
    const datos = datosDeCredencial('apple', RESPUESTA_APPLE)
    expect(datos).toEqual({ idToken: 'token-de-apple', rawNonce: 'nonce-en-claro' })
    expect(JSON.stringify(datos)).not.toMatch(/Alejandra|Treviño|privaterelay|codigo/)
  })

  it('Google: solo el idToken', () => {
    expect(datosDeCredencial('google', RESPUESTA_GOOGLE)).toEqual({ idToken: 'token-de-google' })
  })

  it('sin token, lanza: no se intenta entrar con nada', () => {
    expect(() => datosDeCredencial('google', { credential: {} })).toThrow()
    expect(() => datosDeCredencial('apple', { credential: null })).toThrow()
  })

  it('Apple sin nonce, lanza: Firebase lo rechazaría', () => {
    expect(() => datosDeCredencial('apple', { credential: { idToken: 't' } })).toThrow()
  })
})

describe('credencialNativa: la hoja nativa y la credencial de Firebase', () => {
  it('Apple: OAuthProvider("apple.com") con idToken y rawNonce', async () => {
    const { llamadas, plugin, firebaseAuth } = dobles()
    const credencial = await credencialNativa('apple', { plugin, firebaseAuth })
    expect(llamadas.oauth).toEqual([
      { id: 'apple.com', datos: { idToken: 'token-de-apple', rawNonce: 'nonce-en-claro' } },
    ])
    expect(credencial).toEqual({
      proveedor: 'apple.com',
      idToken: 'token-de-apple',
      rawNonce: 'nonce-en-claro',
    })
  })

  it('Google: GoogleAuthProvider.credential(idToken)', async () => {
    const { plugin, firebaseAuth } = dobles()
    expect(await credencialNativa('google', { plugin, firebaseAuth })).toEqual({
      proveedor: 'google.com',
      idToken: 'token-de-google',
    })
  })

  it('pide siempre skipNativeAuth: el plugin nunca abre su propia sesión', async () => {
    const { llamadas, plugin, firebaseAuth } = dobles()
    await credencialNativa('apple', { plugin, firebaseAuth })
    await credencialNativa('google', { plugin, firebaseAuth })
    expect(llamadas.apple).toEqual([{ skipNativeAuth: true }])
    expect(llamadas.google).toEqual([{ skipNativeAuth: true }])
  })

  it('el nombre que devuelve Apple no llega a la credencial', async () => {
    const { plugin, firebaseAuth } = dobles()
    const credencial = await credencialNativa('apple', { plugin, firebaseAuth })
    expect(JSON.stringify(credencial)).not.toMatch(/Alejandra|displayName|fullName/)
  })

  it('lo que lanza el plugin se deja pasar tal cual', async () => {
    const cancelar = new Error('The user canceled the sign-in flow.')
    const { plugin, firebaseAuth } = dobles({ google: cancelar })
    await expect(credencialNativa('google', { plugin, firebaseAuth })).rejects.toBe(cancelar)
  })

  it('los nombres de Firebase de los dos proveedores', () => {
    expect(PROVEEDOR_DE_FIREBASE).toEqual({ apple: 'apple.com', google: 'google.com' })
  })
})

describe('esCancelacion: cerrar la hoja no es un error', () => {
  // La app declara español, así que el mensaje llega localizado y el orden
  // cambia con el idioma. Se reconoce por el dominio y el código, no por la
  // frase.
  it.each([
    'The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1001.)',
    'No se ha podido completar la operación. (Error de com.apple.AuthenticationServices.AuthorizationError 1001).',
    'Error de com.apple.AuthenticationServices.AuthorizationError 1001',
    'La operación no se pudo completar. (com.apple.AuthenticationServices.AuthorizationError error 1001.)',
  ])('Apple, en inglés y en español: dominio y 1001 en cualquier orden — %s', (mensaje) => {
    expect(esCancelacion(new Error(mensaje))).toBe(true)
  })

  it('Apple sin el dominio no cuenta, aunque traiga 1001', () => {
    expect(esCancelacion(new Error('Error 1001'))).toBe(false)
    expect(esCancelacion(new Error('(error 1001.)'))).toBe(false)
  })

  it.each([
    'Error de com.apple.AuthenticationServices.AuthorizationError 1000',
    'Error de com.apple.AuthenticationServices.AuthorizationError 10010',
    'Error de com.apple.AuthenticationServices.AuthorizationError 1001.5',
    'com.apple.AuthenticationServices.AuthorizationError error 21001.',
  ])('Apple con otro código no es cancelar: %s', (mensaje) => {
    expect(esCancelacion(new Error(mensaje))).toBe(false)
  })

  it('Google: su texto fijo', () => {
    expect(esCancelacion(new Error('The user canceled the sign-in flow.'))).toBe(true)
  })

  it('un rechazo con código nunca es una cancelación', () => {
    const conCodigo = Object.assign(new Error('The user canceled the sign-in flow.'), {
      code: 'auth/internal-error',
    })
    expect(esCancelacion(conCodigo)).toBe(false)
  })

  it.each([
    'The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)',
    'Error 10010 de algo más',
    'A network error occurred.',
    '',
  ])('cualquier otra cosa no lo es: %s', (mensaje) => {
    expect(esCancelacion(new Error(mensaje))).toBe(false)
  })

  it('sin error no hay cancelación', () => {
    expect(esCancelacion(undefined)).toBe(false)
  })
})

describe('cerrarSesionNativa: cierra la de Google, y nunca frena la salida', () => {
  it('llama a signOut del plugin', async () => {
    const { llamadas, plugin } = dobles()
    expect(await cerrarSesionNativa({ plugin })).toBe(true)
    expect(llamadas.salir).toBe(1)
  })

  it('si el plugin falla, no lanza', async () => {
    const plugin = async () => ({
      signOut: async () => {
        throw new Error('sin Firebase')
      },
    })
    await expect(cerrarSesionNativa({ plugin })).resolves.toBe(false)
  })

  it('si el plugin ni siquiera carga, tampoco', async () => {
    const plugin = async () => {
      throw new Error('no está')
    }
    await expect(cerrarSesionNativa({ plugin })).resolves.toBe(false)
  })
})

describe('el plugin se importa en un solo sitio', () => {
  const archivos = (dir) =>
    readdirSync(dir).flatMap((nombre) => {
      const ruta = join(dir, nombre)
      if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : archivos(ruta)
      return /\.jsx?$/.test(nombre) ? [ruta] : []
    })

  it('nadie fuera de lib/credencialNativa.js importa @capacitor-firebase/authentication', () => {
    const importan = archivos('src').filter((ruta) =>
      readFileSync(ruta, 'utf8').includes("'@capacitor-firebase/authentication'"),
    )
    expect(importan).toEqual([join('src', 'lib', 'credencialNativa.js')])
  })

  it('y ahí solo bajo demanda, nunca arriba del archivo', () => {
    const codigo = readFileSync('src/lib/credencialNativa.js', 'utf8')
    expect(codigo).not.toMatch(/^import .*@capacitor-firebase/m)
    expect(codigo).toMatch(/await import\('@capacitor-firebase\/authentication'\)/)
  })
})
