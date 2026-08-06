// src/pages/ritual/manana/R1Respiracion.jsx
// R1 — Respiración
// Copy: docs/copy-library.md §2 → copy.ritualManana.r1
//
// Seis segundos: un ciclo completo, inhalar y exhalar. El círculo lleva el
// ritmo y al terminar el ritual avanza solo, para que respirar sea lo único
// que haya que hacer.
//
// Con movimiento reducido no hay círculo que seguir ni avance automático: sin
// la animación, saltar de pantalla a los 6 segundos sería un sobresalto. Ahí
// manda el botón.
//
// "Continuar" está disponible desde el primer instante en los dos casos: nadie
// tiene que esperar a que la app le dé permiso.

import { useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import useReducedMotion from '@hooks/useReducedMotion'

const CICLO_MS  = 6000
const MITAD_MS  = CICLO_MS / 2

export default function R1Respiracion({ onNext }) {
  const headingRef    = useRef(null)
  const reducedMotion = useReducedMotion()
  const [exhalando, setExhalando] = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  useEffect(() => {
    if (reducedMotion) return
    const mitad = setTimeout(() => setExhalando(true), MITAD_MS)
    const fin   = setTimeout(onNext, CICLO_MS)
    return () => { clearTimeout(mitad); clearTimeout(fin) }
  }, [reducedMotion, onNext])

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink text-center focus:outline-none"
      >
        {copy.ritualManana.r1.prompt}
      </h1>

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <div
          className={[
            'w-40 h-40 rounded-full',
            'bg-amber/30 border border-amber/40',
            reducedMotion ? '' : 'animate-breathe',
          ].join(' ')}
          aria-hidden="true"
        />

        <p className="text-md text-ink/80" aria-live="polite">
          {reducedMotion
            ? copy.ritualManana.r1.duration
            : (exhalando ? copy.ritualManana.r1.breatheOut : copy.ritualManana.r1.breatheIn)}
        </p>
      </div>
    </>
  )
}
