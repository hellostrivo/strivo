// src/components/ui/Card.jsx
// Contenedor de contenido principal de Strivo
// Elevación por sombra suave (no drop-shadow pesado)

import { clsx } from 'clsx'

export default function Card({ children, className, elevated = false, onClick, ...props }) {
  const isClickable = !!onClick
  return (
    <div
      // Trae su propio papel, así que dentro se escribe en tinta oscura aunque
      // la pantalla que la contiene esté en tema de noche (§6.5).
      data-surface="light"
      className={clsx(
        'rounded-md bg-paper',
        elevated ? 'shadow-elev-2' : 'shadow-elev-1',
        'p-4',
        isClickable && [
          'cursor-pointer',
          'transition-shadow duration-260 ease-smooth',
          'hover:shadow-elev-4',
          'active:shadow-elev-1 active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
        ],
        'motion-reduce:transition-none',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
