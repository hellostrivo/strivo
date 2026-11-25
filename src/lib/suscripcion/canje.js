// src/lib/suscripcion/canje.js
// «Tengo un código» (SPEC_25B, DP-25.24 y DP-25.25).
//
// El descuento lo define, lo valida y lo cobra Apple. Aquí solo se arma el
// enlace del App Store y se mira, al volver, si llegó el Anual. **La clave no
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

/** El único plan que dan las claves (DP-25.7). */
export const PRODUCTO_DEL_CODIGO = 'strivo_anual'

/** Cuánto puede ir atrasado o adelantado el reloj del teléfono frente a Apple. */
export const MARGEN_DE_RELOJ_MS = 2 * 60 * 1000

function compradoEn(info) {
  const derecho = info?.entitlements?.active?.[DERECHO]
  const ms = derecho?.latestPurchaseDateMillis ?? Date.parse(derecho?.latestPurchaseDate)
  return Number.isFinite(ms) ? ms : null
}

/**
 * ¿Lo que hay ahora es el Anual de este código? Tiene que ser el Anual **y**
 * haberse comprado después de irse al App Store.
 *
 * Sincronizar trae también lo que el Apple ID ya tenía: con una clave inventada
 * volvió un Fundador de antes y se dijo «Listo» (H3, 25 nov 2026). Que haya
 * derecho, o que cambiara, no prueba nada.
 */
export function canjeAplicado(intento, info) {
  if (productoActivo(info) !== PRODUCTO_DEL_CODIGO) return false
  if (intento.antes === PRODUCTO_DEL_CODIGO) return false
  const cuando = compradoEn(info)
  return cuando !== null && cuando >= intento.desde - MARGEN_DE_RELOJ_MS
}

/** Qué pasó al volver. */
export const RESULTADO = Object.freeze({
  aplicado: 'aplicado',
  recuperado: 'recuperado',
  nada: 'nada',
})

// ─── El intento, solo en memoria ─────────────────────────────────────────────

let intento = null

/** Anota que la app abrió un canje, y con qué producto se fue la persona. */
export function empezarCanje(info, ahora = Date.now()) {
  intento = { antes: productoActivo(info), desde: ahora }
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
 * @param {{antes: ?string, desde: number}} datos.intento
 * @param {() => Promise<unknown>} datos.sincronizar
 * @param {() => Promise<?object>} datos.info
 * @returns {Promise<string>} `aplicado`, `recuperado` —apareció otra compra, que ya
 *   era de este Apple ID— o `nada`.
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
  let ultimo = null
  for (const momento of esperas) {
    if (momento > pasado) await esperar(momento - pasado)
    pasado = momento
    ultimo = (await info().catch(() => null)) ?? ultimo
    if (canjeAplicado(suyo, ultimo)) return RESULTADO.aplicado
  }
  const producto = productoActivo(ultimo)
  return producto !== null && producto !== suyo.antes ? RESULTADO.recuperado : RESULTADO.nada
}
