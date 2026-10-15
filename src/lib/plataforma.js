// src/lib/plataforma.js
// ¿Corre dentro de la app de iPhone o en un navegador? (SPEC_21.1 §4.1)
//
// **Un solo sitio pregunta la plataforma, y es este.** Nada más en `src/`
// importa `@capacitor/core` para eso, y hay una prueba que lo comprueba: dos
// preguntas por la misma cosa acaban dando dos respuestas en cuanto alguien
// retoca una.
//
// **Ante la duda, web.** Sin Capacitor —las pruebas, Netlify, un navegador
// cualquiera— o si la pregunta falla, la respuesta es `false`: la web es lo que
// funciona en todas partes, y lo nativo solo se enciende cuando hay certeza.

import { Capacitor } from '@capacitor/core'

/**
 * @param {object} [capacitor] - El objeto de Capacitor. Existe para las pruebas.
 * @returns {boolean} `true` solo dentro de la app nativa.
 */
export function esNativa(capacitor = Capacitor) {
  try {
    return capacitor?.isNativePlatform?.() === true
  } catch {
    return false
  }
}
