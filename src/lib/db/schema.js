// src/lib/db/schema.js
// Forma canónica del árbol de datos y validadores. SPEC_02, §C5.1–§C5.5.
//
// Este archivo no toca almacenamiento: define qué campos existen, qué valores
// admiten y qué errores se lanzan. `shared.js`, `lumia.js` y `formia.js` lo
// importan; ninguno de ellos importa a los otros dos (RN-DB4-01).
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
  HABIT_NAME_REQUIRED: 'HABIT_NAME_REQUIRED',
  HABIT_IDENTITY_REQUIRED: 'HABIT_IDENTITY_REQUIRED',
  HABIT_IDENTITY_UNKNOWN: 'HABIT_IDENTITY_UNKNOWN',
  HABIT_CONTEXT_INVALID: 'HABIT_CONTEXT_INVALID',
  HABIT_NOT_FOUND: 'HABIT_NOT_FOUND',
  STATE_INVALID: 'STATE_INVALID',
  AREA_UNKNOWN: 'AREA_UNKNOWN',
  AREAS_MAX_SELECTED: 'AREAS_MAX_SELECTED',
  IDENTITY_CENTRAL_REQUIRED: 'IDENTITY_CENTRAL_REQUIRED',
  MOOD_INVALID: 'MOOD_INVALID',
})

// ─── Catálogo de áreas (§C5.4, aviso 1) ───────────────────────────────────────
// Las 7 áreas son un catálogo cerrado con `areaId` estables. Color e ícono
// vienen del sistema de diseño (§6.3.2) y viven aquí porque el mapa
// `formia/identity/areas` los guarda por área.

export const AREA_IDS = Object.freeze([
  'salud',
  'trabajo',
  'relaciones',
  'espiritualidad',
  'crecimiento',
  'finanzas',
  'creatividad',
])

export const AREA_CATALOG = Object.freeze({
  salud: { color: '#7E9E86', icon: 'salud', order: 0 },
  trabajo: { color: '#93A9C4', icon: 'trabajo', order: 1 },
  relaciones: { color: '#C9836B', icon: 'relaciones', order: 2 },
  espiritualidad: { color: '#8B6BA8', icon: 'espiritualidad', order: 3 },
  crecimiento: { color: '#D9CFC4', icon: 'crecimiento', order: 4 },
  finanzas: { color: '#E5A25C', icon: 'finanzas', order: 5 },
  creatividad: { color: '#FFE4C4', icon: 'creatividad', order: 6 },
})

/** Máximo de áreas con `selected: true` (§C3.9, P3B). */
export const MAX_SELECTED_AREAS = 3

/** Valor literal de `identityRef` que apunta a la identidad central. */
export const IDENTITY_CENTRAL = 'central'

// ─── Enumeraciones (§7.2) ─────────────────────────────────────────────────────

export const AREA_STATES = Object.freeze(['activa', 'pausada', 'archivada'])
export const HABIT_STATES = Object.freeze(['activo', 'pausado', 'archivado'])
export const HABIT_CONTEXTS = Object.freeze(['manana', 'noche'])
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

  // lumia/
  journal: Object.freeze(['date', 'text', 'emotions', 'otherText', 'createdAt', 'updatedAt']),
  morningEntry: Object.freeze(['granVision', 'gratitude', 'emotions']),
  // `inheritedWins` y `newWins` se retiraron el 23 ago con las victorias y el
  // checklist de logros. Los días ya escritos conservan sus datos en el
  // almacén; nadie los lee, y volver a nombrarlos aquí los reabriría a la
  // escritura.
  nightRitual: Object.freeze(['gratitude', 'learning', 'sleepState', 'sleepStateOther']),
  dayState: Object.freeze(['mood']),
  pinConfig: Object.freeze(['salt', 'hash', 'iterations', 'algorithm', 'enabled']),

  // formia/
  area: Object.freeze(['selected', 'identityText', 'color', 'icon', 'order', 'state']),
  identityVersion: Object.freeze(['text', 'from', 'to']),
  habit: Object.freeze(['name', 'identityRef', 'context', 'emoji', 'createdAt', 'state']),
  habitLog: Object.freeze(['habitId', 'date', 'completedAt']),
})

// ─── Rutas (§C5.2) ────────────────────────────────────────────────────────────
// Firestore alterna colección/documento, así que una colección del árbol
// canónico se materializa como documento contenedor + subcolección `items`.
// La forma del árbol se conserva y toda ruta tiene un número par de segmentos.

export const paths = Object.freeze({
  sharedDoc: (uid, doc) => `users/${uid}/shared/${doc}`,
  lumiaDoc: (uid, doc) => `users/${uid}/lumia/${doc}`,
  lumiaItem: (uid, collection, id) => `users/${uid}/lumia/${collection}/items/${id}`,
  formiaDoc: (uid, doc) => `users/${uid}/formia/${doc}`,
  formiaItem: (uid, collection, id) => `users/${uid}/formia/${collection}/items/${id}`,
})

/** Etiqueta de colección que agrupa los registros en el almacén local. */
export const COLLECTIONS = Object.freeze({
  shared: 'shared',
  journal: 'lumia/journal',
  morningEntry: 'lumia/morningEntry',
  nightRitual: 'lumia/nightRitual',
  dayState: 'lumia/dayState',
  lumiaDoc: 'lumia',
  habits: 'formia/habits',
  habitLogs: 'formia/habitLogs',
  formiaDoc: 'formia',
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

// ─── Validadores de identidad (§C5.5) ─────────────────────────────────────────

export function isAreaId(value) {
  return typeof value === 'string' && AREA_IDS.includes(value)
}

/**
 * ¿`identityRef` apunta a un destino existente?
 *
 * RN-DB4-06 — Solo la cadena "central" o un areaId del catálogo.
 * RN-DB4-07 — Un área con `selected: false` sigue siendo destino válido: dejar
 * de mostrarse no rompe el vínculo.
 *
 * @param {unknown} identityRef
 * @param {object}  [areas] - Mapa `formia/identity/areas`, si se quiere exigir
 *                            que el área esté presente en el mapa del usuario.
 * @returns {boolean}
 */
export function isValidIdentityRef(identityRef, areas = null) {
  if (identityRef === IDENTITY_CENTRAL) return true
  if (!isAreaId(identityRef)) return false
  if (areas === null) return true
  return Object.prototype.hasOwnProperty.call(areas, identityRef)
}

/**
 * RN-DB4-05 — Una escritura sin `identityRef` se rechaza aquí, en la capa de
 * datos, no solo en la interfaz. No hay valor por defecto.
 */
export function assertIdentityRef(identityRef, areas = null) {
  if (identityRef === null || identityRef === undefined || identityRef === '') {
    throw new StrivoDataError(
      ERROR_CODES.HABIT_IDENTITY_REQUIRED,
      'identityRef es obligatorio en un hábito: "central" o un areaId (RN-DB4-05).',
    )
  }
  if (!isValidIdentityRef(identityRef, areas)) {
    throw new StrivoDataError(
      ERROR_CODES.HABIT_IDENTITY_UNKNOWN,
      `identityRef sin destino: ${String(identityRef)} (RN-DB4-06).`,
      { identityRef },
    )
  }
  return identityRef
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
  assertFields(entry, FIELDS.journal, 'lumia/journal')
  if (entry.date !== undefined) assertDateKey(entry.date, 'journal.date')
  if (entry.emotions !== undefined && !Array.isArray(entry.emotions)) {
    throw new StrivoDataError(ERROR_CODES.FIELD_TYPE, 'journal.emotions: se esperaba un arreglo.')
  }
  return entry
}

export function validateDayState(dayState) {
  assertFields(dayState, FIELDS.dayState, 'lumia/dayState')
  if (dayState.mood !== undefined && dayState.mood !== null) {
    assertEnum(dayState.mood, MOODS, ERROR_CODES.MOOD_INVALID, 'dayState.mood')
  }
  return dayState
}

export function validateAreasMap(areas) {
  if (areas === null || typeof areas !== 'object' || Array.isArray(areas)) {
    throw new StrivoDataError(ERROR_CODES.FIELD_TYPE, 'identity/areas: se esperaba un mapa.')
  }
  const ids = Object.keys(areas)
  const unknown = ids.filter((id) => !AREA_IDS.includes(id))
  if (unknown.length > 0) {
    throw new StrivoDataError(
      ERROR_CODES.AREA_UNKNOWN,
      `identity/areas: área fuera del catálogo: ${unknown.join(', ')}.`,
      { unknown },
    )
  }
  ids.forEach((id) => {
    assertFields(areas[id], FIELDS.area, `identity/areas.${id}`)
    if (areas[id].state !== undefined && areas[id].state !== null) {
      assertEnum(areas[id].state, AREA_STATES, ERROR_CODES.STATE_INVALID, `areas.${id}.state`)
    }
  })
  const selected = ids.filter((id) => areas[id].selected === true)
  if (selected.length > MAX_SELECTED_AREAS) {
    throw new StrivoDataError(
      ERROR_CODES.AREAS_MAX_SELECTED,
      `identity/areas: máximo ${MAX_SELECTED_AREAS} áreas seleccionadas.`,
      { selected },
    )
  }
  return areas
}

/**
 * RN-DB4-05 y RN-DB4-06 — Puerta de entrada de un hábito.
 * @param {object} habit
 * @param {object} [areas] - Mapa de áreas del usuario, para comprobar destino.
 */
export function validateHabit(habit, areas = null) {
  assertFields(habit, FIELDS.habit, 'formia/habits')

  if (typeof habit.name !== 'string' || habit.name.trim().length === 0) {
    throw new StrivoDataError(
      ERROR_CODES.HABIT_NAME_REQUIRED,
      'formia/habits: el hábito necesita un nombre.',
    )
  }

  assertIdentityRef(habit.identityRef, areas)

  // `context` es solo etiqueta de momento del día (§C5.4). No implica
  // pertenencia a ningún ritual: el Ritual de Noche no muestra hábitos.
  if (habit.context !== undefined && habit.context !== null) {
    if (!HABIT_CONTEXTS.includes(habit.context)) {
      throw new StrivoDataError(
        ERROR_CODES.HABIT_CONTEXT_INVALID,
        `formia/habits: context admite ${HABIT_CONTEXTS.join(', ')} o null.`,
        { context: habit.context },
      )
    }
  }

  if (habit.state !== undefined && habit.state !== null) {
    assertEnum(habit.state, HABIT_STATES, ERROR_CODES.STATE_INVALID, 'habit.state')
  }

  return habit
}

/**
 * RN-06 — `habitLogs` solo tiene filas de completado. No existe fila que diga
 * que algo no se hizo: la ausencia es ausencia.
 */
export function validateHabitLog(log) {
  assertFields(log, FIELDS.habitLog, 'formia/habitLogs')
  assertId(log.habitId, 'habitLog.habitId')
  assertDateKey(log.date, 'habitLog.date')
  return log
}

export function validateIdentityVersion(version) {
  assertFields(version, FIELDS.identityVersion, 'formia/identityHistory')
  if (typeof version.text !== 'string' || version.text.trim().length === 0) {
    throw new StrivoDataError(
      ERROR_CODES.IDENTITY_CENTRAL_REQUIRED,
      'formia/identityHistory: cada versión guarda su texto.',
    )
  }
  return version
}

/** RN-DB4-09 / RN-ID-01 — La identidad central siempre existe. */
export function assertCentralIdentity(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new StrivoDataError(
      ERROR_CODES.IDENTITY_CENTRAL_REQUIRED,
      'formia/identity/central siempre existe (RN-DB4-09). No se escribe vacía.',
    )
  }
  return text
}

/**
 * Mapa de áreas de un usuario nuevo: las 7 del catálogo, ninguna seleccionada.
 * Los atributos de presentación vienen del catálogo cerrado; lo que es del
 * usuario (`selected`, `identityText`) queda vacío hasta que lo elija.
 */
export function emptyAreasMap() {
  const areas = {}
  AREA_IDS.forEach((id) => {
    areas[id] = {
      selected: false,
      identityText: null,
      color: AREA_CATALOG[id].color,
      icon: AREA_CATALOG[id].icon,
      order: AREA_CATALOG[id].order,
      state: 'activa',
    }
  })
  return areas
}
