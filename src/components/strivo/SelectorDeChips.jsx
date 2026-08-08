// src/components/strivo/SelectorDeChips.jsx
// La pregunta de ánimo, en sus dos momentos del día.
//
// Es el componente que usan "¿Cómo me quiero sentir hoy?" (§22) y "¿Cómo te vas
// a dormir?" (§5.6). Mismo cuadro, mismos chips, mismo límite, misma forma de
// añadir una palabra propia: las dos preguntas son el mismo gesto en dos
// momentos, y parecerlo no es un capricho estético — es lo que hace que la
// segunda no haya que aprenderla.
//
// Lo único que cambia entre una y otra es el contenido (pregunta, opciones,
// emojis), el tono de la tarjeta y dónde se guarda lo elegido.
//
// Píldoras de ancho desigual que fluyen en filas, no una rejilla de cajas: la
// desigualdad es lo que hace que el bloque se lea orgánico y no como una tabla.
// "Alegre" y "Conectada con Dios" no pueden medir lo mismo.
//
// Al llegar al máximo las demás se atenúan y dejan de responder: sin error, sin
// aviso y sin vibración, igual que el límite de áreas de P4B.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { interpolate } from '@copy'
import { comoPropia, esPropia } from '@lib/propias'
import { degradadoDeMomento } from '@tokens'

export default function SelectorDeChips({
  // Contenido
  titulo,
  subtitulo,
  opciones,            // [{ id, emoji }]
  nombreDe,            // (id) => string, ya resuelto al género vigente
  // Estado
  selected = [],
  onChange,
  max,
  // Copy del campo de palabra propia
  otraId,              // id de catálogo cuyo rótulo abre el campo
  otraLabel,
  otraPlaceholder,
  otraAdd,
  otraMaxLength,
  sanear = texto => texto,   // la noche admite una sola palabra; la mañana, una frase corta
  countTemplate,
  // Presentación
  tono,                // degradado de la tarjeta: { from, to } de @tokens.momento
  idBase,              // prefijo de los ids del DOM: 'emociones' | 'animo'
  tituloRef,
  tituloComo: Titulo = 'h3',
}) {
  const campoRef = useRef(null)
  const [escribiendo, setEscribiendo] = useState(false)
  const [propia, setPropia]           = useState('')

  const lleno = selected.length >= max
  const tituloId = `${idBase}-titulo`

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
      <div className="rounded-lg px-5 py-4" style={{ background: degradadoDeMomento(tono) }}>
        <Titulo
          id={tituloId}
          ref={tituloRef}
          tabIndex={tituloRef ? -1 : undefined}
          className="font-display text-md text-ink focus:outline-none"
        >
          {titulo}
        </Titulo>
        {subtitulo && (
          // ink/80 y no ink/70: sobre estos dos tonos el 70 % se queda en 3.9:1
          <p className="mt-1 text-sm text-ink/80">{subtitulo}</p>
        )}
      </div>

      <div
        role="group"
        aria-labelledby={tituloId}
        className="mt-5 flex flex-wrap gap-2"
      >
        {opciones.map(opcion => {
          const elegida  = selected.includes(opcion.id)
          const atenuada = lleno && !elegida
          return (
            <button
              key={opcion.id}
              type="button"
              aria-pressed={elegida}
              aria-disabled={atenuada || undefined}
              onClick={() => alternar(opcion.id)}
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
              {opcion.emoji && (
                <span className="text-md leading-none" aria-hidden="true">{opcion.emoji}</span>
              )}
              {nombreDe(opcion.id)}
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
            {nombreDe(id)}
          </button>
        ))}
      </div>

      {/* "Algo más" va en su propia fila y comunica "añadir", no "elegir": por
          eso el borde punteado y el signo, en vez de un texto que lo explique. */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setEscribiendo(abierto => !abierto)}
          aria-expanded={escribiendo}
          aria-controls={`${idBase}-otra`}
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
          {nombreDe(otraId)}
        </button>
      </div>

      {escribiendo && (
        <div id={`${idBase}-otra`} className="mt-3 flex items-start gap-3 animate-sugerencia-entra motion-reduce:animate-none">
          <label htmlFor={`${idBase}-propia`} className="sr-only">
            {otraLabel}
          </label>
          <input
            id={`${idBase}-propia`}
            ref={campoRef}
            type="text"
            value={propia}
            maxLength={otraMaxLength}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={otraPlaceholder}
            onChange={evento => setPropia(sanear(evento.target.value))}
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
            {otraAdd}
          </button>
        </div>
      )}

      {/* Llegar al límite no tiene aviso visual: esto es lo único que lo dice */}
      <p className="sr-only" aria-live="polite">
        {interpolate(countTemplate, { n: selected.length, max })}
      </p>
    </>
  )
}
