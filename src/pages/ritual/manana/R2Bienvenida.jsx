// src/pages/ritual/manana/R2Bienvenida.jsx
// R2 — Bienvenida dinámica
// Copy: docs/copy-library.md §2 → copy.ritualManana.r2
//
// Una sola frase. Si ayer se cerró el día cansado o inquieto, cambia a "Ayer
// fue difícil. Hoy es nuevo.": reconoce sin preguntar, sin pedir explicación y
// sin mencionar nada de lo que ayer no se hizo (RN-05).
//
// Con nombre en el perfil, saluda por su nombre.

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'

export default function R2Bienvenida({ nombre, diaDificil }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const frase = diaDificil
    ? copy.ritualManana.r2.difficultDay
    : copy.ritualManana.r2.normal

  return (
    <div className="flex-1 flex flex-col justify-center">
      {nombre && !diaDificil && (
        <p className="text-md text-ink/80">
          {interpolate(copy.ritualManana.r2.greetingTemplate, { nombre })}
        </p>
      )}

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-display text-2xl leading-tight text-ink focus:outline-none"
      >
        {frase}
      </h1>
    </div>
  )
}
