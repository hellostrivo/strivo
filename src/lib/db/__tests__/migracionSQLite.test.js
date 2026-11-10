// src/lib/db/__tests__/migracionSQLite.test.js
// De IndexedDB a SQLite, una sola vez y verificada (SPEC_17B, criterios 3–6 y 15).
//
// Se siembra IndexedDB con la API de siempre —la que usaba la app antes de esta
// SPEC— y se migra a un SQLite de verdad (`node:sqlite`, por el doble del
// plugin). Solo corre en el proyecto `indexeddb`: necesita escribir primero en
// IndexedDB.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { diario, shared, initUserTree } from '../index.js'
import {
  STORE_RECORDS,
  STORE_SYNC_QUEUE,
  getLocalDB,
  markQueueAttempt,
  writePath,
} from '../local.js'
import { crearAdaptadorSQLite, crearConexion, crearEsquema } from '../adaptadorSQLite.js'
import {
  MOTIVOS,
  canonico,
  esJSONPuro,
  leerIndexedDB,
  leerMarca,
  migrar,
} from '../migracionSQLite.js'
import { crearDobleDeAlmacen } from './dobleDeAlmacen.js'
import { UID, resetLocalDB } from './helpers.js'

beforeEach(resetLocalDB)
afterEach(resetLocalDB)

/** Lo que tendría un teléfono de prueba de la fundadora: un poco de todo. */
async function sembrarTelefono() {
  await initUserTree(UID)
  await shared.updateProfile(UID, { name: 'Prueba M1' })
  await diario.saveMorningEntry(UID, '2026-11-09', { action: 'Escribir «algo» reconocible ☕️' })
  await diario.createJournalEntry(UID, { date: '2026-11-09', text: 'Una entrada\ncon dos líneas' })
  await diario.savePinConfig(UID, {
    salt: 'ab12',
    hash: 'cd34',
    iterations: 210000,
    algorithm: 'PBKDF2-SHA256',
    enabled: true,
  })
  await shared.saveFrasesPreferencias(UID, {
    modo: 'guiadas',
    afinidades: ['estoicismo'],
    version: 1,
    updatedAt: '2026-11-09T10:00:00.000Z',
  })
  await diario.saveFraseAsignada(UID, {
    phraseId: 'u-0042',
    fecha: '2026-11-09',
    huella: 'h4-0a1b2c3d',
    catalogoVersion: 2,
    asignadaEn: '2026-11-09T07:00:00.000Z',
  })
  await writePath({
    uid: UID,
    path: `users/${UID}/breathing/favoritos/items/fav-1`,
    collection: 'breathing/favoritos',
    id: 'fav-1',
    data: { nombre: 'La de la noche', patronBaseId: 'coherencia' },
  })
  const db = await getLocalDB()
  // Una entrada de antes de SPEC_31: sin `rev`.
  await db.add(STORE_SYNC_QUEUE, {
    uid: UID,
    path: `users/${UID}/diario/journal/items/de-antes`,
    op: 'put',
    data: { text: 'de antes' },
    attempts: 2,
    enqueuedAt: '2026-10-01T10:00:00.000Z',
  })
  const [primera] = await db.getAll(STORE_SYNC_QUEUE)
  await markQueueAttempt(primera.seq)
}

async function volcadoDeIndexedDB() {
  const db = await getLocalDB()
  return canonico([await db.getAll(STORE_RECORDS), await db.getAll(STORE_SYNC_QUEUE)])
}

async function sqliteNuevo(opciones) {
  const doble = crearDobleDeAlmacen(opciones)
  const conexion = crearConexion(doble.plugin)
  await conexion.enExclusiva((c) => c.abrir())
  await crearEsquema(conexion)
  const migrarAqui = (extra = {}) => conexion.enExclusiva((c) => migrar(c, extra))
  return { ...doble, conexion, adaptador: crearAdaptadorSQLite(conexion), migrarAqui }
}

describe('criterio 3: se copia todo, y IndexedDB queda idéntico', () => {
  it('registros —PIN, frases y asignaciones incluidos— y la cola, con su seq, rev, attempts y orden', async () => {
    await sembrarTelefono()
    const db = await getLocalDB()
    const registros = await db.getAll(STORE_RECORDS)
    const cola = (await db.getAll(STORE_SYNC_QUEUE)).sort((a, b) => a.seq - b.seq)
    const antes = await volcadoDeIndexedDB()

    const sqlite = await sqliteNuevo()
    const resultado = await sqlite.migrarAqui()

    expect(resultado.ok).toBe(true)
    expect(resultado.marca).toMatchObject({
      origen: 'indexeddb',
      registros: registros.length,
      cola: cola.length,
    })

    // Las tres rutas que viven solo en el teléfono, también.
    for (const sufijo of [
      'diario/pinConfig',
      'shared/frases',
      'diario/frasesDelDia/items/2026-11-09~h4-0a1b2c3d',
    ]) {
      const ruta = `users/${UID}/${sufijo}`
      expect(await sqlite.adaptador.leer(ruta)).not.toBeNull()
    }

    // Cada registro, igual en contenido canónico.
    for (const r of registros) {
      const copia = await sqlite.adaptador.leer(r.path)
      expect(canonico(copia.data)).toBe(canonico(r.data))
      expect([copia.uid, copia.collection, copia.id]).toEqual([r.uid, r.collection, r.id])
    }

    // La cola, en el mismo orden, con lo suyo.
    const colaCopiada = await sqlite.adaptador.listarCola()
    expect(colaCopiada.map((e) => [e.seq, e.path, e.attempts, e.rev])).toEqual(
      cola.map((e) => [e.seq, e.path, e.attempts, e.rev]),
    )
    expect(colaCopiada.find((e) => e.path.endsWith('de-antes'))).not.toHaveProperty('rev')

    expect(await volcadoDeIndexedDB()).toBe(antes)
  })

  it('después de migrar, la cola sigue: una entrada nueva no reutiliza un seq viejo', async () => {
    await sembrarTelefono()
    const sqlite = await sqliteNuevo()
    await sqlite.migrarAqui()
    const maximo = Math.max(...(await sqlite.adaptador.listarCola()).map((e) => e.seq))
    await sqlite.adaptador.encolar({
      uid: UID,
      path: `users/${UID}/diario/journal/items/nueva`,
      op: 'put',
      data: { text: 'nueva' },
      enqueuedAt: '2026-11-10T10:00:00.000Z',
    })
    const nueva = (await sqlite.adaptador.listarCola()).find((e) => e.path.endsWith('/nueva'))
    expect(nueva.seq).toBeGreaterThan(maximo)
  })
})

describe('criterio 4: una migración que falla no deja nada a medias', () => {
  it('un error a mitad de la copia: SQLite vacío, sin marca, y el siguiente intento lo logra', async () => {
    await sembrarTelefono()
    let fallar = true
    const sqlite = await sqliteNuevo({
      antesDeEjecutar: (sentencias) => {
        if (fallar && sentencias.some((s) => s.sql.includes('INSERT INTO registros'))) {
          throw new Error('se cortó a la mitad')
        }
      },
    })

    expect(await sqlite.migrarAqui()).toEqual({ ok: false, motivo: MOTIVOS.copia })
    expect(await sqlite.adaptador.contar()).toEqual({ registros: 0, porSubir: 0 })
    expect(await sqlite.conexion.enExclusiva((c) => leerMarca(c))).toBeNull()

    fallar = false
    expect((await sqlite.migrarAqui()).ok).toBe(true)
    expect((await sqlite.adaptador.contar()).registros).toBeGreaterThan(5)
  })

  it('lo copiado no coincide: SQLite vacío, sin marca, y el siguiente intento lo logra', async () => {
    await sembrarTelefono()
    let estropear = true
    const sqlite = await sqliteNuevo({
      antesDeEjecutar: (sentencias) => {
        if (!estropear) return
        const insercion = sentencias.find((s) => s.sql.includes('INSERT INTO registros'))
        if (insercion) insercion.valores[4] = '{"cambiado":true}'
      },
    })

    expect(await sqlite.migrarAqui()).toEqual({ ok: false, motivo: MOTIVOS.noCoincide })
    expect(await sqlite.adaptador.contar()).toEqual({ registros: 0, porSubir: 0 })
    expect(await sqlite.conexion.enExclusiva((c) => leerMarca(c))).toBeNull()

    estropear = false
    expect((await sqlite.migrarAqui()).ok).toBe(true)
  })

  it('si quien espera ya se fue (el techo), no escribe la marca: vacía y se va', async () => {
    await sembrarTelefono()
    const sqlite = await sqliteNuevo()
    let leidas = 0
    const resultado = await sqlite.migrarAqui({ abandonada: () => ++leidas > 1 })
    expect(resultado).toEqual({ ok: false, motivo: MOTIVOS.techo })
    expect(await sqlite.adaptador.contar()).toEqual({ registros: 0, porSubir: 0 })
    expect(await sqlite.conexion.enExclusiva((c) => leerMarca(c))).toBeNull()
  })

  it('si el error de la marca llega después de que la marca entró, no vacía', async () => {
    await sembrarTelefono()
    let mentir = true
    const sqlite = await sqliteNuevo()
    // El puente contesta con error después de haber escrito la marca.
    const migrado = await sqlite.conexion.enExclusiva((c) =>
      migrar(
        {
          consultar: c.consultar,
          ejecutar: async (sentencias) => {
            const cambios = await c.ejecutar(sentencias)
            if (mentir && sentencias[0]?.sql.includes('INTO meta')) {
              mentir = false
              throw new Error('el puente se cayó al volver')
            }
            return cambios
          },
        },
        {},
      ),
    )
    expect(migrado.ok).toBe(true)
    expect((await sqlite.adaptador.contar()).registros).toBeGreaterThan(0)
  })
})

describe('RN-DB-02: lo que no es JSON no se arregla', () => {
  it('esJSONPuro distingue lo que vuelve igual de JSON de lo que no', () => {
    expect(esJSONPuro({ a: [1, 'b', null, true, { c: 2.5 }] })).toBe(true)
    expect(esJSONPuro({ a: undefined })).toBe(false)
    expect(esJSONPuro({ fecha: new Date() })).toBe(false)
    expect(esJSONPuro({ n: NaN })).toBe(false)
    expect(esJSONPuro({ n: Infinity })).toBe(false)
    expect(esJSONPuro([1, , 3])).toBe(false)
    expect(esJSONPuro({ m: new Map() })).toBe(false)
    expect(esJSONPuro(Object.create(null))).toBe(true)
  })

  it('un registro con un valor que no es JSON: no termina, no copia nada, IndexedDB intacto', async () => {
    await sembrarTelefono()
    const db = await getLocalDB()
    await db.put(STORE_RECORDS, {
      path: `users/${UID}/diario/journal/items/raro`,
      uid: UID,
      collection: 'diario/journal',
      id: 'raro',
      data: { text: 'hola', otherText: undefined },
      updatedAt: '2026-11-09T10:00:00.000Z',
    })
    const antes = await volcadoDeIndexedDB()

    const sqlite = await sqliteNuevo()
    expect(await sqlite.migrarAqui()).toEqual({ ok: false, motivo: MOTIVOS.noJson })
    expect(await sqlite.adaptador.contar()).toEqual({ registros: 0, porSubir: 0 })
    expect(await volcadoDeIndexedDB()).toBe(antes)
  })
})

describe('criterio 6: IndexedDB vacío', () => {
  it('sin base `strivo`, se marca con cero y no se crea la base', async () => {
    const sqlite = await sqliteNuevo()
    const resultado = await sqlite.migrarAqui()
    expect(resultado.ok).toBe(true)
    expect(resultado.marca).toMatchObject({ origen: 'vacio', registros: 0, cola: 0 })
    const bases = await indexedDB.databases()
    expect(bases.some((b) => b.name === 'strivo')).toBe(false)
  })

  it('leerIndexedDB no abre una base que no existe', async () => {
    expect(await leerIndexedDB()).toEqual({ existe: false, registros: [], cola: [] })
    expect((await indexedDB.databases()).some((b) => b.name === 'strivo')).toBe(false)
  })
})

describe('criterio 15: 3.000 registros', () => {
  it('se migran enteros y verificados, con margen de sobra', async () => {
    const db = await getLocalDB()
    const tx = db.transaction(STORE_RECORDS, 'readwrite')
    for (let i = 0; i < 3000; i += 1) {
      const fecha = `2026-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`
      tx.store.put({
        path: `users/${UID}/diario/journal/items/e-${String(i).padStart(5, '0')}`,
        uid: UID,
        collection: 'diario/journal',
        id: `e-${i}`,
        data: { date: fecha, text: 'palabra '.repeat(60), emotions: ['calma'] },
        updatedAt: '2026-11-09T10:00:00.000Z',
      })
    }
    await tx.done

    const sqlite = await sqliteNuevo()
    const inicio = performance.now()
    const resultado = await sqlite.migrarAqui()
    const ms = performance.now() - inicio

    expect(resultado.ok).toBe(true)
    expect(resultado.marca.registros).toBe(3000)
    expect(ms).toBeLessThan(10000)
    expect(
      await sqlite.adaptador.leerIndice('byCollectionDate', [UID, 'diario/journal', '2026-01-01']),
    ).not.toHaveLength(0)
  })
})
