// src/components/diario/SelectorMomento.jsx
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
//
// **El bloque va en contratono** (`--lumia-conmutador`): oscuro sobre la mañana
// clara, claro sobre la noche. No compite con la tarjeta del ritual porque no
// juega en la misma escala —la tarjeta destaca por luminancia sobre el fondo
// (RN-HOY-07) y el conmutador por inversión—, y es lo que hace que el primer
// elemento interactivo de la pantalla se encuentre sin buscarlo.
//
// Al ser una superficie propia, **declara su `data-surface`** en vez de heredar
// la de la pantalla: dentro del bloque el texto se invierte solo, sin que este
// componente nombre ni un color (RN-SURF-01). Los dos pares pasan AAA: 14,9:1
// de día y 12,4:1 de noche.

import { clsx } from 'clsx'
import { copy } from '@copy'

const textos = copy.diario.hoy.momento

export const MOMENTOS = Object.freeze(['manana', 'noche'])

export default function SelectorMomento({ momento, onCambiar }) {
  return (
    <div
      role="group"
      aria-label={textos.label}
      data-surface={momento === 'manana' ? 'dark' : 'light'}
      // `self-start` para que se ciña a sus dos botones: el héroe es una
      // columna flex y sin él un `inline-flex` se estira al ancho de la
      // columna, que dejaría el contratono como una franja de borde a borde.
      className="self-start inline-flex gap-1 rounded-full bg-lumia-conmutador p-1 transicion-tema"
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
              activo ? 'bg-lumia-conmutador-activo' : 'opacity-70',
            )}
          >
            {textos[id]}
          </button>
        )
      })}
    </div>
  )
}
