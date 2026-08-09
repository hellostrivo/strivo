// src/components/diario/VictoriasHeredadas.jsx
// Las victorias que se propusieron por la mañana, con su decisión.
// Compartido por el Ritual de Noche (N3) y la Vista de Noche (bloque 1).
// Copy: copy.diarioNoche.victories
//
// Cuatro salidas y ninguna es un fracaso: "Lo lograste" · "No se dio" ·
// "Pasarla a mañana" · "Dejarla ir". Decidir es opcional; lo que no se toca se
// queda pendiente, sin marca de deuda y sin recordatorio.
//
// Sin victorias de la mañana no se pinta nada: no se enseña una lista vacía
// para señalar que no se llenó (RN-05). Quien lo usa decide qué poner en su
// lugar (en la Vista, nada).

import { copy } from '@copy'
import Card from '@components/ui/Card'
import Chip from '@components/ui/Chip'

export const DECISIONES = [
  { id: 'lograda', label: copy.diarioNoche.victories.achieved },
  { id: 'noSeDio', label: copy.diarioNoche.victories.notAchieved },
  { id: 'aManana', label: copy.diarioNoche.victories.passToTomorrow },
  { id: 'soltada', label: copy.diarioNoche.victories.letItGo },
]

export default function VictoriasHeredadas({ heredadas, decisiones, onDecidir }) {
  if (!heredadas.length) return null

  return (
    <div className="flex flex-col gap-4">
      {heredadas.map(victoria => (
        <Card key={victoria.id}>
          <p className="font-display text-md leading-relaxed text-ink">
            {victoria.texto}
          </p>

          <div
            role="group"
            aria-label={victoria.texto}
            className="mt-4 flex flex-wrap gap-2"
          >
            {DECISIONES.map(decision => (
              <Chip
                key={decision.id}
                size="sm"
                selected={decisiones[victoria.id] === decision.id}
                onClick={() => onDecidir(victoria, decision.id)}
              >
                {decision.label}
              </Chip>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
