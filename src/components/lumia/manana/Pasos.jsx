// src/components/lumia/manana/Pasos.jsx
// El indicador del recorrido y sus dos controles.
//
// **Cuenta momentos, no campos.** "1 de 3" dice dónde estás, no cuánto te falta
// por rellenar: un contador de campos convertiría una mañana escrita a medias
// en una barra a medio llenar, que es exactamente la lectura que este producto
// no quiere producir.
//
// Es discreto a propósito —texto pequeño y tres puntos— y no ocupa el lugar de
// nada: la pregunta sigue siendo lo primero que se lee.
//
// La pausa opcional no entra en la cuenta. No está todos los días, y un total
// que cambia de una mañana a otra deja de orientar.

import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'

const textos = copy.lumia.diario.manana.pasos

export function IndicadorPasos({ indice, total }) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={textos.etiqueta}>
      <p className="text-sm text-on-surface-soft" role="status">
        {interpolate(textos.indicadorTemplate, { n: indice + 1, total })}
      </p>
      <span aria-hidden="true" className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, posicion) => (
          <span
            key={posicion}
            className={clsx(
              'h-1.5 w-1.5 rounded-full bg-current',
              'transition-opacity duration-260 ease-smooth motion-reduce:transition-none',
              posicion === indice ? 'opacity-70' : 'opacity-25',
            )}
          />
        ))}
      </span>
    </div>
  )
}

export function NavegacionPasos({ hayAtras, esUltimo, onAtras, onSiguiente }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="surface" onClick={onSiguiente}>
        {esUltimo ? textos.finalizar : textos.siguiente}
      </Button>

      {hayAtras && (
        <button
          type="button"
          onClick={onAtras}
          className={clsx(
            'rounded-full px-3 py-2 min-h-touch-sm text-sm',
            'text-on-surface-soft hover:text-on-surface',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
          )}
        >
          {textos.atras}
        </button>
      )}
    </div>
  )
}
