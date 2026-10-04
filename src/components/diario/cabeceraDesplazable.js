// src/components/diario/cabeceraDesplazable.js
// Las cuentas de la cabecera desplazable (SPEC_28.3 §4.6, DP-28.2).
//
// Con cuatro secciones arriba, las píldoras ya no caben en un teléfono y la
// cabecera no se parte en dos filas: se desplaza en horizontal. Dos preguntas
// deciden cómo se ve, y las dos son cuentas sobre anchos y posiciones, así que
// viven aquí, sin DOM, y se prueban sin navegador:
//
// - **¿Cuánto hay que desplazar para que una píldora se vea entera?** La
//   activa, al entrar y al cambiar de ruta; la enfocada, al llegar con el
//   tabulador. Entera quiere decir también fuera del fundido: el margen es el
//   ancho del fundido, para que no le tape el anillo de foco.
// - **¿En qué borde hay más contenido?** Ahí, y solo ahí, va el fundido.
//
// Todas las posiciones van en el mismo sistema que `scrollLeft`: la de una
// píldora es su `offsetLeft` dentro de la lista, que lleva `position: relative`.

/**
 * El ancho del fundido, en px. Es también el `scroll-padding-inline` de la
 * lista en `globals.css` (`--fundido-cabecera`), y una prueba los compara.
 */
export const FUNDIDO = 24

/** Por debajo de un píxel no hay nada que ver ni que mover. */
const TOLERANCIA = 1

const maximo = (anchoTotal, anchoVisible) => Math.max(0, anchoTotal - anchoVisible)

/**
 * En qué bordes hay más contenido del que se ve.
 * @param {{ desplazamiento: number, anchoVisible: number, anchoTotal: number }} medidas
 * @returns {{ inicio: boolean, fin: boolean }}
 */
export function bordesConMas({ desplazamiento, anchoVisible, anchoTotal }) {
  return {
    inicio: desplazamiento > TOLERANCIA,
    fin: desplazamiento < maximo(anchoTotal, anchoVisible) - TOLERANCIA,
  }
}

/**
 * El desplazamiento que deja una píldora entera a la vista, con `margen` libre
 * a cada lado, o `null` si ya se ve así. Se mueve lo justo y nunca fuera de lo
 * que la lista puede desplazarse.
 *
 * @param {{ desplazamiento: number, anchoVisible: number, anchoTotal: number,
 *           inicio: number, ancho: number, margen?: number }} medidas
 * @returns {number|null}
 */
export function desplazamientoParaVer({
  desplazamiento,
  anchoVisible,
  anchoTotal,
  inicio,
  ancho,
  margen = FUNDIDO,
}) {
  let destino = null
  if (inicio - margen < desplazamiento) destino = inicio - margen
  else if (inicio + ancho + margen > desplazamiento + anchoVisible) {
    destino = inicio + ancho + margen - anchoVisible
  }
  if (destino === null) return null

  const acotado = Math.min(maximo(anchoTotal, anchoVisible), Math.max(0, destino))
  return Math.abs(acotado - desplazamiento) < TOLERANCIA ? null : acotado
}
