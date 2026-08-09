// src/lib/sonido.js
// La preferencia de sonido, en un solo sitio (bloque 05, D.3).
//
// Vive en `appFlags` y no en el perfil porque es del aparato, no de la persona:
// el mismo perfil puede querer sonido en casa y silencio en el metro, y el
// ejercicio de respiración empieza antes de que haya un userId a mano. getFlag
// y setFlag ya tragan cualquier fallo del almacén sin interrumpir nada.
//
// Arranca activado (decisión del bloque 05). Aunque esté activado, nada suena
// hasta que el navegador deja despertar el AudioContext: ver @lib/audioRespiracion.

import { getFlag, setFlag } from '@lib/db'

const CLAVE = 'sonidoHabilitado'

export const SONIDO_POR_DEFECTO = true

export function leerSonido() {
  return getFlag(CLAVE, SONIDO_POR_DEFECTO)
}

export function guardarSonido(habilitado) {
  return setFlag(CLAVE, habilitado)
}
