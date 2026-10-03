// src/unaPausa/modelo/vigente.js
// Qué cápsula toca mostrar esta semana, y qué hay en el archivo.
//
// En Fase A «publicada» no se escribe: se deriva de los archivos y del reloj.
// Este módulo es esa derivación, y es **determinista**: el mismo conjunto de
// cápsulas y el mismo instante dan siempre el mismo calendario. Para cada
// semana, desde la primera cápsula programada que ya llegó hasta la de hoy:
//
//   programada  la cápsula `programada`, válida y no piloto con ese lunes. Si
//               hubiera dos —un choque que 28.2 detectará—, gana el id menor.
//   reserva     si no hay, la siguiente reserva aprobada y válida que no se
//               haya usado, en orden de `approvedAt` (y de id si empatan). Una
//               reserva **solo vale para semanas cuyo lunes llega después de
//               su `approvedAt`**: aprobar una hoy no puede rellenar el pasado.
//   repetida    si no hay reserva libre, la de la semana anterior.
//
// **Límite de Fase A, sin resolver a propósito.** El calendario se recalcula
// entero en cada llamada, así que la historia no está guardada en ningún sitio:
// un archivo nuevo con una semana ya pasada, o una constante editorial o una
// exención que cambia, la reescriben —la semana pasada muestra otra cosa, una
// reserva queda libre y se corre, y el archivo cambia hacia atrás—. Las pruebas
// `limites de Fase A` lo dejan a la vista. Fase B escribirá la publicación.

import { validar } from './validar.js'
import { esLunes, instanteEnZona, lunesDe, sumarDias } from './semana.js'

const porId = (a, b) => (String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0)

/** Lo que puede llegar a verse: ni piloto ni nada que no pase `validar`. */
function publicable(capsula) {
  return capsula?.piloto !== true && validar(capsula).faltas.length === 0
}

/**
 * El calendario con la cápsula de cada entrada, para uso interno.
 * @returns {{weekStart: string, capsula: object, origen: string}[]}
 */
function calendario(capsulas, ahora) {
  const hoy = lunesDe(ahora)
  if (hoy === null || !Array.isArray(capsulas)) return []

  const programadas = capsulas
    .filter((c) => c?.status === 'programada' && esLunes(c.weekStart) && c.weekStart <= hoy)
    .filter(publicable)
    .sort(porId)
  if (programadas.length === 0) return []

  const reservas = capsulas
    .filter((c) => c?.status === 'aprobada' && c.reserva === true)
    .filter(publicable)
    .sort((a, b) => Date.parse(a.approvedAt) - Date.parse(b.approvedAt) || porId(a, b))

  const primera = programadas.map((c) => c.weekStart).sort()[0]
  const usadas = new Set()
  const entradas = []

  for (let semana = primera; semana <= hoy; semana = sumarDias(semana, 7)) {
    const programada = programadas.find((c) => c.weekStart === semana)
    if (programada) {
      entradas.push({ weekStart: semana, capsula: programada, origen: 'programada' })
      continue
    }
    const lunes = instanteEnZona(semana)
    const reserva = reservas.find((c) => !usadas.has(c) && lunes > Date.parse(c.approvedAt))
    if (reserva) {
      usadas.add(reserva)
      entradas.push({ weekStart: semana, capsula: reserva, origen: 'reserva' })
      continue
    }
    entradas.push({ weekStart: semana, capsula: entradas.at(-1).capsula, origen: 'repetida' })
  }
  return entradas
}

/**
 * Qué cápsula ocupa cada semana, y por qué.
 * @param {object[]} capsulas
 * @param {Date|number|string} ahora
 * @returns {{weekStart: string, id: string, origen: 'programada'|'reserva'|'repetida'}[]}
 */
export function calendarioEfectivo(capsulas, ahora) {
  return calendario(capsulas, ahora).map(({ weekStart, capsula, origen }) => ({
    weekStart,
    id: capsula.id,
    origen,
  }))
}

/**
 * La cápsula de la última semana del calendario, o `null`.
 * @returns {object|null}
 */
export function capsulaVigente(capsulas, ahora) {
  return calendario(capsulas, ahora).at(-1)?.capsula ?? null
}

/**
 * Las cápsulas publicadas antes de la vigente, cada una una vez y de la más
 * reciente a la más antigua. Las semanas repetidas no añaden nada: repetir no
 * es publicar otra vez.
 * @returns {object[]}
 */
export function archivo(capsulas, ahora) {
  const entradas = calendario(capsulas, ahora)
  const vigente = entradas.at(-1)?.capsula
  const vistas = new Set([vigente])
  const lista = []
  for (const { capsula, origen } of entradas.slice(0, -1).reverse()) {
    if (origen === 'repetida' || vistas.has(capsula)) continue
    vistas.add(capsula)
    lista.push(capsula)
  }
  return lista
}
