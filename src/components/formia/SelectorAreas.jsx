// src/components/formia/SelectorAreas.jsx
// Elegir y quitar áreas, con el tope de tres (SPEC_03 §6).
//
// El tope se explica, no se reprende: al tocar una cuarta no pasa nada malo,
// aparece el porqué y el chip sigue ahí para cuando haya sitio. Ni error, ni
// chip apagado sin explicación, ni aviso rojo.
//
// Quitar un área desde aquí solo la deja de mostrar: sus hábitos, su identidad
// de área y su historial siguen intactos (RN-04, RN-DB4-08).

import { clsx } from 'clsx'
import { copy } from '@copy'
import { listarAreas } from '@/formia/identidad'
import AreaIcon from './AreaIcon'

const textos = copy.formia.identidad.areas

export default function SelectorAreas({ areas, aviso, onElegir, onQuitar }) {
  const catalogo = listarAreas(areas)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium text-ink">{textos.pickerTitle}</h3>
        <p className="text-sm text-ink/80">{textos.pickerLead}</p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {catalogo.map((area) => {
          const elegida = area.selected === true
          return (
            <li key={area.id}>
              <button
                type="button"
                onClick={() => (elegida ? onQuitar(area.id) : onElegir(area.id))}
                aria-pressed={elegida}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border',
                  'px-4 py-2 min-h-touch-sm text-base font-medium',
                  'transition-colors duration-260 ease-smooth',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                  'motion-reduce:transition-none',
                  // Con el tope alcanzado el chip no se apaga ni se deshabilita:
                  // sigue tocable, igual de legible, y al tocarlo se explica.
                  elegida
                    ? 'border-ink/30 bg-surface text-ink'
                    : 'border-border bg-paper text-ink/80 hover:bg-surface',
                )}
                style={elegida ? { borderColor: area.color } : undefined}
              >
                <span
                  className={clsx(
                    'flex items-center justify-center w-6 h-6 rounded-full text-ink',
                    !elegida && 'ring-1 ring-inset ring-ink/10',
                  )}
                  style={{ backgroundColor: elegida ? area.color : `${area.color}59` }}
                >
                  <AreaIcon areaId={area.id} className="w-4 h-4" />
                </span>
                {textos.names[area.id]}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Tope de 3: se cuenta cuando alguien lo toca, no antes. */}
      <p role="status" aria-live="polite" className="min-h-[1.5rem] text-sm text-ink/80">
        {aviso === 'tope' ? textos.max : ''}
      </p>
    </div>
  )
}
