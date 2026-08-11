// src/components/lumia/ChipsEmociones.jsx
// "¿Cómo me quiero sentir hoy?" — quince emociones, todas positivas (§5.3, B3).
//
// Chips tipo píldora con emoji, máximo tres. El emoji no es voz de la app: es
// vocabulario de quien elige cómo quiere sentirse (§3.6.2, punto 5).
//
// La cuarta selección entra y la primera sale. No hay error, no hay bloqueo:
// solo una nota discreta que dice que tres es un buen número.

import { clsx } from 'clsx'
import { copy } from '@copy'
import { CATALOGO, alternarEmocion } from '@/lumia/emociones'
import { resolveGender } from '@copy/gender'

const textos = copy.lumia.diario.manana.emociones

export default function ChipsEmociones({ seleccion = [], genero, onCambiar, onDesplazada, aviso }) {
  const tocar = (id) => {
    const { seleccion: siguiente, desplazada } = alternarEmocion(seleccion, id)
    onCambiar(siguiente)
    if (desplazada) onDesplazada?.(desplazada)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={textos.titulo}>
        {CATALOGO.map((emocion, indice) => {
          const elegida = seleccion.includes(emocion.id)
          const etiqueta = resolveGender(emocion.label, genero)
          return (
            <button
              key={emocion.id}
              type="button"
              onClick={() => tocar(emocion.id)}
              aria-pressed={elegida}
              aria-label={`${etiqueta}, ${indice + 1} de ${CATALOGO.length}`}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2',
                'min-h-touch-sm text-base text-on-surface',
                'transition-all duration-180 ease-smooth motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                elegida
                  ? 'border-current bg-lumia-tarjeta shadow-elev-2'
                  : 'border-on-surface bg-lumia-campo',
              )}
            >
              <span aria-hidden="true">{emocion.emoji}</span>
              <span>{etiqueta}</span>
            </button>
          )
        })}
      </div>

      {aviso && (
        <p className="text-sm text-on-surface-soft" role="status">
          {textos.max}
        </p>
      )}
    </div>
  )
}
