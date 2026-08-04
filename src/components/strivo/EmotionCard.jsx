// src/components/strivo/EmotionCard.jsx
// Tarjeta de emoción para la Vista de Mañana (§5.3, bloque 3)
// El usuario selecciona hasta 3 emociones de 16 disponibles
//
// REGLAS:
// ✅ Máx 3 seleccionadas
// ✅ Selección visible por color + borde + escala (3 señales, no solo color)
// ✅ Accesible: estado "pressed" anunciado por lector de pantalla

import { clsx } from 'clsx'

// Las 16 emociones curadas (§5.3, tabla de emociones)
export const EMOTIONS = [
  { id: 'tranquilo',   label: 'Tranquilo',    color: '#7E9E86' },
  { id: 'agradecido',  label: 'Agradecido',   color: '#E5A25C' },
  { id: 'motivado',    label: 'Motivado',      color: '#93A9C4' },
  { id: 'ansioso',     label: 'Ansioso',       color: '#C9836B' },
  { id: 'cansado',     label: 'Cansado',       color: '#8B6BA8' },
  { id: 'esperanzado', label: 'Esperanzado',   color: '#7E9E86' },
  { id: 'irritable',   label: 'Irritable',     color: '#C9836B' },
  { id: 'enfocado',    label: 'Enfocado',      color: '#93A9C4' },
  { id: 'triste',      label: 'Triste',        color: '#8B6BA8' },
  { id: 'contento',    label: 'Contento',      color: '#E5A25C' },
  { id: 'abrumado',    label: 'Abrumado',      color: '#C9836B' },
  { id: 'curioso',     label: 'Curioso',       color: '#93A9C4' },
  { id: 'presente',    label: 'Presente',      color: '#7E9E86' },
  { id: 'inseguro',    label: 'Inseguro',      color: '#8B6BA8' },
  { id: 'aliviado',    label: 'Aliviado',      color: '#7E9E86' },
  { id: 'nostalgico',  label: 'Nostálgico',    color: '#8B6BA8' },
]

/**
 * EmotionCard — tarjeta tocable de emoción
 */
export function EmotionCard({ emotion, selected, onToggle, disabled }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${emotion.label}${selected ? ', seleccionado' : ''}`}
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
        color: emotion.color,
      } : undefined}
    >
      <span className="text-base" aria-hidden="true">{emotion.icon ?? '•'}</span>
      <span>{emotion.label}</span>
    </button>
  )
}

/**
 * EmotionSelector — grid de 16 tarjetas con lógica de máx 3
 *
 * @param {string[]} selected - IDs de emociones seleccionadas
 * @param {function} onChange - callback(ids[])
 */
export default function EmotionSelector({ selected = [], onChange }) {
  const MAX = 3

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else if (selected.length < MAX) {
      onChange([...selected, id])
    }
    // Si ya hay 3 y quieren añadir otra: ignorar (botón disabled)
  }

  return (
    <div
      className="grid grid-cols-4 gap-2"
      role="group"
      aria-label="¿Cómo quieres sentirte hoy? Selecciona hasta 3."
    >
      {EMOTIONS.map(emotion => (
        <EmotionCard
          key={emotion.id}
          emotion={emotion}
          selected={selected.includes(emotion.id)}
          onToggle={toggle}
          disabled={selected.length >= MAX && !selected.includes(emotion.id)}
        />
      ))}
    </div>
  )
}
