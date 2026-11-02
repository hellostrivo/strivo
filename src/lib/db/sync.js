// src/lib/db/sync.js
// Cola local-first → Firestore (RN-02, RN-DB4-04).
//
// Lo escrito ya está a salvo en IndexedDB cuando esta cola entra en juego. Aquí
// solo se decide cuándo sale hacia la red y qué pasa si no sale.
//
// Tres garantías:
//   1. Una entrada por ruta. Cinco escrituras sin red se envían como una.
//   2. La entrada no se borra hasta que Firestore confirma, y solo si sigue
//      siendo la que se envió (`dequeueSiIgual`). Si el envío falla o no
//      contesta a tiempo, se reintenta; nada se pierde por un corte.
//   3. `diario/pinConfig` nunca llega hasta aquí: `savePinConfig` escribe con
//      `sync: false` (RN-DB-04, el PIN no sale del dispositivo).
//
// ─── Qué pone la cola en marcha (SPEC_31) ────────────────────────────────────
//
// Hasta SPEC_31, **nada la ponía en marcha después de escribir** (O-3): `flush`
// solo corría al montar, al volver la red, al volver la pestaña, tras un fallo
// o con un botón. Con la app abierta, lo escrito esperaba en la cola hasta que
// pasara una de esas cosas. Ahora, mientras `startSync` está activo:
//
//   - **Escribir** arma un vaciado a los `DEMORA_DE_SUBIDA_MS` (DP-31.3). Las
//     escrituras que llegan mientras tanto no lo reinician: diez seguidas son
//     un vaciado, y escribir sin parar nunca deja nada esperando más que eso.
//     Si al vencer ya hay un vaciado en marcha, se da otra vuelta al terminar.
//   - **Irse al fondo** (`visibilitychange` a oculto, `pagehide`) vacía en el
//     acto, sin esperar: en el iPhone la app se congela poco después.
//   - **Volver la red** vacía, como antes; **irse** cancela el reintento
//     pendiente, y sin red no se programa ninguno (DP-31.4).
//
// ─── Si la conexión se queda muerta (SPEC_31) ────────────────────────────────
//
// Cada envío tiene límite (`LIMITE_DE_RED_MS`, `limite.js`). Pasado, cuenta como
// fallo y la entrada se queda. Y como una conexión colgada no se recupera sola
// —en O-2 siguió muerta trece minutos, hasta recargar—, el siguiente intento
// **reabre la conexión de Firestore** antes de enviar: `disableNetwork` cierra
// sus canales y `enableNetwork` los abre de nuevo. Lo que el SDK tenía a medio
// enviar no se pierde con eso: se queda en su propia cola y sale al reabrir.

import { alEncolar, dequeueSiIgual, listQueue, markQueueAttempt, pendingCount } from './local.js'
import { LIMITE_DE_RED_MS, conLimite, esLimiteVencido } from './limite.js'

/**
 * Espera entre reintentos con red, en milisegundos (DP-31.4). Crece hasta el
 * tope y se queda: con red, nada espera más de medio minuto a volver a salir.
 */
export const RETRY_BACKOFF_MS = Object.freeze([2000, 5000, 10000, 20000, 30000])

/** Cuánto se espera desde una escritura hasta vaciar la cola (DP-31.3). */
export const DEMORA_DE_SUBIDA_MS = 2000

let flushing = false
let enCurso = null
let retryTimer = null
let listenersAttached = false

// El vaciado que armó una escritura, el uid de `startSync` y si hay que dar
// otra vuelta cuando termine el vaciado que está en marcha.
let subidaTimer = null
let uidDeSubida = null
let otraVuelta = false

// Un envío venció el límite: el siguiente intento reabre la conexión antes.
let reabrirAntes = false

// ─── Acceso a Firestore ───────────────────────────────────────────────────────
// Se carga bajo demanda: sin red o sin configuración, la app funciona entera
// sin haber tocado el SDK.

async function getFirestoreHandles() {
  const [{ db }, firestore] = await Promise.all([
    import('../firebase.js'),
    import('firebase/firestore'),
  ])
  if (!db) return null
  return { db, ...firestore }
}

function isOnline() {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

/**
 * Cierra y reabre la conexión de Firestore. `enableNetwork` se pide **siempre**,
 * aunque `disableNetwork` no conteste a tiempo: el SDK atiende las dos en orden
 * en su propia cola, así que pedirla después basta para que la red no se quede
 * apagada. Si `enableNetwork` tampoco contesta, se vuelve a intentar en el
 * siguiente vaciado.
 */
async function reabrirConexion(handles, limiteMs) {
  reabrirAntes = false
  try {
    await conLimite(handles.disableNetwork(handles.db), limiteMs)
  } catch {
    // Sigue: lo que importa es pedir que se abra.
  }
  try {
    await conLimite(handles.enableNetwork(handles.db), limiteMs)
  } catch {
    reabrirAntes = true
  }
}

// ─── Envío ────────────────────────────────────────────────────────────────────

/**
 * Vacía la cola contra Firestore.
 *
 * @param {string} [uid] - Limita el envío a un usuario.
 * @param {object} [opciones]
 * @param {number} [opciones.limiteMs=LIMITE_DE_RED_MS] - Existe para las pruebas.
 * @returns {Promise<{sent: number, pending: number, skipped?: string}>}
 */
export async function flush(uid = null, { limiteMs = LIMITE_DE_RED_MS } = {}) {
  if (flushing) return { sent: 0, pending: await pendingCount(uid), skipped: 'en_curso' }
  if (!isOnline()) return { sent: 0, pending: await pendingCount(uid), skipped: 'sin_red' }

  // La guarda se pone antes del primer `await` (H-2): si no, dos llamadas en el
  // mismo instante —la red y la pestaña que vuelven a la vez— pasaban las dos.
  flushing = true
  let terminar
  enCurso = new Promise((resolve) => {
    terminar = resolve
  })
  let sent = 0
  let skipped = null
  try {
    const handles = await getFirestoreHandles()
    if (!handles) {
      skipped = 'sin_configuracion'
    } else {
      const queue = await listQueue(uid)
      if (queue.length > 0 && reabrirAntes) await reabrirConexion(handles, limiteMs)
      for (const entry of queue) {
        try {
          const ref = handles.doc(handles.db, entry.path)
          const envio =
            entry.op === 'delete' ? handles.deleteDoc(ref) : handles.setDoc(ref, entry.data)
          await conLimite(envio, limiteMs)
          // Se saca de la cola solo después de que Firestore confirma, y solo
          // si nadie la reescribió mientras viajaba (H-1).
          await dequeueSiIgual(entry)
          sent += 1
        } catch (error) {
          if (esLimiteVencido(error)) reabrirAntes = true
          await markQueueAttempt(entry.seq)
          // Sin red no se gasta un reintento: lo hará el evento `online` (H-3).
          if (isOnline()) scheduleRetry(entry.attempts, uid)
          break
        }
      }
    }
  } finally {
    flushing = false
    enCurso = null
    terminar()
    if (otraVuelta) {
      otraVuelta = false
      programarSubida()
    }
  }

  const pending = await pendingCount(uid)
  return skipped ? { sent: 0, pending, skipped } : { sent, pending }
}

/**
 * El vaciado que está en marcha ahora mismo, o `null` si no hay ninguno.
 *
 * **Solo lectura** (SPEC_19.1, desvío D2): no cambia lo que hace `flush` ni lo
 * que devuelve. Existe para quien recibió `skipped: 'en_curso'` y necesita
 * saber cuándo termina ese otro vaciado antes de mirar la cola —el botón de
 * "Intentar de nuevo" de Tu perfil, que si no diría "todavía no se pudo" de
 * algo que estaba subiendo en ese momento—. La promesa resuelve siempre, haya
 * salido bien o mal el envío, y sin valor: lo que importa después es la cola.
 * Desde SPEC_31, además, **termina siempre**: cada envío tiene límite.
 *
 * @returns {?Promise<void>}
 */
export function flushEnCurso() {
  return enCurso
}

function scheduleRetry(attempts, uid) {
  if (retryTimer !== null) return
  const delay = RETRY_BACKOFF_MS[Math.min(attempts, RETRY_BACKOFF_MS.length - 1)]
  retryTimer = setTimeout(() => {
    retryTimer = null
    flush(uid)
  }, delay)
}

/** Cancela el reintento pendiente. Se usa al cerrar sesión, al irse la red y en pruebas. */
export function cancelRetries() {
  if (retryTimer !== null) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
}

// ─── El vaciado que arma una escritura (DP-31.3) ──────────────────────────────

/**
 * Arma un vaciado a los `DEMORA_DE_SUBIDA_MS`, si no hay uno armado. No se
 * reinicia con cada escritura: es lo que agrupa sin dejar nada esperando.
 *
 * Con un reintento ya programado no arma nada: la conexión acaba de fallar y
 * manda la escala de reintentos. Lo nuevo sale con ese reintento.
 */
function programarSubida() {
  if (uidDeSubida === null || subidaTimer !== null || retryTimer !== null) return
  subidaTimer = setTimeout(() => {
    subidaTimer = null
    correrSubida()
  }, DEMORA_DE_SUBIDA_MS)
}

/** Vacía ya. Si hay un vaciado en marcha, se da otra vuelta cuando termine. */
function correrSubida() {
  if (uidDeSubida === null) return
  if (flushing) {
    otraVuelta = true
    return
  }
  flush(uidDeSubida)
}

/** Vacía en el acto, sin esperar a la demora ni a un reintento programado. */
function subirYa() {
  if (subidaTimer !== null) {
    clearTimeout(subidaTimer)
    subidaTimer = null
  }
  correrSubida()
}

function cancelarSubida() {
  if (subidaTimer !== null) {
    clearTimeout(subidaTimer)
    subidaTimer = null
  }
  otraVuelta = false
}

// ─── Arranque ─────────────────────────────────────────────────────────────────

/**
 * Empieza a sincronizar: vacía lo pendiente, vuelve a vaciar tras cada
 * escritura y se queda atento a la red y a la visibilidad. Llamarla dos veces
 * no duplica los oyentes.
 *
 * @param {string} uid
 * @returns {() => void} función para dejar de escuchar.
 */
export function startSync(uid) {
  flush(uid)

  if (listenersAttached) return () => {}
  listenersAttached = true
  uidDeSubida = uid

  const quitarAvisoDeCola = alEncolar(() => programarSubida())

  const hayVentana = typeof window !== 'undefined'
  const hayDocumento = typeof document !== 'undefined'
  const onOnline = () => flush(uid)
  const onOffline = () => cancelRetries()
  // Al volver a primer plano, como siempre; al irse al fondo, en el acto.
  const onVisibilidad = () => subirYa()
  const onPagehide = () => subirYa()

  if (hayVentana) {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('pagehide', onPagehide)
  }
  if (hayDocumento) document.addEventListener('visibilitychange', onVisibilidad)

  return () => {
    if (hayVentana) {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('pagehide', onPagehide)
    }
    if (hayDocumento) document.removeEventListener('visibilitychange', onVisibilidad)
    quitarAvisoDeCola()
    cancelarSubida()
    uidDeSubida = null
    listenersAttached = false
    cancelRetries()
  }
}

/** Cuántas escrituras esperan a salir. Para indicadores discretos, no alarmas. */
export async function getPendingCount(uid = null) {
  return pendingCount(uid)
}

export { listQueue as listPending }
