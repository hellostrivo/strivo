// src/lib/db/index.js
// Único punto de import de la capa de datos para toda la app.
//
//   import { lumia, strivoDateKey } from '@/lib/db'
//   await lumia.saveDayState(uid, date, { mood: 'tranquilo' })
//
// El diario se expone con su nombre delante, nunca en plano: una pantalla
// escribe `lumia.x` y se ve de qué rama del árbol está tirando.

import * as shared from './shared.js'
import * as lumia from './lumia.js'

export { shared, lumia }

// `shared/` sí va en plano: por definición no es de nadie en particular
// (RN-DB4-02).
export * from './shared.js'

export { ERROR_CODES, FIELDS, GENDERS, MOODS, StrivoDataError, paths } from './schema.js'

export { DEFAULT_DIA_TERMINA_A, isDateKey, strivoDateKey, toDateKey } from './dates.js'

export { closeLocalDB, getLocalDB, pendingCount } from './local.js'
export { flush, getPendingCount, listPending, startSync } from './sync.js'

/**
 * Monta el árbol de §C5.2 para un usuario nuevo.
 *
 * `shared/` se crea con sus cuatro ramas. `lumia/` nace vacío a propósito: un
 * día en blanco sería un registro que nadie escribió (RN-DB4-08).
 *
 * Ya no pide nada. Hasta el 24 de agosto de 2026 exigía una identidad central
 * porque montaba también la rama de Formia, y esa exigencia era lo que
 * bloqueaba el arranque de la app.
 *
 * @param {string} uid
 * @param {object} [seed]
 * @param {object} [seed.profile]
 * @param {object} [seed.auth]
 * @param {object} [seed.preferences]
 * @param {object} [seed.onboarding]
 */
export async function initUserTree(uid, seed = {}) {
  await shared.initShared(uid, seed)
  await lumia.initLumia(uid)
  return {
    shared: ['profile', 'auth', 'preferences', 'onboarding'],
    lumia: [],
  }
}
