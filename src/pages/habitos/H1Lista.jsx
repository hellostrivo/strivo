// src/pages/habitos/H1Lista.jsx
// H1 — Lista de hábitos agrupada por momento (§5.7)
//
// El orden es el del día: mañana, noche, a lo largo del día. Un grupo sin
// hábitos no se pinta vacío, simplemente no está.
//
// Los pausados van al final, en su propio grupo. Siguen visibles porque siguen
// siendo suyos, pero no se mezclan con los de hoy ni se presentan como algo
// pendiente de retomar (RN-05).
//
// Marcar desde aquí es la misma marca del ritual (RN-01).

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import { agruparPorMomento } from '@lib/habits'
import HabitRow from '@components/strivo/HabitRow'
import Button from '@components/ui/Button'

export default function H1Lista({ habitos, areas, hechos, onToggle, onAbrir, onCrear }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const { grupos, pausados, totalActivos } = agruparPorMomento(habitos)
  const areaDe = habito => areas.find(a => a.id === habito.areaId)

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.habits.list.title}
      </h1>

      {totalActivos > 0 && (
        <p className="mt-2 text-base text-ink/80">
          {interpolate(copy.habits.list.countTemplate, { n: totalActivos })}
        </p>
      )}

      {grupos.length === 0 && pausados.length === 0 ? (
        <p className="mt-8 text-base leading-relaxed text-ink/80">
          {copy.empty.habits}
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {grupos.map(grupo => (
            <section key={grupo.momento} aria-labelledby={`grupo-${grupo.momento}`}>
              <h2
                id={`grupo-${grupo.momento}`}
                className="font-display text-md text-ink"
              >
                {grupo.titulo}
              </h2>

              <div className="mt-4 flex flex-col gap-1">
                {grupo.habitos.map(habito => (
                  <HabitRow
                    key={habito.id}
                    habit={habito}
                    area={areaDe(habito)}
                    done={hechos.has(habito.id)}
                    onToggle={onToggle}
                    onOpen={() => onAbrir(habito)}
                  />
                ))}
              </div>
            </section>
          ))}

          {pausados.length > 0 && (
            <section aria-labelledby="grupo-pausados">
              <h2 id="grupo-pausados" className="font-display text-md text-ink/70">
                {copy.habits.list.pausedGroup}
              </h2>

              <div className="mt-4 flex flex-col gap-2">
                {pausados.map(habito => (
                  <button
                    key={habito.id}
                    type="button"
                    onClick={() => onAbrir(habito)}
                    className={[
                      'w-full min-h-touch flex items-center gap-3 px-1 py-3 rounded-sm text-left',
                      'opacity-70 hover:opacity-100',
                      'transition-opacity duration-260 ease-smooth motion-reduce:transition-none',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                    ].join(' ')}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: areaDe(habito)?.color ?? '#D9CFC4' }}
                      aria-hidden="true"
                    />
                    <span className="text-base text-ink">{habito.nombre}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Button variant="secondary" size="lg" fullWidth className="mt-12" onClick={onCrear}>
        {copy.habits.list.add}
      </Button>
    </div>
  )
}
