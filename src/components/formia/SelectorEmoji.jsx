// src/components/formia/SelectorEmoji.jsx
// Emoji del hábito. Opcional siempre.
//
// Por qué aquí sí hay emojis: §3.6.2 (punto 5) prohíbe emojis **en la voz de la
// app** — "los emojis pertenecen al usuario". Este no lo escribe el producto,
// lo elige la persona para nombrar lo suyo, igual que los chips del Journal
// (§5.8.1). La regla se respeta, no se hace una excepción a ella.
//
// Paleta corta y curada, no el teclado del sistema: el teclado completo rompe
// el estado de calma y ofrece opciones incoherentes con el tono, y una paleta
// elegida es más rápida (§5.3, bloque 2).

import { useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'

const textos = copy.formia.habitos.editor.emoji

const PALETA = [
  '💧',
  '🍎',
  '🥗',
  '🏃',
  '🚶',
  '💪',
  '🧘',
  '🛏️',
  '☀️',
  '🌙',
  '📖',
  '✍️',
  '🎧',
  '🎸',
  '🎨',
  '📷',
  '💼',
  '📞',
  '🫂',
  '🙏',
  '🌿',
  '🧹',
  '💰',
  '⏳',
]

export default function SelectorEmoji({ valor, onElegir }) {
  const [abierta, setAbierta] = useState(false)

  // La paleta va plegada: H3 tiene cuatro campos y ninguno debe empujar al
  // resto fuera de la pantalla (§5.7, "máximo 4 campos visibles").
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-ink">{textos.label}</p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setAbierta((estaba) => !estaba)}
          aria-expanded={abierta}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-full border px-4',
            'min-h-touch-sm text-base text-ink',
            'transition-colors duration-260 ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
            'motion-reduce:transition-none',
            'border-border bg-paper hover:bg-surface',
          )}
        >
          {valor ? <span aria-hidden="true">{valor}</span> : textos.choose}
        </button>

        {valor && (
          <button
            type="button"
            onClick={() => onElegir(null)}
            className={clsx(
              'text-sm text-ink/80 underline underline-offset-4 min-h-touch-sm px-1',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
            )}
          >
            {textos.none}
          </button>
        )}
      </div>

      {abierta && (
        <ul className="flex flex-wrap gap-2">
          {PALETA.map((emoji) => {
            const elegido = valor === emoji
            return (
              <li key={emoji}>
                <button
                  type="button"
                  // Tocar el que ya está elegido lo quita: nada obliga a llevarlo.
                  onClick={() => {
                    onElegir(elegido ? null : emoji)
                    setAbierta(false)
                  }}
                  aria-pressed={elegido}
                  aria-label={emoji}
                  className={clsx(
                    'flex items-center justify-center w-12 h-12 rounded-full border text-base',
                    'transition-colors duration-260 ease-smooth',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                    'motion-reduce:transition-none',
                    elegido ? 'border-ink bg-surface' : 'border-border bg-paper hover:bg-surface',
                  )}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
