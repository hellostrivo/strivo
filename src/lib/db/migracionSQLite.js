// src/lib/db/migracionSQLite.js
// De IndexedDB a SQLite, una sola vez y verificada (SPEC_17B, DP-17B.5).
//
// **IndexedDB no se toca**: se lee y nada más. Ni se borra, ni se escribe, ni
// se crea —si la base `strivo` no aparece en `indexedDB.databases()`, no se
// abre, porque abrirla la crearía—. Lo que había ahí sigue ahí, idéntico, por
// si hiciera falta volver.
//
// El orden, y por qué:
//
//   1. Se lee **todo**: los registros de `records` —el PIN, la preferencia de
//      frases y las asignaciones incluidos, que viven en el teléfono y SQLite
//      es el teléfono— y las entradas de `syncQueue` con su `seq`, su `rev`, sus
//      `attempts` y su orden.
//   2. Se comprueba que **todo es JSON tal cual** (RN-DB-02). Un `Date`, un
//      `undefined`, un `NaN`, un objeto que no sea plano: la migración no lo
//      arregla. No termina y lo dice («hay un valor que no es JSON»). Decidido
//      así en el §9 de la instrucción: se bloquea antes que corregir.
//   3. Se vacía SQLite y se copia en **un solo lote**, que el plugin ejecuta
//      como una transacción. Sin marca, nada de lo que hubiera en SQLite es de
//      fiar: empezar de cero es lo que hace que reintentar no duplique nada.
//   4. Se verifica: mismo número de registros y de entradas, el mismo conjunto
//      de rutas, y cada fila con el mismo contenido en JSON canónico —las claves
//      ordenadas—.
//   5. **Solo si todo coincide**, se escribe la marca `migradoEn` en `meta`, con
//      los números. La marca vive en SQLite y no en `localStorage`, porque
//      `localStorage` se va con IndexedDB si iOS limpia el WebView.
//
// Si algo falla o no coincide, SQLite se vacía, no se marca, esta sesión sigue
// con IndexedDB y el siguiente arranque lo intenta otra vez. Si quien llama
// avisa de que ya no espera (el techo de `almacen.js`), la migración no escribe
// la marca: vacía y se va.

import { openDB } from 'idb'

const BASE = 'strivo'

/** Por qué una migración no terminó. Los textos están en `copy/diagnostico.js`. */
export const MOTIVOS = Object.freeze({
  sinAbrir: 'sinAbrir',
  copia: 'copia',
  noCoincide: 'noCoincide',
  noJson: 'noJson',
  techo: 'techo',
})

// ─── JSON tal cual ────────────────────────────────────────────────────────────

/**
 * ¿Este valor sale de `JSON.stringify` y vuelve de `JSON.parse` **igual**?
 * Cadenas, números finitos, booleanos, `null`, listas sin huecos y objetos
 * planos con valores así. Cualquier otra cosa —`undefined` incluido, también
 * como valor de una clave— no.
 */
export function esJSONPuro(valor) {
  if (valor === null) return true
  switch (typeof valor) {
    case 'string':
    case 'boolean':
      return true
    case 'number':
      return Number.isFinite(valor)
    case 'object': {
      if (Array.isArray(valor)) {
        for (let i = 0; i < valor.length; i += 1) {
          if (!(i in valor) || !esJSONPuro(valor[i])) return false
        }
        return true
      }
      const proto = Object.getPrototypeOf(valor)
      if (proto !== Object.prototype && proto !== null) return false
      return Object.values(valor).every(esJSONPuro)
    }
    default:
      return false
  }
}

/** JSON con las claves ordenadas, a cualquier profundidad. */
export function canonico(valor) {
  return JSON.stringify(valor, (_clave, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]]),
        )
      : v,
  )
}

const esTexto = (v) => typeof v === 'string'
const esTextoONulo = (v) => v === null || typeof v === 'string'
const esTextoOAusente = (v) => v === undefined || typeof v === 'string'
const esEntero = (v) => Number.isInteger(v)

function registroCopiable(r) {
  return (
    esTexto(r.path) &&
    esTexto(r.uid) &&
    esTexto(r.collection) &&
    esTextoONulo(r.id ?? null) &&
    r.id !== undefined &&
    esTextoOAusente(r.updatedAt) &&
    r.data !== undefined &&
    esJSONPuro(r.data)
  )
}

function entradaCopiable(e) {
  return (
    esEntero(e.seq) &&
    esTexto(e.path) &&
    esTexto(e.uid) &&
    esTexto(e.op) &&
    esEntero(e.attempts) &&
    (e.rev === undefined || esEntero(e.rev)) &&
    esTextoOAusente(e.enqueuedAt) &&
    e.data !== undefined &&
    esJSONPuro(e.data)
  )
}

// ─── Leer IndexedDB sin tocarlo ───────────────────────────────────────────────

/**
 * Lee la base `strivo` de IndexedDB **sin crearla ni escribir nada**.
 *
 * Si el navegador sabe listar las bases y `strivo` no está, ni se abre. Si no
 * sabe listarlas, se abre sin versión: no crea almacenes, pero sí una base vacía
 * si no existía, y eso queda anotado como lo único que esta lectura puede
 * llegar a crear. WebKit las lista desde iOS 14.
 *
 * @returns {Promise<{existe: boolean, registros: object[], cola: object[]}>}
 */
export async function leerIndexedDB({ idb = globalThis.indexedDB } = {}) {
  if (!idb) return { existe: false, registros: [], cola: [] }
  if (typeof idb.databases === 'function') {
    const bases = await idb.databases()
    if (!bases.some((b) => b.name === BASE)) return { existe: false, registros: [], cola: [] }
  }

  const db = await openDB(BASE)
  try {
    const nombres = [...db.objectStoreNames]
    const registros = nombres.includes('records') ? await db.getAll('records') : []
    const cola = nombres.includes('syncQueue') ? await db.getAll('syncQueue') : []
    return { existe: true, registros, cola: cola.sort((a, b) => a.seq - b.seq) }
  } finally {
    db.close()
  }
}

// ─── La marca ─────────────────────────────────────────────────────────────────

/**
 * La marca de migración, si la hay: `{ migradoEn, origen, registros, cola }`,
 * con `origen` `indexeddb` si se copió algo o `vacio` si no había nada.
 */
export async function leerMarca(c) {
  const filas = await c.consultar(
    `SELECT clave, valor FROM meta WHERE clave IN ('migradoEn', 'origen', 'registros', 'cola')`,
  )
  const meta = Object.fromEntries(filas.map((f) => [f.clave, f.valor]))
  if (!meta.migradoEn) return null
  return {
    migradoEn: meta.migradoEn,
    origen: meta.origen ?? 'indexeddb',
    registros: Number(meta.registros ?? 0),
    cola: Number(meta.cola ?? 0),
  }
}

const VACIAR = Object.freeze([
  { sql: 'DELETE FROM registros', valores: [] },
  { sql: 'DELETE FROM cola', valores: [] },
  { sql: `DELETE FROM sqlite_sequence WHERE name = 'cola'`, valores: [] },
])

async function vaciar(c) {
  try {
    await c.ejecutar([...VACIAR])
  } catch {
    // Si ni siquiera se puede vaciar, no hay marca: el siguiente arranque
    // empieza vaciando otra vez.
  }
}

function sentenciasDeCopia(registros, cola) {
  return [
    ...VACIAR,
    ...registros.map((r) => ({
      sql: `INSERT INTO registros (path, uid, collection, id, data, updatedAt, fecha)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      valores: [
        r.path,
        r.uid,
        r.collection,
        r.id,
        JSON.stringify(r.data),
        r.updatedAt ?? null,
        typeof r.data?.date === 'string' ? r.data.date : null,
      ],
    })),
    ...cola.map((e) => ({
      sql: `INSERT INTO cola (seq, uid, path, op, data, attempts, rev, enqueuedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      valores: [
        e.seq,
        e.uid,
        e.path,
        e.op,
        e.data === null ? null : JSON.stringify(e.data),
        e.attempts,
        e.rev ?? null,
        e.enqueuedAt ?? null,
      ],
    })),
  ]
}

/** El registro tal como se compara: lo que IndexedDB guarda y SQLite devuelve. */
function huellaDeRegistro(r) {
  return canonico([r.path, r.uid, r.collection, r.id, r.updatedAt ?? null, r.data])
}

function huellaDeEntrada(e) {
  return canonico([
    e.seq,
    e.path,
    e.uid,
    e.op,
    e.attempts,
    e.rev ?? null,
    e.enqueuedAt ?? null,
    e.data,
  ])
}

async function coincide(c, registros, cola) {
  const enSqlite = await c.consultar('SELECT * FROM registros ORDER BY path')
  const colaEnSqlite = await c.consultar('SELECT * FROM cola ORDER BY seq')
  if (enSqlite.length !== registros.length || colaEnSqlite.length !== cola.length) return false

  const esperados = new Map(registros.map((r) => [r.path, huellaDeRegistro(r)]))
  for (const f of enSqlite) {
    const fila = {
      path: f.path,
      uid: f.uid,
      collection: f.collection,
      id: f.id,
      updatedAt: f.updatedAt,
      data: JSON.parse(f.data),
    }
    if (esperados.get(f.path) !== huellaDeRegistro(fila)) return false
  }

  const ordenados = [...cola].sort((a, b) => a.seq - b.seq)
  return colaEnSqlite.every((f, i) => {
    const entrada = {
      seq: Number(f.seq),
      path: f.path,
      uid: f.uid,
      op: f.op,
      attempts: Number(f.attempts),
      rev: f.rev === null ? null : Number(f.rev),
      enqueuedAt: f.enqueuedAt,
      data: f.data === null ? null : JSON.parse(f.data),
    }
    return huellaDeEntrada(entrada) === huellaDeEntrada(ordenados[i])
  })
}

// ─── La migración ─────────────────────────────────────────────────────────────

/**
 * @param {object} c - la conexión cruda (dentro de `enExclusiva`): `ejecutar` y `consultar`.
 * @param {object} [opciones]
 * @param {() => Promise<object>} [opciones.leer] - lee IndexedDB; ver `leerIndexedDB`.
 * @param {() => boolean} [opciones.abandonada] - `true` si quien llama ya no espera.
 * @param {() => void} [opciones.alMarcar] - avisa justo antes de escribir la marca.
 * @param {() => Date} [opciones.ahora]
 * @returns {Promise<{ok: true, marca: object} | {ok: false, motivo: string}>}
 */
export async function migrar(
  c,
  {
    leer = leerIndexedDB,
    abandonada = () => false,
    alMarcar = () => {},
    ahora = () => new Date(),
  } = {},
) {
  if (abandonada()) return { ok: false, motivo: MOTIVOS.techo }

  let origen
  try {
    origen = await leer()
  } catch {
    return { ok: false, motivo: MOTIVOS.copia }
  }
  const { registros, cola } = origen

  if (!registros.every(registroCopiable) || !cola.every(entradaCopiable)) {
    return { ok: false, motivo: MOTIVOS.noJson }
  }

  try {
    await c.ejecutar(sentenciasDeCopia(registros, cola))
  } catch {
    await vaciar(c)
    return { ok: false, motivo: MOTIVOS.copia }
  }

  let iguales
  try {
    iguales = await coincide(c, registros, cola)
  } catch {
    iguales = false
  }
  if (!iguales) {
    await vaciar(c)
    return { ok: false, motivo: MOTIVOS.noCoincide }
  }

  if (abandonada()) {
    await vaciar(c)
    return { ok: false, motivo: MOTIVOS.techo }
  }

  const marca = {
    migradoEn: ahora().toISOString(),
    origen: registros.length + cola.length > 0 ? 'indexeddb' : 'vacio',
    registros: registros.length,
    cola: cola.length,
  }
  alMarcar()
  try {
    await c.ejecutar(
      Object.entries(marca).map(([clave, valor]) => ({
        sql: 'INSERT OR REPLACE INTO meta (clave, valor) VALUES (?, ?)',
        valores: [clave, String(valor)],
      })),
    )
  } catch {
    // El error pudo llegar después de que la marca entrara (el puente, no la
    // base). Se mira antes de vaciar: vaciar una base ya marcada dejaría la
    // marca diciendo que todo está aquí sin nada detrás.
    const escrita = await leerMarca(c).catch(() => null)
    if (escrita?.migradoEn === marca.migradoEn) return { ok: true, marca }
    await vaciar(c)
    return { ok: false, motivo: MOTIVOS.copia }
  }
  return { ok: true, marca }
}
