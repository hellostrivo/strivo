// src/pages/onboarding/P1Bienvenida.jsx
// P1 — Bienvenida
// Copy: docs/copy-library.md §1 → copy.onboarding.p1
// Una sola promesa en pantalla. Sin registro, sin permisos, sin pedir nada.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import { colors, gradientsBySlot } from '@tokens'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

// Amanecer sobre papel: la promesa de empezar el día, no de terminarlo.
const BACKGROUND = `linear-gradient(160deg, ${gradientsBySlot.amanecer.from} 0%, ${colors.paper} 62%)`

export default function P1Bienvenida({ step, totalSteps, onNext }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      background={BACKGROUND}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          {copy.onboarding.p1.cta}
        </Button>
      }
    >
      <p className="text-sm font-medium tracking-widest uppercase text-ink/80">
        {copy.appName}
      </p>

      <div className="flex-1 flex flex-col justify-center">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl leading-tight text-ink focus:outline-none"
        >
          {copy.onboarding.p1.title}
        </h1>

        <p className="mt-5 text-md leading-relaxed text-ink/80">
          {copy.onboarding.p1.subtitle}
        </p>
      </div>
    </OnboardingLayout>
  )
}
