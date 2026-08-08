// src/components/onboarding/SeleccionHabitos.jsx
// Cuerpo compartido de P7 (ritual de mañana) y P8 (ritual de noche).
//
// Las dos pantallas hacen lo mismo con distinto momento, así que comparten
// componente y se diferencian solo en el copy y en las sugerencias.
//
// Nada aquí es obligatorio: seguir con el ritual vacío es una respuesta entera
// (RN-03, y copy.habits.empty lo dice sin reproche cuando se llega a la app).
// Cada hábito nace con su area heredada de la sugerencia; los propios viven en
// "General" (areaId = null) heredando la identidad central (§5.1.1).

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import { newId } from '@lib/user'
import { EMOJI_POR_DEFECTO } from '@lib/emojis'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import CloseIcon from '@components/ui/CloseIcon'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'
import SelectorEmoji, { BotonEmoji } from '@components/habitos/SelectorEmoji'

const MAX_LENGTH = 60

export default function SeleccionHabitos({
  step,
  totalSteps,
  momento,           // 'manana' | 'noche' — se guarda en cada hábito
  question,
  hint,
  otherPlaceholder,
  suggestions,       // [{ texto, emoji, areaId, color }]
  habitos,           // [{ id, texto, emoji, areaId, momento }]
  onChange,
  onBack,
  onNext,
}) {
  const headingRef = useRef(null)
  const otherRef   = useRef(null)
  const [adding, setAdding] = useState(false)
  const [texto, setTexto]   = useState('')
  // El símbolo del hábito propio que se está escribiendo. Empieza con uno
  // neutro: un hueco vacío se leería como un campo obligatorio pendiente.
  const [emoji, setEmoji]   = useState(EMOJI_POR_DEFECTO)
  const [eligiendoEmoji, setEligiendoEmoji] = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])
  useEffect(() => { if (adding) otherRef.current?.focus() }, [adding])

  // Se compara sin distinguir mayúsculas: "beber agua" escrito a mano y la
  // sugerencia "Beber agua" son el mismo hábito, no dos.
  const buscar = t => habitos.find(h => h.texto.toLowerCase() === t.toLowerCase())
  const yaEstá = t => !!buscar(t)

  const toggleSugerencia = sugerencia => {
    const elegido = buscar(sugerencia.texto)
    onChange(
      elegido
        ? habitos.filter(h => h.id !== elegido.id)
        : [...habitos, {
            id:     newId(),
            texto:  sugerencia.texto,
            emoji:  sugerencia.emoji,
            areaId: sugerencia.areaId,
            momento,
          }]
    )
  }

  // Se añade y el campo queda listo para el siguiente, sin cerrarse
  const addPropio = () => {
    const limpio = texto.trim()
    if (!limpio) return
    if (!yaEstá(limpio)) {
      onChange([...habitos, { id: newId(), texto: limpio, emoji, areaId: null, momento }])
    }
    setTexto('')
    setEmoji(EMOJI_POR_DEFECTO)
    otherRef.current?.focus()
  }

  // Lo que no está entre las sugerencias visibles se muestra como chip propio,
  // con su aspa. Incluye lo escrito a mano y lo elegido para un área que
  // después se quitó en P4B: el hábito no desaparece a espaldas de nadie (RN-04).
  const propios = habitos.filter(
    h => !suggestions.some(s => s.texto.toLowerCase() === h.texto.toLowerCase())
  )

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          {copy.onboarding.nav.continue}
        </Button>
      }
    >
      <h1
        ref={headingRef}
        tabIndex={-1}
        id="habitos-heading"
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {question}
      </h1>

      <p id="habitos-hint" className="mt-3 text-base text-ink/80">
        {hint}
      </p>

      <div
        role="group"
        aria-labelledby="habitos-heading"
        aria-describedby="habitos-hint"
        className="mt-10 flex flex-wrap gap-3"
      >
        {suggestions.map(sugerencia => (
          <Chip
            key={`${sugerencia.areaId ?? 'general'}-${sugerencia.texto}`}
            color={sugerencia.color}
            selected={yaEstá(sugerencia.texto)}
            onClick={() => toggleSugerencia(sugerencia)}
          >
            {/* Decorativo: quien usa lector de pantalla oye el nombre, que es
                el identificador real del hábito (§16.6). */}
            <span className="text-md leading-none" aria-hidden="true">{sugerencia.emoji}</span>
            {sugerencia.texto}
          </Chip>
        ))}

        {propios.map(habito => (
          <Chip
            key={habito.id}
            selected
            onClick={() => onChange(habitos.filter(h => h.id !== habito.id))}
            aria-label={interpolate(copy.onboarding.habitos.otherRemoveTemplate, {
              habito: habito.texto,
            })}
          >
            <span className="text-md leading-none" aria-hidden="true">
              {habito.emoji ?? EMOJI_POR_DEFECTO}
            </span>
            {habito.texto}
            <CloseIcon />
          </Chip>
        ))}

        <Chip
          selected={adding}
          onClick={() => setAdding(a => !a)}
          aria-expanded={adding}
          aria-controls="habitos-otro"
        >
          {copy.onboarding.habitos.other}
        </Chip>
      </div>

      {adding && (
        <div id="habitos-otro" className="mt-6 animate-fade-up">
          <label htmlFor="habitos-otro-campo" className="block text-base text-ink/80">
            {copy.onboarding.habitos.otherLabel}
          </label>

          <div className="mt-3 flex items-start gap-3">
            <BotonEmoji emoji={emoji} onClick={() => setEligiendoEmoji(true)} />

            <input
              id="habitos-otro-campo"
              ref={otherRef}
              type="text"
              value={texto}
              maxLength={MAX_LENGTH}
              autoComplete="off"
              enterKeyHint="done"
              placeholder={otherPlaceholder}
              onChange={event => setTexto(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addPropio()
                }
              }}
              className={[
                'flex-1 min-w-0 min-h-touch',
                'rounded-md bg-surface border border-border',
                'px-4 py-4 text-base text-ink',
                'placeholder:text-ink/70',
                'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
              ].join(' ')}
            />

            <Button
              variant="secondary"
              size="sm"
              disabled={!texto.trim()}
              onClick={addPropio}
              className="flex-shrink-0"
            >
              {copy.onboarding.habitos.otherAdd}
            </Button>
          </div>
        </div>
      )}

      <SelectorEmoji
        abierto={eligiendoEmoji}
        onElegir={elegido => {
          setEmoji(elegido)
          setEligiendoEmoji(false)
          otherRef.current?.focus()
        }}
        onCerrar={() => setEligiendoEmoji(false)}
      />
    </OnboardingLayout>
  )
}
