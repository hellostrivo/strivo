// src/components/lumia/SelectorMomento.jsx
// El conmutador "Mañana" ↔ "Noche" (§5.2.1).
//
// Es el **único** origen del tema de la pantalla Hoy (RN-HOY-05). Ni la hora
// del sistema, ni la hora de despertar, ni el modo del sistema operativo lo
// cambian. La hora solo decide con cuál se abre la pantalla; a partir de ahí
// manda quien está mirando.
//
// RN-HOY-08 — Las dos secciones están disponibles a cualquier hora, sin
// advertencias. "Todavía no es de noche" no existe como mensaje.
//
// La selección responde al toque de inmediato: no espera a que termine el
// cruce de 320 ms del fondo.

import { clsx } from 'clsx'
import { copy } from '@copy'

const textos = copy.lumia.hoy.momento

export const MOMENTOS = Object.freeze(['manana', 'noche'])

export default function SelectorMomento({ momento, onCambiar }) {
  return (
    <div
      role="group"
      aria-label={textos.label}
      className="inline-flex gap-1 rounded-full border border-on-surface bg-lumia-campo p-1"
    >
      {MOMENTOS.map((id) => {
        const activo = momento === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onCambiar(id)}
            aria-pressed={activo}
            className={clsx(
              'rounded-full px-5 py-2 min-h-touch-sm text-base font-medium',
              'text-on-surface transition-colors duration-120 ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
              'motion-reduce:transition-none',
              activo ? 'bg-lumia-tarjeta' : 'opacity-70',
            )}
          >
            {textos[id]}
          </button>
        )
      })}
    </div>
  )
}
