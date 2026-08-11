// src/lumia/usePin.js
// El estado del bloqueo del Journal (§5.8.2).
//
// RN-JR-PIN-01 — Mientras `desbloqueado` es `false`, la pantalla **no renderiza
// nada** del contenido: ni lista difuminada, ni títulos, ni conteo de entradas,
// ni previsualización bajo un velo. Lo que no se pinta no se puede fotografiar
// ni filtrar por un fallo de opacidad.
//
// Por eso este hook resuelve primero si hay protección y solo entonces la
// pantalla decide si monta `useJournal`. El contenido tampoco se carga en
// memoria hasta que el desbloqueo es correcto.

import { useCallback, useEffect, useRef, useState } from 'react'
import * as pin from './pin.js'

const ESTADO_VACIO = { activo: false, metodo: null, puedeActivar: false, sinSalida: false }

export function usePin(uid) {
  const [estado, setEstado] = useState(ESTADO_VACIO)
  const [carga, setCarga] = useState('cargando')
  const [desbloqueado, setDesbloqueado] = useState(false)
  const vivo = useRef(true)
  const resuelto = useRef(false)

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
    }
  }, [])

  /**
   * Relee el estado de la protección.
   *
   * **Solo la primera lectura pone la carga en "cargando".** La pantalla del
   * Journal no monta su contenido mientras la carga esté sin resolver
   * (RN-JR-PIN-01), así que volver a "cargando" al vincular una cuenta o al
   * fijar un PIN desmontaría el Journal entero: se perdería el panel abierto,
   * la búsqueda escrita y —lo grave— el borrador a medio escribir.
   */
  const revisar = useCallback(async () => {
    if (!uid) return
    if (!resuelto.current) setCarga('cargando')
    try {
      const siguiente = await pin.estadoPin(uid)
      if (!vivo.current) return
      setEstado(siguiente)
      // La puerta se decide **una sola vez, al llegar**: sin protección se
      // entra en un toque (§5.8.2, criterio 1) y con protección se empieza
      // cerrado. Después manda lo que haya pasado —desbloquear, fijar, retirar—
      // y no este cálculo: volver a aplicarlo dejaría fuera a quien acaba de
      // escribir bien su PIN, por haber tocado cualquier otra cosa.
      if (!resuelto.current) setDesbloqueado(!siguiente.activo)
      resuelto.current = true
      setCarga('listo')
    } catch {
      if (!vivo.current) return
      setCarga('error')
    }
  }, [uid])

  useEffect(() => {
    revisar()
  }, [revisar])

  const acciones = {
    /** Sin límite de intentos ni bloqueo temporal (§5.8.2): no hay nada que un límite mejore. */
    desbloquear: async (codigo) => {
      const correcto = await pin.verificarPin(uid, codigo)
      if (correcto && vivo.current) setDesbloqueado(true)
      return correcto
    },

    crear: async (codigo) => {
      const resultado = await pin.crearPin(uid, codigo)
      if (resultado.ok) await revisar()
      if (resultado.ok && vivo.current) setDesbloqueado(true)
      return resultado
    },

    desactivar: async (codigo) => {
      const resultado = await pin.desactivarPin(uid, codigo)
      if (resultado.ok) await revisar()
      return resultado
    },

    /** "Olvidé mi PIN": verifica la cuenta y deja fijar uno nuevo. */
    reautenticar: () => pin.reautenticar(uid),

    reestablecer: async (codigo) => {
      const resultado = await pin.reestablecerPin(uid, codigo)
      if (resultado.ok) await revisar()
      if (resultado.ok && vivo.current) setDesbloqueado(true)
      return resultado
    },

    vincular: async (datos) => {
      const metodo = await pin.vincularCuenta(uid, datos)
      await revisar()
      return metodo
    },
  }

  return { estado, carga, desbloqueado, acciones, reintentar: revisar }
}

export default usePin
