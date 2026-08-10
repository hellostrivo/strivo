// src/lib/db/shared.js
// `shared/` — lo que Lumia, Formia y Strivo necesitan por igual (§C5.1).
//
// RN-DB4-02 — Si un dato hace falta en los dos espacios y no está aquí, es un
// error de diseño, no un caso a resolver con una copia.
//
// Este módulo no importa `lumia.js` ni `formia.js`.

import { readPath, writePath, mergePath } from './local.js'
import {
  COLLECTIONS,
  FIELDS,
  assertFields,
  assertUid,
  paths,
  validatePreferences,
  validateProfile,
} from './schema.js'
import { DEFAULT_DIA_TERMINA_A } from './dates.js'

const SHARED_DOCS = Object.freeze(['profile', 'auth', 'preferences', 'onboarding'])

function docSpec(uid, doc) {
  return {
    uid,
    path: paths.sharedDoc(uid, doc),
    collection: COLLECTIONS.shared,
    id: doc,
  }
}

// ─── profile ──────────────────────────────────────────────────────────────────

export async function getProfile(uid) {
  assertUid(uid)
  return readPath(paths.sharedDoc(uid, 'profile'))
}

export async function saveProfile(uid, profile) {
  assertUid(uid)
  validateProfile(profile)
  return writePath({ ...docSpec(uid, 'profile'), data: profile })
}

export async function updateProfile(uid, patch) {
  assertUid(uid)
  validateProfile(patch)
  return mergePath({ ...docSpec(uid, 'profile'), patch })
}

/**
 * Hora a la que termina el día de esta persona (RN-DB-01).
 * Devuelve el valor por defecto solo si el perfil todavía no lo declara; no lo
 * escribe en el perfil (RN-DB4-08).
 */
export async function getDiaTerminaA(uid) {
  const profile = await getProfile(uid)
  return profile?.diaTerminaA ?? DEFAULT_DIA_TERMINA_A
}

// ─── auth ─────────────────────────────────────────────────────────────────────

export async function getAuthRecord(uid) {
  assertUid(uid)
  return readPath(paths.sharedDoc(uid, 'auth'))
}

export async function saveAuthRecord(uid, auth) {
  assertUid(uid)
  assertFields(auth, FIELDS.auth, 'shared/auth')
  return writePath({ ...docSpec(uid, 'auth'), data: auth })
}

// ─── preferences ──────────────────────────────────────────────────────────────

export async function getPreferences(uid) {
  assertUid(uid)
  return readPath(paths.sharedDoc(uid, 'preferences'))
}

export async function savePreferences(uid, preferences) {
  assertUid(uid)
  validatePreferences(preferences)
  return writePath({ ...docSpec(uid, 'preferences'), data: preferences })
}

export async function updatePreferences(uid, patch) {
  assertUid(uid)
  validatePreferences(patch)
  return mergePath({ ...docSpec(uid, 'preferences'), patch })
}

// ─── onboarding ───────────────────────────────────────────────────────────────

export async function getOnboarding(uid) {
  assertUid(uid)
  return readPath(paths.sharedDoc(uid, 'onboarding'))
}

export async function saveOnboarding(uid, onboarding) {
  assertUid(uid)
  assertFields(onboarding, FIELDS.onboarding, 'shared/onboarding')
  return writePath({ ...docSpec(uid, 'onboarding'), data: onboarding })
}

export async function updateOnboarding(uid, patch) {
  assertUid(uid)
  assertFields(patch, FIELDS.onboarding, 'shared/onboarding')
  return mergePath({ ...docSpec(uid, 'onboarding'), patch })
}

// ─── Árbol de un usuario nuevo ────────────────────────────────────────────────

/**
 * Crea las cuatro ramas de `shared/` (§C5.2).
 * Lo llama `initUserTree()` de `index.js`, que es quien monta el árbol entero.
 */
export async function initShared(uid, { profile, auth, preferences, onboarding } = {}) {
  assertUid(uid)
  await saveProfile(uid, {
    name: null,
    gender: 'n',
    diaTerminaA: DEFAULT_DIA_TERMINA_A,
    wakeTime: null,
    sleepTime: null,
    createdAt: new Date().toISOString(),
    ...profile,
  })
  await saveAuthRecord(uid, { uid, email: null, phone: null, ...auth })
  await savePreferences(uid, { soundEnabled: true, reducedMotion: false, ...preferences })
  await saveOnboarding(uid, { completedSteps: [], currentStep: null, ...onboarding })
  return SHARED_DOCS
}
