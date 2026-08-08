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

// ─── El foco: como máximo 3 áreas activas (§8.5-bis, D-03) ───────────────────
//
// No es una restricción del onboarding sino una regla del producto: las áreas
// dejan de ser una selección inicial y pasan a ser un foco intercambiable. Para
// activar una cuarta hay que soltar otra.
//
// Soltar no borra nada. La fila del área se conserva con su identidad de área,
// y sus hábitos, victorias e historial siguen intactos (RN-04): solo deja de
// estar activa. Al reactivarla, todo vuelve como estaba.
export const MAX_AREAS_ACTIVAS = 3

export class LimiteDeAreasError extends Error {
  constructor(max = MAX_AREAS_ACTIVAS) {
    super(`Como máximo ${max} áreas activas a la vez`)
    this.name = 'LimiteDeAreasError'
    this.max  = max
  }
}

// Las áreas activas de una lista de filas de área
export const areasActivas = areas => areas.filter(area => area.estado === 'activa')

// ─── La etiqueta de un hábito (§5.7) ─────────────────────────────────────────
//
// Un hábito se etiqueta con el NOMBRE DE SU ÁREA, y con nada más.
//
// Antes se etiquetaba con la identidad de área —el tercer nivel del modelo, la
// frase "se mueve porque le hace bien"— y el emparejamiento fallaba en cuanto
// el hábito no era del tipo que la frase describía: "Dormir a tiempo · se mueve
// porque le hace bien". El nivel 3 es demasiado específico para acertar siempre,
// así que la etiqueta sube al nivel 2, que es el que siempre encaja.
//
// Y ante la duda, nada. No hay "Sin área" ni "General" ni un guion: una etiqueta
// de relleno ocupa el mismo sitio que una de verdad y no dice nada.
//
// El nombre sale de @copy por tipo y no de `area.nombre`, que es lo que se
// escribió en la fila el día que se creó: así un área guardada como "Espiritual"
// se lee hoy "Espiritualidad", sin migrar nada.
//
// La identidad de área NO desaparece: se sigue usando donde sí encaja, que es el
// ritual de mañana (R3) y el perfil.
//
// @param {object} [area] - la fila del área del hábito, o undefined si no tiene
// @returns {{nombre: string, color: string}|null} null = no se etiqueta
export function etiquetaDeArea(area) {
  // Sin área, o con una que la persona ya no tiene entre las suyas (la soltó
  // para hacer sitio a otra, §8.5-bis): el hábito sigue igual, solo deja de
  // llevar etiqueta. Nada de lo suyo se pierde (RN-04).
  if (!area || area.estado !== 'activa') return null

  return {
    nombre: getAreaName(area.tipo),
    color:  area.color ?? areaColors[area.tipo],
  }
}

// ¿Cabe una más? `activas` son los tipos (o filas) ya activos sin contar la que
// se quiere activar.
export function cabeOtraArea(cuantasActivas) {
  return cuantasActivas < MAX_AREAS_ACTIVAS
}

// Recorta una lista de tipos al máximo permitido, conservando el orden en que
// se eligieron. Defensivo: la interfaz ya no deja pasar de tres.
export function limitarAreas(tipos) {
  return tipos.slice(0, MAX_AREAS_ACTIVAS)
}
