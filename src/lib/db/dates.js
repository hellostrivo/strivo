// src/lib/db/dates.js
// Clave de fecha del árbol de datos.
//
// RN-DB-01: hay un registro por usuario y fecha, y esa fecha se calcula con
// `diaTerminaA` del perfil, no con la medianoche del sistema. Alguien que
// escribe a la 01:30 con `diaTerminaA = "03:00"` sigue escribiendo en el día
// anterior.
//
// Toda la capa de datos usa estas funciones. No se calculan fechas en ningún
// otro sitio del módulo.

/** Hora a la que termina el día si el perfil todavía no la declara (§7.2). */
export const DEFAULT_DIA_TERMINA_A = '00:00'

/**
 * Convierte "HH:MM" a minutos desde medianoche.
 * @param {string} hhmm
 * @returns {number}
 */
export function timeToMinutes(hhmm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? ''))
  if (!match) return 0
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return 0
  return hours * 60 + minutes
}

/**
 * Formatea una fecha como 'YYYY-MM-DD' en hora local.
 *
 * No se usa `toISOString()`: convierte a UTC y desplaza el día en cualquier
 * zona horaria con desfase negativo.
 *
 * @param {Date} date
 * @returns {string}
 */
export function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Fecha a la que pertenece un instante, según cuándo termina el día del usuario.
 *
 * @param {string} [diaTerminaA] - "HH:MM" del perfil.
 * @param {Date}   [now]         - Instante a resolver. Por defecto, ahora.
 * @returns {string} 'YYYY-MM-DD'
 */
export function strivoDateKey(diaTerminaA = DEFAULT_DIA_TERMINA_A, now = new Date()) {
  const cutoff = timeToMinutes(diaTerminaA)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (cutoff > 0 && currentMinutes < cutoff) {
    const previous = new Date(now.getTime())
    previous.setDate(previous.getDate() - 1)
    return toDateKey(previous)
  }
  return toDateKey(now)
}

/**
 * ¿Es una clave de fecha con forma 'YYYY-MM-DD'?
 * @param {unknown} value
 * @returns {boolean}
 */
export function isDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}
