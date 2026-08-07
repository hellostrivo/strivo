// src/pages/onboarding/P2AGenero.jsx
// P2A — Género
// Copy: docs/copy-library.md §1 → copy.onboarding.p2a
// Modelo: §2.2 (profile.gender → genderMode) · pantalla: §5
//
// Va en la posición 3 para que todo el copy posterior —P3, P4, P4B, P4C y más
// tarde los rituales— hable en el género correcto desde el primer momento.
//
// Es la única pantalla del onboarding donde Continuar espera a una respuesta.
// Se justifica porque sin este dato todo lo que sigue sale en modo neutro y ya
// no hay un momento natural para volver a preguntarlo. La salida sin fricción
// existe y está a un toque: "Prefiero no contestar".
//
// Sin auto-avance: aunque la respuesta sea única, avanzar al tocar impediría
// corregir un toque accidental.

import { useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import { GENDER_OPTIONS } from '@lib/gender'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

export default function P2AGenero({ step, totalSteps, gender, onChange, onBack, onNext }) {
  const headingRef = useRef(null)
  const opcionesRef = useRef([])

  // Tabulación itinerante: el grupo entero es una sola parada de teclado y por
  // dentro se recorre con las flechas, como manda un radiogroup.
  const [enFoco, setEnFoco] = useState(() => Math.max(0, GENDER_OPTIONS.indexOf(gender)))

  useEffect(() => { headingRef.current?.focus() }, [])

  // Tocar la ya elegida no la deselecciona: quedarse sin respuesta por un toque
  // accidental sería perder el dato justo después de haberlo dado.
  const elegir = (valor, indice) => {
    setEnFoco(indice)
    if (valor !== gender) onChange(valor)
  }

  const moverFoco = (desde, paso) => {
    const siguiente = (desde + paso + GENDER_OPTIONS.length) % GENDER_OPTIONS.length
    setEnFoco(siguiente)
    opcionesRef.current[siguiente]?.focus()
    // En un radiogroup las flechas eligen, no solo mueven
    onChange(GENDER_OPTIONS[siguiente])
  }

  const alTeclear = (evento, indice) => {
    const siguiente = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[evento.key]
    if (!siguiente) return
    evento.preventDefault()
    moverFoco(indice, siguiente)
  }

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
          disabled={!gender}
          onClick={onNext}
        >
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

      <p id="p2a-hint" className="mt-3 text-base text-ink/70">
        {copy.onboarding.p2a.hint}
      </p>

      {/* Una columna, no una rejilla: "Femenino" y "Prefiero no contestar" no
          caben igual, y forzar columnas produciría cajas desiguales. */}
      <div
        role="radiogroup"
        aria-labelledby="p2a-heading"
        aria-describedby="p2a-hint"
        className="mt-10 flex flex-col gap-3"
      >
        {GENDER_OPTIONS.map((valor, i) => (
          <Chip
            key={valor}
            ref={nodo => { opcionesRef.current[i] = nodo }}
            role="radio"
            fullWidth
            selected={gender === valor}
            onClick={() => elegir(valor, i)}
            onKeyDown={evento => alTeclear(evento, i)}
            tabIndex={i === enFoco ? 0 : -1}
          >
            {copy.onboarding.p2a.options[valor]}
          </Chip>
        ))}
      </div>
    </OnboardingLayout>
  )
}
