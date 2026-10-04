// src/unaPausa/fecha.js
// Cómo se dice la fecha de una pausa: «7 de diciembre de 2026».
//
// **Sin ningún método local de `Date`** (la prueba de repo de 28.1 cubre todo
// `src/unaPausa/`). La clave `YYYY-MM-DD` es un día del calendario y no un
// instante: se construye en UTC con sus tres números y se formatea en UTC, así
// que el día que se dice es el de la clave en cualquier zona del teléfono.

import { esClave } from './modelo/semana.js'

const FORMATO = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** @returns {string|null} La fecha en palabras, o `null` si no es una clave. */
export function fechaDePausa(clave) {
  if (!esClave(clave)) return null
  const [anio, mes, dia] = clave.split('-').map(Number)
  return FORMATO.format(Date.UTC(anio, mes - 1, dia))
}
