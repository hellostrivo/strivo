// src/lib/__tests__/sesion.test.js
// Cómo se prepara el árbol al arrancar (SPEC_17A §4.4; criterios 10, 11, 12 y 14).
//
// `restaurar` se sustituye por un doble que escribe en la base local lo que
// se le diga y devuelve el resultado que se le diga: aquí no se prueba la
// bajada —eso es `restaurar.test.js`— sino el **orden**: cuándo se restaura,
// cuándo se siembra, y que la segunda nunca le gane a la primera.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'

import * as shared from '@lib/db/shared'
import { pendingCount, writePath } from '@lib/db/local'
import { UID, resetLocalDB } from '@lib/db/__tests__/helpers.js'

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

const { esUidDeCuenta, prepararArbol, reintentarAlVolverLaRed, TECHO_DE_ESPERA_MS } =
  await import('../sesion.js')

const CUENTA = 'AbC123firebaseUid'
const PERFIL_REMOTO = { name: 'Alejandra', gender: 'f', updatedAt: '2026-09-01T10:00:00.000Z' }

beforeEach(async () => {
  doble.resultado = { ok: true, escritos: 0, fusionados: 0 }
  doble.remoto = null
  doble.remotoOnboarding = null
  doble.llamadas = 0
  doble.soltar = null
  marcas.clear()
  await resetLocalDB()
})

afterEach(() => vi.unstubAllGlobals())

describe('esUidDeCuenta (DP-17.7, provisional)', () => {
  it('un uid que acuña el arranque no es una cuenta', () => {
    expect(esUidDeCuenta('local-3f2a')).toBe(false)
    expect(esUidDeCuenta(UID)).toBe(true)
    expect(esUidDeCuenta(CUENTA)).toBe(true)
  })

  it('nada, vacío o no-cadena tampoco lo es', () => {
    expect(esUidDeCuenta('')).toBe(false)
    expect(esUidDeCuenta(null)).toBe(false)
    expect(esUidDeCuenta(undefined)).toBe(false)
    expect(esUidDeCuenta(42)).toBe(false)
  })

  it('lleva el comentario de deuda: SPEC_19 la sustituye por onAuthStateChanged', () => {
    const fuente = readFileSync('src/lib/sesion.js', 'utf8')
    expect(fuente).toMatch(/PROVISIONAL/)
    expect(fuente).toMatch(/DP-17\.7/)
    expect(fuente).toMatch(/onAuthStateChanged/)
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
    const r = await prepararArbol(CUENTA, { enRestauracion: (a) => velo.push(a) })

    expect(doble.llamadas).toBe(1)
    expect(velo).toEqual([true, false])
    expect(r.sembrado).toBe(false)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await pendingCount(CUENTA)).toBe(0)
  })

  it('cuenta sin nada en la nube: se restaura, no baja nada, y entonces se siembra', async () => {
    const r = await prepararArbol(CUENTA)
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
    const r = await prepararArbol(CUENTA)
    expect(doble.llamadas).toBe(0)
    expect(r.restauracion).toBeNull()
    expect(r.sembrado).toBe(false)
  })

  it('con marca y árbol ausente —marca huérfana— se retira la marca y se restaura', async () => {
    marcas.set(CUENTA, 'de antes de borrar IndexedDB')
    doble.remoto = PERFIL_REMOTO
    const r = await prepararArbol(CUENTA)
    expect(doble.llamadas).toBe(1)
    expect(r.restauracion.ok).toBe(true)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    // La marca que queda es la que puso esta restauración, no la huérfana.
    expect(marcas.get(CUENTA)).toBe('ahora')
  })

  it('sin marca pero con árbol, se restaura igual (la marca no es la única condición)', async () => {
    await shared.initShared(CUENTA)
    doble.remoto = PERFIL_REMOTO
    const r = await prepararArbol(CUENTA)
    expect(doble.llamadas).toBe(1)
    expect(r.sembrado).toBe(false)
  })
})

describe('criterio 12: una restauración fallida no destruye el árbol remoto', () => {
  it('falla, se siembra detrás, y la cola no lleva ninguno de los cuatro shared/*', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida', escritos: 0, fusionados: 0 }
    const r = await prepararArbol(CUENTA)
    expect(r.restauracion.ok).toBe(false)
    expect(r.sembrado).toBe(true)
    expect(await pendingCount(CUENTA)).toBe(0)
    expect(marcas.has(CUENTA)).toBe(false)
  })

  it('y el reintento posterior sí recupera el nombre por encima de la siembra', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida', escritos: 0, fusionados: 0 }
    await prepararArbol(CUENTA)
    expect((await shared.getProfile(CUENTA)).name).toBeNull()

    doble.resultado = { ok: true, escritos: 0, fusionados: 1 }
    doble.remoto = PERFIL_REMOTO
    const { restaurar } = await import('@lib/db/restaurar')
    await restaurar(CUENTA)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
  })

  it('con cualquier motivo que no sea la red, no se pone oyente', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida', escritos: 0, fusionados: 0 }
    expect((await prepararArbol(CUENTA)).quitarOyente).toBeNull()
    doble.resultado = { ok: false, motivo: 'sin_configuracion', escritos: 0, fusionados: 0 }
    expect((await prepararArbol(CUENTA)).quitarOyente).toBeNull()
  })
})

describe('cambio de uid a mitad de sesión (D7)', () => {
  it('con restaurarSiHaceFalta en false no se restaura aunque sea una cuenta sin marca', async () => {
    await shared.initShared(CUENTA)
    const r = await prepararArbol(CUENTA, { restaurarSiHaceFalta: false })
    expect(doble.llamadas).toBe(0)
    expect(r.restauracion).toBeNull()
    expect(r.sembrado).toBe(false)
  })

  it('y si por lo que fuera no hubiera árbol, se siembra sin restaurar', async () => {
    const r = await prepararArbol(CUENTA, { restaurarSiHaceFalta: false })
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
    const r = await prepararArbol(CUENTA)
    expect(typeof r.quitarOyente).toBe('function')
    expect(w.cuantos()).toBe(1)
  })

  it('reintenta una vez al volver la red y se desuscribe: sin segundo intento', async () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    doble.resultado = { ok: false, motivo: 'sin_red', escritos: 0, fusionados: 0 }
    await prepararArbol(CUENTA)
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
    const { quitarOyente } = await prepararArbol(CUENTA)
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
    const r = await prepararArbol(CUENTA, { enRestauracion: (a) => velo.push(a), techoMs: 20 })

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
    await prepararArbol(CUENTA, { techoMs: 20 })
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
      const r = await prepararArbol(CUENTA, { techoMs: 15000 })
      expect(r.aTiempo).toBe(true)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('el techo no es un umbral de fallo: no deja oyente ni resultado de error', async () => {
    doble.soltar = undefined
    const r = await prepararArbol(CUENTA, { techoMs: 20 })
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
    const primera = prepararArbol(CUENTA, { restaurarSiHaceFalta: true })
    const segunda = prepararArbol(CUENTA, { restaurarSiHaceFalta: false })
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

    const primera = prepararArbol(CUENTA, { restaurarSiHaceFalta: true })
    const segunda = prepararArbol(CUENTA, { restaurarSiHaceFalta: false })
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
    const primera = await prepararArbol(CUENTA)
    expect(doble.llamadas).toBe(1)
    expect(primera.sembrado).toBe(true)

    // Con marca y árbol, la segunda evaluación no restaura (criterio 10) y no
    // siembra, que es lo que dice que evaluó de verdad y no devolvió lo viejo.
    const segunda = await prepararArbol(CUENTA)
    expect(segunda).not.toBe(primera)
    expect(doble.llamadas).toBe(1)
    expect(segunda.sembrado).toBe(false)
  })

  it('tras un fallo también se retira la entrada: el reintento no recibe el fallo viejo', async () => {
    doble.resultado = { ok: false, motivo: 'interrumpida' }
    const primera = await prepararArbol(CUENTA)
    expect(primera.restauracion.ok).toBe(false)

    doble.resultado = { ok: true, escritos: 1, fusionados: 0 }
    doble.remoto = PERFIL_REMOTO
    const segunda = await prepararArbol(CUENTA)
    expect(segunda.restauracion.ok).toBe(true)
    expect(doble.llamadas).toBe(2)
  })

  it('dos uid distintos a la vez no se interfieren', async () => {
    doble.soltar = undefined
    const OTRA = 'XyZ987otraCuenta'
    const a = prepararArbol(CUENTA)
    const b = prepararArbol(OTRA)
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

  it('importa esUidDeCuenta y prepararArbol de lib/sesion', () => {
    expect(fuente).toMatch(/import \{[^}]*esUidDeCuenta[^}]*\} from '@lib\/sesion'/)
    expect(fuente).toMatch(/prepararArbol\(/)
  })

  it('arranca la cola con el uid y devuelve su limpieza al efecto', () => {
    expect(fuente).toMatch(/return startSync\(uid\)/)
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
