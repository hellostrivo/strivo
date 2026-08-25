// src/components/shared/Simbolo.jsx
// El símbolo de la app (manual §3.1).
//
// **Queda uno** (paso 9, §8: "el símbolo de la app → `strivo_simbolo.svg`", en
// singular). Eran tres. El del alcance pausado se fue con sus archivos, y la
// vela —que era lo único que se veía en la cabecera, con el rótulo al lado ya
// diciendo Strivo— la sustituye la "S" del producto, y su archivo sale del repo.
//
// El `.svg` fuente vive en `src/assets/marca/` y **no se edita desde aquí**: es
// material de marca. Este componente solo lo coloca, le da tamaño y le pone un
// nombre accesible.
//
// `viewBox="0 0 122 130"` es el lienzo común que el manual da a los símbolos.
// Se conserva aunque hoy no haya con quién compararse: es la geometría que el
// diseñador entregó. Trazo con extremos y uniones redondeadas, `fill="none"`.
//
// **El tono de firma no es el primario de la paleta** (manual §3.2): el símbolo
// usa `#2B2730`. Por eso el color viene dentro del propio `.svg` y este
// componente no lo toca. Sobre el contratono de la mañana ese tono da 1,17:1 y
// desaparece, así que ahí `globals.css` lo pasa a monocromo blanco (17,06:1);
// de noche la cabecera es clara y se pinta tal cual (9,92:1).

import strivoSimbolo from '@/assets/marca/strivo_simbolo.svg'

const ARCHIVOS = Object.freeze({
  strivo: strivoSimbolo,
})

/** Manual §3.1 — El lienzo común de los tres. */
export const VIEW_BOX = '0 0 122 130'

/**
 * @param {'strivo'} marca
 * @param {number} [alto] - En píxeles. El ancho sale de la proporción 122:130.
 * @param {string} [titulo] - Nombre accesible. Sin él, el símbolo es decorativo.
 */
export default function Simbolo({ marca, alto = 24, titulo }) {
  const archivo = ARCHIVOS[marca]
  if (!archivo) return null

  return (
    <img
      src={archivo}
      alt={titulo ?? ''}
      aria-hidden={titulo ? undefined : 'true'}
      height={alto}
      width={Math.round((alto * 122) / 130)}
      style={{ height: alto, width: 'auto' }}
    />
  )
}
