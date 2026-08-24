// src/components/lumia/pildora.js
// La píldora de emoción: su geometría y sus dos superficies, en un solo sitio.
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
export const PILDORA_ELEGIDA = 'border-current bg-lumia-tarjeta shadow-elev-2 font-medium'

/** Lo que está ahí sin elegir. Solo tiene sentido donde se puede tocar. */
export const PILDORA_LIBRE = 'border-on-surface bg-lumia-campo'
