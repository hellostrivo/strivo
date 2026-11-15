// src/lib/limpiezaDelTelefono.js
// Lo que se quita del teléfono al salir de una cuenta y al borrarla
// (SPEC_19.1, SPEC_22, SPEC_23A y SPEC_24).
//
// `apagarAvisos` y `olvidarFaceId` vivían privadas en `salidaCuenta.js`, y
// SPEC_24 las necesita igual: se mudaron aquí en vez de copiarse. Las dos solo
// hacen algo en la app de iPhone, cargan lo suyo bajo demanda —la web no lo
// descarga— y nunca lanzan: ni salir ni borrar se detienen por esto.
//
// `vaciarTelefono` es lo de borrar la cuenta (DP-24.14, D5): **el teléfono
// queda como recién instalado**. Todas las filas y la cola de todos los uid,
// las claves `strivo.*` de las cuatro familias, la clave de Face ID, los
// avisos y, en la app nativa, la copia vieja de IndexedDB que dejó la
// migración a SQLite (la excepción a DP-17B.10: es lo escrito por la persona y
// pidió borrarlo). Se quedan la base SQLite —vacía, en su sitio—, su `meta` y
// la pista `strivo.almacen`: son técnicas y no son de nadie.

import { esIPhone, esNativa } from './plataforma.js'
import { vaciarAlmacen } from './db/local.js'
import { adaptador } from './db/almacen.js'
import { quitarTodasLasClaves } from './db/clavesDelTelefono.js'

/**
 * SPEC_22, DP-22.11 — Cancela todos los avisos de Strivo en este teléfono.
 * Solo en la app de iPhone; la reconciliación se carga bajo demanda.
 */
export async function apagarAvisos({ iphone = esIPhone() } = {}) {
  if (!iphone) return
  try {
    const { apagarAvisos: apagar } = await import('./avisos/reconciliar.js')
    await apagar()
  } catch {
    // Nada que hacer: los avisos no frenan ni la salida ni el borrado.
  }
}

/**
 * SPEC_23A (DP-23.12) — Borra la clave de Face ID de la Keychain. No pide la
 * cara y nunca lanza.
 */
export async function olvidarFaceId({ iphone = esIPhone() } = {}) {
  if (!iphone) return
  try {
    const { biometria } = await import('./biometria.js')
    await biometria.borrar()
  } catch {
    // Nada que hacer: la clave no frena ni la salida ni el borrado.
  }
}

/** Espera a que una base de IndexedDB se borre, como mucho `ms`. */
function borrarBaseIndexedDB(idb, nombre, ms) {
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
    } catch {
      fin()
    }
  })
}

/**
 * La copia vieja de IndexedDB de la app nativa (DP-17B.10), solo si la sesión
 * corre sobre SQLite. Si la app cayó a IndexedDB, esa base es la viva y ya la
 * vació `vaciarAlmacen`.
 */
export async function borrarCopiaViejaDeIndexedDB({
  nativa = esNativa(),
  idb = globalThis.indexedDB,
} = {}) {
  if (!nativa || !idb || adaptador().nombre !== 'sqlite') return false
  const { adaptadorIndexedDB } = await import('./db/adaptadorIndexedDB.js')
  await adaptadorIndexedDB.cerrar()
  await borrarBaseIndexedDB(idb, 'strivo', 3000)
  return true
}

/**
 * Deja el teléfono como recién instalado. Lo llama borrar la cuenta, y solo
 * con la nube vacía y la cuenta ya borrada. Ningún paso detiene a los demás.
 *
 * @param {object} [dobles] - Existen para las pruebas.
 */
export async function vaciarTelefono(dobles = {}) {
  const {
    avisos = apagarAvisos,
    faceId = olvidarFaceId,
    copiaVieja = borrarCopiaViejaDeIndexedDB,
  } = dobles
  await avisos()
  await vaciarAlmacen()
  await copiaVieja().catch(() => false)
  await faceId()
  quitarTodasLasClaves()
}
