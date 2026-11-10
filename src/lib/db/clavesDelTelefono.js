// src/lib/db/clavesDelTelefono.js
// Los hechos del teléfono que viven en `localStorage`, y su copia en SQLite
// (SPEC_17B, DP-17B.4).
//
// Son tres familias de claves:
//
//   strivo.uid.local                — el uid de este teléfono (`ArranqueProvisional`)
//   strivo.restaurado.<uid>         — la marca de restauración (`restaurar.js`)
//   strivo.mudanzaPendiente.<uid>   — la mudanza aplazada (`entradaCuenta.js`, `borrarUid`)
//
// **`localStorage` vive en el mismo sitio que IndexedDB**: si iOS limpia el
// almacén del WebView, se va con él. Con los días ya en SQLite, perder el uid
// sería peor que perder los días: `uidLocal()` acuñaría uno nuevo, aparecería
// la bienvenida y el diario quedaría en SQLite bajo un uid que nadie lee. Por
// eso, en la app nativa, cada escritura de estas claves se copia también en la
// tabla `claves` de SQLite, y al arrancar se recuperan **antes** de que nadie
// lea el uid (`reconciliarClaves`, que llama `prepararAlmacen`).
//
// **`localStorage` manda mientras tenga el uid.** La copia de SQLite solo se
// usa para recuperar cuando el uid falta, que es la señal de que el almacén del
// WebView se limpió. Si el uid está, SQLite se iguala a `localStorage`, también
// en lo que se borró: así una marca retirada al cerrar sesión no resucita.
//
// Quien escribe una de estas claves lo hace por aquí, nunca con `localStorage`
// a mano. Qué hace con ellas cada uno sigue siendo de cada uno: este módulo no
// sabe qué es una restauración ni una mudanza.
//
// En la web no hay copia: `fijarEspejo` solo lo llama el arranque nativo.

/** La clave del uid. La escribe `ArranqueProvisional` y nadie más. */
export const CLAVE_UID = 'strivo.uid.local'

const FAMILIAS = Object.freeze([CLAVE_UID, 'strivo.restaurado.', 'strivo.mudanzaPendiente.'])

/** ¿Es una de las claves que se copian? */
export function esClaveDelTelefono(clave) {
  const texto = String(clave ?? '')
  return texto === CLAVE_UID || FAMILIAS.slice(1).some((prefijo) => texto.startsWith(prefijo))
}

/** `localStorage`, o `null` donde no lo hay (pruebas, servidor, almacenamiento bloqueado). */
export function almacenLocal() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

// ─── La copia ─────────────────────────────────────────────────────────────────

let espejo = null

/**
 * Quién copia las claves en SQLite: `fn({ clave, valor })`, con `valor: null`
 * para borrar. Lo pone `prepararAlmacen` cuando SQLite está listo; `null` lo
 * retira.
 */
export function fijarEspejo(fn) {
  espejo = fn
}

function reflejar(clave, valor) {
  if (!espejo || !esClaveDelTelefono(clave)) return
  // La copia no detiene a nadie: lo que manda ya se escribió en `localStorage`.
  // Si no llega, el siguiente arranque iguala SQLite a `localStorage`.
  Promise.resolve()
    .then(() => espejo({ clave, valor }))
    .catch(() => {})
}

// ─── Leer y escribir ──────────────────────────────────────────────────────────

export function leerClave(clave) {
  return almacenLocal()?.getItem(clave) ?? null
}

export function guardarClave(clave, valor) {
  almacenLocal()?.setItem(clave, valor)
  reflejar(clave, String(valor))
}

export function quitarClave(clave) {
  almacenLocal()?.removeItem(clave)
  reflejar(clave, null)
}

/** Las claves que se copian y están en `localStorage` ahora mismo, como `[clave, valor]`. */
export function clavesEnLocal(almacen = almacenLocal()) {
  if (!almacen) return []
  const pares = []
  for (let i = 0; i < almacen.length; i += 1) {
    const clave = almacen.key(i)
    if (esClaveDelTelefono(clave)) pares.push([clave, almacen.getItem(clave)])
  }
  return pares
}

/**
 * Al arrancar, antes de que nadie lea el uid.
 *
 * - Si `localStorage` **no** tiene el uid, se recupera todo lo que guarde
 *   SQLite: el almacén del WebView se limpió y SQLite es lo que queda.
 * - Si lo tiene, SQLite se iguala a `localStorage`: se reemplaza entera la
 *   tabla con lo que hay ahora.
 *
 * @param {{leer: () => Promise<Array<[string, string]>>, reemplazar: (pares) => Promise<void>}} copia
 * @returns {Promise<{recuperadas: number}>}
 */
export async function reconciliarClaves(copia, almacen = almacenLocal()) {
  if (!almacen) return { recuperadas: 0 }
  if (almacen.getItem(CLAVE_UID) == null) {
    const guardadas = (await copia.leer()).filter(([clave]) => esClaveDelTelefono(clave))
    for (const [clave, valor] of guardadas) almacen.setItem(clave, valor)
    return { recuperadas: guardadas.length }
  }
  await copia.reemplazar(clavesEnLocal(almacen))
  return { recuperadas: 0 }
}
