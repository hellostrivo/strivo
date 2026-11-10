// src/lib/db/almacen.js
// Qué almacén se usa: IndexedDB en la web, SQLite en la app nativa (SPEC_17B).
//
// **Una regla, un sitio.** Este módulo es el único que decide el adaptador, y
// lo decide una vez, al arrancar (`prepararAlmacen`), antes de que se monte la
// app. `local.js` le pide el adaptador en cada operación y no sabe cuál es.
// `esNativa()` sigue siendo la única pregunta por la plataforma.
//
// ─── Al arrancar en la app nativa ─────────────────────────────────────────────
//
//   1. Se abre SQLite, con tres intentos (al momento, a los 0,5 s y a 1,5 s).
//   2. Se crean las tablas si no están.
//   3. Si `meta` tiene la marca `migradoEn`, se usa SQLite y **no se vuelve a
//      mirar IndexedDB**, aunque tenga datos.
//   4. Si no, se migra (`migracionSQLite.js`). Si no termina, esta sesión sigue
//      con IndexedDB y el siguiente arranque lo intenta otra vez.
//   5. Se recuperan o se igualan las claves del teléfono (`clavesDelTelefono`).
//
// **Después de la migración, nunca se vuelve a IndexedDB** (DP-17B.9): lo que
// hay allí es una copia vieja, y escribir en ella partiría el diario en dos.
//
// ─── Si SQLite no abre ────────────────────────────────────────────────────────
//
// Se le pregunta al plugin si el archivo de la base existe (§9):
//   - **existe y no abre** → la pantalla de error que ya existe, con «Reintentar».
//   - **no existe y no se puede crear** → esta sesión sigue con IndexedDB, sin
//     marca, y el siguiente arranque migra.
// Si ni siquiera eso contesta, decide la pista `strivo.almacen` de
// `localStorage` (la segunda señal), con la regla del techo, abajo.
//
// ─── El techo: 10 s, y la app nunca se queda en el velo ───────────────────────
//
// Si pasados 10 s no hay respuesta:
//   - **todavía no se sabe si hubo migración** (abriendo, o leyendo la marca):
//     sin pista y con datos en IndexedDB es que nunca se migró → IndexedDB; en
//     cualquier otro caso, la pantalla de error con «Reintentar». Entrar a una
//     app vacía haría creer que se perdió todo, y escribir en ella lo partiría;
//   - **migrando**: la migración se da por abandonada —no escribirá la marca:
//     vacía y se va— y la sesión sigue con IndexedDB;
//   - **la marca ya salió o ya está**: hay que usar SQLite. Se espera otro techo
//     y, si sigue sin contestar, la pantalla de error. Nunca IndexedDB.

import { esNativa } from '../plataforma.js'
import { adaptadorIndexedDB } from './adaptadorIndexedDB.js'
import { almacenLocal, fijarEspejo } from './clavesDelTelefono.js'

/** Cuánto se espera, como mucho, a abrir y migrar antes de decidir. */
export const TECHO_DE_APERTURA_MS = 10000

/** Las esperas entre intentos de abrir: tres intentos. */
export const ESPERAS_DE_APERTURA_MS = Object.freeze([0, 500, 1000])

/** La pista de que este teléfono ya usa SQLite. Solo en `localStorage`, como segunda señal. */
export const CLAVE_PISTA = 'strivo.almacen'

/** Por qué una migración no terminó; los mismos de `migracionSQLite.js`. */
const TECHO = 'techo'

// ─── El adaptador vigente ─────────────────────────────────────────────────────

let actual = adaptadorIndexedDB

/** El adaptador vigente. Lo pide `local.js` en cada operación. */
export function adaptador() {
  return actual
}

/** Fija el adaptador. Lo usan `prepararAlmacen` y las pruebas; nadie más. */
export function usarAdaptador(otro) {
  actual = otro
}

let estado = Object.freeze({ cual: 'indexeddb', migracion: null })

/**
 * Lo que sabe el diagnóstico: qué almacén se usa y cómo fue la migración.
 * `migracion` es `null` en la web, o
 * `{ estado: 'correcta'|'nadaQueMigrar', fecha }` / `{ estado: 'noTermino', motivo }`.
 */
export function estadoDelAlmacen() {
  return estado
}

/** ¿Se puede montar la app sin esperar a nada? En la web, siempre. */
export function almacenListoSinEspera(nativa = esNativa()) {
  return !nativa
}

// ─── Al arrancar ──────────────────────────────────────────────────────────────

const esperarMs = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

/** El módulo de la app nativa, bajo demanda: la web no lo descarga nunca. */
const cargarArranqueNativo = () => import('./arranqueNativo.js')

function migracionDeMarca(marca) {
  return {
    estado: marca.origen === 'vacio' ? 'nadaQueMigrar' : 'correcta',
    fecha: marca.migradoEn,
  }
}

function conIndexedDB(motivo) {
  usarAdaptador(adaptadorIndexedDB)
  fijarEspejo(null)
  estado = Object.freeze({ cual: 'indexeddb', migracion: { estado: 'noTermino', motivo } })
  return { estado: 'listo', cual: 'indexeddb' }
}

function conSQLite({ adaptador: sqlite, espejo, marca }, almacen) {
  usarAdaptador(sqlite)
  fijarEspejo(espejo)
  try {
    almacen?.setItem(CLAVE_PISTA, 'sqlite')
  } catch {
    // Es una pista y nada más.
  }
  estado = Object.freeze({ cual: 'sqlite', migracion: migracionDeMarca(marca) })
  return { estado: 'listo', cual: 'sqlite' }
}

const PANTALLA_DE_ERROR = Object.freeze({ estado: 'error' })

function aplicar(resultado, almacen) {
  if (resultado.tipo === 'sqlite') return conSQLite(resultado, almacen)
  if (resultado.tipo === 'indexeddb') return conIndexedDB(resultado.motivo)
  return PANTALLA_DE_ERROR
}

/**
 * Prepara el almacén. En la web no hace nada. En la app nativa, lo descrito en
 * la cabecera. Nunca lanza: devuelve `{ estado: 'listo' }` o `{ estado: 'error' }`.
 *
 * Todo es inyectable para las pruebas; en la app se llama sin argumentos.
 */
export async function prepararAlmacen({
  nativa = esNativa(),
  cargarNativo = cargarArranqueNativo,
  cargar,
  leer,
  techoMs = TECHO_DE_APERTURA_MS,
  esperas = ESPERAS_DE_APERTURA_MS,
  dormir = esperarMs,
  ahora = () => new Date(),
  almacen = almacenLocal(),
} = {}) {
  if (!nativa) return { estado: 'listo', cual: 'indexeddb' }

  let nativo
  try {
    nativo = await cargarNativo()
  } catch {
    // Sin el módulo nativo no hay SQLite que abrir ni marca que leer: es el
    // caso de «no se puede crear», y se decide como él.
    return conIndexedDB('sinAbrir')
  }

  let pista = false
  try {
    pista = almacen?.getItem(CLAVE_PISTA) === 'sqlite'
  } catch {
    pista = false
  }

  const control = { fase: 'abriendo', abandonada: false }
  const opciones = { esperas, dormir, ahora, pista, almacen }
  if (cargar) opciones.cargar = cargar
  if (leer) opciones.leer = leer
  const trabajo = nativo.abrirYMigrar(control, opciones).catch(() => ({ tipo: 'error' }))

  const VENCIDO = Symbol('techo')
  const primero = await Promise.race([trabajo, dormir(techoMs).then(() => VENCIDO)])
  if (primero !== VENCIDO) return aplicar(primero, almacen)

  // ─── Se cruzó el techo ───
  if (control.fase === 'migrando') {
    control.abandonada = true
    return conIndexedDB(TECHO)
  }
  if (control.fase === 'abriendo' || control.fase === 'leyendoMarca') {
    control.abandonada = true
    if (!pista && (await nativo.hayDatosEnIndexedDB(leer))) return conIndexedDB(TECHO)
    return PANTALLA_DE_ERROR
  }
  // La marca ya salió o ya está: solo vale SQLite. Otro techo, y si no, error.
  const segundo = await Promise.race([trabajo, dormir(techoMs).then(() => VENCIDO)])
  return segundo === VENCIDO ? PANTALLA_DE_ERROR : aplicar(segundo, almacen)
}

/** Solo para pruebas: vuelve al punto de partida. */
export function reiniciarAlmacenParaPruebas(adaptadorInicial = adaptadorIndexedDB) {
  actual = adaptadorInicial
  fijarEspejo(null)
  estado = Object.freeze({ cual: adaptadorInicial.nombre, migracion: null })
}
