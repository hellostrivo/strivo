// src/components/formia/SelectorIdentidad.jsx
// El campo que hace real el Principio 2 de Formia: ningún hábito existe sin una
// identidad que lo sostenga (§C0.3, §C3.6).
//
// Sus opciones son, en este orden: **la identidad central** —siempre presente y
// siempre válida, porque RN-ID-01 garantiza que existe— y **cada área
// seleccionada**. No existe "General", ni "Otra", ni "Sin área" (§C3.6).
//
// La central se presenta con el texto de la propia identidad ("Alguien que
// crece"), nunca con la etiqueta técnica.
//
// RN-FO-H3-05 — No hay preselección automática, ni siquiera de la central.
// RN-FO-H3-07 — Cambiar de identidad cuesta un toque y no genera ningún
// mensaje de confirmación ni de error.

import { clsx } from 'clsx'
import { copy } from '@copy'
import { IDENTITY_CENTRAL } from '@/lib/db'
import { areasEnMarcha } from '@/formia/identidad'
import { capitalizar } from '@/formia/habitos'
import AreaIcon from './AreaIcon'

const textos = copy.formia.habitos.editor.identidad
const nombres = copy.formia.identidad.areas.names

export default function SelectorIdentidad({ central, areas, valor, sugerida, onElegir }) {
  const opciones = [
    { id: IDENTITY_CENTRAL, nombre: capitalizar(central ?? ''), color: null },
    ...areasEnMarcha(areas).map((area) => ({
      id: area.id,
      nombre: nombres[area.id],
      color: area.color,
    })),
  ]

  // La sugerencia solo se enseña mientras el campo está sin resolver: una vez
  // elegida la identidad, insistir sería ruido (RN-FO-H3-04).
  const mostrarSugerencia = sugerida !== null && sugerida !== undefined && valor === null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-ink">{textos.label}</p>

      <ul className="flex flex-wrap gap-2">
        {opciones.map((opcion) => {
          const elegida = valor === opcion.id
          const esSugerida = mostrarSugerencia && sugerida === opcion.id
          return (
            <li key={opcion.id}>
              <button
                type="button"
                onClick={() => onElegir(opcion.id)}
                aria-pressed={elegida}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border',
                  'px-4 py-2 min-h-touch-sm text-base font-medium text-left',
                  'transition-colors duration-260 ease-smooth',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                  'motion-reduce:transition-none',
                  elegida ? 'border-ink bg-surface text-ink' : 'border-border bg-paper text-ink',
                  // Chip tenue de la sugerencia: se distingue sin gritar, y
                  // sobre todo sin quedar seleccionado por su cuenta.
                  esSugerida && 'border-dashed border-ink/50 bg-surface',
                )}
                style={elegida && opcion.color ? { borderColor: opcion.color } : undefined}
              >
                {opcion.color ? (
                  <span
                    className="flex items-center justify-center w-6 h-6 rounded-full text-ink"
                    style={{ backgroundColor: opcion.color }}
                  >
                    <AreaIcon areaId={opcion.id} className="w-4 h-4" />
                  </span>
                ) : (
                  <span
                    className="w-6 h-6 rounded-full ring-1 ring-inset ring-ink/20"
                    aria-hidden="true"
                  />
                )}
                {opcion.nombre}
              </button>
            </li>
          )
        })}
      </ul>

      {mostrarSugerencia && <p className="text-sm text-ink/80">{textos.suggested}</p>}
    </div>
  )
}
