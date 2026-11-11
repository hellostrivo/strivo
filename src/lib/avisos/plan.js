// src/lib/avisos/plan.js
// Qué avisos tienen que estar programados en el teléfono (SPEC_22, DP-22.5).
//
// **Lógica pura y nada más.** Sin plugin, sin base de datos y sin reloj
// propio: todo entra por argumentos. Es lo que reutilizará SPEC_27 en Android,
// y lo que permite probar cada borde sin un teléfono.
//
// **Una ventana de catorce días de avisos fechados**, no dos avisos diarios
// que se repiten. Cada aviso lleva su fecha completa —año, mes, día, hora y
// minuto— porque así iOS lo entrega una sola vez y a la hora de pared del
// teléfono, aunque cambie la zona horaria. Un aviso diario repetido no sabría
// saltarse el día en que ya pasaste por ese momento, y uno con `at` se
// convierte en un intervalo desde ahora: no sigue un cambio de zona y, si la
// fecha ya pasó, se entrega en el acto.
//
// **Strivo no insiste con quien se fue.** Si alguien no abre la app en catorce
// días, los avisos se acaban; al volver a abrirla, la ventana se rehace.
//
// **A qué día pertenece cada aviso lo dice `strivoDateKey`**, la misma regla
// que usa el diario, con el `diaTerminaA` del perfil: una noche a las 00:30
// con el día terminando a las 03:00 es la noche del día anterior, y si esa
// noche ya se cerró, el aviso no se programa.

import { strivoDateKey } from '../db/dates.js'

/** Los dos momentos que avisan, en el orden en que llegan en un día. */
export const MOMENTOS = Object.freeze(['manana', 'noche'])

/** Cuántos días por delante se programan. Como mucho, dos avisos por día. */
export const DIAS_DE_VENTANA = 14

/**
 * Lo más cerca de ahora que se programa un aviso. Una reconciliación que
 * calculara una hora un instante tarde no tiene que mandar nada "ya".
 */
export const MARGEN_MS = 60 * 1000

const DIA_MS = 24 * 60 * 60 * 1000
const HORA = /^(\d{1,2}):(\d{2})$/
const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/

/** "HH:MM" a `{ hora, minuto }`, o `null` si no es una hora. */
function partesDeHora(valor) {
  const encaje = HORA.exec(String(valor ?? '').trim())
  if (!encaje) return null
  const hora = Number(encaje[1])
  const minuto = Number(encaje[2])
  if (hora > 23 || minuto > 59) return null
  return { hora, minuto }
}

/**
 * El identificador de un aviso: `YYYYMMDD × 10 + (1 mañana | 2 noche)`, es
 * decir, `202611111` para la mañana del 11 de noviembre de 2026.
 *
 * Único y estable por (fecha, momento): reconciliar dos veces da los mismos
 * números, y retirar el aviso entregado de un día no necesita preguntarle nada
 * al teléfono. Cabe de sobra en 32 bits.
 */
export function idDeAviso(fecha, momento) {
  const encaje = FECHA.exec(String(fecha ?? ''))
  const indice = MOMENTOS.indexOf(momento)
  if (!encaje || indice < 0) return null
  return Number(`${encaje[1]}${encaje[2]}${encaje[3]}`) * 10 + indice + 1
}

/**
 * La lista de avisos que tienen que estar programados.
 *
 * @param {object} p
 * @param {Date}    p.ahora        - El reloj, siempre de fuera.
 * @param {?string} p.despertar    - "HH:MM" de la mañana, o nada.
 * @param {?string} p.dormir       - "HH:MM" de la noche, o nada.
 * @param {string}  [p.diaTerminaA]
 * @param {boolean} p.encendidos   - `preferences.remindersEnabled`.
 * @param {Array<{fecha: string, momento: string}>} [p.cerrados]
 *   Los momentos con `completedAt` (RN-DB-09): ese día, ese aviso no llega.
 * @param {number}  [p.dias]
 * @returns {Array<{id: number, momento: string, fecha: string, cuando: number,
 *   on: {year: number, month: number, day: number, hour: number, minute: number}}>}
 *   En orden de llegada.
 */
export function planDeAvisos({
  ahora,
  despertar,
  dormir,
  diaTerminaA,
  encendidos,
  cerrados = [],
  dias = DIAS_DE_VENTANA,
}) {
  if (encendidos !== true) return []
  const horas = { manana: partesDeHora(despertar), noche: partesDeHora(dormir) }
  if (!horas.manana && !horas.noche) return []

  const desde = ahora.getTime() + MARGEN_MS
  const hasta = ahora.getTime() + dias * DIA_MS
  const hechos = new Set(cerrados.map(({ fecha, momento }) => `${fecha}~${momento}`))

  const avisos = []
  // Desde ayer: una hora después de medianoche puede caer todavía hoy en el
  // reloj y pertenecer al día de ayer. La ventana la recorta igual.
  for (let desfase = -1; desfase <= dias; desfase += 1) {
    for (const momento of MOMENTOS) {
      const hora = horas[momento]
      if (!hora) continue
      // Se construye con sus números, en hora local: es la hora de pared que
      // la persona eligió, sea cual sea la zona del teléfono.
      const instante = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate() + desfase,
        hora.hora,
        hora.minuto,
        0,
        0,
      )
      const cuando = instante.getTime()
      if (cuando < desde || cuando >= hasta) continue
      const fecha = strivoDateKey(diaTerminaA, instante)
      if (hechos.has(`${fecha}~${momento}`)) continue
      avisos.push({
        id: idDeAviso(fecha, momento),
        momento,
        fecha,
        cuando,
        on: {
          year: instante.getFullYear(),
          month: instante.getMonth() + 1,
          day: instante.getDate(),
          hour: instante.getHours(),
          minute: instante.getMinutes(),
        },
      })
    }
  }
  return avisos.sort((a, b) => a.cuando - b.cuando)
}

/** El instante local que describen unos componentes de calendario. */
export function instanteDe(on) {
  if (!on) return null
  const { year, month, day, hour = 0, minute = 0 } = on
  if (![year, month, day].every(Number.isInteger)) return null
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

/**
 * El próximo aviso de cada momento entre los que el teléfono tiene de verdad
 * programados. Lo usa el diagnóstico: cuenta lo que hay, no lo que se pidió.
 *
 * @returns {{manana: ?Date, noche: ?Date}}
 */
export function proximosPorMomento(pendientes, ahora) {
  const proximos = { manana: null, noche: null }
  for (const aviso of pendientes ?? []) {
    const momento = aviso?.extra?.momento
    if (!MOMENTOS.includes(momento)) continue
    const cuando = instanteDe(aviso?.schedule?.on)
    if (!cuando || cuando.getTime() <= ahora.getTime()) continue
    if (!proximos[momento] || cuando < proximos[momento]) proximos[momento] = cuando
  }
  return proximos
}
