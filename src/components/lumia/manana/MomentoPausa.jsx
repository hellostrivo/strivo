// src/components/lumia/manana/MomentoPausa.jsx
// La pausa opcional que cierra la mañana algunos días (§7).
//
// Va **después** de los tres momentos y fuera de la cuenta del indicador: no
// aparece siempre, y un total que cambia de un día para otro deja de orientar.
//
// Lleva su etiqueta de "Opcional" a la vista y una salida propia. Lo que se
// escriba aquí **no es una afirmación positiva** y no se llama así en ningún
// sitio: cabe el ánimo, el permiso, la perspectiva o el trato amable, sin
// ninguna obligación de sonar optimista.

import { clsx } from 'clsx'
import { CampoTexto } from '../Campo'
import { copy } from '@copy'
import { MAX_REFLEXION } from '@/lumia/manana'

const textos = copy.lumia.diario.manana.reflexion

export default function MomentoPausa({ pregunta, valor, onCambiar, onVolcar, onOmitir }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-on-surface-soft">{textos.opcional}</p>
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-on-surface bg-lumia-campo p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base text-on-surface">{pregunta.titulo}</h3>
          <p className="text-sm text-on-surface-soft">{pregunta.lead}</p>
        </div>

        <CampoTexto
          filas={3}
          value={valor}
          maxLength={MAX_REFLEXION}
          onChange={(evento) => onCambiar(evento.target.value)}
          onBlur={onVolcar}
          aria-label={pregunta.titulo}
        />
      </div>

      <button
        type="button"
        onClick={onOmitir}
        className={clsx(
          'self-start rounded-full px-3 py-2 min-h-touch-sm text-sm',
          'text-on-surface-soft hover:text-on-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
        )}
      >
        {textos.omitir}
      </button>
    </section>
  )
}
