// src/components/shared/Simbolo.jsx
// El logo de la app (manual §3.1).
//
// **Revisión del 25 de agosto de 2026 — llega el logo oficial.** Hasta ahora
// aquí vivía `strivo_simbolo.svg`: la «S» sola, de trazo, sobre el lienzo
// 122×130 del sistema, y la cabecera le ponía el rótulo «Strivo» al lado. El
// archivo que entrega el diseñador —`Strivo_Logo_Oficial.svg`— es otra cosa: un
// **lockup vertical** que trae el símbolo y la palabra en el mismo trazado, así
// que el rótulo de al lado sobraba y se retiró (ver `NavStrivo.jsx`).
//
// Con el archivo cambian tres cosas que estaban escritas como si fueran del
// sistema y eran de aquel dibujo:
//
// - **El lienzo.** `0 0 1016 920`, no `0 0 122 130`. La proporción es ancha, no
//   alta, y de ahí sale el ancho que este componente calcula.
// - **Es de relleno, no de trazo.** Dos `path` con `fill`, sin `stroke`, sin
//   extremos redondeados que declarar. Lo que el manual llamaba «símbolo de
//   trazo (*line art*)» describe un archivo que ya no está en el repo.
// - **El tono de firma es `#2B282F`**, y hay un segundo, `#776F79`, en los dos
//   puntos terminales. Siguen sin coincidir con el primario de la paleta, que
//   es lo que §3.2 protege de verdad.
//
// El `.svg` fuente vive en `src/assets/marca/` y **no se edita desde aquí**: es
// material de marca. Este componente solo lo coloca, le da tamaño y le pone un
// nombre accesible.
//
// **El color viene dentro del propio `.svg` y este componente no lo toca.**
// Sobre el contratono de la mañana el tono de firma daría 1,17:1 y
// desaparecería, así que ahí `globals.css` lo pasa a monocromo blanco (17,06:1);
// de noche la cabecera es clara y se pinta tal cual (9,84:1).

import strivoLogo from '@/assets/marca/Strivo_Logo_Oficial.svg'

const ARCHIVOS = Object.freeze({
  strivo: strivoLogo,
})

/** Manual §3.1 — El lienzo del logo oficial. */
export const VIEW_BOX = '0 0 1016 920'

/** Las medidas nativas del archivo, que son las del `viewBox`. */
const ANCHO = 1016
const ALTO = 920

/**
 * @param {'strivo'} marca
 * @param {number|string} [alto] - La altura a la que se reproduce. Un número
 *   son píxeles; **una cadena es una longitud CSS**, y es lo que permite pedir
 *   un tamaño medido contra la pantalla —`min(40vh, 36vw)`— en vez de contra
 *   una cifra fija. La cabecera usa lo primero, porque ahí el mínimo legible
 *   manda (manual §3.1); el umbral usa lo segundo, porque ocupa la pantalla y
 *   la pantalla no siempre es la misma.
 * @param {string} [titulo] - Nombre accesible. Sin él, el logo es decorativo.
 */
export default function Simbolo({ marca, alto = 32, titulo }) {
  const archivo = ARCHIVOS[marca]
  if (!archivo) return null

  return (
    <img
      src={archivo}
      alt={titulo ?? ''}
      aria-hidden={titulo ? undefined : 'true'}
      // **Las medidas nativas, no las de reproducción.** Le dan al navegador la
      // proporción 1016:920 antes de que el `.svg` llegue, así que lo que hay
      // alrededor no salta cuando llega. El tamaño real lo pone el estilo, que
      // es lo único que puede aceptar una longitud relativa.
      width={ANCHO}
      height={ALTO}
      // `maxWidth` es la red de seguridad de la proporción ancha del lockup: a
      // igual alto es más ancho que alto, así que en una pantalla estrecha es el
      // ancho el que se sale primero. Con `objectFit` el recorte de ese tope no
      // deforma, solo encoge.
      style={{ height: alto, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
    />
  )
}
