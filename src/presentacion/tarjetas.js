// src/presentacion/tarjetas.js
// Las cuatro tarjetas de la presentación: cuáles son y en qué orden llegan.
//
// **Es la lista y nada más.** Ni el texto —que vive en `copy.diario.presentacion`
// y se busca por el mismo identificador— ni el dibujo —que vive en
// `components/presentacion/Visuales.jsx` y se busca igual—. Tres listas
// enlazadas por un id y comprobadas por una prueba: añadir o quitar una tarjeta
// es tocar las tres, y si falta una la suite lo dice.
//
// **El orden es el de la app, no el de la importancia**: se presenta lo que se
// hace ahora —el día, lo que se escribe, el aire— y después lo que ya pasó. Es
// el mismo reparto de la cabecera y la barra de abajo (RN-NAV-02), así que
// quien salga de aquí encuentra las secciones donde acaba de verlas.
//
// **No son destinos.** Esto no abre ninguna sección y no enlaza con ninguna
// ruta: cuenta qué hay dentro y se retira. Por eso RN-NAV-01 no tiene nada que
// decir aquí — los cinco destinos siguen siendo cinco.

/** Los identificadores estables. Los comparten el copy y los visuales. */
export const TARJETAS = Object.freeze(['hoy', 'journal', 'respiracion', 'historial'])

/** Cuántas hay. Sale de la lista: un número escrito aparte envejecería solo. */
export const TOTAL = TARJETAS.length

/** ¿Es una de ellas? */
export function es(id) {
  return TARJETAS.includes(id)
}

/**
 * La tarjeta que ocupa esa posición, acotada a la lista.
 *
 * Se acota en vez de devolver nada: quien pide una posición de más o de menos
 * se queda en el borde, que es lo que hace un carrusel que no da la vuelta.
 * Dar la vuelta convertiría la última tarjeta en una que sigue, y detrás de la
 * última no hay otra: está la app.
 */
export function enPosicion(indice) {
  return TARJETAS[Math.min(Math.max(indice, 0), TOTAL - 1)]
}

/** La posición de una tarjeta, o `0` si no es ninguna. */
export function posicionDe(id) {
  const posicion = TARJETAS.indexOf(id)
  return posicion === -1 ? 0 : posicion
}

/** ¿Es la última? Es lo único que cambia el botón principal. */
export function esUltima(indice) {
  return indice >= TOTAL - 1
}
