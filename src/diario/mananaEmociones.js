// src/diario/mananaEmociones.js
// Los dos catálogos emocionales de la mañana, enlazados con su copy.
//
//   ANIMO     — "¿Cómo me siento esta mañana?" (11 opciones + palabra propia)
//   INTENCION — "¿Cómo me gustaría sentirme durante el día de hoy?" (9 + propia)
//
// **Las dos admiten hasta tres respuestas** (27 ago 2026). Se admitía una, con
// el argumento de que nombrar un estado no es hacer un inventario; lo pidió el
// propietario del producto y el argumento se sostiene igual con tres: nadie
// amanece sintiendo una sola cosa, y obligar a elegir cuál de dos es la
// verdadera es pedirle a alguien que se resuma antes de empezar el día. La
// noche admite lo mismo desde el 10 de septiembre de 2026, por el mismo motivo
// y con el mismo tope — está explicado en `nocheEmociones.js`.
//
// **El tope se declara aquí y no en la pantalla.** Es una regla del catálogo,
// así que quien pinta los chips y quien guarda la respuesta lo toman de él.
//
// **Son dos catálogos distintos a propósito.** El primero pregunta qué hay y
// por eso incluye las emociones difíciles —cansancio, inquietud, tristeza— sin
// una sola marca de advertencia. El segundo pregunta hacia dónde acompañarse, y
// una intención de "estar triste" no es una intención.
//
// **La diferencia entre los dos no se mide.** No hay puntuación, ni brecha, ni
// color de alerta, ni un mensaje que sugiera que hay que mejorar el estado de
// partida. Empezar cansado y querer estar en calma no es un problema a resolver:
// es exactamente lo que la pregunta esperaba.

import { copy } from '@copy'
import { crearSeleccion } from './seleccionEmociones.js'

export {
  ID_OTRA,
  MAX_PALABRA_PROPIA,
  etiquetaPropia,
  recortarPropia,
} from './seleccionEmociones.js'

/**
 * Cuántas respuestas admite cada una de las dos preguntas (27 ago 2026).
 *
 * Es el mismo número que el Journal, y no por casualidad: tres es donde una
 * respuesta deja de ser un matiz y empieza a ser una lista. Al llegar a tres,
 * la cuarta no entra hasta que se suelta alguna — decisión del propietario del
 * producto (30 ago 2026), razonada en `seleccionEmociones.js`.
 */
export const MAX_EMOCIONES = 3

const textos = copy.diario.manana

export const ANIMO = crearSeleccion(textos.animo, { maximo: MAX_EMOCIONES })
export const INTENCION = crearSeleccion(textos.intencion, { maximo: MAX_EMOCIONES })
