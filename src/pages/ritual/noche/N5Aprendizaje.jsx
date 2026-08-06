// src/pages/ritual/noche/N5Aprendizaje.jsx
// N5 — Reflexión
// Copy: copy.diarioNoche.learning (la pregunta) · copy.ritualNoche.n5
//
// La pregunta rota por día entre las dos de la biblioteca: "¿Qué fue lo menos
// difícil de hoy?" y "¿Qué intentarías diferente mañana?". Rotar es variedad,
// no examen; ninguna de las dos pide justificar nada.
//
// El campo es opcional y se guarda al salir de él.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'

const MAX_LENGTH = 300

export default function N5Aprendizaje({ pregunta, aprendizaje, onChange, onGuardar }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {pregunta}
      </h1>

      <textarea
        id="aprendizaje"
        rows={4}
        value={aprendizaje}
        maxLength={MAX_LENGTH}
        aria-label={pregunta}
        placeholder={copy.ritualNoche.n5.placeholder}
        onChange={event => onChange(event.target.value)}
        onBlur={onGuardar}
        className={[
          'mt-8 w-full resize-none',
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
