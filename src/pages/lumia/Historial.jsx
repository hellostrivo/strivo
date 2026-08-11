// src/pages/lumia/Historial.jsx
// Historial — parte emocional de Lumia (§5.10).
//
// Que se pueda volver a cualquier día de la vida registrada y que hacerlo se
// sienta bien. Calendario con puntos de ánimo y, al tocar un día, todo lo de
// ese día en una página serena con la fecha en grande.
//
// **Sin hábitos y sin constancia acumulada** (§C7.7.2). La parte de hábitos del
// §5.10 original se reubicó en Formia (§C3.7); lo que queda aquí es estado
// emocional. Esta página no importa `formia/` y no tiene forma de hacerlo.
//
// Los días sin registro no llevan marca de ningún tipo: no hay huecos, no hay
// grises acusatorios y no hay días perdidos.

import CalendarioAnimo from '@components/lumia/CalendarioAnimo'
import VistaDiaCompleto from '@components/lumia/VistaDiaCompleto'
import Button from '@components/ui/Button'
import { copy } from '@copy'
import { useHistorial } from '@/lumia/useHistorial'

const textos = copy.lumia.historial

function Marco({ children }) {
  return (
    <div data-surface="light" className="min-h-screen bg-espacio text-on-surface">
      {children}
    </div>
  )
}

export default function Historial({ uid }) {
  const { mes, dias, genero, hoy, diaAbierto, journalConPin, carga, acciones, reintentar } =
    useHistorial(uid)

  if (diaAbierto) {
    return (
      <Marco>
        <VistaDiaCompleto dia={diaAbierto} genero={genero} onVolver={acciones.cerrarDia} />
      </Marco>
    )
  }

  if (carga === 'error') {
    return (
      <Marco>
        <div className="flex min-h-screen flex-col justify-center gap-4 px-5">
          <p className="text-base text-on-surface">{copy.lumia.diario.error.load.body}</p>
          <div>
            <Button size="sm" variant="surface" onClick={reintentar}>
              {copy.lumia.diario.error.load.retry}
            </Button>
          </div>
        </div>
      </Marco>
    )
  }

  if (!mes) {
    return <Marco>{<div className="min-h-screen" aria-busy="true" />}</Marco>
  }

  const hayAlgo = dias.some((dia) => dia.hayContenido)

  return (
    <Marco>
      <div className="flex flex-col gap-8 px-5 pb-24 pt-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-lg text-on-surface">{textos.title}</h1>
          <p className="text-sm text-on-surface-soft">{textos.lead}</p>
          {journalConPin && <p className="text-sm text-on-surface-soft">{textos.journalConPin}</p>}
        </header>

        <CalendarioAnimo
          mes={mes}
          dias={dias}
          hoy={hoy}
          onAbrirDia={acciones.abrirDia}
          onAnterior={acciones.mesAnterior}
          onSiguiente={acciones.mesSiguiente}
        />

        {/* Invitación, no reproche: este mes todavía no tiene nada y ya está. */}
        {!hayAlgo && carga === 'listo' && (
          <p className="text-base text-on-surface-soft">{textos.vacio}</p>
        )}
      </div>
    </Marco>
  )
}
