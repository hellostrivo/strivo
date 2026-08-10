// src/lib/db/sync.js
// Cola local-first → Firestore (RN-02, RN-DB4-04).
//
// Lo escrito ya está a salvo en IndexedDB cuando esta cola entra en juego. Aquí
// solo se decide cuándo sale hacia la red y qué pasa si no sale.
//
// Tres garantías:
//   1. Una entrada por ruta. Cinco escrituras sin red se envían como una.
//   2. La entrada no se borra hasta que Firestore confirma. Si el envío falla,
//      se reintenta; nada se pierde por un corte.
//   3. `lumia/pinConfig` nunca llega hasta aquí: `savePinConfig` escribe con
//      `sync: false` (RN-DB-04, el PIN no sale del dispositivo).

import { dequeue, listQueue, markQueueAttempt, pendingCount } from './local.js'

/** Espera entre reintentos, en milisegundos. Crece hasta el tope y se queda. */
const RETRY_BACKOFF_MS = [2000, 8000, 30000, 120000]

let flushing = false
let retryTimer = null
let listenersAttached = false

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

// ─── Envío ────────────────────────────────────────────────────────────────────

/**
 * Vacía la cola contra Firestore.
 *
 * @param {string} [uid] - Limita el envío a un usuario.
 * @returns {Promise<{sent: number, pending: number, skipped?: string}>}
 */
export async function flush(uid = null) {
  if (flushing) return { sent: 0, pending: await pendingCount(uid), skipped: 'en_curso' }
  if (!isOnline()) return { sent: 0, pending: await pendingCount(uid), skipped: 'sin_red' }

  const handles = await getFirestoreHandles()
  if (!handles) {
    return { sent: 0, pending: await pendingCount(uid), skipped: 'sin_configuracion' }
  }

  flushing = true
  let sent = 0
  try {
    const queue = await listQueue(uid)
    for (const entry of queue) {
      try {
        const ref = handles.doc(handles.db, entry.path)
        if (entry.op === 'delete') {
          await handles.deleteDoc(ref)
        } else {
          await handles.setDoc(ref, entry.data)
        }
        // Se saca de la cola solo después de que Firestore confirma.
        await dequeue(entry.seq)
        sent += 1
      } catch {
        await markQueueAttempt(entry.seq)
        scheduleRetry(entry.attempts, uid)
        break
      }
    }
  } finally {
    flushing = false
  }

  return { sent, pending: await pendingCount(uid) }
}

function scheduleRetry(attempts, uid) {
  if (retryTimer !== null) return
  const delay = RETRY_BACKOFF_MS[Math.min(attempts, RETRY_BACKOFF_MS.length - 1)]
  retryTimer = setTimeout(() => {
    retryTimer = null
    flush(uid)
  }, delay)
}

/** Cancela el reintento pendiente. Se usa al cerrar sesión y en pruebas. */
export function cancelRetries() {
  if (retryTimer !== null) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
}

// ─── Arranque ─────────────────────────────────────────────────────────────────

/**
 * Empieza a sincronizar: vacía lo pendiente y se queda atento a la vuelta de la
 * red. Llamarla dos veces no duplica los oyentes.
 *
 * @param {string} uid
 * @returns {() => void} función para dejar de escuchar.
 */
export function startSync(uid) {
  flush(uid)

  if (typeof window === 'undefined' || listenersAttached) return () => {}

  const onOnline = () => flush(uid)
  const onVisible = () => {
    if (document.visibilityState === 'visible') flush(uid)
  }

  window.addEventListener('online', onOnline)
  document.addEventListener('visibilitychange', onVisible)
  listenersAttached = true

  return () => {
    window.removeEventListener('online', onOnline)
    document.removeEventListener('visibilitychange', onVisible)
    listenersAttached = false
    if (retryTimer !== null) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  }
}

/** Cuántas escrituras esperan a salir. Para indicadores discretos, no alarmas. */
export async function getPendingCount(uid = null) {
  return pendingCount(uid)
}

export { listQueue as listPending }
