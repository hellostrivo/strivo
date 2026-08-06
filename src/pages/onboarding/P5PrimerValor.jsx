// src/pages/onboarding/P5PrimerValor.jsx
// P5 — Primer momento de valor
// Copy: docs/copy-library.md §1 → copy.onboarding.p5
//
// Aquí la app deja de prometer y demuestra: la persona escribe una cosa buena
// de hoy y la ve guardada, antes de que exista cuenta, correo o contraseña.
// Guardar no pide nada a cambio (§8.12 — el registro llega después, en P6+).
//
// La confirmación devuelve el texto tal como se escribió y lo une a la identidad
// de P3: la evidencia es suya, la app solo se la enseña (§5.1.1, RN-ID-05).
//
// "Ahora no" es una salida entera, no un descarte: se pasa adelante sin aviso,
// sin insistir y sin dejar la pantalla marcada como pendiente (RN-03).

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

const MAX_LENGTH = 140

export default function P5PrimerValor({
  step,
  totalSteps,
  identidad,        // identidad central de P3, sin prefijo
  victoria,         // { texto, fecha } si ya se guardó; null si no
  onSave,
  onBack,
  onNext,
}) {
  const headingRef = useRef(null)
  const fieldRef   = useRef(null)

  const [editing, setEditing] = useState(!victoria)
  const [texto, setTexto]     = useState(victoria?.texto ?? '')

  const limpio = texto.trim()

  // Al cambiar de estado el título es otro: el foco lo sigue para que el
  // lector de pantalla anuncie el guardado sin necesitar una región aparte.
  useEffect(() => { headingRef.current?.focus() }, [editing])

  const guardar = () => {
    if (!limpio) return
    onSave(limpio)
    setEditing(false)
  }

  const volverAEditar = () => {
    setEditing(true)
    // El campo ya trae el texto: se retoma, no se vuelve a empezar
    requestAnimationFrame(() => fieldRef.current?.focus())
  }

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={editing ? (
        <>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!limpio}
            onClick={guardar}
          >
            {copy.onboarding.p5.save}
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onNext}>
            {copy.onboarding.p5.skip}
          </Button>
        </>
      ) : (
        <>
          <Button variant="primary" size="lg" fullWidth onClick={onNext}>
            {copy.onboarding.nav.continue}
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={volverAEditar}>
            {copy.onboarding.p5.saved.edit}
          </Button>
        </>
      )}
    >
      {editing ? (
        <>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-xl leading-tight text-ink focus:outline-none"
          >
            {copy.onboarding.p5.headline}
          </h1>

          <div className="mt-12">
            <label
              htmlFor="primera-cosa-buena"
              className="block font-display text-md text-ink"
            >
              {copy.onboarding.p5.question}
            </label>

            <p id="p5-hint" className="mt-2 text-base text-ink/80">
              {copy.onboarding.p5.hint}
            </p>

            <textarea
              id="primera-cosa-buena"
              ref={fieldRef}
              rows={3}
              value={texto}
              maxLength={MAX_LENGTH}
              aria-describedby="p5-hint"
              enterKeyHint="done"
              placeholder={copy.onboarding.p5.placeholder}
              onChange={event => setTexto(event.target.value)}
              onKeyDown={event => {
                // Enter guarda; el texto es de una línea o dos, no un ensayo
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  guardar()
                }
              }}
              className={[
                'mt-4 w-full resize-none',
                'rounded-md bg-surface border border-border',
                'px-4 py-4 text-md text-ink leading-relaxed',
                'placeholder:text-ink/70',
                'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
              ].join(' ')}
            />
          </div>
        </>
      ) : (
        <>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-xl leading-tight text-ink focus:outline-none"
          >
            {copy.onboarding.p5.saved.title}
          </h1>

          <div className="mt-10 animate-fade-up">
            <Card>
              <p className="font-display text-md leading-relaxed text-ink">
                {victoria?.texto ?? limpio}
              </p>
            </Card>

            <p className="mt-6 text-base leading-relaxed text-ink/80">
              {identidad
                ? interpolate(copy.onboarding.p5.saved.evidenceTemplate, { identidad })
                : copy.onboarding.p5.saved.evidencePlain}
            </p>
          </div>
        </>
      )}
    </OnboardingLayout>
  )
}
