// src/lib/db/local.js
// Almacén local de Strivo sobre IndexedDB. Es la fuente inmediata de verdad.
//
// RN-02 / RN-DB4-04 — Local-first sin excepciones: toda escritura se confirma
// aquí antes de cualquier intento de red. Firestore recibe después, desde la
// cola de `sync.js`.
//
// Un solo almacén direccionado por ruta (`users/{uid}/lumia/journal/items/{id}`)
// en vez de un almacén por entidad: la forma local es idéntica a la de
// Firestore, así que la sincronización no traduce nada y no puede desalinearse.

import { openDB } from 'idb'
import { assertUid, StrivoDataError, ERROR_CODES } from './schema.js'

const DB_NAME = 'strivo'
const DB_VERSION = 1

export const STORE_RECORDS = 'records'
export const STORE_SYNC_QUEUE = 'syncQueue'

let dbPromise = null

/** Abre (o crea) la base local. Idempotente. */
export function getLocalDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_RECORDS)) {
          const records = db.createObjectStore(STORE_RECORDS, { keyPath: 'path' })
          records.createIndex('byUser', 'uid')
          records.createIndex('byCollection', ['uid', 'collection'])
          records.createIndex('byCollectionDate', ['uid', 'collection', 'data.date'])
          records.createIndex('byCollectionHabit', ['uid', 'collection', 'data.habitId'])
          records.createIndex('byCollectionIdentity', ['uid', 'collection', 'data.identityRef'])
        }

        if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
          const queue = db.createObjectStore(STORE_SYNC_QUEUE, {
            keyPath: 'seq',
            autoIncrement: true,
          })
          queue.createIndex('byPath', 'path', { unique: true })
          queue.createIndex('byUser', 'uid')
        }
      },
    })
  }
  return dbPromise
}

/** Cierra la base y olvida la conexión. Solo para pruebas y cierre de sesión. */
export async function closeLocalDB() {
  if (!dbPromise) return
  const db = await dbPromise
  db.close()
  dbPromise = null
}

// ─── Identificadores ──────────────────────────────────────────────────────────

/** Id estable para un registro nuevo. RN-DB-02: nunca se persiste una etiqueta. */
export function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// ─── Lectura ──────────────────────────────────────────────────────────────────

/**
 * Devuelve el contenido de una ruta, o `null` si no existe.
 * Devuelve el registro **tal cual está guardado**: no completa campos que
 * falten ni corrige valores inválidos (RN-DB4-08).
 */
export async function readPath(path) {
  const db = await getLocalDB()
  const row = await db.get(STORE_RECORDS, path)
  return row ? row.data : null
}

/** Devuelve `{ id, ...data }` de todos los registros de una colección. */
export async function readCollection(uid, collection) {
  assertUid(uid)
  const db = await getLocalDB()
  const rows = await db.getAllFromIndex(STORE_RECORDS, 'byCollection', [uid, collection])
  return rows.map(toItem)
}

/** Igual que `readCollection`, filtrando por el campo `date` del registro. */
export async function readCollectionByDate(uid, collection, date) {
  assertUid(uid)
  const db = await getLocalDB()
  const rows = await db.getAllFromIndex(STORE_RECORDS, 'byCollectionDate', [
    uid,
    collection,
    date,
  ])
  return rows.map(toItem)
}

/** Igual que `readCollection`, filtrando por un campo indexado del registro. */
export async function readCollectionBy(uid, collection, field, value) {
  assertUid(uid)
  const index = INDEX_BY_FIELD[field]
  if (!index) {
    throw new StrivoDataError(
      ERROR_CODES.FIELD_TYPE,
      `readCollectionBy: no hay índice local para "${field}".`,
      { field },
    )
  }
  const db = await getLocalDB()
  const rows = await db.getAllFromIndex(STORE_RECORDS, index, [uid, collection, value])
  return rows.map(toItem)
}

const INDEX_BY_FIELD = Object.freeze({
  date: 'byCollectionDate',
  habitId: 'byCollectionHabit',
  identityRef: 'byCollectionIdentity',
})

function toItem(row) {
  return row.id === null ? { ...row.data } : { id: row.id, ...row.data }
}

// ─── Escritura ────────────────────────────────────────────────────────────────

/**
 * Escribe una ruta en local y, si procede, la encola para Firestore.
 *
 * La confirmación local ocurre antes de tocar la cola: si el encolado falla,
 * lo escrito ya está a salvo (RN-02).
 *
 * @param {object}  spec
 * @param {string}  spec.uid
 * @param {string}  spec.path        - Ruta canónica completa.
 * @param {string}  spec.collection  - Etiqueta de agrupación local.
 * @param {?string} spec.id          - Id del elemento, o null si es documento único.
 * @param {object}  spec.data
 * @param {boolean} [spec.sync=true] - `false` para lo que nunca sale del
 *                                     dispositivo (RN-DB-04: el PIN).
 * @returns {Promise<object>} el `data` escrito.
 */
export async function writePath({ uid, path, collection, id = null, data, sync = true }) {
  assertUid(uid)
  const db = await getLocalDB()
  const row = {
    path,
    uid,
    collection,
    id,
    data,
    updatedAt: new Date().toISOString(),
  }

  await db.put(STORE_RECORDS, row)
  if (sync) await enqueue({ uid, path, op: 'put', data })
  return data
}

/**
 * Aplica cambios sobre lo que ya hay en una ruta y lo guarda.
 * `merge` es superficial y solo escribe las claves recibidas: no reconstruye
 * el registro ni inventa las que falten.
 */
export async function mergePath({ uid, path, collection, id = null, patch, sync = true }) {
  const current = (await readPath(path)) ?? {}
  return writePath({ uid, path, collection, id, data: { ...current, ...patch }, sync })
}

/** Borra una ruta en local y encola el borrado. */
export async function deletePath({ uid, path, sync = true }) {
  assertUid(uid)
  const db = await getLocalDB()
  await db.delete(STORE_RECORDS, path)
  if (sync) await enqueue({ uid, path, op: 'delete', data: null })
}

// ─── Cola de sincronización ───────────────────────────────────────────────────
// Una entrada por ruta: si la misma ruta se escribe cinco veces sin red, la
// cola guarda el último estado, no cinco copias. Al volver la red se envía una
// vez y el resultado es el mismo que si nunca se hubiera caído.

export async function enqueue({ uid, path, op, data }) {
  const db = await getLocalDB()
  const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite')
  const store = tx.objectStore(STORE_SYNC_QUEUE)
  const existing = await store.index('byPath').get(path)

  const entry = {
    uid,
    path,
    op,
    data,
    attempts: existing ? existing.attempts : 0,
    enqueuedAt: new Date().toISOString(),
  }
  if (existing) entry.seq = existing.seq

  await store.put(entry)
  await tx.done
}

export async function listQueue(uid = null) {
  const db = await getLocalDB()
  const all = uid
    ? await db.getAllFromIndex(STORE_SYNC_QUEUE, 'byUser', uid)
    : await db.getAll(STORE_SYNC_QUEUE)
  return all.sort((a, b) => a.seq - b.seq)
}

export async function dequeue(seq) {
  const db = await getLocalDB()
  await db.delete(STORE_SYNC_QUEUE, seq)
}

/** Marca un intento fallido sin perder la entrada: se reintenta más tarde. */
export async function markQueueAttempt(seq) {
  const db = await getLocalDB()
  const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite')
  const store = tx.objectStore(STORE_SYNC_QUEUE)
  const entry = await store.get(seq)
  if (entry) {
    entry.attempts += 1
    await store.put(entry)
  }
  await tx.done
}

export async function pendingCount(uid = null) {
  const queue = await listQueue(uid)
  return queue.length
}
