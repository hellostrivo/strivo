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
import { esExpediente, esSemilla, hechosQueFaltan } from './conflictos.js'

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
 * **Y esa garantía vale también para la nube** (DP-17.10). La intención de
 * arriba siempre fue la correcta, pero hasta el 18 de septiembre de 2026 solo
 * se aplicaba en local: la comprobación es el `store.get(destino)` del bucle,
 * y en un dispositivo que nunca vio esa cuenta no hay nada bajo su uid, así
 * que todo se mudaba y todo se encolaba —la semilla de `initShared` incluida—.
 * `sync.js` sube con `setDoc` sin `merge`, de modo que un `shared/profile`
 * con `name: null` reemplazaba en Firestore el perfil real de esa cuenta, y
 * la restauración bajaba después, fielmente, lo que la subida acababa de
 * borrar. Se midió en la validación manual de SPEC_17A.
 *
 * Por eso lo mudado **se reencola salvo lo que sigue siendo semilla**. Es D14
 * extendido a la mudanza: una siembra ni sella, ni sube, ni pisa, y mudarse de
 * uid no la convierte en otra cosa. La pregunta la contesta `esSemilla`
 * (`conflictos.js`), que es la misma que hace la fusión para dejar que lo
 * remoto pise una siembra y solo una siembra: una regla, un sitio. Lo que
 * alguien escribió —una mañana, un journal, un perfil con nombre, incluso un
 * registro cuya marca no se puede leer— sube igual que antes, porque ausente e
 * ilegible no son lo mismo. Las filas semilla se mudan igual que las demás:
 * siguen siendo suyas y siguen en local; solo no tienen nada que contarle a
 * la nube.
 *
 * Las entradas de la cola del uid viejo se retiran, porque apuntan a rutas que
 * ninguna sesión autenticada podrá escribir.
 *
 * ─── Con política (SPEC_19 §3.4) ─────────────────────────────────────────────
 *
 * Entrar a una cuenta que ya tiene datos no puede quedarse con "gana el
 * destino" a secas: una mañana escrita en la sesión anónima más nueva que la
 * que bajó de la nube tiene que poder ganar. Para eso existe `politica`, una
 * función `(coleccion, origen, destino|null) => boolean` que decide fila a
 * fila si el origen se muda —encima del destino, si lo hay— o se conserva
 * bajo su uid. La de entrar a una cuenta es `ganaOrigenAlMudar`
 * (`conflictos.js`); esta función no sabe qué reglas son, solo las aplica.
 *
 * Con política cambian dos cosas y ninguna más:
 *
 *   - la política también decide cuando el destino está vacío (es lo que
 *     permite no mudar `shared/*` si la restauración no terminó);
 *   - de la cola del origen se retiran **solo las entradas de lo que se
 *     mudó**. Si el origen es una cuenta vencida, lo conservado sigue siendo
 *     suyo y su subida pendiente también: retirarla sería perder lo que esa
 *     cuenta todavía no recibió.
 *
 * **Sin política, el comportamiento es exactamente el de antes** —gana el
 * destino, se conserva el origen, se vacía su cola— y la semilla no sube en
 * ninguno de los dos casos (DP-17.10).
 *
 * ─── Los hechos del expediente, también al mudar (SPEC_19.2 §4.3) ───────────
 *
 * Con política, `shared/onboarding` no se decide solo por la fila entera: si
 * el que pierde trae `completedAt` o `tourCompletedAt` y el que gana no, el
 * resultado se los lleva (`hechosQueFaltan`, la misma regla que aplica la
 * bajada). El caso que lo pide es el de una cuenta que empezó el onboarding en
 * otro teléfono y lo terminó en una sesión anónima de este: gana el expediente
 * de la cuenta, y sin esto el hecho se perdería y la puerta volvería a abrir.
 *
 * La política sigue siendo booleana —decide **qué fila** queda— y esto es lo
 * que se hace después con la que queda, dentro de la misma transacción:
 *
 *   - si se queda el destino y le faltan hechos, se completa y **se encola**:
 *     ya no es lo que había en la nube, y sin subirlo la nube seguiría diciendo
 *     que el onboarding no se terminó. La fila del origen sigue bajo su uid;
 *   - si se muda el origen encima de un destino que traía un hecho —un
 *     expediente sin marca, que cuenta como semilla—, la fila mudada se lo
 *     lleva.
 *
 * Sin política no se aplica: ahí el destino no existe (una cuenta recién
 * creada) o gana siempre, y su comportamiento no cambia.
 *
 * @param {string} desde
 * @param {string} hacia
 * @param {object} [opciones]
 * @param {(coleccion: string, origen: object, destino: ?object) => boolean} [opciones.politica]
 * @returns {Promise<{mudados: number, conservados: number}>}
 */
export async function mudarUid(desde, hacia, { politica = null } = {}) {
  assertUid(desde)
  assertUid(hacia)
  if (desde === hacia) return { mudados: 0, conservados: 0 }

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
    const existente = await store.get(destino)
    const muda = politica
      ? politica(fila.collection, fila.data, existente ? existente.data : null)
      : !existente
    const conHechos = Boolean(politica && existente && esExpediente(fila.collection, fila.id))
    if (!muda) {
      conservados += 1
      const faltan = conHechos ? hechosQueFaltan(existente.data, fila.data) : {}
      if (Object.keys(faltan).length > 0) {
        const data = { ...existente.data, ...faltan }
        await store.put({ ...existente, data })
        completadas.push({ path: destino, collection: existente.collection, data })
      }
      continue
    }
    const data = conHechos
      ? { ...fila.data, ...hechosQueFaltan(fila.data, existente.data) }
      : fila.data
    await store.put({ ...fila, path: destino, uid: hacia, data })
    await store.delete(fila.path)
    mudadas.push({ desde: fila.path, path: destino, collection: fila.collection, data })
  }
  await tx.done

  const rutasMudadas = new Set(mudadas.map((fila) => fila.desde))
  for (const entrada of await listQueue(desde)) {
    if (politica && !rutasMudadas.has(entrada.path)) continue
    await dequeue(entrada.seq)
  }
  for (const fila of [...mudadas, ...completadas]) {
    if (SIN_SINCRONIZAR.test(fila.path)) continue
    // Una semilla no sube tampoco después de mudarse (DP-17.10, ver arriba).
    if (esSemilla(fila.collection, fila.data)) continue
    await enqueue({ uid: hacia, path: fila.path, op: 'put', data: fila.data })
  }

  return { mudados: mudadas.length, conservados }
}

// ─── La mudanza pendiente (SPEC_19.1, F1) ─────────────────────────────────────
//
// Cuando se entra a una cuenta y la restauración no termina bien, la mudanza
// del árbol anónimo se aplaza hasta que una restauración termine: mudar contra
// un destino que todavía no bajó dejaría ganar sin rival a las filas con fecha
// y la cola las subiría encima de las de la cuenta. Mientras tanto, de qué uid
// hay que mudar se apunta en `localStorage`, por cuenta. Es un hecho de este
// teléfono —como la marca de restauración— y no viaja.
//
// El nombre de la clave vive aquí porque la escriben dos sitios: la entrada a
// cuenta (`lib/entradaCuenta.js`) y `borrarUid`, que al salir la retira.

/** La clave de `localStorage` que guarda el uid de origen de una mudanza pendiente. */
export function claveDeMudanzaPendiente(uidCuenta) {
  return `strivo.mudanzaPendiente.${uidCuenta}`
}

/** `localStorage`, o `null` donde no lo hay (pruebas, servidor, almacenamiento bloqueado). */
export function almacenLocal() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

/**
 * Borra del dispositivo todo lo de un uid: sus registros y su cola, en una
 * sola transacción (SPEC_19 §3.5, DP-19.1).
 *
 * Es lo que hace cerrar sesión, y solo se llama con la cola ya vacía: quien lo
 * llama se ha asegurado antes de que todo subió. `pinConfig` se va con lo demás
 * —es un registro más del uid— y el copy de salir lo dice.
 *
 * **Nunca toca otro uid**: recorre el índice `byUser` de los dos almacenes con
 * ese uid y nada más. Las filas que una entrada a cuenta dejó conservadas bajo
 * uids anónimos antiguos siguen donde estaban.
 *
 * Retira también la mudanza pendiente hacia ese uid, si la había: con su árbol
 * borrado no hay nada contra lo que mudar, y lo anónimo sigue bajo su uid. La
 * marca de restauración y el último resultado no viven aquí: los retira
 * `olvidarUid` (`restaurar.js`), que es quien los conoce.
 *
 * @returns {Promise<{registros: number, cola: number}>}
 */
export async function borrarUid(uid) {
  assertUid(uid)
  const db = await getLocalDB()
  const tx = db.transaction([STORE_RECORDS, STORE_SYNC_QUEUE], 'readwrite')
  const registros = tx.objectStore(STORE_RECORDS)
  const cola = tx.objectStore(STORE_SYNC_QUEUE)

  const rutas = await registros.index('byUser').getAllKeys(uid)
  const entradas = await cola.index('byUser').getAllKeys(uid)
  for (const ruta of rutas) await registros.delete(ruta)
  for (const seq of entradas) await cola.delete(seq)
  await tx.done

  almacenLocal()?.removeItem(claveDeMudanzaPendiente(uid))

  return { registros: rutas.length, cola: entradas.length }
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
