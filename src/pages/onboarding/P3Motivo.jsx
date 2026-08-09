// src/pages/onboarding/P3Motivo.jsx
// P3 — ¿Qué te gustaría encontrar aquí?
// Copy: docs/copy-library.md §1 → copy.onboarding.p3
// Ids y orden: @lib/reasons · modelo: §6.8
//
// La pregunta anterior ("¿Por qué estás aquí?") pedía justificarse y miraba
// hacia lo que está mal. Esta pide un deseo y mira hacia adelante: mismo dato
// para el producto, experiencia distinta para quien contesta (§6.1).
//
// Selección múltiple, sin límite y sin bloqueo: avanzar sin elegir nada es una
// respuesta completa y no produce ningún aviso (§4.12, RN-03).
//
// "Otro" es la única opción que se comporta distinto: revela un campo libre,
// opcional, que se descarta si se deselecciona.

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import {
  REASON_IDS,
  REASON_OTHER,
  REASON_OTHER_MAX,
  REASON_OTHER_COUNTER_FROM,
} from '@lib/reasons'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

export default function P3Motivo({
  step,
  totalSteps,
  reasons,          // ids elegidos
  otro,             // texto libre de "Otro" (string | null)
  onChangeReasons,
  onChangeOtro,
  onBack,
  onNext,
}) {
  const headingRef = useRef(null)
  const otherRef   = useRef(null)

  const otroElegido = reasons.includes(REASON_OTHER)
  const texto       = otro ?? ''

  useEffect(() => { headingRef.current?.focus() }, [])

  const toggle = id => {
    if (reasons.includes(id)) {
      onChangeReasons(reasons.filter(r => r !== id))
      // Al soltar "Otro" lo escrito se va con él: dejarlo guardado en silencio
      // sería conservar algo que la persona ya retiró.
      if (id === REASON_OTHER) onChangeOtro(null)
      return
    }

    onChangeReasons([...reasons, id])
    if (id === REASON_OTHER) {
      requestAnimationFrame(() => otherRef.current?.focus())
    }
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
        id="p3-heading"
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p3.question}
      </h1>

      <p id="p3-hint" className="mt-3 text-base leading-relaxed text-ink/70">
        {copy.onboarding.p3.hint}
      </p>

      {/* Una columna a ancho completo: las siete frases tienen longitudes muy
          distintas y en rejilla quedarían cajas desiguales. */}
      <div
        role="group"
        aria-labelledby="p3-heading"
        aria-describedby="p3-hint"
        className="mt-10 flex flex-col gap-3"
      >
        {REASON_IDS.map(id => (
          <div key={id}>
            <Chip
              fullWidth
              selected={reasons.includes(id)}
              onClick={() => toggle(id)}
              aria-controls={id === REASON_OTHER ? 'p3-otro' : undefined}
              aria-expanded={id === REASON_OTHER ? otroElegido : undefined}
            >
              {copy.onboarding.p3.options[id]}
            </Chip>

            {/* El campo cuelga de su opción, con una sangría que las relaciona */}
            {id === REASON_OTHER && (
              <div
                id="p3-otro"
                className={[
                  'grid pl-4',
                  'transition-all duration-200 ease-out motion-reduce:transition-none',
                  otroElegido ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0',
                ].join(' ')}
                aria-hidden={!otroElegido || undefined}
              >
                <div className="overflow-hidden">
                  <label htmlFor="p3-otro-campo" className="sr-only">
                    {copy.onboarding.p3.otherLabel}
                  </label>

                  <input
                    id="p3-otro-campo"
                    ref={otherRef}
                    type="text"
                    value={texto}
                    maxLength={REASON_OTHER_MAX}
                    autoComplete="off"
                    enterKeyHint="done"
                    tabIndex={otroElegido ? 0 : -1}
                    placeholder={copy.onboarding.p3.otherPlaceholder}
                    onChange={evento => onChangeOtro(evento.target.value)}
                    onKeyDown={evento => {
                      if (evento.key === 'Enter') evento.preventDefault()
                    }}
                    className={[
                      'w-full min-h-touch',
                      'rounded-md bg-surface border border-border',
                      'px-4 py-4 text-base text-ink',
                      'placeholder:text-ink/70',
                      'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                      'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
                    ].join(' ')}
                  />

                  {/* Aparece solo cerca del final, y en el tono de siempre:
                      quedarse sin espacio no es un error que señalar. */}
                  {texto.length >= REASON_OTHER_COUNTER_FROM && (
                    <p className="mt-2 text-xs text-ink/60" aria-live="polite">
                      {interpolate(copy.onboarding.p3.otherCounterTemplate, {
                        n: texto.length,
                        max: REASON_OTHER_MAX,
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </OnboardingLayout>
  )
}
