// src/components/diario/SelectorAnimo.jsx
// Cómo te vas a dormir — cinco estados.
// Compartido por el Ritual de Noche (N6) y la Vista de Noche (bloque 5).
// Copy: copy.ritualNoche.n6.states
//
// Ninguno es mejor que otro: "Inquieto" no es peor que "Tranquilo", solo
// distinto, y ninguno se pinta en rojo ni abre una pregunta de seguimiento.
//
// De aquí sale el saludo de mañana (R2 cambia si el día se cerró cansado o
// inquieto), así que responder tiene consecuencia, pero no calificación.
// Volver a tocar el elegido lo suelta: nada queda fijado por error.

import { copy } from '@copy'
import Chip from '@components/ui/Chip'

export default function SelectorAnimo({ animo, onChange, etiquetadoPor }) {
  return (
    <div
      role="group"
      aria-labelledby={etiquetadoPor}
      aria-label={etiquetadoPor ? undefined : copy.ritualNoche.n6.question}
      className="flex flex-wrap gap-3"
    >
      {copy.ritualNoche.n6.states.map(estado => (
        <Chip
          key={estado}
          selected={animo === estado}
          onClick={() => onChange(animo === estado ? '' : estado)}
        >
          {estado}
        </Chip>
      ))}
    </div>
  )
}
