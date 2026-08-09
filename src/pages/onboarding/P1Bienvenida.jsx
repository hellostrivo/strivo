// src/pages/onboarding/P1Bienvenida.jsx
// P1 — Bienvenida
// Copy: docs/copy-library.md §1 → copy.onboarding.p1
// Una sola promesa en pantalla. Sin registro, sin permisos, sin pedir nada.
//
// El copy ya no describe el producto ("refugio digital para…") sino lo que la
// persona recibe: un lugar al que volver y tres minutos para respirar.
//
// La apertura (§3.3) vive aquí y no en un paso aparte para que el degradado sea
// literalmente el mismo elemento antes y después. Un paso propio significaría
// montar y desmontar el fondo, y ese parpadeo rompe todo el efecto.

import { useCallback, useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import { colors, gradientsBySlot } from '@tokens'
import { getFlag, setFlag } from '@lib/db'
import { getTimeSlot } from '@lib/timeSlot'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'
import AperturaStrivo from '@components/onboarding/AperturaStrivo'

const FLAG_APERTURA = 'hasSeenIntro'

// Verla cinco segundos en cada recarga hace insufrible iterar sobre P1 (§3.9):
// VITE_SKIP_INTRO=true en .env.local la desactiva mientras se desarrolla.
const SALTAR_EN_DESARROLLO = import.meta.env?.VITE_SKIP_INTRO === 'true'

// Se calcula una sola vez al montar: si la franja cambia a mitad de la apertura,
// la paleta no salta (§3.6).
function fondoDeLaFranja() {
  const { from } = gradientsBySlot[getTimeSlot()] ?? gradientsBySlot.amanecer
  return `linear-gradient(160deg, ${from} 0%, ${colors.paper} 62%)`
}

export default function P1Bienvenida({ step, totalSteps, onNext }) {
  const headingRef = useRef(null)
  const [fondo]    = useState(fondoDeLaFranja)

  // null mientras se comprueba la bandera: la pantalla se queda con su fondo y
  // sin contenido, que es exactamente el primer fotograma de la apertura. Así no
  // se ve P1 un instante antes de que la apertura la tape.
  const [conApertura, setConApertura] = useState(null)

  useEffect(() => {
    if (SALTAR_EN_DESARROLLO) {
      setConApertura(false)
      return undefined
    }

    let vigente = true
    getFlag(FLAG_APERTURA, false).then(vista => {
      if (vigente) setConApertura(!vista)
    })
    return () => { vigente = false }
  }, [])

  // Se marca al terminarla o al saltarla: en los dos casos ya se vio.
  const terminarApertura = useCallback(() => {
    setConApertura(false)
    setFlag(FLAG_APERTURA, true)
  }, [])

  // El título se anuncia al llegar a P1, nunca durante la apertura
  useEffect(() => {
    if (conApertura === false) headingRef.current?.focus()
  }, [conApertura])

  // Mientras se comprueba la bandera basta con tapar el contenido: el fondo ya
  // está puesto y es el mismo que verá la apertura.
  const capa =
    conApertura === null ? <div className="fixed inset-0" aria-hidden="true" />
      : conApertura      ? <AperturaStrivo onEnd={terminarApertura} />
        : null

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      background={fondo}
      overlay={capa}
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
          {copy.onboarding.p1.subtitle}
        </h1>

        {/* Más largo que el copy anterior: necesita más aire (un escalón más de
            espaciado) e interlineado generoso para no leerse como un bloque. */}
        <p className="mt-6 text-base leading-relaxed text-ink/75">
          {copy.onboarding.p1.support}
        </p>
      </div>
    </OnboardingLayout>
  )
}
