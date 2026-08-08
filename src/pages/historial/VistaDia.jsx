// src/pages/historial/VistaDia.jsx
// Vista de un día completo del Historial (§5.10)
//
// Todo lo que quedó de ese día, en el orden en que se vivió: la intención de la
// mañana, lo que se agradeció, lo que se propuso y en qué quedó, lo que se hizo
// y cómo se fue a dormir.
//
// Un bloque sin nada no se pinta vacío. Un día entero sin nada se resuelve en
// una línea, sin reproche: "De ese día no quedó nada escrito. También cuenta."
//
// Es solo lectura: el historial se mira, no se corrige.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import useCopy from '@hooks/useCopy'
import { fechaConDiaSemana } from '@lib/fechas'
import { nombreDeEstado, colorDeAnimo } from '@lib/historial'
import { nombreDeEmocion } from '@lib/emociones'
import { nombresDeAnimos } from '@lib/animos'
import BloqueDiario from '@components/diario/BloqueDiario'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'

export default function VistaDia({ dia, onVolver }) {
  // Las emociones cambian con el género de quien las lee (§22.4)
  const t = useCopy()
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [dia.fecha])

  const { blocks } = copy.historial

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <Button variant="ghost" size="sm" className="-ml-4" onClick={onVolver}>
        {copy.ritual.nav.back}
      </Button>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {fechaConDiaSemana(dia.fecha)}
      </h1>

      {dia.vacio ? (
        <p className="mt-8 text-base leading-relaxed text-ink/80">
          {copy.historial.emptyDay}
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">

          {dia.intencion && (
            <BloqueDiario id="h-intencion" label={blocks.intencion}>
              <p className="font-display text-md text-ink leading-relaxed">{dia.intencion}</p>
            </BloqueDiario>
          )}

          {dia.emociones.length > 0 && (
            <BloqueDiario id="h-emociones" label={blocks.emociones}>
              <p className="text-base text-ink">
                {dia.emociones.map(id => nombreDeEmocion(id, t)).join(' · ')}
              </p>
              {dia.necesito && (
                <p className="mt-3 text-base text-ink/80">
                  <span className="block text-sm text-ink/70">{blocks.necesito}</span>
                  {dia.necesito}
                </p>
              )}
            </BloqueDiario>
          )}

          {dia.granDia && (
            <BloqueDiario id="h-gran-dia" label={blocks.granDia}>
              <p className="text-base text-ink leading-relaxed">{dia.granDia}</p>
            </BloqueDiario>
          )}

          {dia.agradecimientos.length > 0 && (
            <BloqueDiario id="h-agradecimientos" label={blocks.agradecimientos}>
              <ul className="flex flex-col gap-2">
                {dia.agradecimientos.map((texto, i) => (
                  <li key={i} className="text-base text-ink leading-relaxed">{texto}</li>
                ))}
              </ul>
            </BloqueDiario>
          )}

          {dia.victorias.length > 0 && (
            <BloqueDiario id="h-victorias" label={blocks.victorias}>
              <div className="flex flex-col gap-3">
                {dia.victorias.map(victoria => (
                  <Card key={victoria.id}>
                    <p className="text-base text-ink leading-relaxed">{victoria.texto}</p>
                    <p className="mt-1 text-sm text-ink/70">
                      {nombreDeEstado(victoria.estado)}
                    </p>
                  </Card>
                ))}
              </div>
            </BloqueDiario>
          )}

          {dia.habitos.length > 0 && (
            <BloqueDiario id="h-habitos" label={blocks.habitos}>
              <ul className="flex flex-col gap-2">
                {dia.habitos.map(habito => (
                  <li key={habito.id} className="text-base text-ink">{habito.nombre}</li>
                ))}
              </ul>
            </BloqueDiario>
          )}

          {dia.aprendizaje && (
            <BloqueDiario id="h-aprendizaje" label={blocks.aprendizaje}>
              <p className="text-base text-ink leading-relaxed">{dia.aprendizaje}</p>
            </BloqueDiario>
          )}

          {dia.journal.length > 0 && (
            <BloqueDiario id="h-journal" label={blocks.journal}>
              <div className="flex flex-col gap-3">
                {dia.journal.map(entrada => (
                  <Card key={entrada.id}>
                    <p className="text-base text-ink leading-relaxed whitespace-pre-wrap">
                      {entrada.texto}
                    </p>
                  </Card>
                ))}
              </div>
            </BloqueDiario>
          )}

          {dia.animo.length > 0 && (
            <BloqueDiario id="h-animo" label={copy.historial.moodLabel}>
              <p className="flex items-center gap-2 font-display text-md text-ink">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colorDeAnimo(dia.animo) }}
                  aria-hidden="true"
                />
                {/* Se eligieron hasta dos: se leen seguidos, sin jerarquía entre
                    ellos. El punto toma el color del primero. */}
                {nombresDeAnimos(dia.animo, t).join(' · ')}
              </p>
            </BloqueDiario>
          )}
        </div>
      )}
    </div>
  )
}
