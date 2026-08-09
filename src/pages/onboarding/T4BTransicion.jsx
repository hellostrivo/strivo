// src/pages/onboarding/T4BTransicion.jsx
// T-4B — Transición hacia P4C
// Copy: docs/copy-library.md §1 → copy.onboarding.t4b
//
// Marca el cambio de registro entre elegir (P4B) y reflexionar (P4C). Sin este
// respiro se pasa de tocar tarjetas a escribir sobre uno mismo en menos de un
// segundo, y la escritura se siente como una demanda inesperada (§9.1).
//
// Solo aparece si se eligió al menos un área: sin áreas no hay nada que
// reencuadrar y el flujo va directo a P6.
//
// Motion: 3000 ms (2300 con movimiento reducido). Es la segunda excepción
// autorizada al rango 120–900 ms, junto con la apertura (ver CLAUDE.md §5).

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { colors, gradientsBySlot, transicion } from '@tokens'
import { getTimeSlot } from '@lib/timeSlot'
import useReducedMotion from '@hooks/useReducedMotion'

// Como en P1: la paleta se congela al montar para que un cambio de franja a
// mitad de la secuencia no haga saltar el fondo.
function fondoDeLaFranja() {
  const { from } = gradientsBySlot[getTimeSlot()] ?? gradientsBySlot.amanecer
  return `linear-gradient(160deg, ${from} 0%, ${colors.paper} 62%)`
}

export default function T4BTransicion({ onNext }) {
  const reducedMotion = useReducedMotion()
  const [fondo]       = useState(fondoDeLaFranja)
  const [saliendo, setSaliendo] = useState(false)
  const cerrado = useRef(false)

  const duracion = reducedMotion ? transicion.totalReducida : transicion.total

  // El relevo se programa una sola vez. Guardar la salida en una referencia
  // evita que un re-render del flujo reinicie la cuenta y alargue la pausa.
  const salida = useRef(onNext)
  salida.current = onNext

  const saltar = () => {
    if (cerrado.current) return
    cerrado.current = true
    setSaliendo(true)
    setTimeout(() => salida.current?.(), transicion.saltar)
  }

  useEffect(() => {
    const relevo = setTimeout(() => {
      if (cerrado.current) return
      cerrado.current = true
      salida.current?.()
    }, duracion)
    return () => clearTimeout(relevo)
  }, [duracion])

  return (
    <div
      className={clsx(
        'min-h-screen flex flex-col items-center justify-center px-6',
        'text-ink font-sans',
        'transition-opacity ease-smooth motion-reduce:transition-none',
        saliendo && 'opacity-0'
      )}
      style={{ background: fondo, transitionDuration: `${transicion.saltar}ms` }}
      onPointerDown={saltar}
    >
      {/* Ancho de línea corto a propósito: el corte cae entre las dos oraciones */}
      <p
        aria-live="polite"
        className={clsx(
          'max-w-[19ch] text-center font-display text-xl leading-tight',
          reducedMotion ? 'animate-transicion-frase-quieta' : 'animate-transicion-frase'
        )}
      >
        {copy.onboarding.t4b.phrase}
      </p>

      {/* Quien no puede "tocar la pantalla" necesita una salida: invisible hasta
          que recibe el foco, y entonces perfectamente visible. */}
      <button
        type="button"
        onClick={saltar}
        className={clsx(
          'sr-only focus-visible:not-sr-only',
          'focus-visible:absolute focus-visible:bottom-10',
          'focus-visible:min-h-touch-sm focus-visible:min-w-touch focus-visible:px-6 focus-visible:py-3',
          'focus-visible:rounded-full focus-visible:bg-surface focus-visible:text-ink',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
        )}
      >
        {copy.onboarding.t4b.continue}
      </button>
    </div>
  )
}
