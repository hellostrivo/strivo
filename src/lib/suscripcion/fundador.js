// src/lib/suscripcion/fundador.js
// ¿Sale la tarjeta del Fundador? (SPEC_25, DP-25.15). Pura.
//
// La ventana vive en el panel de RevenueCat, en el metadata del offering
// `fundador`: `{ "mostrar": true, "hasta": "2027-01-15" }`. Cualquier cosa rara
// —sin metadata, mal escrito, sin producto— es que no sale, sin error.

import { ESTADOS, claveDe } from './estado.js'

const FECHA = /^\d{4}-\d{2}-\d{2}$/

/**
 * @param {object} datos
 * @param {?object} datos.metadata
 * @param {?object} datos.paquete - el `lifetime` del offering `fundador`.
 * @param {string} datos.estado - solo en prueba o en lectura.
 * @param {Date} datos.ahora - `hasta` incluye ese día, en hora local.
 */
export function mostrarFundador({ metadata, paquete, estado, ahora }) {
  if (estado !== ESTADOS.prueba && estado !== ESTADOS.lectura) return false
  if (!paquete?.product?.priceString) return false
  if (metadata?.mostrar !== true) return false
  const { hasta } = metadata
  if (typeof hasta !== 'string' || !FECHA.test(hasta)) return false
  return claveDe(ahora) <= hasta
}
