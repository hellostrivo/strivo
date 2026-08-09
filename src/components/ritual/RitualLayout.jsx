// src/components/ritual/RitualLayout.jsx
// Estructura común de las pantallas de un ritual.
//
// El ritual es un overlay modal sobre Hoy (§4.3.1), no una pestaña: ocupa toda
// la pantalla, se lleva el foco y devuelve a Hoy al cerrarse. La barra de
// pestañas se oculta mientras está abierto (lo hace quien lo monta).
//
// Salir siempre está a un toque: la X del encabezado y la tecla Escape. Un
// ritual nunca retiene a nadie.
//
// Comparte lenguaje visual con OnboardingLayout (mismos puntos de progreso,
// mismo pie), pero no su chrome: aquí hay cierre y no hay barra de progreso de
// alta, así que son dos componentes y no uno con condicionales.

import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import Button from '@components/ui/Button'

const FOCUSABLES = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function RitualLayout({
  step,             // 1-indexado
  totalSteps,
  title,            // nombre accesible del diálogo
  background,
  onClose,
  onBack,           // undefined en el primer paso
  children,
  footer,
}) {
  const contenedor = useRef(null)

  // El teclado se queda dentro del diálogo mientras está abierto, y Escape sale.
  useEffect(() => {
    const nodo = contenedor.current
    if (!nodo) return

    const alPulsar = evento => {
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        onClose()
        return
      }
      if (evento.key !== 'Tab') return

      const focusables = nodo.querySelectorAll(FOCUSABLES)
      if (!focusables.length) return

      const primero = focusables[0]
      const ultimo  = focusables[focusables.length - 1]

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    nodo.addEventListener('keydown', alPulsar)
    return () => nodo.removeEventListener('keydown', alPulsar)
  }, [onClose])

  // Lo de debajo no se desplaza mientras el ritual está abierto
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [])

  return (
    <div
      ref={contenedor}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper text-ink font-sans"
      style={background ? { background } : undefined}
    >
      <div className="min-h-full flex flex-col">
        <header className="pt-safe px-6 flex items-center gap-4">
          {onBack ? (
            <Button variant="ghost" size="sm" onClick={onBack} className="-ml-4">
              {copy.ritual.nav.back}
            </Button>
          ) : (
            <span className="min-h-touch" aria-hidden="true" />
          )}

          {/* Progreso: decorativo. El anuncio para lector de pantalla va abajo. */}
          <div className="flex-1 flex items-center justify-center gap-1.5" aria-hidden="true">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span
                key={i}
                className={clsx(
                  'h-1.5 rounded-full',
                  'transition-all duration-420 ease-smooth motion-reduce:transition-none',
                  i + 1 === step ? 'w-6 bg-ink' : 'w-1.5 bg-ink/20'
                )}
              />
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="-mr-4">
            {copy.ritual.nav.close}
          </Button>
        </header>

        <p className="sr-only" aria-live="polite">
          {interpolate(copy.ritual.nav.progressTemplate, { n: step, total: totalSteps })}
        </p>

        <main className="flex-1 w-full max-w-md mx-auto px-6 pt-10 pb-8 flex flex-col animate-fade-up">
          {children}
        </main>

        <footer className="w-full max-w-md mx-auto px-6 pb-safe flex flex-col gap-2">
          {footer}
        </footer>
      </div>
    </div>
  )
}
