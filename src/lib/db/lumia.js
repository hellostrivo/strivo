// src/lib/db/lumia.js
// `lumia/` — todo lo que la persona escribe, siente y reflexiona (§C5.1).
//
// RN-DB4-01 — Este módulo NO importa `formia.js`, ni directa ni indirectamente.
// Ninguna función de aquí puede leer hábitos, identidad ni registros de Formia.
// La regla está además impuesta por ESLint (`no-restricted-imports`).

import {
  deletePath,
  mergePath,
  newId,
  readCollection,
  readCollectionByDate,
  readPath,
  writePath,
} from './local.js'
import {
  COLLECTIONS,
  FIELDS,
  assertDateKey,
  assertFields,
  assertId,
  assertUid,
  paths,
  validateDayState,
  validateJournalEntry,
} from './schema.js'

// ─── journal ──────────────────────────────────────────────────────────────────
// Escritura libre. RN-DB-05: no se cifra en local en Fase 1; el PIN protege el
// acceso a la superficie, no el reposo del dato.

function journalSpec(uid, entryId) {
  return {
    uid,
    path: paths.lumiaItem(uid, 'journal', entryId),
    collection: COLLECTIONS.journal,
    id: entryId,
  }
}

export async function createJournalEntry(uid, entry) {
  assertUid(uid)
  validateJournalEntry(entry)
  const entryId = newId()
  const now = new Date().toISOString()
  const data = { createdAt: now, updatedAt: now, ...entry }
  await writePath({ ...journalSpec(uid, entryId), data })
  return { id: entryId, ...data }
}

export async function updateJournalEntry(uid, entryId, patch) {
  assertUid(uid)
  assertId(entryId, 'entryId')
  validateJournalEntry(patch)
  const data = await mergePath({
    ...journalSpec(uid, entryId),
    patch: { ...patch, updatedAt: new Date().toISOString() },
  })
  return { id: entryId, ...data }
}

export async function getJournalEntry(uid, entryId) {
  assertUid(uid)
  assertId(entryId, 'entryId')
  return readPath(paths.lumiaItem(uid, 'journal', entryId))
}

export async function listJournalEntries(uid) {
  assertUid(uid)
  const entries = await readCollection(uid, COLLECTIONS.journal)
  return entries.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}

export async function listJournalEntriesByDate(uid, date) {
  assertUid(uid)
  assertDateKey(date)
  return readCollectionByDate(uid, COLLECTIONS.journal, date)
}

export async function deleteJournalEntry(uid, entryId) {
  assertUid(uid)
  assertId(entryId, 'entryId')
  await deletePath({ uid, path: paths.lumiaItem(uid, 'journal', entryId) })
}

// ─── morningEntry ─────────────────────────────────────────────────────────────

export async function getMorningEntry(uid, date) {
  assertUid(uid)
  assertDateKey(date)
  return readPath(paths.lumiaItem(uid, 'morningEntry', date))
}

export async function saveMorningEntry(uid, date, entry) {
  assertUid(uid)
  assertDateKey(date)
  assertFields(entry, FIELDS.morningEntry, 'lumia/morningEntry')
  return mergePath({
    uid,
    path: paths.lumiaItem(uid, 'morningEntry', date),
    collection: COLLECTIONS.morningEntry,
    id: date,
    patch: entry,
  })
}

// ─── nightRitual ──────────────────────────────────────────────────────────────
// La secuencia de cierre nunca falla: guardar es un merge parcial, así que cada
// pantalla del ritual escribe lo suyo y ninguna depende de las demás.

export async function getNightRitual(uid, date) {
  assertUid(uid)
  assertDateKey(date)
  return readPath(paths.lumiaItem(uid, 'nightRitual', date))
}

export async function saveNightRitual(uid, date, ritual) {
  assertUid(uid)
  assertDateKey(date)
  assertFields(ritual, FIELDS.nightRitual, 'lumia/nightRitual')
  return mergePath({
    uid,
    path: paths.lumiaItem(uid, 'nightRitual', date),
    collection: COLLECTIONS.nightRitual,
    id: date,
    patch: ritual,
  })
}

// ─── dayState ─────────────────────────────────────────────────────────────────

export async function getDayState(uid, date) {
  assertUid(uid)
  assertDateKey(date)
  return readPath(paths.lumiaItem(uid, 'dayState', date))
}

export async function saveDayState(uid, date, dayState) {
  assertUid(uid)
  assertDateKey(date)
  validateDayState(dayState)
  return mergePath({
    uid,
    path: paths.lumiaItem(uid, 'dayState', date),
    collection: COLLECTIONS.dayState,
    id: date,
    patch: dayState,
  })
}

export async function listDayStates(uid) {
  assertUid(uid)
  return readCollection(uid, COLLECTIONS.dayState)
}

// ─── pinConfig ────────────────────────────────────────────────────────────────
// RN-DB-04 — El PIN no sale del dispositivo. Estas tres funciones son las
// únicas de toda la capa de datos que escriben con `sync: false`: nunca se
// encolan hacia Firestore.

const PIN_SYNC = false

export async function getPinConfig(uid) {
  assertUid(uid)
  return readPath(paths.lumiaDoc(uid, 'pinConfig'))
}

export async function savePinConfig(uid, pinConfig) {
  assertUid(uid)
  assertFields(pinConfig, FIELDS.pinConfig, 'lumia/pinConfig')
  return writePath({
    uid,
    path: paths.lumiaDoc(uid, 'pinConfig'),
    collection: COLLECTIONS.lumiaDoc,
    id: 'pinConfig',
    data: pinConfig,
    sync: PIN_SYNC,
  })
}

export async function clearPinConfig(uid) {
  assertUid(uid)
  await deletePath({ uid, path: paths.lumiaDoc(uid, 'pinConfig'), sync: PIN_SYNC })
}

// ─── Árbol de un usuario nuevo ────────────────────────────────────────────────

/**
 * `lumia/` no necesita ningún registro inicial: journal, morningEntry,
 * nightRitual y dayState nacen vacíos y pinConfig no existe hasta que alguien
 * decide poner un PIN.
 *
 * Se declara para que `initUserTree()` documente la rama, no para escribirla:
 * crear un día vacío inventaría un registro que nadie escribió (RN-DB4-08).
 */
export async function initLumia(uid) {
  assertUid(uid)
  return []
}
