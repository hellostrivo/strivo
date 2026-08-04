// src/pages/onboarding/P3BAreas.jsx
// P3B — Áreas de identidad
// Copy: docs/copy-library.md §1 → copy.onboarding.p3b
// Modelo: §5.1.1 — las áreas son 0..N y ninguna es obligatoria.
//
// Seguir sin elegir ninguna es una respuesta completa, no un paso a medias:
// todo lo que se registre vivirá en "General" (areaId = null) heredando la
// identidad central. Por eso Continuar nunca se inhabilita aquí.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import { AREAS } from '@lib/areas'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

export default function P3BAreas({ step, totalSteps, areas, onChange, onBack, onNext }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const toggle = tipo => {
    onChange(
      areas.includes(tipo)
        ? areas.filter(a => a !== tipo)
        : [...areas, tipo]
    )
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
        id="p3b-heading"
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p3b.question}
      </h1>

      <p id="p3b-hint" className="mt-3 text-base text-ink/80">
        {copy.onboarding.p3b.hint}
      </p>

      <div
        role="group"
        aria-labelledby="p3b-heading"
        aria-describedby="p3b-hint"
        className="mt-10 flex flex-wrap gap-3"
      >
        {AREAS.map(area => (
          <Chip
            key={area.tipo}
            color={area.color}
            selected={areas.includes(area.tipo)}
            onClick={() => toggle(area.tipo)}
          >
            {area.nombre}
          </Chip>
        ))}
      </div>
    </OnboardingLayout>
  )
}
