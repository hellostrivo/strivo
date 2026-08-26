// src/components/shared/Campo.jsx
// Los dos campos de escritura de Strivo: una línea y área amplia.
//
// **Vive en `shared/` desde F-1B**, cuando el onboarding pasó a ser su segundo
// consumidor. No cambió nada del componente al mudarse, y ese es justo el
// motivo por el que podía mudarse: no importa nada, no nombra ninguna sección y
// no conoce ni un catálogo (RN-TEC-05). Estaba en `diario/` porque hasta
// entonces solo el diario escribía.
//
// Ninguno fija color de texto: heredan de `data-surface` (RN-SURF-01). Es lo
// que hace que el mismo campo sea legible en la mañana clara y en la noche
// oscura sin que el componente sepa dónde está.
//
// Ninguno es obligatorio, ninguno valida y ninguno marca nada en rojo.

import { forwardRef } from 'react'
import { clsx } from 'clsx'

const BASE = [
  'w-full bg-strivo-campo border border-on-surface rounded-md',
  'text-on-surface placeholder:text-on-surface-faint',
  'px-4 py-3 text-base',
  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
]

// Los dos reenvían la referencia porque alguna pantalla necesita llevar el
// foco al campo sin que el campo sepa por qué: la sugerencia de identidad del
// onboarding lo hace al tocar "Otro". `type` va antes del resto de props a
// propósito — así una pantalla puede pedir una hora o un correo sin que este
// archivo tenga que enumerar los tipos que existen.
export const CampoLinea = forwardRef(function CampoLinea({ className, ...props }, ref) {
  return (
    <input ref={ref} type="text" className={clsx(BASE, 'min-h-touch-sm', className)} {...props} />
  )
})

/**
 * Área de escritura que crece con el texto, de `filas` a `filasMax` líneas
 * visibles, y después se desplaza por dentro (§5.3, Bloque 4).
 */
export const CampoTexto = forwardRef(function CampoTexto(
  { filas = 4, filasMax = 12, value, className, ...props },
  ref,
) {
  const lineas = String(value ?? '').split('\n').length
  const alto = Math.min(Math.max(filas, lineas), filasMax)

  return (
    <textarea
      ref={ref}
      rows={alto}
      value={value}
      className={clsx(BASE, 'resize-none leading-relaxed', className)}
      {...props}
    />
  )
})
