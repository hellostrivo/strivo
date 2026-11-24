// src/lib/suscripcion/estado.js
// En qué estado está la suscripción de esta persona (SPEC_25). **Puro**: el
// reloj, lo que dice la tienda y la fecha de inicio entran por argumentos.
//
// El orden manda (SPEC_25 §6.4): un derecho activo gana siempre a la prueba.
//
//   web       — aquí no hay compras: se porta como siempre. **DP-25.12 vive
//               solo aquí**: cuando se decida DP-21.5, se cambia en este sitio.
//   cargando  — todavía no se sabe. Se puede escribir.
//   fundador  — el pago único.
//   activa    — una suscripción con derecho.
//   prueba    — los primeros siete días.
//   lectura   — se lee todo y no se escribe nada nuevo.
//
// **Los días son de calendario y el primero es el de empezar** (D4): el último
// día de prueba es el séptimo, y «hasta el {fecha}» nombra ese día. El cambio
// de día lo decide `diaTerminaA`, como en el diario: quien escribe a la una de
// la madrugada sigue en el día que está viviendo.

import { strivoDateKey, toDateKey } from '../db/dates.js'
import { DERECHO } from '../compras.js'

/** Cuántos días dura la prueba. Solo aquí. */
export const DIAS_DE_PRUEBA = 7

/** El día en que se ofrece la tarjeta «Tu prueba termina mañana». */
export const DIA_DE_LA_TARJETA = DIAS_DE_PRUEBA - 1

export const ESTADOS = Object.freeze({
  web: 'web',
  cargando: 'cargando',
  fundador: 'fundador',
  activa: 'activa',
  prueba: 'prueba',
  lectura: 'lectura',
})

/** Qué plan es cada producto de la tienda. */
const PLAN_DE = Object.freeze({ strivo_mensual: 'mensual', strivo_anual: 'anual' })
const PRODUCTO_FUNDADOR = 'strivo_fundador'

/**
 * ¿Se puede escribir? **El único sitio que lo decide.** Solo la lectura cierra
 * el diario y el journal; lo demás de la app no pregunta.
 */
export function puedeEscribir(estado) {
  return estado !== ESTADOS.lectura
}

/** El instante movido tantos días: el desfase del build de diagnóstico. */
export function conDesfase(ahora, dias = 0) {
  if (!dias) return ahora
  const movido = new Date(ahora.getTime())
  movido.setDate(movido.getDate() + dias)
  return movido
}

function fechaDeClave(clave) {
  const [a, m, d] = clave.split('-').map(Number)
  return new Date(a, m - 1, d)
}

function instante(valor) {
  const ms = typeof valor === 'string' ? Date.parse(valor) : NaN
  return Number.isNaN(ms) ? null : new Date(ms)
}

/**
 * Qué día de la prueba es hoy: 1 el de empezar. `null` sin una fecha legible.
 */
export function diaDePrueba(fechaInicioPrueba, { ahora, diaTerminaA } = {}) {
  const inicio = instante(fechaInicioPrueba)
  if (!inicio) return null
  const desde = fechaDeClave(strivoDateKey(diaTerminaA, inicio))
  const hasta = fechaDeClave(strivoDateKey(diaTerminaA, ahora))
  // Se redondea: un cambio de horario hace días de 23 y de 25 horas.
  return Math.round((hasta - desde) / 86400000) + 1
}

/** El último día de la prueba, como fecha local. */
export function ultimoDiaDePrueba(fechaInicioPrueba, { diaTerminaA } = {}) {
  const inicio = instante(fechaInicioPrueba)
  if (!inicio) return null
  return conDesfase(fechaDeClave(strivoDateKey(diaTerminaA, inicio)), DIAS_DE_PRUEBA - 1)
}

/** La clave local de una fecha. */
export function claveDe(fecha) {
  return toDateKey(fecha)
}

/**
 * @param {object} datos
 * @param {?object} datos.customerInfo - lo que dice RevenueCat, o `null`.
 * @param {?string} datos.fechaInicioPrueba - ISO en UTC.
 * @param {Date} datos.ahora
 * @param {number} [datos.desfaseDias] - solo el build de diagnóstico.
 * @param {string} [datos.diaTerminaA]
 * @param {boolean} datos.iphone
 * @param {boolean} [datos.listo] - ¿ya contestaron la tienda y el almacén?
 * @returns {{estado: string, hasta: ?Date, plan: ?string, seRenueva: boolean, dia: ?number}}
 */
export function estadoDeSuscripcion({
  customerInfo,
  fechaInicioPrueba,
  ahora,
  desfaseDias = 0,
  diaTerminaA,
  iphone,
  listo = true,
}) {
  const base = { hasta: null, plan: null, seRenueva: false, dia: null }
  if (!iphone) return { ...base, estado: ESTADOS.web }

  const derecho = customerInfo?.entitlements?.active?.[DERECHO]
  if (derecho?.isActive === true) {
    if (derecho.productIdentifier === PRODUCTO_FUNDADOR) {
      return { ...base, estado: ESTADOS.fundador, plan: 'fundador' }
    }
    return {
      ...base,
      estado: ESTADOS.activa,
      plan: PLAN_DE[derecho.productIdentifier] ?? null,
      hasta: instante(derecho.expirationDate),
      seRenueva: derecho.willRenew === true,
    }
  }

  if (!listo) return { ...base, estado: ESTADOS.cargando }
  const dia = diaDePrueba(fechaInicioPrueba, { ahora: conDesfase(ahora, desfaseDias), diaTerminaA })
  // Sin fecha todavía —la bajada de la cuenta no terminó—, nada se cierra.
  if (dia === null) return { ...base, estado: ESTADOS.cargando }
  return {
    ...base,
    dia,
    estado: dia <= DIAS_DE_PRUEBA ? ESTADOS.prueba : ESTADOS.lectura,
    hasta: ultimoDiaDePrueba(fechaInicioPrueba, { diaTerminaA }),
  }
}
