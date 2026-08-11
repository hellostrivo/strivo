// src/components/formia/EvidenciaIdentidad.jsx
// El insight de evidencia de identidad (§C4.3, §C7.4).
//
// Es el único de Strivo Intelligence que entra en Fase 1, y entra porque **solo
// lee `formia/`**: no cruza espacios, no correlaciona con el ánimo y no necesita
// la capa cruzada, que se especifica ahora y se construye en Fase 2.
//
// Se genera por reglas (§C4.2). Sin llamada externa, sin coste, sin latencia y
// sin consentimiento que pedir (RN-SI-05).
//
// RN-SI-03 — Todo insight debe poder citar su evidencia. Los días que sostienen
// la frase están aquí y se pueden ver; no es un número que haya que creerse.
//
// RN-SI-04 / RN-ID-05 — La evidencia confirma, nunca acusa. La frase dice lo
// que sí pasó y no menciona lo que no: los días sin marca no aparecen, ni
// contados, ni en porcentaje, ni de refilón.

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import Card from '@components/ui/Card'
import { copy, interpolate } from '@copy'

const textos = copy.formia.progreso.evidencia

function fechaCorta(iso) {
  try {
    return format(parseISO(iso), "d 'de' MMM", { locale: es })
  } catch {
    return iso
  }
}

/**
 * @param {object} evidencia - `{ dias, ventana, fechas }`, ya filtrada por
 *   umbral. Si no hay bastante para que la frase sea verdad, quien llama no
 *   monta este componente: no existe una versión a medias.
 * @param {string} identidad - El texto de la identidad central.
 * @param {string} [area] - Nombre del área, si la evidencia es de un área.
 */
export default function EvidenciaIdentidad({ evidencia, identidad, area = null }) {
  const [verDias, setVerDias] = useState(false)

  const frase = area
    ? interpolate(textos.areaTemplate, {
        identidad,
        area,
        n: evidencia.dias,
        total: evidencia.ventana,
      })
    : interpolate(textos.centralTemplate, {
        identidad,
        n: evidencia.dias,
        total: evidencia.ventana,
      })

  return (
    <Card elevated className="flex flex-col gap-3">
      {/* Frases antes que gráficas (§5.9): lo primero que se lee es lo que
          significa, no un dibujo que haya que interpretar. */}
      <p className="font-display text-md text-ink leading-snug">{frase}</p>

      <div>
        <button
          type="button"
          onClick={() => setVerDias((abierto) => !abierto)}
          aria-expanded={verDias}
          className="text-sm text-ink/80 underline underline-offset-4 min-h-touch-sm px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        >
          {verDias ? textos.ocultar : textos.ver}
        </button>
      </div>

      {verDias && (
        <ul className="flex flex-wrap gap-2">
          {evidencia.fechas.map((fecha) => (
            <li
              key={fecha}
              className="rounded-full bg-surface-subtle px-3 py-1 text-sm text-ink/80"
            >
              {fechaCorta(fecha)}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
