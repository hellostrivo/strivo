// src/unaPausa/canal/cache.js
// La caché de Una pausa: el último canal válido y la portada de la vigente,
// para leer sin conexión (SPEC_28.3 §4.3).
//
// **Es una base aparte, `strivo-contenido`, y vive fuera del árbol del
// usuario.** Lo que guarda es contenido público, el mismo para todos: no entra
// en la cola de sincronización, no se exporta, no se restaura y no se borra al
// salir de la cuenta. Por eso no pasa por `lib/db` —ni lo importa: lo comprueba
// una prueba de repo— y su nombre solo aparece aquí. No depende del service
// worker porque en Capacitor no lo hay (SPEC_28 H10).
//
// **Nunca lanza.** Sin IndexedDB, o con IndexedDB fallando, leer devuelve
// `null` y guardar devuelve `false`: la sección funciona igual, solo sin caché.
//
// La portada se guarda como **bytes y tipo**, no como `Blob`: algunas versiones
// de Safari no sabían guardar un `Blob` en IndexedDB, y unos bytes los guarda
// cualquiera. Se rehace el `Blob` al leer.

import { openDB } from 'idb'
import { esCanal } from './leer.js'

export const NOMBRE_CACHE = 'strivo-contenido'
const VERSION = 1

const CANAL = 'canal'
const PORTADAS = 'portadas'
/** El canal se guarda en una sola fila: solo interesa el último. */
const ULTIMO = 'ultimo'

let conexion = null

function abrir() {
  if (typeof indexedDB === 'undefined' || indexedDB === null) {
    return Promise.reject(new Error('sin-indexeddb'))
  }
  if (!conexion) {
    // Mismo cuidado que `lib/db/local.js` (DP-17.12): si otra pestaña pide una
    // versión mayor, o el navegador cierra la base, la conexión se suelta y la
    // siguiente lectura la vuelve a abrir.
    const promesa = openDB(NOMBRE_CACHE, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CANAL)) db.createObjectStore(CANAL)
        if (!db.objectStoreNames.contains(PORTADAS)) db.createObjectStore(PORTADAS)
      },
      blocking(_actual, _pedida, event) {
        event.target.close()
        if (conexion === promesa) conexion = null
      },
      terminated() {
        if (conexion === promesa) conexion = null
      },
    })
    promesa.catch(() => {
      if (conexion === promesa) conexion = null
    })
    conexion = promesa
  }
  return conexion
}

/** El último canal válido, o `null`. */
export async function leerCanalGuardado() {
  try {
    const db = await abrir()
    const canal = (await db.get(CANAL, ULTIMO)) ?? null
    return esCanal(canal) ? canal : null
  } catch {
    return null
  }
}

/**
 * Guarda un canal, **solo si es válido**: uno roto nunca pisa uno bueno.
 * @returns {Promise<boolean>} Si se guardó.
 */
export async function guardarCanal(canal) {
  if (!esCanal(canal)) return false
  try {
    const db = await abrir()
    await db.put(CANAL, canal, ULTIMO)
    return true
  } catch {
    return false
  }
}

/** La portada guardada con esa `src`, como `Blob`, o `null`. */
export async function leerPortadaGuardada(src) {
  if (typeof src !== 'string') return null
  try {
    const db = await abrir()
    const fila = await db.get(PORTADAS, src)
    if (!fila || !(fila.bytes instanceof ArrayBuffer)) return null
    return new Blob([fila.bytes], { type: fila.tipo ?? '' })
  } catch {
    return null
  }
}

/**
 * Guarda la portada de la vigente y **olvida las demás**: solo hace falta la de
 * la cápsula que se enseña sin conexión, y las de semanas pasadas no se
 * acumulan en el teléfono.
 * @returns {Promise<boolean>} Si se guardó.
 */
export async function guardarPortada(src, blob) {
  if (typeof src !== 'string' || !blob || typeof blob.arrayBuffer !== 'function') return false
  try {
    const bytes = await blob.arrayBuffer()
    const db = await abrir()
    const tx = db.transaction(PORTADAS, 'readwrite')
    for (const clave of await tx.store.getAllKeys()) {
      if (clave !== src) await tx.store.delete(clave)
    }
    await tx.store.put({ tipo: blob.type, bytes }, src)
    await tx.done
    return true
  } catch {
    return false
  }
}

/** Cierra la base y olvida la conexión. Para las pruebas. */
export async function cerrarCache() {
  const promesa = conexion
  conexion = null
  if (!promesa) return
  try {
    ;(await promesa).close()
  } catch {
    // Una base que no llegó a abrirse no hay que cerrarla.
  }
}
