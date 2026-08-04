// src/pages/onboarding/P2Motivo.jsx
// P2 — Motivo ("¿Por qué estás aquí?")
// Copy: docs/copy-library.md §1 → copy.onboarding.p2
//
// Selección múltiple y opcional: seguir adelante sin elegir nada es válido.
// Nada aquí bloquea el flujo ni se presenta como requisito (§4.12, RN-03).
//
// "Otro…" abre un campo para escribir motivos propios, uno tras otro. Cada uno
// se añade como su propio chip y se quita tocándolo.

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

const MAX_LENGTH = 80

export default function P2Motivo({
  step,
  totalSteps,
  motivos,          // elegidos de las opciones ofrecidas
  propios,          // escritos por la persona
  onChangeMotivos,
  onChangePropios,
  onBack,
  onNext,
}) {
  const headingRef = useRef(null)
  const otherRef   = useRef(null)
  const [adding, setAdding] = useState(false)
  const [texto, setTexto]   = useState('')

  useEffect(() => { headingRef.current?.focus() }, [])
  useEffect(() => { if (adding) otherRef.current?.focus() }, [adding])

  const toggle = option => {
    onChangeMotivos(
      motivos.includes(option)
        ? motivos.filter(m => m !== option)
        : [...motivos, option]
    )
  }

  // Se añade y el campo queda listo para el siguiente, sin cerrarse
  const addPropio = () => {
    const limpio = texto.trim()
    if (!limpio) return
    const yaEstá = [...copy.onboarding.p2.options, ...propios]
      .some(m => m.toLowerCase() === limpio.toLowerCase())
    if (!yaEstá) onChangePropios([...propios, limpio])
    setTexto('')
    otherRef.current?.focus()
  }

  const removePropio = motivo => {
    onChangePropios(propios.filter(m => m !== motivo))
  }

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          {copy.onboarding.nav.continue}
        </Button>
      }
    >
      <h1
        ref={headingRef}
        tabIndex={-1}
        id="p2-heading"
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p2.question}
      </h1>

      <p id="p2-hint" className="mt-3 text-base text-ink/80">
        {copy.onboarding.p2.hint}
      </p>

      <div
        role="group"
        aria-labelledby="p2-heading"
        aria-describedby="p2-hint"
        className="mt-10 flex flex-wrap gap-3"
      >
        {copy.onboarding.p2.options.map(option => (
          <Chip
            key={option}
            selected={motivos.includes(option)}
            onClick={() => toggle(option)}
          >
            {option}
          </Chip>
        ))}

        {propios.map(motivo => (
          <Chip
            key={motivo}
            selected
            onClick={() => removePropio(motivo)}
            aria-label={interpolate(copy.onboarding.p2.otherRemoveTemplate, { motivo })}
          >
            {motivo}
            <CloseIcon />
          </Chip>
        ))}

        <Chip
          selected={adding}
          onClick={() => setAdding(a => !a)}
          aria-expanded={adding}
          aria-controls="p2-otro"
        >
          {copy.onboarding.p2.other}
        </Chip>
      </div>

      {adding && (
        <div id="p2-otro" className="mt-6 animate-fade-up">
          <label htmlFor="p2-otro-campo" className="block text-base text-ink/80">
            {copy.onboarding.p2.otherLabel}
          </label>

          <div className="mt-3 flex items-start gap-3">
            <input
              id="p2-otro-campo"
              ref={otherRef}
              type="text"
              value={texto}
              maxLength={MAX_LENGTH}
              autoComplete="off"
              enterKeyHint="done"
              placeholder={copy.onboarding.p2.otherPlaceholder}
              onChange={event => setTexto(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addPropio()
                }
              }}
              className={[
                'flex-1 min-w-0 min-h-touch',
                'rounded-md bg-surface border border-border',
                'px-4 py-4 text-base text-ink',
                'placeholder:text-ink/70',
                'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
              ].join(' ')}
            />

            <Button
              variant="secondary"
              size="sm"
              disabled={!texto.trim()}
              onClick={addPropio}
              className="flex-shrink-0"
            >
              {copy.onboarding.p2.otherAdd}
            </Button>
          </div>
        </div>
      )}
    </OnboardingLayout>
  )
}

function CloseIcon() {
  return (
    <svg
      className="w-3 h-3 flex-shrink-0 opacity-60"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  )
}
