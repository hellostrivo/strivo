// src/pages/ritual/noche/N6Animo.jsx
// N6 — Ánimo de cierre
// Copy: docs/copy-library.md §2 → copy.ritualNoche.n6
// Chips compartidos con la Vista de Noche: @components/diario/SelectorAnimo
//
// Elegir es opcional: "Cerrar el día" no espera a que se toque nada.
//
// Pendiente de §5.6: los chips de matiz debajo, que contrastan con cómo se
// entró al día. Necesitan las emociones de la Vista de Mañana; ahora que
// existen (§5.3, bloque 3), es el siguiente paso natural de esta pantalla.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import SelectorAnimo from '@components/diario/SelectorAnimo'

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

      <div className="mt-10">
        <SelectorAnimo animo={animo} onChange={onChange} etiquetadoPor="n6-heading" />
      </div>
    </>
  )
}
