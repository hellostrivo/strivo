// src/onboarding/useOnboarding.js
// El estado del onboarding en React, sobre los módulos de al lado.
//
// **Guarda mientras se recorre, no al final** (RN-01). Cada paso escribe lo
// suyo al dejarlo, y lo tecleado se guarda solo a los 800 ms de la última
// tecla: cerrar la app a mitad del nombre no pierde el nombre, y volver a
// abrirla retoma en el paso donde estaba (RN-09).
//
// **El uid puede cambiar a mitad del recorrido.** Si en P7 se crea una cuenta,
// el árbol se muda al uid de Firebase y a partir de ahí se escribe allí. Por
// eso el uid vive en una referencia y no en una constante capturada: una
// escritura posterior a la mudanza que fuera al uid viejo escribiría en un
// árbol que ya nadie lee.
//
// Aquí no hay copy y no hay colores: esto decide qué se guarda y cuándo.

import { useCallback, useEffect, useRef, useState } from 'react'
import { shared } from '@/lib/db'
import { adoptarArbol } from './cuenta.js'
import { generoDe, opcionDe } from './genero.js'
import { anterior, retomarEn, siguiente } from './pasos.js'
import { expedienteDe, motivoDesde, perfilDesde, RESPUESTAS_INICIALES } from './estado.js'
import { quedanActivados } from './recordatorios.js'

/** §5.6 — El mismo retraso que el resto del producto: 800 ms sin teclear. */
export const RETRASO_AUTOGUARDADO = 800

export function useOnboarding(uid, { onUid } = {}) {
  const [respuestas, setRespuestas] = useState(RESPUESTAS_INICIALES)
  const [paso, setPaso] = useState(null)
  const [cargando, setCargando] = useState(true)

  const uidActual = useRef(uid)
  const vivo = useRef(true)
  const recorridos = useRef([])
  const temporizador = useRef(null)
  const pendiente = useRef(null)
  const cola = useRef(Promise.resolve())

  useEffect(() => {
    uidActual.current = uid
  }, [uid])

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
      clearTimeout(temporizador.current)
    }
  }, [])

  // ─── Escritura ──────────────────────────────────────────────────────────
  // En fila, una detrás de otra: dos pasos seguidos escriben el mismo
  // documento, y si se solapan la última en responder deja guardado lo más
  // viejo. La capa de datos no pierde nada; la fila es para que lo guardado
  // sea siempre lo último contestado.

  const enFila = useCallback((trabajo) => {
    cola.current = cola.current.then(trabajo, trabajo).catch(() => {})
    return cola.current
  }, [])

  /**
   * Escribe el perfil. Un tropiezo aquí no se muestra: lo escrito sigue en
   * pantalla, la escritura se reintenta sola al siguiente paso y un error de
   * red no es un error visible (RN-EST-05).
   */
  const guardarPerfil = useCallback(
    (valores) => enFila(() => shared.updateProfile(uidActual.current, perfilDesde(valores))),
    [enFila],
  )

  const guardarAhora = useCallback(() => {
    clearTimeout(temporizador.current)
    temporizador.current = null
    const valores = pendiente.current
    pendiente.current = null
    return valores ? guardarPerfil(valores) : Promise.resolve()
  }, [guardarPerfil])

  // ─── Carga ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!uid) return
    let vigente = true

    async function cargar() {
      const [perfil, expediente] = await Promise.all([
        shared.getProfile(uid).catch(() => null),
        shared.getOnboarding(uid).catch(() => null),
      ])
      if (!vigente) return

      recorridos.current = expediente?.completedSteps ?? []
      setRespuestas((previas) => ({
        ...previas,
        nombre: perfil?.name ?? previas.nombre,
        genero: opcionDe(perfil?.gender),
        identidad: perfil?.identidadCentral ?? previas.identidad,
        despertar: perfil?.wakeTime ?? previas.despertar,
        dormir: perfil?.sleepTime ?? previas.dormir,
        motivos: expediente?.motivos ?? previas.motivos,
        motivoOtro: expediente?.motivoOtro ?? previas.motivoOtro,
      }))
      setPaso(retomarEn(expediente?.currentStep))
      setCargando(false)
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [uid])

  // ─── Respuestas ─────────────────────────────────────────────────────────

  /**
   * Lo que se toca se guarda al momento; lo que se teclea, a los 800 ms.
   *
   * El guardado va **fuera** del actualizador de estado y no dentro: React
   * invoca ese actualizador dos veces en desarrollo, y una escritura ahí
   * dentro se dispararía por duplicado. Lo que se guarda se compone del estado
   * de este render, que es el que tenía delante quien acaba de tocar.
   */
  const responder = useCallback(
    (clave, valor, { teclado = false } = {}) => {
      const siguientes = { ...respuestas, [clave]: valor }
      setRespuestas(siguientes)
      clearTimeout(temporizador.current)

      if (teclado) {
        pendiente.current = siguientes
        temporizador.current = setTimeout(guardarAhora, RETRASO_AUTOGUARDADO)
        return
      }
      pendiente.current = null
      temporizador.current = null
      guardarPerfil(siguientes)
    },
    [guardarAhora, guardarPerfil, respuestas],
  )

  const guardarMotivo = useCallback(
    (valores) =>
      enFila(() => shared.updateOnboarding(uidActual.current, motivoDesde(valores ?? respuestas))),
    [enFila, respuestas],
  )

  const guardarRecordatorios = useCallback(
    (estado) =>
      enFila(() =>
        shared.updatePreferences(uidActual.current, {
          remindersEnabled: quedanActivados(estado),
        }),
      ),
    [enFila],
  )

  // ─── Navegación ─────────────────────────────────────────────────────────

  /**
   * Cambia de paso y guarda el expediente.
   *
   * **El motivo viaja en la misma escritura**, y no es un extra: `motivoOtro`
   * se teclea, y el autoguardado de lo tecleado escribe el perfil, que no es
   * donde vive. Sin esto, la palabra propia de P3 no llegaría al árbol hasta
   * el final del recorrido, y quien lo dejara a medias la perdería.
   */
  const ir = useCallback(
    (destino, valores) => {
      if (!destino) return
      recorridos.current = expedienteDe(destino, recorridos.current).completedSteps
      setPaso(destino)
      enFila(() =>
        shared.updateOnboarding(uidActual.current, {
          ...expedienteDe(destino, recorridos.current),
          ...motivoDesde(valores),
        }),
      )
    },
    [enFila],
  )

  const avanzar = useCallback(async () => {
    await guardarAhora()
    ir(siguiente(paso), respuestas)
  }, [guardarAhora, ir, paso, respuestas])

  const retroceder = useCallback(async () => {
    await guardarAhora()
    const destino = anterior(paso)
    if (destino) ir(destino, respuestas)
  }, [guardarAhora, ir, paso, respuestas])

  /**
   * La cuenta de P7: el árbol se muda y la sesión sigue con el uid nuevo.
   * Si la mudanza no sale, `adoptarArbol` devuelve el uid de siempre y el
   * recorrido continúa igual: nada de lo escrito se pierde por esto.
   */
  const adoptarCuenta = useCallback(
    async (cuenta) => {
      await guardarAhora()
      const nuevo = await adoptarArbol(uidActual.current, cuenta)
      uidActual.current = nuevo
      onUid?.(nuevo)
      return nuevo
    },
    [guardarAhora, onUid],
  )

  /**
   * Termina el recorrido. `completedAt` es lo único que decide que el
   * onboarding está hecho, así que se escribe **aquí y en ningún otro sitio**
   * (RN-DB-09). Se escribe también el perfil entero: quien llegó saltándolo
   * todo tiene el mismo derecho a un perfil escrito que quien contestó.
   */
  const terminar = useCallback(async () => {
    await guardarAhora()
    await guardarPerfil(respuestas)
    await guardarMotivo(respuestas)
    await enFila(() =>
      shared.updateOnboarding(uidActual.current, {
        ...expedienteDe(paso, recorridos.current),
        completedAt: new Date().toISOString(),
      }),
    )
    return uidActual.current
  }, [enFila, guardarAhora, guardarMotivo, guardarPerfil, paso, respuestas])

  return {
    respuestas,
    paso,
    cargando,
    genero: generoDe(respuestas.genero),
    acciones: {
      responder,
      avanzar,
      retroceder,
      guardarMotivo,
      guardarRecordatorios,
      adoptarCuenta,
      terminar,
    },
  }
}

export default useOnboarding
