// src/pages/formia/HabitoDetalle.jsx
// H2 — detalle de un hábito y su constancia (§5.7).
//
// Muestra **el nombre del área, no la frase de identidad de área**. §5.7.4
// resuelve esa contradicción de forma expresa: pegar "alguien que cuida su
// cuerpo" debajo de "Dormir a tiempo" afirma una equivalencia que casi siempre
// es falsa y suena a plantilla. La frase vive en el espacio de identidad.
//
// RN-HB-04 / RN-HB-05 — Nunca rojo, nunca huecos acusatorios, nunca porcentaje
// de incumplimiento. Los días sin marca no se cuentan ni se nombran.

import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Constancia90 from '@components/formia/Constancia90'
import { copy, interpolate } from '@copy'
import { areaLabelForHabit } from '@/lib/habitAreaLabel'
import { capitalizar, constanciaDe, fechasDe, ultimasFechas, ultimosNDias } from '@/formia/habitos'

const textos = copy.formia.habitos
const detalle = textos.detalle

/** "Lo has hecho 47 veces" — siempre en positivo, siempre lo que sí pasó. */
function textoTotal(total) {
  if (total === 0) return detalle.totalNinguna
  if (total === 1) return detalle.totalUna
  return interpolate(detalle.totalTemplate, { n: total })
}

export default function HabitoDetalle({
  habito,
  areas,
  central,
  logs,
  hoy,
  onEditar,
  onCambiarEstado,
  onVolver,
}) {
  const etiqueta = areaLabelForHabit(habito, areas)
  const momento = habito.context ? textos.momento[habito.context] : textos.momento.ninguno
  const estado = habito.state ?? 'activo'

  const hechas = fechasDe(logs, habito.id)
  const total = constanciaDe(logs, habito.id)
  const fechas90 = ultimasFechas(90, hoy)
  const ultimos30 = ultimosNDias(logs, habito.id, hoy, 30)

  // Un hábito colgado de la central no lleva etiqueta de área (§5.7.4), pero
  // en el detalle sí cabe decir de quién es: aquí hay sitio y contexto.
  const identidad = etiqueta ? etiqueta.nombre : capitalizar(central ?? '')

  return (
    <main className="min-h-screen bg-paper px-5 py-8 flex flex-col gap-8">
      <div>
        <Button size="sm" variant="ghost" onClick={onVolver}>
          {textos.back}
        </Button>
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {habito.emoji && (
            <span className="text-lg" aria-hidden="true">
              {habito.emoji}
            </span>
          )}
          <h1 className="font-display text-lg text-ink">{habito.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-ink/80">
          {etiqueta && (
            <span
              className="w-2 h-2 rounded-full ring-1 ring-inset ring-ink/10"
              style={{ backgroundColor: etiqueta.color }}
              aria-hidden="true"
            />
          )}
          <span>{identidad}</span>
          <span aria-hidden="true">·</span>
          <span>{momento}</span>
          {estado !== 'activo' && (
            <span className="rounded-full bg-surface-muted px-3 py-1">
              {estado === 'pausado' ? detalle.pausedLabel : detalle.archivedLabel}
            </span>
          )}
        </div>
      </header>

      <Card className="flex flex-col gap-4">
        <p className="font-display text-md text-ink">{textoTotal(total)}</p>
        <p className="text-sm text-ink/80">
          {interpolate(detalle.diasTemplate, { n: ultimos30, total: 30 })}
        </p>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-ink/80">{detalle.gridTitle}</h2>
        <Constancia90
          fechas={fechas90}
          hechas={hechas}
          resumen={interpolate(detalle.diasTemplate, {
            n: fechas90.filter((fecha) => hechas.has(fecha)).length,
            total: 90,
          })}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button size="sm" variant="secondary" onClick={() => onEditar(habito.id)}>
          {detalle.edit}
        </Button>
        {estado === 'activo' ? (
          <Button size="sm" variant="ghost" onClick={() => onCambiarEstado(habito.id, 'pausado')}>
            {detalle.pause}
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => onCambiarEstado(habito.id, 'activo')}>
            {detalle.resume}
          </Button>
        )}
        {estado !== 'archivado' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCambiarEstado(habito.id, 'archivado')}
          >
            {detalle.archive}
          </Button>
        )}
      </div>

      {/* Pausar y archivar no pierden nada, y se dice al pasar. */}
      {estado === 'pausado' && <p className="text-sm text-ink/80">{detalle.paused}</p>}
      {estado === 'archivado' && <p className="text-sm text-ink/80">{detalle.archived}</p>}
    </main>
  )
}
