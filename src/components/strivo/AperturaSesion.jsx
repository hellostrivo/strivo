// src/components/strivo/AperturaSesion.jsx
// El umbral de cada entrada (§17).
//
// Antes, abrir la app era caer directamente en los pendientes. Esto es el gesto
// que separa el ruido de afuera del espacio de adentro, el mismo que la apertura
// de P1 hace una sola vez en la vida.
//
// Lo primero que se lee no es una tarea: es una frase de gratitud o de
// amabilidad. Cambia el tono con el que se entra.
//
// Cuándo aparece (y cuándo no) lo decide @lib/sesion: aquí solo se dibuja. La
// diferencia entre un umbral y un peaje está en esas reglas.
//
// Motion: 3400 ms, o 2400 con movimiento reducido. Tercera excepción autorizada
// al rango 120–900 ms (ver CLAUDE.md §5).

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { aperturaSesion, colors } from '@tokens'
import useReducedMotion from '@hooks/useReducedMotion'

// Luz que se enciende, no un círculo: el gradiente se desvanece antes del borde
// del elemento, así que no hay contorno que la recorte.
const LUZ = `radial-gradient(circle,
  rgba(255, 255, 255, 0.85) 0%,
  rgba(255, 248, 232, 0.45) 40%,
  rgba(255, 240, 214, 0.18) 65%,
  rgba(255, 240, 214, 0) 80%)`

export default function AperturaSesion({ frase, sobreOscuro, onEnd }) {
  const reducedMotion = useReducedMotion()
  const [saliendo, setSaliendo] = useState(false)
  const cerrado = useRef(false)

  // El relevo se programa una sola vez: un re-render del padre no puede alargar
  // la pausa.
  const salida = useRef(onEnd)
  salida.current = onEnd

  const duracion = reducedMotion ? aperturaSesion.totalReducida : aperturaSesion.total

  const saltar = () => {
    if (cerrado.current) return
    cerrado.current = true
    setSaliendo(true)
    setTimeout(() => salida.current?.(), aperturaSesion.saltar)
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
        'fixed inset-0 z-50 flex flex-col items-center justify-center px-8',
        'transition-opacity ease-smooth motion-reduce:transition-none',
        saliendo && 'opacity-0'
      )}
      style={{ transitionDuration: `${aperturaSesion.saltar}ms` }}
      onPointerDown={saltar}
    >
      {/* Decorativa. Lo que se anuncia es la frase. */}
      <div
        className={clsx(
          'absolute w-[70vw] max-w-sm aspect-square rounded-full',
          reducedMotion ? 'animate-sesion-luz-quieta' : 'animate-sesion-luz'
        )}
        style={{ background: LUZ }}
        aria-hidden="true"
      />

      <p
        aria-live="polite"
        className={clsx(
          'relative max-w-[22ch] text-center font-display text-md leading-snug',
          reducedMotion ? 'animate-sesion-frase-quieta' : 'animate-sesion-frase'
        )}
        style={{ color: sobreOscuro ? colors.paper : colors.ink }}
      >
        {frase}
      </p>

      {/* Quien navega con teclado o lector no puede "tocar la pantalla" */}
      <button
        type="button"
        onClick={saltar}
        className={clsx(
          'absolute bottom-10 min-h-touch-sm min-w-touch px-6 py-3',
          'font-sans text-sm rounded-full opacity-60',
          'transition-opacity duration-260 ease-smooth motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
        )}
        style={{ color: sobreOscuro ? colors.paper : colors.ink }}
      >
        {copy.apertura.entrar}
      </button>
    </div>
  )
}
