// src/components/formia/HabitoItem.jsx
// Una fila de H1. Marcar es **un toque**: una casilla y nada más — sin modal,
// sin preguntas, sin confirmación (no-negociable §11.2 de CLAUDE.md).
//
// La fila tiene dos controles separados y nunca anidados: la casilla, que
// marca, y el nombre, que abre el detalle.
//
// §5.7.4 — La etiqueta es el nombre del área, o nada. La decide el helper
// único; esta fila no reimplementa la regla ni le añade excepciones.
//
// §5.7 (microinteracciones) — Al marcar, la fila se atenúa conservando el texto
// legible. **Nunca tachado:** tachar dice "esto ya no importa", y lo que se
// acaba de hacer es justo lo que más importa.

import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { areaLabelForHabit } from '@/lib/habitAreaLabel'
import { PuntosDias } from './Constancia90'

const textos = copy.formia.habitos

export default function HabitoItem({ habito, areas, marcado, fechas, hechas, onMarcar, onAbrir }) {
  const etiqueta = areaLabelForHabit(habito, areas)
  const momento = habito.context ? textos.momento[habito.context] : null
  const resumen = interpolate(textos.detalle.diasTemplate, {
    n: fechas.filter((fecha) => hechas.has(fecha)).length,
    total: fechas.length,
  })

  return (
    <li className="flex items-center gap-3 py-2">
      {/* Un toque. `role="checkbox"` hace que se anuncie como marcado o sin
          marcar, nunca como fallado (§5.7, accesibilidad). */}
      <button
        type="button"
        role="checkbox"
        aria-checked={marcado}
        aria-label={habito.name}
        onClick={() => onMarcar(habito.id, marcado)}
        className={clsx(
          'flex items-center justify-center flex-shrink-0',
          'w-11 h-11 rounded-full border',
          'transition-colors duration-260 ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
          'motion-reduce:transition-none',
          marcado ? 'border-sage bg-sage' : 'border-border bg-paper hover:bg-surface',
        )}
      >
        {marcado && (
          <svg
            className="w-5 h-5 text-ink"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={() => onAbrir(habito.id)}
        className={clsx(
          'flex-1 min-w-0 text-left rounded-sm px-2 py-2',
          'transition-colors duration-260 ease-smooth',
          'hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
          'motion-reduce:transition-none',
        )}
      >
        <span className="flex items-center gap-2">
          {habito.emoji && (
            <span className="text-base" aria-hidden="true">
              {habito.emoji}
            </span>
          )}
          <span
            className={clsx(
              'text-base truncate',
              // Atenuada al marcar, pero sin bajar de AAA: `ink/80` sobre
              // `paper` mantiene el contraste por encima de 7:1.
              marcado ? 'text-ink/80' : 'text-ink',
            )}
          >
            {habito.name}
          </span>
        </span>

        {(etiqueta || momento) && (
          <span className="flex items-center gap-2 mt-0.5 text-sm text-ink/80">
            {etiqueta && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full ring-1 ring-inset ring-ink/10"
                  style={{ backgroundColor: etiqueta.color }}
                  aria-hidden="true"
                />
                {etiqueta.nombre}
              </span>
            )}
            {momento && <span>{momento}</span>}
          </span>
        )}
      </button>

      <PuntosDias fechas={fechas} hechas={hechas} resumen={resumen} />
    </li>
  )
}
