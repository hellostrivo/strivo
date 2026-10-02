// src/components/shared/Confirmacion.jsx
// Un diálogo que pregunta antes de hacer algo que no tiene vuelta (DP-19.2).
//
// **Solo se confirma lo que destruye contenido** (RN-EST-07), y por eso esta
// pieza es mínima y casi no se usa: hoy, cerrar sesión, que quita del teléfono
// todo lo de la cuenta. SPEC_24 la reutilizará para borrar la cuenta. Salir de
// una pantalla nunca pasa por aquí (RN-EST-08).
//
// Lleva un título, un texto y **una o dos acciones**. Con una sola —"Quedarme"
// cuando todavía hay cosas sin subir— el diálogo explica por qué no se puede y
// no ofrece hacerlo igual: no hay un "cerrar de todos modos" que pierda lo
// escrito.
//
// Lo que hace de él un diálogo de verdad, y no un recuadro encima:
//
//   - `role="dialog"` y `aria-modal="true"`, con el título y el texto como su
//     nombre y su descripción;
//   - el foco entra al abrirse —a la acción que no destruye nada— y no sale con
//     el tabulador mientras está abierto;
//   - Escape es cancelar, igual que tocar la acción de cancelar;
//   - al cerrarse, el foco vuelve a quien lo abrió.
//
// **Sin animación**, así que `prefers-reduced-motion` se respeta sin hacer
// nada. Sin colores propios: pide superficies por su papel (RN-VIS-02) y el
// texto le llega entero por props (RN-TEC-05), porque `components/shared/` no
// conoce a nadie.

import { useEffect, useId, useRef } from 'react'
import Button from '@components/ui/Button'

const ENFOCABLES = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'

/**
 * @param {object} props
 * @param {boolean} props.abierta
 * @param {string} props.titulo
 * @param {string} props.texto
 * @param {{texto: string, onClick: () => void}} props.cancelar - siempre.
 * @param {?{texto: string, onClick: () => void}} [props.confirmar] - la
 *   acción que hace lo que se pregunta; sin ella, solo se puede cancelar.
 */
export default function Confirmacion({ abierta, titulo, texto, cancelar, confirmar = null }) {
  const id = useId()
  const caja = useRef(null)

  // Quien tenía el foco al abrirse: es a donde vuelve al cerrarse.
  useEffect(() => {
    if (!abierta) return undefined
    const anterior = document.activeElement
    // `Button` no reenvía referencias: se busca dentro de la caja.
    caja.current?.querySelector('[data-cancelar]')?.focus()
    return () => {
      if (anterior && typeof anterior.focus === 'function') anterior.focus()
    }
  }, [abierta])

  if (!abierta) return null

  const alTeclear = (evento) => {
    if (evento.key === 'Escape') {
      evento.preventDefault()
      cancelar.onClick()
      return
    }
    if (evento.key !== 'Tab') return
    const enfocables = [...(caja.current?.querySelectorAll(ENFOCABLES) ?? [])]
    if (enfocables.length === 0) return
    const primero = enfocables[0]
    const ultimo = enfocables[enfocables.length - 1]
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primero.focus()
    }
  }

  return (
    <div
      data-surface="light"
      className="fixed inset-0 z-50 flex items-center justify-center bg-espacio px-5 text-on-surface"
    >
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-texto`}
        onKeyDown={alTeclear}
        className="flex w-full max-w-sm flex-col gap-5 rounded-lg border border-on-surface bg-raised p-6"
      >
        <h2 id={`${id}-titulo`} className="font-display text-md text-on-surface">
          {titulo}
        </h2>
        <p id={`${id}-texto`} className="text-base text-on-surface-soft leading-relaxed">
          {texto}
        </p>
        <div className="flex flex-col gap-3">
          <Button
            data-cancelar
            type="button"
            variant="surface"
            fullWidth
            onClick={cancelar.onClick}
          >
            {cancelar.texto}
          </Button>
          {confirmar && (
            <Button type="button" variant="surface" fullWidth onClick={confirmar.onClick}>
              {confirmar.texto}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
