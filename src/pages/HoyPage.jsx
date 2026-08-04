// src/pages/HoyPage.jsx
// Pantalla "Hoy" — pantalla raíz de Strivo
// En Fase 0: stub con degradado horario funcional
// En Fase 1: se añaden tarjeta de acción, Ritual y Vista de Mañana/Noche

import { useMemo } from 'react'
import { getTimeSlot } from '@lib/timeSlot'
import { gradientsBySlot } from '@tokens'
import { copy } from '@copy'

export default function HoyPage() {
  const slot     = useMemo(() => getTimeSlot(), [])
  const gradient = gradientsBySlot[slot]

  // Saludo sin nombre (en Fase 1 se añade el nombre del perfil)
  const greeting = copy.greetings[slot] ?? copy.greetings.dia

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: `linear-gradient(160deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* Logo / nombre */}
      <p className="font-sans text-sm tracking-widest text-ink/40 uppercase mb-8">
        {copy.appName}
      </p>

      {/* Saludo principal */}
      <h1 className="font-display text-xl text-ink text-center leading-snug mb-4">
        {greeting}
      </h1>

      {/* STUB: En Fase 1 aquí va la tarjeta de acción contextual */}
      <div className="w-full max-w-sm p-4 rounded-md bg-paper/70 backdrop-blur-sm shadow-elev-2 text-center">
        <p className="text-base text-ink/60">
          Fase 0 · Prototipo
        </p>
        <p className="text-sm text-ink/40 mt-1">
          Franja horaria: <strong>{slot}</strong>
        </p>
      </div>
    </div>
  )
}
