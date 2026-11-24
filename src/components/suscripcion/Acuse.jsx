// src/components/suscripcion/Acuse.jsx
// Una frase dos segundos, y se va: «Gracias. Todo tuyo.» (SPEC_25 §3.3). Sin
// confeti y sin nada que tocar.

import { useEffect, useRef } from 'react'
import { momentoDe } from '@lib/timeSlot'
import { useBarraDeEstado } from '@lib/barraEstado'

/** Cuánto se lee. */
export const ACUSE_VISIBLE = 2000

export default function Acuse({ texto, onTerminar }) {
  const momento = momentoDe()
  useBarraDeEstado({ capa: 'pantalla', momento })
  const alTerminar = useRef(onTerminar)
  alTerminar.current = onTerminar

  useEffect(() => {
    const reloj = setTimeout(() => alTerminar.current?.(), ACUSE_VISIBLE)
    return () => clearTimeout(reloj)
  }, [texto])

  return (
    <div
      data-momento={momento}
      data-surface={momento === 'noche' ? 'dark' : 'light'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-strivo-base bg-strivo px-8 text-center"
    >
      <p role="status" className="font-display text-lg text-on-surface leading-snug">
        {texto}
      </p>
    </div>
  )
}
