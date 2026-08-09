// src/pages/ritual/manana/R5Intencion.jsx
// R5 — Intención del día
// Copy: docs/copy-library.md §2 → copy.ritualManana.r5
//
// Campo abierto y opcional: "Comenzar mi día" no espera a que haya texto.
// Lo escrito se guarda al salir del campo y al cerrar el ritual, así que
// tampoco hace falta pulsar nada para no perderlo (RN-02).

import { useEffect, useRef } from 'react'
import { copy } from '@copy'

const MAX_LENGTH = 140

export default function R5Intencion({ intencion, onChange, onGuardar }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualManana.r5.question}
      </h1>

      <textarea
        id="intencion-del-dia"
        rows={3}
        value={intencion}
        maxLength={MAX_LENGTH}
        aria-label={copy.ritualManana.r5.question}
        placeholder={copy.ritualManana.r5.placeholder}
        onChange={event => onChange(event.target.value)}
        onBlur={onGuardar}
        className={[
          'mt-10 w-full resize-none',
          'rounded-md bg-surface border border-border',
          'px-4 py-4 text-md text-ink leading-relaxed',
          'placeholder:text-ink/70',
          'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
          'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
        ].join(' ')}
      />
    </>
  )
}
