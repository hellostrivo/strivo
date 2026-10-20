// src/components/presentacion/Puntos.jsx
// Los cuatro puntos de la presentación: dónde estás y cómo ir a otra tarjeta.
//
// **Se pueden tocar, así que son botones de verdad.** Un punto que solo dijera
// dónde estás sería decoración y podría ir oculto al lector de pantalla, como
// los del onboarding; estos llevan a un sitio, y lo que lleva a un sitio se
// anuncia y se alcanza con el teclado.
//
// **El punto activo no se distingue solo por color** (§10, criterio 7): es más
// ancho —una barra corta en vez de un punto— y va a plena opacidad. Quien no
// separe bien los tonos lee la forma, que es lo que no se puede confundir.
//
// **No hay número a la vista.** Contar tarjetas no es lo que se viene a hacer
// aquí, y un "2 de 4" en pantalla convertiría cuatro frases en un trámite con
// pasos. El número está entero en la etiqueta que oye un lector de pantalla,
// que es quien lo necesita para saber dónde está.
//
// El área de toque es la del dedo y no la del punto: 56 × 48, muy por encima
// del punto de 6 px que se ve.

import { clsx } from 'clsx'
import { interpolate } from '@copy'

export default function Puntos({ textos, tarjetas, activa, titulosPorId, onIr }) {
  return (
    <div
      role="group"
      aria-label={textos.puntosLabel}
      className="flex items-center justify-center text-on-surface"
    >
      {tarjetas.map((id, posicion) => {
        const esActiva = posicion === activa
        return (
          <button
            key={id}
            type="button"
            onClick={() => onIr(posicion)}
            aria-current={esActiva ? 'true' : undefined}
            aria-label={`${titulosPorId[id]} · ${interpolate(textos.posicionTemplate, {
              n: posicion + 1,
              total: tarjetas.length,
            })}`}
            className={clsx(
              'flex min-h-touch-sm min-w-touch items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40',
              'rounded-full',
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
                'h-1.5 rounded-full bg-current',
                'transition-all duration-260 ease-smooth motion-reduce:transition-none',
                esActiva ? 'w-6 opacity-85' : 'w-1.5 opacity-35',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
