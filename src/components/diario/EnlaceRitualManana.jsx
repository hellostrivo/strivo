// src/components/diario/EnlaceRitualManana.jsx
// El cierre de la sección de mañana (§25).
//
// Los hábitos ocupaban sitio en "Hoy" duplicando lo que ya vive en su pestaña, y
// mezclaban dos cosas distintas: la intención del día y el registro de
// cumplimiento. Aquí queda solo la puerta.
//
// No es únicamente navegación: después de decidir cómo quieres sentirte y qué
// victorias quieres, el paso siguiente es ir a hacerlo.
//
// El progreso se muestra como "2 de 5 completados" y nada más. Ni barra ni
// porcentaje: los dos convierten el ritual en una métrica, que es lo contrario
// de lo que este producto defiende.

import { copy, interpolate } from '@copy'
import useFondoHorario from '@hooks/useFondoHorario'

export default function EnlaceRitualManana({ habitos = [], hechos, onIr }) {
  const fondo = useFondoHorario()

  const total   = habitos.length
  const marcados = habitos.filter(h => hechos?.has(h.id)).length
  const completo = total > 0 && marcados === total

  // Sin hábitos no hay progreso que contar: "0 de 0" solo sería un reproche.
  const progreso = total === 0
    ? null
    : completo
      ? copy.hoy.ritualManana.completado
      : interpolate(copy.hoy.ritualManana.progreso, { completados: marcados, total })

  return (
    <button
      type="button"
      onClick={onIr}
      aria-label={progreso
        ? `${copy.hoy.ritualManana.cta}, ${progreso}`
        : copy.hoy.ritualManana.cta}
      className={[
        'w-full rounded-lg px-6 py-8',
        'flex items-center justify-between gap-4',
        'shadow-elev-2 text-left',
        'transition-transform duration-260 ease-smooth motion-reduce:transition-none',
        'active:scale-[0.99]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
      ].join(' ')}
      style={{
        // Del degradado del momento, para que pertenezca a la hora del día
        background: `linear-gradient(140deg, ${fondo.from} 0%, ${fondo.to} 100%)`,
        color: fondo.texto,
      }}
    >
      <span className="flex-1">
        <span className="block text-base font-bold">
          {copy.hoy.ritualManana.cta}
        </span>
        {progreso && (
          <span className="mt-1 block text-sm opacity-70">
            {progreso}
          </span>
        )}
      </span>

      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 flex-shrink-0 opacity-50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
