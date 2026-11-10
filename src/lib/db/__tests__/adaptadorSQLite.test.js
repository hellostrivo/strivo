// src/lib/db/__tests__/adaptadorSQLite.test.js
// Lo propio del adaptador SQLite (SPEC_17B). El contrato común lo comprueba la
// suite entera en el proyecto `sqlite`; aquí, lo que solo tiene sentido con
// SQLite y los equivalentes de los casos que miran IndexedDB por dentro.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  dequeueSiIgual,
  enqueue,
  listQueue,
  pendingCount,
  readCollection,
  readCollectionByDate,
  writePath,
} from '../local.js'
import { reiniciarAlmacenParaPruebas, usarAdaptador } from '../almacen.js'
import { cargarPlugin, crearConexion } from '../adaptadorSQLite.js'
import { aTiempo } from '../../__tests__/dobleDeCapacitor.js'
import { almacenSQLiteDePruebas, crearDobleDeAlmacen } from './dobleDeAlmacen.js'
import { UID } from './helpers.js'

let sqlite
beforeEach(async () => {
  sqlite = await almacenSQLiteDePruebas()
  usarAdaptador(sqlite.adaptador)
})
afterEach(() => reiniciarAlmacenParaPruebas())

describe('el plugin', () => {
  it('nunca sale suelto de una promesa: con un Proxy que contesta a then, nada se cuelga', async () => {
    const { plugin } = crearDobleDeAlmacen()
    const conexion = crearConexion(plugin)
    await aTiempo(conexion.enExclusiva((c) => c.abrir()))
    expect(await aTiempo(conexion.enExclusiva((c) => c.consultar('SELECT 1 AS uno')))).toEqual([
      { uno: 1 },
    ])
  })

  it('cargarPlugin lo devuelve envuelto en { plugin }', () => {
    expect(cargarPlugin.toString()).toMatch(/return \{ plugin: StrivoAlmacen \}/)
  })

  it('criterio 10: solo un archivo de src/ importa el plugin, y bajo demanda', () => {
    const importadores = []
    const recorrer = (dir) => {
      for (const nombre of readdirSync(dir)) {
        const ruta = join(dir, nombre)
        if (statSync(ruta).isDirectory()) {
          if (nombre !== '__tests__') recorrer(ruta)
        } else if (/\.(js|jsx)$/.test(nombre)) {
          if (/['"]strivo-almacen['"]/.test(readFileSync(ruta, 'utf8'))) importadores.push(ruta)
        }
      }
    }
    recorrer('src')
    expect(importadores).toEqual([join('src', 'lib', 'db', 'adaptadorSQLite.js')])
    const fuente = readFileSync(importadores[0], 'utf8')
    expect(fuente).toMatch(/await import\('strivo-almacen'\)/)
    expect(fuente).not.toMatch(/^import .*strivo-almacen/m)
  })

  it('la web no carga ni SQLite ni la migración: almacen.js los pide bajo demanda', () => {
    const fuente = readFileSync('src/lib/db/almacen.js', 'utf8')
    expect(fuente).not.toMatch(/^import .*(adaptadorSQLite|migracionSQLite|arranqueNativo)/m)
    expect(fuente).toMatch(/import\('\.\/arranqueNativo\.js'\)/)
  })
})

describe('condición 2: ningún texto de la persona entra en el SQL', () => {
  it('lo escrito viaja en valores y vuelve tal cual', async () => {
    const malicioso = `x'); DROP TABLE registros; --`
    await writePath({
      uid: UID,
      path: `users/${UID}/diario/journal/items/j1`,
      collection: 'diario/journal',
      id: 'j1',
      data: { text: malicioso },
    })
    const [entrada] = await readCollection(UID, 'diario/journal')
    expect(entrada.text).toBe(malicioso)
    expect(sqlite.estado.db.prepare('SELECT COUNT(*) AS n FROM registros').get().n).toBe(1)
  })

  it('ninguna sentencia del adaptador se arma con texto: todas son literales', () => {
    for (const archivo of ['adaptadorSQLite.js', 'migracionSQLite.js']) {
      const fuente = readFileSync(join('src', 'lib', 'db', archivo), 'utf8')
      const plantillasConValores = fuente.match(
        /`[^`]*\b(SELECT|INSERT|UPDATE|DELETE)\b[^`]*\$\{[^`]*`/g,
      )
      expect(plantillasConValores, archivo).toBeNull()
    }
  })

  it('un undefined cruza el puente como null', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/shared/auth`,
      collection: 'shared',
      id: undefined,
      data: { email: 'a@b.c' },
      sync: false,
    })
    expect(sqlite.estado.db.prepare('SELECT id FROM registros').get().id).toBeNull()
  })
})

describe('las lecturas, en el orden de IndexedDB', () => {
  it('por la clave del índice y después por path', async () => {
    for (const id of ['c', 'a', 'b']) {
      await writePath({
        uid: UID,
        path: `users/${UID}/diario/journal/items/${id}`,
        collection: 'diario/journal',
        id,
        data: { date: '2026-11-10', text: id },
        sync: false,
      })
    }
    expect((await readCollection(UID, 'diario/journal')).map((e) => e.id)).toEqual(['a', 'b', 'c'])
    expect(
      (await readCollectionByDate(UID, 'diario/journal', '2026-11-10')).map((e) => e.id),
    ).toEqual(['a', 'b', 'c'])
    expect(await readCollectionByDate(UID, 'diario/journal', '2026-11-11')).toEqual([])
  })

  it('una fecha que no es cadena no entra en el índice de fechas, como en IndexedDB', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/diario/journal/items/raro`,
      collection: 'diario/journal',
      id: 'raro',
      data: { date: 20261110 },
      sync: false,
    })
    expect(sqlite.estado.db.prepare('SELECT fecha FROM registros').get().fecha).toBeNull()
  })
})

describe('la cola: las entradas de antes de SPEC_31 (equivalente en SQLite)', () => {
  const RUTA = `users/${UID}/diario/morningEntry/items/2026-10-01`
  const deAntes = () =>
    sqlite.estado.db
      .prepare(
        `INSERT INTO cola (uid, path, op, data, attempts, rev, enqueuedAt) VALUES (?, ?, 'put', ?, 0, NULL, ?)`,
      )
      .run(UID, RUTA, JSON.stringify({ action: 'de antes' }), '2026-10-01T10:00:00.000Z')

  it('sin tocar, sale: no trae rev y la enviada tampoco', async () => {
    deAntes()
    const [enviada] = await listQueue(UID)
    expect(enviada).not.toHaveProperty('rev')
    expect(await dequeueSiIgual(enviada)).toBe(true)
    expect(await pendingCount(UID)).toBe(0)
  })

  it('reescrita mientras viaja, se queda con rev 1', async () => {
    deAntes()
    const [enviada] = await listQueue(UID)
    await enqueue({ uid: UID, path: RUTA, op: 'put', data: { action: 'nueva' } })
    expect(await dequeueSiIgual(enviada)).toBe(false)
    const [queda] = await listQueue(UID)
    expect(queda).toMatchObject({ seq: enviada.seq, rev: 1, data: { action: 'nueva' } })
  })
})

describe('RN-DB-04: lo que vive solo en el teléfono', () => {
  it('criterio 8: el PIN, las frases y sus asignaciones nunca entran en la cola de SQLite', async () => {
    for (const sufijo of [
      'diario/pinConfig',
      'shared/frases',
      'diario/frasesDelDia/items/2026-11-10~h4-1',
    ]) {
      await enqueue({ uid: UID, path: `users/${UID}/${sufijo}`, op: 'put', data: { a: 1 } })
    }
    expect(await pendingCount(UID)).toBe(0)
    expect(sqlite.estado.db.prepare('SELECT COUNT(*) AS n FROM cola').get().n).toBe(0)
  })

  it('criterio 7: lo que baja con sync: false no sube', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/diario/morningEntry/items/2026-11-01`,
      collection: 'diario/morningEntry',
      id: '2026-11-01',
      data: { action: 'bajó de la nube' },
      sync: false,
    })
    expect(await pendingCount(UID)).toBe(0)
  })
})
