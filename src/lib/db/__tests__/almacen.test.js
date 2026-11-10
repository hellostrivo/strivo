// src/lib/db/__tests__/almacen.test.js
// Qué almacén se usa, y cómo se llega a él al arrancar (SPEC_17B, DP-17B.5,
// DP-17B.6, DP-17B.9 y criterios 5, 6, 9 y 10).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { diario, initUserTree, shared } from '../index.js'
import { readPath } from '../local.js'
import {
  CLAVE_PISTA,
  adaptador,
  almacenListoSinEspera,
  estadoDelAlmacen,
  prepararAlmacen,
  reiniciarAlmacenParaPruebas,
} from '../almacen.js'
import { CLAVE_UID, guardarClave, leerClave } from '../clavesDelTelefono.js'
import { crearDobleDeAlmacen } from './dobleDeAlmacen.js'
import { UID, resetLocalDB } from './helpers.js'

/** Un `localStorage` en memoria, con `length` y `key` como el de verdad. */
function memoriaLocal(inicial = {}) {
  const datos = new Map(Object.entries(inicial))
  return {
    get length() {
      return datos.size
    },
    key: (i) => [...datos.keys()][i] ?? null,
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    removeItem: (k) => datos.delete(k),
    clear: () => datos.clear(),
    datos,
  }
}

/** Un reloj que no avanza solo: `vencer()` resuelve todas las esperas pendientes. */
function relojManual() {
  const pendientes = []
  return {
    dormir: (ms) => new Promise((resolver) => pendientes.push({ ms, resolver })),
    vencer() {
      for (const { resolver } of pendientes.splice(0)) resolver()
    },
  }
}

const nunca = () => new Promise(() => {})

let local
beforeEach(async () => {
  await resetLocalDB()
  local = memoriaLocal()
  vi.stubGlobal('localStorage', local)
})
afterEach(async () => {
  vi.unstubAllGlobals()
  reiniciarAlmacenParaPruebas()
  await resetLocalDB()
})

/** Prepara el almacén en «la app nativa» con un plugin doble. */
function arrancar(doble, extra = {}) {
  return prepararAlmacen({
    nativa: true,
    cargar: async () => ({ plugin: doble.plugin }),
    esperas: [0, 0, 0],
    dormir: nunca,
    almacen: local,
    ...extra,
  })
}

describe('criterio 10: en la web no cambia nada', () => {
  it('no espera, usa IndexedDB y no carga el plugin', async () => {
    const cargar = vi.fn()
    expect(almacenListoSinEspera(false)).toBe(true)
    expect(await prepararAlmacen({ nativa: false, cargar })).toEqual({
      estado: 'listo',
      cual: 'indexeddb',
    })
    expect(cargar).not.toHaveBeenCalled()
    expect(adaptador().nombre).toBe('indexeddb')
  })

  it('en la app nativa sí espera', () => {
    expect(almacenListoSinEspera(true)).toBe(false)
  })
})

describe('el primer arranque de la versión nueva migra', () => {
  it('con IndexedDB con datos: usa SQLite, dice «correcta» y deja la pista', async () => {
    await initUserTree(UID)
    await shared.updateProfile(UID, { name: 'Prueba M1' })
    const doble = crearDobleDeAlmacen()

    expect(await arrancar(doble)).toEqual({ estado: 'listo', cual: 'sqlite' })
    expect(adaptador().nombre).toBe('sqlite')
    expect(estadoDelAlmacen().migracion.estado).toBe('correcta')
    expect(local.getItem(CLAVE_PISTA)).toBe('sqlite')
    // Lo de antes se lee de SQLite, por la misma API de siempre.
    expect((await readPath(`users/${UID}/shared/profile`)).name).toBe('Prueba M1')
  })

  it('criterio 6: con IndexedDB vacío, «nada que migrar» y SQLite', async () => {
    const doble = crearDobleDeAlmacen()
    expect(await arrancar(doble)).toEqual({ estado: 'listo', cual: 'sqlite' })
    expect(estadoDelAlmacen().migracion.estado).toBe('nadaQueMigrar')
  })

  it('criterio 5: el segundo arranque no migra otra vez ni lee IndexedDB, aunque haya cambiado', async () => {
    await initUserTree(UID)
    const doble = crearDobleDeAlmacen()
    await arrancar(doble)
    const fecha = estadoDelAlmacen().migracion.fecha

    // IndexedDB cambia por detrás (con el almacén de la web).
    reiniciarAlmacenParaPruebas()
    await diario.saveMorningEntry(UID, '2026-11-10', { action: 'solo en IndexedDB' })

    // Otra carga de la app sobre el mismo archivo: `abrir` encuentra la base.
    const leer = vi.fn()
    expect(await arrancar(doble, { leer })).toEqual({ estado: 'listo', cual: 'sqlite' })
    expect(leer).not.toHaveBeenCalled()
    expect(estadoDelAlmacen().migracion.fecha).toBe(fecha)
  })

  it('si la migración no termina, esta sesión sigue con IndexedDB y el siguiente arranque migra', async () => {
    await initUserTree(UID)
    let fallar = true
    const doble = crearDobleDeAlmacen({
      antesDeEjecutar: (sentencias) => {
        if (fallar && sentencias.some((s) => s.sql.includes('INSERT INTO registros'))) {
          throw new Error('se cortó')
        }
      },
    })
    expect(await arrancar(doble)).toEqual({ estado: 'listo', cual: 'indexeddb' })
    expect(estadoDelAlmacen().migracion).toEqual({ estado: 'noTermino', motivo: 'copia' })
    expect(adaptador().nombre).toBe('indexeddb')
    expect(local.getItem(CLAVE_PISTA)).toBeNull()

    fallar = false
    expect(await arrancar(doble)).toEqual({ estado: 'listo', cual: 'sqlite' })
    expect(estadoDelAlmacen().migracion.estado).toBe('correcta')
  })
})

describe('DP-17B.9: si SQLite no abre', () => {
  const fallaAlAbrir = (existe) =>
    crearDobleDeAlmacen({
      existe,
      antesDeAbrir: () => {
        throw new Error('no abre')
      },
    })

  it('tres intentos; el archivo no existe y no se pudo crear → esta sesión con IndexedDB', async () => {
    const doble = fallaAlAbrir(false)
    expect(await arrancar(doble)).toEqual({ estado: 'listo', cual: 'indexeddb' })
    expect(doble.estado.llamadas.abrir).toBe(3)
    expect(estadoDelAlmacen().migracion).toEqual({ estado: 'noTermino', motivo: 'sinAbrir' })
  })

  it('el archivo existe y no abre → la pantalla de error, nunca IndexedDB', async () => {
    await initUserTree(UID)
    const doble = fallaAlAbrir(true)
    expect(await arrancar(doble)).toEqual({ estado: 'error' })
    expect(doble.estado.llamadas.abrir).toBe(3)
  })

  it('sin el módulo nativo, esta sesión con IndexedDB', async () => {
    const r = await prepararAlmacen({
      nativa: true,
      cargarNativo: async () => {
        throw new Error('sin chunk')
      },
      almacen: local,
    })
    expect(r).toEqual({ estado: 'listo', cual: 'indexeddb' })
  })
})

describe('DP-17B.6: el techo de 10 s', () => {
  it('migrando: se abandona, la sesión sigue con IndexedDB y la migración no deja marca', async () => {
    await initUserTree(UID)
    const reloj = relojManual()
    let soltarLectura
    const lectura = new Promise((r) => {
      soltarLectura = r
    })
    const { leerIndexedDB } = await import('../migracionSQLite.js')
    const doble = crearDobleDeAlmacen()
    const preparado = arrancar(doble, {
      dormir: reloj.dormir,
      leer: async () => {
        await lectura
        return leerIndexedDB()
      },
    })
    await new Promise((r) => setTimeout(r, 20))
    reloj.vencer()
    expect(await preparado).toEqual({ estado: 'listo', cual: 'indexeddb' })
    expect(estadoDelAlmacen().migracion).toEqual({ estado: 'noTermino', motivo: 'techo' })

    soltarLectura()
    await new Promise((r) => setTimeout(r, 50))
    const meta = doble.estado.db.prepare(`SELECT * FROM meta WHERE clave = 'migradoEn'`).all()
    expect(meta).toEqual([])
    expect(doble.estado.db.prepare('SELECT COUNT(*) AS n FROM registros').get().n).toBe(0)
    expect(adaptador().nombre).toBe('indexeddb')
  })

  it('abriendo, sin pista y con datos en IndexedDB (nunca se migró) → IndexedDB', async () => {
    await initUserTree(UID)
    const reloj = relojManual()
    const colgado = { plugin: new Proxy({}, { get: (_, p) => (p === 'then' ? undefined : nunca) }) }
    const preparado = arrancar(colgado, { dormir: reloj.dormir })
    await new Promise((r) => setTimeout(r, 10))
    reloj.vencer()
    expect(await preparado).toEqual({ estado: 'listo', cual: 'indexeddb' })
  })

  it('abriendo, con la pista de SQLite → la pantalla de error, no una app vacía', async () => {
    local.setItem(CLAVE_PISTA, 'sqlite')
    const reloj = relojManual()
    const colgado = { plugin: new Proxy({}, { get: (_, p) => (p === 'then' ? undefined : nunca) }) }
    const preparado = arrancar(colgado, { dormir: reloj.dormir })
    await new Promise((r) => setTimeout(r, 10))
    reloj.vencer()
    expect(await preparado).toEqual({ estado: 'error' })
  })

  it('con la marca ya escrita, espera a SQLite: nunca vuelve a IndexedDB', async () => {
    await initUserTree(UID)
    const reloj = relojManual()
    let soltarClaves
    const claves = new Promise((r) => {
      soltarClaves = r
    })
    const doble = crearDobleDeAlmacen()
    // Las claves tardan: la marca ya está cuando vence el primer techo.
    const consultar = doble.plugin.consultar
    const plugin = new Proxy(doble.plugin, {
      get: (destino, p) =>
        p === 'consultar'
          ? async (args) => {
              if (args.sql.includes('FROM claves')) await claves
              return consultar(args)
            }
          : destino[p],
    })
    local.removeItem(CLAVE_UID)
    const preparado = arrancar({ plugin }, { dormir: reloj.dormir })
    await new Promise((r) => setTimeout(r, 30))
    reloj.vencer()
    soltarClaves()
    expect(await preparado).toEqual({ estado: 'listo', cual: 'sqlite' })
  })
})

describe('criterio 9: el uid sobrevive a que iOS limpie el WebView', () => {
  it('con localStorage vacío y el uid copiado en SQLite, vuelve ese uid', async () => {
    await initUserTree(UID)
    const doble = crearDobleDeAlmacen()
    await arrancar(doble)
    guardarClave(CLAVE_UID, UID)
    guardarClave(`strivo.restaurado.${UID}`, '2026-11-10T10:00:00.000Z')
    await new Promise((r) => setTimeout(r, 10))

    // iOS limpia el almacén del WebView: se va `localStorage` (e IndexedDB).
    local.clear()
    reiniciarAlmacenParaPruebas()
    await resetLocalDB()

    expect(await arrancar(doble)).toEqual({ estado: 'listo', cual: 'sqlite' })
    expect(leerClave(CLAVE_UID)).toBe(UID)
    expect(leerClave(`strivo.restaurado.${UID}`)).toBe('2026-11-10T10:00:00.000Z')
    // Y lo escrito sigue ahí, bajo ese uid.
    expect(await readPath(`users/${UID}/shared/profile`)).not.toBeNull()
  })
})
