// src/lib/db/limite.js
// Ninguna espera de red es infinita (SPEC_31, DP-31.2).
//
// En el SDK de Firestore, una escritura sin conexión **no falla: espera** a que
// el servidor la confirme, sin plazo. Con una conexión colgada —no caída:
// `navigator.onLine` sigue diciendo `true`— un `setDoc` puede no volver nunca,
// y con él se quedaba colgado todo lo que esperaba detrás: el vaciado de la
// cola, «Intentar de nuevo» y la comprobación de salida (O-2, 13 minutos).
//
// **Un límite no cancela nada.** La promesa sigue su curso —no hay forma de
// cancelar una operación de Firestore— y quien espera deja de esperarla. Por
// eso pasado el límite una escritura cuenta como fallo y **sigue en la cola**:
// solo se saca de ella con la confirmación de Firestore (no-negociable 4).

/**
 * Cuánto se espera a una escritura o a una lectura de Firestore, como máximo.
 *
 * Diez segundos es el plazo con el que el propio SDK declara al cliente «sin
 * conexión» y hace fallar las lecturas; un `setDoc` sano se confirma en uno o
 * dos, así que el margen es de cinco veces. Y queda por debajo de los 15 s del
 * techo del velo (`TECHO_DE_ESPERA_MS`, `lib/sesion.js`): una lectura que vence
 * deja la restauración en `interrumpida` antes de que el velo se rinda.
 */
export const LIMITE_DE_RED_MS = 10000

/** El error de una espera que venció. Sin código a la vista (RN-EST-04): es interno. */
export class LimiteVencido extends Error {
  constructor(ms) {
    super(`Sin respuesta de la red en ${ms} ms`)
    this.name = 'LimiteVencido'
  }
}

/** ¿Este error es un límite vencido, y no un rechazo de Firestore? */
export function esLimiteVencido(error) {
  return error instanceof LimiteVencido
}

/**
 * La promesa, o un rechazo con `LimiteVencido` si no contesta a tiempo. El
 * temporizador se limpia siempre.
 *
 * @template T
 * @param {Promise<T>} promesa
 * @param {number} [ms=LIMITE_DE_RED_MS]
 * @returns {Promise<T>}
 */
export async function conLimite(promesa, ms = LIMITE_DE_RED_MS) {
  let temporizador = null
  const limite = new Promise((_resolve, reject) => {
    temporizador = setTimeout(() => reject(new LimiteVencido(ms)), ms)
  })
  try {
    return await Promise.race([promesa, limite])
  } finally {
    clearTimeout(temporizador)
  }
}
