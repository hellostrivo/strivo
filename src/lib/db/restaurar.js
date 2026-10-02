// src/lib/db/restaurar.js
// Lo que subió a la nube vuelve a bajar (SPEC_17A §4.3).
//
// Hasta esta SPEC, Firestore era de solo escritura: la cola de `sync.js` subía
// y nada volvía. Si alguien reinstalaba la app o borraba los datos del
// navegador, su diario seguía íntegro en la nube y no había forma de leerlo.
// Esto es esa forma.
//
// **Esta es la única función de toda la app autorizada a leer de Firestore.**
// Cualquier otro `getDoc`/`getDocs` fuera de este archivo es un error, y hay
// una prueba que recorre `src/` para comprobarlo.
//
// Tres cosas la definen:
//
//   - **Escribe por `writePath` directo, sin validadores** (D9). Los días de
//     agosto traen campos que el modelo ya no admite escribir —`feeling`,
//     `closingFeeling`, `granVision`, `learning`— y rechazarlos sería perder
//     exactamente lo que esto viene a devolver. La validación es para lo que
//     escribe el código de la app, no para lo que baja de la nube de su
//     propio dueño.
//   - **Toda escritura va con `sync: false`.** Sin esto, restaurar dispararía
//     una resubida completa de todo lo que acaba de bajar. La única excepción
//     es `shared/onboarding` cuando hubo que conservar un `completedAt` que la
//     nube no tenía (ver `aplicar`): ese documento ya no es lo que bajó, y la
//     nube tiene que enterarse.
//   - **Nunca pisa algo local que no pueda demostrar más viejo.** Documento a
//     documento pregunta a `conflictos.js` (las tres reglas del §2): ruta que
//     no existe aquí se escribe; ruta que existe se escribe solo si lo remoto
//     gana.
//
// Es idempotente: escribe por ruta, así que reintentar desde cero no duplica
// nada. Y la marca de "ya se restauró" se pone **solo al terminar entera**:
// una descarga interrumpida no deja marca y el siguiente arranque la repite.

import { readPath, writePath } from './local.js'
import { assertUid } from './schema.js'
import { ganaRemoto } from './conflictos.js'

// ─── Qué se baja ──────────────────────────────────────────────────────────────
//
// **La lista se escribe literal aquí** (D10): el SDK web de Firestore no
// enumera subcolecciones, así que no hay forma de recorrer `users/{uid}/**`
// preguntándole a la nube qué hay. Cada ruta va con la etiqueta de colección
// con la que `local.js` la indexa —tiene que ser la misma que usa quien la
// escribe, o `readCollection` no la encontraría— y con de dónde sale su `id`.
//
// Las cuatro de respiración se copian de `src/breathing/data/esquema.js` y no
// se importan de allí: `lib/db/` no conoce las ramas de arriba, y esa
// dirección de dependencia no se invierte por cuatro cadenas.
//
// **`users/{uid}/diario/pinConfig` no está en la lista a propósito** (RN-DB-04):
// el PIN no sale del dispositivo y tampoco vuelve. Que exista o no en la nube
// es indiferente; no se lee, no se escribe y no se espera.

/** Documentos sueltos: una ruta, un registro. */
const DOCUMENTOS = Object.freeze([
  { doc: 'shared/profile', coleccion: 'shared', id: 'profile' },
  { doc: 'shared/auth', coleccion: 'shared', id: 'auth' },
  { doc: 'shared/preferences', coleccion: 'shared', id: 'preferences' },
  { doc: 'shared/onboarding', coleccion: 'shared', id: 'onboarding' },
  { doc: 'breathing/unica', coleccion: 'breathing', id: 'unica' },
])

/** Subcolecciones: una ruta, muchos registros, el `id` es el del documento. */
const SUBCOLECCIONES = Object.freeze([
  { items: 'diario/journal/items', coleccion: 'diario/journal' },
  { items: 'diario/morningEntry/items', coleccion: 'diario/morningEntry' },
  { items: 'diario/nightRitual/items', coleccion: 'diario/nightRitual' },
  { items: 'diario/dayState/items', coleccion: 'diario/dayState' },
  { items: 'breathing/favoritos/items', coleccion: 'breathing/favoritos' },
  { items: 'breathing/recientes/items', coleccion: 'breathing/recientes' },
  { items: 'breathing/sesiones/items', coleccion: 'breathing/sesiones' },
])

/** Cuántos documentos se piden por página. */
export const TAMANO_PAGINA = 300

/** Por qué no se pudo, sin un solo código técnico a la vista (RN-EST-04). */
export const MOTIVOS = Object.freeze({
  sinConfiguracion: 'sin_configuracion',
  sinRed: 'sin_red',
  interrumpida: 'interrumpida',
})

// ─── Acceso a Firestore ───────────────────────────────────────────────────────
// Se carga bajo demanda, igual que hace `sync.js`: sin configuración, la app
// funciona entera sin haber tocado el SDK.

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

// ─── La marca de "ya se restauró" ─────────────────────────────────────────────
//
// Vive en `localStorage` y no en `shared/preferences` (DP-17.8): es un hecho
// de este teléfono, no de la cuenta, y subirlo lo convertiría en un dato que
// viaja. Anota **éxitos y solo éxitos**: un fallo es de la sesión (abajo).
//
// No es la única condición del disparo —`ArranqueProvisional` mira también si
// hay árbol—, porque borrar IndexedDB deja `localStorage` intacto y una marca
// sin árbol detrás es una marca huérfana (D13).

function claveDeMarca(uid) {
  return `strivo.restaurado.${uid}`
}

function almacen() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

/** ¿Este dispositivo ya restauró este uid alguna vez? */
export function hayMarcaDeRestauracion(uid) {
  return almacen()?.getItem(claveDeMarca(uid)) != null
}

/** Retira la marca. Para una marca huérfana, y para pruebas. */
export function retirarMarcaDeRestauracion(uid) {
  almacen()?.removeItem(claveDeMarca(uid))
}

function marcar(uid) {
  almacen()?.setItem(claveDeMarca(uid), new Date().toISOString())
}

// ─── El último resultado, por sesión ──────────────────────────────────────────
// Lo consume el botón de reintentar de Perfil (§4.6). Se queda en memoria: un
// fallo es un hecho de esta sesión, no del dispositivo.
//
// Y no necesita persistir, porque un fallo se reproduce solo: `bajar` devuelve
// `ok: false` sin llamar a `marcar(uid)`, y `prepararArbol` (`lib/sesion.js`)
// vuelve a restaurar mientras no haya marca, aunque el árbol local esté
// entero. Guardar el resultado en disco sería una segunda copia de lo que la
// ausencia de marca ya dice, y las dos envejecerían distinto. Lo fijan dos
// pruebas: `restaurar.test.js` («no deja marca, cuenta como fallo y conserva
// lo que ya bajó») y `sesion.test.js` («sin marca pero con árbol, se restaura
// igual»).
//
// DP-17.13, cerrada el 24 de septiembre de 2026 sin cambio de código.

const ultimos = new Map()

/** @returns {?{ok: boolean, escritos: number, fusionados: number, motivo?: string}} */
export function ultimoResultado(uid) {
  return ultimos.get(uid) ?? null
}

/** Solo para pruebas. */
export function olvidarResultados() {
  ultimos.clear()
}

/**
 * Olvida todo lo que este teléfono sabe de la restauración de un uid: la marca
 * y el último resultado. Lo llama cerrar sesión, después de `borrarUid`
 * (`local.js`): una marca sin árbol detrás sería una marca huérfana, y un
 * resultado de una sesión cerrada no le dice nada a la siguiente. Solo ese uid.
 */
export function olvidarUid(uid) {
  retirarMarcaDeRestauracion(uid)
  ultimos.delete(uid)
}

// ─── Aviso al terminar ────────────────────────────────────────────────────────
//
// Una restauración puede terminar cuando ya nadie la espera: la que cruzó el
// techo de 15 s, la del reintento al volver la red, la del botón de Perfil.
// La puerta del onboarding y el bloque de sincronización tienen que enterarse
// para releerse (DP-17.11, DP-17.14), y este es el único sitio por el que
// pasan todas. Avisa con éxito y con fallo: un fallo también cambia lo que el
// bloque de sincronización tiene que decir.

const oyentes = new Set()

/**
 * Suscribe una función a cada restauración que termine, con `(uid, resultado)`.
 *
 * Un oyente que lance no rompe la restauración ni a los demás oyentes: el aviso
 * es un efecto lateral, y lo escrito ya está escrito.
 *
 * @returns {() => void} la desuscripción.
 */
export function alTerminarRestauracion(fn) {
  oyentes.add(fn)
  return () => oyentes.delete(fn)
}

function avisar(uid, resultado) {
  for (const fn of [...oyentes]) {
    try {
      fn(uid, resultado)
    } catch {
      // Ver arriba: un oyente roto no es asunto de la restauración.
    }
  }
}

// ─── La restauración ──────────────────────────────────────────────────────────

/**
 * Baja `users/{uid}/**` de Firestore al almacén local.
 *
 * @param {string} uid
 * @returns {Promise<{ok: boolean, escritos: number, fusionados: number, motivo?: string}>}
 *   `escritos` son las rutas que no existían aquí y se escribieron (regla 1);
 *   `fusionados`, las que existían y en las que ganó lo remoto (regla 2 o 3).
 *   Lo que se conservó tal cual no se cuenta: no pasó nada.
 */
export async function restaurar(uid) {
  assertUid(uid)
  const cuenta = { escritos: 0, fusionados: 0 }

  const resultado = await bajar(uid, cuenta)
  ultimos.set(uid, resultado)
  avisar(uid, resultado)
  return resultado
}

async function bajar(uid, cuenta) {
  if (!isOnline()) return { ok: false, motivo: MOTIVOS.sinRed, ...cuenta }

  const f = await getFirestoreHandles()
  if (!f) return { ok: false, motivo: MOTIVOS.sinConfiguracion, ...cuenta }

  try {
    for (const { doc, coleccion, id } of DOCUMENTOS) {
      const path = `users/${uid}/${doc}`
      const snap = await f.getDoc(f.doc(f.db, path))
      if (snap.exists()) await aplicar({ uid, path, coleccion, id, data: snap.data() }, cuenta)
    }

    for (const { items, coleccion } of SUBCOLECCIONES) {
      const ruta = `users/${uid}/${items}`
      let ultimo = null
      for (;;) {
        const partes = [f.collection(f.db, ruta), f.orderBy(f.documentId()), f.limit(TAMANO_PAGINA)]
        if (ultimo) partes.push(f.startAfter(ultimo))
        const pagina = await f.getDocs(f.query(...partes))

        for (const snap of pagina.docs) {
          await aplicar(
            { uid, path: `${ruta}/${snap.id}`, coleccion, id: snap.id, data: snap.data() },
            cuenta,
          )
        }

        if (pagina.docs.length < TAMANO_PAGINA) break
        ultimo = pagina.docs[pagina.docs.length - 1]
      }
    }
  } catch {
    // Sin marca: el siguiente arranque la repite entera. Lo que ya bajó se
    // queda —está escrito por ruta y volver a bajarlo no duplica nada—.
    return { ok: false, motivo: MOTIVOS.interrumpida, ...cuenta }
  }

  marcar(uid)
  return { ok: true, ...cuenta }
}

/**
 * Los hechos del expediente que no se deshacen (SPEC_19 §3.7): haber terminado
 * el onboarding y haber visto la presentación. Si cualquiera de los dos lados
 * lo trae, el resultado lo conserva.
 */
const HECHOS_DEL_EXPEDIENTE = Object.freeze(['completedAt', 'tourCompletedAt'])

/**
 * Lo que el perdedor sabe y al ganador le falta: los hechos del expediente que
 * el perdedor trae no nulos y el ganador trae nulos o no trae.
 */
function hechosQueFaltan(ganador, perdedor) {
  const faltan = {}
  for (const campo of HECHOS_DEL_EXPEDIENTE) {
    if (perdedor?.[campo] != null && ganador?.[campo] == null) faltan[campo] = perdedor[campo]
  }
  return faltan
}

/**
 * Un documento remoto contra lo que hay en su ruta. Regla 1 si no hay nada;
 * `ganaRemoto` si lo hay. **Sin validadores y sin cola**: ver la cabecera.
 *
 * **`shared/onboarding` es la única fusión por campo de toda la bajada**, y es
 * a propósito. Las reglas del §2 eligen un documento entero, y aquí eso podía
 * deshacer un hecho: un expediente local más nuevo —un paso de P7 en otro
 * teléfono, un `currentStep` cualquiera— con `completedAt: null` le ganaba al
 * remoto que decía que el onboarding ya se terminó, y la puerta volvía a
 * abrirse a quien ya había entrado. Terminar el onboarding no tiene vuelta
 * atrás en ningún sitio del producto, así que la fusión tampoco puede dársela.
 * Gana quien gane, el documento conserva `completedAt` y `tourCompletedAt` si
 * alguno de los dos lados los trae; el resto de campos son los del ganador.
 *
 * Y cuando hubo que añadir uno, el resultado **se encola**: ya no es lo que hay
 * en la nube —le falta o le sobra ese hecho— y sin subirlo la nube seguiría
 * diciendo lo contrario. Pasa en los dos sentidos: gana lo local y el hecho
 * venía de la nube, o gana la nube y el hecho solo lo tenía este teléfono.
 */
async function aplicar({ uid, path, coleccion, id, data }, cuenta) {
  const local = await readPath(path)
  if (local === null) {
    await writePath({ uid, path, collection: coleccion, id, data, sync: false })
    cuenta.escritos += 1
    return
  }

  const gana = ganaRemoto(coleccion, local, data)

  if (coleccion === 'shared' && id === 'onboarding') {
    const faltan = gana ? hechosQueFaltan(data, local) : hechosQueFaltan(local, data)
    if (Object.keys(faltan).length > 0) {
      const ganador = gana ? data : local
      await writePath({ uid, path, collection: coleccion, id, data: { ...ganador, ...faltan } })
      if (gana) cuenta.fusionados += 1
      return
    }
  }

  if (gana) {
    await writePath({ uid, path, collection: coleccion, id, data, sync: false })
    cuenta.fusionados += 1
  }
}
