// src/pages/ritual/noche/N4Agradecimientos.jsx
// N4 — Agradecimientos
// Copy: copy.ritualNoche.n4 · sugerencias en copy.diarioManana.gratitude
//
// Tres campos para empezar. Al llenar el último aparece otro, hasta diez: la
// lista crece con quien escribe y nunca le pide más de lo que trae.
//
// Las sugerencias salen a los 6 segundos sin escribir nada (suggestionsDelay).
// Son una mano tendida para cuando cuesta arrancar, no una tarea: tocarlas
// rellena el primer hueco libre y desaparecen. Con movimiento reducido se
// muestran desde el principio, sin la aparición.

import { useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import Chip from '@components/ui/Chip'
import useReducedMotion from '@hooks/useReducedMotion'

const CAMPOS_INICIALES = 3
const MAX_LENGTH = 120

export default function N4Agradecimientos({ agradecimientos, onChange, onGuardar }) {
  const headingRef    = useRef(null)
  const reducedMotion = useReducedMotion()
  const [sugerenciasVisibles, setSugerenciasVisibles] = useState(reducedMotion)

  useEffect(() => { headingRef.current?.focus() }, [])

  const algoEscrito = agradecimientos.some(t => t.trim())

  useEffect(() => {
    if (reducedMotion || algoEscrito) return
    const id = setTimeout(
      () => setSugerenciasVisibles(true),
      copy.diarioManana.gratitude.suggestionsDelay
    )
    return () => clearTimeout(id)
  }, [reducedMotion, algoEscrito])

  // Siempre hay un hueco libre al final, hasta el máximo
  const visibles = Math.min(
    copy.ritualNoche.n4.max,
    Math.max(CAMPOS_INICIALES, agradecimientos.filter(t => t.trim()).length + 1)
  )
  const campos = Array.from({ length: visibles }, (_, i) => agradecimientos[i] ?? '')

  const escribir = (indice, valor) => {
    const siguientes = [...campos]
    siguientes[indice] = valor
    onChange(siguientes)
  }

  const usarSugerencia = sugerencia => {
    const hueco = campos.findIndex(t => !t.trim())
    escribir(hueco === -1 ? campos.length : hueco, sugerencia)
  }

  const sugerenciasSinUsar = copy.diarioManana.gratitude.suggestions.filter(
    s => !campos.some(t => t.trim().toLowerCase() === s.toLowerCase())
  )

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualNoche.n4.question}
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {campos.map((valor, indice) => (
          <input
            key={indice}
            type="text"
            value={valor}
            maxLength={MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="next"
            aria-label={`${copy.ritualNoche.n4.question} ${indice + 1}`}
            placeholder={copy.ritualNoche.n4.placeholder}
            onChange={event => escribir(indice, event.target.value)}
            onBlur={onGuardar}
            className={[
              'w-full min-h-touch',
              'rounded-md bg-surface border border-border',
              'px-4 py-4 text-base text-ink',
              'placeholder:text-ink/70',
              'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
              'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
            ].join(' ')}
          />
        ))}
      </div>

      {sugerenciasVisibles && !algoEscrito && sugerenciasSinUsar.length > 0 && (
        <div className="mt-8 animate-fade-up">
          <p id="n4-sugerencias" className="text-base text-ink/80">
            {copy.ritualNoche.n4.suggestionsLabel}
          </p>
          <div
            role="group"
            aria-labelledby="n4-sugerencias"
            className="mt-3 flex flex-wrap gap-2"
          >
            {sugerenciasSinUsar.map(sugerencia => (
              <Chip key={sugerencia} size="sm" onClick={() => usarSugerencia(sugerencia)}>
                {sugerencia}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
