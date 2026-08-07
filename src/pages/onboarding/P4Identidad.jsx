// src/pages/onboarding/P4Identidad.jsx
// P4 — Identidad central
// Copy: docs/copy-library.md §1 → copy.onboarding.p4
// Modelo: §5.1.1 (amplia, estable, emocional; no es un objetivo) · pantalla: §7
//
// La frase se guarda SIN el prefijo ("crece cada día", no "soy alguien que
// crece"), porque el resto de la app la interpola después de "alguien que".
//
// Los chips sustituyen a los ejemplos rotatorios: son un punto de partida, no
// una elección cerrada. Lo que se toca entra al campo y ahí se puede cambiar,
// borrar o ampliar. La regla que manda sobre todas las demás: nunca se destruye
// texto escrito por la persona sin que ella lo borre (§7.6).
//
// El campo puede quedarse vacío. Se guarda null y se completa otro día, sin
// ninguna advertencia: pedir una frase perfecta era justo el problema.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { IDENTITY_CHIP_IDS, fuenteDeChip, FUENTE_LIBRE } from '@lib/identidad'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'
import useCopy from '@hooks/useCopy'
import useReducedMotion from '@hooks/useReducedMotion'

const LINEAS_MAXIMAS = 3
const INERTE_MS      = 420

export default function P4Identidad({
  step,
  totalSteps,
  identidad,
  fuente,           // 'chip:<id>' | 'libre' | null
  onChange,         // (texto, fuente)
  onBack,
  onNext,
}) {
  const t             = useCopy()
  const reducedMotion = useReducedMotion()
  const headingRef    = useRef(null)
  const campoRef      = useRef(null)

  // Un chip queda "inerte" un instante cuando se toca sobre texto propio: se
  // acusa el toque sin pisar lo escrito.
  const [inerte, setInerte] = useState(null)

  useEffect(() => { headingRef.current?.focus() }, [])

  // Las sugerencias se leen ya en el género contestado en P2A
  const sugerencias = IDENTITY_CHIP_IDS.map(id => ({
    id,
    texto: t(`onboarding.p4.chips.${id}`),
  }))

  // El campo crece hasta tres líneas y a partir de ahí se desplaza por dentro:
  // nada se trunca ni deja de aceptarse (§7.7).
  const ajustarAlto = () => {
    const campo = campoRef.current
    if (!campo) return
    const linea = parseFloat(getComputedStyle(campo).lineHeight) || 28
    const alto  = linea * LINEAS_MAXIMAS +
      parseFloat(getComputedStyle(campo).paddingTop) +
      parseFloat(getComputedStyle(campo).paddingBottom)
    campo.style.height = 'auto'
    campo.style.height = `${Math.min(campo.scrollHeight, alto)}px`
  }

  useEffect(ajustarAlto, [identidad])

  const escribir = valor => {
    // Al escribir a mano se quita la marca de todos los chips: la frase ya es suya
    onChange(valor, valor.trim() ? FUENTE_LIBRE : null)
  }

  const tocarChip = ({ id, texto }) => {
    const actual  = identidad.trim()
    const deChip  = sugerencias.some(s => s.texto === actual)

    // Campo vacío o con el texto de otra sugerencia: se reemplaza sin más.
    // Con texto propio no se pisa nada; el chip solo acusa el toque.
    if (actual && !deChip) {
      setInerte(id)
      setTimeout(() => setInerte(null), INERTE_MS)
      return
    }

    onChange(texto, fuenteDeChip(id))
    campoRef.current?.focus()
  }

  // "Otro": ninguna de estas, quiero escribir la mía
  const empezarDeCero = () => {
    onChange('', null)
    campoRef.current?.focus()
  }

  // Al abrirse el teclado, dejar a la vista el campo y al menos una fila de
  // chips. Centrarlo es lo que más se acerca en pantallas pequeñas.
  const alEnfocar = () => {
    campoRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={
        <>
          <Button variant="primary" size="lg" fullWidth onClick={onNext}>
            {copy.onboarding.nav.continue}
          </Button>

          {/* Epílogo, no instrucción: por eso va debajo del botón y con la
              jerarquía más baja de la pantalla. */}
          <p className="mt-2 px-2 text-center text-xs leading-relaxed text-ink/50">
            {copy.onboarding.p4.closing}
          </p>
        </>
      }
    >
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p4.headline}
      </h1>

      <p className="mt-3 text-base italic leading-relaxed text-ink/65">
        {copy.onboarding.p4.subhead}
      </p>

      <div className="mt-10">
        <label
          htmlFor="identidad-central"
          className="block font-sans font-medium text-md text-ink"
        >
          {copy.onboarding.p4.prefix}
        </label>

        {/* Sin caja cerrada: una línea inferior, para que se lea como la
            continuación de la frase y no como un formulario. */}
        <textarea
          id="identidad-central"
          ref={campoRef}
          rows={2}
          value={identidad}
          autoComplete="off"
          enterKeyHint="done"
          onChange={evento => escribir(evento.target.value)}
          onFocus={alEnfocar}
          onKeyDown={evento => {
            if (evento.key === 'Enter') evento.preventDefault()
          }}
          className={[
            'mt-3 w-full resize-none overflow-y-auto',
            'bg-transparent border-0 border-b border-border rounded-none',
            'px-0 py-2 text-md text-ink leading-relaxed',
            'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
            'focus:outline-none focus:border-ink',
          ].join(' ')}
        />
      </div>

      <p id="p4-sugerencias" className="mt-8 text-xs text-ink/55">
        {copy.onboarding.p4.suggestionsLabel}
      </p>

      {/* Fluyen en filas: las frases tienen longitudes muy distintas y una
          rejilla dejaría cajas con aire muerto o texto partido. */}
      <div
        role="group"
        aria-labelledby="p4-sugerencias"
        className="mt-3 flex flex-wrap gap-2"
      >
        {sugerencias.map(sugerencia => {
          // "Usado", no "elegido": el chip dice de dónde vino el texto que hay
          // en el campo, sin dar a entender que la respuesta quedó cerrada. Por
          // eso se marca con el borde y no con el relleno del estado elegido.
          const usado = fuente === fuenteDeChip(sugerencia.id)
          return (
            <Chip
              key={sugerencia.id}
              size="sm"
              onClick={() => tocarChip(sugerencia)}
              aria-pressed={undefined}
              className={clsx(
                usado && 'border-ink text-ink',
                inerte === sugerencia.id && 'opacity-50 motion-safe:animate-chip-press'
              )}
            >
              {sugerencia.texto}
            </Chip>
          )
        })}

        <Chip size="sm" onClick={empezarDeCero}>
          {copy.onboarding.p4.chipOther}
        </Chip>
      </div>
    </OnboardingLayout>
  )
}
