// src/lumia/useJournal.js
// Estado de React sobre `journal.js`, con la misma forma que `useDiario.js`:
// `{ estado, carga, error, acciones, reintentar }`.
//
// **Autoguardado (§5.8).** El texto se guarda 800 ms después de la última tecla,
// y de inmediato al perder el foco, al cerrar el editor y al salir de la vista.
// No hay botón de guardar. Seleccionar un chip de emoción **es** una edición y
// pasa por el mismo mecanismo (§5.8.1).
//
// La entrada vive en un borrador hasta que tiene algo dentro: una entrada
// completamente vacía no se guarda, así que abrir el editor y salir sin escribir
// no deja ningún rastro.

import { useCallback, useEffect, useRef, useState } from 'react'
import { shared } from '@/lib/db'
import * as journal from './journal.js'

/** §5.8 — Retraso del autoguardado desde el último carácter. */
export const RETRASO_AUTOGUARDADO = 800

const ESTADO_VACIO = { fecha: null, genero: 'n', entradas: [] }

export function useJournal(uid) {
  const [estado, setEstado] = useState(ESTADO_VACIO)
  const [carga, setCarga] = useState('cargando')
  const [error, setError] = useState(null)
  const [borrador, verBorrador] = useState(null)

  const vivo = useRef(true)
  // El borrador en curso, fuera del estado de React: entre que una escritura se
  // encola y le toca el turno, la persona ha seguido tecleando. Guardar la copia
  // del encolado perdería esas teclas y, peor, crearía una segunda entrada.
  const borradorRef = useRef(null)
  const hayPendiente = useRef(false)
  const temporizador = useRef(null)
  const cola = useRef(Promise.resolve())

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
      const [perfil, fecha, entradas] = await Promise.all([
        shared.getProfile(uid),
        journal.fechaDeHoy(uid),
        journal.listar(uid),
      ])
      if (!vivo.current) return
      setEstado({ fecha, genero: perfil?.gender ?? 'n', entradas })
      setCarga('lista')
    } catch {
      if (!vivo.current) return
      setCarga('error')
    }
  }, [uid])

  useEffect(() => {
    cargar()
  }, [cargar])

  const fijarBorrador = (siguiente) => {
    borradorRef.current = siguiente
    verBorrador(siguiente)
  }

  /**
   * Guarda lo que haya pendiente y refresca la lista.
   *
   * Las escrituras van en fila, una detrás de otra: dos guardados solapados de
   * la misma entrada dejarían en pantalla un estado más viejo que el guardado.
   */
  const volcar = useCallback(async () => {
    if (temporizador.current) {
      clearTimeout(temporizador.current)
      temporizador.current = null
    }
    if (!hayPendiente.current) return null
    hayPendiente.current = false

    const enFila = cola.current.then(
      () => journal.guardar(uid, borradorRef.current),
      () => journal.guardar(uid, borradorRef.current),
    )
    cola.current = enFila.then(
      () => undefined,
      () => undefined,
    )

    try {
      const guardada = await enFila
      setError(null)
      if (!vivo.current) return guardada
      // Lo único que se trae del guardado es el identificador de lo que acaba
      // de nacer: rehacer el borrador desde el registro borraría las teclas de
      // los últimos milisegundos.
      if (guardada && borradorRef.current && !borradorRef.current.id) {
        fijarBorrador({ ...borradorRef.current, id: guardada.id })
      }
      const entradas = await journal.listar(uid)
      if (vivo.current) setEstado((previo) => ({ ...previo, entradas }))
      return guardada
    } catch {
      if (vivo.current) setError({ reintentar: () => volcar() })
      return null
    }
  }, [uid])

  const programar = useCallback(
    (patch) => {
      const siguiente = { ...(borradorRef.current ?? {}), ...patch }
      fijarBorrador(siguiente)
      hayPendiente.current = true
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => {
        volcar()
      }, RETRASO_AUTOGUARDADO)
    },
    [volcar],
  )

  // Cerrar la app a media frase no puede perderla (§5.8, criterio 2).
  useEffect(() => {
    return () => {
      if (!hayPendiente.current || !borradorRef.current) return
      hayPendiente.current = false
      journal.guardar(uid, borradorRef.current).catch(() => {})
    }
  }, [uid])

  const acciones = {
    /** Abre una entrada existente, o una en blanco si no se pasa ninguna. */
    abrir: (entrada = null) => {
      fijarBorrador(
        entrada
          ? {
              id: entrada.id,
              date: entrada.date,
              text: entrada.text ?? '',
              emotions: entrada.emotions ?? [],
              otherText: entrada.otherText ?? null,
            }
          : journal.entradaNueva(estado.fecha),
      )
    },

    /** Cada tecla y cada chip. Se guarda solo a los 800 ms. */
    escribir: (patch) => programar(patch),

    /** Al perder el foco, sin esperar. */
    volcar,

    /** Cierra el editor guardando lo que hubiera. */
    cerrar: async () => {
      await volcar()
      if (vivo.current) fijarBorrador(null)
    },

    /** Borrar a mano la entrada abierta. Solo lo pide quien la escribió. */
    borrar: async () => {
      const actual = borradorRef.current
      if (temporizador.current) clearTimeout(temporizador.current)
      hayPendiente.current = false
      if (actual?.id) await journal.borrar(uid, actual.id)
      if (!vivo.current) return
      fijarBorrador(null)
      const entradas = await journal.listar(uid)
      if (vivo.current) setEstado((previo) => ({ ...previo, entradas }))
    },
  }

  return { estado, borrador, carga, error, acciones, reintentar: cargar }
}

export default useJournal
