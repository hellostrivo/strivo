// src/perfil/useSincronizacion.js
// El estado del bloque "Dónde vive lo que escribes" (SPEC_17A §4.6).
//
// Cuatro estados y una prioridad fija:
//
//   sinCuenta    — la sesión no es `conCuenta` (`useSesion`). Manda sobre todo
//                  lo demás: sin cuenta no hay nube que consultar. Con la
//                  sesión vencida también se dice esto: quien explica la
//                  situación es el bloque Tu cuenta (SPEC_19.1 §4.10).
//   sinConexion  — `navigator.onLine === false`.
//   pendiente    — hay escrituras esperando a salir (`getPendingCount`).
//   alDia        — el resto.
//
// **Es sondeo, no suscripción** (D11). `sync.js` no emite nada al vaciar la
// cola: se pregunta al montar, al volver la red, al volver la pestaña a primer
// plano y —desde SPEC_19.1— cada vez que termina una restauración del uid
// vigente (`selloRestauracion`, DP-17.14). Sin sondeo por intervalo: una
// pantalla que consulta cada segundo si ya está a salvo es una pantalla
// nerviosa.
//
// La decisión —qué estado toca— es `estadoDe`, una función sin React, para
// poder probarla sin navegador. El hook solo la llama cuando toca.

import { useCallback, useEffect, useRef, useState } from 'react'
import { flush, flushEnCurso, getPendingCount, restaurar, ultimoResultado } from '@/lib/db'
import { ESTADOS_SESION } from '@lib/sesion'
import { useSesion } from '@lib/useSesion'

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
 * @param {string} datos.estadoSesion - el de `useSesion`.
 * @param {boolean} datos.enLinea
 * @param {number} datos.pendientes
 * @param {?object} datos.ultimaRestauracion - lo que devolvió `ultimoResultado`.
 * @returns {{estado: string, restauracionFallida: boolean, puedeReintentar: boolean}}
 */
export function estadoDe({ estadoSesion, enLinea, pendientes, ultimaRestauracion }) {
  const conCuenta = estadoSesion === ESTADOS_SESION.conCuenta
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

/** Lo que el reintento puede decir después de intentarlo (DP-17.15). */
export const ACUSES = Object.freeze({ sinExito: 'sinExito' })

/**
 * Vuelve a intentar lo que quedó y dice cómo salió: la restauración si la
 * última falló, y vaciar la cola en cualquier caso. Después se vuelve a mirar
 * con `mirar`, que devuelve lo de `estadoDe`.
 *
 * **Espera de verdad al resultado** (DP-17.15). Si ya había un vaciado en
 * marcha —el de la vuelta de la red, el de la pestaña—, `flush` contesta
 * `en_curso` sin hacer nada, y mirar la cola en ese instante diría "todavía
 * no" de algo que estaba subiendo: se espera a que ese termine y entonces se
 * mira. Si después todavía hay algo que reintentar —pendientes con red, o la
 * restauración fallida—, devuelve `sinExito`; si no, `null`, porque el estado
 * nuevo ya lo dice solo.
 *
 * Sin React, para poder probarla sin navegador.
 *
 * @returns {Promise<?string>}
 */
export async function reintentarYMirar(uid, mirar) {
  if (ultimoResultado(uid)?.ok === false) await restaurar(uid)
  const vaciado = await flush(uid)
  if (vaciado.skipped === 'en_curso') await flushEnCurso()
  const despues = await mirar()
  return despues?.puedeReintentar ? ACUSES.sinExito : null
}

export function useSincronizacion(uid) {
  const { estado: estadoSesion, selloRestauracion } = useSesion()
  const [estado, setEstado] = useState(() =>
    estadoDe({ estadoSesion, enLinea: enLineaAhora(), pendientes: 0, ultimaRestauracion: null }),
  )
  // `null`, o `sinExito` si el último reintento no dejó las cosas en su sitio.
  // Con éxito no hay acuse aparte: el cambio de estado es el acuse.
  const [acuse, setAcuse] = useState(null)
  const vivo = useRef(true)

  const recalcular = useCallback(async () => {
    const conCuenta = estadoSesion === ESTADOS_SESION.conCuenta
    const pendientes = conCuenta ? await getPendingCount(uid) : 0
    if (!vivo.current) return null
    const siguiente = estadoDe({
      estadoSesion,
      enLinea: enLineaAhora(),
      pendientes,
      ultimaRestauracion: ultimoResultado(uid),
    })
    setEstado(siguiente)
    if (!siguiente.puedeReintentar) setAcuse(null)
    return siguiente
  }, [uid, estadoSesion])

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
  }, [recalcular, selloRestauracion])

  /** El botón "Intentar de nuevo": ver `reintentarYMirar`. */
  const reintentar = useCallback(async () => {
    setAcuse(null)
    const resultado = await reintentarYMirar(uid, recalcular)
    if (vivo.current) setAcuse(resultado)
  }, [uid, recalcular])

  return { ...estado, acuse, reintentar, recalcular }
}
