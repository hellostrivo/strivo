// src/lib/db/index.js
// Único punto de import de la capa de datos para toda la app.
//
//   import { lumia, strivoDateKey } from '@/lib/db'
//   await lumia.saveDayState(uid, date, { mood: 'tranquilo' })
//
// Los dos espacios se exponen con su nombre delante, nunca en plano. Una
// pantalla de Lumia escribe `lumia.x` y no tiene forma de llamar a `formia.x`
// sin nombrar a Formia, que es justo lo que RN-DB4-01 quiere que se vea.
//
// `lumia.js` y `formia.js` no se conocen entre sí. Este archivo es la única
// capa autorizada a verlos a la vez, y no cruza nada: solo los presenta.

import * as shared from './shared.js'
import * as lumia from './lumia.js'
import * as formia from './formia.js'

export { shared, lumia, formia }

// `shared/` sí va en plano: por definición lo usan los dos espacios (RN-DB4-02).
export * from './shared.js'

export {
  AREA_CATALOG,
  AREA_IDS,
  AREA_STATES,
  ERROR_CODES,
  FIELDS,
  GENDERS,
  HABIT_CONTEXTS,
  HABIT_STATES,
  IDENTITY_CENTRAL,
  MAX_SELECTED_AREAS,
  MOODS,
  StrivoDataError,
  VICTORY_STATES,
  emptyAreasMap,
  isValidIdentityRef,
  paths,
} from './schema.js'

export { DEFAULT_DIA_TERMINA_A, isDateKey, strivoDateKey, toDateKey } from './dates.js'

export { closeLocalDB, getLocalDB, pendingCount } from './local.js'
export { flush, getPendingCount, listPending, startSync } from './sync.js'

/**
 * Monta el árbol de §C5.2 para un usuario nuevo.
 *
 * `shared/` se crea con sus cuatro ramas y `formia/identity` con la identidad
 * central y las 7 áreas sin seleccionar. `lumia/` nace vacío a propósito: un
 * día en blanco sería un registro que nadie escribió (RN-DB4-08).
 *
 * @param {string} uid
 * @param {object} seed
 * @param {string} seed.identityCentral - Obligatorio (RN-DB4-09 / RN-ID-01).
 * @param {object} [seed.profile]
 * @param {object} [seed.auth]
 * @param {object} [seed.preferences]
 * @param {object} [seed.onboarding]
 */
export async function initUserTree(uid, seed = {}) {
  const { identityCentral, ...rest } = seed
  await shared.initShared(uid, rest)
  await lumia.initLumia(uid)
  await formia.initFormia(uid, { identityCentral })
  return {
    shared: ['profile', 'auth', 'preferences', 'onboarding'],
    lumia: [],
    formia: ['identity', 'identityHistory'],
  }
}
