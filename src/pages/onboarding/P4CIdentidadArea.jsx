// src/pages/onboarding/P4CIdentidadArea.jsx
// P4C — Identidad por área
// Copy: docs/copy-library.md §1 → copy.onboarding.p4c
// Modelo: §5.1.1 — `identidadArea` es opcional y nunca contradice la central.
// Pantalla: §10 (rediseño de raíz)
//
// Una área por pantalla. Verlas todas a la vez convertía esto en un formulario,
// y un formulario invita a completarlo rápido, no a pensar (§10.1).
//
// "Quiero ser alguien que…", nunca "soy alguien que…": afirmar en presente algo
// que todavía no se cumple genera disonancia y culpa. Lo que se escribe aquí es
// una dirección, no una promesa que haya que cumplir.
//
// Todo el paso es opcional: el botón primario nunca se inhabilita, no hay
// validación, y "Omitir por ahora" es una decisión entera —no un descarte— que
// salta solo el área que se está viendo.
//
// Lo que se escribe se guarda sin el prefijo, como la identidad central de P4,
// porque el resto de la app lo interpola después de "alguien que"
// (habits.detail.identityTemplate · profile.identity.areaPrefix).

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { AREAS } from '@lib/areas'
import { durations } from '@tokens'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'
import useReducedMotion from '@hooks/useReducedMotion'

const LINEAS_MAXIMAS = 3
const CAMBIO_MS      = durations.areaSwap
const INERTE_MS      = durations.slow

export default function P4CIdentidadArea({
  step,
  totalSteps,
  areas,             // tipos elegidos en P4B, en orden de selección
  identidades,       // { [tipo]: texto | null }
  indice,            // qué área se está viendo; la guarda el flujo (§14.3)
  onIndice,
  onChange,
  onBack,            // vuelve a P4B (el flujo se salta T-4B hacia atrás)
  onNext,
}) {
  const reducedMotion = useReducedMotion()
  const tituloRef = useRef(null)
  const campoRef  = useRef(null)

  const [cambiando, setCambiando] = useState(false)
  const [inerte, setInerte]       = useState(null)

  // Se recorren en el orden en que se eligieron, no en el del catálogo: es el
  // orden en el que la persona pensó en ellas.
  const seleccionadas = areas
    .map(tipo => AREAS.find(area => area.tipo === tipo))
    .filter(Boolean)

  const total    = seleccionadas.length
  const posicion = Math.min(indice, Math.max(0, total - 1))
  const area     = seleccionadas[posicion] ?? null
  const esUltima = posicion >= total - 1

  // Las ideas se resuelven por el `id` interno del área. Si un área no tuviera
  // las suyas, el bloque entero desaparece: ni vacío, ni prestadas de otra.
  const ideas = (area && copy.onboarding.p4c.ideas[area.tipo]) ?? []
  const texto = (area && identidades[area.tipo]) ?? ''

  // Al entrar en cada área el foco va al título, nunca al campo: abrir el
  // teclado solo taparía las sugerencias antes de haberlas leído (§10.13).
  useEffect(() => { tituloRef.current?.focus() }, [posicion])

  // El campo crece hasta tres líneas y a partir de ahí se desplaza por dentro.
  // Debe sentirse como una reflexión breve, no como un ensayo.
  useEffect(() => {
    const campo = campoRef.current
    if (!campo) return
    const estilo = getComputedStyle(campo)
    const linea  = parseFloat(estilo.lineHeight) || 28
    const maximo = linea * LINEAS_MAXIMAS +
      parseFloat(estilo.paddingTop) + parseFloat(estilo.paddingBottom)
    campo.style.height = 'auto'
    campo.style.height = `${Math.min(campo.scrollHeight, maximo)}px`
  }, [texto, posicion])

  if (!area) return null

  // Misma regla que en P4: nunca se destruye texto escrito a mano. Si el campo
  // trae algo propio, el chip solo acusa el toque.
  const usarIdea = idea => {
    const actual = texto.trim()
    if (actual && !ideas.includes(actual)) {
      setInerte(idea)
      setTimeout(() => setInerte(null), INERTE_MS)
      return
    }
    onChange(area.tipo, idea)
    campoRef.current?.focus()
  }

  // Avanzar: lo del área actual ya está guardado (el borrador se escribe en
  // cada pulsación) y entra la siguiente con un cruce corto. En la última, a P6.
  const avanzar = () => {
    if (esUltima) {
      onNext()
      return
    }
    if (reducedMotion) {
      onIndice(posicion + 1)
      return
    }
    setCambiando(true)
    setTimeout(() => {
      onIndice(posicion + 1)
      setCambiando(false)
    }, CAMBIO_MS)
  }

  // Omitir el área actual: se guarda null para distinguir "la dejó pasar" de
  // "escribió y borró" (§10.15).
  const omitir = () => {
    onChange(area.tipo, null)
    avanzar()
  }

  // Desde la primera área se sale a P4B; el flujo se encarga de no repetir la
  // transición hacia atrás.
  const atras = () => {
    if (posicion === 0) {
      onBack()
      return
    }
    onIndice(posicion - 1)
  }

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={atras}
      footer={
        <>
          <Button variant="primary" size="lg" fullWidth onClick={avanzar}>
            {esUltima ? copy.onboarding.p4c.done : copy.onboarding.p4c.next}
          </Button>

          {/* Omitir es una decisión válida, así que se ve como tal: ni
              escondida ni atenuada hasta desaparecer. */}
          <Button variant="ghost" size="md" fullWidth onClick={omitir}>
            {copy.onboarding.p4c.skip}
          </Button>
        </>
      }
    >
      {/* El indicador se compone del nombre del área —único elemento con color
          saturado de la pantalla— y del resto de la plantilla, que va en color
          de utilidad. Por eso la plantilla se interpola con el nombre vacío. */}
      <p
        aria-live="polite"
        className={clsx(
          'text-xs text-ink/55',
          !reducedMotion && 'transition-opacity duration-180 ease-smooth',
          cambiando && 'opacity-0'
        )}
      >
        <span className="font-medium" style={{ color: area.color }}>
          {area.nombre}
        </span>
        {interpolate(copy.onboarding.p4c.progressTemplate, {
          area: '',
          n: posicion + 1,
          total,
        })}
      </p>

      <div
        className={clsx(
          'flex flex-col',
          !reducedMotion && 'transition-opacity duration-280 ease-smooth',
          cambiando && 'opacity-0'
        )}
      >
        <h1
          ref={tituloRef}
          tabIndex={-1}
          id="p4c-titulo"
          className="mt-8 font-display text-xl leading-tight text-ink focus:outline-none"
        >
          {interpolate(copy.onboarding.p4c.titleTemplate, { area: area.nombre })}
        </h1>

        {/* Sin caja y sin marcador: el título ya dice qué escribir, y un
            marcador añadiría una tercera voz a la pantalla. */}
        <textarea
          id="identidad-area"
          ref={campoRef}
          rows={2}
          value={texto}
          autoComplete="off"
          enterKeyHint="done"
          aria-labelledby="p4c-titulo"
          onChange={evento => onChange(area.tipo, evento.target.value)}
          onKeyDown={evento => {
            if (evento.key === 'Enter') evento.preventDefault()
          }}
          className={[
            'mt-6 w-full resize-none overflow-y-auto',
            'bg-transparent border-0 border-b border-border rounded-none',
            'px-0 py-2 text-md text-ink leading-relaxed',
            'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
            'focus:outline-none focus:border-ink',
          ].join(' ')}
        />

        {ideas.length > 0 && (
          <>
            <p id="p4c-ideas" className="mt-8 text-xs text-ink/55">
              {copy.onboarding.p4c.ideasLabel}
            </p>

            <div
              role="group"
              aria-labelledby="p4c-ideas"
              className="mt-3 flex flex-wrap gap-2"
            >
              {ideas.map(idea => (
                <Chip
                  key={idea}
                  size="sm"
                  onClick={() => usarIdea(idea)}
                  aria-label={interpolate(copy.onboarding.p4c.useSuggestionTemplate, {
                    texto: idea,
                  })}
                  className={clsx(
                    'whitespace-normal text-left leading-tight',
                    texto.trim() === idea && 'border-ink text-ink',
                    inerte === idea && 'opacity-50 motion-safe:animate-chip-press'
                  )}
                >
                  {idea}
                </Chip>
              ))}
            </div>
          </>
        )}

        {/* Llega donde aparece la presión: al decidir si se escribe o no */}
        <p className="mt-8 text-xs leading-relaxed text-ink/50">
          {copy.onboarding.p4c.pressure}
        </p>
      </div>
    </OnboardingLayout>
  )
}
