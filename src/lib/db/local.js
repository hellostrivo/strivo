// src/lib/db/local.js
// Almacén local de Strivo. Es la fuente inmediata de verdad.
//
// RN-02 / RN-DB4-04 — Local-first sin excepciones: toda escritura se confirma
// aquí antes de cualquier intento de red. Firestore recibe después, desde la
// cola de `sync.js`.
//
// Un solo almacén direccionado por ruta (`users/{uid}/diario/journal/items/{id}`)
// en vez de un almacén por entidad: la forma local es idéntica a la de
// Firestore, así que la sincronización no traduce nada y no puede desalinearse.

// **Desde SPEC_17B, el almacén depende de dónde corre la app** (10 nov 2026):
// IndexedDB en la web y SQLite en la app nativa. Este módulo sigue siendo la
// única puerta y su contrato no cambió: por dentro le pide el adaptador a
// `almacen.js`, que es quien lo decide, y aplica aquí las reglas que no son de
// ningún almacén —qué se encola, qué decide una mudanza—. Los dos adaptadores
// (`adaptadorIndexedDB.js` y `adaptadorSQLite.js`) solo guardan y leen.

import { assertUid, StrivoDataError, ERROR_CODES } from './schema.js'
import { esExpediente, esSemilla, hechosQueFaltan } from './conflictos.js'
import { adaptador } from './almacen.js'
import { almacenLocal, quitarClave } from './clavesDelTelefono.js'

// Lo de IndexedDB por dentro sigue a mano de las pruebas que lo miran.
export { STORE_RECORDS, STORE_SYNC_QUEUE, getLocalDB } from './adaptadorIndexedDB.js'
export { almacenLocal }

/**
 * Cierra el almacén vigente. Con IndexedDB, cierra la base y olvida la
 * conexión (pruebas y cierre de sesión); con SQLite no hace nada: hay una sola
 * conexión para toda la vida de la app.
 */
export async function closeLocalDB() {
  await adaptador().cerrar()
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
  const row = await adaptador().leer(path)
  return row ? row.data : null
}

/** Devuelve `{ id, ...data }` de todos los registros de una colección. */
export async function readCollection(uid, collection) {
  assertUid(uid)
  const rows = await adaptador().leerIndice('byCollection', [uid, collection])
  return rows.map(toItem)
}

/** Igual que `readCollection`, filtrando por el campo `date` del registro. */
export async function readCollectionByDate(uid, collection, date) {
  assertUid(uid)
  const rows = await adaptador().leerIndice('byCollectionDate', [uid, collection, date])
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
  const rows = await adaptador().leerIndice(index, [uid, collection, value])
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
  const row = {
    path,
    uid,
    collection,
    id,
    data,
    updatedAt: new Date().toISOString(),
  }

  await adaptador().poner(row)
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
  const data = await adaptador().fusionar(
    { path, uid, collection, id, updatedAt: new Date().toISOString() },
    patch,
  )

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
  return adaptador().ponerSiAusente({
    path,
    uid,
    collection,
    id,
    data,
    updatedAt: new Date().toISOString(),
  })
}

/** Borra una ruta en local y encola el borrado. */
export async function deletePath({ uid, path, sync = true }) {
  assertUid(uid)
  await adaptador().quitar(path)
  if (sync) await enqueue({ uid, path, op: 'delete', data: null })
}

// ─── Mudanza de un árbol entero ───────────────────────────────────────────────

/**
 * Rutas que nunca salen del dispositivo (RN-DB-04). Al mudar el árbol no se
 * reencolan: el PIN no se sincroniza antes de la mudanza y tampoco después.
 * Se reconoce por la ruta y no importando `diario.js`, que este módulo no
 * conoce y no debe conocer.
 */
const SIN_SINCRONIZAR = /\/(?:diario\/pinConfig|shared\/frases|diario\/frasesDelDia\/items\/[^/]+)$/

/**
 * ¿Esta ruta vive solo en el dispositivo?
 *
 * Son tres: el PIN y, desde SPEC_29, la preferencia de frases y las frases ya
 * asignadas a cada día. La preferencia dice qué referencias religiosas,
 * espirituales o filosóficas quiere encontrar alguien, y la asignación lo
 * delata por el id de la frase: ninguna de las dos sube a Firestore.
 *
 * `enqueue` la consulta también, y no solo `mudarUid`: quien escribe estas
 * rutas ya pasa `sync: false`, pero la garantía no puede depender de que
 * nadie se olvide en una escritura futura.
 */
export function esRutaLocal(path) {
  return SIN_SINCRONIZAR.test(String(path ?? ''))
}

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

  // Las reglas se deciden aquí, fila a fila; el adaptador las aplica dentro de
  // una sola transacción, con IndexedDB y con SQLite.
  const { mudadas, completadas, conservados } = await adaptador().mudarFilas(
    desde,
    hacia,
    (fila, existente) => {
      const muda = politica
        ? politica(fila.collection, fila.data, existente ? existente.data : null)
        : !existente
      const conHechos = Boolean(politica && existente && esExpediente(fila.collection, fila.id))
      if (!muda) {
        const faltan = conHechos ? hechosQueFaltan(existente.data, fila.data) : {}
        const completar = Object.keys(faltan).length > 0 ? { ...existente.data, ...faltan } : null
        return { muda: false, completar }
      }
      const data = conHechos
        ? { ...fila.data, ...hechosQueFaltan(fila.data, existente.data) }
        : fila.data
      return { muda: true, data }
    },
  )

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
  const borrados = await adaptador().borrarUid(uid)
  quitarClave(claveDeMudanzaPendiente(uid))
  return borrados
}

// ─── Cola de sincronización ───────────────────────────────────────────────────
// Una entrada por ruta: si la misma ruta se escribe cinco veces sin red, la
// cola guarda el último estado, no cinco copias. Al volver la red se envía una
// vez y el resultado es el mismo que si nunca se hubiera caído.
//
// **Cada entrada lleva su revisión (`rev`)**, que sube cada vez que se vuelve a
// escribir su ruta (SPEC_31, H-1). La entrada conserva su `seq`, así que sin
// esto un vaciado que enviaba la versión 1 sacaba de la cola la versión 2
// escrita mientras tanto, sin haberla enviado: en el teléfono no se perdía
// nada, pero la nube se quedaba con la vieja hasta la siguiente edición. Ver
// `dequeueSiIgual`. Las entradas de antes no traen `rev` y siguen funcionando.

/**
 * Quien quiere enterarse de que algo entró en la cola (SPEC_31, DP-31.3). Lo
 * pone `startSync` (`sync.js`), que es quien sabe qué hacer con ello: aquí solo
 * se avisa, y por eso `local.js` sigue sin importar `sync.js`.
 */
const oyentesDeCola = new Set()

/**
 * Llama a `fn({ uid, path })` cada vez que una entrada entra en la cola. Un
 * oyente que lance no rompe la escritura: lo escrito ya está escrito.
 *
 * @returns {() => void} la función que lo retira.
 */
export function alEncolar(fn) {
  oyentesDeCola.add(fn)
  return () => oyentesDeCola.delete(fn)
}

export async function enqueue({ uid, path, op, data }) {
  // Lo que vive solo en el dispositivo no entra en la cola, la pida quien la
  // pida (SPEC_29 §7; ver `esRutaLocal`).
  if (esRutaLocal(path)) return
  await adaptador().encolar({ uid, path, op, data, enqueuedAt: new Date().toISOString() })

  for (const fn of [...oyentesDeCola]) {
    try {
      fn({ uid, path })
    } catch {
      // Ver `alEncolar`: el aviso no es asunto de la escritura.
    }
  }
}

export async function listQueue(uid = null) {
  return adaptador().listarCola(uid)
}

export async function dequeue(seq) {
  await adaptador().sacar(seq)
}

/**
 * Saca de la cola la entrada que se acaba de enviar, **solo si sigue siendo
 * la misma** (H-1). Si mientras viajaba se volvió a escribir su ruta, la
 * revisión ya no coincide y la entrada se queda, con la versión nueva, para el
 * siguiente envío.
 *
 * Una entrada de antes de SPEC_31 no trae `rev`: si nadie la ha tocado, las dos
 * dicen `undefined` y sale; si se reescribió, la nueva ya trae `rev: 1` y se
 * queda. Las dos cosas que tienen que pasar.
 *
 * @param {{seq: number, rev?: number}} enviada - la entrada tal como se leyó al enviar.
 * @returns {Promise<boolean>} si salió de la cola.
 */
export async function dequeueSiIgual(enviada) {
  return adaptador().sacarSiIgual(enviada)
}

/** Marca un intento fallido sin perder la entrada: se reintenta más tarde. */
export async function markQueueAttempt(seq) {
  await adaptador().marcarIntento(seq)
}

export async function pendingCount(uid = null) {
  const queue = await listQueue(uid)
  return queue.length
}
