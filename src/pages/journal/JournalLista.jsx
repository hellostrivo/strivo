// src/pages/journal/JournalLista.jsx
// Lista de entradas del Journal (§5.8)
//
// Lo más reciente primero. Cada entrada enseña su fecha y sus primeras
// palabras; tocarla la abre por donde se dejó.
//
// La búsqueda es por palabra suelta, sin acentos ni mayúsculas. Sin resultados
// se dice en una línea y sin sugerir que se busque mejor.

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import useCopy from '@hooks/useCopy'
import { buscar, resumen } from '@lib/journal'
import {
  normalizarEmocionesJournal,
  nombreDeEmocionJournal,
  emojiDeEmocionJournal,
} from '@lib/emocionesJournal'
import { fechaConDiaSemana } from '@lib/fechas'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'

export default function JournalLista({ entradas, onAbrir, onNueva }) {
  const headingRef = useRef(null)
  const t = useCopy()
  const [consulta, setConsulta] = useState('')

  useEffect(() => { headingRef.current?.focus() }, [])

  const resultados = buscar(entradas, consulta)
  const buscando   = consulta.trim().length > 0

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl text-ink focus:outline-none"
      >
        {copy.journal.title}
      </h1>

      {entradas.length > 0 && (
        <div className="mt-6">
          <label htmlFor="journal-buscar" className="sr-only">
            {copy.journal.search}
          </label>
          <input
            id="journal-buscar"
            type="search"
            value={consulta}
            autoComplete="off"
            placeholder={copy.journal.searchPlaceholder}
            onChange={event => setConsulta(event.target.value)}
            className={[
              'w-full min-h-touch',
              'rounded-md bg-surface border border-border',
              'px-4 py-3 text-base text-ink',
              'placeholder:text-ink/70',
              'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
              'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
            ].join(' ')}
          />
        </div>
      )}

      {buscando && (
        <p className="mt-4 text-base text-ink/80" aria-live="polite">
          {resultados.length === 0
            ? copy.journal.noResults
            : resultados.length === 1
              ? copy.journal.resultsSingular
              : interpolate(copy.journal.resultsTemplate, { n: resultados.length })}
        </p>
      )}

      {entradas.length === 0 ? (
        <p className="mt-8 text-base leading-relaxed text-ink/80">
          {copy.empty.journal}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {resultados.map(entrada => {
            // Se puede guardar un día solo con cómo se sintió. Cuando no hay
            // texto, la tarjeta enseña eso en vez de quedarse en blanco.
            const emociones = normalizarEmocionesJournal(entrada.emociones)
            const texto = resumen(entrada.texto)
            return (
              <Card key={entrada.id} onClick={() => onAbrir(entrada)}>
                <p className="text-sm text-ink/70">
                  {fechaConDiaSemana(entrada.fecha)}
                </p>
                <p className="mt-2 text-base text-ink leading-relaxed">
                  {texto || emociones
                    .map(id => {
                      const emoji = emojiDeEmocionJournal(id)
                      const nombre = nombreDeEmocionJournal(id, t)
                      return emoji ? `${emoji} ${nombre}` : nombre
                    })
                    .join(' · ')}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      <Button variant="primary" size="lg" fullWidth className="mt-10" onClick={onNueva}>
        {copy.journal.new}
      </Button>
    </div>
  )
}
