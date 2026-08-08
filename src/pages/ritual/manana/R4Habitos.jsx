// src/pages/ritual/manana/R4Habitos.jsx
// R4 — Checklist de hábitos
// Copy: docs/copy-library.md §2 → copy.ritualManana.r4
//
// Marcar es un toque y nada más: sin modal, sin preguntas, sin confirmación
// (no-negociable 2). Cada toque se guarda al instante y se refleja donde
// aparezca el mismo hábito (RN-01, RN-02).
//
// Los hábitos nunca bloquean (RN-03): se puede seguir con cero marcados, y el
// ritual se completa igual. Al terminarlos todos hay una frase corta, sin
// confeti ni celebración desmedida.
//
// Sin hábitos para hoy no hay estado de error: hay una invitación.

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import HabitRow from '@components/strivo/HabitRow'

export default function R4Habitos({ habitos, areas, hechos, progreso, onToggle }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const total     = habitos.length
  const marcados  = habitos.filter(h => hechos.has(h.id)).length
  const completo  = total > 0 && marcados === total

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualManana.r4.title}
      </h1>

      {total === 0 ? (
        <p className="mt-6 text-base leading-relaxed text-ink/80">
          {copy.ritualManana.r4.empty}
        </p>
      ) : (
        <>
          <p className="mt-3 text-base text-ink/80" aria-live="polite">
            {completo
              ? copy.ritualManana.r4.complete
              : interpolate(copy.ritualManana.r4.progressTemplate, {
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
                  progreso={progreso?.get(habito.id)}
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
