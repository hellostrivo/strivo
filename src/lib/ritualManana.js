// src/lib/ritualManana.js
// Datos del Ritual de Mañana (§5.5): qué se lee al abrirlo y qué se escribe al
// cerrarlo. La pantalla solo pinta; las reglas viven aquí.
//
// Todo es local-first (RN-02): se lee de IndexedDB y se escribe al instante.
// Si algo falla, el ritual se abre igual con lo que haya — nunca se queda a
// medias ni muestra un error (§3.3, el cierre no falla).

import {
  getUserProfile,
  getAreas,
  getActiveHabitsForMoment,
  getHabitLogsByDate,
  getDailyEntry,
  updateDailyEntry,
} from '@lib/db'
import { getCurrentUserId } from '@lib/user'
import { strivoDayKey, previousDayKey, getWeekDay } from '@lib/timeSlot'

// Ánimos de cierre que hacen que la mañana salude distinto (copy.ritualNoche.n6)
const ANIMOS_DIFICILES = ['Cansado', 'Inquieto']

export function ritualMananaHecho(entry) {
  return !!entry?.ritualMananaCompletadoEn
}

export async function loadRitualManana() {
  const userId = getCurrentUserId()
  // La fecha del día de Strivo, igual que en Hoy y en el Ritual de Noche
  const perfil = await getUserProfile(userId)
  const fecha  = strivoDayKey(perfil?.diaTerminaA)
  const ayer   = previousDayKey(fecha)

  const [areas, habitos, logs, entradaHoy, entradaAyer] = await Promise.all([
    getAreas(userId),
    getActiveHabitsForMoment(userId, 'manana', getWeekDay()),
    getHabitLogsByDate(userId, fecha),
    getDailyEntry(userId, fecha),
    getDailyEntry(userId, ayer),
  ])

  return {
    userId,
    fecha,
    perfil,
    areas,
    habitos,
    hechos:    new Set(logs.map(log => log.habitId)),
    intencion: entradaHoy?.intencion ?? '',
    // R2 saluda distinto si ayer se fue a dormir cansado o inquieto. Es un
    // reconocimiento, no un diagnóstico: nunca se menciona lo que no se hizo.
    diaDificil: ANIMOS_DIFICILES.includes(entradaAyer?.animoCierre),
    areaDelDia: elegirAreaDelDia(areas, habitos, fecha),
  }
}

// Guardar la intención no espera al final: cada bloque persiste solo (RN-02).
export async function guardarIntencion(userId, fecha, intencion) {
  return updateDailyEntry(userId, fecha, { intencion })
}

// Cerrar el ritual lo completa, con hábitos marcados o sin ellos (RN-03).
// Se completa también al salir por la X o por la ruta express: el ritual no es
// una deuda que se reclama después.
export async function completarRitualManana(userId, fecha, intencion) {
  return updateDailyEntry(userId, fecha, {
    ritualMananaCompletadoEn: new Date().toISOString(),
    ...(intencion !== undefined ? { intencion } : {}),
  })
}

/**
 * El área del día (R3).
 *
 * Se elige por lo que la persona ya decidió cultivar hoy: el área con más
 * hábitos de la mañana. Sin hábitos o en empate, rota de forma estable por
 * fecha, así que cada día toca una y todas acaban pasando.
 *
 * Nunca se elige "la que menos registro tiene" ni se presenta como un hueco que
 * llenar (RN-05): es una dirección para el día, no una deuda.
 */
export function elegirAreaDelDia(areas, habitos, fecha) {
  const activas = areas.filter(area => area.estado !== 'archivada' && area.estado !== 'pausada')
  if (!activas.length) return null

  const cuenta = new Map()
  for (const habito of habitos) {
    if (!habito.areaId) continue
    cuenta.set(habito.areaId, (cuenta.get(habito.areaId) ?? 0) + 1)
  }

  const masHabitos = activas
    .filter(area => cuenta.has(area.id))
    .sort((a, b) => cuenta.get(b.id) - cuenta.get(a.id))

  if (masHabitos.length && cuenta.get(masHabitos[0].id) > (cuenta.get(masHabitos[1]?.id) ?? 0)) {
    return masHabitos[0]
  }

  // Rotación estable: el mismo día siempre da la misma área
  const candidatas = masHabitos.length ? masHabitos : activas
  return candidatas[diaDelAno(fecha) % candidatas.length]
}

function diaDelAno(fecha) {
  const [ano, mes, dia] = fecha.split('-').map(Number)
  const inicio = new Date(ano, 0, 1)
  const hoy    = new Date(ano, mes - 1, dia)
  return Math.round((hoy - inicio) / 86400000)
}
