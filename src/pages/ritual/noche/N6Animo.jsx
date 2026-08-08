// src/pages/ritual/noche/N6Animo.jsx
// N6 — Estado de cierre
// Copy: docs/copy-library.md §2 → copy.ritualNoche.n6
// Chips compartidos con la Vista de Noche: @components/diario/SelectorAnimo
//
// Elegir es opcional: "Cerrar el día" no espera a que se toque nada, y se puede
// pasar con cero elegidos.
//
// Pendiente de §5.6: los chips de matiz debajo, que contrastan con cómo se
// entró al día. Necesitan las emociones de la Vista de Mañana; ahora que
// existen (§5.3, bloque 3), es el siguiente paso natural de esta pantalla.

import { useEffect, useRef } from 'react'
import SelectorAnimo from '@components/diario/SelectorAnimo'

export default function N6Animo({ animos, onChange }) {
  // La pregunta la pinta la tarjeta del selector, así que el foco del paso va
  // ahí: no hay dos títulos, y quien navega con lector de pantalla sigue
  // aterrizando en el encabezado al entrar.
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <SelectorAnimo
      animos={animos}
      onChange={onChange}
      tituloRef={headingRef}
      tituloComo="h1"
    />
  )
}
