// src/pages/onboarding/P4Identidad.jsx
// P4 — Identidad central
// Copy: docs/copy-library.md §1 → copy.onboarding.p4
// Modelo: §5.1.1 (identidad central: amplia, estable, emocional; no es un objetivo)
//
// Se guarda la frase SIN el prefijo ("crece cada día", no "alguien que crece cada día"),
// porque el resto de la app la interpola después de "alguien que":
//   ritualManana.r3.template · insights.area.evidenceTemplate · onboarding.p11
//
// Los ejemplos rotan dentro del campo. Rotar es una sugerencia, nunca una corrección:
// se detiene en cuanto la persona escribe o enfoca el campo, y con movimiento reducido
// se muestra un único ejemplo fijo.

import { useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'
import useCopy from '@hooks/useCopy'
import useReducedMotion from '@hooks/useReducedMotion'

const ROTATION_MS = 4200
const MAX_LENGTH  = 80

export default function P4Identidad({ step, totalSteps, identidad, onChange, onBack, onNext }) {
  const t              = useCopy()
  const headingRef     = useRef(null)
  const reducedMotion  = useReducedMotion()
  const [exampleIndex, setExampleIndex] = useState(0)
  const [focused, setFocused]           = useState(false)

  // Los ejemplos se ofrecen en el género que se contestó en P2A: quien lea
  // "…cuida de sí misma" está leyendo una frase escrita para ella, no un
  // formulario con barras (§2.1).
  const examples = t('onboarding.p4.placeholders')
  const hasText  = identidad.trim().length > 0

  useEffect(() => { headingRef.current?.focus() }, [])

  useEffect(() => {
    if (reducedMotion || focused || hasText) return
    const id = setInterval(
      () => setExampleIndex(i => (i + 1) % examples.length),
      ROTATION_MS
    )
    return () => clearInterval(id)
  }, [reducedMotion, focused, hasText, examples.length])

  const placeholder = reducedMotion ? examples[0] : examples[exampleIndex]

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!hasText}
          onClick={() => onNext()}
        >
          {copy.onboarding.nav.continue}
        </Button>
      }
    >
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink/80 focus:outline-none"
      >
        {copy.onboarding.p4.headline}
      </h1>
      <p className="mt-2 font-display text-xl leading-tight text-ink">
        {copy.onboarding.p4.subhead}
      </p>

      <div className="mt-12">
        <label
          htmlFor="identidad-central"
          className="block font-display text-md text-ink"
        >
          {copy.onboarding.p4.prefix}
        </label>

        <input
          id="identidad-central"
          type="text"
          value={identidad}
          maxLength={MAX_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          placeholder={placeholder}
          onChange={event => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={event => {
            if (event.key === 'Enter' && hasText) onNext()
          }}
          className={[
            'mt-4 w-full min-h-touch',
            'rounded-md bg-surface border border-border',
            'px-4 py-4 text-md text-ink',
            'placeholder:text-ink/70',
            'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
            'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
          ].join(' ')}
        />
      </div>
    </OnboardingLayout>
  )
}
