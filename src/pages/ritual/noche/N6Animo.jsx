// src/pages/ritual/noche/N6Animo.jsx
// N6 — Ánimo de cierre
// Copy: docs/copy-library.md §2 → copy.ritualNoche.n6
//
// Cinco estados y ninguno es malo: "Inquieto" no es peor que "Tranquilo", solo
// distinto. De aquí sale el saludo de mañana (R2 cambia si hoy se cerró cansado
// o inquieto), así que responder tiene consecuencia, pero no calificación.
//
// Elegir es opcional: "Cerrar el día" no espera a que se toque nada.
//
// Pendiente de §5.6: los chips de matiz debajo, que contrastan con cómo se
// entró al día. Necesitan las emociones de la Vista de Mañana, que todavía no
// existe; en cuanto exista, van aquí.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import Chip from '@components/ui/Chip'

export default function N6Animo({ animo, onChange }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        id="n6-heading"
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualNoche.n6.question}
      </h1>

      <div
        role="group"
        aria-labelledby="n6-heading"
        className="mt-10 flex flex-wrap gap-3"
      >
        {copy.ritualNoche.n6.states.map(estado => (
          <Chip
            key={estado}
            selected={animo === estado}
            // Volver a tocar el elegido lo suelta: nada queda fijado por error
            onClick={() => onChange(animo === estado ? '' : estado)}
          >
            {estado}
          </Chip>
        ))}
      </div>
    </>
  )
}
