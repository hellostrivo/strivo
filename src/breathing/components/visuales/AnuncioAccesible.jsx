// src/breathing/components/visuales/AnuncioAccesible.jsx
// Lo que oye quien no ve el dibujo (SPEC_14 §8).
//
// Un `aria-live` y nada más. La regla dura es RN-RE-VIS-24: **se actualiza al
// cambiar de fase, jamás por frame.** Eso no se consigue con un efecto que
// compare valores, se consigue por construcción: este componente **no recibe el
// tiempo transcurrido**, recibe la fase y lo que dura, dos cosas que no cambian
// mientras la fase dura. Si algún día alguien le pasa los milisegundos
// restantes, el texto se reescribe cada segundo, el lector de pantalla se corta
// a sí mismo, y nadie se entera hasta que alguien lo use de verdad.

import { mensajeAccesible } from '@/breathing/lib/anuncios'

/**
 * @param {?string} fase
 * @param {number} msFase - Lo que dura la fase entera, nunca lo que le queda.
 * @param {string} estadoSesion
 */
export default function AnuncioAccesible({ fase, msFase, estadoSesion }) {
  const mensaje = mensajeAccesible(fase, msFase, estadoSesion)

  return (
    <span className="respiracion-anuncio" aria-live="polite" aria-atomic="true">
      {mensaje}
    </span>
  )
}
