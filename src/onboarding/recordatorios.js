// src/onboarding/recordatorios.js
// P6 — los dos avisos del día, si se quieren.
//
// **En la app de iPhone, los avisos llegan** (SPEC_22). El permiso se pide al
// teléfono con el plugin de avisos locales —por `lib/avisosNativos.js`, nunca
// directamente— y, al terminar el onboarding, la reconciliación los programa a
// las horas de P5 (`lib/avisos/`). Este módulo solo pide y cuenta en qué quedó.
//
// **En la web, la entrega sigue sin construir**, y aquí corre exactamente el
// código de antes: se pide el permiso del navegador y se guarda la respuesta.
// Una PWA estática no puede despertar sola —haría falta push—, y está anotado
// como deuda en CLAUDE.md, ligada a DP-21.5.
//
// **El permiso no es la preferencia.** Concederlo es dejar que la app pueda
// avisar; quererlo es otra cosa, y se guarda aparte en
// `preferences.remindersEnabled`. Sin esa distinción, apagar los avisos
// obligaría a ir a los ajustes del sistema a retirar un permiso.
//
// Ninguna salida de aquí es un error: ni el "no" del dispositivo, ni el
// dispositivo que no sabe hacerlo (RN-EST-04). Nada vibra y nada se pone en
// rojo.

import { esIPhone } from '@lib/plataforma'
import { puente } from '@lib/avisosNativos'

/** Las cuatro situaciones posibles, y ninguna es un fallo. */
export const ESTADOS = Object.freeze({
  sinSoporte: 'sin_soporte',
  sinPedir: 'sin_pedir',
  concedido: 'concedido',
  denegado: 'denegado',
})

/**
 * ¿Este dispositivo sabe mostrar avisos? En la app de iPhone, siempre.
 * @param {{iphone?: () => boolean}} [opciones] - Para las pruebas.
 */
export function haySoporte({ iphone = esIPhone } = {}) {
  if (iphone()) return true
  return typeof window !== 'undefined' && typeof window.Notification === 'function'
}

/**
 * En qué situación está el permiso del **navegador** ahora mismo, sin pedir
 * nada. Es síncrono, como siempre. En la app de iPhone preguntar al teléfono
 * es asíncrono: para eso está `consultarEstado`.
 */
export function estadoActual() {
  if (!haySoporte({ iphone: () => false })) return ESTADOS.sinSoporte
  const permiso = window.Notification.permission
  if (permiso === 'granted') return ESTADOS.concedido
  if (permiso === 'denied') return ESTADOS.denegado
  return ESTADOS.sinPedir
}

/**
 * Pide el permiso y devuelve en qué quedó.
 *
 * Nunca lanza: un navegador que rechace la llamada deja el paso igual que un
 * "no", y quedarse con la pantalla rota por preguntar sería lo contrario de lo
 * que este paso es.
 */
export async function pedirPermiso({ iphone = esIPhone, nativo = puente } = {}) {
  // En la app de iPhone, el plugin. Contesta concedido o denegado y no lanza.
  if (iphone()) return nativo.pedirPermiso()
  if (!haySoporte({ iphone })) return ESTADOS.sinSoporte
  try {
    const respuesta = await window.Notification.requestPermission()
    if (respuesta === 'granted') return ESTADOS.concedido
    if (respuesta === 'denied') return ESTADOS.denegado
    return ESTADOS.sinPedir
  } catch {
    return ESTADOS.denegado
  }
}

/** ¿Quedaron activados? Es lo que se guarda en las preferencias. */
export function quedanActivados(estado) {
  return estado === ESTADOS.concedido
}

/**
 * En qué situación está el permiso, sin pedir nada, también en la app de
 * iPhone. Nunca lanza.
 */
export async function consultarEstado({ iphone = esIPhone, nativo = puente } = {}) {
  if (iphone()) return nativo.permiso()
  return estadoActual()
}
