// src/components/strivo/FondoHorario.jsx
// La capa de fondo de la app (§18).
//
// Es una sola capa y vive por encima de las pestañas, así que cruzar de "Hoy" a
// "Journal" no la desmonta ni la hace parpadear. La apertura de sesión (§17) se
// dibuja sobre esta misma capa, no sobre una copia.
//
// Las pestañas que no son "Hoy" traen su propia superficie opaca encima: el
// degradado está ahí, pero no se ve. Así el fondo nunca se recarga y ninguna
// otra pantalla cambia de aspecto.

import { duracionFranja } from '@tokens'
import useFondoHorario from '@hooks/useFondoHorario'

export default function FondoHorario() {
  const fondo = useFondoHorario()

  return (
    <div
      className="fixed inset-0 -z-10 motion-reduce:transition-none"
      style={{
        background: fondo.gradiente,
        // Al cruzar una franja el color se mueve solo, despacio: no es una
        // transición de interfaz sino el paso del día (§18.3.5).
        transition: `background ${duracionFranja}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
      aria-hidden="true"
    />
  )
}
