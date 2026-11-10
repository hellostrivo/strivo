// src/lib/db/arranqueNativo.js
// Abrir SQLite y migrar, en la app nativa (SPEC_17B).
//
// **Solo lo carga `almacen.js`, bajo demanda, y solo en la app nativa**: en la
// web no se descarga nunca, ni él ni el adaptador SQLite ni la migración, y el
// chunk principal de la web no crece por SQLite.
//
// **No toca el estado de la app**: devuelve qué pasó y `almacen.js` decide qué
// hacer con ello —y si todavía hay alguien esperando la respuesta—. Así una
// respuesta que llega después del techo no puede cambiar de almacén con la app
// ya montada.
//
// Devuelve una de tres:
//   { tipo: 'sqlite', adaptador, espejo, marca }  — listo; usar SQLite.
//   { tipo: 'indexeddb', motivo }                 — esta sesión con IndexedDB.
//   { tipo: 'error' }                             — la pantalla de error.

import {
  cargarPlugin,
  copiaDeClaves,
  crearAdaptadorSQLite,
  crearConexion,
  crearEsquema,
} from './adaptadorSQLite.js'
import { MOTIVOS, leerIndexedDB, leerMarca, migrar } from './migracionSQLite.js'
import { reconciliarClaves } from './clavesDelTelefono.js'

export { leerIndexedDB, MOTIVOS }

/** ¿Hay algo en IndexedDB? Si no se puede leer, se dice que no. */
export async function hayDatosEnIndexedDB(leer = leerIndexedDB) {
  try {
    const { registros, cola } = await leer()
    return registros.length + cola.length > 0
  } catch {
    return false
  }
}

async function abrirConIntentos(conexion, { esperas, dormir }) {
  let ultimo = null
  for (const espera of esperas) {
    if (espera > 0) await dormir(espera)
    try {
      return await conexion.enExclusiva((c) => c.abrir())
    } catch (error) {
      ultimo = error
    }
  }
  throw ultimo ?? new Error('no abrió')
}

/**
 * @param {{fase: string, abandonada: boolean}} control - la fase se anota aquí;
 *   `abandonada` la pone `almacen.js` cuando cruza el techo.
 */
export async function abrirYMigrar(
  control,
  { cargar = cargarPlugin, leer = leerIndexedDB, esperas, dormir, ahora, pista, almacen },
) {
  const indexeddb = (motivo) => ({ tipo: 'indexeddb', motivo })
  const error = { tipo: 'error' }

  // ─── Abrir, con tres intentos ───
  let conexion = null
  let creada
  try {
    const { plugin } = await cargar()
    conexion = crearConexion(plugin)
    creada = await abrirConIntentos(conexion, { esperas, dormir })
  } catch {
    if (control.abandonada) return error
    // Se pregunta si el archivo existe (§9): existe y no abre → error; no
    // existe y no se puede crear → IndexedDB. Si ni eso contesta, la pista.
    let existe = null
    try {
      existe = conexion ? await conexion.enExclusiva((c) => c.existe()) : null
    } catch {
      existe = null
    }
    if (existe === false) return indexeddb(MOTIVOS.sinAbrir)
    if (existe === null && !pista && (await hayDatosEnIndexedDB(leer))) {
      return indexeddb(MOTIVOS.sinAbrir)
    }
    return error
  }

  if (control.abandonada) return error
  control.fase = 'leyendoMarca'

  // ─── Las tablas y la marca ───
  let marca
  try {
    await crearEsquema(conexion)
    marca = await conexion.enExclusiva((c) => leerMarca(c))
  } catch {
    // Una base recién creada que no admite tablas no tiene nada que perder:
    // esta sesión con IndexedDB. Una que ya existía puede tener la marca.
    return creada ? indexeddb(MOTIVOS.sinAbrir) : error
  }

  // ─── La migración, si no la hubo ───
  if (!marca) {
    if (control.abandonada) return error
    control.fase = 'migrando'
    const resultado = await conexion.enExclusiva((c) =>
      migrar(c, {
        leer,
        ahora,
        abandonada: () => control.abandonada,
        alMarcar: () => {
          control.fase = 'marcando'
        },
      }),
    )
    if (!resultado.ok) return indexeddb(resultado.motivo)
    marca = resultado.marca
  }

  // Si el techo ya decidió mientras se leía la marca, esta respuesta llega
  // tarde y no cambia nada.
  if (control.abandonada) return error
  control.fase = 'marcada'

  // ─── Las claves del teléfono, antes de que nadie lea el uid ───
  // Si fallan, las de `localStorage` siguen ahí: no se pierde nada por no
  // copiarlas hoy, y el siguiente arranque lo intenta otra vez.
  const copia = copiaDeClaves(conexion)
  try {
    await reconciliarClaves(copia, almacen)
  } catch {
    // Ver arriba.
  }

  return {
    tipo: 'sqlite',
    adaptador: crearAdaptadorSQLite(conexion),
    espejo: copia.escribir,
    marca,
  }
}
