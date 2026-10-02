// src/lib/entradaCuenta.js
// Entrar a una cuenta que ya existía, sin destruir nada (SPEC_19 §3.4,
// DP-19.5, DP-19.7).
//
// Se aplica siempre que la sesión pasa de un uid de origen —`local-…`, o una
// cuenta vencida— a una cuenta que ya existía: desde Perfil en 19.1, desde P7
// en 19.2, y al arrancar cuando Firebase tiene un usuario y `localStorage` dice
// otro uid (fila 3 de la tabla de `resolverSesion`).
//
// **Una cuenta recién creada no pasa por aquí**: no tiene nada que bajar, y
// para ella sigue valiendo `adoptarArbol` (`lib/cuenta.js`). Lo decide quien
// llama, con el campo `nueva` que devuelven `crearConCorreo` y
// `entrarConProveedor`.
//
// ─── El algoritmo ────────────────────────────────────────────────────────────
//
//   1. **Restaurar primero**, con el techo de siempre: lo de la cuenta baja a
//      su uid con las reglas de 17A, y así la mudanza decide contra lo que la
//      cuenta tiene de verdad y no contra un árbol vacío.
//   2. **Mudar después, fila a fila** (`ganaOrigenAlMudar`): en `shared/*` gana
//      la cuenta salvo que lo suyo sea semilla; en lo demás gana lo más nuevo.
//      Lo que pierde se queda bajo el uid de origen: no se borra.
//   3. **Si la restauración no terminó** —sin red, interrumpida o techo—,
//      `shared/*` del origen no se muda. Sin saber qué tiene la cuenta, mudar
//      el perfil anónimo podría acabar pisando en la nube el de verdad, que es
//      DP-17.10 por otra puerta. El resto se muda con la regla de siempre
//      contra lo que haya en local; la marca no se puso, así que el siguiente
//      arranque restaura.
//   4. Se anota el correo, como en `adoptarArbol`.
//
// **Residuo aceptado:** cuando dos versiones del mismo día chocan, la más
// vieja deja de verse. Si era la anónima, sigue en IndexedDB bajo su uid. Es
// la misma regla que ya rige entre dos teléfonos con la misma cuenta.

import { mudarUid, restaurar, shared } from './db/index.js'
import { ganaOrigenAlMudar } from './db/conflictos.js'
import { TECHO_DE_ESPERA_MS, conTecho } from './sesion.js'

/** Con la restauración a medias, `shared/*` se queda donde está (punto 3). */
function sinTocarShared(coleccion, origen, destino) {
  return coleccion !== 'shared' && ganaOrigenAlMudar(coleccion, origen, destino)
}

/**
 * @param {string} uidOrigen - el uid desde el que se entra.
 * @param {{uid: string, email?: ?string}} cuenta - la cuenta a la que se entra.
 * @param {object} [opciones]
 * @param {(activa: boolean) => void} [opciones.enRestauracion] - pone y quita
 *   la frase de restauración, como en `prepararArbol`.
 * @param {number} [opciones.techoMs=TECHO_DE_ESPERA_MS]
 * @returns {Promise<{uid: string, mudados: number, conservados: number, restauracion: ?object}>}
 *   `uid` es el de la cuenta. Si la mudanza misma falla, es el de origen: lo
 *   escrito sigue donde estaba y quien llama no cambia de uid.
 */
export async function entrarACuenta(
  uidOrigen,
  cuenta,
  { enRestauracion, techoMs = TECHO_DE_ESPERA_MS } = {},
) {
  // La misma cuenta que estaba vencida: no hay nada que bajar ni que mudar.
  // Vuelve la sesión, y con ella la cola (§3.7).
  if (uidOrigen === cuenta.uid) {
    return { uid: cuenta.uid, mudados: 0, conservados: 0, restauracion: null }
  }

  let restauracion = null
  enRestauracion?.(true)
  try {
    restauracion = await conTecho(restaurar(cuenta.uid), techoMs)
  } finally {
    enRestauracion?.(false)
  }

  const politica = restauracion?.ok === true ? ganaOrigenAlMudar : sinTocarShared

  try {
    const { mudados, conservados } = await mudarUid(uidOrigen, cuenta.uid, { politica })
    // El teléfono, si la cuenta ya lo tenía, no lo borra una entrada con correo.
    const anterior = await shared.getAuthRecord(cuenta.uid)
    await shared.saveAuthRecord(cuenta.uid, {
      uid: cuenta.uid,
      email: cuenta.email ?? anterior?.email ?? null,
      phone: anterior?.phone ?? null,
    })
    return { uid: cuenta.uid, mudados, conservados, restauracion }
  } catch {
    return { uid: uidOrigen, mudados: 0, conservados: 0, restauracion }
  }
}
