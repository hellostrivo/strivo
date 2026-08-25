// src/components/shared/Simbolo.jsx
// Los tres símbolos de marca (manual §3.1).
//
// Los `.svg` fuente viven en `src/assets/marca/` y **no se editan desde aquí**:
// son material de marca. Este componente solo los coloca, les da tamaño y les
// pone un nombre accesible.
//
// Los tres comparten `viewBox="0 0 122 130"`, que es lo que garantiza que se
// vean proporcionalmente consistentes uno junto a otro en la composición "Eje
// Dual". Trazo con extremos y uniones redondeadas, `fill="none"`.
//
// **El tono de firma no es el primario de la paleta** (manual §3.2): Lumia usa
// `#7563A7` en el símbolo y `#6C5AA7` en la interfaz. Son tonos hermanos, no
// idénticos, y no se fuerzan a coincidir. Por eso el color viene dentro del
// propio `.svg` y este componente no lo toca.
//
// **Strivo no es un espacio navegable** (§C0.2): su símbolo aparece donde el
// manual lo indica —splash, ajustes— y nunca como destino de la barra.

import lumiaSimbolo from '@/assets/marca/lumia_simbolo.svg'
import strivoSimbolo from '@/assets/marca/strivo_simbolo.svg'

const ARCHIVOS = Object.freeze({
  lumia: lumiaSimbolo,
  strivo: strivoSimbolo,
})

/** Manual §3.1 — El lienzo común de los tres. */
export const VIEW_BOX = '0 0 122 130'

/**
 * @param {'lumia'|'formia'|'strivo'} marca
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
