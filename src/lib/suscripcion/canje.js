// src/lib/suscripcion/canje.js
// «Tengo un código» (SPEC_25B, DP-25.24 y DP-25.25).
//
// El descuento lo define, lo valida y lo cobra Apple. Aquí solo se arma el
// enlace del App Store y se mira, al volver, si el derecho llegó. **La clave no
// se guarda en ningún sitio** ni sale a otro lado que la URL: lo que se recuerda
// es que hubo un intento y con qué producto se fue la persona.
//
// Sin React y sin el plugin: todo entra por argumentos.

import { DERECHO } from '../compras.js'

/** La app en App Store Connect. */
export const ID_DE_LA_APP = '6836996054'

/** Cuándo se pregunta al volver, contado desde la vuelta. */
export const ESPERAS_MS = Object.freeze([0, 2000, 5000, 10000])

/** La clave como la quiere Apple: sin espacios alrededor y en mayúsculas. */
export function normalizarClave(texto) {
  return String(texto ?? '')
    .trim()
    .toUpperCase()
}

/** El enlace de canje, o `null` si no hay clave. */
export function urlDeCanje(texto) {
  const clave = normalizarClave(texto)
  if (!clave) return null
  return `https://apps.apple.com/redeem?ctx=offercodes&id=${ID_DE_LA_APP}&code=${encodeURIComponent(clave)}`
}

/** El producto que da el derecho ahora mismo, o `null`. */
export function productoActivo(info) {
  const derecho = info?.entitlements?.active?.[DERECHO]
  return derecho?.isActive === true ? derecho.productIdentifier : null
}

/**
 * ¿Cambió algo desde que se fue? Quien ya tenía el Mensual solo lo nota si
 * pasa a otro plan: tener derecho no basta.
 */
export function canjeAplicado(antes, info) {
  const ahora = productoActivo(info)
  return ahora !== null && ahora !== antes
}

// ─── El intento, solo en memoria ─────────────────────────────────────────────

let intento = null

/** Anota que la app abrió un canje, y con qué producto se fue la persona. */
export function empezarCanje(info) {
  intento = { antes: productoActivo(info) }
}

/** Entrega el intento en curso y lo olvida: se mira una vez por canje. */
export function tomarIntento() {
  const actual = intento
  intento = null
  return actual
}

const dormir = (ms) => new Promise((listo) => setTimeout(listo, ms))

/**
 * Al volver: se sincroniza una vez y se pregunta hasta diez segundos. El
 * recibo de Apple puede tardar.
 *
 * @param {object} datos
 * @param {{antes: ?string}} datos.intento
 * @param {() => Promise<unknown>} datos.sincronizar
 * @param {() => Promise<?object>} datos.info
 * @returns {Promise<boolean>} ¿quedó aplicado?
 */
export async function esperarCanje({
  intento: suyo,
  sincronizar,
  info,
  esperas = ESPERAS_MS,
  esperar = dormir,
}) {
  // Con una red colgada, sincronizar no detiene las preguntas.
  Promise.resolve()
    .then(sincronizar)
    .catch(() => {})
  let pasado = 0
  for (const momento of esperas) {
    if (momento > pasado) await esperar(momento - pasado)
    pasado = momento
    if (canjeAplicado(suyo.antes, await info().catch(() => null))) return true
  }
  return false
}
