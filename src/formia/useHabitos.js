// src/formia/useHabitos.js
// Estado de React sobre `habitos.js`, con la misma forma que `useIdentidad.js`.
//
// RN-01 / RN-HB-03 — Una sola instancia de este hook sostiene H1, H2 y H3. Por
// eso marcar en el detalle se ve en la lista sin sincronizar nada: no hay dos
// copias del estado que puedan discrepar.
//
// RN-02 — Toda escritura pasa por la capa de datos, que confirma en IndexedDB
// antes de que la red se entere. Sin conexión, marcar y crear funcionan igual.

import { useCallback, useEffect, useRef, useState } from 'react'
import * as habitos from './habitos.js'

const ESTADO_VACIO = { central: null, areas: null, habits: [], logs: [], hoy: null }

export function useHabitos(uid) {
  const [estado, setEstado] = useState(ESTADO_VACIO)
  const [carga, setCarga] = useState('cargando')
  const [error, setError] = useState(null)
  const vivo = useRef(true)

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
    }
  }, [])

  const cargar = useCallback(async () => {
    if (!uid) return
    setCarga('cargando')
    try {
      const siguiente = await habitos.cargarHabitos(uid)
      if (!vivo.current) return
      setEstado(siguiente)
      setCarga('lista')
    } catch {
      if (!vivo.current) return
      setCarga('error')
    }
  }, [uid])

  useEffect(() => {
    cargar()
  }, [cargar])

  const ejecutar = useCallback(async (accion) => {
    setError(null)
    try {
      const resultado = await accion()
      if (!vivo.current) return null
      setEstado(resultado.estado)
      return resultado
    } catch {
      if (!vivo.current) return null
      // La marca no se pierde: lo que ya estaba en local sigue en local, y
      // reintentar repite la misma escritura sin duplicar nada.
      setError({ reintentar: () => ejecutar(accion) })
      return null
    }
  }, [])

  const acciones = {
    crear: (habito) => ejecutar(() => habitos.crearHabito(uid, habito)),
    actualizar: (habitId, patch) => ejecutar(() => habitos.actualizarHabito(uid, habitId, patch)),
    alternarMarca: (habitId, marcado) =>
      ejecutar(() => habitos.alternarMarca(uid, habitId, estado.hoy, marcado)),
    cambiarEstado: (habitId, state) => ejecutar(() => habitos.cambiarEstado(uid, habitId, state)),
  }

  return { estado, carga, error, acciones, reintentar: cargar }
}

export default useHabitos
