// src/components/diario/LogrosNoPlaneados.jsx
// "¿Algo más?" — lo que salió bien sin haberlo planeado.
// Compartido por el Ritual de Noche (N3) y la Vista de Noche (bloque 2).
// Copy: copy.diarioNoche.unplanned
//
// Cada logro se añade como chip y se quita tocándolo. Quitar no borra la fila:
// la suelta (RN-04), así que deja de contar en la síntesis pero no se pierde.

import { useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'
import CloseIcon from '@components/ui/CloseIcon'

const MAX_LENGTH = 140

export default function LogrosNoPlaneados({
  logros,
  onAnadir,
  onQuitar,
  idCampo = 'logro-no-planeado',
  mostrarEtiqueta = true,
}) {
  const campoRef = useRef(null)
  const [texto, setTexto] = useState('')

  const anadir = () => {
    const limpio = texto.trim()
    if (!limpio) return
    onAnadir(limpio)
    setTexto('')
    campoRef.current?.focus()
  }

  return (
    <>
      {mostrarEtiqueta && (
        <label htmlFor={idCampo} className="block text-base text-ink/80">
          {copy.diarioNoche.unplanned.label}
        </label>
      )}

      {logros.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {logros.map(logro => (
            <Chip
              key={logro.id}
              selected
              onClick={() => onQuitar(logro)}
              aria-label={interpolate(copy.diarioNoche.unplanned.removeTemplate, {
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
          id={idCampo}
          ref={campoRef}
          type="text"
          value={texto}
          maxLength={MAX_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          aria-label={copy.diarioNoche.unplanned.label}
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
          {copy.diarioNoche.unplanned.add}
        </Button>
      </div>
    </>
  )
}
