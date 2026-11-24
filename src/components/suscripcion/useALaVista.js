// src/components/suscripcion/useALaVista.js
// Lleva algo a la vista cuando aparece. Con la mañana o la noche ya cerradas,
// Hoy se abre a la altura de la consulta: sin esto, la tarjeta del día 6 —que
// sale una sola vez— y el aviso de lectura quedarían fuera de la pantalla.

import { useEffect, useRef } from 'react'

export function useALaVista(activo) {
  const ref = useRef(null)
  useEffect(() => {
    if (!activo) return undefined
    // Después de los desplazamientos de esta misma vuelta.
    const reloj = setTimeout(() => ref.current?.scrollIntoView({ block: 'center' }), 50)
    return () => clearTimeout(reloj)
  }, [activo])
  return ref
}
