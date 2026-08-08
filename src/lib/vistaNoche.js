// src/lib/vistaNoche.js
// Carga de la Vista de Noche (§5.3, diario del cierre).
//
// Las reglas de la noche —decidir una victoria, añadir un logro, guardar el
// ánimo, cerrar el día, contar la síntesis— viven en @lib/ritualNoche y son las
// mismas aquí: la Vista y el Ritual son dos formas de recorrer el mismo día, no
// dos registros distintos. Lo único propio de la Vista es qué carga.
//
// Diferencia con el ritual: aquí el checklist es solo de hábitos de noche
// (bloque 6), mientras que N2 repasa también los de la mañana.

import {
  getUserProfile,
  getAreas,
  getActiveHabitsForMoment,
  getHabitLogsByDate,
  getDailyEntry,
  getVictoriesByDate,
} from '@lib/db'
import { getCurrentUserId } from '@lib/user'
import { normalizarAnimos } from '@lib/animos'
import { strivoDayKey, getWeekDay } from '@lib/timeSlot'
import { ritualNocheHecho } from '@lib/ritualNoche'

export async function loadVistaNoche() {
  const userId = getCurrentUserId()
  const perfil = await getUserProfile(userId)
  const fecha  = strivoDayKey(perfil?.diaTerminaA)

  const [areas, habitos, logs, entrada, victorias] = await Promise.all([
    getAreas(userId),
    getActiveHabitsForMoment(userId, 'noche', getWeekDay()),
    getHabitLogsByDate(userId, fecha),
    getDailyEntry(userId, fecha),
    getVictoriesByDate(userId, fecha),
  ])

  return {
    userId,
    fecha,
    perfil,
    areas: areas.filter(area => area.estado === 'activa'),
    habitos,
    hechos: new Set(logs.map(log => log.habitId)),
    heredadas: victorias.filter(v => v.estado === 'pendiente'),
    logros:    victorias.filter(v => v.estado === 'lograda'),
    agradecimientos: entrada?.agradecimientos ?? [],
    aprendizaje:     entrada?.aprendizaje ?? '',
    animoCierre:     normalizarAnimos(entrada?.animoCierre),
    animoOtroTexto:  entrada?.animoOtroTexto ?? '',
    diaCerrado:      ritualNocheHecho(entrada),
  }
}
