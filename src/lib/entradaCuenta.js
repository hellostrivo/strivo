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
//   2. **Mudar después, fila a fila, y solo si la restauración terminó bien**
//      (`ganaOrigenAlMudar`): en `shared/*` gana la cuenta salvo que lo suyo
//      sea semilla; en lo demás gana lo más nuevo. Lo que pierde se queda bajo
//      el uid de origen: no se borra.
//   3. Se anota el correo, como en `adoptarArbol`.
//
// ─── Si la restauración no termina: no se muda nada (F1, 1 oct 2026) ─────────
//
// Sin red, interrumpida o pasado el techo, **no se toca el árbol anónimo**. La
// primera versión mudaba igual todo menos `shared/*`, y eso perdía en la nube:
// contra un destino que todavía no había bajado, las filas con fecha —la
// mañana, la noche, el `dayState` de un día que la cuenta también tenía—
// ganaban sin rival, se encolaban y `sync.js`, que sube con `setDoc` sin
// `merge`, las escribía encima de la versión de la cuenta aunque esa fuera más
// nueva. Con el techo era peor: la bajada tardía ganaba en local, pero la cola
// ya guardaba la versión vieja y la subía igual. Es DP-17.10 por otra puerta.
//
// Así que la mudanza **se aplaza**: se apunta de qué uid hay que mudar
// (`strivo.mudanzaPendiente.<cuenta>`), la sesión sigue con la cuenta y lo
// anónimo se queda bajo su uid, intacto. Cuando una restauración de esa cuenta
// termine bien —la que cruzó el techo, el reintento al volver la red, el botón
// de Perfil o el siguiente arranque—, `completarMudanzaPendiente` muda con la
// política completa y retira la clave. El correo también espera: `shared/auth`
// se escribe con la mudanza, cuando ya se sabe qué tenía la cuenta.
//
// **Residuo aceptado:** cuando dos versiones del mismo día chocan, la más
// vieja deja de verse. Si era la anónima, sigue en IndexedDB bajo su uid. Es
// la misma regla que ya rige entre dos teléfonos con la misma cuenta.

import {
  MOTIVOS_RESTAURACION,
  alTerminarRestauracion,
  mudarUid,
  restaurar,
  shared,
} from './db/index.js'
import { almacenLocal, claveDeMudanzaPendiente } from './db/local.js'
import { ganaOrigenAlMudar } from './db/conflictos.js'
import { TECHO_DE_ESPERA_MS, conTecho, reintentarAlVolverLaRed } from './sesion.js'

// ─── La mudanza pendiente ─────────────────────────────────────────────────────

/** El uid de origen de la mudanza pendiente hacia esta cuenta, o `null`. */
export function mudanzaPendiente(uidCuenta) {
  return almacenLocal()?.getItem(claveDeMudanzaPendiente(uidCuenta)) ?? null
}

function apuntarMudanza(uidCuenta, uidOrigen) {
  almacenLocal()?.setItem(claveDeMudanzaPendiente(uidCuenta), uidOrigen)
}

function retirarMudanza(uidCuenta) {
  almacenLocal()?.removeItem(claveDeMudanzaPendiente(uidCuenta))
}

/**
 * Muda el árbol con la política completa y anota el correo: los pasos 2 y 3
 * del algoritmo. Con `siVacio: false`, si el origen no tenía nada que mudar no
 * escribe nada y devuelve `null`.
 */
async function mudarYAnotar(uidOrigen, uidCuenta, email, { siVacio = true } = {}) {
  const { mudados, conservados } = await mudarUid(uidOrigen, uidCuenta, {
    politica: ganaOrigenAlMudar,
  })
  if (!siVacio && mudados + conservados === 0) return null
  // El teléfono, si la cuenta ya lo tenía, no lo borra una entrada con correo.
  const anterior = await shared.getAuthRecord(uidCuenta)
  await shared.saveAuthRecord(uidCuenta, {
    uid: uidCuenta,
    email: email ?? anterior?.email ?? null,
    phone: anterior?.phone ?? null,
  })
  return { mudados, conservados }
}

/** Las mudanzas pendientes en curso, por cuenta: dos disparos a la vez son uno. */
const EN_CURSO = new Map()

/**
 * Hace la mudanza que quedó pendiente hacia una cuenta, si la hay.
 *
 * **Solo se llama con la restauración de esa cuenta terminada bien**: es lo que
 * hace que la política decida contra lo que la cuenta tiene de verdad. La
 * clave se retira al terminar, así que una segunda restauración correcta no la
 * repite. Si el uid de origen ya no tiene filas —se mudaron, o se borraron—,
 * la clave se retira sin hacer nada más.
 *
 * @param {string} uidCuenta
 * @param {object} [opciones]
 * @param {?string} [opciones.email] - el correo de la sesión, para `shared/auth`.
 * @returns {Promise<?{mudados: number, conservados: number}>} `null` si no
 *   había nada pendiente o no había nada que mudar.
 */
export function completarMudanzaPendiente(uidCuenta, { email = null } = {}) {
  const enCurso = EN_CURSO.get(uidCuenta)
  if (enCurso) return enCurso

  const promesa = (async () => {
    const origen = mudanzaPendiente(uidCuenta)
    if (!origen) return null
    if (origen === uidCuenta) {
      retirarMudanza(uidCuenta)
      return null
    }
    const r = await mudarYAnotar(origen, uidCuenta, email, { siVacio: false })
    retirarMudanza(uidCuenta)
    return r
  })().finally(() => EN_CURSO.delete(uidCuenta))

  EN_CURSO.set(uidCuenta, promesa)
  return promesa
}

/**
 * Escucha las restauraciones que terminan y completa la mudanza pendiente de
 * la cuenta restaurada, si la tiene. La monta `ArranqueProvisional` mientras la
 * app está abierta.
 *
 * @param {object} opciones
 * @param {() => ?string} [opciones.correo] - el correo de la sesión, leído al mudar.
 * @param {(uidCuenta: string) => void} [opciones.alMudar] - después de mudar,
 *   para que la pantalla relea (el sello de restauración).
 * @returns {() => void} la desuscripción.
 */
export function escucharMudanzasPendientes({ correo = () => null, alMudar } = {}) {
  return alTerminarRestauracion((uid, resultado) => {
    if (!resultado?.ok || !mudanzaPendiente(uid)) return
    completarMudanzaPendiente(uid, { email: correo() })
      .then((r) => {
        if (r) alMudar?.(uid)
      })
      .catch(() => {
        // La clave sigue puesta: la siguiente restauración lo vuelve a intentar.
      })
  })
}

/**
 * Si una entrada quedó aplazada **por falta de red**, deja un reintento para
 * cuando vuelva (F3), igual que hace `prepararArbol` con la restauración del
 * arranque: un solo evento, un solo intento, sin temporizador. Si ese intento
 * termina bien, `escucharMudanzasPendientes` completa la mudanza.
 *
 * Con cualquier otro motivo no: volver la red no arreglaría nada. Y con el
 * techo tampoco —`restauracion` es `null`—, porque la bajada sigue en marcha y
 * avisará ella sola al terminar.
 *
 * @returns {?(() => void)} la función que retira el oyente, o `null`.
 */
export function reintentarEntradaAlVolverLaRed(entrada, uidCuenta, correr) {
  if (!entrada?.pendiente) return null
  if (entrada.restauracion?.motivo !== MOTIVOS_RESTAURACION.sinRed) return null
  return reintentarAlVolverLaRed(uidCuenta, correr)
}

// ─── La entrada ───────────────────────────────────────────────────────────────

/**
 * @param {string} uidOrigen - el uid desde el que se entra.
 * @param {{uid: string, email?: ?string}} cuenta - la cuenta a la que se entra.
 * @param {object} [opciones]
 * @param {(activa: boolean) => void} [opciones.enRestauracion] - pone y quita
 *   la frase de restauración, como en `prepararArbol`.
 * @param {number} [opciones.techoMs=TECHO_DE_ESPERA_MS]
 * @returns {Promise<{uid: string, mudados: number, conservados: number, restauracion: ?object, pendiente: boolean}>}
 *   `uid` es el de la cuenta, también con la mudanza aplazada (`pendiente`).
 *   Si la mudanza misma falla, es el de origen: lo escrito sigue donde estaba
 *   y quien llama no cambia de uid.
 */
export async function entrarACuenta(
  uidOrigen,
  cuenta,
  { enRestauracion, techoMs = TECHO_DE_ESPERA_MS } = {},
) {
  // La misma cuenta que estaba vencida: no hay nada que bajar ni que mudar.
  // Vuelve la sesión, y con ella la cola (§3.7).
  if (uidOrigen === cuenta.uid) {
    return { uid: cuenta.uid, mudados: 0, conservados: 0, restauracion: null, pendiente: false }
  }

  // Esta entrada se encarga de este origen: una clave vieja que apuntara a él
  // dispararía la misma mudanza dos veces en cuanto la restauración avisara.
  if (mudanzaPendiente(cuenta.uid) === uidOrigen) retirarMudanza(cuenta.uid)

  let restauracion = null
  enRestauracion?.(true)
  try {
    restauracion = await conTecho(restaurar(cuenta.uid), techoMs)
  } finally {
    enRestauracion?.(false)
  }

  if (restauracion?.ok !== true) {
    apuntarMudanza(cuenta.uid, uidOrigen)
    return { uid: cuenta.uid, mudados: 0, conservados: 0, restauracion, pendiente: true }
  }

  try {
    const { mudados, conservados } = await mudarYAnotar(uidOrigen, cuenta.uid, cuenta.email)
    return { uid: cuenta.uid, mudados, conservados, restauracion, pendiente: false }
  } catch {
    return { uid: uidOrigen, mudados: 0, conservados: 0, restauracion, pendiente: false }
  }
}
