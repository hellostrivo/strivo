// src/components/strivo/HabitRow.jsx
// Fila de hábito en checklist (ritual o lista)
// Design: §5.7, Blueprint v3
//
// REGLAS DE DISEÑO:
// ✅ Al marcar: trazo animado de 260ms + atenuar al 70% (sin tachar)
// ✅ Al desmarcar: inverso, sin penalización visual
// ✅ NUNCA rojo, ni porcentaje de incumplimiento, ni texto "fallaste"
// ✅ El texto tachado NO se usa (connota tarea eliminada, no logro)

import { useState } from 'react'
import { clsx } from 'clsx'
import { areaColors } from '@tokens'

/**
 * HabitRow — fila de hábito en checklist
 *
 * @param {object} habit - entidad Habit del §7.2
 * @param {boolean} done - si ya está marcado hoy
 * @param {function} onToggle - callback(habitId, done)
 * @param {object} area - entidad Area (para color)
 */
export default function HabitRow({ habit, done = false, onToggle, area, className }) {
  const [pressed, setPressed] = useState(false)

  const color = area?.color ?? areaColors[area?.tipo] ?? '#D9CFC4'

  function handleToggle() {
    setPressed(true)
    onToggle?.(habit.id, !done)
    setTimeout(() => setPressed(false), 260)
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-3 py-3 px-1',
        'transition-opacity duration-260 ease-smooth',
        done && 'opacity-70',   // Atenuar al 70% (sin tachar)
        'motion-reduce:transition-none',
        className
      )}
    >
      {/* Casilla de verificación (custom para animar el trazo) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={done}
        aria-label={done ? `${habit.nombre} — completado. Toca para desmarcar.` : `${habit.nombre} — sin completar. Toca para marcar.`}
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded-sm border-2',
          'flex items-center justify-center',
          'transition-all duration-260 ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
          'min-w-[48px] min-h-[48px] -m-3',   // área de toque 48×48
          'motion-reduce:transition-none',
        )}
        style={{
          borderColor: done ? color : '#D9CFC4',
          backgroundColor: done ? color + '15' : 'transparent',
        }}
      >
        {done && (
          <svg
            viewBox="0 0 12 10"
            fill="none"
            className="w-3 h-3 animate-check-draw"
            aria-hidden="true"
          >
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke={color}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset={pressed ? '40' : '0'}
              style={{ transition: 'stroke-dashoffset 260ms cubic-bezier(0.25,0.46,0.45,0.94)' }}
            />
          </svg>
        )}
      </button>

      {/* Contenido del hábito */}
      <button
        type="button"
        className={clsx(
          'flex-1 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded-sm',
        )}
        onClick={() => {/* abrir detalle del hábito */}}
      >
        <div className="flex items-center gap-2">
          {/* Punto de color del área */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className={clsx(
            'text-base text-ink font-sans',
            // SIN tachar. El texto se atenúa por el padre (opacity-70)
          )}>
            {habit.nombre}
          </span>
        </div>

        {/* Identidad de área (si existe) — aparece debajo del nombre */}
        {area?.identidadArea && (
          <p className="text-sm text-ink/50 mt-0.5 ml-4">
            {area.identidadArea}
          </p>
        )}
      </button>

      {/* Total de veces (discreto, solo lectura) */}
      {habit.totalCompletados > 0 && (
        <span className="text-sm text-ink/40 flex-shrink-0" aria-hidden="true">
          {habit.totalCompletados}×
        </span>
      )}
    </div>
  )
}
