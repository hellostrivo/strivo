// src/pages/habitos/HabitosModulo.jsx
// Módulo de Hábitos (§5.7): H1 lista · H2 detalle · H3 crear.
//
// Tres pantallas y una sola fuente de datos. Se entra por la lista y se vuelve
// siempre a ella, así que desde Hoy son dos toques hasta la lista y tres hasta
// el detalle (RN-10).
//
// Cada cambio se guarda al instante (RN-02) y se refleja donde toque: crear un
// hábito de mañana lo pone en el Ritual de Mañana sin ningún paso extra, y
// pausarlo lo saca sin borrar su historial (RN-HR-01, RN-04).

import { useCallback, useEffect, useState } from 'react'
import { getAreas, getHabitLogsByDate, markHabit, unmarkHabit } from '@lib/db'
import { getCurrentUserId } from '@lib/user'
import { strivoDayKey } from '@lib/timeSlot'
import {
  loadHabitos,
  loadDetalleHabito,
  crearHabito,
  pausarHabito,
  reanudarHabito,
} from '@lib/habits'
import H1Lista   from './H1Lista'
import H2Detalle from './H2Detalle'
import H3Crear   from './H3Crear'

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

export default function HabitosModulo({ onSalir }) {
  const [datos, setDatos]     = useState(null)
  const [pantalla, setPantalla] = useState('lista')   // 'lista' | 'detalle' | 'crear'
  const [abierto, setAbierto]   = useState(null)      // hábito del detalle
  const [detalle, setDetalle]   = useState(null)

  const cargar = useCallback(async () => {
    const userId = getCurrentUserId()
    const fecha  = strivoDayKey()
    const [habitos, areas, logs] = await Promise.all([
      loadHabitos(userId),
      getAreas(userId),
      getHabitLogsByDate(userId, fecha),
    ])
    return {
      userId,
      fecha,
      habitos,
      areas: areas.filter(a => a.estado !== 'archivada'),
      hechos: new Set(logs.map(log => log.habitId)),
    }
  }, [])

  useEffect(() => {
    let vivo = true
    cargar()
      .then(cargados => { if (vivo) setDatos(cargados) })
      .catch(error => avisar('No se pudieron cargar los hábitos:', error))
    return () => { vivo = false }
  }, [cargar])

  // El detalle se recalcula cada vez que se abre un hábito distinto
  useEffect(() => {
    if (!abierto) return
    let vivo = true
    loadDetalleHabito(abierto)
      .then(d => { if (vivo) setDetalle(d) })
      .catch(error => avisar('No se pudo cargar el detalle:', error))
    return () => { vivo = false }
  }, [abierto])

  const recargar = () => cargar().then(setDatos).catch(error => avisar('No se pudo recargar:', error))

  if (!datos) return null

  const alternarHabito = async (habitId, marcar) => {
    setDatos(previos => ({ ...previos, hechos: alternarEn(previos.hechos, habitId, marcar) }))
    try {
      if (marcar) await markHabit(habitId, datos.userId, datos.fecha)
      else        await unmarkHabit(habitId, datos.fecha)
      await recargar()
    } catch (error) {
      avisar('No se pudo guardar la marca:', error)
      setDatos(previos => ({ ...previos, hechos: alternarEn(previos.hechos, habitId, !marcar) }))
    }
  }

  const crear = async valores => {
    try {
      await crearHabito(datos.userId, valores)
      await recargar()
    } catch (error) {
      avisar('El hábito no se pudo crear todavía:', error)
    }
    setPantalla('lista')
  }

  const cambiarEstado = async accion => {
    try {
      const actualizado = await accion(abierto)
      setAbierto(actualizado)
      await recargar()
    } catch (error) {
      avisar('El estado del hábito se guarda más tarde:', error)
    }
  }

  const volverALista = () => {
    setPantalla('lista')
    setAbierto(null)
    setDetalle(null)
  }

  if (pantalla === 'crear') {
    return (
      <H3Crear
        areas={datos.areas}
        habitos={datos.habitos}
        onCrear={crear}
        onVolver={volverALista}
      />
    )
  }

  if (pantalla === 'detalle' && abierto && detalle) {
    return (
      <H2Detalle
        habito={abierto}
        area={datos.areas.find(a => a.id === abierto.areaId)}
        detalle={detalle}
        onPausar={() => cambiarEstado(pausarHabito)}
        onReanudar={() => cambiarEstado(reanudarHabito)}
        onVolver={volverALista}
      />
    )
  }

  return (
    <H1Lista
      habitos={datos.habitos}
      areas={datos.areas}
      hechos={datos.hechos}
      onToggle={alternarHabito}
      onAbrir={habito => { setAbierto(habito); setPantalla('detalle') }}
      onCrear={() => setPantalla('crear')}
      onSalir={onSalir}
    />
  )
}

function alternarEn(conjunto, id, incluir) {
  const siguiente = new Set(conjunto)
  if (incluir) siguiente.add(id)
  else siguiente.delete(id)
  return siguiente
}
