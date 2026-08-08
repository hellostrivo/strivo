// src/components/historial/Calendario.jsx
// Calendario de ánimo del Historial (§5.10)
//
// Un punto por día registrado, del color de cómo se cerró ese día. Los días sin
// nada escrito no llevan punto: no son un hueco, son días.
//
// Ningún color es rojo y ninguno es peor que otro (ver COLOR_DE_ANIMO en
// @lib/historial). El día de hoy se distingue por su borde, no por color.
//
// La semana empieza en lunes, como los días de los hábitos.

import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import useCopy from '@hooks/useCopy'
import { rejillaDelMes, mesEnPalabras, fechaEnPalabras } from '@lib/fechas'
import { nombresDeAnimos } from '@lib/animos'
import Button from '@components/ui/Button'

export default function Calendario({ ano, mes, dias, hoy, onDia, onAnterior, onSiguiente }) {
  // El ánimo se lee en voz alta en la etiqueta de cada día, así que también
  // cambia con el género (§2.4)
  const t = useCopy()
  const celdas = rejillaDelMes(ano, mes)

  return (
    <section aria-label={mesEnPalabras(ano, mes)}>
      <header className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" className="-ml-4" onClick={onAnterior}>
          <span aria-hidden="true">←</span>
          <span className="sr-only">{copy.historial.previousMonth}</span>
        </Button>

        <h2 className="font-display text-md text-ink" aria-live="polite">
          {mesEnPalabras(ano, mes)}
        </h2>

        <Button
          variant="ghost"
          size="sm"
          className="-mr-4"
          disabled={!onSiguiente}
          onClick={onSiguiente}
        >
          <span aria-hidden="true">→</span>
          <span className="sr-only">{copy.historial.nextMonth}</span>
        </Button>
      </header>

      <div className="mt-6 grid grid-cols-7 gap-1" aria-hidden="true">
        {copy.days.short.map(dia => (
          <span key={dia} className="text-center text-xs text-ink/50 pb-2">
            {dia}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celdas.map((fecha, indice) => {
          if (!fecha) return <span key={`hueco-${indice}`} aria-hidden="true" />

          const dia    = dias.get(fecha)
          const numero = Number(fecha.slice(-2))
          const esHoy  = fecha === hoy

          return (
            <button
              key={fecha}
              type="button"
              onClick={() => onDia(fecha)}
              aria-label={
                dia?.animo?.length
                  ? `${fechaEnPalabras(fecha)}. ${copy.historial.moodLabel}: ${nombresDeAnimos(dia.animo, t).join(', ')}`
                  : fechaEnPalabras(fecha)
              }
              className={clsx(
                'aspect-square min-h-touch-sm rounded-sm',
                'flex flex-col items-center justify-center gap-1',
                'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                'hover:bg-surface',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                esHoy && 'border border-ink/30',
              )}
            >
              <span className={clsx('text-sm', dia ? 'text-ink' : 'text-ink/40')}>
                {numero}
              </span>

              {/* Sin registro no hay punto: el hueco no se señala */}
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: dia ? dia.color : 'transparent' }}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
