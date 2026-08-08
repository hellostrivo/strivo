// src/pages/HoyPage.jsx
// Pantalla "Hoy" — pantalla raíz de Strivo
//
// Arriba, una frase que no habla de tu desempeño (§20.3). Antes había un texto
// que informaba de algo que la persona ya sabe ("Tu día está en curso") y le
// devolvía su propia identidad como marcador de progreso: ese eco convertía en
// ruido de interfaz una frase que eligió con cuidado en P4.
//
// Debajo, la única decisión que hay que tomar al abrir: mañana o noche. Las dos
// secciones están disponibles siempre, a cualquier hora (§20.3.B). Quien
// despierta a las 14:00 hace su ritual de mañana; quien quiere adelantar su
// cierre a las 19:00, también. La franja solo decide cuál viene preseleccionada.
//
// El fondo es la capa compartida de la app (@components/strivo/FondoHorario):
// aquí no se pinta ninguno, para que no parpadee al cambiar de pestaña. Lo que
// sí se decide aquí es CUÁL de los dos temas pinta esa capa (§20): "Mañana" un
// amanecer claro, "Noche" un azul profundo. El botón manda, no el reloj — quien
// cierra su día a las siete de la tarde no tiene por qué mirar una pantalla que
// insiste en que todavía es de día.
//
// La sección visible y el tema son el mismo estado, no dos: elegir "Noche" es
// a la vez ver la noche y verla de noche.
//
// La fecha es la del día de Strivo, que termina a las 03:00 (§7.2): quien cierra
// su día a la 1:30 no estrena un día nuevo, sigue en el de ayer.

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import {
  isRitualMananaWindow,
  isRitualNocheWindow,
  strivoDayKey,
} from '@lib/timeSlot'
import { getDailyEntry } from '@lib/db'
import { getCurrentUserId } from '@lib/user'
import { ritualMananaHecho } from '@lib/ritualManana'
import { ritualNocheHecho } from '@lib/ritualNoche'
import { fraseDelDia } from '@lib/frases'
import { copy } from '@copy'
import { temaInicialDeHoy } from '@lib/temaHoy'
import Button from '@components/ui/Button'
import VistaManana from '@/pages/diario/VistaManana'
import VistaNoche  from '@/pages/diario/VistaNoche'
import RitualManana from '@/pages/ritual/RitualManana'
import RitualNoche  from '@/pages/ritual/RitualNoche'

export default function HoyPage({ onHideNav, onTema, onIrAHabitos }) {
  // Qué sección viene sugerida al abrir (§4.3.3, @lib/temaHoy). Es una
  // sugerencia: las dos están siempre a un toque, a cualquier hora.
  const [seccion, setSeccion] = useState(temaInicialDeHoy)
  const [frase, setFrase]                 = useState(null)
  const [ritualAbierto, setRitualAbierto] = useState(null)   // 'manana' | 'noche' | null
  const [hechos, setHechos]               = useState(null)   // null mientras carga
  const [recarga, setRecarga]             = useState(0)

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

  // La misma frase todo el día natural: si cambiara al recargar dejaría de ser
  // "la frase de hoy" y sería un elemento aleatorio más (§20.3.A).
  useEffect(() => {
    let vivo = true
    fraseDelDia(strivoDayKey())
      .then(texto => { if (vivo) setFrase(texto) })
      .catch(error => console.warn('[Strivo] Hoy se queda sin frase:', error))
    return () => { vivo = false }
  }, [])

  // La capa de fondo vive en App, así que se le dice qué tema toca. El estado
  // sigue siendo este: allí solo se hace eco de él.
  useEffect(() => { onTema?.(seccion) }, [seccion, onTema])

  // La barra de pestañas no compite con el ritual
  useEffect(() => {
    onHideNav?.(!!ritualAbierto)
    return () => onHideNav?.(false)
  }, [ritualAbierto, onHideNav])

  const cerrarRitual = cual => {
    setRitualAbierto(null)
    setHechos(previos => ({ ...previos, [cual]: true }))
    setRecarga(n => n + 1)
  }

  // Qué ritual toca según la hora, para poder volver a él
  const ritualDeAhora =
    isRitualMananaWindow() ? 'manana' :
    isRitualNocheWindow()  ? 'noche'  : null

  const textos = ritualDeAhora === 'noche' ? copy.ritualNoche : copy.ritualManana
  const puedeVolver = ritualDeAhora && hechos && !ritualAbierto

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-md mx-auto px-6 pt-safe pt-10">
        <p className="text-center font-sans text-sm tracking-widest uppercase text-surface-fg-muted">
          {copy.appName}
        </p>

        {/* La frase del día. Trae su propia superficie: así se lee igual de bien
            a las siete de la mañana que a las once de la noche, sin depender de
            la franja (§18.4). Sin icono, sin comillas, sin firma: se sostiene
            sola. */}
        {frase && (
          // Trae su propia superficie clara, así que dentro se vuelve a escribir
          // en tinta oscura aunque el tema sea el de la noche.
          <div
            data-surface="light"
            className="mt-8 rounded-lg bg-surface/95 shadow-elev-2 px-6 py-8"
          >
            <p className="text-center font-display text-md leading-snug text-ink">
              {frase}
            </p>
          </div>
        )}

        {/* La decisión que sí hay que tomar al abrir */}
        <div role="tablist" aria-label={copy.appName} className="mt-8 flex gap-3">
          {['manana', 'noche'].map(cual => {
            const activa = seccion === cual
            return (
              <button
                key={cual}
                role="tab"
                aria-selected={activa}
                onClick={() => setSeccion(cual)}
                className={clsx(
                  'flex-1 min-h-touch rounded-md px-4 py-3 text-base',
                  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
                  // Relleno y peso, nunca solo color (§20.3.B)
                  activa
                    ? 'bg-ink text-paper font-bold'
                    : 'bg-surface/70 text-ink font-medium'
                )}
              >
                {copy.hoy.seccion[cual]}
              </button>
            )
          })}
        </div>

        {puedeVolver && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            className="mt-6"
            onClick={() => setRitualAbierto(ritualDeAhora)}
          >
            {hechos[ritualDeAhora]
              ? textos.reopen
              : (ritualDeAhora === 'noche' ? textos.n6.cta : textos.cta)}
          </Button>
        )}
      </div>

      {/* Cambiar de sección cruza el contenido; los botones no se mueven */}
      <div
        key={seccion}
        className="mt-10 animate-fade-up motion-reduce:animate-none"
        aria-live="polite"
      >
        {seccion === 'manana'
          ? <VistaManana recarga={recarga} onIrAlRitual={onIrAHabitos} />
          : (
            <VistaNoche
              recarga={recarga}
              onDiaCerrado={() => setHechos(previos => ({ ...previos, noche: true }))}
            />
          )}
      </div>

      {ritualAbierto === 'manana' && (
        <RitualManana onClose={() => cerrarRitual('manana')} />
      )}

      {ritualAbierto === 'noche' && (
        <RitualNoche onClose={() => cerrarRitual('noche')} />
      )}
    </div>
  )
}
