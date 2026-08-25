// src/diario/fechas.js
// Presentación de fechas en Lumia: el saludo, el encabezado del Diario y el
// nombre del día que abre la noche.
//
// Las claves de fecha ('YYYY-MM-DD') las calcula la capa de datos con
// `strivoDateKey`, que respeta `diaTerminaA` (RN-DB-01). Aquí solo se pintan.
//
// Una clave de fecha nunca se pasa a `new Date(cadena)`: eso la interpreta en
// UTC y adelanta o atrasa el día en media Europa y toda América.

const LOCALE = 'es'

/** 'YYYY-MM-DD' → Date local a mediodía, lejos de cualquier salto de horario. */
export function fechaDeClave(dateKey) {
  const [year, month, day] = String(dateKey ?? '')
    .split('-')
    .map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, 12, 0, 0)
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** 'Jueves, 24 de julio de 2026' (§5.3, Bloque 1). */
export function fechaLarga(dateKey) {
  const fecha = fechaDeClave(dateKey)
  if (!fecha) return ''
  const texto = fecha.toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return capitalizar(texto)
}

/** '24 de julio' — para "Reflexiones del 24 de julio" (§5.4, Bloque 6). */
export function fechaCorta(dateKey) {
  const fecha = fechaDeClave(dateKey)
  if (!fecha) return ''
  return fecha.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' })
}

/** 'jueves' — para "Vamos a cerrar el jueves." (§5.4, Bloque 1). */
export function diaDeLaSemana(dateKey) {
  const fecha = fechaDeClave(dateKey)
  if (!fecha) return ''
  return fecha.toLocaleDateString(LOCALE, { weekday: 'long' })
}

/**
 * Fecha y hora local, con su desfase horario.
 *
 * La escriben la mañana y la noche en `updatedAt` y en `completedAt`. No se usa
 * `toISOString()`: normaliza a UTC y perdería justamente el dato que se pide,
 * que es a qué hora era esto para quien lo escribió.
 */
export function marcaLocal(ahora = new Date()) {
  const dos = (n) => String(n).padStart(2, '0')
  const desfase = -ahora.getTimezoneOffset()
  const signo = desfase >= 0 ? '+' : '-'
  const abs = Math.abs(desfase)
  const dia = `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`
  const hora = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}`
  return `${dia}T${hora}${signo}${dos(Math.floor(abs / 60))}:${dos(abs % 60)}`
}

/** Desplaza una clave de fecha tantos días como se le pida, hacia donde sea. */
export function sumarDias(dateKey, dias) {
  const fecha = fechaDeClave(dateKey)
  if (!fecha) return dateKey
  fecha.setDate(fecha.getDate() + dias)
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** El día siguiente de una clave de fecha. Lo usa "Pasarla a mañana". */
export function diaSiguiente(dateKey) {
  return sumarDias(dateKey, 1)
}

/**
 * Franja del saludo por hora local (§5.3, Bloque 1):
 * 4:00–11:59 mañana · 12:00–18:59 tarde · 19:00–3:59 noche.
 *
 * Es solo para el saludo. El **tema** de la pantalla Hoy no depende de la hora
 * en ningún caso (RN-HOY-05).
 */
export function franjaDelSaludo(now = new Date()) {
  const hora = now.getHours()
  if (hora >= 4 && hora < 12) return 'manana'
  if (hora >= 12 && hora < 19) return 'tarde'
  return 'noche'
}
