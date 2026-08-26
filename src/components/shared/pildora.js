// src/components/shared/pildora.js
// La píldora de emoción: su geometría y sus dos superficies, en un solo sitio.
//
// **Vive en `shared/` desde F-1B**, con el mismo criterio que `Campo.jsx`: son
// clases y nada más, sin un import ni el nombre de una sección. Lo que la trajo
// aquí es el onboarding, que pregunta con chips y tenía que preguntar con
// **estos** chips: dos hogares para la misma forma serían dos formas al cabo de
// un año, y lo que hace que consultar lo escrito se parezca a haberlo escrito
// es precisamente que la forma sea una sola (RN-TEC-05).
//
// La usan pantallas que hacen cosas distintas con ella. En los recorridos de la
// mañana y de la noche es un botón que se toca (`ChipsUnicos`); en las dos
// pantallas de consulta es texto que se lee (`ResumenManana`, `ResumenNoche`).
// Lo que comparten es la **forma**, y esa forma es lo que
// hace que consultar lo escrito se parezca a haberlo escrito: la respuesta se
// reconoce porque tiene el aspecto que tenía al elegirla.
//
// Aquí no hay nada interactivo a propósito. La transición, el anillo de foco y
// el borde punteado del chip de palabra propia se quedan en `ChipsUnicos`,
// porque son de un control que se toca y no de la píldora.
//
// Tailwind ve este archivo (`content: ['./src/**/*.{js,jsx}']`), así que las
// clases de aquí llegan al CSS igual que si estuvieran en el JSX.

/** Geometría y tipografía. El alto mínimo se conserva también en la consulta:
 *  cambiarlo haría que la misma respuesta se leyera de dos tamaños distintos. */
export const PILDORA = [
  'inline-flex items-center gap-2 rounded-full border px-4 py-2',
  'min-h-touch-sm text-base text-on-surface',
]

/** Lo elegido: borde del propio color, superficie más clara y peso medio. */
export const PILDORA_ELEGIDA = 'border-current bg-strivo-tarjeta shadow-elev-2 font-medium'

/** Lo que está ahí sin elegir. Solo tiene sentido donde se puede tocar. */
export const PILDORA_LIBRE = 'border-on-surface bg-strivo-campo'
