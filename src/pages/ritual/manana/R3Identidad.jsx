// src/pages/ritual/manana/R3Identidad.jsx
// R3 — Identidad y área del día
// Copy: docs/copy-library.md §2 → copy.ritualManana.r3
//
// El centro del ritual: se le devuelve a la persona quién dijo ser, en sus
// palabras. El área del día es una dirección para hoy, nunca un hueco que
// llenar (RN-05); la regla de elección vive en @lib/ritualManana.
//
// "Y estás cultivando" solo aparece si el hábito lleva un compromiso de días
// (habito.compromiso). Todavía nada lo crea —el modelo de §7.2 no tiene ese
// campo—, así que hoy el bloque no se pinta. Cuando exista, aparece solo.
//
// "Cambiar esto" solo se ofrece si hay a dónde ir: sin pantalla de Perfil, un
// enlace que no lleva a ningún sitio es peor que ninguno.

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import Button from '@components/ui/Button'

export default function R3Identidad({ identidad, area, compromiso, onEditarIdentidad }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <div className="flex-1 flex flex-col justify-center">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {interpolate(copy.ritualManana.r3.template, { identidad })}
      </h1>

      {area && (
        <div className="mt-10">
          <p className="text-base text-ink/80">
            {copy.ritualManana.r3.areaLabel}
          </p>

          <p className="mt-3 flex items-center gap-2 font-display text-md text-ink">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: area.color }}
              aria-hidden="true"
            />
            {area.nombre}
          </p>

          {area.identidadArea && (
            <p className="mt-1 ml-4 text-base text-ink/80">
              {interpolate(copy.ritualManana.r3.areaIdentityTemplate, {
                identidad: area.identidadArea,
              })}
            </p>
          )}
        </div>
      )}

      {compromiso && (
        <div className="mt-8">
          <p className="text-base text-ink/80">
            {copy.ritualManana.r3.commitmentLabel}
          </p>
          <p className="mt-2 text-md text-ink">
            {compromiso.nombre}{' '}
            <span className="text-ink/70">
              {interpolate(copy.ritualManana.r3.commitmentDays, {
                n:     compromiso.dia,
                total: compromiso.total,
              })}
            </span>
          </p>
        </div>
      )}

      {onEditarIdentidad && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-8 self-start -ml-4"
          onClick={onEditarIdentidad}
        >
          {copy.ritualManana.r3.editLink}
        </Button>
      )}
    </div>
  )
}
