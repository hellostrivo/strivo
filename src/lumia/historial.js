// src/lumia/historial.js
// Historial de Lumia: calendario de ánimo y vista de día completo (§5.10).
//
// **Solo contenido de Lumia** (§C7.7.2). §5.10 describía una vista de día con
// "mañana, noche, journal y hábitos"; tras la división esa vista sería un
// insight cruzado y no puede vivir aquí sin leer `formia/`. v4.1 la acota a
// mañana, noche y journal. Si algún día se quiere la vista unificada, será una
// superficie de Strivo Intelligence, no del Historial.
//
// **Un día sin registro no se marca de ningún modo.** No hay huecos, no hay
// grises acusatorios y no hay días perdidos: simplemente no tiene punto.
//
// El punto de ánimo se **deriva al vuelo** del estado de sueño con
// `animoDerivado`, y no se lee de `dayState.mood`. §5.4.1 dice expresamente que
// esa derivación es una vista y no un dato, y SPEC_06 decidió en consecuencia
// no escribir nunca `dayState`. Calcularlo aquí mantiene una sola respuesta a
// la pregunta "¿cómo se fue a dormir ese día?".

import { lumia } from '@/lib/db'
import { animoDerivado } from './estadoSueno.js'
import { fechaDeClave } from './fechas.js'

/** Los cinco tonos de §6.3.5, por id. El color vive en `globals.css`. */
export const ANIMOS = Object.freeze(['agotado', 'inquieto', 'normal', 'tranquilo', 'en_paz'])

/** La semana empieza en lunes, como la tabla `copy.days` (§3.11). */
export const PRIMER_DIA = 1

function claveDe(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** El mes al que pertenece una fecha, como `{ year, month }` con month 1..12. */
export function mesDe(dateKey) {
  const [year, month] = String(dateKey ?? '')
    .split('-')
    .map(Number)
  return { year, month }
}

/** Desplaza un mes hacia atrás o hacia delante sin salirse del calendario. */
export function sumarMeses({ year, month }, meses) {
  const indice = year * 12 + (month - 1) + meses
  return { year: Math.floor(indice / 12), month: (indice % 12) + 1 }
}

/** Las claves de fecha de un mes, del día 1 al último. */
export function diasDelMes({ year, month }) {
  const ultimo = new Date(year, month, 0).getDate()
  return Array.from({ length: ultimo }, (_, i) => claveDe(year, month, i + 1))
}

/**
 * Cuántas casillas vacías van antes del día 1 para que caiga en su columna.
 * Sin esto el calendario se pinta corrido y no se puede leer por semanas.
 */
export function huecoInicial({ year, month }) {
  const primerDia = new Date(year, month - 1, 1).getDay()
  return (primerDia - PRIMER_DIA + 7) % 7
}

/** 'Agosto de 2026' — el encabezado del calendario. */
export function nombreDelMes({ year, month }) {
  const fecha = new Date(year, month - 1, 1, 12, 0, 0)
  const texto = fecha.toLocaleDateString('es', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** El número de día para pintar dentro de la casilla. */
export function numeroDeDia(dateKey) {
  return fechaDeClave(dateKey)?.getDate() ?? null
}

// ─── Calendario ───────────────────────────────────────────────────────────────

/**
 * Un mes de días, cada uno con su ánimo si lo hay.
 *
 * `animo` es `null` cuando no hay estado de sueño registrado: la casilla no
 * pinta punto. Un día con algo escrito pero sin estado de sueño se marca en
 * `normal`, que es exactamente lo que devuelve `animoDerivado([])` — hubo día,
 * no hubo ánimo declarado, y la app no se inventa uno más luminoso.
 *
 * @returns {Promise<Array<{fecha: string, animo: ?string, hayContenido: boolean}>>}
 */
export async function cargarMes(uid, mes) {
  const dias = diasDelMes(mes)

  const [rituales, mananas, journal] = await Promise.all([
    Promise.all(dias.map((fecha) => lumia.getNightRitual(uid, fecha))),
    Promise.all(dias.map((fecha) => lumia.getMorningEntry(uid, fecha))),
    lumia.listJournalEntries(uid),
  ])

  const conJournal = new Set(journal.map((entrada) => entrada.date))

  return dias.map((fecha, indice) => {
    const night = rituales[indice]
    const morning = mananas[indice]
    const sueno = night?.sleepState ?? []

    const hayContenido = hayAlgoDeNoche(night) || hayAlgoDeManana(morning) || conJournal.has(fecha)

    return {
      fecha,
      animo: sueno.length > 0 ? animoDerivado(sueno) : hayContenido ? 'normal' : null,
      hayContenido,
    }
  })
}

function hayAlgoDeNoche(night) {
  if (!night) return false
  return (
    (night.gratitude?.length ?? 0) > 0 ||
    (night.sleepState?.length ?? 0) > 0 ||
    String(night.learning ?? '').trim() !== ''
  )
}

function hayAlgoDeManana(morning) {
  if (!morning) return false
  return (
    (morning.gratitude?.length ?? 0) > 0 ||
    (morning.emotions?.length ?? 0) > 0 ||
    String(morning.granVision ?? '').trim() !== ''
  )
}

// ─── Vista de día completo ────────────────────────────────────────────────────

/**
 * Todo lo de Lumia de un día: mañana, noche y journal.
 *
 * **Sin hábitos** (§C7.7.2). Esta función no importa `formia/` y no tiene forma
 * de hacerlo: el lint lo impide y la prueba de separación lo comprueba.
 *
 * `conJournal` en `false` **no lee** las entradas, no solo evita pintarlas. Es
 * lo que sostiene RN-JR-PIN-01 desde el Historial: con un PIN puesto, el
 * contenido del journal no se carga en memoria fuera de su módulo. Un bloqueo
 * que solo tape la vista se cae con el primer fallo de opacidad.
 */
export async function cargarDia(uid, fecha, { conJournal = true } = {}) {
  const [morning, night, journal] = await Promise.all([
    lumia.getMorningEntry(uid, fecha),
    lumia.getNightRitual(uid, fecha),
    conJournal ? lumia.listJournalEntriesByDate(uid, fecha) : Promise.resolve([]),
  ])

  return {
    fecha,
    morning,
    night,
    journal: [...journal].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
  }
}

/** ¿Este día quedó en blanco? Decide el estado vacío, que nunca acusa. */
export function diaVacio(dia) {
  return (
    !hayAlgoDeManana(dia?.morning) &&
    !hayAlgoDeNoche(dia?.night) &&
    (dia?.journal?.length ?? 0) === 0
  )
}
