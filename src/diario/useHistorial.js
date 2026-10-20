// src/diario/useHistorial.js
// Estado de React sobre `historial.js`: el mes que se está mirando y, si se
// abre un día, todo lo escrito ese día (§5.10).
//
// Navegar 12 meses atrás no se nota (§5.10, criterio 1): el mes se lee de
// IndexedDB en una sola tanda. Con el volumen de un año no hay nada más que
// optimizar todavía, y optimizarlo antes de tiempo sería inventarse un problema.

import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_DIA_TERMINA_A, shared } from '@/lib/db'
import * as historial from './historial.js'
import { fechaDeHoy } from './diario.js'
import { estadoPin } from './pin.js'
import { editable } from './ventanaEdicion.js'

export function useHistorial(uid) {
  const [mes, setMes] = useState(null)
  const [dias, setDias] = useState([])
  const [genero, setGenero] = useState('n')
  const [hoy, setHoy] = useState(null)
  const [diaAbierto, setDiaAbierto] = useState(null)
  // Cuándo termina el día de esta persona: es lo que decide desde qué instante
  // se cuentan las 72 horas de la ventana de edición (RN-DB-01). Se lee con el
  // perfil, que ya se pedía, y no vuelve a pedirse por cada día que se abre.
  const [diaTerminaA, setDiaTerminaA] = useState(DEFAULT_DIA_TERMINA_A)
  const [carga, setCarga] = useState('cargando')
  // Con un PIN puesto, el journal se lee **solo desde el journal**. Aquí no se
  // ofrece desbloquear: sería una segunda puerta a lo mismo, y dos puertas es
  // una más de las que nadie pidió.
  const [journalConPin, setJournalConPin] = useState(false)

  const vivo = useRef(true)

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
    }
  }, [])

  /** El mes en curso es el punto de partida: se llega para ver lo de ahora. */
  const iniciar = useCallback(async () => {
    if (!uid) return
    setCarga('cargando')
    try {
      const [perfil, fecha, pin] = await Promise.all([
        shared.getProfile(uid),
        fechaDeHoy(uid),
        estadoPin(uid),
      ])
      if (!vivo.current) return
      setGenero(perfil?.gender ?? 'n')
      setDiaTerminaA(perfil?.diaTerminaA ?? DEFAULT_DIA_TERMINA_A)
      setHoy(fecha)
      setJournalConPin(pin.activo)
      setMes(historial.mesDe(fecha))
    } catch {
      if (vivo.current) setCarga('error')
    }
  }, [uid])

  useEffect(() => {
    iniciar()
  }, [iniciar])

  useEffect(() => {
    if (!uid || !mes) return
    let cancelado = false
    setCarga('cargando')
    historial
      .cargarMes(uid, mes)
      .then((delMes) => {
        if (cancelado || !vivo.current) return
        setDias(delMes)
        setCarga('listo')
      })
      .catch(() => {
        if (!cancelado && vivo.current) setCarga('error')
      })
    return () => {
      cancelado = true
    }
  }, [uid, mes])

  const acciones = {
    mesAnterior: () => setMes((actual) => historial.sumarMeses(actual, -1)),
    mesSiguiente: () => setMes((actual) => historial.sumarMeses(actual, 1)),

    abrirDia: async (fecha) => {
      const dia = await historial.cargarDia(uid, fecha, { conJournal: !journalConPin })
      // Se calcula al abrirlo y no se guarda: es una vista, como el punto de
      // ánimo (RN-DB-05). El Historial sigue mostrando el día entero lo diga
      // como lo diga — esto solo decide si se dice que ya quedó como quedó.
      if (vivo.current) setDiaAbierto({ ...dia, editable: editable(fecha, { diaTerminaA }) })
    },

    cerrarDia: () => setDiaAbierto(null),
  }

  return { mes, dias, genero, hoy, diaAbierto, journalConPin, carga, acciones, reintentar: iniciar }
}

export default useHistorial
