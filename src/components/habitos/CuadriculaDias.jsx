// src/components/habitos/CuadriculaDias.jsx
// Cuadrícula de 90 días del detalle de un hábito (§5.7, H2).
//
// Un día hecho se pinta con el color del área; uno sin marca se queda en el
// gris más claro de la paleta. Nunca en rojo y nunca con un aspa: la ausencia
// de marca es ausencia, no un fallo (§7.2, RN-05).
//
// Para lector de pantalla la cuadrícula es una lista de días con su estado, no
// un dibujo: cada celda dice su fecha y si hubo registro.

import { copy, interpolate } from '@copy'

const SIN_MARCA = '#EDE7DC'   // surface.muted

export default function CuadriculaDias({ cuadricula, color = '#7E9E86' }) {
  return (
    <div
      role="list"
      aria-label={copy.habits.detail.gridLabel}
      className="grid grid-flow-col grid-rows-7 gap-1 justify-start"
    >
      {cuadricula.map(dia => (
        <span
          key={dia.fecha}
          role="listitem"
          aria-label={interpolate(
            dia.hecho
              ? copy.habits.detail.gridDoneTemplate
              : copy.habits.detail.gridEmptyTemplate,
            { fecha: dia.fecha }
          )}
          className="w-3 h-3 rounded-[3px]"
          style={{ backgroundColor: dia.hecho ? color : SIN_MARCA }}
        />
      ))}
    </div>
  )
}
