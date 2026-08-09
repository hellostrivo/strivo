// src/pages/onboarding/P2Nombre.jsx
// P2 — Nombre
// Copy: docs/copy-library.md §1 → copy.onboarding.p2
//
// Primera pregunta del flujo: la más fácil de contestar. Lo introspectivo viene
// después, cuando ya hay confianza (§1.1 del documento de cambios).
//
// Una sola pregunta y nada alrededor: ni correo, ni apellido, ni foto.
//
// El nombre es opcional y Continuar nunca se inhabilita: lo que lo usa tiene
// versión con nombre y sin él (el ritual de la mañana saluda con él si está),
// así que dejarlo en blanco no rompe nada ni deja la app a medias. Pedirlo dos
// veces sí sería una forma de decir que la respuesta anterior no valía.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

const MAX_LENGTH = 40

export default function P2Nombre({ step, totalSteps, nombre, onChange, onBack, onNext }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

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
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p2.question}
      </h1>

      <p className="mt-3 text-base text-ink/80">
        {copy.onboarding.p2.hint}
      </p>

      <div className="mt-12">
        <label htmlFor="nombre" className="block font-display text-md text-ink">
          {copy.onboarding.p2.label}
        </label>

        <input
          id="nombre"
          type="text"
          value={nombre}
          maxLength={MAX_LENGTH}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="done"
          onChange={event => onChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') onNext()
          }}
          className={[
            'mt-4 w-full min-h-touch',
            'rounded-md bg-surface border border-border',
            'px-4 py-4 text-md text-ink',
            'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
            'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
          ].join(' ')}
        />
      </div>
    </OnboardingLayout>
  )
}
