// src/lib/avisos/useAvisos.js
// Los avisos de la app de iPhone mientras las secciones están montadas (SPEC_22).
//
// Lo monta `Secciones` (`App.jsx`), que es lo que existe después del
// onboarding y antes de cerrar sesión: el único tramo de la vida de la app en
// el que hay avisos que poner al día. Aquí viven tres de los disparos de la
// tabla del §9 —al montar, al volver la app al frente y al terminar una
// restauración— y quien escucha a los demás, que llegan por `pedido.js`.
//
// **Y el toque en un aviso.** El plugin lo guarda hasta que alguien escucha,
// así que el que abrió la app desde cerrada llega en cuanto esto se monta.
// Adónde lleva lo decide quien enruta (`alTocar`): este archivo no sabe qué
// rutas hay.
//
// **En la web, y en Android antes de SPEC_27, no hace nada**: ni carga la
// reconciliación ni el plugin.

import { useEffect, useRef } from 'react'
import { esIPhone } from '../plataforma.js'
import { puente } from '../avisosNativos.js'
import { useSesion } from '../useSesion.js'
import { escucharPedidos, pedirReconciliacion } from './pedido.js'

/**
 * @param {string} uid
 * @param {{alTocar: (momento: 'manana'|'noche') => void}} opciones
 */
export function useAvisos(uid, { alTocar }) {
  const { selloRestauracion } = useSesion()
  const tocar = useRef(alTocar)
  tocar.current = alTocar

  useEffect(() => {
    if (!uid || !esIPhone()) return undefined
    let vivo = true
    const soltar = []
    const soltarTodo = () => soltar.splice(0).forEach((fn) => fn())

    puente
      .escucharToques((momento) => tocar.current?.(momento))
      .then((quitar) => (vivo ? soltar.push(quitar) : quitar()))

    import('./reconciliar.js').then(({ activarAvisos, desactivarAvisos, reconciliar }) => {
      if (!vivo) return
      activarAvisos(uid)
      soltar.push(() => desactivarAvisos(uid))
      soltar.push(escucharPedidos((detalle) => reconciliar(detalle)))

      const alVolver = () => {
        if (document.visibilityState === 'visible') reconciliar()
      }
      document.addEventListener('visibilitychange', alVolver)
      soltar.push(() => document.removeEventListener('visibilitychange', alVolver))

      reconciliar()
    })

    return () => {
      vivo = false
      soltarTodo()
    }
  }, [uid])

  // Las horas y la preferencia pueden llegar de la nube después de montar: una
  // restauración que termina es una razón para volver a mirar.
  useEffect(() => {
    if (selloRestauracion) pedirReconciliacion()
  }, [selloRestauracion])
}

export default useAvisos
