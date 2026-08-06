// src/pages/ritual/noche/N4Agradecimientos.jsx
// N4 — Agradecimientos
// Copy: copy.ritualNoche.n4 · campos compartidos con la Vista de Mañana:
// @components/diario/CamposAgradecimiento
//
// Es la misma lista del día: lo que se agradeció por la mañana ya está escrito
// aquí y se puede completar o corregir.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import CamposAgradecimiento from '@components/diario/CamposAgradecimiento'

export default function N4Agradecimientos({ agradecimientos, onChange, onGuardar }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualNoche.n4.question}
      </h1>

      <div className="mt-8">
        <CamposAgradecimiento
          agradecimientos={agradecimientos}
          onChange={onChange}
          onGuardar={onGuardar}
          etiqueta={copy.ritualNoche.n4.question}
          placeholder={copy.ritualNoche.n4.placeholder}
          suggestionsLabel={copy.ritualNoche.n4.suggestionsLabel}
          idBase="n4-agradecimiento"
          max={copy.ritualNoche.n4.max}
        />
      </div>
    </>
  )
}
