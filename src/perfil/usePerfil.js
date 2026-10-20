// src/perfil/usePerfil.js
// El estado de Tu perfil: lee `shared/profile`, lo edita y lo guarda solo.
//
// **Guarda mientras se toca, no al salir** (RN-01). Los toques se escriben al
// momento y lo tecleado a los 800 ms de la última tecla, que es el ritmo del
// resto del producto. No hay botón de guardar, no hay "cambios sin guardar" y
// salir no pregunta nada (RN-EST-08).
//
// **No escribe nada antes de haber leído.** Hasta que el perfil está cargado,
// los campos no tienen valor real y guardar sería borrar con un formulario
// vacío lo que ya había. Es el único bloqueo de esta pantalla y no se ve: solo
// impide escribir, nunca impide tocar.
//
// **Las preguntas son las del onboarding, y por eso no se reescriben aquí.** El
// género y los horarios son campos de `shared/profile`, no pasos de un
// recorrido: quien los define es su módulo, y esta pantalla los vuelve a
// preguntar con el mismo catálogo y la misma regla (`onboarding/genero`,
// `onboarding/estado`). Si aparece un tercer consumidor, esos módulos piden un
// hogar neutral.

import { useCallback, useEffect, useRef, useState } from 'react'
import { shared } from '@/lib/db'
import { generoDe, opcionDe } from '@/onboarding/genero'
import { perfilDesde } from '@/onboarding/estado'

/** §5.6 — El mismo retraso que el resto del producto: 800 ms sin teclear. */
export const RETRASO_AUTOGUARDADO = 800

/**
 * Lo que se ve antes de haber leído el perfil.
 *
 * Los horarios arrancan **en blanco y no con una hora sugerida**, al revés que
 * en el onboarding: allí se propone una para que nadie se enfrente a una
 * casilla vacía, y aquí eso escribiría un horario que nadie eligió la primera
 * vez que se abre la pantalla. Se muestra lo que hay, aunque no haya nada
 * (RN-DB-02).
 */
const VACIO = Object.freeze({
  nombre: '',
  genero: null,
  despertar: '',
  dormir: '',
})

export function usePerfil(uid) {
  const [valores, setValores] = useState(VACIO)
  const [carga, setCarga] = useState('cargando')

  const vivo = useRef(true)
  const listo = useRef(false)
  const temporizador = useRef(null)
  const pendiente = useRef(null)
  const cola = useRef(Promise.resolve())

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
      clearTimeout(temporizador.current)
    }
  }, [])

  const cargar = useCallback(async () => {
    if (!uid) return
    setCarga('cargando')
    try {
      const perfil = await shared.getProfile(uid)
      if (!vivo.current) return
      setValores({
        nombre: perfil?.name ?? '',
        genero: opcionDe(perfil?.gender),
        despertar: perfil?.wakeTime ?? '',
        dormir: perfil?.sleepTime ?? '',
      })
      listo.current = true
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
   * Escribe el perfil. En fila, una detrás de otra: tocar un chip mientras el
   * autoguardado de un texto va de camino son dos escrituras del mismo
   * documento, y si se solapan la última en responder deja guardado lo más
   * viejo. Un tropiezo aquí **no se muestra**: lo escrito sigue en pantalla y
   * en local, y un error de red no es un error visible (RN-EST-05).
   */
  const guardar = useCallback(
    (proximos) => {
      if (!listo.current) return Promise.resolve()
      const trabajo = () => shared.updateProfile(uid, perfilDesde(proximos))
      cola.current = cola.current.then(trabajo, trabajo).catch(() => {})
      return cola.current
    },
    [uid],
  )

  const volcar = useCallback(() => {
    clearTimeout(temporizador.current)
    temporizador.current = null
    const proximos = pendiente.current
    pendiente.current = null
    if (proximos) guardar(proximos)
  }, [guardar])

  /** Lo que se toca se guarda al momento; lo que se teclea, a los 800 ms. */
  const responder = useCallback(
    (clave, valor, { teclado = false } = {}) => {
      const proximos = { ...valores, [clave]: valor }
      setValores(proximos)
      clearTimeout(temporizador.current)

      if (teclado) {
        pendiente.current = proximos
        temporizador.current = setTimeout(volcar, RETRASO_AUTOGUARDADO)
        return
      }
      pendiente.current = null
      temporizador.current = null
      guardar(proximos)
    },
    [guardar, valores, volcar],
  )

  return {
    valores,
    carga,
    genero: generoDe(valores.genero),
    acciones: { responder, volcar },
    reintentar: cargar,
  }
}

export default usePerfil
