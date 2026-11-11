// src/components/perfil/DiagnosticoAvisos.jsx
// Las líneas del build de diagnóstico de SPEC_22 (DP-22.12).
//
// **Solo existe con `VITE_DIAG_AVISOS=1`**: `TusRecordatorios.jsx` lo importa
// bajo esa condición, y sin la bandera ni este componente ni sus textos llegan
// a `dist/`. Va al final del bloque «Recordatorios», que solo se pinta en la
// app de iPhone. Es una lupa para las pruebas manuales, no una sección.
//
// **Se pinta solo**: escucha el resultado de cada reconciliación
// (`alReconciliar`) y no le pregunta nada al teléfono por su cuenta. Lo que
// enseña es lo que iOS tiene de verdad programado al terminar cada vuelta.

import { useEffect, useState } from 'react'
import { interpolate } from '@copy'
import { DIAGNOSTICO_AVISOS as t } from '@copy/diagnostico'
import { alReconciliar } from '@lib/avisos/pedido'

/** «mié 11 nov, 07:00», en la hora del teléfono. */
export function cuandoDe(fecha) {
  if (!fecha) return t.ninguno
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(fecha)
      .map(({ type, value }) => [type, value]),
  )
  return interpolate(t.cuando, {
    semana: partes.weekday,
    dia: partes.day,
    mes: partes.month,
    hora: partes.hour,
    minuto: partes.minute,
  })
}

/** Las líneas, en el orden en que se leen. Sin React, para probarla sin navegador. */
export function lineasDeAvisos({ permiso, programados, proximos, zona }) {
  return [
    interpolate(t.permiso, { estado: t.permisos[permiso] ?? permiso }),
    interpolate(t.programados, { n: programados }),
    interpolate(t.proximaManana, { cuando: cuandoDe(proximos?.manana) }),
    interpolate(t.proximaNoche, { cuando: cuandoDe(proximos?.noche) }),
    interpolate(t.zona, { zona }),
  ]
}

export default function DiagnosticoAvisos() {
  const [resultado, setResultado] = useState(null)

  useEffect(() => alReconciliar(setResultado), [])

  if (!resultado) return null
  return (
    <div className="flex flex-col gap-1 border-t border-on-surface pt-4">
      {lineasDeAvisos(resultado).map((linea) => (
        <p key={linea} className="text-sm text-on-surface-soft">
          {linea}
        </p>
      ))}
    </div>
  )
}
