// src/lib/db/schema.js
// Forma canónica del árbol de datos y validadores. SPEC_02, §C5.1–§C5.5.
//
// Este archivo no toca almacenamiento: define qué campos existen, qué valores
// admiten y qué errores se lanzan. `shared.js` y `diario.js` lo importan, y no
// se importan entre sí.
//
// RN-DB4-08 — Nada se corrige en silencio. Un registro incompleto se rechaza al
// escribir o se devuelve tal cual al leer. La capa de datos no rellena huecos.

import { isDateKey } from './dates.js'

// ─── Errores ──────────────────────────────────────────────────────────────────

/**
 * Error de la capa de datos. `code` es estable y la interfaz decide qué copy
 * mostrar; el mensaje es para quien programa, no para quien usa la app.
 */
export class StrivoDataError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'StrivoDataError'
    this.code = code
    this.details = details
  }
}

export const ERROR_CODES = Object.freeze({
  UID_REQUIRED: 'UID_REQUIRED',
  ID_REQUIRED: 'ID_REQUIRED',
  DATE_INVALID: 'DATE_INVALID',
  UNKNOWN_FIELD: 'UNKNOWN_FIELD',
  FIELD_TYPE: 'FIELD_TYPE',
  MOOD_INVALID: 'MOOD_INVALID',
})

// ─── Enumeraciones (§7.2) ─────────────────────────────────────────────────────

export const MOODS = Object.freeze(['agotado', 'inquieto', 'normal', 'tranquilo', 'en_paz'])
export const GENDERS = Object.freeze(['m', 'f', 'n'])

// ─── Campos por registro (SPEC_02 §5) ─────────────────────────────────────────
// Cada lista es exhaustiva. Un campo que no esté aquí se rechaza al escribir:
// las specs posteriores amplían estas listas cuando su pantalla lo necesita.

export const FIELDS = Object.freeze({
  // shared/
  profile: Object.freeze(['name', 'gender', 'diaTerminaA', 'wakeTime', 'sleepTime', 'createdAt']),
  auth: Object.freeze(['uid', 'email', 'phone']),
  preferences: Object.freeze(['soundEnabled', 'reducedMotion']),
  onboarding: Object.freeze(['completedSteps', 'currentStep']),

  // diario/
  journal: Object.freeze(['date', 'text', 'emotions', 'otherText', 'createdAt', 'updatedAt']),
  // La mañana de tres momentos (actualización del 23 ago). `granVision` y
  // `emotions` salieron de la lista con las preguntas que los escribían: los
  // días ya guardados los conservan y el Historial los sigue leyendo, pero
  // nadie vuelve a escribirlos. Un intento lanza UNKNOWN_FIELD, que es lo
  // correcto: en `lib/db/` los registros los escribe el código.
  morningEntry: Object.freeze([
    'version',
    'updatedAt',
    'completedAt',
    'skipped',
    'feeling',
    'feelingOther',
    'intention',
    'intentionOther',
    'gratitude',
    'action',
    'reflectionId',
    'reflection',
  ]),
  // La noche de tres momentos (actualización del 23 ago). `gratitude`,
  // `learning`, `sleepState` y `sleepStateOther` salieron de la lista con las
  // preguntas que los escribían: las noches ya guardadas los conservan y el
  // Historial los sigue leyendo, pero nadie vuelve a escribirlos. Un intento
  // lanza UNKNOWN_FIELD, que es lo correcto: en `lib/db/` los registros los
  // escribe el código, y un campo fuera de lista es un error de programación.
  //
  // `inheritedWins` y `newWins` se retiraron antes, con las victorias y el
  // checklist de logros. Volver a nombrar cualquiera de los seis aquí los
  // reabriría a la escritura.
  nightRitual: Object.freeze([
    'version',
    'updatedAt',
    'completedAt',
    'skipped',
    'recognized',
    'reflectionId',
    'reflectionSource',
    'reflection',
    'closingFeeling',
    'closingFeelingOther',
    'release',
  ]),
  dayState: Object.freeze(['mood']),
  pinConfig: Object.freeze(['salt', 'hash', 'iterations', 'algorithm', 'enabled']),
})

// ─── Rutas (§C5.2) ────────────────────────────────────────────────────────────
// Firestore alterna colección/documento, así que una colección del árbol
// canónico se materializa como documento contenedor + subcolección `items`.
// La forma del árbol se conserva y toda ruta tiene un número par de segmentos.

export const paths = Object.freeze({
  sharedDoc: (uid, doc) => `users/${uid}/shared/${doc}`,
  diarioDoc: (uid, doc) => `users/${uid}/diario/${doc}`,
  diarioItem: (uid, collection, id) => `users/${uid}/diario/${collection}/items/${id}`,
})

/** Etiqueta de colección que agrupa los registros en el almacén local. */
export const COLLECTIONS = Object.freeze({
  shared: 'shared',
  journal: 'diario/journal',
  morningEntry: 'diario/morningEntry',
  nightRitual: 'diario/nightRitual',
  dayState: 'diario/dayState',
  diarioDoc: 'diario',
})

// ─── Validadores genéricos ────────────────────────────────────────────────────

/**
 * Verifica que un registro no traiga campos fuera de su definición.
 * Se rechaza en vez de descartarlos en silencio (RN-DB4-08).
 */
export function assertFields(record, allowed, label) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    throw new StrivoDataError(ERROR_CODES.FIELD_TYPE, `${label}: se esperaba un objeto.`, { label })
  }
  const unknown = Object.keys(record).filter((key) => !allowed.includes(key))
  if (unknown.length > 0) {
    throw new StrivoDataError(
      ERROR_CODES.UNKNOWN_FIELD,
      `${label}: campo fuera del modelo canónico: ${unknown.join(', ')}. ` +
        'Amplía SPEC_02 §5 antes de escribirlo.',
      { label, unknown },
    )
  }
  return record
}

export function assertUid(uid) {
  if (typeof uid !== 'string' || uid.length === 0) {
    throw new StrivoDataError(ERROR_CODES.UID_REQUIRED, 'Falta el uid del usuario.')
  }
  return uid
}

export function assertId(id, label = 'id') {
  if (typeof id !== 'string' || id.length === 0) {
    throw new StrivoDataError(ERROR_CODES.ID_REQUIRED, `Falta ${label}.`, { label })
  }
  return id
}

export function assertDateKey(date, label = 'date') {
  if (!isDateKey(date)) {
    throw new StrivoDataError(
      ERROR_CODES.DATE_INVALID,
      `${label}: se esperaba una fecha 'YYYY-MM-DD'.`,
      { label, date },
    )
  }
  return date
}

function assertEnum(value, allowed, code, label) {
  if (!allowed.includes(value)) {
    throw new StrivoDataError(
      code,
      `${label}: valor fuera de catálogo. Admitidos: ${allowed.join(', ')}.`,
      { label, value },
    )
  }
  return value
}

// ─── Validadores por registro ─────────────────────────────────────────────────

export function validateProfile(profile) {
  assertFields(profile, FIELDS.profile, 'shared/profile')
  if (profile.gender !== undefined && profile.gender !== null) {
    assertEnum(profile.gender, GENDERS, ERROR_CODES.FIELD_TYPE, 'profile.gender')
  }
  return profile
}

export function validatePreferences(preferences) {
  assertFields(preferences, FIELDS.preferences, 'shared/preferences')
  return preferences
}

export function validateJournalEntry(entry) {
  assertFields(entry, FIELDS.journal, 'diario/journal')
  if (entry.date !== undefined) assertDateKey(entry.date, 'journal.date')
  if (entry.emotions !== undefined && !Array.isArray(entry.emotions)) {
    throw new StrivoDataError(ERROR_CODES.FIELD_TYPE, 'journal.emotions: se esperaba un arreglo.')
  }
  return entry
}

export function validateDayState(dayState) {
  assertFields(dayState, FIELDS.dayState, 'diario/dayState')
  if (dayState.mood !== undefined && dayState.mood !== null) {
    assertEnum(dayState.mood, MOODS, ERROR_CODES.MOOD_INVALID, 'dayState.mood')
  }
  return dayState
}
