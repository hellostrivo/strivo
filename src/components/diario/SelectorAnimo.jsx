// src/components/diario/SelectorAnimo.jsx
// Cómo te vas a dormir — cinco estados.
// Compartido por el Ritual de Noche (N6) y la Vista de Noche (bloque 5).
// Copy: copy.ritualNoche.n6.states · ids y orden: @lib/animos
//
// Ninguno es mejor que otro: "Inquieta" no es peor que "Tranquila", solo
// distinto, y ninguno se pinta en rojo ni abre una pregunta de seguimiento.
//
// De aquí sale el saludo de mañana (R2 cambia si el día se cerró cansada o
// inquieta), así que responder tiene consecuencia, pero no calificación.
// Volver a tocar el elegido lo suelta: nada queda fijado por error.
//
// Lo que se guarda es el id, no lo que se lee: el rótulo cambia con el género y
// el id no (ver la nota de @lib/animos).

import useCopy from '@hooks/useCopy'
import { ANIMOS, nombreDeAnimo } from '@lib/animos'
import Chip from '@components/ui/Chip'

export default function SelectorAnimo({ animo, onChange, etiquetadoPor }) {
  const t = useCopy()

  return (
    <div
      role="group"
      aria-labelledby={etiquetadoPor}
      aria-label={etiquetadoPor ? undefined : t('ritualNoche.n6.question')}
      className="flex flex-wrap gap-3"
    >
      {ANIMOS.map(({ id }) => (
        <Chip
          key={id}
          selected={animo === id}
          onClick={() => onChange(animo === id ? '' : id)}
        >
          {nombreDeAnimo(id, t)}
        </Chip>
      ))}
    </div>
  )
}
