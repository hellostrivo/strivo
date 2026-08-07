// src/pages/onboarding/P4BAreas.jsx
// P4B — ¿En qué áreas de tu vida quieres crecer?
// Copy: docs/copy-library.md §1 → copy.onboarding.p4b
// Modelo: §5.1.1 — las áreas son 0..N y ninguna es obligatoria · pantalla: §8
//
// Seguir sin elegir ninguna es una respuesta completa, no un paso a medias:
// todo lo que se registre vivirá en "General" (areaId = null) heredando la
// identidad central, y el flujo salta la transición y P4C. Por eso Continuar
// nunca se inhabilita aquí.
//
// El máximo de tres es de producto, no técnico (§8.1): la pantalla siguiente
// pide una reflexión por cada área elegida, y más de tres convierte el
// onboarding en trabajo. Al llegar al límite las demás se atenúan y dejan de
// responder; tocarlas no produce error, aviso ni sacudida: la instrucción que
// ya estaba escrita hace un pulso y nada más.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { AREAS, MAX_AREAS_ACTIVAS } from '@lib/areas'
import { durations } from '@tokens'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

const PULSO_MS = durations.pulse

export default function P4BAreas({ step, totalSteps, areas, onChange, onBack, onNext }) {
  const headingRef = useRef(null)
  const [pulso, setPulso] = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  const lleno = areas.length >= MAX_AREAS_ACTIVAS

  const toggle = tipo => {
    if (areas.includes(tipo)) {
      onChange(areas.filter(a => a !== tipo))
      return
    }

    // La cuarta no entra. En vez de un error, la mirada va a la regla.
    if (lleno) {
      setPulso(true)
      setTimeout(() => setPulso(false), PULSO_MS)
      return
    }

    onChange([...areas, tipo])
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
        id="p4b-heading"
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p4b.question}
      </h1>

      <p id="p4b-hint" className="mt-3 text-base text-ink/70">
        {copy.onboarding.p4b.hint}
      </p>

      {/* Información operativa, no voz de marca: por eso va un nivel más abajo.
          Es lo que pulsa al tocar una área atenuada, así que tiene que estar a
          la vista sin desplazarse. */}
      <p className={clsx('mt-4 text-xs text-ink/55', pulso && 'animate-pulso-limite')}>
        {copy.onboarding.p4b.limit}
      </p>

      <div
        role="group"
        aria-labelledby="p4b-heading"
        aria-describedby="p4b-hint"
        className="mt-10 flex flex-wrap gap-3"
      >
        {AREAS.map(area => {
          const elegida  = areas.includes(area.tipo)
          const atenuada = lleno && !elegida
          return (
            <Chip
              key={area.tipo}
              color={area.color}
              selected={elegida}
              onClick={() => toggle(area.tipo)}
              aria-disabled={atenuada || undefined}
              className={clsx(
                // "Crecimiento personal" es la etiqueta más larga del catálogo:
                // si no cabe, fluye a dos líneas en vez de truncarse.
                'whitespace-normal text-left leading-tight',
                elegida && 'font-bold',
                'transition-opacity duration-200 ease-smooth motion-reduce:transition-none',
                atenuada && 'opacity-40'
              )}
            >
              {area.nombre}
            </Chip>
          )
        })}
      </div>

      {/* Llegar al límite no tiene aviso visual: este anuncio es la única forma
          de saberlo con lector de pantalla. */}
      <p className="sr-only" aria-live="polite">
        {interpolate(copy.onboarding.p4b.countTemplate, {
          n: areas.length,
          max: MAX_AREAS_ACTIVAS,
        })}
      </p>
    </OnboardingLayout>
  )
}
