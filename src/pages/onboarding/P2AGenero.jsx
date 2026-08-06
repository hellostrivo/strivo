// src/pages/onboarding/P2AGenero.jsx
// P2A — Género
// Copy: docs/copy-library.md §1 → copy.onboarding.p2a
// Modelo: §2.2 del documento de cambios (profile.gender → genderMode)
//
// Va en la posición 3 para que todo el copy posterior —P3, P4, P4B, P4C y más
// tarde los rituales— hable en el género correcto desde el primer momento.
//
// Contestar es opcional: Continuar nunca se inhabilita y volver a tocar la
// opción elegida la deselecciona. Sin respuesta, `gender` queda en null y la app
// usa la variante neutra, que está escrita para sonar tan intencional como las
// otras dos (§2.5). Nadie ve un aviso por no contestar.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import { GENDER_OPTIONS } from '@lib/gender'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

export default function P2AGenero({ step, totalSteps, gender, onChange, onBack, onNext }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  // Una sola respuesta: elegir otra sustituye a la anterior, y volver a tocar la
  // que estaba elegida la deja en blanco.
  const seleccionar = valor => onChange(gender === valor ? null : valor)

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
        id="p2a-heading"
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p2a.question}
      </h1>

      <p id="p2a-hint" className="mt-3 text-base text-ink/80">
        {copy.onboarding.p2a.hint}
      </p>

      <div
        role="group"
        aria-labelledby="p2a-heading"
        aria-describedby="p2a-hint"
        className="mt-10 flex flex-wrap gap-3"
      >
        {GENDER_OPTIONS.map(valor => (
          <Chip
            key={valor}
            selected={gender === valor}
            onClick={() => seleccionar(valor)}
          >
            {copy.onboarding.p2a.options[valor]}
          </Chip>
        ))}
      </div>
    </OnboardingLayout>
  )
}
