// src/diario/mananaPausa.js
// La pausa opcional que cierra la mañana algunos días (§7 de la actualización
// del 23 ago).
//
// Es lo único de la mañana que **no** aparece siempre, y esa es su razón de
// ser: una pregunta que llega todos los días deja de ser una invitación y pasa
// a ser una casilla. Tres reglas la gobiernan:
//
//   1. Como mucho tres apariciones en una ventana de siete días.
//   2. Nunca en dos días consecutivos.
//   3. Rotan sin repetirse hasta haber pasado por las demás.
//
// **Aparecer no es responder.** Lo que se cuenta es que la tarjeta se mostró,
// así que `reflectionId` se escribe en cuanto se ve, la conteste alguien o no.
// Si contáramos solo las respondidas, quien nunca responde la vería cada día.
//
// La decisión se toma leyendo lo ya guardado: no hay ningún contador aparte que
// pueda quedar desincronizado con la historia real.

import { copy } from '@copy'
import { sumarDias } from './fechas.js'

/** Las tres preguntas, en su orden de rotación. */
export const BANCO = Object.freeze(copy.diario.manana.reflexion.banco)

export const IDS = Object.freeze(BANCO.map((pregunta) => pregunta.id))

/** §7 — "como máximo tres veces dentro de un periodo de siete días". */
export const MAXIMO_EN_VENTANA = 3

/** Días de la ventana, contando el de hoy. */
export const DIAS_VENTANA = 7

export function preguntaPorId(id) {
  return BANCO.find((pregunta) => pregunta.id === id) ?? null
}

/** Las mañanas en las que la pausa se mostró, de la más reciente hacia atrás. */
function aparicionesPrevias(recientes, hoy) {
  return (Array.isArray(recientes) ? recientes : [])
    .filter((dia) => dia?.id && dia.id < hoy && preguntaPorId(dia.reflectionId))
    .sort((a, b) => String(b.id).localeCompare(String(a.id)))
}

/**
 * ¿Toca hoy?
 *
 * Si la mañana de hoy ya la traía, sigue trayéndola: dentro de un mismo día la
 * respuesta no cambia, o la tarjeta desaparecería a mitad del recorrido.
 */
export function debeAparecer(recientes, hoy, entradaDeHoy = null) {
  if (preguntaPorId(entradaDeHoy?.reflectionId)) return true

  const previas = aparicionesPrevias(recientes, hoy)

  // Nunca en días consecutivos.
  const ayer = sumarDias(hoy, -1)
  if (previas.some((dia) => dia.id === ayer)) return false

  // La ventana de siete días termina hoy, así que se miran los seis anteriores:
  // con tres ya dentro, la de hoy sería la cuarta.
  const desde = sumarDias(hoy, -(DIAS_VENTANA - 1))
  const enVentana = previas.filter((dia) => dia.id >= desde).length
  return enVentana < MAXIMO_EN_VENTANA
}

/**
 * Cuál toca. La que lleve más tiempo sin salir: se descartan las últimas
 * `BANCO.length - 1` usadas, así que ninguna se repite hasta que hayan pasado
 * todas las demás.
 */
export function siguientePregunta(recientes, hoy, entradaDeHoy = null) {
  const yaElegida = preguntaPorId(entradaDeHoy?.reflectionId)
  if (yaElegida) return yaElegida

  const usadas = aparicionesPrevias(recientes, hoy)
    .map((dia) => dia.reflectionId)
    .slice(0, BANCO.length - 1)

  return BANCO.find((pregunta) => !usadas.includes(pregunta.id)) ?? BANCO[0]
}
