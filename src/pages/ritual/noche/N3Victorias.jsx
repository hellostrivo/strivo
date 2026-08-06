// src/pages/ritual/noche/N3Victorias.jsx
// N3 — Victorias heredadas de la mañana + logros no planeados
// Copy: copy.ritualNoche.n3 · etiquetas de acción en copy.diarioNoche
//
// Las dos mitades van juntas porque son la misma pregunta —qué pasó hoy— y así
// se presentan en la Vista de Noche: primero lo que se propuso por la mañana,
// después "¿Algo más?".
//
// Cada victoria heredada tiene cuatro salidas y ninguna es un fracaso:
// "Lo lograste" · "No se dio" · "Pasarla a mañana" · "Dejarla ir". Decidir es
// opcional: se puede seguir sin tocar ninguna y nada queda marcado como deuda.
//
// Sin victorias de la mañana el bloque no aparece: no se enseña una lista vacía
// para señalar que no se llenó (RN-05).

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Chip from '@components/ui/Chip'
import CloseIcon from '@components/ui/CloseIcon'

const MAX_LENGTH = 140

const DECISIONES = [
  { id: 'lograda', label: copy.diarioNoche.victories.achieved },
  { id: 'noSeDio', label: copy.diarioNoche.victories.notAchieved },
  { id: 'aManana', label: copy.diarioNoche.victories.passToTomorrow },
  { id: 'soltada', label: copy.diarioNoche.victories.letItGo },
]

export default function N3Victorias({
  heredadas,        // victorias pendientes de la mañana
  decisiones,       // { [victoriaId]: 'lograda' | 'noSeDio' | 'aManana' | 'soltada' }
  logros,           // logros no planeados ya añadidos hoy
  onDecidir,
  onAnadirLogro,
  onQuitarLogro,
}) {
  const headingRef = useRef(null)
  const campoRef   = useRef(null)
  const [texto, setTexto] = useState('')

  useEffect(() => { headingRef.current?.focus() }, [])

  const anadir = () => {
    const limpio = texto.trim()
    if (!limpio) return
    onAnadirLogro(limpio)
    setTexto('')
    campoRef.current?.focus()
  }

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualNoche.n3.question}
      </h1>

      {heredadas.length > 0 && (
        <div className="mt-8">
          <p className="text-base text-ink/80">
            {copy.diarioNoche.victories.label}
          </p>

          <div className="mt-4 flex flex-col gap-4">
            {heredadas.map(victoria => (
              <Card key={victoria.id}>
                <p className="font-display text-md leading-relaxed text-ink">
                  {victoria.texto}
                </p>

                <div
                  role="group"
                  aria-label={victoria.texto}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {DECISIONES.map(decision => (
                    <Chip
                      key={decision.id}
                      size="sm"
                      selected={decisiones[victoria.id] === decision.id}
                      onClick={() => onDecidir(victoria, decision.id)}
                    >
                      {decision.label}
                    </Chip>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <label htmlFor="logro-no-planeado" className="block text-base text-ink/80">
          {copy.diarioNoche.unplanned.label}
        </label>

        {logros.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {logros.map(logro => (
              <Chip
                key={logro.id}
                selected
                onClick={() => onQuitarLogro(logro)}
                aria-label={interpolate(copy.ritualNoche.n3.removeTemplate, {
                  logro: logro.texto,
                })}
              >
                {logro.texto}
                <CloseIcon />
              </Chip>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-start gap-3">
          <input
            id="logro-no-planeado"
            ref={campoRef}
            type="text"
            value={texto}
            maxLength={MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={copy.diarioNoche.unplanned.placeholder}
            onChange={event => setTexto(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                anadir()
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
            onClick={anadir}
            className="flex-shrink-0"
          >
            {copy.ritualNoche.n3.addLabel}
          </Button>
        </div>
      </div>
    </>
  )
}
