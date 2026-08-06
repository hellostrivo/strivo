// src/lib/habitSuggestions.js
// Qué hábitos se ofrecen en P7 (mañana) y P8 (noche).
//
// Las sugerencias siguen a las áreas elegidas en P4B: lo que se ofrece confirma
// la dirección que la persona ya dijo que le importa (§5.1.1). Sin áreas se
// ofrece la lista general, que vive en "General" (areaId = null).
//
// Los textos viven en @copy; aquí solo se decide cuáles tocan.

import { copy } from '@copy'
import { AREAS } from '@lib/areas'

const POR_MOMENTO = {
  manana: copy.onboarding.p7.suggestions,
  noche:  copy.onboarding.p8.suggestions,
}

/**
 * @param {'manana'|'noche'} momento
 * @param {string[]} areas - tipos de área elegidos en P4B (puede ir vacío)
 * @returns {{texto: string, areaId: string|null, color: string|undefined}[]}
 */
export function suggestionsFor(momento, areas) {
  const catalogo = POR_MOMENTO[momento] ?? {}

  if (!areas.length) {
    return (catalogo.general ?? []).map(texto => ({ texto, areaId: null, color: undefined }))
  }

  // Se recorre AREAS para conservar el orden canónico del catálogo
  return AREAS
    .filter(area => areas.includes(area.tipo))
    .flatMap(area =>
      (catalogo[area.tipo] ?? []).map(texto => ({
        texto,
        areaId: area.tipo,
        color:  area.color,
      }))
    )
}
