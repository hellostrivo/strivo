// src/pages/ritual/noche/N2Habitos.jsx
// N2 — Revisión de hábitos
// Copy: docs/copy-library.md §2 → copy.ritualNoche.n2
//
// El repaso es del día entero, no solo de la noche: lo marcado por la mañana
// sigue editable por si se hizo más tarde o se marcó de más (RN-01 — la marca
// es la misma en todas las pantallas).
//
// Desmarcar no penaliza y no marcar nada tampoco: no hay fila de "no hecho" en
// el modelo, y la ausencia se queda en ausencia (§7.2).

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import HabitRow from '@components/strivo/HabitRow'

export default function N2Habitos({ habitos, areas, hechos, onToggle }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const total    = habitos.length
  const marcados = habitos.filter(h => hechos.has(h.id)).length
  const completo = total > 0 && marcados === total

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualNoche.n2.question}
      </h1>

      {total === 0 ? (
        <p className="mt-6 text-base leading-relaxed text-ink/80">
          {copy.ritualNoche.n2.empty}
        </p>
      ) : (
        <>
          <p className="mt-3 text-base text-ink/80" aria-live="polite">
            {completo
              ? copy.ritualNoche.n2.complete
              : interpolate(copy.ritualNoche.n2.progressTemplate, {
                  hecho: marcados,
                  total,
                })}
          </p>

          <div className="mt-8 flex flex-col gap-1">
            {habitos.map(habito => (
              <HabitRow
                key={habito.id}
                habit={habito}
                area={areas.find(a => a.id === habito.areaId)}
                done={hechos.has(habito.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
