// src/lib/ritualNoche.js
// Datos del Ritual de Noche (§5.6): qué se lee al abrirlo, qué se escribe
// mientras se recorre y qué queda registrado al cerrar el día.
//
// La fecha no es la del reloj sino la del día de Strivo (`strivoDayKey`): quien
// cierra su día a la 1:30 lo está cerrando ayer, y sus agradecimientos van a esa
// fecha, no a una nueva.
//
// Todo es local-first (RN-02) y nada bloquea (RN-03): el ritual se completa con
// o sin victorias, con o sin agradecimientos.

import {
  getUserProfile,
  getAreas,
  getActiveHabitsForMoment,
  getHabitLogsByDate,
  getDailyEntry,
  updateDailyEntry,
  getVictoriesByDate,
  saveVictory,
} from '@lib/db'
import { interpolate } from '@copy'
import { getCurrentUserId, newId } from '@lib/user'
import { strivoDayKey, todayKey, getWeekDay } from '@lib/timeSlot'
import { normalizarAnimos, seleccionParaGuardar } from '@lib/animos'

export function ritualNocheHecho(entry) {
  return !!entry?.ritualNocheCompletadoEn
}

export async function loadRitualNoche() {
  const userId = getCurrentUserId()
  const perfil = await getUserProfile(userId)
  const fecha  = strivoDayKey(perfil?.diaTerminaA)

  const [areas, deNoche, deManana, logs, entrada, victorias] = await Promise.all([
    getAreas(userId),
    getActiveHabitsForMoment(userId, 'noche', getWeekDay()),
    getActiveHabitsForMoment(userId, 'manana', getWeekDay()),
    getHabitLogsByDate(userId, fecha),
    getDailyEntry(userId, fecha),
    getVictoriesByDate(userId, fecha),
  ])

  return {
    userId,
    fecha,
    perfil,
    areas,
    // N2 revisa el día entero, no solo la noche: lo de la mañana sigue siendo
    // editable por si se marcó de más o se hizo más tarde (copy-library, N2).
    habitos: [...deNoche, ...deManana],
    hechos:  new Set(logs.map(log => log.habitId)),
    // N3 hereda lo que se propuso por la mañana y sigue sin decidir
    heredadas: victorias.filter(v => v.estado === 'pendiente'),
    logros:    victorias.filter(v => v.estado === 'lograda'),
    agradecimientos: entrada?.agradecimientos ?? [],
    aprendizaje:     entrada?.aprendizaje ?? '',
    // La palabra propia de los registros del bloque 02 vivía en un campo
    // aparte; aquí se pliega dentro de la lista y las pantallas manejan un dato
    // solo. En el almacén no se reescribe nada.
    animoCierre:     normalizarAnimos(entrada?.animoCierre, entrada?.animoOtroTexto),
  }
}

// ─── N3 · Victorias ──────────────────────────────────────────────────────────

// Las cuatro decisiones de copy.diarioNoche.victories.
// "Pasarla a mañana" no borra la de hoy: crea otra para mañana que recuerda de
// dónde viene (origenId, §7.2). Nada de lo escrito desaparece (RN-04).
export async function decidirVictoria(victoria, decision) {
  const estados = {
    lograda:    'lograda',
    noSeDio:    'no_se_dio',
    aManana:    'no_se_dio',
    soltada:    'soltada',
  }

  const actualizada = { ...victoria, estado: estados[decision] ?? victoria.estado }
  await saveVictory(actualizada)

  if (decision === 'aManana') {
    await saveVictory({
      id:       newId(),
      userId:   victoria.userId,
      fecha:    siguienteDia(victoria.fecha),
      texto:    victoria.texto,
      areaId:   victoria.areaId ?? null,
      estado:   'pendiente',
      origenId: victoria.id,
      creadoEn: new Date().toISOString(),
    })
  }

  return actualizada
}

// Logro no planeado: ya pasó, así que nace lograda.
export async function anadirLogro(userId, fecha, texto, areaId = null) {
  const logro = {
    id:       newId(),
    userId,
    fecha,
    texto,
    areaId,
    estado:   'lograda',
    creadoEn: new Date().toISOString(),
  }
  await saveVictory(logro)
  return logro
}

// ─── N4, N5, N6 · Bloques del día ────────────────────────────────────────────

export async function guardarAgradecimientos(userId, fecha, agradecimientos) {
  return updateDailyEntry(userId, fecha, { agradecimientos })
}

export async function guardarAprendizaje(userId, fecha, aprendizaje) {
  return updateDailyEntry(userId, fecha, { aprendizaje })
}

/**
 * El estado de cierre: hasta dos ids y, si se eligió "Algo más", su palabra.
 *
 * Se guarda lo que @lib/animos considera guardable: "Algo más" sin palabra no
 * llega a escribirse, y su texto se va cuando se suelta el chip. Nada de eso se
 * le comunica a nadie (D.4).
 */
export async function guardarAnimoCierre(userId, fecha, animos, otroTexto = '') {
  return updateDailyEntry(userId, fecha, seleccionParaGuardar(animos, otroTexto))
}

// ─── Cierre ──────────────────────────────────────────────────────────────────

// Se llama al empezar la ceremonia de cierre, no al terminarla: si alguien
// cierra la app a mitad de la animación, su día ya quedó cerrado (§3.3).
export async function completarRitualNoche(userId, fecha) {
  return updateDailyEntry(userId, fecha, {
    ritualNocheCompletadoEn: new Date().toISOString(),
  })
}

/**
 * La síntesis del cierre (N8 en copy-library): cuenta lo que hubo, nunca lo que
 * faltó. Si el día vino vacío no se enumera nada: se agradece la visita.
 */
export function sintesisDelDia({ agradecimientos, logros }) {
  const nAgradecimientos = agradecimientos.filter(t => t.trim()).length
  const nLogros          = logros.length
  return {
    nAgradecimientos,
    nLogros,
    vacio: nAgradecimientos === 0 && nLogros === 0,
  }
}

/**
 * La frase de la síntesis, ya con la concordancia resuelta.
 *
 * Solo cuenta lo que hubo. Un día sin nada escrito no recibe un cero: recibe
 * "Hoy solo viniste. También cuenta." (§3.6 — nunca se señala la ausencia).
 */
export function fraseSintesis({ nAgradecimientos, nLogros, vacio }, copias) {
  if (vacio) return copias.nothingWritten

  if (nAgradecimientos === 0) {
    return interpolate(copias.summaryOnlyAchievements, { m: nLogros })
  }

  if (nLogros === 0) {
    return nAgradecimientos === 1
      ? copias.summaryOnlyGratitudeSingular
      : interpolate(copias.summaryOnlyGratitude, { n: nAgradecimientos })
  }

  return nAgradecimientos === 1
    ? interpolate(copias.summarySingularTemplate, { m: nLogros })
    : interpolate(copias.summaryTemplate, { n: nAgradecimientos, m: nLogros })
}

/**
 * La pregunta de N5 rota por día para que no sea siempre la misma
 * (copy.diarioNoche.learning tiene dos). Rotar es variedad, no examen.
 */
export function preguntaAprendizaje(fecha, copias) {
  const dia = Number(fecha.slice(-2))
  return dia % 2 === 0 ? copias.label : copias.altLabel
}

function siguienteDia(fecha) {
  const [ano, mes, dia] = fecha.split('-').map(Number)
  return todayKey(new Date(ano, mes - 1, dia + 1))
}
