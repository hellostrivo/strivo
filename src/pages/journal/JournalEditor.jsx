// src/pages/journal/JournalEditor.jsx
// Editor del Journal — sin fricción (§5.8), con personalidad (bloque 06)
//
// Dos bloques, cada uno abierto por su tarjeta tintada: cómo me siento y qué
// escribo. Antes esta pantalla era una hoja en blanco con un cursor, y una hoja
// en blanco no invita a nadie: no dice qué cabe dentro ni deja nada que mirar
// mientras se decide por dónde empezar.
//
// Las emociones son las del presente, no las de la intención: aquí caben la
// tristeza y el cansancio, que en la Vista de Mañana no tendrían sentido (ver
// la nota de @lib/emocionesJournal). Elegir alguna es opcional; no elegir
// ninguna no impide escribir ni avisa de nada.
//
// No hay botón de guardar. Lo escrito y lo elegido se guardan solos mientras se
// escribe y al salir, así que "Listo" es solo una salida, no una confirmación.
// Una entrada que se queda sin texto y sin emociones no se guarda: abrir el
// editor y arrepentirse no deja rastro.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import { fechaConDiaSemana } from '@lib/fechas'
import { superficieJournal } from '@tokens'
import Button from '@components/ui/Button'
import SelectorEmocionesJournal from '@components/journal/SelectorEmocionesJournal'

const GUARDADO_MS = 900

// Una sola lista vacía, compartida: las entradas de antes del bloque 06 no
// traen el campo, y crear un array nuevo en cada render reiniciaría el relevo
// del autoguardado sin que nadie haya escrito nada.
const SIN_EMOCIONES = []

export default function JournalEditor({ entrada, onChange, onEmociones, onGuardar, onSalir }) {
  const campoRef = useRef(null)
  const emociones = entrada.emociones ?? SIN_EMOCIONES

  // Al volver a una entrada empezada, el cursor va al final de lo ya escrito:
  // se sigue por donde se dejó, sin tocar nada más.
  //
  // En una entrada nueva no se roba el foco. Abrir el teclado antes de que a
  // nadie le haya dado tiempo a mirar dejaría la pregunta de cómo me siento
  // fuera de pantalla en un móvil, que es justo lo que este bloque venía a
  // arreglar. Escribir sigue estando a un toque.
  useEffect(() => {
    const campo = campoRef.current
    if (!campo || !campo.value) return
    campo.focus()
    const final = campo.value.length
    campo.setSelectionRange(final, final)
  }, [entrada.id])

  // La hoja crece con lo que se escribe: nunca hay una barra de scroll dentro
  // de un campo dentro de una página.
  useEffect(() => {
    const campo = campoRef.current
    if (!campo) return
    campo.style.height = 'auto'
    campo.style.height = `${campo.scrollHeight}px`
  }, [entrada.texto])

  // Se guarda solo mientras se escribe: sin botón y sin avisos. Las emociones
  // van por el mismo camino, que es el que ya existía.
  useEffect(() => {
    if (!entrada.texto.trim() && emociones.length === 0) return
    const id = setTimeout(onGuardar, GUARDADO_MS)
    return () => clearTimeout(id)
  }, [entrada.texto, emociones, onGuardar])

  return (
    <div className="min-h-screen bg-paper flex flex-col" data-surface="light">
      <header className="w-full max-w-md mx-auto px-6 pt-safe pt-6 flex items-center justify-between gap-4">
        <p className="text-base text-ink/70">
          {fechaConDiaSemana(entrada.fecha)}
        </p>

        <Button variant="ghost" size="sm" className="-mr-4" onClick={onSalir}>
          {copy.journal.back}
        </Button>
      </header>

      <main
        className={[
          'flex-1 w-full max-w-md mx-auto px-6 pt-8 pb-16',
          'flex flex-col gap-12',
          'animate-fade-up motion-reduce:animate-none',
        ].join(' ')}
      >
        {/* 1 · Cómo me siento — el presente, no la intención */}
        <section data-surface="light">
          <SelectorEmocionesJournal selected={emociones} onChange={onEmociones} />
        </section>

        {/* 2 · La hoja. Su tarjeta va en otro tono para que se lea como otra
            sección sin necesidad de una línea que las separe. */}
        <section data-surface="light">
          <div
            data-surface="light"
            className="rounded-lg px-5 py-4"
            style={{ backgroundColor: superficieJournal.escritura }}
          >
            <h2 id="journal-escritura-titulo" className="font-display text-md text-ink">
              {copy.journal.escritura.titulo}
            </h2>
            {/* ink/80 y no ink/70: es el mismo criterio que las tarjetas de las
                preguntas de ánimo (ver tests/contraste.test.js) */}
            <p className="mt-1 text-sm text-ink/80">
              {copy.journal.escritura.subtitulo}
            </p>
          </div>

          <textarea
            ref={campoRef}
            value={entrada.texto}
            rows={1}
            aria-labelledby="journal-escritura-titulo"
            placeholder={copy.journal.placeholder}
            onChange={event => onChange(event.target.value)}
            onBlur={onGuardar}
            className={[
              'mt-5 w-full resize-none overflow-hidden min-h-hoja',
              'rounded-lg bg-surface border border-border',
              'px-5 py-5 text-base text-ink leading-loose',
              'placeholder:text-ink/70',
              'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
              'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
            ].join(' ')}
          />
        </section>
      </main>
    </div>
  )
}
