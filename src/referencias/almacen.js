// src/referencias/almacen.js
// Dónde vive la preferencia de frases: en el dispositivo y en ningún otro sitio
// (SPEC_28 §7).
//
// Las tres funciones pasan por `shared` de la capa de datos, que escribe con
// `sync: false`; `local.js` además reconoce la ruta y no la encola nunca. Lo
// que se guarda es lo que dice `paraGuardar` y nada más: el modo, las
// afinidades normalizadas y la versión.

import { shared } from '@/lib/db'
import { normalizar, paraGuardar } from './preferencias.js'

/**
 * La elección guardada, ya normalizada. Sin documento —quien no contestó, o
 * quien la restableció— es `sin_definir`. Un fallo de lectura también: no
 * saber qué eligió alguien nunca se resuelve enseñándole algo que no eligió.
 */
export async function leerPreferencias(uid) {
  try {
    return normalizar(await shared.getFrasesPreferencias(uid))
  } catch {
    return normalizar(null)
  }
}

/** ¿Hay una elección guardada? Para que Tu perfil sepa qué contar. */
export async function hayEleccion(uid) {
  try {
    return (await shared.getFrasesPreferencias(uid)) !== null
  } catch {
    return false
  }
}

export async function guardarPreferencias(uid, preferencias) {
  return shared.saveFrasesPreferencias(uid, paraGuardar(preferencias))
}

/** Borra la elección entera: vuelve a `sin_definir` sin dejar rastro de la anterior. */
export async function restablecerPreferencias(uid) {
  return shared.clearFrasesPreferencias(uid)
}
