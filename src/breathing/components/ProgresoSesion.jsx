// src/breathing/components/ProgresoSesion.jsx
// Cuánto llevas, dicho lo más bajo posible (RN-RE-NAV-25 y 26).
//
// **En `cerrando` no cambia nada** (RN-RE-NAV-26). Es la misma decisión que
// gobierna la visual en SPEC_14: saber que esta es la última respiración cambia
// cómo se respira, casi siempre a peor. Así que el indicador no tiene ni una
// rama que distinga `cerrando` de `activo`.
//
// Opacidad 0,40 y 14 px: está para consultarlo si se busca, no para leerlo sin
// querer. Lo que domina es la visual (RN-RE-NAV-21).

import { copy, interpolate } from '@copy'
import { reloj } from '../lib/formato.js'

export default function ProgresoSesion({ duracion, ciclosCompletados, ms }) {
  const textos = copy.respiracion.sesion
  const transcurrido = reloj(ms / 1000)

  if (duracion?.modo === 'ciclos') {
    return (
      <p className="respiracion-progreso" aria-live="off">
        <span className="sr-only">
          {interpolate(textos.progresoCiclos, {
            completados: ciclosCompletados,
            total: duracion.valor,
          })}
        </span>
        <span aria-hidden="true" className="flex items-center gap-1">
          {Array.from({ length: duracion.valor }, (_, i) => (
            <span
              key={i}
              data-lleno={i < ciclosCompletados ? 'si' : 'no'}
              className="respiracion-punto"
            />
          ))}
        </span>
      </p>
    )
  }

  return (
    <p className="respiracion-progreso" aria-live="off">
      {interpolate(textos.progresoAbierta, { tiempo: transcurrido })}
    </p>
  )
}
