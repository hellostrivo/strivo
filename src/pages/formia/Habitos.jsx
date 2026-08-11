// src/pages/formia/Habitos.jsx
// H1 — la lista de hábitos, **agrupada por identidad** (SPEC_04 §4).
//
// Ese es el cambio conceptual respecto de Fase 0: la lista se ordenaba por
// mañana y noche porque servía a un ritual. Ahora se ordena por quién estás
// construyendo, y el momento del día sobrevive como etiqueta de cada fila y
// como la barra de progreso de arriba — nada más (§C3.5).
//
// RN-FO-HAB-01 — Ninguna superficie de Formia presenta los hábitos del día como
// una secuencia con principio y fin. No hay botón que "complete" el conjunto,
// no hay mensaje de cierre y la palabra "ritual" no aparece.
//
// Esta pantalla es dueña del estado y enseña el detalle y el editor como vistas
// suyas. Por eso marcar en el detalle se ve en la lista al instante (RN-01), y
// por eso no invento navegación antes de SPEC_11.

import { useState } from 'react'
import Button from '@components/ui/Button'
import HabitoItem from '@components/formia/HabitoItem'
import { copy, interpolate } from '@copy'
import {
  agruparPorIdentidad,
  fechasDe,
  habitosPorEstado,
  marcadosEn,
  progresoPorMomento,
  ultimasFechas,
} from '@/formia/habitos'
import { useHabitos } from '@/formia/useHabitos'
import HabitoDetalle from './HabitoDetalle'
import HabitoNuevo from './HabitoNuevo'

const textos = copy.formia.habitos
const nombresDeArea = copy.formia.identidad.areas.names

const COMPLETO = { manana: textos.progreso.completoManana, noche: textos.progreso.completoNoche }

export default function Habitos({ uid }) {
  const { estado, carga, error, acciones, reintentar } = useHabitos(uid)
  const [vista, setVista] = useState({ nombre: 'lista', habitId: null })

  if (carga === 'cargando') {
    return <main className="min-h-screen bg-paper px-5 py-8" aria-busy="true" />
  }

  if (carga === 'error') {
    return (
      <main className="min-h-screen bg-paper px-5 py-8 flex flex-col gap-4">
        <p className="text-base text-ink">{textos.error.load.body}</p>
        <div>
          <Button size="sm" onClick={reintentar}>
            {textos.error.load.retry}
          </Button>
        </div>
      </main>
    )
  }

  const { habits, logs, areas, central, hoy } = estado
  const enEdicion = habits.find((habito) => habito.id === vista.habitId) ?? null
  const volver = () => setVista({ nombre: 'lista', habitId: null })

  if (vista.nombre === 'nuevo' || (vista.nombre === 'editar' && enEdicion)) {
    return (
      <HabitoNuevo
        central={central}
        areas={areas}
        habito={vista.nombre === 'editar' ? enEdicion : null}
        onGuardar={async (datos) => {
          if (vista.nombre === 'editar') await acciones.actualizar(enEdicion.id, datos)
          else await acciones.crear(datos)
          volver()
        }}
        onCancelar={volver}
      />
    )
  }

  if (vista.nombre === 'detalle' && enEdicion) {
    return (
      <HabitoDetalle
        habito={enEdicion}
        areas={areas}
        central={central}
        logs={logs}
        hoy={hoy}
        onEditar={(habitId) => setVista({ nombre: 'editar', habitId })}
        onCambiarEstado={acciones.cambiarEstado}
        onVolver={volver}
      />
    )
  }

  const marcados = marcadosEn(logs, hoy)
  const grupos = agruparPorIdentidad(habits, areas, central)
  const momentos = progresoPorMomento(habits, marcados)
  const fechas14 = ultimasFechas(14, hoy)

  return (
    <main className="min-h-screen bg-paper px-5 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-ink">{textos.title}</h1>
        <p className="text-base text-ink/80">{textos.lead}</p>
      </header>

      {/* Barra que se llena, en su nivel más bajo de confirmación
          (RN-FO-HAB-02). Es una lectura del día, no una meta que cumplir. */}
      {momentos.length > 0 && (
        <ul className="flex flex-col gap-4">
          {momentos.map((momento) => {
            const completo = momento.hechos === momento.total
            return (
              <li key={momento.context} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-ink">
                    {textos.momento[momento.context]}
                  </span>
                  <span className="text-sm text-ink/80">
                    {interpolate(textos.progreso.template, {
                      hecho: momento.hechos,
                      total: momento.total,
                    })}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sage transition-all duration-420 ease-smooth motion-reduce:transition-none"
                    style={{ width: `${(momento.hechos / momento.total) * 100}%` }}
                  />
                </div>
                {completo && (
                  <p className="text-sm text-ink/80" role="status">
                    {COMPLETO[momento.context]}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {grupos.length === 0 ? (
        // Invitación, no vacío acusatorio.
        <p className="text-base text-ink/80">{textos.empty}</p>
      ) : (
        grupos.map((grupo) => (
          <section key={grupo.key} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {grupo.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-inset ring-ink/10"
                  style={{ backgroundColor: grupo.color }}
                  aria-hidden="true"
                />
              )}
              <h2 className="text-sm font-medium text-ink">
                {grupo.tipo === 'area'
                  ? nombresDeArea[grupo.areaId]
                  : grupo.tipo === 'revision'
                    ? textos.grupo.revisionTitle
                    : grupo.titulo}
              </h2>
              {/* RN-ID-05 — Un área que ya no está elegida se nombra en neutro.
                  No hay nada que arreglar y no se sugiere que lo haya. */}
              {grupo.tipo === 'area' && !grupo.activa && (
                <span className="text-sm text-ink/80">{textos.grupo.inactiva}</span>
              )}
            </div>

            {grupo.tipo === 'revision' && (
              <p className="text-sm text-ink/80">{textos.grupo.revisionBody}</p>
            )}

            <ul className="flex flex-col divide-y divide-border-subtle">
              {grupo.habitos.map((habito) => (
                <HabitoItem
                  key={habito.id}
                  habito={habito}
                  areas={areas}
                  marcado={marcados.has(habito.id)}
                  fechas={fechas14}
                  hechas={fechasDe(logs, habito.id)}
                  onMarcar={acciones.alternarMarca}
                  onAbrir={(habitId) => setVista({ nombre: 'detalle', habitId })}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      {/* RN-HB-02 — Pausados y archivados salen de la lista activa, no de los
          datos. Se llega a ellos desde aquí, con toda su historia intacta. */}
      {[
        { estado: 'pausado', titulo: textos.grupo.pausadosTitle },
        { estado: 'archivado', titulo: textos.grupo.archivadosTitle },
      ].map(({ estado: cual, titulo }) => {
        const guardados = habitosPorEstado(habits, cual)
        if (guardados.length === 0) return null
        return (
          <section key={cual} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-ink/80">{titulo}</h2>
            <ul className="flex flex-col divide-y divide-border-subtle">
              {guardados.map((habito) => (
                <li key={habito.id}>
                  <button
                    type="button"
                    onClick={() => setVista({ nombre: 'detalle', habitId: habito.id })}
                    className="w-full text-left text-base text-ink px-2 py-3 min-h-touch-sm rounded-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                  >
                    {habito.emoji && <span aria-hidden="true">{habito.emoji} </span>}
                    {habito.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <div>
        <Button size="sm" onClick={() => setVista({ nombre: 'nuevo', habitId: null })}>
          {textos.add}
        </Button>
      </div>

      {error && (
        <p className="flex flex-wrap items-center gap-3 text-sm text-ink/80" role="status">
          {textos.error.save.body}
          <Button size="sm" variant="ghost" onClick={error.reintentar}>
            {textos.error.save.retry}
          </Button>
        </p>
      )}
    </main>
  )
}
