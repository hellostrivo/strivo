// src/lib/db/index.js
// Único punto de import de la capa de datos para toda la app.
//
//   import { diario, strivoDateKey } from '@/lib/db'
//   await diario.saveDayState(uid, date, { mood: 'tranquilo' })
//
// El diario se expone con su nombre delante, nunca en plano: una pantalla
// escribe `diario.x` y se ve de qué rama del árbol está tirando.

import * as shared from './shared.js'
import * as diario from './diario.js'

export { shared, diario }

// `shared/` sí va en plano: por definición no es de nadie en particular
// (RN-DB4-02).
export * from './shared.js'

export { ERROR_CODES, FIELDS, GENDERS, MOODS, StrivoDataError, paths } from './schema.js'

export {
  DEFAULT_DIA_TERMINA_A,
  isDateKey,
  strivoDateKey,
  timeToMinutes,
  toDateKey,
} from './dates.js'

export { closeLocalDB, getLocalDB, mudarUid, pendingCount } from './local.js'
export { flush, getPendingCount, listPending, startSync } from './sync.js'
export {
  MOTIVOS as MOTIVOS_RESTAURACION,
  hayMarcaDeRestauracion,
  restaurar,
  retirarMarcaDeRestauracion,
  ultimoResultado,
} from './restaurar.js'

/**
 * Monta el árbol de §C5.2 para un usuario nuevo.
 *
 * `shared/` se crea con sus cuatro ramas. `diario/` nace vacío a propósito: un
 * día en blanco sería un registro que nadie escribió (RN-DB4-08).
 *
 * Ya no pide nada. Hasta el 24 de agosto de 2026 exigía una identidad central
 * porque montaba también la rama del alcance retirado, y esa exigencia era lo
 * que bloqueaba el arranque de la app.
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
  await diario.initDiario(uid)
  return {
    shared: ['profile', 'auth', 'preferences', 'onboarding'],
    diario: [],
  }
}
