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

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import { clsx } from 'clsx'

// La caja y el texto van separados porque no siempre van juntos: el párrafo de
// una tarjeta (`CampoParrafo` con `desnudo`) pone el texto y deja que la
// tarjeta ponga la caja, para que el foco y el borde sean de la tarjeta entera.
const CAJA = [
  'w-full bg-strivo-campo border border-on-surface rounded-md',
  'px-4 py-3',
  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
]

const TEXTO = ['text-on-surface placeholder:text-on-surface-faint', 'text-base']

const BASE = [...CAJA, ...TEXTO]

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

/**
 * Área de escritura que crece con lo escrito y **nunca se desplaza por dentro**
 * (12 sep 2026). Es el campo de las respuestas que pueden ser un párrafo —la
 * gratitud de la mañana, el reconocimiento de la noche—: abre con `filas`
 * líneas —una, por defecto: sitio para empezar, no para rellenar— y a partir
 * de ahí mide lo que hay y se estira, línea a línea, solo cuando lo escrito lo
 * pide. Lo que se desplaza es la pantalla, así que una respuesta de varios
 * párrafos se lee entera antes de continuar.
 *
 * Se mide con `scrollHeight`, que es lo único que sabe cuántas líneas ocupa un
 * texto ya envuelto: contar saltos de línea, como hace `CampoTexto`, no ve las
 * que envuelve el ancho. `overflow-hidden` no esconde nada —la altura es
 * siempre la del contenido—: quita la barra de desplazamiento que el navegador
 * pintaría un instante entre la tecla y la medida.
 *
 * `desnudo` lo deja sin caja, para meterlo en una tarjeta que ya la tiene.
 */
export const CampoParrafo = forwardRef(function CampoParrafo(
  { filas = 1, value, desnudo = false, className, ...props },
  ref,
) {
  const nodo = useRef(null)

  const asignar = (elemento) => {
    nodo.current = elemento
    if (typeof ref === 'function') ref(elemento)
    else if (ref) ref.current = elemento
  }

  const medir = () => {
    const elemento = nodo.current
    if (!elemento) return
    elemento.style.height = 'auto'
    elemento.style.height = `${elemento.scrollHeight}px`
  }

  // Antes de pintar, para que no se vea el campo en su altura vieja un
  // fotograma; y otra vez cuando cambia el ancho, porque cambia cómo envuelve.
  useLayoutEffect(medir, [value])
  useEffect(() => {
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  return (
    <textarea
      ref={asignar}
      rows={filas}
      value={value}
      className={clsx(
        desnudo ? [TEXTO, 'w-full bg-transparent focus-visible:outline-none'] : BASE,
        'resize-none leading-relaxed overflow-hidden',
        className,
      )}
      {...props}
    />
  )
})
