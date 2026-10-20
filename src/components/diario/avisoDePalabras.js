// src/components/diario/avisoDePalabras.js
// Lo que se dice al pie de una respuesta cuando le queda poco sitio. Lo leen
// las filas de la gratitud y del reconocimiento y el campo de las preguntas
// abiertas de un solo campo (`CampoRespuesta`): la misma frase para el mismo
// tope, y en un solo sitio.
//
// Cuándo toca avisar lo decide `palabrasRestantes`, en `filas.js`; aquí solo se
// elige la frase.

import { copy, interpolate } from '@copy'
import { palabrasRestantes } from '@/diario/filas'

const textos = copy.diario.filas

/** Lo que se dice al pie cuando queda poco sitio, o `null` cuando no toca. */
export function avisoDePalabras(texto, limites) {
  const restantes = palabrasRestantes(texto, limites)
  if (restantes === null) return null
  if (restantes === 0) return interpolate(textos.limiteTemplate, { max: limites.palabras })
  if (restantes === 1) return textos.quedaUna
  return interpolate(textos.quedanTemplate, { n: restantes })
}
