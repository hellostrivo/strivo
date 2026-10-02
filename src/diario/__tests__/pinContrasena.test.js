// src/diario/__tests__/pinContrasena.test.js
// "Olvidé mi PIN" con una cuenta de correo (SPEC_19.2 §4.5, DP-19.6;
// criterios 7 y 8).
//
// Firebase Auth es un doble: lo que se prueba es qué pide `reautenticar` según
// el proveedor, cómo traduce cada tropiezo a un motivo sin código, y que la
// contraseña no se queda en ningún sitio.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'

import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { shared } from '@/lib/db'
import { STORE_RECORDS, STORE_SYNC_QUEUE, getLocalDB } from '@/lib/db/local.js'
import { copy } from '@copy'

const SECRETO = 'una-contraseña-que-no-se-guarda'

const sesion = { usuario: null }
const fallo = { codigo: null }
const llamadas = { credencial: [], conCredencial: [], popup: [] }

vi.mock('@/lib/firebase', () => ({
  get auth() {
    return { currentUser: sesion.usuario }
  },
  googleProvider: { id: 'google' },
  appleProvider: { id: 'apple' },
}))
vi.mock('firebase/auth', () => {
  const tropezar = () => {
    if (fallo.codigo) throw Object.assign(new Error('auth'), { code: fallo.codigo })
  }
  return {
    EmailAuthProvider: {
      credential: (email, contrasena) => {
        llamadas.credencial.push([email, contrasena])
        return { email, tipo: 'password' }
      },
    },
    reauthenticateWithCredential: async (usuario, credencial) => {
      llamadas.conCredencial.push(credencial)
      tropezar()
      return { user: usuario }
    },
    reauthenticateWithPopup: async (usuario, proveedor) => {
      llamadas.popup.push(proveedor)
      tropezar()
      return { user: usuario }
    },
  }
})

const { reautenticar } = await import('../pin.js')

function conProveedor(providerId) {
  sesion.usuario = { email: 'ale@ejemplo.com', providerData: [{ providerId }] }
}

beforeEach(async () => {
  await resetLocalDB()
  await shared.saveAuthRecord(UID, { uid: UID, email: 'ale@ejemplo.com', phone: null })
  sesion.usuario = null
  fallo.codigo = null
  llamadas.credencial.length = 0
  llamadas.conCredencial.length = 0
  llamadas.popup.length = 0
})

afterEach(() => vi.unstubAllGlobals())

describe('criterio 7: reautenticar con cuenta de correo', () => {
  it('sin contraseña pide la contraseña, y no intenta nada', async () => {
    conProveedor('password')
    expect(await reautenticar(UID)).toEqual({ ok: false, motivo: 'pide-contrasena' })
    expect(llamadas.conCredencial).toHaveLength(0)
    expect(llamadas.popup).toHaveLength(0)
  })

  it('con la contraseña correcta, verifica con EmailAuthProvider.credential', async () => {
    conProveedor('password')
    expect(await reautenticar(UID, { contrasena: SECRETO })).toEqual({ ok: true })
    expect(llamadas.credencial).toEqual([['ale@ejemplo.com', SECRETO]])
    expect(llamadas.popup).toHaveLength(0)
  })

  it.each(['auth/wrong-password', 'auth/invalid-credential', 'auth/invalid-login-credentials'])(
    'con %s, credenciales',
    async (codigo) => {
      conProveedor('password')
      fallo.codigo = codigo
      expect(await reautenticar(UID, { contrasena: 'otra' })).toEqual({
        ok: false,
        motivo: 'credenciales',
      })
    },
  )

  it('sin red, sin-conexion', async () => {
    conProveedor('password')
    fallo.codigo = 'auth/network-request-failed'
    expect(await reautenticar(UID, { contrasena: SECRETO })).toEqual({
      ok: false,
      motivo: 'sin-conexion',
    })
  })

  it('cualquier otro tropiezo, no-verificado', async () => {
    conProveedor('password')
    fallo.codigo = 'auth/too-many-requests'
    expect(await reautenticar(UID, { contrasena: SECRETO })).toEqual({
      ok: false,
      motivo: 'no-verificado',
    })
  })

  it('sin sesión de Firebase, sin-sesion, como siempre', async () => {
    expect(await reautenticar(UID, { contrasena: SECRETO })).toEqual({
      ok: false,
      motivo: 'sin-sesion',
    })
  })

  it('sin método de recuperación, sin-metodo, antes de cargar nada', async () => {
    conProveedor('password')
    await shared.saveAuthRecord(UID, { uid: UID, email: null, phone: null })
    expect(await reautenticar(UID, { contrasena: SECRETO })).toEqual({
      ok: false,
      motivo: 'sin-metodo',
    })
    expect(llamadas.conCredencial).toHaveLength(0)
  })
})

describe('criterio 7: con Google, igual que hoy', () => {
  it('por ventana emergente, sin pedir contraseña', async () => {
    conProveedor('google.com')
    expect(await reautenticar(UID)).toEqual({ ok: true })
    expect(llamadas.popup).toEqual([{ id: 'google' }])
    expect(llamadas.credencial).toHaveLength(0)
  })

  it('una contraseña que llegue por error no se usa', async () => {
    conProveedor('google.com')
    expect(await reautenticar(UID, { contrasena: SECRETO })).toEqual({ ok: true })
    expect(llamadas.credencial).toHaveLength(0)
  })

  it('Apple sigue sin tocarse', async () => {
    conProveedor('apple.com')
    await reautenticar(UID)
    expect(llamadas.popup).toEqual([{ id: 'apple' }])
  })
})

describe('criterio 8: la contraseña no se escribe en ningún sitio', () => {
  it('ni en IndexedDB, ni en la cola, ni en localStorage, acierte o no', async () => {
    const guardado = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k) => guardado.get(k) ?? null,
      setItem: (k, v) => guardado.set(k, String(v)),
      removeItem: (k) => guardado.delete(k),
    })
    conProveedor('password')
    await reautenticar(UID, { contrasena: SECRETO })
    fallo.codigo = 'auth/wrong-password'
    await reautenticar(UID, { contrasena: SECRETO })

    const db = await getLocalDB()
    const todo = JSON.stringify([
      await db.getAll(STORE_RECORDS),
      await db.getAll(STORE_SYNC_QUEUE),
      [...guardado.entries()],
    ])
    expect(todo).not.toContain(SECRETO)
  })

  it('pin.js solo se la entrega a Firebase', () => {
    const fuente = readFileSync('src/diario/pin.js', 'utf8')
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    const usos = codigo.match(/(?<!-)\bcontrasena\b/g)
    expect(fuente).toMatch(/EmailAuthProvider\.credential\(usuario\.email, contrasena\)/)
    expect(fuente).not.toMatch(/console\./)
    // La firma, la comprobación de que llegó y la credencial: nada más.
    expect(usos).toHaveLength(3)
  })

  it('BloqueoPin la tiene solo en su estado, y no la guarda ni la registra', () => {
    const fuente = readFileSync('src/components/diario/BloqueoPin.jsx', 'utf8')
    expect(fuente).toMatch(/const \[contrasena, setContrasena\] = useState\(''\)/)
    expect(fuente).not.toMatch(/localStorage|sessionStorage|indexedDB|console\.|enqueue/)
  })
})

describe('criterio 8: el campo aparece solo cuando hace falta, y bien etiquetado', () => {
  const fuente = readFileSync('src/components/diario/BloqueoPin.jsx', 'utf8')

  it('solo tras pide-contrasena', () => {
    expect(fuente).toMatch(
      /if \(resultado\.motivo === 'pide-contrasena'\) \{\s+setPideContrasena\(true\)/,
    )
    expect(fuente).toMatch(/\{pideContrasena && \(/)
    expect(fuente).toMatch(/useState\(false\)/)
  })

  it('con Campo.jsx, type password, current-password, foco y aria-describedby', () => {
    expect(fuente).toMatch(/<CampoLinea[\s\S]{0,80}ref=\{campoContrasena\}/)
    expect(fuente).toMatch(/type="password"\s+autoComplete="current-password"/)
    expect(fuente).toMatch(/if \(pideContrasena\) campoContrasena\.current\?\.focus\(\)/)
    expect(fuente).toMatch(/aria-describedby=\{nota \? 'pin-recuperar-nota' : undefined\}/)
    expect(fuente).toMatch(/<label htmlFor="pin-contrasena"/)
  })

  it('el mismo botón vuelve a intentar con lo escrito', () => {
    expect(fuente).toMatch(
      /acciones\.reautenticar\(pideContrasena \? \{ contrasena \} : undefined\)/,
    )
  })

  it('cada motivo tiene su frase, y sin conexión es la de Tu cuenta (E8)', () => {
    const r = copy.diario.journal.pin.recuperar
    expect(r.contrasena).toBe('Contraseña de tu cuenta')
    expect(r.pideContrasena).toBe('Escribe la contraseña de tu cuenta para verificarte.')
    expect(r.credenciales).toBe('Esa contraseña no coincide con la de tu cuenta.')
    expect(r.sinConexion).toBeUndefined()
    expect(fuente).toMatch(/'sin-conexion': copy\.cuenta\.error\.sinConexion/)
  })

  it('pin.js ya no dice que no hay autenticación por correo (D4)', () => {
    const pin = readFileSync('src/diario/pin.js', 'utf8')
    expect(pin).not.toMatch(/no existe ni\s+\/\/?\s*\*?\s*autenticación por correo/)
    expect(pin).not.toMatch(/solo\s+(\*\s+)?configura Google y Apple/)
    expect(pin).toMatch(/Firebase se carga aquí y no arriba a propósito/)
  })
})
