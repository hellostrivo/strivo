// src/lib/__tests__/sesion.test.js
// Qué sesión hay (SPEC_19.1 §4.1, criterio 1) y cómo se prepara el árbol al
// arrancar (SPEC_17A §4.4; criterios 10, 11, 12 y 14).
//
// `restaurar` se sustituye por un doble que escribe en la base local lo que
// se le diga y devuelve el resultado que se le diga: aquí no se prueba la
// bajada —eso es `restaurar.test.js`— sino el **orden**: cuándo se restaura,
// cuándo se siembra, y que la segunda nunca le gane a la primera.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

import * as shared from '@lib/db/shared'
import { pendingCount, writePath } from '@lib/db/local'
import { resetLocalDB } from '@lib/db/__tests__/helpers.js'

const doble = {
  resultado: { ok: true, escritos: 0, fusionados: 0 },
  remoto: null,
  // El expediente remoto del onboarding, si lo hay: es lo que decide la puerta.
  remotoOnboarding: null,
  llamadas: 0,
  // Si se pone, `restaurar` no contesta hasta que alguien llame a `soltar()`.
  soltar: null,
}
const marcas = new Map()

// Firebase Auth de mentira para `leerSesionGuardada` y `escucharUsuario`.
const firebase = { auth: null }
const oyentesAuth = []
vi.mock('../firebase.js', () => ({
  get auth() {
    return firebase.auth
  },
}))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, fn) => {
    oyentesAuth.push(fn)
    Promise.resolve().then(() => fn(auth.currentUser))
    return () => oyentesAuth.splice(oyentesAuth.indexOf(fn), 1)
  },
}))

vi.mock('@lib/db/restaurar', () => ({
  MOTIVOS: {
    sinConfiguracion: 'sin_configuracion',
    sinRed: 'sin_red',
    interrumpida: 'interrumpida',
  },
  hayMarcaDeRestauracion: (uid) => marcas.has(uid),
  retirarMarcaDeRestauracion: (uid) => marcas.delete(uid),
  restaurar: async (uid) => {
    doble.llamadas += 1
    if (doble.soltar === undefined) {
      await new Promise((resolve) => {
        doble.soltar = resolve
      })
    }
    if (doble.remoto) {
      // Lo que "baja": el perfil remoto, escrito como lo escribe la bajada de
      // verdad —sin validadores y sin cola—.
      const local = await shared.getProfile(uid)
      if (local === null || !('updatedAt' in local)) {
        await writePath({
          uid,
          path: `users/${uid}/shared/profile`,
          collection: 'shared',
          id: 'profile',
          data: doble.remoto,
          sync: false,
        })
      }
    }
    if (doble.remotoOnboarding) {
      const local = await shared.getOnboarding(uid)
      if (local === null || !('updatedAt' in local)) {
        await writePath({
          uid,
          path: `users/${uid}/shared/onboarding`,
          collection: 'shared',
          id: 'onboarding',
          data: doble.remotoOnboarding,
          sync: false,
        })
      }
    }
    if (doble.resultado.ok) marcas.set(uid, 'ahora')
    return doble.resultado
  },
}))

const {
  ESTADOS_SESION,
  escucharUsuario,
  leerSesionGuardada,
  prepararArbol,
  reintentarAlVolverLaRed,
  resolverSesion,
  TECHO_DE_ESPERA_MS,
} = await import('../sesion.js')

const CUENTA = 'AbC123firebaseUid'
const PERFIL_REMOTO = { name: 'Alejandra', gender: 'f', updatedAt: '2026-09-01T10:00:00.000Z' }

/** La sesión es `conCuenta`: lo dice quien llama, no el uid (SPEC_19.1 §4.1). */
const CON_CUENTA = { conCuenta: true }

beforeEach(async () => {
  doble.resultado = { ok: true, escritos: 0, fusionados: 0 }
  doble.remoto = null
  doble.remotoOnboarding = null
  doble.llamadas = 0
  doble.soltar = null
  marcas.clear()
  firebase.auth = null
  oyentesAuth.length = 0
  await resetLocalDB()
})

afterEach(() => vi.unstubAllGlobals())

describe('resolverSesion: una prueba por fila de la tabla de §3.1 (criterio 1)', () => {
  const U = { uid: CUENTA, email: 'ale@ejemplo.com' }

  it('fila 1: sin configurar, cualquier uid guardado, y es el vigente', () => {
    expect(
      resolverSesion({ configurado: false, usuario: null, uidGuardado: 'local-3f2a' }),
    ).toEqual({ estado: 'sinConfigurar', uid: 'local-3f2a', requiereEntrada: null })
    expect(resolverSesion({ configurado: false, usuario: null, uidGuardado: CUENTA })).toEqual({
      estado: 'sinConfigurar',
      uid: CUENTA,
      requiereEntrada: null,
    })
  })

  it('fila 2: usuario U y uid U, con cuenta', () => {
    expect(resolverSesion({ configurado: true, usuario: U, uidGuardado: CUENTA })).toEqual({
      estado: 'conCuenta',
      uid: CUENTA,
      requiereEntrada: null,
    })
  })

  it('fila 3: usuario U y uid local, con cuenta tras entrar desde el local', () => {
    expect(resolverSesion({ configurado: true, usuario: U, uidGuardado: 'local-3f2a' })).toEqual({
      estado: 'conCuenta',
      uid: CUENTA,
      requiereEntrada: 'local-3f2a',
    })
  })

  it('fila 3 también con otro uid de cuenta guardado', () => {
    const r = resolverSesion({ configurado: true, usuario: U, uidGuardado: 'OtraCuenta9' })
    expect(r).toEqual({ estado: 'conCuenta', uid: CUENTA, requiereEntrada: 'OtraCuenta9' })
  })

  it('fila 4: sin usuario y uid local, sin cuenta', () => {
    expect(resolverSesion({ configurado: true, usuario: null, uidGuardado: 'local-3f2a' })).toEqual(
      { estado: 'sinCuenta', uid: 'local-3f2a', requiereEntrada: null },
    )
  })

  it('fila 5: sin usuario y uid de cuenta, vencida, y lo escrito sigue en su uid', () => {
    expect(resolverSesion({ configurado: true, usuario: null, uidGuardado: CUENTA })).toEqual({
      estado: 'vencida',
      uid: CUENTA,
      requiereEntrada: null,
    })
  })

  it('los cuatro estados, y solo esos', () => {
    expect(Object.values(ESTADOS_SESION).sort()).toEqual(
      ['conCuenta', 'sinConfigurar', 'sinCuenta', 'vencida'].sort(),
    )
  })

  it('el prefijo local- responde a quién inventó el uid, no a si hay cuenta', () => {
    const fuente = readFileSync('src/lib/sesion.js', 'utf8')
    expect(fuente).toMatch(/¿Este uid lo inventó el teléfono\?/)
    expect(fuente).toMatch(/No responde a "¿hay cuenta\?"/)
  })
})

describe('criterio 11: esUidDeCuenta ya no existe', () => {
  it('ningún archivo de src/ la llama ni la importa', () => {
    const archivos = (dir) =>
      readdirSync(dir).flatMap((n) => {
        const ruta = join(dir, n)
        return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta]
      })
    const culpables = archivos('src')
      .filter((r) => /\.(js|jsx)$/.test(r) && !r.endsWith('sesion.test.js'))
      .filter((r) => /esUidDeCuenta\s*\(|import[^;]*esUidDeCuenta/.test(readFileSync(r, 'utf8')))
    expect(culpables).toEqual([])
  })
})

describe('leerSesionGuardada y escucharUsuario', () => {
  it('sin configuración: no configurado y sin usuario', async () => {
    expect(await leerSesionGuardada()).toEqual({ configurado: false, usuario: null })
  })

  it('espera a authStateReady y devuelve uid y correo, nada más', async () => {
    let listo = false
    firebase.auth = {
      authStateReady: async () => {
        listo = true
      },
      get currentUser() {
        return listo ? { uid: CUENTA, email: 'ale@ejemplo.com', token: 'no' } : null
      },
    }
    expect(await leerSesionGuardada()).toEqual({
      configurado: true,
      usuario: { uid: CUENTA, email: 'ale@ejemplo.com' },
    })
  })

  it('sin authStateReady, espera a la primera emisión de onAuthStateChanged', async () => {
    firebase.auth = { currentUser: null }
    expect(await leerSesionGuardada()).toEqual({ configurado: true, usuario: null })
    expect(oyentesAuth).toHaveLength(0)
  })

  it('escucharUsuario avisa con el usuario reducido y devuelve su desuscripción', async () => {
    firebase.auth = { currentUser: { uid: CUENTA, email: null } }
    const vistos = []
    const quitar = await escucharUsuario((u) => vistos.push(u))
    await new Promise((r) => setTimeout(r, 0))
    expect(vistos).toEqual([{ uid: CUENTA, email: null }])
    oyentesAuth[0](null)
    expect(vistos[1]).toBeNull()
    quitar()
    expect(oyentesAuth).toHaveLength(0)
  })

  it('escucharUsuario sin configuración devuelve una desuscripción vacía', async () => {
    const quitar = await escucharUsuario(() => {})
    expect(typeof quitar).toBe('function')
  })
})

describe('sin cuenta, la app arranca exactamente como hoy', () => {
  it('no restaura y siembra', async () => {
    const r = await prepararArbol('local-abc')
    expect(doble.llamadas).toBe(0)
    expect(r.restauracion).toBeNull()
    expect(r.sembrado).toBe(true)
    expect(r.quitarOyente).toBeNull()
    expect((await shared.getProfile('local-abc')).name).toBeNull()
  })

  it('un uid de cuenta sin sesión (vencida) no se restaura: solo se siembra si falta', async () => {
    const r = await prepararArbol(CUENTA)
    expect(doble.llamadas).toBe(0)
    expect(r.restauracion).toBeNull()
    expect(r.sembrado).toBe(true)
  })

  it('con árbol ya montado no siembra ni restaura', async () => {
    await shared.initShared('local-abc', { profile: { name: 'Ale' } })
    const r = await prepararArbol('local-abc')
    expect(r.sembrado).toBe(false)
    expect(doble.llamadas).toBe(0)
    expect((await shared.getProfile('local-abc')).name).toBe('Ale')
  })
})

describe('criterio 11: restaurar antes de sembrar', () => {
  it('local vacío y perfil remoto con nombre: el perfil local trae ese nombre, no el sembrado', async () => {
    doble.remoto = PERFIL_REMOTO
    const velo = []
    const r = await prepararArbol(CUENTA, { conCuenta: true, enRestauracion: (a) => velo.push(a) })

    expect(doble.llamadas).toBe(1)
    expect(velo).toEqual([true, false])
    expect(r.sembrado).toBe(false)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await pendingCount(CUENTA)).toBe(0)
  })

  it('cuenta sin nada en la nube: se restaura, no baja nada, y entonces se siembra', async () => {
    const r = await prepararArbol(CUENTA, CON_CUENTA)
    expect(doble.llamadas).toBe(1)
    expect(r.sembrado).toBe(true)
    expect((await shared.getProfile(CUENTA)).name).toBeNull()
    expect(await pendingCount(CUENTA)).toBe(0)
  })
})

describe('criterio 10: la marca y el árbol', () => {
  it('con marca y árbol, no se restaura', async () => {
    marcas.set(CUENTA, 'antes')
    await shared.initShared(CUENTA)
    const r = await prepararArbol(CUENTA, CON_CUENTA)
    expect(doble.llamadas).toBe(0)
    expect(r.restauracion).toBeNull()
    expect(r.sembrado).toBe(false)
  })

  it('con marca y árbol ausente —marca huérfana— se retira la marca y se restaura', async () => {
    marcas.set(CUENTA, 'de antes de borrar IndexedDB')
    doble.remoto = PERFIL_REMOTO
    const r = await prepararArbol(CUENTA, CON_CUENTA)
    expect(doble.llamadas).toBe(1)
    expect(r.restauracion.ok).toBe(true)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    // La marca que queda es la que puso esta restauración, no la huérfana.
    expect(marcas.get(CUENTA)).toBe('ahora')
  })

  it('sin marca pero con árbol, se restaura igual (la marca no es la única condición)', async () => {
    await shared.initShared(CUENTA)
    doble.remoto = PERFIL_REMOTO
    const r = await prepararArbol(CUENTA, CON_CUENTA)
    expect(doble.llamadas).toBe(1)
    expect(r.sembrado).toBe(false)
  })
})

describe('criterio 12: una restauración fallida no destruye el árbol remoto', () => {
  it('falla, se siembra detrás, y la cola no lleva ninguno de los cuatro shared/*', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida', escritos: 0, fusionados: 0 }
    const r = await prepararArbol(CUENTA, CON_CUENTA)
    expect(r.restauracion.ok).toBe(false)
    expect(r.sembrado).toBe(true)
    expect(await pendingCount(CUENTA)).toBe(0)
    expect(marcas.has(CUENTA)).toBe(false)
  })

  it('y el reintento posterior sí recupera el nombre por encima de la siembra', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida', escritos: 0, fusionados: 0 }
    await prepararArbol(CUENTA, CON_CUENTA)
    expect((await shared.getProfile(CUENTA)).name).toBeNull()

    doble.resultado = { ok: true, escritos: 0, fusionados: 1 }
    doble.remoto = PERFIL_REMOTO
    const { restaurar } = await import('@lib/db/restaurar')
    await restaurar(CUENTA)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
  })

  it('con cualquier motivo que no sea la red, no se pone oyente', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida', escritos: 0, fusionados: 0 }
    expect((await prepararArbol(CUENTA, CON_CUENTA)).quitarOyente).toBeNull()
    doble.resultado = { ok: false, motivo: 'sin_configuracion', escritos: 0, fusionados: 0 }
    expect((await prepararArbol(CUENTA, CON_CUENTA)).quitarOyente).toBeNull()
  })
})

describe('cambio de uid a mitad de sesión (D7)', () => {
  it('con restaurarSiHaceFalta en false no se restaura aunque sea una cuenta sin marca', async () => {
    await shared.initShared(CUENTA)
    const r = await prepararArbol(CUENTA, { conCuenta: true, restaurarSiHaceFalta: false })
    expect(doble.llamadas).toBe(0)
    expect(r.restauracion).toBeNull()
    expect(r.sembrado).toBe(false)
  })

  it('y si por lo que fuera no hubiera árbol, se siembra sin restaurar', async () => {
    const r = await prepararArbol(CUENTA, { conCuenta: true, restaurarSiHaceFalta: false })
    expect(doble.llamadas).toBe(0)
    expect(r.sembrado).toBe(true)
  })
})

describe('criterio 14: el reintento al volver la red', () => {
  function ventanaDeMentira() {
    const oyentes = new Map()
    return {
      addEventListener: (tipo, fn) => oyentes.set(fn, tipo),
      removeEventListener: (_tipo, fn) => oyentes.delete(fn),
      disparar: (tipo) =>
        [...oyentes.entries()].filter(([, t]) => t === tipo).forEach(([fn]) => fn()),
      cuantos: () => oyentes.size,
    }
  }

  it('un fallo por sin_red deja un oyente de online', async () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    doble.resultado = { ok: false, motivo: 'sin_red', escritos: 0, fusionados: 0 }
    const r = await prepararArbol(CUENTA, CON_CUENTA)
    expect(typeof r.quitarOyente).toBe('function')
    expect(w.cuantos()).toBe(1)
  })

  it('reintenta una vez al volver la red y se desuscribe: sin segundo intento', async () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    doble.resultado = { ok: false, motivo: 'sin_red', escritos: 0, fusionados: 0 }
    await prepararArbol(CUENTA, CON_CUENTA)
    expect(doble.llamadas).toBe(1)

    w.disparar('online')
    await new Promise((r) => setTimeout(r, 0))
    expect(doble.llamadas).toBe(2)
    expect(w.cuantos()).toBe(0)

    w.disparar('online')
    await new Promise((r) => setTimeout(r, 0))
    expect(doble.llamadas).toBe(2)
  })

  it('quitar el oyente sin que vuelva la red no dispara nada', async () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    doble.resultado = { ok: false, motivo: 'sin_red', escritos: 0, fusionados: 0 }
    const { quitarOyente } = await prepararArbol(CUENTA, CON_CUENTA)
    quitarOyente()
    expect(w.cuantos()).toBe(0)
    w.disparar('online')
    expect(doble.llamadas).toBe(1)
  })

  it('sin temporizador: el reintento es un evento, no un setTimeout ni un setInterval', () => {
    // El único temporizador del módulo es el techo del velo (D16), que vive
    // en `conTecho`; el reintento al volver la red no lleva ninguno.
    const fuente = readFileSync('src/lib/sesion.js', 'utf8')
    const desde = fuente.indexOf('export function reintentarAlVolverLaRed')
    const hasta = fuente.indexOf('\n}\n', desde)
    const reintento = fuente.slice(desde, hasta)
    expect(reintento.length).toBeGreaterThan(50)
    expect(reintento).not.toMatch(/setTimeout|setInterval/)
    expect(reintento).toMatch(/addEventListener\('online'/)
  })

  it('sin window (pruebas, servidor) devuelve una función vacía', () => {
    vi.stubGlobal('window', undefined)
    const corrió = []
    const quitar = reintentarAlVolverLaRed(CUENTA, (uid) => corrió.push(uid))
    expect(typeof quitar).toBe('function')
    expect(corrió).toEqual([])
  })
})

describe('criterio 15: el velo tiene techo (D16)', () => {
  it('el techo es de quince segundos', () => {
    expect(TECHO_DE_ESPERA_MS).toBe(15000)
  })

  it('si restaurar no contesta, el velo baja, se entra y se siembra', async () => {
    doble.soltar = undefined // no contesta hasta que se suelte
    const velo = []
    const r = await prepararArbol(CUENTA, {
      conCuenta: true,
      enRestauracion: (a) => velo.push(a),
      techoMs: 20,
    })

    expect(velo).toEqual([true, false])
    expect(r.aTiempo).toBe(false)
    expect(r.restauracion).toBeNull()
    expect(r.quitarOyente).toBeNull()
    expect(r.sembrado).toBe(true)
    expect((await shared.getProfile(CUENTA)).name).toBeNull()
    expect(marcas.has(CUENTA)).toBe(false)
    doble.soltar()
  })

  it('la restauración sigue por detrás y, si termina, marca y su perfil gana a la semilla', async () => {
    doble.soltar = undefined
    doble.remoto = PERFIL_REMOTO
    await prepararArbol(CUENTA, { conCuenta: true, techoMs: 20 })
    expect((await shared.getProfile(CUENTA)).name).toBeNull()

    doble.soltar()
    await new Promise((r) => setTimeout(r, 30))
    expect(marcas.get(CUENTA)).toBe('ahora')
    // Regla 2: la semilla no tiene marca y el perfil remoto sí.
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
  })

  it('una restauración rápida no espera al techo y limpia el temporizador', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      const r = await prepararArbol(CUENTA, { conCuenta: true, techoMs: 15000 })
      expect(r.aTiempo).toBe(true)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('el techo no es un umbral de fallo: no deja oyente ni resultado de error', async () => {
    doble.soltar = undefined
    const r = await prepararArbol(CUENTA, { conCuenta: true, techoMs: 20 })
    expect(r.restauracion).toBeNull()
    expect(r.quitarOyente).toBeNull()
    doble.soltar()
  })
})

describe('DP-17.11: dos llamadas a la vez con el mismo uid son una', () => {
  /** Espera a que el doble de `restaurar` esté parado, esperando que lo suelten. */
  async function esperarAlDoble() {
    while (typeof doble.soltar !== 'function') {
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  const EXPEDIENTE_REMOTO = {
    version: 2,
    completedSteps: ['p1', 'p2', 'p2a', 'p3', 'p5', 'p6', 'p7', 'p8'],
    currentStep: 'p8',
    completedAt: '2026-09-01T10:05:00.000Z',
    motivos: ['paz'],
    motivoOtro: null,
    updatedAt: '2026-09-01T10:05:00.000Z',
  }

  it('la segunda recibe la misma promesa: una restauración y una siembra como mucho', async () => {
    doble.soltar = undefined
    const primera = prepararArbol(CUENTA, { conCuenta: true, restaurarSiHaceFalta: true })
    const segunda = prepararArbol(CUENTA, { conCuenta: true, restaurarSiHaceFalta: false })
    expect(segunda).toBe(primera)

    await esperarAlDoble()
    doble.soltar()
    const [r1, r2] = await Promise.all([primera, segunda])
    expect(r1).toBe(r2)
    expect(doble.llamadas).toBe(1)
    expect(r1.sembrado).toBe(true)
  })

  it('criterio 19: local vacío, expediente remoto cerrado y doble montaje ⇒ sin onboarding en el primer arranque', async () => {
    // El orden real de `ArranqueProvisional` bajo StrictMode: la primera con
    // `restaurarSiHaceFalta: true`, la segunda con `false`, las dos en vuelo a
    // la vez. Antes, la segunda sembraba mientras la primera bajaba y la puerta
    // se decidía sobre la semilla.
    doble.soltar = undefined
    doble.remoto = PERFIL_REMOTO
    doble.remotoOnboarding = EXPEDIENTE_REMOTO

    const primera = prepararArbol(CUENTA, { conCuenta: true, restaurarSiHaceFalta: true })
    const segunda = prepararArbol(CUENTA, { conCuenta: true, restaurarSiHaceFalta: false })
    await esperarAlDoble()
    doble.soltar()
    const r = await segunda
    await primera

    expect(r.sembrado).toBe(false)
    expect(await shared.onboardingPendiente(CUENTA)).toBe(false)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await pendingCount(CUENTA)).toBe(0)
  })

  it('no es una caché: una llamada posterior vuelve a evaluar', async () => {
    const primera = await prepararArbol(CUENTA, CON_CUENTA)
    expect(doble.llamadas).toBe(1)
    expect(primera.sembrado).toBe(true)

    // Con marca y árbol, la segunda evaluación no restaura (criterio 10) y no
    // siembra, que es lo que dice que evaluó de verdad y no devolvió lo viejo.
    const segunda = await prepararArbol(CUENTA, CON_CUENTA)
    expect(segunda).not.toBe(primera)
    expect(doble.llamadas).toBe(1)
    expect(segunda.sembrado).toBe(false)
  })

  it('tras un fallo también se retira la entrada: el reintento no recibe el fallo viejo', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida' }
    const primera = await prepararArbol(CUENTA, CON_CUENTA)
    expect(primera.restauracion.ok).toBe(false)

    doble.resultado = { ok: true, escritos: 1, fusionados: 0 }
    doble.remoto = PERFIL_REMOTO
    const segunda = await prepararArbol(CUENTA, CON_CUENTA)
    expect(segunda.restauracion.ok).toBe(true)
    expect(doble.llamadas).toBe(2)
  })

  it('dos uid distintos a la vez no se interfieren', async () => {
    doble.soltar = undefined
    const OTRA = 'XyZ987otraCuenta'
    const a = prepararArbol(CUENTA, CON_CUENTA)
    const b = prepararArbol(OTRA, CON_CUENTA)
    expect(a).not.toBe(b)

    // El doble guarda un único resolutor: la primera en llegar se queda
    // esperando y la segunda pasa de largo. Lo que se vigila es que ninguna
    // sea la promesa de la otra y que cada árbol acabe bajo su uid.
    await esperarAlDoble()
    doble.soltar()
    await Promise.all([a, b])

    expect(await shared.getProfile(CUENTA)).not.toBeNull()
    expect(await shared.getProfile(OTRA)).not.toBeNull()
    expect(doble.llamadas).toBe(2)
  })

  it('el guard de una sola restauración por sesión sigue en ArranqueProvisional', () => {
    const fuente = readFileSync('src/components/ArranqueProvisional.jsx', 'utf8')
    expect(fuente).toMatch(/arranqueEvaluado/)
    expect(fuente).toMatch(/restaurarSiHaceFalta: primero/)
  })
})

describe('ArranqueProvisional usa la regla y no la copia', () => {
  const fuente = readFileSync('src/components/ArranqueProvisional.jsx', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  it('importa resolverSesion y prepararArbol de lib/sesion', () => {
    expect(fuente).toMatch(/import \{[^}]*resolverSesion[^}]*\} from '@lib\/sesion'/)
    expect(fuente).toMatch(/prepararArbol\(/)
  })

  it('arranca la cola solo con conCuenta y devuelve su limpieza al efecto', () => {
    expect(fuente).toMatch(
      /if \(estado !== ESTADOS_SESION\.conCuenta\) return undefined\s*return startSync\(uid\)/,
    )
  })

  it('espera a Firebase antes de preparar el árbol, y le dice si hay cuenta', () => {
    expect(fuente).toMatch(/leerSesionGuardada\(\)/)
    expect(fuente).toMatch(/conCuenta: estado === ESTADOS_SESION\.conCuenta/)
  })

  it('F1: completa la mudanza aplazada al terminar una restauración y al arrancar con marca', () => {
    expect(fuente).toMatch(/escucharMudanzasPendientes\(\{/)
    expect(fuente).toMatch(/hayMarcaDeRestauracion\(uid\) &&\s*mudanzaPendiente\(uid\)/)
    expect(fuente).toMatch(/completarMudanzaPendiente\(uid/)
    expect(fuente).toMatch(/setSelloRestauracion\(\(n\) => n \+ 1\)/)
  })

  it('sigue escuchando a Firebase mientras la app está montada', () => {
    expect(fuente).toMatch(/escucharUsuario\(/)
  })

  it('ofrece la sesión por contexto, y a sus hijos solo el uid (SPEC_19.2, E3)', () => {
    // `cambiarUid` se retiró: P7 entra por `conectarCuenta`, que es el mismo
    // `pasarACuenta` de Tu perfil. Nadie fuera de aquí pide cambiar el uid.
    expect(fuente).toMatch(/<ContextoSesion\.Provider value=\{sesion\}>/)
    expect(fuente).toMatch(/children\(uid\)/)
    expect(fuente).not.toMatch(/cambiarUid/)
    expect(fuente).toMatch(/conectarCuenta: pasarACuenta/)
  })

  it('es el único que escribe strivo.uid.local', () => {
    const otros = ['src/lib/sesion.js', 'src/lib/entradaCuenta.js', 'src/lib/salidaCuenta.js']
    otros.forEach((ruta) =>
      expect(readFileSync(ruta, 'utf8')).not.toMatch(/setItem\(\s*['"`]strivo\.uid\.local/),
    )
    expect(fuente.match(/localStorage\.setItem\(CLAVE_UID/g)).toHaveLength(2)
  })

  it('el velo lleva la frase de restauración y no una rueda', () => {
    expect(fuente).toMatch(/copy\.shared\.restauracion\.enCurso/)
    expect(fuente).toMatch(/aria-live="polite"/)
    expect(fuente).toMatch(/aria-busy="true"/)
    expect(fuente).not.toMatch(/spinner|progress|%/)
  })

  it('el velo de espera no cambió ni un píxel: data-surface solo donde hay texto (§4.5)', () => {
    expect(fuente).toMatch(
      /<div data-moment=\{momentoDe\(\)\} className="velo-transicion min-h-screen" aria-busy="true" \/>/,
    )
    expect(fuente.match(/data-surface=/g)).toHaveLength(1)
    expect(fuente).not.toMatch(/TransicionLuz/)
  })

  it('sigue siendo el único que acuña el uid local', () => {
    expect(fuente).toMatch(/`local-\$\{crypto\.randomUUID\(\)\}`/)
    const sesion = readFileSync('src/lib/sesion.js', 'utf8')
    expect(sesion).not.toMatch(/randomUUID/)
  })
})
