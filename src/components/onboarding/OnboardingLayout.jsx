// src/components/onboarding/OnboardingLayout.jsx
// Estructura común de las pantallas de onboarding (P1, P2, P3…)
// - Cabecera con "Atrás" y progreso en puntos
// - Contenido centrado, ancho máximo cómodo, escalable a 200%
// - Pie fijo con las acciones (siempre alcanzable con el pulgar)

import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import Button from '@components/ui/Button'

export default function OnboardingLayout({
  step,             // 1-indexado
  totalSteps,
  onBack,           // undefined en el primer paso
  background,       // string CSS opcional (degradado de P1)
  children,
  footer,
}) {
  return (
    <div
      className="min-h-screen flex flex-col bg-paper text-ink font-sans"
      style={background ? { background } : undefined}
    >
      <header className="pt-safe px-6 flex items-center gap-4">
        {onBack ? (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-4">
            {copy.onboarding.nav.back}
          </Button>
        ) : (
          <span className="min-h-touch" aria-hidden="true" />
        )}

        {/* Progreso: decorativo. El anuncio para lector de pantalla va abajo. */}
        <div className="flex-1 flex items-center justify-end gap-1.5" aria-hidden="true">
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
      </header>

      <p className="sr-only" aria-live="polite">
        {interpolate(copy.onboarding.nav.progressTemplate, { n: step, total: totalSteps })}
      </p>

      <main className="flex-1 w-full max-w-md mx-auto px-6 pt-10 pb-8 flex flex-col animate-fade-up">
        {children}
      </main>

      <footer className="w-full max-w-md mx-auto px-6 pb-safe flex flex-col gap-2">
        {footer}
      </footer>
    </div>
  )
}
