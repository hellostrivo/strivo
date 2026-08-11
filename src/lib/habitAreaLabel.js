// src/lib/habitAreaLabel.js
// La regla de etiquetado de §5.7.4, en un solo sitio.
//
// RN-HAB-AREA-01 — Existe **un solo** helper. Ninguna pantalla puede
// reimplementar esta lógica ni añadirle excepciones locales: duplicar la regla
// fue la causa original del defecto que §5.7.4 vino a corregir.
//
// Qué se muestra junto a un hábito: **el nombre del área, o nada en absoluto**.
// Nunca la frase de identidad de área — "Dormir a tiempo" no es "alguien que
// cuida su cuerpo", y afirmarlo suena a plantilla. La frase vive donde está
// bien contextualizada: el espacio de identidad (§C3.3).
//
// En v4.1 el campo se llama `identityRef` y ya no admite `null` (§C5.4), así
// que la regla se lee sobre él. `identityRef = "central"` no produce etiqueta:
// la identidad central no es un área y repetirla en cada fila sería la misma
// plantilla que §5.7.4 evita.

import { AREA_IDS } from '@/lib/db'
import { copy } from '@copy'

/**
 * @param {object} habit - Necesita `identityRef`.
 * @param {object} [areas] - Mapa `formia/identity/areas` del usuario.
 * @returns {{areaId: string, nombre: string, color: string}|null}
 *
 * Devuelve `null` —y quien lo recibe **no renderiza el nodo, no reserva alto**—
 * cuando el hábito cuelga de la identidad central, cuando su área no existe, o
 * cuando esa área no está entre las seleccionadas ahora mismo.
 *
 * RN-HAB-AREA-04 — Deseleccionar un área hace desaparecer sus etiquetas al
 * instante, sin tocar los hábitos: `identityRef` no se borra nunca y la
 * etiqueta vuelve sola si el área se reactiva.
 */
export function areaLabelForHabit(habit, areas) {
  const areaId = habit?.identityRef
  if (!AREA_IDS.includes(areaId)) return null

  const area = areas?.[areaId]
  if (!area) return null
  if (area.selected !== true) return null

  return {
    areaId,
    nombre: copy.formia.identidad.areas.names[areaId],
    color: area.color,
  }
}

export default areaLabelForHabit
