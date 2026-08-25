// src/components/diario/Campo.jsx
// Los dos campos de escritura de Lumia: una línea y área amplia.
//
// Ninguno fija color de texto: heredan de `data-surface` (RN-SURF-01). Es lo
// que hace que el mismo campo sea legible en la mañana clara y en la noche
// oscura sin que el componente sepa dónde está.
//
// Ninguno es obligatorio, ninguno valida y ninguno marca nada en rojo.

import { clsx } from 'clsx'

const BASE = [
  'w-full bg-strivo-campo border border-on-surface rounded-md',
  'text-on-surface placeholder:text-on-surface-faint',
  'px-4 py-3 text-base',
  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
]

export function CampoLinea({ className, ...props }) {
  return <input type="text" className={clsx(BASE, 'min-h-touch-sm', className)} {...props} />
}

/**
 * Área de escritura que crece con el texto, de `filas` a `filasMax` líneas
 * visibles, y después se desplaza por dentro (§5.3, Bloque 4).
 */
export function CampoTexto({ filas = 4, filasMax = 12, value, className, ...props }) {
  const lineas = String(value ?? '').split('\n').length
  const alto = Math.min(Math.max(filas, lineas), filasMax)

  return (
    <textarea
      rows={alto}
      value={value}
      className={clsx(BASE, 'resize-none leading-relaxed', className)}
      {...props}
    />
  )
}
