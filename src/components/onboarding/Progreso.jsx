// src/components/onboarding/Progreso.jsx
// "Paso {n} de 8", y ocho puntos.
//
// **Cuenta pasos, no campos.** Dice dónde estás, no cuánto te falta por
// rellenar: en un recorrido donde todo se puede dejar en blanco, un contador de
// campos convertiría una respuesta omitida en un hueco.
//
// **En el sub-paso no se pinta nada.** `indicadorDe` devuelve `null` para P2A y
// aquí eso es no dibujar: repetir el número del paso anterior le daría al
// sub-paso un sitio en la cuenta que no tiene. Es lo mismo que hace la mañana
// mientras dura su pausa opcional.
//
// No es `IndicadorPasos` del diario, aunque se le parezca: aquel cuenta los tres
// momentos de un recorrido del día y recibe el copy de cuál. Este cuenta ocho
// pasos que solo existen una vez. Compartirlos obligaría a uno de los dos a
// llevar el vocabulario del otro.

import { clsx } from 'clsx'
import { interpolate } from '@copy'
import { indicadorDe } from '@/onboarding/pasos'

export default function Progreso({ textos, paso }) {
  const indicador = indicadorDe(paso)
  if (!indicador) return null

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-on-surface-soft" role="status">
        {interpolate(textos.progressTemplate, indicador)}
      </p>
      <span aria-hidden="true" className="flex items-center gap-1.5">
        {Array.from({ length: indicador.total }, (_, posicion) => (
          <span
            key={posicion}
            className={clsx(
              'h-1.5 w-1.5 rounded-full bg-current',
              'transition-opacity duration-260 ease-smooth motion-reduce:transition-none',
              posicion === indicador.n - 1 ? 'opacity-70' : 'opacity-25',
            )}
          />
        ))}
      </span>
    </div>
  )
}
