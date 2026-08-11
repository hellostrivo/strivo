// src/components/lumia/EstadoSueno.jsx
// "¿Cómo te vas a dormir?" (§5.4.1).
//
// El subtítulo es la única defensa de esta pantalla contra la sensación de
// examen. No se acorta y no se reescribe.
//
// Nueve opciones en orden fijo, máximo dos, mínimo cero. "Algo más" abre en
// línea un campo de una sola palabra que se guarda tal cual, sin pasar por el
// helper de género (RN-GEN-06).

import { clsx } from 'clsx'
import { CampoLinea } from './Campo'
import { copy } from '@copy'
import { resolveGender } from '@copy/gender'
import { ID_OTRO, MAX_PALABRA, OPCIONES, alternarEstado, primeraPalabra } from '@/lumia/estadoSueno'

const textos = copy.lumia.diario.noche.sueno

export default function EstadoSueno({ seleccion = [], otro = '', genero, onCambiar }) {
  const tocar = (id) => {
    const { seleccion: siguiente } = alternarEstado(seleccion, id)
    onCambiar(siguiente, otro)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={textos.titulo}>
        {OPCIONES.map((opcion, indice) => {
          const elegida = seleccion.includes(opcion.id)
          const etiqueta = resolveGender(opcion.label, genero)
          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => tocar(opcion.id)}
              aria-pressed={elegida}
              aria-label={`${etiqueta}, ${indice + 1} de ${OPCIONES.length}`}
              className={clsx(
                'rounded-full border px-4 py-2 min-h-touch-sm text-base text-on-surface',
                'transition-all duration-180 ease-smooth motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                elegida
                  ? 'border-current bg-lumia-tarjeta shadow-elev-2'
                  : 'border-on-surface bg-lumia-campo',
                opcion.id === ID_OTRO && !elegida && 'border-dashed',
              )}
            >
              {etiqueta}
            </button>
          )
        })}
      </div>

      {seleccion.includes(ID_OTRO) && (
        <CampoLinea
          value={otro}
          maxLength={MAX_PALABRA}
          // El límite es duro en el campo, no solo al guardar (§5.4.1): los
          // espacios no crean una segunda palabra, y lo que se ve escrito es
          // exactamente lo que queda guardado.
          onChange={(evento) => onCambiar(seleccion, primeraPalabra(evento.target.value))}
          placeholder={textos.otro.placeholder}
          aria-label={textos.otro.label}
          className="max-w-xs"
        />
      )}
    </section>
  )
}
