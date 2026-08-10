// src/lib/db/formia.js
// `formia/` — identidad construida, hábitos y su registro (§C5.1).
//
// RN-DB4-01 — Este módulo NO importa `lumia.js`, ni directa ni indirectamente.
// Ninguna función de aquí puede leer journal, victorias ni estados de ánimo.
// La regla está además impuesta por ESLint (`no-restricted-imports`).

import {
  deletePath,
  mergePath,
  newId,
  readCollection,
  readCollectionBy,
  readPath,
  writePath,
} from './local.js'
import {
  COLLECTIONS,
  ERROR_CODES,
  StrivoDataError,
  assertCentralIdentity,
  assertDateKey,
  assertId,
  assertIdentityRef,
  assertUid,
  emptyAreasMap,
  isValidIdentityRef,
  paths,
  validateAreasMap,
  validateHabit,
  validateHabitLog,
  validateIdentityVersion,
} from './schema.js'

// ─── identity (central + areas) ───────────────────────────────────────────────
// El árbol canónico tiene `identity/central` e `identity/areas` como dos hojas
// de la misma rama: se materializan como los dos campos de un documento.

function identitySpec(uid) {
  return {
    uid,
    path: paths.formiaDoc(uid, 'identity'),
    collection: COLLECTIONS.formiaDoc,
    id: 'identity',
  }
}

/** Devuelve `{ central, areas }`, o `null` si el árbol todavía no existe. */
export async function getIdentity(uid) {
  assertUid(uid)
  return readPath(paths.formiaDoc(uid, 'identity'))
}

export async function getCentralIdentity(uid) {
  const identity = await getIdentity(uid)
  return identity?.central ?? null
}

export async function getAreas(uid) {
  const identity = await getIdentity(uid)
  return identity?.areas ?? null
}

/** Áreas elegidas, en su orden de catálogo. Máximo 3 (§C3.9). */
export async function listSelectedAreas(uid) {
  const areas = (await getAreas(uid)) ?? {}
  return Object.entries(areas)
    .filter(([, area]) => area.selected === true)
    .map(([id, area]) => ({ id, ...area }))
    .sort((a, b) => a.order - b.order)
}

/**
 * RN-ID-01 / RN-DB4-09 — La identidad central siempre existe. Cambiarla cierra
 * la versión anterior en el historial y abre la nueva; no se pierde ninguna.
 */
export async function setCentralIdentity(uid, text) {
  assertUid(uid)
  assertCentralIdentity(text)
  const previous = await getCentralIdentity(uid)
  const now = new Date().toISOString()

  if (previous !== text) await appendIdentityVersion(uid, text, now)

  const data = await mergePath({ ...identitySpec(uid), patch: { central: text } })
  return data.central
}

export async function setAreas(uid, areas) {
  assertUid(uid)
  validateAreasMap(areas)
  const data = await mergePath({ ...identitySpec(uid), patch: { areas } })
  return data.areas
}

/**
 * Cambia una sola área conservando el resto del mapa.
 * RN-ID-04 — Pausar o quitar un área nunca borra nada: `selected` y `state`
 * cambian lo que se muestra, no lo que existe.
 */
export async function updateArea(uid, areaId, patch) {
  assertUid(uid)
  const areas = (await getAreas(uid)) ?? emptyAreasMap()
  const next = { ...areas, [areaId]: { ...areas[areaId], ...patch } }
  return setAreas(uid, next)
}

// ─── identityHistory ──────────────────────────────────────────────────────────
// §5.1.1 exige historial de versiones de la identidad. Cada versión guarda su
// texto y su vigencia; `to: null` marca la versión en curso.

function historySpec(uid) {
  return {
    uid,
    path: paths.formiaDoc(uid, 'identityHistory'),
    collection: COLLECTIONS.formiaDoc,
    id: 'identityHistory',
  }
}

/** Devuelve el arreglo de versiones, de la más antigua a la más reciente. */
export async function getIdentityHistory(uid) {
  assertUid(uid)
  const record = await readPath(paths.formiaDoc(uid, 'identityHistory'))
  return record?.versions ?? []
}

export async function appendIdentityVersion(uid, text, at = new Date().toISOString()) {
  assertUid(uid)
  const version = { text, from: at, to: null }
  validateIdentityVersion(version)

  const versions = await getIdentityHistory(uid)
  const closed = versions.map((entry) =>
    entry.to === null ? { ...entry, to: at } : entry,
  )
  await writePath({ ...historySpec(uid), data: { versions: [...closed, version] } })
  return version
}

// ─── habits ───────────────────────────────────────────────────────────────────

function habitSpec(uid, habitId) {
  return {
    uid,
    path: paths.formiaItem(uid, 'habits', habitId),
    collection: COLLECTIONS.habits,
    id: habitId,
  }
}

/**
 * RN-DB4-05 — Un hábito sin `identityRef` se rechaza aquí, antes de tocar
 * IndexedDB. No hay valor por defecto y no se asigna la identidad central por
 * cortesía: la elección es de la persona (RN-FO-H3-05).
 */
export async function createHabit(uid, habit) {
  assertUid(uid)
  const areas = await getAreas(uid)
  validateHabit(habit, areas)

  const habitId = newId()
  const data = {
    context: null,
    emoji: null,
    createdAt: new Date().toISOString(),
    state: 'activo',
    ...habit,
  }
  await writePath({ ...habitSpec(uid, habitId), data })
  return { id: habitId, ...data }
}

/**
 * RN-FO-H3-03 — Editar un hábito permite **cambiar** de identidad, nunca
 * quitarla. Un `identityRef` presente en el parche se valida; ausente, se
 * conserva el que ya tenía.
 */
export async function updateHabit(uid, habitId, patch) {
  assertUid(uid)
  assertId(habitId, 'habitId')

  const current = await readPath(paths.formiaItem(uid, 'habits', habitId))
  if (current === null) {
    throw new StrivoDataError(
      ERROR_CODES.HABIT_NOT_FOUND,
      `formia/habits: no existe el hábito ${habitId}.`,
      { habitId },
    )
  }

  const areas = await getAreas(uid)
  const merged = { ...current, ...patch }
  validateHabit(merged, areas)

  const data = await mergePath({ ...habitSpec(uid, habitId), patch })
  return { id: habitId, ...data }
}

export async function getHabit(uid, habitId) {
  assertUid(uid)
  assertId(habitId, 'habitId')
  return readPath(paths.formiaItem(uid, 'habits', habitId))
}

export async function listHabits(uid) {
  assertUid(uid)
  return readCollection(uid, COLLECTIONS.habits)
}

/** RN-FO-ID-04 — Agrupar por identidad es una consulta, no un campo nuevo. */
export async function listHabitsByIdentity(uid, identityRef) {
  assertUid(uid)
  assertIdentityRef(identityRef)
  return readCollectionBy(uid, COLLECTIONS.habits, 'identityRef', identityRef)
}

export async function deleteHabit(uid, habitId) {
  assertUid(uid)
  assertId(habitId, 'habitId')
  await deletePath({ uid, path: paths.formiaItem(uid, 'habits', habitId) })
}

/**
 * RN-DB4-08 — Devuelve los hábitos cuyo `identityRef` falta o no tiene destino,
 * para que la interfaz los ponga a revisión de la persona. **No los repara ni
 * los descarta:** asignar una identidad en silencio está prohibido.
 */
export async function findHabitsNeedingReview(uid) {
  const areas = await getAreas(uid)
  const habits = await listHabits(uid)
  return habits.filter((habit) => !isValidIdentityRef(habit.identityRef, areas))
}

// ─── habitLogs ────────────────────────────────────────────────────────────────
// RN-06 — Solo hay filas de completado. No existe fila que diga que algo no se
// hizo: la ausencia es ausencia y nunca genera un registro.

/** Clave única {habitId, date}: marcar cinco veces produce **un** registro. */
export function habitLogId(habitId, date) {
  return `${habitId}_${date}`
}

export async function getHabitLog(uid, habitId, date) {
  assertUid(uid)
  assertId(habitId, 'habitId')
  assertDateKey(date)
  return readPath(paths.formiaItem(uid, 'habitLogs', habitLogId(habitId, date)))
}

/**
 * Marca un hábito. Idempotente: si ya está marcado ese día, devuelve el
 * registro que ya existía sin mover su hora ni añadir otra fila.
 */
export async function markHabit(uid, habitId, date) {
  assertUid(uid)
  const existing = await getHabitLog(uid, habitId, date)
  if (existing !== null) return { id: habitLogId(habitId, date), ...existing }

  const data = { habitId, date, completedAt: new Date().toISOString() }
  validateHabitLog(data)

  const logId = habitLogId(habitId, date)
  await writePath({
    uid,
    path: paths.formiaItem(uid, 'habitLogs', logId),
    collection: COLLECTIONS.habitLogs,
    id: logId,
    data,
  })
  return { id: logId, ...data }
}

/** Deshace una marca. Borra la fila: la ausencia vuelve a ser ausencia. */
export async function unmarkHabit(uid, habitId, date) {
  assertUid(uid)
  assertId(habitId, 'habitId')
  assertDateKey(date)
  await deletePath({
    uid,
    path: paths.formiaItem(uid, 'habitLogs', habitLogId(habitId, date)),
  })
}

export async function listHabitLogs(uid) {
  assertUid(uid)
  return readCollection(uid, COLLECTIONS.habitLogs)
}

export async function listHabitLogsByDate(uid, date) {
  assertUid(uid)
  assertDateKey(date)
  return readCollectionBy(uid, COLLECTIONS.habitLogs, 'date', date)
}

export async function listHabitLogsByHabit(uid, habitId) {
  assertUid(uid)
  assertId(habitId, 'habitId')
  return readCollectionBy(uid, COLLECTIONS.habitLogs, 'habitId', habitId)
}

// ─── Árbol de un usuario nuevo ────────────────────────────────────────────────

/**
 * Crea `formia/identity` con la identidad central y las 7 áreas del catálogo
 * sin seleccionar.
 *
 * `identityCentral` es obligatorio: RN-DB4-09 exige que la identidad central
 * exista siempre, y RN-DB4-08 prohíbe inventarla. La escribe el onboarding con
 * las palabras de la persona.
 */
export async function initFormia(uid, { identityCentral } = {}) {
  assertUid(uid)
  assertCentralIdentity(identityCentral)

  await writePath({
    ...identitySpec(uid),
    data: { central: identityCentral, areas: emptyAreasMap() },
  })
  await appendIdentityVersion(uid, identityCentral)
  return ['identity', 'identityHistory']
}
