// src/lib/db/adaptadorIndexedDB.js
// El almacén de la web —y de la app nativa antes de migrar— sobre IndexedDB.
//
// **Es el código de `local.js` de antes de SPEC_17B, movido sin cambiar su
// comportamiento.** Lo que cambió es la forma: aquí quedan solo las operaciones
// sobre el almacén —leer, poner, fusionar, la cola…—, y las reglas que no son de
// ningún almacén en particular —qué se encola, qué decide una mudanza— siguen en
// `local.js`, que las aplica igual sobre IndexedDB que sobre SQLite.
//
// El otro adaptador es `adaptadorSQLite.js`; los dos cumplen el mismo contrato,
// y qué adaptador se usa lo decide `almacen.js` y nadie más.
//
// Un solo almacén direccionado por ruta (`users/{uid}/diario/journal/items/{id}`)
// en vez de un almacén por entidad: la forma local es idéntica a la de
// Firestore, así que la sincronización no traduce nada y no puede desalinearse.

import { openDB } from 'idb'

const DB_NAME = 'strivo'
const DB_VERSION = 1

export const STORE_RECORDS = 'records'
export const STORE_SYNC_QUEUE = 'syncQueue'

let dbPromise = null

/**
 * Abre (o crea) la base local. Idempotente.
 *
 * **La conexión se suelta sola cuando alguien pide borrar o migrar la base**
 * (DP-17.12). Sin `blocking`, la conexión nunca se enteraba de que otra
 * petición quería borrar la base: `deleteDatabase('strivo')` se quedaba en
 * `blocked` indefinidamente y sin lanzar error, y las peticiones que quedaban
 * colgadas detrás congelaban después cualquier transacción de esa página. Se
 * vio en la validación manual de SPEC_17A: «borrar solo la base `strivo`» era
 * una operación que a veces no ocurría y no avisaba, y solo funcionaba si
 * nada había reabierto la conexión, que es una condición que nadie puede
 * comprobar a ojo.
 *
 * `close()` no corta nada a medias: IndexedDB espera a que terminen las
 * transacciones en curso antes de cerrar de verdad, así que esto no roza
 * «nada se pierde». Lo que sí hace es dejar `dbPromise` en blanco para que la
 * siguiente lectura reabra —tras el borrado, una base vacía— en vez de usar
 * una conexión cerrada. `terminated` es la otra mitad de lo mismo: una
 * conexión que el navegador cerró por su cuenta no deja `dbPromise` apuntando
 * a algo muerto.
 *
 * Los dos anulan `dbPromise` solo si sigue siendo la promesa de **esta**
 * conexión: si entre medias alguien la cerró y reabrió, el callback de la
 * vieja no tira la nueva.
 *
 * `blocking` dispara también cuando otra pestaña abre una versión **mayor**.
 * Hoy `DB_VERSION` es 1 y no hay migraciones; el día que haya una, la pestaña
 * vieja se cerrará y su siguiente `getLocalDB()` fallará con `VersionError`
 * por abrir con la versión antigua. Es un problema de ese día, no de este.
 */
export function getLocalDB() {
  if (!dbPromise) {
    const promesa = openDB(DB_NAME, DB_VERSION, {
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
      blocking(_actual, _pedida, event) {
        event.target.close()
        if (dbPromise === promesa) dbPromise = null
      },
      terminated() {
        if (dbPromise === promesa) dbPromise = null
      },
    })
    dbPromise = promesa
  }
  return dbPromise
}

/** Cierra la base y olvida la conexión. Solo para pruebas, el diagnóstico y el cierre de sesión. */
async function cerrar() {
  if (!dbPromise) return
  const db = await dbPromise
  db.close()
  dbPromise = null
}

// ─── Registros ────────────────────────────────────────────────────────────────

async function leer(path) {
  const db = await getLocalDB()
  return (await db.get(STORE_RECORDS, path)) ?? null
}

/** Las filas de un índice, en el orden del índice y después por `path`. */
async function leerIndice(indice, clave) {
  const db = await getLocalDB()
  return db.getAllFromIndex(STORE_RECORDS, indice, clave)
}

async function poner(fila) {
  const db = await getLocalDB()
  await db.put(STORE_RECORDS, fila)
}

/**
 * Aplica cambios sobre lo que ya hay en una ruta y lo guarda.
 *
 * **Leer y escribir ocurren dentro de la misma transacción**, y no es un
 * detalle de eficiencia. Una pantalla escribe varios campos del mismo día a la
 * vez —marcar una emoción mientras el autoguardado de un texto va en camino— y
 * con dos transacciones separadas la segunda parte de una copia vieja y borra
 * lo que acababa de guardar la primera. IndexedDB serializa las transacciones
 * de escritura sobre el mismo almacén, así que dentro de una sola nunca se
 * pierde una actualización.
 */
async function fusionar({ path, uid, collection, id, updatedAt }, patch) {
  const db = await getLocalDB()
  const tx = db.transaction(STORE_RECORDS, 'readwrite')
  const store = tx.objectStore(STORE_RECORDS)

  const row = await store.get(path)
  const data = { ...(row?.data ?? {}), ...patch }
  await store.put({ path, uid, collection, id, data, updatedAt })
  await tx.done
  return data
}

/**
 * Escribe una ruta **solo si no existe**. Leer y escribir van en la misma
 * transacción por lo mismo que en `fusionar`: dos transacciones separadas
 * dejan un hueco entre la lectura y la escritura, y ese hueco es exactamente
 * donde cabría la bajada.
 */
async function ponerSiAusente(fila) {
  const db = await getLocalDB()
  const tx = db.transaction(STORE_RECORDS, 'readwrite')
  const store = tx.objectStore(STORE_RECORDS)

  const existente = await store.get(fila.path)
  if (!existente) await store.put(fila)
  await tx.done
  return !existente
}

async function quitar(path) {
  const db = await getLocalDB()
  await db.delete(STORE_RECORDS, path)
}

/**
 * La mitad de almacén de `mudarUid` (`local.js`): las filas de `desde` se
 * recorren dentro de una transacción y `decidir(fila, existente)` dice qué
 * hacer con cada una. Las reglas —la política, los hechos del expediente— son
 * de `local.js`; aquí solo se aplican.
 *
 * `decidir` devuelve `{ muda: true, data }` para mudar la fila con ese
 * contenido, o `{ muda: false, completar }`, donde `completar` es el contenido
 * con que se reescribe el destino (o `null` para no tocarlo).
 */
async function mudarFilas(desde, hacia, decidir) {
  const db = await getLocalDB()
  const origen = await db.getAllFromIndex(STORE_RECORDS, 'byUser', desde)
  const prefijo = `users/${desde}/`

  const tx = db.transaction(STORE_RECORDS, 'readwrite')
  const store = tx.objectStore(STORE_RECORDS)
  const mudadas = []
  const completadas = []
  let conservados = 0

  for (const fila of origen) {
    if (!fila.path.startsWith(prefijo)) continue
    const destino = `users/${hacia}/${fila.path.slice(prefijo.length)}`
    const existente = (await store.get(destino)) ?? null
    const decision = decidir(fila, existente)
    if (!decision.muda) {
      conservados += 1
      if (decision.completar) {
        await store.put({ ...existente, data: decision.completar })
        completadas.push({
          path: destino,
          collection: existente.collection,
          data: decision.completar,
        })
      }
      continue
    }
    await store.put({ ...fila, path: destino, uid: hacia, data: decision.data })
    await store.delete(fila.path)
    mudadas.push({
      desde: fila.path,
      path: destino,
      collection: fila.collection,
      data: decision.data,
    })
  }
  await tx.done
  return { mudadas, completadas, conservados }
}

/**
 * Borra del dispositivo todo lo de un uid: sus registros y su cola, en una
 * sola transacción. **Nunca toca otro uid**: recorre el índice `byUser` de los
 * dos almacenes con ese uid y nada más.
 */
async function borrarUid(uid) {
  const db = await getLocalDB()
  const tx = db.transaction([STORE_RECORDS, STORE_SYNC_QUEUE], 'readwrite')
  const registros = tx.objectStore(STORE_RECORDS)
  const cola = tx.objectStore(STORE_SYNC_QUEUE)

  const rutas = await registros.index('byUser').getAllKeys(uid)
  const entradas = await cola.index('byUser').getAllKeys(uid)
  for (const ruta of rutas) await registros.delete(ruta)
  for (const seq of entradas) await cola.delete(seq)
  await tx.done

  return { registros: rutas.length, cola: entradas.length }
}

// ─── Cola de sincronización ───────────────────────────────────────────────────

/** Una entrada por ruta, con su revisión (`rev`) subiendo en cada reescritura (H-1). */
async function encolar({ uid, path, op, data, enqueuedAt }) {
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
    rev: (existing?.rev ?? 0) + 1,
    enqueuedAt,
  }
  if (existing) entry.seq = existing.seq

  await store.put(entry)
  await tx.done
}

async function listarCola(uid = null) {
  const db = await getLocalDB()
  const all = uid
    ? await db.getAllFromIndex(STORE_SYNC_QUEUE, 'byUser', uid)
    : await db.getAll(STORE_SYNC_QUEUE)
  return all.sort((a, b) => a.seq - b.seq)
}

async function sacar(seq) {
  const db = await getLocalDB()
  await db.delete(STORE_SYNC_QUEUE, seq)
}

/** Saca la entrada solo si su revisión no cambió mientras viajaba (H-1). */
async function sacarSiIgual(enviada) {
  const db = await getLocalDB()
  const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite')
  const store = tx.objectStore(STORE_SYNC_QUEUE)
  const actual = await store.get(enviada.seq)
  const igual = actual !== undefined && actual.rev === enviada.rev
  if (igual) await store.delete(enviada.seq)
  await tx.done
  return igual
}

async function marcarIntento(seq) {
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

/** Cuántos registros y entradas hay, de todos los uids. Para el diagnóstico. */
async function contar() {
  const db = await getLocalDB()
  return {
    registros: await db.count(STORE_RECORDS),
    porSubir: await db.count(STORE_SYNC_QUEUE),
  }
}

export const adaptadorIndexedDB = Object.freeze({
  nombre: 'indexeddb',
  leer,
  leerIndice,
  poner,
  fusionar,
  ponerSiAusente,
  quitar,
  mudarFilas,
  borrarUid,
  encolar,
  listarCola,
  sacar,
  sacarSiIgual,
  marcarIntento,
  contar,
  cerrar,
})
