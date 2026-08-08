// src/pages/habitos/H2Detalle.jsx
// H2 — Detalle de un hábito (§5.7)
//
// Lo que se enseña es evidencia, no rendimiento: cuántas veces se ha hecho y
// cuándo. No hay porcentaje de cumplimiento, ni meta, ni comparación con otras
// semanas. Los días sin marca se ven, pero no se cuentan ni se nombran.
//
// Si el hábito pertenece a un área con identidad, la frase de arriba la
// recuerda: este hábito confirma quién está siendo (§5.1.1).
//
// Pausar es reversible y se dice así: "Aquí estará cuando lo quieras de vuelta."

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import { nombreDeMomento } from '@lib/habits'
import { etiquetaDeArea } from '@lib/areas'
import { areaColors } from '@tokens'
import CuadriculaDias from '@components/habitos/CuadriculaDias'
import Button from '@components/ui/Button'

export default function H2Detalle({ habito, area, detalle, onPausar, onReanudar, onVolver }) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [habito.id])

  const color    = area?.color ?? areaColors[area?.tipo] ?? '#D9CFC4'
  const etiqueta = etiquetaDeArea(area)
  const pausado = habito.estado === 'pausado'
  const nunca   = detalle.total === 0

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <Button variant="ghost" size="sm" className="-ml-4" onClick={onVolver}>
        {copy.ritual.nav.back}
      </Button>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 flex items-center gap-3 font-display text-xl leading-tight text-ink focus:outline-none"
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        {habito.nombre}
      </h1>

      {/* El área a la que pertenece. La identidad de área se quedó fuera: es
          demasiado específica para encajar con cualquier hábito (@lib/areas). */}
      {etiqueta && (
        <p className="mt-4 text-base leading-relaxed text-ink/80">
          {etiqueta.nombre}
        </p>
      )}

      <p className="mt-2 text-base text-ink/80">
        {interpolate(copy.habits.detail.momentTemplate, {
          momento: nombreDeMomento(habito.momento).toLocaleLowerCase('es'),
        })}
      </p>

      {nunca ? (
        <p className="mt-10 text-base leading-relaxed text-ink/80">
          {copy.habits.detail.neverTemplate}
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-2">
          <p className="font-display text-md text-ink">
            {interpolate(copy.habits.detail.totalTemplate, { n: detalle.total })}
          </p>
          <p className="text-base text-ink/80">
            {interpolate(copy.habits.detail.last30Template, { n: detalle.ultimos30 })}
          </p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-base text-ink/80">{copy.habits.detail.gridLabel}</h2>
        <div className="mt-4 overflow-x-auto">
          <CuadriculaDias cuadricula={detalle.cuadricula} color={color} />
        </div>
      </div>

      {pausado && (
        <p className="mt-10 text-base leading-relaxed text-ink/80" aria-live="polite">
          {copy.habits.pause.confirm}
        </p>
      )}

      <Button
        variant={pausado ? 'primary' : 'secondary'}
        size="lg"
        fullWidth
        className="mt-10"
        onClick={pausado ? onReanudar : onPausar}
      >
        {pausado ? copy.habits.pause.resume : copy.habits.pause.action}
      </Button>
    </div>
  )
}
