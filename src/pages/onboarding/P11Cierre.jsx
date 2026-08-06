// src/pages/onboarding/P11Cierre.jsx
// P11 — Cierre del onboarding
// Copy: docs/copy-library.md §1 → copy.onboarding.p11
//
// La última pantalla no resume lo que se hizo: devuelve quién dijo ser, en sus
// palabras y con sus áreas (§5.1.1). No hay felicitación ni porcentaje de
// completado; la frase ya es el premio.
//
// Aquí se materializa el borrador en perfil, áreas y hábitos reales. Se hace al
// entrar y no al tocar el botón: el guardado nunca puede hacer esperar a la
// ceremonia (§3.3, el cierre no falla). Si falla, lo escrito sigue en el
// borrador local y la persona entra igual.

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import { colors, gradientsBySlot } from '@tokens'
import { getAreaName } from '@lib/areas'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

// Amanecer otra vez, como en P1: el flujo cierra donde empezó, con la mañana
// que se promete al final ("Nos vemos mañana a las…").
const BACKGROUND = `linear-gradient(160deg, ${gradientsBySlot.amanecer.from} 0%, ${colors.paper} 62%)`

export default function P11Cierre({
  step,
  totalSteps,
  identidad,
  areas,            // tipos elegidos en P3B
  horaDespertar,
  onEnter,          // materializa el borrador; se llama una sola vez
  onBack,
  onNext,
}) {
  const headingRef = useRef(null)
  const guardado   = useRef(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  useEffect(() => {
    if (guardado.current) return
    guardado.current = true
    onEnter?.()
  }, [onEnter])

  const listaAreas = areas
    .map(tipo => getAreaName(tipo).toLocaleLowerCase('es'))

  const frase = listaAreas.length
    ? interpolate(copy.onboarding.p11.closingWithAreas, {
        identidad,
        areas: unirAreas(listaAreas),
      })
    : interpolate(copy.onboarding.p11.closingTemplate, { identidad })

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      background={BACKGROUND}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          {copy.onboarding.p11.ctaLabel}
        </Button>
      }
    >
      <div className="flex-1 flex flex-col justify-center">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl leading-tight text-ink focus:outline-none"
        >
          {frase}
        </h1>

        <p className="mt-6 text-md leading-relaxed text-ink/80">
          {interpolate(copy.onboarding.p11.nextTemplate, { hora: horaDespertar })}
        </p>
      </div>
    </OnboardingLayout>
  )
}

// "salud" · "salud y trabajo" · "salud, trabajo y relaciones"
function unirAreas(nombres) {
  if (nombres.length === 1) return nombres[0]
  const últimas = nombres.slice(-2).join(copy.onboarding.p11.areasJoin)
  return [...nombres.slice(0, -2), últimas].join(', ')
}
