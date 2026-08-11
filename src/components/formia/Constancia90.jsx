// src/components/formia/Constancia90.jsx
// Las dos visualizaciones de constancia de §5.7: la línea de 14 días de cada
// fila de H1 y la cuadrícula de 90 días del detalle.
//
// RN-HB-04 — Nunca rojo, nunca calaveras, nunca metáforas de deterioro.
// RN-HB-05 — Un día sin marca no es un fallo: es un día sin marca. No lleva
// color de alerta, ni contador, ni nada que lo señale.
//
// Accesibilidad (§5.7): la información va por **forma y posición**, no solo por
// color — círculo lleno frente a círculo de contorno—, así que se lee igual con
// deuteranopía y protanopía. Las celdas son decorativas para el lector de
// pantalla; el resumen en texto es lo que se anuncia.

import { clsx } from 'clsx'

const HECHO = '#7E9E86' // sage: hábitos, constancia, crecimiento (§6.3.2)

// El día hecho va relleno; el que no, en contorno. La diferencia es de forma,
// así que sobrevive a cualquier daltonismo. El contorno se mantiene tenue a
// propósito (§5.7 pide tonos tenues): lo que informa son los días llenos —que
// contrastan de sobra— y el resumen en texto que acompaña a cada visualización.
function Celda({ hecha, tamano }) {
  return (
    <span
      className={clsx('rounded-full', hecha ? '' : 'ring-1 ring-inset ring-ink/40')}
      style={{
        width: tamano,
        height: tamano,
        backgroundColor: hecha ? HECHO : 'transparent',
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Línea de puntos de los últimos días, para cada fila de H1.
 *
 * @param {string[]} fechas - De la más antigua a hoy.
 * @param {Set<string>} hechas
 * @param {string} resumen - Texto que sí se anuncia.
 */
export function PuntosDias({ fechas, hechas, resumen }) {
  return (
    <span className="flex items-center gap-1" role="img" aria-label={resumen}>
      {fechas.map((fecha) => (
        <Celda key={fecha} hecha={hechas.has(fecha)} tamano={6} />
      ))}
    </span>
  )
}

/**
 * Cuadrícula de los últimos 90 días, en tonos tenues. La posición de cada
 * celda es su fecha: la esquina inferior derecha es hoy.
 */
export default function Constancia90({ fechas, hechas, resumen }) {
  return (
    <div
      className="grid gap-1 justify-start"
      style={{ gridTemplateColumns: 'repeat(15, 12px)' }}
      role="img"
      aria-label={resumen}
    >
      {fechas.map((fecha) => (
        <Celda key={fecha} hecha={hechas.has(fecha)} tamano={12} />
      ))}
    </div>
  )
}
