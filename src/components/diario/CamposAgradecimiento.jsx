// src/components/diario/CamposAgradecimiento.jsx
// Campos de agradecimiento que crecen — compartidos por la Vista de Mañana
// (bloque 2) y el Ritual de Noche (N4).
//
// Tres campos para empezar. Al llenar el último aparece otro, hasta el máximo:
// la lista crece con quien escribe y nunca le pide más de lo que trae.
//
// Las sugerencias son una mano tendida para cuando cuesta arrancar, no una
// tarea. Hay dos formas de ofrecerlas:
//
// - `porInactividad` (Vista de Mañana, §21): por campo, a los 5 segundos con el
//   foco puesto y sin escribir. Ese es el momento exacto en que hacen falta.
//   Fijas eran decoración permanente y, peor, una respuesta prefabricada que se
//   lee antes de pensar: se ve "tu familia" y ya no se busca en el propio día.
// - Por defecto (Ritual de Noche, N4): a los 6 segundos si no se ha escrito
//   nada. Con movimiento reducido se muestran desde el principio.
//
// Los dos sitios escriben la misma lista del día (DailyEntry.agradecimientos):
// lo agradecido por la mañana sigue ahí por la noche, y se puede completar.

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import Chip from '@components/ui/Chip'
import useReducedMotion from '@hooks/useReducedMotion'

const CAMPOS_INICIALES = 3
const MAX_LENGTH = 120

// Cinco segundos mirando el campo sin escribir: ahí es donde hace falta la mano
const ESPERA_SIN_ESCRIBIR = 5000

export default function CamposAgradecimiento({
  agradecimientos,
  onChange,
  onGuardar,
  etiqueta,                 // nombre accesible de cada campo
  placeholder,
  suggestionsLabel,
  idBase = 'agradecimiento',
  max = copy.diarioManana.gratitude.max,
  porInactividad = false,
}) {
  const reducedMotion = useReducedMotion()
  const [sugerenciasVisibles, setSugerenciasVisibles] = useState(
    !porInactividad && reducedMotion
  )
  // Qué campos ya vieron sus sugerencias. Una vez mostradas no se ocultan:
  // aparecer y desaparecer solo distrae.
  const [conSugerencias, setConSugerencias] = useState(() => new Set())
  const relevo = useRef(null)

  const algoEscrito = agradecimientos.some(t => t.trim())

  useEffect(() => {
    if (porInactividad || reducedMotion || algoEscrito) return undefined
    const id = setTimeout(
      () => setSugerenciasVisibles(true),
      copy.diarioManana.gratitude.suggestionsDelay
    )
    return () => clearTimeout(id)
  }, [porInactividad, reducedMotion, algoEscrito])

  useEffect(() => () => clearTimeout(relevo.current), [])

  // El temporizador es por campo: arranca al enfocar, se reinicia con cada
  // pulsación y se cancela al salir.
  const esperar = indice => {
    if (!porInactividad || conSugerencias.has(indice)) return
    clearTimeout(relevo.current)
    relevo.current = setTimeout(() => {
      setConSugerencias(previos => new Set(previos).add(indice))
    }, ESPERA_SIN_ESCRIBIR)
  }

  const dejarDeEsperar = () => clearTimeout(relevo.current)

  // Siempre hay un hueco libre al final, hasta el máximo
  const visibles = Math.min(
    max,
    Math.max(CAMPOS_INICIALES, agradecimientos.filter(t => t.trim()).length + 1)
  )
  const campos = Array.from({ length: visibles }, (_, i) => agradecimientos[i] ?? '')

  const escribir = (indice, valor) => {
    const siguientes = [...campos]
    siguientes[indice] = valor
    onChange(siguientes)
  }

  const TODAS = copy.hoy.gratitud.sugerencias

  const usarSugerencia = sugerencia => {
    const hueco = campos.findIndex(t => !t.trim())
    escribir(hueco === -1 ? campos.length : hueco, sugerencia)
  }

  // En modo por inactividad la sugerencia va al campo que la pidió, y solo si
  // no hay nada propio escrito: nunca se destruye texto de la persona.
  const usarSugerenciaEn = (indice, sugerencia) => {
    const actual = campos[indice]?.trim()
    if (actual && !TODAS.includes(actual)) return
    escribir(indice, sugerencia)
  }

  const sinUsar = campos.length
    ? TODAS.filter(s => !campos.some(t => t.trim().toLowerCase() === s.toLowerCase()))
    : TODAS

  const claseCampo = [
    'w-full min-h-touch',
    'rounded-md bg-surface border border-border',
    'px-4 py-4 text-base text-ink',
    'placeholder:text-ink/70',
    'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
    'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
  ].join(' ')

  return (
    <>
      <div className="flex flex-col gap-3">
        {campos.map((valor, indice) => (
          <div key={indice}>
            <input
              id={`${idBase}-${indice}`}
              type="text"
              value={valor}
              maxLength={MAX_LENGTH}
              autoComplete="off"
              enterKeyHint="next"
              aria-label={`${etiqueta} ${indice + 1}`}
              placeholder={placeholder}
              onChange={event => { escribir(indice, event.target.value); esperar(indice) }}
              onFocus={() => esperar(indice)}
              onBlur={() => { dejarDeEsperar(); onGuardar?.() }}
              className={claseCampo}
            />

            {/* Los chips no roban el foco: quien estaba pensando y empieza a
                escribir en el segundo 6 sigue escribiendo aquí. */}
            {conSugerencias.has(indice) && sinUsar.length > 0 && (
              <div
                aria-live="polite"
                className="mt-3 flex flex-wrap gap-2 animate-sugerencia-entra motion-reduce:animate-none"
              >
                {sinUsar.map(sugerencia => (
                  <Chip
                    key={sugerencia}
                    size="sm"
                    onClick={() => usarSugerenciaEn(indice, sugerencia)}
                    aria-label={interpolate(copy.hoy.gratitud.usarTemplate, { texto: sugerencia })}
                  >
                    {sugerencia}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {sugerenciasVisibles && !algoEscrito && sinUsar.length > 0 && (
        <div className="mt-6 animate-fade-up">
          <p id={`${idBase}-sugerencias`} className="text-base text-ink/80">
            {suggestionsLabel}
          </p>
          <div
            role="group"
            aria-labelledby={`${idBase}-sugerencias`}
            className="mt-3 flex flex-wrap gap-2"
          >
            {sinUsar.map(sugerencia => (
              <Chip key={sugerencia} size="sm" onClick={() => usarSugerencia(sugerencia)}>
                {sugerencia}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
