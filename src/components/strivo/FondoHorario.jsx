// src/components/strivo/FondoHorario.jsx
// La capa de fondo de la app (§18, §20).
//
// Es una sola capa y vive por encima de las pestañas, así que cruzar de "Hoy" a
// "Journal" no la desmonta ni la hace parpadear. La apertura de sesión (§17) se
// dibuja sobre esta misma capa, no sobre una copia.
//
// Las pestañas que no son "Hoy" traen su propia superficie opaca encima: el
// degradado está ahí, pero no se ve. Así el fondo nunca se recarga y ninguna
// otra pantalla cambia de aspecto.
//
// DOS MODOS. Sin `tema`, pinta el degradado que toca según la hora (§18): es lo
// que ve la apertura de sesión y lo que hay detrás de las demás pestañas. Con
// `tema`, pinta uno de los dos de la pantalla Hoy (§20), que los elige el botón
// y no el reloj.
//
// Se pintan las tres capas a la vez y lo que cambia es la opacidad: un
// degradado no se puede interpolar en CSS, así que transicionar `background`
// daría un salto seco. Con opacidades sí hay cruce de verdad.

import { duracionFranja, duracionTema, temasHoy, degradadoDeTema } from '@tokens'
import useFondoHorario from '@hooks/useFondoHorario'

export default function FondoHorario({ tema }) {
  const fondo = useFondoHorario()

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      {/* La hora. Debajo del todo: es el fondo por defecto de la app. */}
      <div
        className="absolute inset-0 motion-reduce:transition-none"
        style={{
          background: fondo.gradiente,
          // Al cruzar una franja el color se mueve solo, despacio: no es una
          // transición de interfaz sino el paso del día (§18.3.5).
          transition: `background ${duracionFranja}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        }}
      />

      {/* Los dos temas de Hoy, encima. El que no toca se queda en cero. */}
      {Object.entries(temasHoy).map(([nombre, valores]) => (
        <div
          key={nombre}
          className="absolute inset-0 motion-reduce:transition-none"
          style={{
            background: degradadoDeTema(valores),
            opacity: tema === nombre ? 1 : 0,
            transition: `opacity ${duracionTema}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />
      ))}
    </div>
  )
}
