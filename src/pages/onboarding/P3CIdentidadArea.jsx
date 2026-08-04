// src/pages/onboarding/P3CIdentidadArea.jsx
// P3C — Identidad por área (opcional)
// Copy: docs/copy-library.md §1 → copy.onboarding.p3c
// Modelo: §5.1.1 — `identidadArea` es opcional y nunca contradice la central.
//
// Todo el paso es opcional: Continuar sigue disponible con los campos vacíos,
// y quien los deje así no ve ningún aviso. Lo que se escriba se guarda sin el
// prefijo ("cuida su cuerpo"), igual que la identidad central en P3, porque el
// resto de la app lo interpola después de "alguien que"
// (habits.detail.identityTemplate · profile.identity.areaPrefix).
//
// Si en P3B no se eligió ninguna área, el flujo salta esta pantalla.

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import { AREAS } from '@lib/areas'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

const MAX_LENGTH = 80

export default function P3CIdentidadArea({
  step,
  totalSteps,
  areas,             // tipos elegidos en P3B, en orden de selección
  identidades,       // { [tipo]: texto }
  onChange,
  onBack,
  onNext,
}) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  // Se recorre AREAS para conservar el orden canónico del catálogo
  const selected = AREAS.filter(area => areas.includes(area.tipo))

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
        {copy.onboarding.p3c.question}
      </h1>

      <p className="mt-3 text-base text-ink/80">
        {copy.onboarding.p3c.hint}
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {selected.map(area => {
          const fieldId = `identidad-area-${area.tipo}`
          return (
            <div key={area.tipo}>
              <label
                htmlFor={fieldId}
                className="flex items-center gap-2 font-display text-md text-ink"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: area.color }}
                  aria-hidden="true"
                />
                {interpolate(copy.onboarding.p3c.prefixTemplate, { área: area.nombre })}
              </label>

              <input
                id={fieldId}
                type="text"
                value={identidades[area.tipo] ?? ''}
                maxLength={MAX_LENGTH}
                autoComplete="off"
                enterKeyHint="next"
                onChange={event => onChange(area.tipo, event.target.value)}
                className={[
                  'mt-3 w-full min-h-touch',
                  'rounded-md bg-surface border border-border',
                  'px-4 py-4 text-md text-ink',
                  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                  'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
                ].join(' ')}
              />
            </div>
          )
        })}
      </div>
    </OnboardingLayout>
  )
}
