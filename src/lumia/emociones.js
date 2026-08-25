// src/lumia/emociones.js
// **Catálogo heredado.** Fue la pregunta "¿Cómo me quiero sentir hoy?" de la
// Vista de Mañana (§5.3, B3): quince emociones positivas, hasta tres a la vez,
// guardadas en `morning.emotions`.
//
// La actualización del 23 ago la sustituyó por dos preguntas de selección única
// —"¿Cómo me siento esta mañana?" y "¿Cómo me gustaría sentirme durante el día
// de hoy?"— que viven en `mananaEmociones.js`. Ninguna pantalla de escritura
// ofrece ya este catálogo.
//
// **Se conserva entero para leer los días que lo usaron** (§9: nada de lo ya
// escrito se sobrescribe ni desaparece). Su único consumidor es la vista de día
// completo del Historial. Si algún día no queda ni una mañana con `emotions`,
// este módulo y su copy se pueden retirar juntos.
//
// RN-GEN-04 — Se persiste el `id`. La etiqueta se resuelve al pintar, así que
// cambiar el género del perfil reescribe también los días ya guardados.

import { copy } from '@copy'
import { resolveGender } from '@copy/gender'

const textos = copy.diario.manana.emocionesHeredadas

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
