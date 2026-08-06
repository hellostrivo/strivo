// src/components/strivo/EmotionCard.jsx
// Tarjeta de emoción para la Vista de Mañana (§5.3, bloque 3)
// Copy: copy.emotions · catálogo y colores: @lib/emotions
//
// REGLAS:
// ✅ Máx 3 seleccionadas
// ✅ Selección visible por color + borde + escala (3 señales, no solo color)
// ✅ Accesible: estado "pressed" anunciado por lector de pantalla
//
// Las tarjetas no llevan emoji: el sistema solo admite los de la tabla de
// emociones (§3.6) y esa tabla todavía no está en el repo. Hasta entonces la
// emoción se distingue por su nombre y su color.

import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { EMOTIONS } from '@lib/emotions'

export { EMOTIONS }

/**
 * EmotionCard — tarjeta tocable de emoción
 */
export function EmotionCard({ emotion, selected, onToggle, disabled }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={emotion.label}
      disabled={disabled && !selected}
      onClick={() => onToggle(emotion.id)}
      className={clsx(
        'flex flex-col items-center justify-center gap-1',
        'p-3 rounded-md border',
        'text-sm font-sans font-medium text-ink',
        'transition-all duration-260 ease-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
        'min-h-[72px]',
        'motion-reduce:transition-none',
        // Estado base
        !selected && !disabled && 'bg-surface border-border hover:border-ink/20 hover:shadow-elev-1',
        // Estado seleccionado (color + borde + escala = 3 señales)
        selected && 'scale-[1.04] shadow-elev-2',
        // Deshabilitado (ya hay 3 seleccionadas, esta no)
        disabled && !selected && 'opacity-40 cursor-not-allowed',
      )}
      style={selected ? {
        backgroundColor: emotion.color + '15',
        borderColor: emotion.color,
      } : undefined}
    >
      <span>{emotion.label}</span>
    </button>
  )
}

/**
 * EmotionSelector — grid de tarjetas con lógica de máximo
 *
 * @param {string[]} selected - IDs de emociones seleccionadas
 * @param {function} onChange - callback(ids[])
 */
export default function EmotionSelector({ selected = [], onChange }) {
  const max = copy.diarioManana.emotions.max

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else if (selected.length < max) {
      onChange([...selected, id])
    }
    // Si ya están las 3 y quieren añadir otra: ignorar (botón disabled)
  }

  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-label={`${copy.diarioManana.emotions.label} ${interpolate(
        copy.diarioManana.emotions.hintTemplate,
        { max }
      )}`}
    >
      {EMOTIONS.map(emotion => (
        <EmotionCard
          key={emotion.id}
          emotion={emotion}
          selected={selected.includes(emotion.id)}
          onToggle={toggle}
          disabled={selected.length >= max && !selected.includes(emotion.id)}
        />
      ))}
    </div>
  )
}
