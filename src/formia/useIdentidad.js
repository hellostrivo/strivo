// src/formia/useIdentidad.js
// Estado de React sobre `identidad.js`. No decide nada: carga, ejecuta y
// recuerda el último aviso.
//
// RN-02 — Toda escritura pasa por la capa de datos, que confirma en IndexedDB
// antes de que la red se entere. Sin conexión, esta pantalla funciona igual.
//
// RN-DB4-01 — Nada de `lumia/` entra aquí.

import { useCallback, useEffect, useRef, useState } from 'react'
import * as identidad from './identidad.js'

const ESTADO_VACIO = { existe: false, central: null, areas: null, history: [] }

/**
 * @param {string} uid
 * @returns {{
 *   estado: object, carga: 'cargando'|'lista'|'error', aviso: string|null,
 *   error: object|null, acciones: object, limpiarAviso: Function, reintentar: Function
 * }}
 */
export function useIdentidad(uid) {
  const [estado, setEstado] = useState(ESTADO_VACIO)
  const [carga, setCarga] = useState('cargando')
  const [aviso, setAviso] = useState(null)
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
      const siguiente = await identidad.cargarIdentidad(uid)
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

  /**
   * Ejecuta una acción y adopta el estado que devuelve. Si algo falla, la
   * pantalla se queda como estaba y se ofrece reintentar: lo escrito no se
   * pierde y no aparece ningún código de error.
   */
  const ejecutar = useCallback(async (accion) => {
    setError(null)
    try {
      const resultado = await accion()
      if (!vivo.current) return null
      setEstado(resultado.estado)
      setAviso(resultado.tope ? 'tope' : resultado.restaurada ? 'restaurada' : null)
      return resultado
    } catch {
      if (!vivo.current) return null
      setError({ reintentar: () => ejecutar(accion) })
      return null
    }
  }, [])

  const acciones = {
    guardarCentral: (texto) =>
      ejecutar(() => identidad.guardarCentral(uid, texto, estado.central)),
    guardarIdentidadArea: (areaId, texto) =>
      ejecutar(() => identidad.guardarIdentidadArea(uid, areaId, texto)),
    elegirArea: (areaId) => ejecutar(() => identidad.elegirArea(uid, areaId, estado.areas)),
    quitarArea: (areaId) => ejecutar(() => identidad.quitarArea(uid, areaId)),
    pausarArea: (areaId) => ejecutar(() => identidad.pausarArea(uid, areaId)),
    reanudarArea: (areaId) => ejecutar(() => identidad.reanudarArea(uid, areaId)),
  }

  return {
    estado,
    carga,
    aviso,
    error,
    acciones,
    limpiarAviso: () => setAviso(null),
    reintentar: cargar,
  }
}

export default useIdentidad
