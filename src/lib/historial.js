// src/lib/historial.js
// Historial (§5.10): el calendario de ánimo y la vista de un día completo.
//
// COLOR DE ÁNIMO. Ningún estado es rojo y ninguno es "malo": los nueve de
// @lib/animos se agrupan en cinco tonos de la paleta, y clay —el que el sistema
// reserva para errores— se queda fuera a propósito. Un día inquieto se ve
// distinto de uno en paz, no peor (§6.3, RN-05).
//
// UN DÍA SIN REGISTRO no se pinta. No hay hueco que llenar ni casilla vacía que
// señale lo que no se hizo: los días sin nada escrito simplemente no tienen
// punto.

import { copy } from '@copy'
import { ANIMOS, normalizarAnimos, colorDeAnimoId } from '@lib/animos'
import {
  getDailyEntriesInRange,
  getVictoriesInRange,
  getVictoriesByDate,
  getDailyEntry,
  getHabitLogsByDate,
  getHabits,
} from '@lib/db'
import { loadEntradasDeFecha } from '@lib/journal'
import { rangoDelMes } from '@lib/fechas'

// Los nueve estados de @lib/animos, en orden. El color vive con el id porque el
// rótulo cambia con el género y el punto del calendario no puede depender de él.
export const COLOR_DE_ANIMO = Object.fromEntries(
  ANIMOS.map(({ id, color }) => [id, color])
)

// Un día con algo escrito pero sin ánimo de cierre: se nota que estuvo, sin
// inventarle un estado de ánimo
export const COLOR_SIN_ANIMO = '#EDE7DC'   // surface.muted

// El punto del calendario es uno aunque se hayan elegido dos estados: manda el
// primero, que es el que la persona nombró antes. Acepta la forma antigua (un
// solo id, o el rótulo de antes de la v6): un mes viejo conserva sus colores.
export function colorDeAnimo(animo) {
  const [primero] = normalizarAnimos(animo)
  return colorDeAnimoId(primero) ?? COLOR_SIN_ANIMO
}

/**
 * ¿Quedó algo de este día? Cualquier cosa cuenta: una intención, un
 * agradecimiento, un ánimo… Da igual cuánto.
 */
export function tieneRegistro(entrada) {
  if (!entrada) return false
  return Boolean(
    entrada.intencion ||
    entrada.granDia ||
    entrada.aprendizaje ||
    // Por longitud y no por verdad: `animoCierre` es una lista, y una lista
    // vacía es verdadera en JS. Sin esto, un día en el que no se eligió ningún
    // estado aparecería con punto en el calendario.
    normalizarAnimos(entrada.animoCierre).length ||
    entrada.agradecimientos?.some(t => t?.trim()) ||
    entrada.emociones?.length ||
    entrada.ritualMananaCompletadoEn ||
    entrada.ritualNocheCompletadoEn
  )
}

/**
 * Un mes de calendario: para cada día con registro, su color de ánimo.
 * Los días sin nada no aparecen en el mapa.
 */
export async function loadMes(userId, ano, mes) {
  const { desde, hasta } = rangoDelMes(ano, mes)
  const [entradas, victorias] = await Promise.all([
    getDailyEntriesInRange(userId, desde, hasta),
    getVictoriesInRange(userId, desde, hasta),
  ])

  const conVictoria = new Set(victorias.map(v => v.fecha))
  const dias = new Map()

  for (const entrada of entradas) {
    if (!tieneRegistro(entrada) && !conVictoria.has(entrada.fecha)) continue
    dias.set(entrada.fecha, {
      fecha: entrada.fecha,
      animo: normalizarAnimos(entrada.animoCierre),
      animoOtroTexto: entrada.animoOtroTexto ?? '',
      color: colorDeAnimo(entrada.animoCierre),
    })
  }

  // Un día en el que solo se escribió una victoria también estuvo
  for (const fecha of conVictoria) {
    if (dias.has(fecha)) continue
    dias.set(fecha, { fecha, animo: [], animoOtroTexto: '', color: COLOR_SIN_ANIMO })
  }

  return dias
}

/**
 * Un día entero: lo que se escribió, lo que se propuso, lo que se hizo.
 * Devuelve `vacio: true` cuando no quedó nada, para que la pantalla lo diga en
 * una línea en vez de enseñar seis bloques en blanco.
 */
export async function loadDia(userId, fecha) {
  const [entrada, victorias, logs, habitos, journal] = await Promise.all([
    getDailyEntry(userId, fecha),
    getVictoriesByDate(userId, fecha),
    getHabitLogsByDate(userId, fecha),
    getHabits(userId),
    loadEntradasDeFecha(userId, fecha),
  ])

  const porId = new Map(habitos.map(h => [h.id, h]))
  const hechos = logs
    .map(log => porId.get(log.habitId))
    .filter(Boolean)

  const agradecimientos = (entrada?.agradecimientos ?? []).filter(t => t?.trim())
  const emociones = entrada?.emociones ?? []

  return {
    fecha,
    intencion:   entrada?.intencion ?? '',
    granDia:     entrada?.granDia ?? '',
    aprendizaje: entrada?.aprendizaje ?? '',
    animo:          normalizarAnimos(entrada?.animoCierre),
    animoOtroTexto: entrada?.animoOtroTexto ?? '',
    necesito:    entrada?.emocionesNecesito ?? '',
    agradecimientos,
    emociones,
    victorias,
    habitos: hechos,
    journal,
    vacio:
      !tieneRegistro(entrada) &&
      victorias.length === 0 &&
      hechos.length === 0 &&
      journal.length === 0,
  }
}

export function nombreDeEstado(estado) {
  return copy.historial.victoryStates[estado] ?? estado
}
