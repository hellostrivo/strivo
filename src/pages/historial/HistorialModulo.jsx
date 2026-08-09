// src/pages/historial/HistorialModulo.jsx
// Historial (§5.10): calendario de ánimo y vista de un día.
//
// Se carga un mes por lectura. Hacia atrás se puede ir sin límite —el historial
// es suyo desde el primer día—; hacia adelante no hay nada que ver, así que el
// mes en curso es el último.

import { useCallback, useEffect, useState } from 'react'
import { copy } from '@copy'
import { getCurrentUserId } from '@lib/user'
import { strivoDayKey } from '@lib/timeSlot'
import { partesDe, mesAnterior, mesSiguiente } from '@lib/fechas'
import { loadMes, loadDia } from '@lib/historial'
import Calendario from '@components/historial/Calendario'
import VistaDia from './VistaDia'

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

export default function HistorialModulo({ onSalir }) {
  const hoy = strivoDayKey()
  const actual = partesDe(hoy)

  const [mes, setMes]   = useState({ ano: actual.ano, mes: actual.mes })
  const [dias, setDias] = useState(new Map())
  const [dia, setDia]   = useState(null)

  useEffect(() => {
    let vivo = true
    loadMes(getCurrentUserId(), mes.ano, mes.mes)
      .then(cargados => { if (vivo) setDias(cargados) })
      .catch(error => avisar('No se pudo cargar el mes:', error))
    return () => { vivo = false }
  }, [mes])

  const abrirDia = useCallback(async fecha => {
    try {
      setDia(await loadDia(getCurrentUserId(), fecha))
    } catch (error) {
      avisar('No se pudo abrir ese día:', error)
    }
  }, [])

  if (dia) {
    return <VistaDia dia={dia} onVolver={() => setDia(null)} />
  }

  // El mes en curso es el último: hacia adelante no hay historial
  const esMesActual = mes.ano === actual.ano && mes.mes === actual.mes

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <h1 className="font-display text-xl text-ink">{copy.historial.title}</h1>

      <div className="mt-8">
        <Calendario
          ano={mes.ano}
          mes={mes.mes}
          dias={dias}
          hoy={hoy}
          onDia={abrirDia}
          onAnterior={() => setMes(mesAnterior(mes.ano, mes.mes))}
          onSiguiente={esMesActual ? undefined : () => setMes(mesSiguiente(mes.ano, mes.mes))}
        />
      </div>

      {dias.size === 0 && (
        <p className="mt-10 text-base leading-relaxed text-ink/80">
          {copy.empty.historial}
        </p>
      )}
    </div>
  )
}
