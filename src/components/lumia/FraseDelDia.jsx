// src/components/lumia/FraseDelDia.jsx
// La frase del día (§5.3, Bloque 1 · RN-HOY-02).
//
// Es aire, no información: no se toca, no lleva acción y no compite con la
// tarjeta de abajo. La elige `content/frases-del-dia.js` a partir de la fecha,
// de forma determinista y sin red.

import { copy } from '@copy'

export default function FraseDelDia({ frase }) {
  if (!frase) return null

  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="sr-only">{copy.lumia.hoy.frase.label}</figcaption>
      <blockquote className="font-display text-md text-on-surface leading-snug">
        {frase.texto}
      </blockquote>
    </figure>
  )
}
