// src/components/habitos/SelectorEmoji.jsx
// Elegir el símbolo de un hábito propio (§16.3.B).
//
// Que la persona pueda elegir el símbolo de lo que ella inventó cierra el
// círculo: su hábito se ve igual de cuidado que los que trae la app.
//
// El catálogo es corto y curado (@lib/emojis), no el teclado del sistema: mil
// opciones convierten una decisión de dos segundos en una tarea.
//
// Elegir cierra la hoja sin confirmación ni aviso: el símbolo ya cambió en el
// botón, que es toda la confirmación que hace falta.

import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { EMOJI_CATEGORIAS, EMOJI_POR_DEFECTO } from '@lib/emojis'
import CloseIcon from '@components/ui/CloseIcon'

// Nombre para el lector de pantalla. Si un símbolo no está nombrado, se ofrece
// igual: quedarse sin etiqueta es peor que una etiqueta genérica.
export const nombreDe = emoji => copy.habits.emoji.names[emoji] ?? emoji

// ─── El botón que abre la hoja ───────────────────────────────────────────────
export function BotonEmoji({ emoji, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copy.habits.emoji.pickerLabel}
      className={clsx(
        'flex-shrink-0 flex items-center justify-center',
        'min-h-touch w-14',
        'rounded-md bg-surface border border-border',
        'text-md',
        'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
        className
      )}
    >
      <span aria-hidden="true">{emoji ?? EMOJI_POR_DEFECTO}</span>
    </button>
  )
}

// ─── La hoja ─────────────────────────────────────────────────────────────────
export default function SelectorEmoji({ abierto, onElegir, onCerrar }) {
  const hojaRef = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined

    hojaRef.current?.querySelector('button')?.focus()

    const alTeclear = evento => {
      if (evento.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Tocar fuera cierra: no hay nada que confirmar */}
      <button
        type="button"
        aria-label={copy.habits.emoji.close}
        onClick={onCerrar}
        className="absolute inset-0 bg-ink/20 animate-fade-up motion-reduce:animate-none"
      />

      <div
        ref={hojaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="selector-emoji-titulo"
        className={clsx(
          'relative w-full max-w-md',
          'rounded-t-lg bg-paper shadow-elev-8',
          'px-6 pt-5 pb-safe',
          'max-h-[70vh] overflow-y-auto scroll-smooth-no-bounce',
          'animate-fade-up motion-reduce:animate-none'
        )}
      >
        <div className="flex items-center justify-between">
          <h2 id="selector-emoji-titulo" className="font-display text-md text-ink">
            {copy.habits.emoji.sheetTitle}
          </h2>

          <button
            type="button"
            onClick={onCerrar}
            aria-label={copy.habits.emoji.close}
            className="min-h-touch-sm min-w-touch-sm flex items-center justify-center -mr-2 text-ink/60"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {EMOJI_CATEGORIAS.map(categoria => (
          <section key={categoria.id} className="mt-6">
            <h3 className="text-xs text-ink/55">
              {copy.habits.emoji.categories[categoria.id]}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">
              {categoria.emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onElegir(emoji)}
                  aria-label={interpolate(copy.habits.emoji.useTemplate, {
                    nombre: nombreDe(emoji),
                  })}
                  className={clsx(
                    'min-h-touch-sm min-w-touch-sm',
                    'flex items-center justify-center rounded-md text-md',
                    'transition-colors duration-120 ease-smooth motion-reduce:transition-none',
                    'hover:bg-surface',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20'
                  )}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
