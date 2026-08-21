// src/breathing/lib/nombreSugerido.js
// Cómo se llama una combinación guardada (SPEC_15 §4.2).
//
// Puro y sin capa de datos: recibe la lista de nombres que ya existen y decide.
// Así las reglas RN-RE-FAV-02, 03 y 04 se prueban sin abrir una base de datos,
// y sobre todo se prueban **todas**, incluidos los casos que en una interfaz
// cuesta provocar a mano: el nombre de solo espacios, el de cuarenta y un
// caracteres, el repetido con otras mayúsculas.

import { copy } from '@copy'
import { MAX_NOMBRE_FAVORITO } from '../data/esquema.js'

/** Los motivos por los que un nombre no vale. Estables; el copy los traduce. */
export const MOTIVOS = Object.freeze({
  VACIO: 'vacio',
  LARGO: 'largo',
  REPETIDO: 'repetido',
})

/**
 * Cuántos caracteres ve una persona.
 *
 * **Caso 6.9 — un emoji cuenta como uno.** `'👍'.length` es 2 y una familia
 * puede llegar a 11: contar unidades de código dejaría a alguien sin poder
 * escribir un nombre de seis emojis mientras la app le dice que se pasó de
 * cuarenta. `Intl.Segmenter` cuenta lo que se ve; donde no exista, se recurre al
 * iterador de cadenas, que al menos agrupa los pares sustitutos.
 */
export function longitudVisible(texto) {
  const cadena = String(texto ?? '')
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter().segment(cadena)].length
  }
  return [...cadena].length
}

/** Recorta los extremos. Lo de dentro no se toca: los espacios son suyos. */
export function normalizarNombre(bruto) {
  return String(bruto ?? '').trim()
}

/** RN-RE-FAV-03 — Se comparan sin distinguir mayúsculas y ya recortados. */
export function mismoNombre(a, b) {
  return normalizarNombre(a).toLocaleLowerCase() === normalizarNombre(b).toLocaleLowerCase()
}

/**
 * ¿Vale este nombre?
 *
 * @param {string} bruto
 * @param {string[]} existentes - Los nombres ya guardados.
 * @param {{excepto?: string}} [opciones] - Al renombrar, su propio nombre no cuenta.
 * @returns {{valido: boolean, motivo: ?string, nombre: string, choqueCon: ?string}}
 */
export function validarNombre(bruto, existentes = [], { excepto = null } = {}) {
  const nombre = normalizarNombre(bruto)

  // RN-RE-FAV-02 — Vacío se rechaza; no se guarda "sin nombre". Un nombre
  // puesto por la app no ayuda a encontrar nada y llena la lista de gemelos.
  if (nombre.length === 0) {
    return { valido: false, motivo: MOTIVOS.VACIO, nombre, choqueCon: null }
  }

  if (longitudVisible(nombre) > MAX_NOMBRE_FAVORITO) {
    return { valido: false, motivo: MOTIVOS.LARGO, nombre, choqueCon: null }
  }

  const choque = existentes.find(
    (otro) => mismoNombre(otro, nombre) && !(excepto !== null && mismoNombre(otro, excepto)),
  )
  if (choque !== undefined) {
    // RN-RE-FAV-03 — Nunca un duplicado en silencio. Se ofrece reemplazar o
    // cambiar el nombre, y quien decide es quien está guardando.
    return { valido: false, motivo: MOTIVOS.REPETIDO, nombre, choqueCon: choque }
  }

  return { valido: true, motivo: null, nombre, choqueCon: null }
}

/**
 * RN-RE-FAV-04 — El nombre con el que llega prellenado el campo.
 *
 * El del patrón base, y si ya está, con un sufijo numérico: `4-7-8`, `4-7-8 2`,
 * `4-7-8 3`. Llega seleccionado, así que escribir encima lo sustituye de un
 * gesto: quien quiera su propio nombre no tiene que borrar nada primero, y quien
 * no quiera pensarlo ya tiene uno que sirve.
 *
 * @param {string} base - El nombre del patrón, de `copy.respiracion.patrones`.
 * @param {string[]} existentes
 */
export function nombreSugerido(base, existentes = []) {
  const limpio = normalizarNombre(base) || copy.respiracion.titulo
  if (!existentes.some((otro) => mismoNombre(otro, limpio))) return limpio

  // Empieza en 2: el primero no lleva número, así que "X 2" es el segundo.
  for (let n = 2; n <= existentes.length + 2; n += 1) {
    const candidato = `${limpio} ${n}`
    if (!existentes.some((otro) => mismoNombre(otro, candidato))) return candidato
  }
  return `${limpio} ${existentes.length + 2}`
}
