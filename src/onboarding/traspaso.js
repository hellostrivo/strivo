// src/onboarding/traspaso.js
// Lo que el recorrido le deja dicho al recorrido que se monte después de P7
// (SPEC_19.2 §4.1).
//
// Entrar en P7 a una cuenta que ya existía pasa por el velo de restauración, y
// el velo **desmonta** el onboarding: lo que se monta al volver es otro, que
// carga del árbol y no sabe qué acaba de pasar. Dos cosas no están en el árbol
// y tienen que cruzar:
//
//   - **el paso**: si la cuenta sigue con el onboarding pendiente, se continúa
//     en el paso siguiente a P7, no en el `currentStep` que traiga la cuenta;
//   - **el motivo**: si la mudanza misma falló, el aviso de P7 lo tiene que
//     dar el recorrido que se ve, no el que ya se desmontó.
//
// **Vive en memoria y a propósito.** Escribir el paso bajo la cuenta tocaría su
// expediente en la nube para algo que es solo navegación. El residuo está
// aceptado: recargar la app en P8 retoma desde el `currentStep` guardado.
//
// Se apunta por el uid de la sesión con el que se va a montar el siguiente
// recorrido, y se toma una sola vez.

import { PASOS, retomarEn, siguiente } from './pasos.js'

const TRASPASOS = new Map()

/** Deja dicho algo para el recorrido que se monte con este uid de sesión. */
export function apuntarTraspaso(uid, datos) {
  TRASPASOS.set(uid, { ...TRASPASOS.get(uid), ...datos })
}

/** Lo dejado para este uid, o `null`. Se retira al tomarlo. */
export function tomarTraspaso(uid) {
  const traspaso = TRASPASOS.get(uid) ?? null
  TRASPASOS.delete(uid)
  return traspaso
}

/** Retira lo dejado para este uid sin usarlo. */
export function retirarTraspaso(uid) {
  TRASPASOS.delete(uid)
}

/**
 * Conecta la cuenta de P7 dejando dicho lo que haga falta (SPEC_19.2 §4.1).
 *
 *   - Con una cuenta **que ya existía**, antes de conectar se apunta el paso
 *     siguiente a P7 para el recorrido que se monte con el uid de la cuenta.
 *     Si la cuenta ya terminó el onboarding, ese recorrido no se monta y el
 *     apunte no se usa.
 *   - Si **no sale**, el apunte se retira y en su lugar se deja el motivo, para
 *     el recorrido que se monte con el uid de origen.
 *   - Una cuenta **nueva** no deja paso: sigue en P7 con "Tu cuenta está lista.".
 *
 * Si quien conecta **sigue montado** al volver —no hubo velo—, toma él lo que
 * se dejó: nadie más lo va a tomar.
 *
 * @param {string} origen - el uid de la sesión antes de conectar.
 * @param {{uid: string, nueva?: boolean}} cuenta
 * @param {(cuenta: object) => Promise<{ok: boolean, motivo?: string}>} conectar
 * @param {() => boolean} sigueMontado
 * @returns {Promise<{ok: boolean, motivo?: string, paso: ?string}>} `paso` es
 *   el paso al que ir ahora, solo si quien conecta sigue montado.
 */
export async function conectarConTraspaso(origen, cuenta, conectar, sigueMontado) {
  if (cuenta.nueva !== true) apuntarTraspaso(cuenta.uid, { paso: siguiente(PASOS.cuenta) })

  const r = await conectar(cuenta)
  if (!r.ok) {
    retirarTraspaso(cuenta.uid)
    apuntarTraspaso(origen, { motivo: r.motivo })
  }

  const propio = sigueMontado() ? tomarTraspaso(r.ok ? cuenta.uid : origen) : null
  return { ...r, paso: propio?.paso ?? null }
}

/**
 * En qué paso se retoma al cargar, y con qué aviso de P7: lo dejado para este
 * uid si lo hay, y si no el `currentStep` guardado. Gasta el traspaso.
 *
 * @returns {{paso: string, motivo: ?string}}
 */
export function retomarTrasCuenta(uid, currentStep) {
  const traspaso = tomarTraspaso(uid)
  return { paso: traspaso?.paso ?? retomarEn(currentStep), motivo: traspaso?.motivo ?? null }
}
