// src/diario/ventanaEdicion.js
// Hasta cuándo se puede escribir en un día, y desde cuándo se lee y nada más.
//
// **El motivo es de producto, no técnico.** Hasta el 3 de septiembre de 2026 un
// día dejaba de poder escribirse en el instante en que cambiaba su clave de
// fecha: quien llegaba a casa a las dos de la mañana y quería cerrar el día que
// acababa de vivir se encontraba con el día siguiente en blanco delante. Eso no
// es un caso raro —se registra tarde, se olvida un día, se viaja— y castigar el
// uso real de la app es exactamente lo contrario de un refugio (RN-05).
//
// Ahora el día se cierra **72 horas después de haber empezado**, y ese número
// vive aquí y en ningún otro sitio.
//
// **Es una ventana deslizante y continua** (§14, no-negociable 1): no se
// reinicia a medianoche, no depende de la franja horaria de la mañana ni de la
// noche —esas eligen qué se pregunta, nunca si se puede contestar— y no hace
// falta que nadie la vigile. Se calcula al mirarla, con el reloj del
// dispositivo, y esa es la razón de que sea lógica pura y no un dato guardado:
// una marca de "cerrado" escrita a medianoche envejecería mal y habría que
// corregirla, y en este producto nada se corrige en silencio (RN-DB-02).
//
// **Cuándo empieza un día lo decide el perfil, no la medianoche del sistema.**
// Se usa el mismo `diaTerminaA` que la capa de datos usa para elegir la clave
// (RN-DB-01): con `diaTerminaA = "03:00"`, el día `2026-09-01` va de las 03:00
// de ese día a las 03:00 del siguiente, y las 72 horas se cuentan desde ahí. Si
// no se contara igual, la ventana y la clave discreparían justo en las horas en
// que la gente escribe tarde, que es el caso que esto viene a resolver.
//
// **Todo en hora local, nunca en UTC.** Una clave de fecha jamás se pasa a
// `new Date(cadena)`: eso la interpreta en UTC y adelanta o atrasa el día en
// media Europa y toda América. El inicio de un día se construye con sus tres
// números, que es lo que hace que el cálculo siga siendo correcto cuando el
// dispositivo cambia de huso o cuando el reloj adelanta o atrasa una hora: la
// diferencia se mide en tiempo transcurrido de verdad, no en días de 24 horas
// supuestas.

import { DEFAULT_DIA_TERMINA_A, timeToMinutes } from '@/lib/db'
import { sumarDias } from './fechas.js'

/**
 * Cuántas horas se puede seguir escribiendo en un día desde que empezó.
 *
 * **Este es el único sitio donde vive el número.** Cambiarlo cambia la ventana
 * entera: lo que se puede editar, cuántos días ofrece la pantalla Hoy y qué
 * días se leen ya sin poder tocarse.
 */
export const HORAS_DE_EDICION = 72

const UNA_HORA = 60 * 60 * 1000

/** Cuántos días distintos puede llegar a abarcar la ventana, como mucho. */
const DIAS_POSIBLES = Math.ceil(HORAS_DE_EDICION / 24) + 1

/**
 * El instante en que empieza un día, en hora local.
 *
 * Con `diaTerminaA = "00:00"` es la medianoche de esa fecha; con "03:00", las
 * tres de la madrugada de esa misma fecha, que es cuando esa clave empieza a
 * recibir lo que se escribe (RN-DB-01).
 *
 * @param {string} dateKey - 'YYYY-MM-DD'
 * @param {string} [diaTerminaA] - "HH:MM" del perfil.
 * @returns {?Date}
 */
export function inicioDelDia(dateKey, diaTerminaA = DEFAULT_DIA_TERMINA_A) {
  const [year, month, day] = String(dateKey ?? '')
    .split('-')
    .map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, 0, timeToMinutes(diaTerminaA), 0, 0)
}

/**
 * El instante en que un día deja de poder escribirse.
 *
 * @param {string} dateKey
 * @param {string} [diaTerminaA]
 * @returns {?Date}
 */
export function limiteDeEdicion(dateKey, diaTerminaA = DEFAULT_DIA_TERMINA_A) {
  const inicio = inicioDelDia(dateKey, diaTerminaA)
  if (!inicio) return null
  return new Date(inicio.getTime() + HORAS_DE_EDICION * UNA_HORA)
}

/**
 * ¿Este día todavía está por llegar?
 *
 * Un día que no ha empezado no se puede escribir: no hay nada que registrar de
 * un día que nadie ha vivido, y ofrecerlo convertiría el diario en una agenda
 * (§1.2). No es un bloqueo de los que §14 prohíbe —no impide contestar nada—:
 * es que ese día todavía no existe.
 */
export function esFutura(dateKey, { ahora = new Date(), diaTerminaA } = {}) {
  const inicio = inicioDelDia(dateKey, diaTerminaA)
  if (!inicio) return false
  return inicio.getTime() > ahora.getTime()
}

/**
 * ¿Se puede escribir en este día?
 *
 * Es la única pregunta que hace falta hacerse, y se contesta con tres datos: la
 * fecha del registro, la hora a la que termina el día de quien escribe y el
 * reloj. Nada de esto se guarda.
 *
 * @param {string} dateKey - 'YYYY-MM-DD'
 * @param {object} [opciones]
 * @param {Date}   [opciones.ahora]
 * @param {string} [opciones.diaTerminaA]
 * @returns {boolean}
 */
export function editable(dateKey, { ahora = new Date(), diaTerminaA } = {}) {
  const inicio = inicioDelDia(dateKey, diaTerminaA)
  if (!inicio) return false
  const transcurrido = ahora.getTime() - inicio.getTime()
  if (transcurrido < 0) return false
  return transcurrido < HORAS_DE_EDICION * UNA_HORA
}

/**
 * Los días que todavía se pueden escribir, del de hoy hacia atrás.
 *
 * Sale de `editable` y no de una cuenta de días, para que las dos respuestas no
 * puedan discrepar: con la ventana de 72 horas y el corte por defecto son hoy,
 * ayer y anteayer.
 *
 * @param {string} hoyKey - la fecha a la que pertenece este momento.
 * @param {object} [opciones]
 * @returns {string[]} claves de fecha, de la más reciente a la más antigua.
 */
export function diasEditables(hoyKey, { ahora = new Date(), diaTerminaA } = {}) {
  if (!inicioDelDia(hoyKey, diaTerminaA)) return []
  const dias = []
  for (let atras = 0; atras < DIAS_POSIBLES; atras += 1) {
    const fecha = atras === 0 ? hoyKey : sumarDias(hoyKey, -atras)
    if (!editable(fecha, { ahora, diaTerminaA })) break
    dias.push(fecha)
  }
  return dias
}
