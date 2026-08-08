// src/components/strivo/SelectorEmociones.jsx
// Cómo me quiero sentir hoy (§22).
// Copy: copy.hoy.emociones · catálogo, ids y emojis: @lib/emociones
//
// Píldoras de ancho desigual que fluyen en filas, no una rejilla de cajas: la
// desigualdad es lo que hace que el bloque se lea orgánico y no como una tabla.
// "Alegre" y "Conectada con Dios" no pueden medir lo mismo.
//
// Máximo tres. Al llegar, las demás se atenúan y dejan de responder: sin error,
// sin aviso y sin vibración, igual que el límite de áreas de P4B.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import {
  EMOCIONES,
  EMOCION_OTRA,
  OTRA_MAX_LENGTH,
  comoPropia,
  esPropia,
  nombreDeEmocion,
} from '@lib/emociones'
import useCopy from '@hooks/useCopy'

export default function SelectorEmociones({ selected = [], onChange, max }) {
  const t = useCopy()
  const campoRef = useRef(null)
  const [escribiendo, setEscribiendo] = useState(false)
  const [propia, setPropia]           = useState('')

  const lleno = selected.length >= max

  useEffect(() => { if (escribiendo) campoRef.current?.focus() }, [escribiendo])

  const alternar = id => {
    if (selected.includes(id)) {
      onChange(selected.filter(elegida => elegida !== id))
      return
    }
    if (lleno) return
    onChange([...selected, id])
  }

  const anadirPropia = () => {
    const limpio = propia.trim()
    if (!limpio || lleno) return
    const id = comoPropia(limpio)
    if (!selected.includes(id)) onChange([...selected, id])
    setPropia('')
    setEscribiendo(false)
  }

  // Las escritas a mano se muestran como un chip elegido más
  const propias = selected.filter(esPropia)

  return (
    <>
      {/* La única superficie tintada del bloque: el título y su subtítulo */}
      <div className="rounded-lg bg-surface-subtle px-5 py-4">
        <h3 id="emociones-titulo" className="font-display text-md text-ink">
          {copy.hoy.emociones.titulo}
        </h3>
        <p className="mt-1 text-sm text-ink/70">
          {copy.hoy.emociones.subtitulo}
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="emociones-titulo"
        className="mt-5 flex flex-wrap gap-2"
      >
        {EMOCIONES.map(emocion => {
          const elegida  = selected.includes(emocion.id)
          const atenuada = lleno && !elegida
          return (
            <button
              key={emocion.id}
              type="button"
              aria-pressed={elegida}
              aria-disabled={atenuada || undefined}
              onClick={() => alternar(emocion.id)}
              className={clsx(
                // Píldora: el radio es la mitad de la altura, y el ancho lo
                // decide el contenido. Nunca uniforme.
                'inline-flex items-center gap-2 rounded-full',
                'min-h-touch-sm px-4 py-2 text-base font-sans',
                'transition-all duration-200 ease-smooth motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
                // Relleno y peso, no solo color
                elegida
                  ? 'bg-ink text-paper font-bold shadow-elev-2'
                  : 'bg-surface text-ink font-medium shadow-elev-1',
                atenuada && 'opacity-40'
              )}
            >
              <span className="text-md leading-none" aria-hidden="true">{emocion.emoji}</span>
              {t(`hoy.emociones.opciones.${emocion.id}`)}
            </button>
          )
        })}

        {propias.map(id => (
          <button
            key={id}
            type="button"
            aria-pressed
            onClick={() => alternar(id)}
            className={clsx(
              'inline-flex items-center rounded-full',
              'min-h-touch-sm px-4 py-2 text-base font-sans font-bold',
              'bg-ink text-paper shadow-elev-2',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
            )}
          >
            {nombreDeEmocion(id, t)}
          </button>
        ))}
      </div>

      {/* "Otra" va en su propia fila y comunica "añadir", no "elegir": por eso
          el borde punteado y el signo, en vez de un texto que lo explique. */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setEscribiendo(abierto => !abierto)}
          aria-expanded={escribiendo}
          aria-controls="emociones-otra"
          disabled={lleno && !escribiendo}
          className={clsx(
            'inline-flex items-center gap-2 rounded-full',
            'min-h-touch-sm px-4 py-2 text-base font-sans font-medium',
            'border border-dashed border-ink/40 text-ink/80 bg-transparent',
            'transition-opacity duration-200 ease-smooth motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
            lleno && !escribiendo && 'opacity-40'
          )}
        >
          <span aria-hidden="true">+</span>
          {t(`hoy.emociones.opciones.${EMOCION_OTRA}`)}
        </button>
      </div>

      {escribiendo && (
        <div id="emociones-otra" className="mt-3 flex items-start gap-3 animate-sugerencia-entra motion-reduce:animate-none">
          <label htmlFor="emocion-propia" className="sr-only">
            {copy.hoy.emociones.otraLabel}
          </label>
          <input
            id="emocion-propia"
            ref={campoRef}
            type="text"
            value={propia}
            maxLength={OTRA_MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={copy.hoy.emociones.otraPlaceholder}
            onChange={evento => setPropia(evento.target.value)}
            onKeyDown={evento => {
              if (evento.key === 'Enter') {
                evento.preventDefault()
                anadirPropia()
              }
            }}
            className={[
              'flex-1 min-w-0 min-h-touch-sm',
              'rounded-full bg-surface border border-border',
              'px-4 py-2 text-base text-ink',
              'placeholder:text-ink/70',
              'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
            ].join(' ')}
          />
          <button
            type="button"
            onClick={anadirPropia}
            disabled={!propia.trim()}
            className={clsx(
              'min-h-touch-sm px-4 rounded-full text-base font-medium',
              'bg-surface border border-border text-ink',
              'disabled:opacity-40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
            )}
          >
            {copy.hoy.emociones.otraAdd}
          </button>
        </div>
      )}

      {/* Llegar al límite no tiene aviso visual: esto es lo único que lo dice */}
      <p className="sr-only" aria-live="polite">
        {interpolate(copy.hoy.emociones.countTemplate, { n: selected.length, max })}
      </p>
    </>
  )
}
