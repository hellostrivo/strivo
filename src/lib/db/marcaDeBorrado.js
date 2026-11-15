// src/lib/db/marcaDeBorrado.js
// La marca de «esta cuenta se está borrando» (SPEC_24B, DP-24.12).
//
// Se escribe **antes** de tocar nada de la nube y se quita **solo** cuando el
// teléfono ya quedó limpio, o cuando la persona decide conservar su cuenta.
// Mientras exista:
//
//   - **nada sube ni baja para ese uid**: `sync.js` no envía ninguna entrada
//     suya y `restaurar.js` no lee nada (ver la lista de disparadores en
//     `CLAUDE.md`);
//   - al abrir la app, el arranque la encuentra y termina o repara
//     (DP-24.13): o se termina de borrar, o se reconstruye la nube desde el
//     teléfono. Nada queda a medias.
//
// Va por `clavesDelTelefono.js` y su familia está en `FAMILIAS`: en la app
// nativa tiene copia en SQLite, así que sobrevive a que iOS limpie el almacén
// del WebView (si no, `reconciliarClaves` borraría la copia al arrancar).
//
// Su valor es un JSON pequeño, `{ fase, metodo, desde }`, sin nada que no
// esté ya en el teléfono.

import { guardarClave, leerClave, quitarClave } from './clavesDelTelefono.js'

export const PREFIJO_DE_BORRADO = 'strivo.borrado.'

/** Las fases del borrado, en orden. Lo que dice la marca es la última que empezó. */
export const FASES = Object.freeze(['revocando', 'nube', 'cuenta', 'telefono'])

export function claveDeBorrado(uid) {
  return `${PREFIJO_DE_BORRADO}${uid}`
}

/** La marca de ese uid, o `null`. Una marca ilegible cuenta como marca: no se adivina. */
export function leerMarcaDeBorrado(uid) {
  if (!uid) return null
  const cruda = leerClave(claveDeBorrado(uid))
  if (cruda == null) return null
  try {
    const marca = JSON.parse(cruda)
    return marca && typeof marca === 'object' ? marca : { fase: 'revocando' }
  } catch {
    return { fase: 'revocando' }
  }
}

/** ¿Se está borrando este uid? Es lo que preguntan la subida y la bajada. */
export function hayMarcaDeBorrado(uid) {
  return leerMarcaDeBorrado(uid) !== null
}

export function guardarMarcaDeBorrado(uid, marca) {
  guardarClave(claveDeBorrado(uid), JSON.stringify(marca))
}

export function quitarMarcaDeBorrado(uid) {
  quitarClave(claveDeBorrado(uid))
}
