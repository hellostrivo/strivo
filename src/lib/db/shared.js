// src/lib/db/shared.js
// `shared/` — lo que no es de ninguna rama en particular (§C5.1).
//
// RN-DB4-02 — Si un dato hace falta en más de un sitio y no está aquí, es un
// error de diseño, no un caso a resolver con una copia.
//
// Este módulo no importa el de la rama del diario, ni al revés.

import { readPath, writePath, mergePath } from './local.js'
import {
  COLLECTIONS,
  FIELDS,
  assertFields,
  assertUid,
  paths,
  validateOnboarding,
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
  validateOnboarding(onboarding)
  return writePath({ ...docSpec(uid, 'onboarding'), data: onboarding })
}

export async function updateOnboarding(uid, patch) {
  assertUid(uid)
  validateOnboarding(patch)
  return mergePath({ ...docSpec(uid, 'onboarding'), patch })
}

/**
 * ¿Queda por hacer el onboarding de esta persona?
 *
 * Lo decide `completedAt` y **solo** `completedAt` (RN-DB-09): saltarse los
 * siete pasos también es terminarlo, así que contar `completedSteps` diría que
 * no ha terminado alguien que ya entró. Un árbol sin la rama —el de quien
 * instaló la app antes de que el onboarding existiera— cuenta como pendiente:
 * la ausencia de marca no es una marca.
 */
export async function onboardingPendiente(uid) {
  const onboarding = await getOnboarding(uid)
  return !onboarding?.completedAt
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
    // De una versión anterior del onboarding: ya no se pregunta en ninguna
    // pantalla. Se sigue sembrando nula —y no se deja de sembrar— para que un
    // árbol nuevo y uno viejo tengan la misma forma al leerse: lo que cambió
    // es quién la escribe, que hoy no es nadie.
    identidadCentral: null,
    diaTerminaA: DEFAULT_DIA_TERMINA_A,
    wakeTime: null,
    sleepTime: null,
    createdAt: new Date().toISOString(),
    ...profile,
  })
  await saveAuthRecord(uid, { uid, email: null, phone: null, ...auth })
  // §6.12 — Silencio por defecto: todos los sonidos llegan desactivados en la
  // instalación. El escenario de uso nocturno con la pareja durmiendo al lado
  // hace del sonido por defecto un riesgo de desinstalación inmediata. SPEC_02
  // sembraba `true` aquí, que es justo lo contrario; lo corrige SPEC_08, que es
  // la primera spec con sonido de verdad.
  await savePreferences(uid, {
    soundEnabled: false,
    // Silencio y quietud por defecto, y también sin avisos: la app no pide
    // sitio en la pantalla de nadie hasta que P6 lo pregunta.
    reducedMotion: false,
    remindersEnabled: false,
    ...preferences,
  })
  // `completedAt: null` se siembra explícito porque es lo que mira el arranque
  // para saber si hay que hacer el onboarding. `version` no se siembra: la
  // escribe el onboarding al empezar, igual que la mañana escribe la suya.
  //
  // `tourCompletedAt` se siembra nulo por lo mismo: es lo que mira la entrada
  // para saber si queda por ver la presentación de las secciones, y un árbol
  // nuevo llega con las dos mitades de la entrada por hacer.
  await saveOnboarding(uid, {
    completedSteps: [],
    currentStep: null,
    completedAt: null,
    tourCompletedAt: null,
    motivos: [],
    motivoOtro: null,
    ...onboarding,
  })
  return SHARED_DOCS
}
