// src/lib/timeSlot.js
// Lógica de franjas horarias de Strivo (§4.3.3, Blueprint v3)
// Determina qué contenido, saludo y acción principal se muestra en "Hoy"
// basándose en la hora local del usuario y sus horarios declarados.

/**
 * Franjas:
 *   amanecer   → desde (despertar - 1h) hasta (despertar + 5h) [límites: 04:00–11:30]
 *   dia        → entre fin de amanecer y (dormir - 4h)
 *   atardecer  → desde (dormir - 4h) hasta la hora de dormir
 *   noche      → hora de dormir hasta las 03:00 (o diaTerminaA del usuario)
 *   madrugada  → 00:00–04:00 (modo silencioso)
 */

/**
 * Convierte "HH:MM" a minutos desde medianoche
 */
export function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Obtiene la franja horaria actual del usuario
 * @param {string} horaDespertar - "HH:MM"
 * @param {string} horaDormir    - "HH:MM"
 * @param {string} diaTerminaA  - "HH:MM" (por defecto "03:00")
 * @returns {'amanecer'|'dia'|'atardecer'|'noche'|'madrugada'}
 */
export function getTimeSlot(horaDespertar = '07:00', horaDormir = '23:00', diaTerminaA = '03:00') {
  const now        = new Date()
  const currentMin = now.getHours() * 60 + now.getMinutes()

  const despertar  = timeToMinutes(horaDespertar)
  const dormir     = timeToMinutes(horaDormir)
  const termina    = timeToMinutes(diaTerminaA)

  // Amanecer: [max(04:00, despertar - 60) .. min(11:30, despertar + 300)]
  const amanecerStart = Math.max(4 * 60, despertar - 60)
  const amanecerEnd   = Math.min(11 * 60 + 30, despertar + 5 * 60)

  // Atardecer: [dormir - 240 .. dormir]
  const atardecerStart = dormir - 4 * 60

  // Noche: [dormir .. termina + 24h si cruza medianoche]
  // Madrugada: [00:00 .. 04:00]
  const madrugadaEnd = 4 * 60

  if (currentMin < madrugadaEnd)               return 'madrugada'
  if (currentMin >= amanecerStart &&
      currentMin <  amanecerEnd)               return 'amanecer'
  if (currentMin >= amanecerEnd &&
      currentMin <  atardecerStart)            return 'dia'
  if (currentMin >= atardecerStart &&
      currentMin <  dormir)                    return 'atardecer'
  // Noche: desde hora de dormir hasta final del día (termina)
  return 'noche'
}

/**
 * ¿El Ritual de Mañana está en ventana horaria válida?
 * (04:00–11:30, §5.5)
 */
export function isRitualMananaWindow() {
  const now = new Date()
  const min = now.getHours() * 60 + now.getMinutes()
  return min >= 4 * 60 && min <= 11 * 60 + 30
}

/**
 * ¿El Ritual de Noche está en ventana horaria válida?
 * (19:00–03:00, §5.6)
 */
export function isRitualNocheWindow() {
  const now = new Date()
  const h   = now.getHours()
  return h >= 19 || h < 3
}

/**
 * Día de la semana en formato 0=Lun, 6=Dom
 * (Los hábitos usan este formato en diasSemana[])
 */
/**
 * Día de la semana en el formato del modelo: 0 = lunes, 6 = domingo.
 *
 * Acepta la clave del día de Strivo, que es la que decide a qué fecha pertenece
 * lo que se registra. Importa: el día de Strivo termina a las 03:00, así que a
 * la 1:30 de un domingo todavía se está cerrando el sábado, y los hábitos que
 * tocan son los del sábado. Leerlo del reloj a secas adelantaba el cambio de día
 * tres horas y hacía aparecer y desaparecer hábitos en mitad de la madrugada.
 *
 * Sin argumento se comporta como antes, con la fecha de hoy.
 */
export function getWeekDay(fecha) {
  const d = fecha
    ? new Date(...fecha.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v)))).getDay()
    : new Date().getDay()   // 0=Dom en JS
  return d === 0 ? 6 : d - 1   // convertir a 0=Lun
}

/**
 * Fecha actual en formato 'YYYY-MM-DD' (clave de DailyEntry)
 *
 * Se compone a mano en hora local, no con toISOString(): eso da UTC y en
 * México (UTC-6) todo lo escrito después de las 18:00 —justo la franja del
 * cierre nocturno— caía en la fecha del día siguiente.
 *
 * Pendiente para el Ritual de Noche: el día de Strivo termina a `diaTerminaA`
 * (03:00 por defecto), así que de madrugada la entrada pertenece aún al día
 * anterior. Eso lo resuelve quien tenga el perfil a mano.
 */
export function todayKey(date = new Date()) {
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mes}-${dia}`
}

/**
 * La fecha del "día de Strivo", que no termina a medianoche sino a
 * `diaTerminaA` (§7.2, 03:00 por defecto).
 *
 * Quien cierra su día a la 1:30 de la madrugada lo está cerrando *ayer*: sus
 * agradecimientos y su ánimo pertenecen a esa fecha, y el Ritual de Noche no
 * debe volver a aparecer como si fuera un día nuevo sin registrar.
 */
export function strivoDayKey(diaTerminaA = '03:00', date = new Date()) {
  const minutosAhora = date.getHours() * 60 + date.getMinutes()
  if (minutosAhora >= timeToMinutes(diaTerminaA)) return todayKey(date)

  const ayer = new Date(date)
  ayer.setDate(ayer.getDate() - 1)
  return todayKey(ayer)
}

/**
 * La fecha anterior a una clave 'YYYY-MM-DD'.
 */
export function previousDayKey(fecha) {
  const [ano, mes, dia] = fecha.split('-').map(Number)
  return todayKey(new Date(ano, mes - 1, dia - 1))
}
