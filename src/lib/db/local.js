// src/lib/db/local.js
// Almacén local de Strivo sobre IndexedDB. Es la fuente inmediata de verdad.
//
// RN-02 / RN-DB4-04 — Local-first sin excepciones: toda escritura se confirma
// aquí antes de cualquier intento de red. Firestore recibe después, desde la
// cola de `sync.js`.
//
// Un solo almacén direccionado por ruta (`users/{uid}/diario/journal/items/{id}`)
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
  const rows = await db.getAllFromIndex(STORE_RECORDS, 'byCollectionDate', [uid, collection, date])
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
 *
 * **Leer y escribir ocurren dentro de la misma transacción**, y no es un
 * detalle de eficiencia. Una pantalla escribe varios campos del mismo día a la
 * vez —marcar una emoción mientras el autoguardado de un texto va en camino— y
 * con dos transacciones separadas la segunda parte de una copia vieja y borra
 * lo que acababa de guardar la primera. IndexedDB serializa las transacciones
 * de escritura sobre el mismo almacén, así que dentro de una sola nunca se
 * pierde una actualización.
 */
export async function mergePath({ uid, path, collection, id = null, patch, sync = true }) {
  assertUid(uid)
  const db = await getLocalDB()
  const tx = db.transaction(STORE_RECORDS, 'readwrite')
  const store = tx.objectStore(STORE_RECORDS)

  const row = await store.get(path)
  const data = { ...(row?.data ?? {}), ...patch }
  await store.put({
    path,
    uid,
    collection,
    id,
    data,
    updatedAt: new Date().toISOString(),
  })
  await tx.done

  if (sync) await enqueue({ uid, path, op: 'put', data })
  return data
}

/**
 * Escribe una ruta **solo si no existe**, y nunca la encola.
 *
 * Es la escritura de la siembra (SPEC_17A, D16). Existe porque la siembra
 * puede correr con una restauración todavía en marcha por detrás —el velo
 * tiene techo y la bajada no se cancela—, y un `put` a secas podría pisar el
 * perfil real que acaba de bajar un instante antes. Leer y escribir van en
 * la misma transacción por lo mismo que en `mergePath`: dos transacciones
 * separadas dejan un hueco entre la lectura y la escritura, y ese hueco es
 * exactamente donde cabría la bajada.
 *
 * @returns {Promise<boolean>} `true` si escribió; `false` si ya había algo.
 */
export async function writePathIfAbsent({ uid, path, collection, id = null, data }) {
  assertUid(uid)
  const db = await getLocalDB()
  const tx = db.transaction(STORE_RECORDS, 'readwrite')
  const store = tx.objectStore(STORE_RECORDS)

  const existente = await store.get(path)
  if (!existente) {
    await store.put({ path, uid, collection, id, data, updatedAt: new Date().toISOString() })
  }
  await tx.done
  return !existente
}

/** Borra una ruta en local y encola el borrado. */
export async function deletePath({ uid, path, sync = true }) {
  assertUid(uid)
  const db = await getLocalDB()
  await db.delete(STORE_RECORDS, path)
  if (sync) await enqueue({ uid, path, op: 'delete', data: null })
}

// ─── Mudanza de un árbol entero ───────────────────────────────────────────────

/**
 * Rutas que nunca salen del dispositivo (RN-DB-04). Al mudar el árbol no se
 * reencolan: el PIN no se sincroniza antes de la mudanza y tampoco después.
 * Se reconoce por la ruta y no importando `diario.js`, que este módulo no
 * conoce y no debe conocer.
 */
const SIN_SINCRONIZAR = /\/diario\/pinConfig$/

/**
 * Mueve todo lo guardado de un uid a otro.
 *
 * Existe por el onboarding: hasta P7 se escribe bajo un uid local, y al crear
 * la cuenta el árbol tiene que pasar a llamarse como el uid de Firebase. Sin
 * esto, el nombre, el género y los horarios que alguien acaba de escribir se
 * quedarían en un árbol que ya nadie lee, y las reglas de Firestore —que
 * exigen que el segmento de la ruta sea el uid autenticado— no dejarían subir
 * ni uno de los dos.
 *
 * **No sobrescribe nada** (RN-DB-04). Si la ruta de destino ya existe, gana lo
 * que ya estaba allí y el registro de origen se queda donde está: un árbol con
 * datos previos es alguien que ya usó esta cuenta, y lo suyo no lo pisa una
 * sesión anónima. Lo que no se pudo mudar se cuenta y se devuelve, no se
 * descarta en silencio.
 *
 * Lo mudado se **reencola entero**: son rutas que Firestore no ha visto nunca.
 * Las entradas de la cola del uid viejo se retiran, porque apuntan a rutas que
 * ninguna sesión autenticada podrá escribir.
 *
 * @param {string} desde
 * @param {string} hacia
 * @returns {Promise<{mudados: number, conservados: number}>}
 */
export async function mudarUid(desde, hacia) {
  assertUid(desde)
  assertUid(hacia)
  if (desde === hacia) return { mudados: 0, conservados: 0 }

  const db = await getLocalDB()
  const origen = await db.getAllFromIndex(STORE_RECORDS, 'byUser', desde)
  const prefijo = `users/${desde}/`

  const tx = db.transaction(STORE_RECORDS, 'readwrite')
  const store = tx.objectStore(STORE_RECORDS)
  const mudadas = []
  let conservados = 0

  for (const fila of origen) {
    if (!fila.path.startsWith(prefijo)) continue
    const destino = `users/${hacia}/${fila.path.slice(prefijo.length)}`
    if (await store.get(destino)) {
      conservados += 1
      continue
    }
    await store.put({ ...fila, path: destino, uid: hacia })
    await store.delete(fila.path)
    mudadas.push({ path: destino, data: fila.data })
  }
  await tx.done

  for (const entrada of await listQueue(desde)) await dequeue(entrada.seq)
  for (const fila of mudadas) {
    if (SIN_SINCRONIZAR.test(fila.path)) continue
    await enqueue({ uid: hacia, path: fila.path, op: 'put', data: fila.data })
  }

  return { mudados: mudadas.length, conservados }
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
