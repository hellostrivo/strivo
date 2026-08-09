// src/copy/resolve.js
// Resolvedor único de las variantes de género del copy (§2.4).
//
// Un string sin variación de género se queda como string. Solo los que cambian
// se declaran como { m, f, n } en @copy. Convertir strings neutros en objetos de
// tres claves idénticas ensucia la biblioteca y obliga a mantener tres copias de
// lo mismo (§2.3).
//
// Ante cualquier hueco se cae hacia la variante neutra: la app nunca se queda
// sin copy que mostrar.

import { DEFAULT_GENDER_MODE } from '@lib/gender'

export function resolveCopy(entry, genderMode = DEFAULT_GENDER_MODE) {
  if (typeof entry === 'string') return entry
  // Listas de sugerencias (los ejemplos de P4, las opciones de P3): cada
  // elemento puede tener variantes o no.
  if (Array.isArray(entry)) return entry.map(item => resolveCopy(item, genderMode))
  if (!entry || typeof entry !== 'object') return entry
  if (!hasVariants(entry)) return entry
  return entry[genderMode] ?? entry.n ?? entry.m
}

// Un objeto es una entrada con variantes solo si declara las tres claves. Así
// un subárbol del copy (onboarding.p4, por ejemplo) se devuelve tal cual en vez
// de intentar resolverse como si fuera una frase.
export function hasVariants(entry) {
  return (
    !!entry &&
    typeof entry === 'object' &&
    !Array.isArray(entry) &&
    typeof entry.m === 'string' &&
    typeof entry.f === 'string' &&
    typeof entry.n === 'string'
  )
}
