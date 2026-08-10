// src/components/ui/Chip.jsx
// Etiqueta seleccionable de Strivo
// Usada para: áreas de identidad, emociones del día, días de la semana
// Motion: 180ms chip-press al tocar

import { clsx } from 'clsx'

/**
 * Chip — etiqueta tocable
 *
 * @param {boolean} selected - estado seleccionado
 * @param {string} color - color hex del acento (para áreas de identidad)
 * @param {'sm'|'md'} size
 */
export default function Chip({
  children,
  selected = false,
  color,           // hex, p.ej. '#7E9E86' para área Salud
  size = 'md',
  onClick,
  className,
  ...props
}) {
  const selectedStyle = color
    ? { backgroundColor: color + '22', borderColor: color, color }   // área con color propio
    : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        'inline-flex items-center gap-1.5',
        'rounded-full border font-sans font-medium',
        'transition-all duration-260 ease-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
        'active:animate-chip-press',
        'motion-reduce:transition-none',
        'min-h-touch-sm', // 48px
        // Tamaños
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base',
        // Estado base (sin color de área)
        !color && !selected && 'bg-surface border-border text-ink hover:bg-surface/80',
        !color && selected  && 'bg-ink border-ink text-paper',
        // Estado con color de área → se aplica via style
        color && !selected && 'bg-surface border-border text-ink hover:bg-surface/80',
        className
      )}
      style={selected && color ? selectedStyle : undefined}
      {...props}
    >
      {/* Punto de color para áreas */}
      {color && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
