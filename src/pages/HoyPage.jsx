// src/pages/HoyPage.jsx
// Pantalla "Hoy" — pantalla raíz de Strivo
// En Fase 0: degradado horario + Ritual de Mañana como overlay
// En Fase 1: se añaden tarjeta de acción y Vista de Mañana/Noche
//
// El Ritual de Mañana se abre solo en la franja de amanecer (4:00–11:30) si
// hoy todavía no se cerró. Una vez cerrado —por donde sea— no vuelve a
// aparecer en el día: queda el enlace para volver a él cuando se quiera.

import { useEffect, useMemo, useState } from 'react'
import { getTimeSlot, isRitualMananaWindow, todayKey } from '@lib/timeSlot'
import { getDailyEntry } from '@lib/db'
import { getCurrentUserId } from '@lib/user'
import { ritualMananaHecho } from '@lib/ritualManana'
import { gradientsBySlot } from '@tokens'
import { copy } from '@copy'
import Button from '@components/ui/Button'
import RitualManana from '@/pages/ritual/RitualManana'

export default function HoyPage({ onHideNav }) {
  const slot     = useMemo(() => getTimeSlot(), [])
  const gradient = gradientsBySlot[slot]

  const [ritualAbierto, setRitualAbierto] = useState(false)
  const [ritualHecho, setRitualHecho]     = useState(null)   // null mientras carga

  // Saludo sin nombre (en Fase 1 se añade el nombre del perfil)
  const greeting = copy.greetings[slot] ?? copy.greetings.dia

  useEffect(() => {
    let vivo = true
    getDailyEntry(getCurrentUserId(), todayKey())
      .then(entrada => {
        if (!vivo) return
        const hecho = ritualMananaHecho(entrada)
        setRitualHecho(hecho)
        if (!hecho && isRitualMananaWindow()) setRitualAbierto(true)
      })
      .catch(() => { if (vivo) setRitualHecho(false) })
    return () => { vivo = false }
  }, [])

  // La barra de pestañas no compite con el ritual
  useEffect(() => {
    onHideNav?.(ritualAbierto)
    return () => onHideNav?.(false)
  }, [ritualAbierto, onHideNav])

  const puedeVolverAlRitual = isRitualMananaWindow() && ritualHecho !== null && !ritualAbierto

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

      {puedeVolverAlRitual && (
        <Button
          variant="secondary"
          size="md"
          className="mt-6"
          onClick={() => setRitualAbierto(true)}
        >
          {ritualHecho ? copy.ritualManana.reopen : copy.ritualManana.cta}
        </Button>
      )}

      {ritualAbierto && (
        <RitualManana
          onClose={() => {
            setRitualAbierto(false)
            setRitualHecho(true)
          }}
        />
      )}
    </div>
  )
}
