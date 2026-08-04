// src/components/ui/Button.jsx
// Componente base de botón de Strivo
// Design tokens: §6.3, Blueprint v3
// Mínimo de toque: 56px (WCAG 2.2)
// Motion: 260ms smooth

import { clsx } from 'clsx'

/**
 * Button — botón principal de Strivo
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} fullWidth
 * @param {boolean} loading
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}) {
  const base = [
    // Base: siempre
    'inline-flex items-center justify-center',
    'rounded-md font-sans font-medium',
    'transition-all duration-260 ease-smooth',
    'select-none cursor-pointer',
    'min-h-touch',  // 56px mínimo (WCAG 2.2)
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
    'disabled:opacity-40 disabled:pointer-events-none',
    // Respeta prefers-reduced-motion
    'motion-reduce:transition-none',
  ]

  const variants = {
    primary:   'bg-ink text-paper hover:bg-ink/90 active:scale-[0.98]',
    secondary: 'bg-paper border border-border text-ink hover:bg-surface active:scale-[0.98]',
    ghost:     'bg-transparent text-ink hover:bg-surface active:scale-[0.98]',
    danger:    'bg-clay/10 text-clay border border-clay/30 hover:bg-clay/20 active:scale-[0.98]',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-4 text-base gap-2',
    lg: 'px-8 py-5 text-md gap-2',
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          <span className="opacity-60">{children}</span>
        </>
      ) : children}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
