// src/lib/areas.js
// Catálogo de áreas de identidad (§5.1.1).
//
// Un área = una dirección en la que alguien crece. Son 0..N: no elegir ninguna
// es una respuesta válida, y todo lo que se registre entonces vive en "General"
// (areaId = null) heredando la identidad central.
//
// Nombre visible → @copy · color → @tokens · orden canónico → aquí.
//
// Nota: @tokens exporta también `areaIcons`, pero son emoji provisionales y el
// sistema no muestra emoji fuera de la tabla de emociones (§3.6). Hasta tener
// íconos propios, el área se distingue por su color (el punto del Chip).

import { copy } from '@copy'
import { areaColors } from '@tokens'

export const AREA_TYPES = [
  'salud',
  'trabajo',
  'relaciones',
  'finanzas',
  'espiritual',
  'personal',
  'creatividad',
]

export const AREAS = AREA_TYPES.map(tipo => ({
  tipo,
  nombre: copy.areas[tipo],
  color:  areaColors[tipo],
}))

export function getAreaName(tipo) {
  return copy.areas[tipo] ?? tipo
}
