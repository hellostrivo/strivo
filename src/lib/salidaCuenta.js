// src/lib/salidaCuenta.js
// Cerrar sesión sin perder lo que no subió (SPEC_19 §3.5, DP-19.1).
//
// Salir borra del teléfono todo lo de esa cuenta: es lo que necesita la
// siguiente persona en un teléfono compartido. Y por eso mismo **no se sale
// con la cola pendiente**: borrar ahí sería perder lo que todavía no llegó a la
// nube, y eso es lo único que este producto no se permite (no-negociable 4).
//
// Son dos pasos, y los dos miran la cola:
//
//   1. `comprobarSalida` intenta subir lo pendiente y dice si queda algo. Es lo
//      que decide qué confirmación se enseña: la normal, o la que explica que
//      hay cosas sin subir y solo ofrece quedarse.
//   2. `salirDeCuenta` **vuelve a comprobarlo** antes de tocar nada. Entre la
//      confirmación y el toque puede haberse escrito algo —el autoguardado de
//      otra pestaña, una escritura en vuelo—, y una regla que se comprobara
//      solo al abrir el diálogo dejaría ese hueco.
//
// Lo que no hace, a propósito: acuñar el uid local nuevo ni sembrar su árbol.
// Eso es de `ArranqueProvisional`, el único que escribe `strivo.uid.local`.

import { borrarUid, flush, flushEnCurso, getPendingCount, olvidarUid } from './db/index.js'
import { cancelRetries } from './db/sync.js'
import { cerrarSesion } from './cuenta.js'

/** Qué confirmación toca. */
export const SALIDA = Object.freeze({ libre: 'libre', pendiente: 'pendiente' })

/**
 * Intenta subir lo pendiente y dice si queda algo.
 *
 * Si ya había un vaciado en marcha, espera a que termine antes de contar:
 * contar a mitad diría "pendiente" de algo que estaba subiendo.
 *
 * @returns {Promise<'libre'|'pendiente'>}
 */
export async function comprobarSalida(uid) {
  const resultado = await flush(uid)
  if (resultado.skipped === 'en_curso') await flushEnCurso()
  return (await getPendingCount(uid)) > 0 ? SALIDA.pendiente : SALIDA.libre
}

/**
 * Cierra la sesión y borra del teléfono todo lo del uid, solo con la cola vacía.
 *
 * El orden importa: primero se cierra la sesión —si eso fallara, no se ha
 * borrado nada— y después se borra. `pinConfig` se va con lo demás; el copy de
 * la confirmación lo dice.
 *
 * @returns {Promise<{ok: boolean, motivo?: 'pendiente'}>}
 */
export async function salirDeCuenta(uid) {
  if ((await comprobarSalida(uid)) === SALIDA.pendiente) {
    return { ok: false, motivo: SALIDA.pendiente }
  }
  cancelRetries()
  await cerrarSesion()
  await borrarUid(uid)
  olvidarUid(uid)
  return { ok: true }
}
