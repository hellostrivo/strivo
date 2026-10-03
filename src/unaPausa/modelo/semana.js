// src/unaPausa/modelo/semana.js
// Qué semana es en Monterrey.
//
// Una pausa se publica los lunes a las 00:00 de `America/Monterrey`, y la
// semana va de lunes a domingo. Todo se calcula con `Intl.DateTimeFormat` y la
// zona IANA, **nunca con los métodos locales de `Date`**: el resultado no puede
// depender de la zona del proceso, que en un teléfono es la de quien lo lleva,
// en el build es la del servidor y en esta máquina es, por casualidad, la misma
// de Monterrey —que es justo la forma en que un error así pasaría inadvertido—.
// Una prueba de repo lo impone (`__tests__/sinHoraLocal.test.js`).
//
// Las claves `AAAA-MM-DD` se suman y se comparan como días enteros contados
// desde 1970-01-01 en UTC, que no tiene saltos de horario. Monterrey no tiene
// horario de verano desde 2022, pero aquí no se da por supuesto: el desfase se
// le pregunta a la zona en cada instante.
//
// Sin dependencias nuevas: `date-fns` v3 no sabe de zonas.

export const ZONA = 'America/Monterrey'

/**
 * El cierre de la validación final (DP-28.9, provisional): a más tardar el
 * miércoles previo al lunes de publicación, a las 23:59:59 de Monterrey. Si la
 * fundadora decide otra cosa, cambia esta constante y nada más.
 */
export const LIMITE_VALIDACION_FINAL = Object.freeze({ diasAntes: 5, hora: '23:59:59' })

const MS_POR_DIA = 86_400_000

const PARTES = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const FORMA_DE_CLAVE = /^(\d{4})-(\d{2})-(\d{2})$/

// ISO 8601 con desfase: `Z` o `±HH:MM`. Una marca sin desfase se leería en la
// zona de quien la lee, que es lo que este archivo existe para evitar.
const FORMA_DE_MARCA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/

/** Días desde 1970-01-01 de una clave válida. */
function diasDe(clave) {
  const [, a, m, d] = FORMA_DE_CLAVE.exec(clave)
  return Math.round(Date.UTC(Number(a), Number(m) - 1, Number(d)) / MS_POR_DIA)
}

/** La clave de un número de días desde 1970-01-01. `toISOString` es UTC. */
function claveDe(dias) {
  return new Date(dias * MS_POR_DIA).toISOString().slice(0, 10)
}

/**
 * ¿Es una clave `AAAA-MM-DD` de un día que existe? `2026-02-31` no lo es.
 * @param {unknown} valor
 */
export function esClave(valor) {
  if (typeof valor !== 'string' || !FORMA_DE_CLAVE.test(valor)) return false
  return claveDe(diasDe(valor)) === valor
}

/**
 * ¿Es una marca de tiempo ISO 8601 con desfase, y legible?
 * @param {unknown} valor
 */
export function esMarca(valor) {
  return (
    typeof valor === 'string' && FORMA_DE_MARCA.test(valor) && Number.isFinite(Date.parse(valor))
  )
}

/**
 * Milisegundos de un instante dado como `Date`, número o cadena. `NaN` si no
 * se puede leer.
 */
export function instanteDe(instante) {
  if (instante instanceof Date) return instante.valueOf()
  if (typeof instante === 'number') return instante
  if (typeof instante === 'string') return Date.parse(instante)
  return Number.NaN
}

/** Fecha y hora de pared en Monterrey, como números. */
function paredEnZona(ms) {
  const p = Object.fromEntries(PARTES.formatToParts(ms).map(({ type, value }) => [type, value]))
  return {
    clave: `${p.year}-${p.month}-${p.day}`,
    ms: Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second),
  }
}

/** Cuánto va Monterrey por delante de UTC en ese instante (negativo: por detrás). */
function desfaseEn(ms) {
  const entero = Math.floor(ms / 1000) * 1000
  return paredEnZona(entero).ms - entero
}

/**
 * La clave del día de Monterrey al que pertenece un instante.
 * @param {Date|number|string} instante
 * @returns {string|null}
 */
export function fechaEnZona(instante) {
  const ms = instanteDe(instante)
  if (!Number.isFinite(ms)) return null
  return paredEnZona(ms).clave
}

/**
 * El instante en que en Monterrey es `hora` del día `clave`.
 * @param {string} clave  `AAAA-MM-DD`
 * @param {string} hora   `HH:MM:SS`
 * @returns {number} milisegundos, o `NaN`
 */
export function instanteEnZona(clave, hora = '00:00:00') {
  if (!esClave(clave)) return Number.NaN
  const [h, m, s] = hora.split(':').map(Number)
  const pared = diasDe(clave) * MS_POR_DIA + ((h * 60 + m) * 60 + (s || 0)) * 1000
  // El desfase se mide donde cae la primera estimación y se corrige una vez:
  // si esa hora cruzara un cambio de horario, la segunda medida es la buena.
  const primera = pared - desfaseEn(pared)
  return pared - desfaseEn(primera)
}

/** Lunes = 0 … domingo = 6. El 1970-01-01 fue jueves. */
function indiceDeDia(clave) {
  return (((diasDe(clave) + 3) % 7) + 7) % 7
}

/** ¿Esa clave cae en lunes? */
export function esLunes(clave) {
  return esClave(clave) && indiceDeDia(clave) === 0
}

/**
 * Suma días a una clave, sin pasar por la hora local.
 * @returns {string|null}
 */
export function sumarDias(clave, n) {
  if (!esClave(clave) || !Number.isInteger(n)) return null
  return claveDe(diasDe(clave) + n)
}

/** Resta días a una clave, sin pasar por la hora local. */
export function restarDias(clave, n) {
  return sumarDias(clave, -n)
}

/**
 * La clave del lunes de la semana a la que pertenece un instante en Monterrey.
 * @param {Date|number|string} instante
 * @returns {string|null}
 */
export function lunesDe(instante) {
  const clave = fechaEnZona(instante)
  if (clave === null) return null
  return restarDias(clave, indiceDeDia(clave))
}

/**
 * El último instante en que se puede dar la validación final de la cápsula de
 * esa semana. Cuenta el segundo entero: 23:59:59,999.
 * @param {string} weekStart
 * @returns {number} milisegundos, o `NaN`
 */
export function limiteValidacionFinal(weekStart) {
  const dia = restarDias(weekStart, LIMITE_VALIDACION_FINAL.diasAntes)
  if (dia === null) return Number.NaN
  return instanteEnZona(dia, LIMITE_VALIDACION_FINAL.hora) + 999
}
