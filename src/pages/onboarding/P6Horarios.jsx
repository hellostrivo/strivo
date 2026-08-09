// src/pages/onboarding/P6Horarios.jsx
// P6 — Horarios
// Modelo: §7.2 (UserProfile.horaDespertar · horaDormir · diaTerminaA)
//
// Estas dos horas deciden la franja horaria de "Hoy" (§4.3.3): cuándo aparece
// la Vista de Mañana, cuándo la de Noche y a qué hora avisar. Vienen con un
// valor razonable puesto, así que Continuar sin tocar nada es una respuesta
// completa; no hay estado vacío que resolver.
//
// `diaTerminaA` no se pregunta: 03:00 sirve para casi todo el mundo y se ajusta
// después en Perfil. Una pregunta menos aquí vale más que un ajuste fino.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

export default function P6Horarios({
  step,
  totalSteps,
  horaDespertar,
  horaDormir,
  onChange,
  onBack,
  onNext,
}) {
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
        {copy.onboarding.p6.question}
      </h1>

      <p className="mt-3 text-base text-ink/80">
        {copy.onboarding.p6.hint}
      </p>

      <div className="mt-12 flex flex-col gap-8">
        <CampoHora
          id="hora-despertar"
          label={copy.onboarding.p6.wakeLabel}
          value={horaDespertar}
          onChange={valor => onChange({ horaDespertar: valor })}
        />

        <CampoHora
          id="hora-dormir"
          label={copy.onboarding.p6.sleepLabel}
          value={horaDormir}
          onChange={valor => onChange({ horaDormir: valor })}
        />
      </div>
    </OnboardingLayout>
  )
}

function CampoHora({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block font-display text-md text-ink">
        {label}
      </label>

      <input
        id={id}
        type="time"
        value={value}
        // El selector nativo ya conoce el formato de hora del dispositivo
        // (12 o 24 h) y es accesible con teclado y lector de pantalla.
        onChange={event => {
          // Vaciar el campo devolvería '' y dejaría el perfil sin franja horaria
          if (event.target.value) onChange(event.target.value)
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
  )
}
