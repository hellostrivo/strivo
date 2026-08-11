// src/lumia/emociones.js
// Emociones de la Vista de Mañana: "¿Cómo me quiero sentir hoy?" (§5.3, B3).
//
// Son **quince, todas positivas y en futuro**: esto pregunta qué quieres
// cultivar, y ofrecer "Ansiosa" como algo a cultivar sería absurdo y dañino.
// Las emociones difíciles viven en el Journal, que pregunta qué hay (§5.3.2).
//
// **Representación.** SPEC_06 §4.2 fija chips tipo píldora con emoji y quince
// entradas; §5.3 y §5.8.1 describían dieciséis tarjetas con ícono propio y sin
// emoji. Se resolvió a favor de SPEC_06 el 10 ago 2026, con dos consecuencias
// anotadas en CLAUDE.md: la mañana y el Journal comparten representación, y el
// catálogo baja a quince retirando "Abundante", el más cercano a "Próspero".
// Lo que **no** cambia es que los dos catálogos siguen siendo distintos: quince
// positivas aquí, quince con las difíciles incluidas en el Journal.
//
// RN-GEN-04 — Se persiste el `id`. La etiqueta se resuelve al pintar, así que
// cambiar el género del perfil reescribe también los días ya guardados.

import { copy } from '@copy'
import { resolveGender } from '@copy/gender'

const textos = copy.lumia.diario.manana.emociones

/** Orden fijo: por frecuencia esperada y equilibrio temático (§5.3). */
export const CATALOGO = Object.freeze(textos.catalogo)

export const IDS = Object.freeze(CATALOGO.map((emocion) => emocion.id))

/** RN-VM-03 — Tres es el máximo con efecto psicológico útil (§5.3). */
export const MAX_EMOCIONES = 3

export function esEmocion(id) {
  return IDS.includes(id)
}

export function emocionPorId(id) {
  return CATALOGO.find((emocion) => emocion.id === id) ?? null
}

/** Etiqueta resuelta al género del perfil (RN-GEN-01: solo se lee desde aquí). */
export function etiquetaDe(id, genero) {
  const emocion = emocionPorId(id)
  return emocion ? resolveGender(emocion.label, genero) : ''
}

/**
 * Toca una emoción: la añade, la quita, o suelta la más antigua si ya hay tres.
 *
 * La cuarta selección **no se rechaza**: entra, y la primera sale con una
 * animación suave y un mensaje discreto. Bloquearla sería decirle a alguien que
 * ha hecho algo mal por querer sentir una cosa más (§5.3, Bloque 3).
 *
 * @param {string[]} seleccion - Ids en orden de selección.
 * @param {string} id
 * @returns {{seleccion: string[], desplazada: string|null}}
 */
export function alternarEmocion(seleccion, id) {
  const actual = Array.isArray(seleccion) ? seleccion : []
  if (!esEmocion(id)) return { seleccion: actual, desplazada: null }

  if (actual.includes(id)) {
    return { seleccion: actual.filter((otra) => otra !== id), desplazada: null }
  }

  if (actual.length < MAX_EMOCIONES) {
    return { seleccion: [...actual, id], desplazada: null }
  }

  const [masAntigua, ...resto] = actual
  return { seleccion: [...resto, id], desplazada: masAntigua }
}

/** Descarta lo que no sea del catálogo, sin corregir en silencio nada más. */
export function soloDelCatalogo(emociones) {
  return (emociones ?? []).filter((id) => esEmocion(id)).slice(0, MAX_EMOCIONES)
}
