// src/lib/db/shared.js
// `shared/` — lo que no es de ninguna rama en particular (§C5.1).
//
// RN-DB4-02 — Si un dato hace falta en más de un sitio y no está aquí, es un
// error de diseño, no un caso a resolver con una copia.
//
// Este módulo no importa el de la rama del diario, ni al revés.

import { readPath, writePath, writePathIfAbsent, mergePath } from './local.js'
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

// ─── El sello de última escritura (SPEC_17A) ──────────────────────────────────
//
// Cada escritura de `shared/` lleva `updatedAt` dentro del dato —no en la fila
// de IndexedDB, que tiene el suyo y no viaja— porque es lo que la restauración
// compara para decidir si lo que baja de la nube es más nuevo que lo que hay
// aquí. **Lo sella esta capa y no la pantalla**: son cuatro documentos que
// escriben siete funciones, y una pantalla que olvidara sellarlo dejaría un
// registro que la fusión no sabría fechar.
//
// Se sella **después** de validar, para que un campo fuera del modelo se siga
// rechazando por lo que trae quien escribe y no por lo que añade la capa.
//
// `initShared` es la excepción, por partida doble: **no sella y no sube**
// (SPEC_17A, D13 y D14). Una siembra no es una edición: escribe `name: null`,
// `gender: 'n'` y los valores de fábrica, que no dicen nada de nadie.
//
// - **No sella.** Sellarla haría que un árbol recién montado reclamara un
//   instante que nadie vivió, y con eso le ganaría al perfil que esa persona
//   sí escribió y que está esperando en la nube. Un documento sembrado entra
//   en la fusión como "sin marca", que es exactamente lo que es.
// - **No se encola.** `sync.js` sube con `setDoc` sin `merge`: una semilla
//   encolada sobrescribe el documento remoto entero. Si la restauración falla
//   en un dispositivo nuevo, la siembra que viene detrás borraría en la nube
//   el perfil que esa persona escribió, y el reintento se quedaría sin nada
//   que recuperar. Una siembra no tiene nada que contarle a la nube.
//
// Quien empieza sin cuenta no pierde nada por esto: al crear cuenta en P7,
// `mudarUid` reencola el árbol entero, semilla incluida, y ahí suben los
// cuatro documentos por primera vez.
//
// **Y nunca pisa nada** (D16). La siembra puede correr con una restauración
// todavía en marcha por detrás —el velo tiene techo y la bajada no se
// cancela—, así que escribe solo si la ruta no existe, en una sola
// transacción: si el perfil real bajó un instante antes, la semilla se queda
// sin escribir, que es lo que tiene que pasar.

function sellar(data) {
  return { ...data, updatedAt: new Date().toISOString() }
}

/** Escritura sin sello, sin cola y solo si no hay nada. Para la siembra: ver arriba. */
function sembrar(uid, doc, data) {
  return writePathIfAbsent({ ...docSpec(uid, doc), data })
}

// ─── profile ──────────────────────────────────────────────────────────────────

export async function getProfile(uid) {
  assertUid(uid)
  return readPath(paths.sharedDoc(uid, 'profile'))
}

export async function saveProfile(uid, profile) {
  assertUid(uid)
  validateProfile(profile)
  return writePath({ ...docSpec(uid, 'profile'), data: sellar(profile) })
}

export async function updateProfile(uid, patch) {
  assertUid(uid)
  validateProfile(patch)
  return mergePath({ ...docSpec(uid, 'profile'), patch: sellar(patch) })
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
  return writePath({ ...docSpec(uid, 'auth'), data: sellar(auth) })
}

// ─── preferences ──────────────────────────────────────────────────────────────

export async function getPreferences(uid) {
  assertUid(uid)
  return readPath(paths.sharedDoc(uid, 'preferences'))
}

export async function savePreferences(uid, preferences) {
  assertUid(uid)
  validatePreferences(preferences)
  return writePath({ ...docSpec(uid, 'preferences'), data: sellar(preferences) })
}

export async function updatePreferences(uid, patch) {
  assertUid(uid)
  validatePreferences(patch)
  return mergePath({ ...docSpec(uid, 'preferences'), patch: sellar(patch) })
}

// ─── onboarding ───────────────────────────────────────────────────────────────

export async function getOnboarding(uid) {
  assertUid(uid)
  return readPath(paths.sharedDoc(uid, 'onboarding'))
}

export async function saveOnboarding(uid, onboarding) {
  assertUid(uid)
  validateOnboarding(onboarding)
  return writePath({ ...docSpec(uid, 'onboarding'), data: sellar(onboarding) })
}

export async function updateOnboarding(uid, patch) {
  assertUid(uid)
  validateOnboarding(patch)
  return mergePath({ ...docSpec(uid, 'onboarding'), patch: sellar(patch) })
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
 *
 * **Escribe sin sello de `updatedAt`, sin encolar y solo donde no hay nada, a
 * propósito** (SPEC_17A, D13, D14 y D16): ver la nota sobre `sembrar`. Valida
 * igual que las funciones públicas —una semilla con un campo fuera del modelo
 * es el mismo error de programación—, solo que ni fecha, ni sube, ni pisa lo
 * que escribe.
 */
export async function initShared(uid, { profile, auth, preferences, onboarding } = {}) {
  assertUid(uid)
  await sembrar(
    uid,
    'profile',
    validateProfile({
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
    }),
  )
  await sembrar(
    uid,
    'auth',
    assertFields({ uid, email: null, phone: null, ...auth }, FIELDS.auth, 'shared/auth'),
  )
  // §6.12 — Silencio por defecto: todos los sonidos llegan desactivados en la
  // instalación. El escenario de uso nocturno con la pareja durmiendo al lado
  // hace del sonido por defecto un riesgo de desinstalación inmediata. SPEC_02
  // sembraba `true` aquí, que es justo lo contrario; lo corrige SPEC_08, que es
  // la primera spec con sonido de verdad.
  await sembrar(
    uid,
    'preferences',
    validatePreferences({
      soundEnabled: false,
      // Silencio y quietud por defecto, y también sin avisos: la app no pide
      // sitio en la pantalla de nadie hasta que P6 lo pregunta.
      reducedMotion: false,
      remindersEnabled: false,
      ...preferences,
    }),
  )
  // `completedAt: null` se siembra explícito porque es lo que mira el arranque
  // para saber si hay que hacer el onboarding. `version` no se siembra: la
  // escribe el onboarding al empezar, igual que la mañana escribe la suya.
  //
  // `tourCompletedAt` se siembra nulo por lo mismo: es lo que mira la entrada
  // para saber si queda por ver la presentación de las secciones, y un árbol
  // nuevo llega con las dos mitades de la entrada por hacer.
  await sembrar(
    uid,
    'onboarding',
    validateOnboarding({
      completedSteps: [],
      currentStep: null,
      completedAt: null,
      tourCompletedAt: null,
      motivos: [],
      motivoOtro: null,
      ...onboarding,
    }),
  )
  return SHARED_DOCS
}
