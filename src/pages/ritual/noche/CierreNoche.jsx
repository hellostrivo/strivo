// src/pages/ritual/noche/CierreNoche.jsx
// Secuencia de cierre del día (§3.3 · copy-library N8)
// Copy: copy.ritualNoche.closing
//
// La ceremonia va en tres tiempos: la síntesis de lo que hubo, un recorrido de
// luz de 900ms con "En paz con tu día.", y "Buenas noches." mientras la pantalla
// se atenúa al índigo de la noche (nunca negro puro, §6.3).
//
// El día ya quedó cerrado antes de entrar aquí: si alguien apaga el teléfono a
// media animación, no pierde nada. La ceremonia es para la persona, no para el
// registro (no-negociable 3: el cierre nunca falla).
//
// Sin la animación no hay tiempos: con movimiento reducido se muestra todo a la
// vez y no se cierra solo, porque un salto a Hoy sin transición desorienta.
// El botón siempre está y siempre termina.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { colors, gradientsBySlot } from '@tokens'
import Button from '@components/ui/Button'
import useReducedMotion from '@hooks/useReducedMotion'

// Tiempos de la ceremonia (ms desde que entra)
const LUZ        = 1600
const NOCHE      = 3000
const FIN        = 4400
const ATENUADO   = 900   // lo que tarda el fondo en irse a night

const CLARO = `linear-gradient(160deg, ${gradientsBySlot.noche.from} 0%, ${colors.paper} 62%)`

export default function CierreNoche({ frase, onDone }) {
  const contenedor    = useRef(null)
  const reducedMotion = useReducedMotion()
  const [fase, setFase] = useState(reducedMotion ? 2 : 0)

  useEffect(() => { contenedor.current?.focus() }, [])

  useEffect(() => {
    if (reducedMotion) return
    const tiempos = [
      setTimeout(() => setFase(1), LUZ),
      setTimeout(() => setFase(2), NOCHE),
      setTimeout(onDone, FIN),
    ]
    return () => tiempos.forEach(clearTimeout)
  }, [reducedMotion, onDone])

  // Salir antes también termina el día
  useEffect(() => {
    const alPulsar = evento => {
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        onDone()
      }
    }
    const nodo = contenedor.current
    nodo?.addEventListener('keydown', alPulsar)
    return () => nodo?.removeEventListener('keydown', alPulsar)
  }, [onDone])

  const oscuro = fase >= 2

  return (
    <div
      ref={contenedor}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={copy.ritualNoche.title}
      className="fixed inset-0 z-50 overflow-hidden focus:outline-none"
      style={{
        background: oscuro ? colors.night : CLARO,
        transition: `background ${ATENUADO}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      {/* Recorrido de luz: 900ms, una sola pasada */}
      {fase === 1 && !reducedMotion && (
        <div
          className="absolute inset-y-0 w-1/2 animate-light-sweep pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative min-h-full flex flex-col items-center justify-center px-6 text-center">
        <div aria-live="polite" className="flex flex-col items-center gap-6">
          <p
            className={clsx(
              'text-md leading-relaxed transition-colors duration-900 ease-smooth',
              'motion-reduce:transition-none',
              oscuro ? 'text-paper/70' : 'text-ink/80'
            )}
          >
            {frase}
          </p>

          {fase >= 1 && (
            <p
              className={clsx(
                'font-display text-2xl leading-tight animate-fade-up',
                'transition-colors duration-900 ease-smooth motion-reduce:transition-none',
                oscuro ? 'text-paper' : 'text-ink'
              )}
            >
              {copy.ritualNoche.closing.peace}
            </p>
          )}

          {fase >= 2 && (
            <p className="font-display text-xl leading-tight text-paper/80 animate-fade-up">
              {copy.ritualNoche.closing.goodnight}
            </p>
          )}
        </div>
      </div>

      {fase >= 2 && (
        <div className="absolute inset-x-0 bottom-0 px-6 pb-safe">
          <Button
            variant="ghost"
            size="md"
            fullWidth
            className="text-paper/70 hover:bg-paper/10"
            onClick={onDone}
          >
            {copy.ritualNoche.closing.goodnight}
          </Button>
        </div>
      )}
    </div>
  )
}
