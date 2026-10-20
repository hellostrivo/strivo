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
// **Desde SPEC_30 también se entra desde la bienvenida (P1)**, y ahí cruzan
// otras cosas: no el paso siguiente a P7 —se retoma en el de la cuenta, nunca
// en P1—, sino si hay que volver a la vista de entrar, y con qué aviso: la
// restauración que no terminó o la mudanza que falló.
//
// **Vive en memoria y a propósito.** Escribir el paso bajo la cuenta tocaría su
// expediente en la nube para algo que es solo navegación. El residuo está
// aceptado: recargar la app en P8 retoma desde el `currentStep` guardado.
//
// Se apunta por el uid de la sesión con el que se va a montar el siguiente
// recorrido, y se toma una sola vez.

import { PASOS, retomarEn, siguiente } from './pasos.js'

/**
 * Los avisos con los que se vuelve a la vista de entrar (SPEC_30 §4).
 *
 *   - `restauracion`: la sesión ya es la cuenta, pero lo suyo no terminó de
 *     llegar (C7). Se ofrece reintentar o empezar mientras tanto.
 *   - `generico`: la mudanza misma falló y la sesión siguió en el origen (C8).
 *   - `nueva`: Google abrió una cuenta que no existía (C4). No cruza el velo
 *     —una cuenta nueva no pasa por él—, pero es un aviso de la misma vista.
 */
export const AVISOS_DE_ENTRADA = Object.freeze({
  restauracion: 'restauracion',
  generico: 'generico',
  nueva: 'nueva',
})

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
 * Conecta la cuenta de P7 —o de la bienvenida— dejando dicho lo que haga falta
 * (SPEC_19.2 §4.1, SPEC_30 §5.4).
 *
 *   - Con una cuenta **que ya existía**, antes de conectar se apunta lo que
 *     necesita el recorrido que se monte con el uid de la cuenta: desde P7, el
 *     paso siguiente; desde P1, solo de dónde se vino. Si la cuenta ya terminó
 *     el onboarding, ese recorrido no se monta y el apunte no se usa.
 *   - Si **no sale**, el apunte se retira y en su lugar se deja el motivo, para
 *     el recorrido que se monte con el uid de origen.
 *   - Una cuenta **nueva** no deja paso: sigue donde estaba, y quien conecta
 *     dice que está lista.
 *
 * Si quien conecta **sigue montado** al volver —no hubo velo—, toma él lo que
 * se dejó: nadie más lo va a tomar.
 *
 * @param {string} origen - el uid de la sesión antes de conectar.
 * @param {{uid: string, nueva?: boolean}} cuenta
 * @param {(cuenta: object) => Promise<{ok: boolean, motivo?: string}>} conectar
 * @param {() => boolean} sigueMontado
 * @param {object} [opciones]
 * @param {string} [opciones.desde=PASOS.cuenta] - `p1` o `p7`.
 * @returns {Promise<{ok: boolean, motivo?: string, paso: ?string}>} `paso` es
 *   el paso al que ir ahora, solo si quien conecta sigue montado.
 */
export async function conectarConTraspaso(
  origen,
  cuenta,
  conectar,
  sigueMontado,
  { desde = PASOS.cuenta } = {},
) {
  const desdeBienvenida = desde === PASOS.bienvenida
  if (cuenta.nueva !== true) {
    apuntarTraspaso(cuenta.uid, desdeBienvenida ? { desde } : { paso: siguiente(PASOS.cuenta) })
  }

  const r = await conectar(cuenta)
  if (!r.ok) {
    retirarTraspaso(cuenta.uid)
    apuntarTraspaso(origen, desdeBienvenida ? { motivo: r.motivo, desde } : { motivo: r.motivo })
  }

  const propio = sigueMontado() ? tomarTraspaso(r.ok ? cuenta.uid : origen) : null
  return { ...r, paso: propio?.paso ?? null }
}

/**
 * Dónde se retoma tras entrar desde la bienvenida: en el paso guardado de la
 * cuenta, **nunca en P1**. Volver a la bienvenida después de haber entrado
 * sería enseñarle a alguien la puerta por la que acaba de pasar (C2, C3).
 */
export function pasoTrasEntrar(currentStep) {
  const paso = retomarEn(currentStep)
  return paso === PASOS.bienvenida ? siguiente(PASOS.bienvenida) : paso
}

/**
 * En qué paso se retoma al cargar, con qué aviso de P7 y, si se vino de la
 * bienvenida, si hay que volver a la vista de entrar: lo dejado para este uid
 * si lo hay, y si no el `currentStep` guardado. Gasta el traspaso.
 *
 * @param {string} uid
 * @param {?string} currentStep
 * @param {boolean} [conMudanzaPendiente] - si la mudanza hacia este uid sigue
 *   pendiente: la restauración no terminó (C7). Lo pregunta quien llama, para
 *   que esto siga siendo puro.
 * @returns {{paso: string, motivo: ?string, entrada?: {desde: string, aviso: string}}}
 */
export function retomarTrasCuenta(uid, currentStep, conMudanzaPendiente = false) {
  const traspaso = tomarTraspaso(uid)

  if (traspaso?.desde === PASOS.bienvenida) {
    const desde = PASOS.bienvenida
    if (traspaso.motivo) {
      return {
        paso: desde,
        motivo: null,
        entrada: { desde, aviso: AVISOS_DE_ENTRADA.generico },
      }
    }
    if (conMudanzaPendiente) {
      return {
        paso: desde,
        motivo: null,
        entrada: { desde, aviso: AVISOS_DE_ENTRADA.restauracion },
      }
    }
    return { paso: pasoTrasEntrar(currentStep), motivo: null }
  }

  return { paso: traspaso?.paso ?? retomarEn(currentStep), motivo: traspaso?.motivo ?? null }
}
