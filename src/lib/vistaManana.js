// src/lib/vistaManana.js
// Datos de la Vista de Mañana (§5.3): los seis bloques del diario del día.
//
// A diferencia del ritual, la Vista no es una secuencia: se entra, se escribe
// lo que apetezca y se sale. Por eso cada bloque guarda por su cuenta y en
// cuanto se deja de escribir (RN-02); no hay botón de "guardar" ni un final que
// haya que alcanzar para que cuente.
//
// Lo escrito aquí es lo mismo que ven los rituales: los agradecimientos son la
// lista del día que N4 completa por la noche, y las victorias nacen pendientes
// para que N3 las herede.

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
import { getCurrentUserId, newId } from '@lib/user'
import { strivoDayKey } from '@lib/timeSlot'

export async function loadVistaManana() {
  const userId = getCurrentUserId()
  const perfil = await getUserProfile(userId)
  const fecha  = strivoDayKey(perfil?.diaTerminaA)

  const [areas, habitos, logs, entrada, victorias] = await Promise.all([
    getAreas(userId),
    getActiveHabitsForMoment(userId, 'manana'),
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
    agradecimientos: entrada?.agradecimientos ?? [],
    emociones:       entrada?.emociones ?? [],
    emocionesNecesito: entrada?.emocionesNecesito ?? '',
    granDia:     entrada?.granDia ?? '',
    intencion:   entrada?.intencion ?? '',
    // Las que siguen sin decidir: son las que la noche hereda
    victorias: victorias.filter(v => v.estado === 'pendiente'),
  }
}

// Cada bloque escribe solo su parte de la entrada del día (updateDailyEntry
// parchea, no reemplaza), así que dos bloques nunca se pisan.
export async function guardarBloque(userId, fecha, patch) {
  return updateDailyEntry(userId, fecha, patch)
}

/**
 * Guarda una victoria de la mañana.
 *
 * Nace `pendiente`: es algo que la persona quiere que pase hoy, y esa es
 * exactamente la lista que hereda el Ritual de Noche (N3) para decidir.
 * Vaciar el texto no borra la fila: la deja soltada (RN-04) y fuera de la
 * herencia de la noche. Borrar el texto es una decisión de quien escribe, así
 * que se respeta; lo que no se hace es tirar la fila a la basura.
 */
export async function guardarVictoria(userId, fecha, victoria) {
  const texto = victoria.texto.trim()

  if (!texto) {
    if (!victoria.id) return null
    await saveVictory({ ...victoria, texto: '', estado: 'soltada' })
    return null
  }

  const fila = {
    id:       victoria.id ?? newId(),
    userId,
    fecha,
    texto,
    // Deducido del texto (§24.5), no elegido a mano: `areaDismissed` recuerda
    // que la persona quitó la etiqueta, para no volver a ponérsela.
    areaId:   victoria.areaId ?? null,
    areaDismissed: victoria.areaDismissed ?? false,
    estado:   'pendiente',
    creadoEn: victoria.creadoEn ?? new Date().toISOString(),
  }
  await saveVictory(fila)
  return fila
}
