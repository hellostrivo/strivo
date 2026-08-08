// src/components/ui/Chip.jsx
// Etiqueta seleccionable de Strivo
// Usada para: áreas de identidad, emociones del día, días de la semana
// Motion: 180ms chip-press al tocar

import { forwardRef } from 'react'
import { clsx } from 'clsx'

/**
 * Chip — etiqueta tocable
 *
 * @param {boolean} selected - estado seleccionado
 * @param {string} color - color hex del acento (para áreas de identidad)
 * @param {'sm'|'md'} size
 * @param {'radio'} [role] - para grupos de una sola respuesta (P2A): cambia
 *   aria-pressed por aria-checked y añade una marca, para que el estado no
 *   dependa solo del color
 * @param {boolean} [fullWidth] - fila a ancho completo en vez de etiqueta que fluye
 * @param {boolean} [atenuado] - fuera de alcance por un límite ya alcanzado
 *   (máximo de emociones, de áreas, de estados de cierre). Se apaga y deja de
 *   responder, sin mensaje ni aviso: el límite se comunica atenuando, no
 *   regañando. Por defecto false, así que ninguna pantalla existente cambia.
 */
const Chip = forwardRef(function Chip({
  children,
  selected = false,
  color,           // hex, p.ej. '#7E9E86' para área Salud
  size = 'md',
  role,
  fullWidth = false,
  atenuado = false,
  onClick,
  className,
  ...props
}, ref) {
  const esRadio = role === 'radio'
  // Área seleccionada: tinte + borde del color propio, pero el texto se queda en
  // ink. Pintar la etiqueta con el color del área daba ~2.5:1 sobre el tinte
  // claro y no pasaba contraste; el color ya lo comunica el punto y el borde.
  // El inset extra engrosa el borde sin mover el layout: el estado seleccionado
  // no depende solo del color.
  const selectedStyle = color
    ? {
        backgroundColor: color + '22',
        borderColor:     color,
        boxShadow:       `inset 0 0 0 1px ${color}`,
      }
    : undefined

  const defaultSelected = !color && selected

  return (
    <button
      ref={ref}
      type="button"
      // Atenuado sigue siendo enfocable y sigue anunciando su estado: se sale de
      // la lista de tabulación solo lo que ya no existe, y esta opción existe,
      // simplemente no cabe ahora mismo.
      onClick={atenuado ? undefined : onClick}
      role={role}
      aria-pressed={esRadio ? undefined : selected}
      aria-checked={esRadio ? selected : undefined}
      aria-disabled={atenuado || undefined}
      className={clsx(
        esRadio ? 'inline-flex items-center gap-3' : 'inline-flex items-center gap-1.5',
        fullWidth && 'w-full justify-start text-left',
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
        // Estado con color de área → el tinte y el borde se aplican via style
        color && !selected && 'bg-surface border-border text-ink hover:bg-surface/80',
        color && selected  && 'text-ink',
        // El límite se ve, no se explica
        atenuado && 'opacity-40 hover:bg-surface',
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

      {/* Una sola respuesta: la marca cambia de forma, no solo de color, para
          que la elegida se distinga también en escala de grises. */}
      {esRadio && (
        <span
          className={clsx(
            'flex items-center justify-center flex-shrink-0',
            'w-5 h-5 rounded-full border',
            selected ? 'border-paper' : 'border-border'
          )}
          aria-hidden="true"
        >
          {selected && (
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}

      {children}
    </button>
  )
})

export default Chip
