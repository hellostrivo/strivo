// src/pages/HoyPage.jsx
// Pantalla "Hoy" — pantalla raíz de Strivo
// En Fase 0: degradado horario + Rituales de Mañana y de Noche como overlays
// En Fase 1: se añaden tarjeta de acción y Vista de Mañana/Noche
//
// Cada ritual se abre solo en su franja (mañana 4:00–11:30, noche 19:00–03:00)
// si ese día todavía no se cerró. Una vez cerrado —por donde sea— no vuelve a
// aparecer: queda el enlace para volver a él cuando se quiera.
//
// La fecha es la del día de Strivo, que termina a las 03:00 (§7.2): quien cierra
// su día a la 1:30 no estrena un día nuevo, sigue en el de ayer.

import { useEffect, useMemo, useState } from 'react'
import {
  getTimeSlot,
  isRitualMananaWindow,
  isRitualNocheWindow,
  strivoDayKey,
} from '@lib/timeSlot'
import { getDailyEntry } from '@lib/db'
import { getCurrentUserId } from '@lib/user'
import { ritualMananaHecho } from '@lib/ritualManana'
import { ritualNocheHecho } from '@lib/ritualNoche'
import { gradientsBySlot } from '@tokens'
import { copy } from '@copy'
import Button from '@components/ui/Button'
import RitualManana from '@/pages/ritual/RitualManana'
import RitualNoche  from '@/pages/ritual/RitualNoche'

export default function HoyPage({ onHideNav }) {
  const slot     = useMemo(() => getTimeSlot(), [])
  const gradient = gradientsBySlot[slot]

  const [ritualAbierto, setRitualAbierto] = useState(null)   // 'manana' | 'noche' | null
  const [hechos, setHechos]               = useState(null)   // null mientras carga

  // Saludo sin nombre (en Fase 1 se añade el nombre del perfil)
  const greeting = copy.greetings[slot] ?? copy.greetings.dia

  useEffect(() => {
    let vivo = true
    getDailyEntry(getCurrentUserId(), strivoDayKey())
      .then(entrada => {
        if (!vivo) return
        const estado = {
          manana: ritualMananaHecho(entrada),
          noche:  ritualNocheHecho(entrada),
        }
        setHechos(estado)

        if (!estado.manana && isRitualMananaWindow())     setRitualAbierto('manana')
        else if (!estado.noche && isRitualNocheWindow())  setRitualAbierto('noche')
      })
      .catch(() => { if (vivo) setHechos({ manana: false, noche: false }) })
    return () => { vivo = false }
  }, [])

  // La barra de pestañas no compite con el ritual
  useEffect(() => {
    onHideNav?.(!!ritualAbierto)
    return () => onHideNav?.(false)
  }, [ritualAbierto, onHideNav])

  const cerrarRitual = cual => {
    setRitualAbierto(null)
    setHechos(previos => ({ ...previos, [cual]: true }))
  }

  // Qué ritual toca según la hora, para poder volver a él
  const ritualDeAhora =
    isRitualMananaWindow() ? 'manana' :
    isRitualNocheWindow()  ? 'noche'  : null

  const textos = ritualDeAhora === 'noche' ? copy.ritualNoche : copy.ritualManana
  const puedeVolver = ritualDeAhora && hechos && !ritualAbierto

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

      {puedeVolver && (
        <Button
          variant="secondary"
          size="md"
          className="mt-6"
          onClick={() => setRitualAbierto(ritualDeAhora)}
        >
          {hechos[ritualDeAhora]
            ? textos.reopen
            : (ritualDeAhora === 'noche' ? textos.n6.cta : textos.cta)}
        </Button>
      )}

      {ritualAbierto === 'manana' && (
        <RitualManana onClose={() => cerrarRitual('manana')} />
      )}

      {ritualAbierto === 'noche' && (
        <RitualNoche onClose={() => cerrarRitual('noche')} />
      )}
    </div>
  )
}
