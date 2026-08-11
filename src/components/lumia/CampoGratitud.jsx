// src/components/lumia/CampoGratitud.jsx
// Agradecimientos, con su sistema de sugerencias (§5.3, Bloque 2).
//
// **La app nunca escribe por ti.** Es la regla dura del bloque: tocar una idea
// no rellena el campo, abre una pregunta detonante. Lo que se escriba después
// lo escribe la persona.
//
// Las sugerencias aparecen tras 5 s sin escribir y solo si el campo está vacío
// (SPEC_06 §4.2, criterio 7 — §5.3 decía 6 s). Se van al primer carácter. Si se
// descartan dos veces, no vuelven en toda la sesión.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import FilasDinamicas from './FilasDinamicas'

/** Segundos de quietud antes de ofrecer una idea. */
export const RETRASO_SUGERENCIAS = 5000

/** Descartes tras los que no se vuelven a ofrecer en esta sesión. */
const DESCARTES_MAXIMOS = 2

export default function CampoGratitud({
  filas,
  limites,
  onCambiar,
  onVolcar,
  sugerencias,
  etiqueta,
  ayudas,
  placeholder,
}) {
  const [visibles, setVisibles] = useState(false)
  const [pregunta, setPregunta] = useState(null)
  const [descartes, setDescartes] = useState(0)
  const temporizador = useRef(null)

  const vacio = filas.every((fila) => fila.texto.trim() === '')
  const silenciadas = descartes >= DESCARTES_MAXIMOS

  useEffect(() => {
    if (temporizador.current) clearTimeout(temporizador.current)
    if (!vacio || silenciadas) {
      setVisibles(false)
      setPregunta(null)
      return undefined
    }
    temporizador.current = setTimeout(() => setVisibles(true), RETRASO_SUGERENCIAS)
    return () => clearTimeout(temporizador.current)
    // `filas` en las dependencias es deliberado: cada tecla reinicia la espera.
  }, [filas, vacio, silenciadas])

  const descartar = () => {
    setDescartes((previos) => previos + 1)
    setVisibles(false)
    setPregunta(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <FilasDinamicas
        filas={filas}
        limites={limites}
        onCambiar={onCambiar}
        onVolcar={onVolcar}
        placeholder={placeholder}
        ayudas={ayudas}
        etiqueta={etiqueta}
      />

      {visibles && (
        <div className="flex flex-col gap-2 animate-fade-up motion-reduce:animate-none">
          <p className="text-sm text-on-surface-soft">{pregunta ?? sugerencias.titulo}</p>
          <div className="flex flex-wrap items-center gap-2">
            {sugerencias.opciones.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                onClick={() => setPregunta(opcion.pregunta)}
                className={clsx(
                  'rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm',
                  'text-on-surface bg-lumia-campo',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                )}
              >
                {opcion.label}
              </button>
            ))}
            <button
              type="button"
              onClick={descartar}
              className={clsx(
                'rounded-full px-3 py-2 min-h-touch-sm text-sm',
                'text-on-surface-soft hover:text-on-surface',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
              )}
            >
              {sugerencias.descartar}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
