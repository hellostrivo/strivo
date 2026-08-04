// src/hooks/useReducedMotion.js
// Devuelve true si el sistema pide movimiento reducido.
// Se usa para desactivar rotaciones y transiciones de contenido,
// no solo las animaciones CSS (que ya cubre globals.css).

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true
  )

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY)
    if (!mq) return
    const onChange = event => setReduced(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
