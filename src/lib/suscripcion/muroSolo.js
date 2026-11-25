// src/lib/suscripcion/muroSolo.js
// El muro aparece solo **una vez por sesión** y solo en lectura (DP-25.17). Como
// `umbralSesion`: vive en memoria y se olvida al cerrar la app.

import { ESTADOS } from './estado.js'

let visto = false

/** ¿Toca enseñarlo ahora? `libre` es que no hay nada delante. */
export function tocaElMuro({ estado, libre }) {
  return libre && !visto && estado === ESTADOS.lectura
}

export function darElMuroPorVisto() {
  visto = true
}

/** Solo para las pruebas. */
export function olvidarElMuro() {
  visto = false
}
