// src/lumia/mananaAcciones.js
// Las ideas que acompañan a "¿Qué puedo hacer hoy para acercarme a esa
// sensación?" (§5 y §6 de la actualización del 23 ago).
//
// Hay dos orígenes y **ninguno de los dos rellena el campo por su cuenta**:
//
//   1. Ideas generales, ligadas a la intención elegida. Son fijas, están en el
//      copy y no se aprenden de nadie.
//   2. Ideas que la propia persona escribió antes para esa misma intención, en
//      los últimos 30 días. Se presentan como lo que son —"Ideas que elegiste
//      antes"— y **nunca** se dice que le funcionaran: la app no tiene forma de
//      saberlo y afirmarlo sería inventar evidencia.
//
// Lo que aquí no ocurre, y es la mitad del diseño:
//   · No se interpreta una intención escrita a mano. Si alguien tecleó su
//     propia palabra, se ofrecen las ideas generales y se acabó: deducir de una
//     palabra qué le pasa a alguien es diagnosticar.
//   · No se saca ningún fragmento del Journal ni de ninguna otra superficie.
//     Lo único que vuelve es lo que se escribió **en esta misma pregunta**.
//   · No se autocompleta nada. Tocar una idea la deja en el campo y se puede
//     borrar entera.

import { copy } from '@copy'
import { ID_OTRA } from './seleccionUnica.js'
import { sumarDias } from './fechas.js'

const textos = copy.diario.manana.accion

/** §5 — "hasta tres ideas breves relacionadas con esa intención". */
export const MAX_IDEAS = 3

/** §6 — "hasta dos acciones que haya escrito para esa intención". */
export const MAX_ANTERIORES = 2

/** §6 — La ventana de la que se recuperan acciones propias. */
export const DIAS_VENTANA_ANTERIORES = 30

/** Para comparar dos ideas sin que las mayúsculas ni los espacios estorben. */
function clave(texto) {
  return String(texto ?? '')
    .trim()
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
}

/**
 * Acciones que la persona ya escribió para esta misma intención.
 *
 * Solo para intenciones del catálogo: una intención escrita a mano no se
 * compara con nada, porque compararla exigiría interpretarla.
 *
 * @param {object[]} recientes - Mañanas guardadas, cada una con su fecha en `id`.
 * @param {?string}  intencion - Id de la intención elegida hoy.
 * @param {string}   hoy       - Clave de fecha del día en curso.
 * @returns {string[]} de la más reciente a la más antigua, sin repetir.
 */
export function ideasAnteriores(recientes, intencion, hoy) {
  if (!intencion || intencion === ID_OTRA) return []
  const desde = sumarDias(hoy, -DIAS_VENTANA_ANTERIORES)

  const vistas = new Set()
  return (Array.isArray(recientes) ? recientes : [])
    .filter((dia) => dia?.id && dia.id < hoy && dia.id >= desde)
    .filter((dia) => dia.intention === intencion)
    .sort((a, b) => String(b.id).localeCompare(String(a.id)))
    .map((dia) => String(dia.action ?? '').trim())
    .filter((accion) => accion !== '')
    .filter((accion) => {
      const k = clave(accion)
      if (vistas.has(k)) return false
      vistas.add(k)
      return true
    })
    .slice(0, MAX_ANTERIORES)
}

/**
 * Las ideas generales que se ofrecen, ya descontadas las que la persona ya
 * tiene delante como propias: repetir una idea en las dos listas la haría
 * parecer dos ideas distintas.
 *
 * Sin intención elegida —o con una escrita a mano— salen las generales.
 */
export function ideasGenerales(intencion, anteriores = []) {
  const base = textos.ideas[intencion] ?? textos.ideas.generales
  const propias = new Set(anteriores.map(clave))
  return base.filter((idea) => !propias.has(clave(idea))).slice(0, MAX_IDEAS)
}
