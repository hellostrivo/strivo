// src/lib/db/diagnosticoAlmacen.js
// Lo que necesita el build de diagnóstico de SPEC_17B (DP-17B.7): contar en los
// dos almacenes, decir cómo fue la migración y simular que iOS limpió el
// almacén del WebView.
//
// Solo lo importa `components/perfil/DiagnosticoAlmacen.jsx`, que solo se carga
// con `VITE_DIAG_ALMACEN=1`. Sin la bandera, nada de esto llega a `dist/`.
//
// **Contar en IndexedDB no lo crea ni lo abre si no está**: lo lee
// `leerIndexedDB` (`migracionSQLite.js`), que no abre la base si no aparece en
// `indexedDB.databases()`. Tras la simulación tiene que decir 0, y no crear una
// base vacía para poder decirlo.

import { adaptador, estadoDelAlmacen } from './almacen.js'
import { adaptadorIndexedDB } from './adaptadorIndexedDB.js'
import { leerIndexedDB } from './migracionSQLite.js'
import { almacenLocal } from './clavesDelTelefono.js'

/** «10 nov 2026, 18:42», en la hora del teléfono. */
export function fechaDeMigracion(iso) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
}

/**
 * @returns {Promise<{cual: string, migracion: ?object, indexeddb: object, sqlite: ?object}>}
 *   `sqlite` es `null` si esta sesión no usa SQLite: no hay a quién preguntarle.
 */
export async function leerDiagnostico({ leer = leerIndexedDB } = {}) {
  const { cual, migracion } = estadoDelAlmacen()
  let indexeddb = { registros: 0, porSubir: 0 }
  try {
    const { registros, cola } = await leer()
    indexeddb = { registros: registros.length, porSubir: cola.length }
  } catch {
    // Contar es lo de menos: se dice 0.
  }
  const sqlite = cual === 'sqlite' ? await adaptador().contar() : null
  return { cual, migracion, indexeddb, sqlite }
}

/** Espera a que la petición de borrar termine, como mucho `ms`. */
function borrarBase(idb, nombre, ms) {
  return new Promise((resolver) => {
    const reloj = setTimeout(resolver, ms)
    const fin = () => {
      clearTimeout(reloj)
      resolver()
    }
    try {
      const peticion = idb.deleteDatabase(nombre)
      peticion.onsuccess = fin
      peticion.onerror = fin
      // `blocked` no se espera: la conexión de la app se soltó antes, y la de
      // cualquier otra se suelta sola (`blocking`, DP-17.12).
    } catch {
      fin()
    }
  })
}

/**
 * Lo que haría iOS al limpiar el almacén del WebView, para M3 y M5: borra la
 * base `strivo` de IndexedDB y las claves `strivo.*` de `localStorage`, y
 * recarga. **No toca la sesión de Firebase** (`firebaseLocalStorageDb`): iOS sí
 * se la llevaría, y entonces la sesión quedaría `vencida`, que es otra prueba.
 */
export async function simularLimpieza({
  idb = globalThis.indexedDB,
  almacen = almacenLocal(),
  recargar = () => window.location.reload(),
} = {}) {
  await adaptadorIndexedDB.cerrar()
  if (idb) await borrarBase(idb, 'strivo', 3000)
  if (almacen) {
    const claves = []
    for (let i = 0; i < almacen.length; i += 1) {
      const clave = almacen.key(i)
      if (clave?.startsWith('strivo.')) claves.push(clave)
    }
    for (const clave of claves) almacen.removeItem(clave)
  }
  recargar()
}
