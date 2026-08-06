// src/lib/gender.js
// Modelo del lenguaje adaptativo por género (§2.2 del documento de cambios).
//
// `gender` es lo que la persona contestó en P2A y puede quedarse en null.
// `genderMode` es lo que consume el copy, y NUNCA es null: sin respuesta, sin
// perfil o ante cualquier fallo de lectura, la app cae en 'n' y sigue teniendo
// algo que decir.
//
// Nombre visible de cada opción → @copy (onboarding.p2a.options).

export const GENDER_OPTIONS = [
  'masculino',
  'femenino',
  'prefiero_no_contestar',
  'otro',
]

export const DEFAULT_GENDER_MODE = 'n'

const MODES = {
  masculino: 'm',
  femenino:  'f',
  // "Prefiero no contestar" y "Otro" comparten modo: los dos piden una redacción
  // neutra. Se guardan distintos porque no significan lo mismo, y lo que la
  // persona contestó no se sobrescribe con lo que la app hace con ello.
  prefiero_no_contestar: 'n',
  otro:                  'n',
}

export function deriveGenderMode(gender) {
  return MODES[gender] ?? DEFAULT_GENDER_MODE
}

export function isGenderMode(value) {
  return value === 'm' || value === 'f' || value === 'n'
}

// Normaliza lo que venga del almacén: cualquier valor que no sea del catálogo
// (un perfil viejo, un dato a medio migrar) se lee como "sin respuesta".
export function normalizeGender(gender) {
  return GENDER_OPTIONS.includes(gender) ? gender : null
}
