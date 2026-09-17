// src/perfil/useSincronizacion.js
// El estado del bloque "Dónde vive lo que escribes" (SPEC_17A §4.6).
//
// Cuatro estados y una prioridad fija:
//
//   sinCuenta    — el uid es local (`esUidDeCuenta`). Manda sobre todo lo
//                  demás: sin cuenta no hay nube que consultar.
//   sinConexion  — `navigator.onLine === false`.
//   pendiente    — hay escrituras esperando a salir (`getPendingCount`).
//   alDia        — el resto.
//
// **Es sondeo, no suscripción** (D11). `sync.js` no emite nada al vaciar la
// cola y no se modifica: se pregunta al montar, al volver la red y al volver
// la pestaña a primer plano. Sin sondeo por intervalo: una pantalla que
// consulta cada segundo si ya está a salvo es una pantalla nerviosa.
//
// La decisión —qué estado toca— es `estadoDe`, una función sin React, para
// poder probarla sin navegador. El hook solo la llama cuando toca.

import { useCallback, useEffect, useRef, useState } from 'react'
import { flush, getPendingCount, restaurar, ultimoResultado } from '@/lib/db'
import { esUidDeCuenta } from '@lib/sesion'

export const ESTADOS = Object.freeze(['sinCuenta', 'sinConexion', 'pendiente', 'alDia'])

/**
 * Qué estado toca, con los tres datos delante.
 *
 * El conteo de la cola entra aquí para decidir entre `pendiente` y `alDia`, y
 * **no sale**: la pantalla no dice cuántas escrituras esperan. "Guardando" es
 * información completa, y un número que el sondeo no ve bajar se queda
 * congelado en pantalla como si algo estuviera atorado (§4.6).
 *
 * @param {object} datos
 * @param {string} datos.uid
 * @param {boolean} datos.enLinea
 * @param {number} datos.pendientes
 * @param {?object} datos.ultimaRestauracion - lo que devolvió `ultimoResultado`.
 * @returns {{estado: string, restauracionFallida: boolean, puedeReintentar: boolean}}
 */
export function estadoDe({ uid, enLinea, pendientes, ultimaRestauracion }) {
  const conCuenta = esUidDeCuenta(uid)
  let estado = 'alDia'
  if (!conCuenta) estado = 'sinCuenta'
  else if (!enLinea) estado = 'sinConexion'
  else if (pendientes > 0) estado = 'pendiente'

  // Un fallo de restauración es de la sesión, no del dispositivo, y solo tiene
  // sentido ofrecer volver a intentarlo con cuenta y con red.
  const restauracionFallida = conCuenta && ultimaRestauracion?.ok === false
  const puedeReintentar = conCuenta && enLinea && (pendientes > 0 || restauracionFallida)

  return { estado, restauracionFallida, puedeReintentar }
}

function enLineaAhora() {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

export function useSincronizacion(uid) {
  const [estado, setEstado] = useState(() =>
    estadoDe({ uid, enLinea: enLineaAhora(), pendientes: 0, ultimaRestauracion: null }),
  )
  const vivo = useRef(true)

  const recalcular = useCallback(async () => {
    const pendientes = esUidDeCuenta(uid) ? await getPendingCount(uid) : 0
    if (!vivo.current) return
    setEstado(
      estadoDe({
        uid,
        enLinea: enLineaAhora(),
        pendientes,
        ultimaRestauracion: ultimoResultado(uid),
      }),
    )
  }, [uid])

  useEffect(() => {
    vivo.current = true
    recalcular()

    if (typeof window === 'undefined') return undefined
    const alVolverLaPestana = () => {
      if (document.visibilityState === 'visible') recalcular()
    }
    window.addEventListener('online', recalcular)
    window.addEventListener('offline', recalcular)
    document.addEventListener('visibilitychange', alVolverLaPestana)

    return () => {
      vivo.current = false
      window.removeEventListener('online', recalcular)
      window.removeEventListener('offline', recalcular)
      document.removeEventListener('visibilitychange', alVolverLaPestana)
    }
  }, [recalcular])

  /**
   * Vuelve a intentar lo que quedó: la restauración si la última falló, y
   * vaciar la cola en cualquier caso. Después se vuelve a mirar.
   */
  const reintentar = useCallback(async () => {
    if (ultimoResultado(uid)?.ok === false) await restaurar(uid)
    await flush(uid)
    await recalcular()
  }, [uid, recalcular])

  return { ...estado, reintentar, recalcular }
}
