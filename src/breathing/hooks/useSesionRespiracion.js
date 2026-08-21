// src/breathing/hooks/useSesionRespiracion.js
// Lo único que sabe a la vez del motor, del audio y de la base (SPEC_16 §9).
//
// Es el sitio donde converge todo lo que las tres specs anteriores dejaron
// deliberadamente suelto, y por eso concentra los efectos que ninguna de ellas
// podía tener:
//
//   · Las visuales de SPEC_14 no pueden tener `useEffect` ni temporizadores
//     (RN-RE-VIS-02), así que **el bucle de frames vive aquí** y les habla por
//     su referencia con `pintar()`.
//   · La máquina de SPEC_13 no toca el DOM, así que **el oyente de
//     `visibilitychange` vive aquí** y le pasa la ausencia (caso 9.4).
//   · La capa de audio de SPEC_15 no conoce el ciclo de vida de una pantalla,
//     así que **el `AudioContext` se pide aquí, dentro del gesto** (§2.2), y se
//     suelta al desmontar.
//
// Todo lo que se le añada a este archivo conviene mirarlo dos veces: es el único
// punto de la respiración donde un error se manifiesta como "a veces falla".

import { useCallback, useEffect, useRef, useState } from 'react'

import { ESTADOS, crearMaquina } from '@lib/respiracion/maquinaSesion'
import { resolverEstado } from '@lib/respiracion/motorRitmo'
import { adquirir, liberar, reanudar } from '@lib/audio/contextoAudio'
import { crearAudioRespiracion } from '@lib/audioRespiracion'
import { crearMotorAmbiente } from '../audio/motorAmbiente.js'
import { ID_SILENCIO } from '../data/catalogoSonidos.js'

/** Las fases en las que suena la guía. En las retenciones, el silencio marca. */
const FASES_CON_PULSO = new Set(['inhalar', 'exhalar'])

/**
 * @param {object} configuracion - patrón, visual, sonido, volúmenes y duración.
 * @param {{alCompletar?: Function}} [manejadores]
 */
export function useSesionRespiracion(configuracion, { alCompletar = null } = {}) {
  // Lo único que pasa por React: el estado de sesión y la fase. Cambian nueve
  // veces en cuarenta segundos, no sesenta por segundo (RN-RE-VIS-33).
  const [estadoSesion, setEstadoSesion] = useState(ESTADOS.INACTIVO)
  const [estadoRitmo, setEstadoRitmo] = useState(null)

  const maquina = useRef(null)
  const visual = useRef(null)
  const ambiente = useRef(null)
  const guia = useRef(null)
  const frame = useRef(null)
  const oculta = useRef(null)
  const config = useRef(configuracion)

  config.current = configuracion

  /** El bucle de frames. No hay `setState` aquí dentro, y es a propósito. */
  const pintarFrame = useCallback(() => {
    const instantanea = maquina.current?.instantanea()
    if (instantanea?.ritmo) visual.current?.pintar(instantanea.ritmo)
    frame.current = requestAnimationFrame(pintarFrame)
  }, [])

  const pararBucle = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }, [])

  /** Suelta absolutamente todo. Idempotente (RN-RE-SND-22). */
  const soltarTodo = useCallback(() => {
    pararBucle()
    maquina.current?.detener()
    maquina.current = null
    ambiente.current?.liberar()
    ambiente.current = null
    guia.current?.detener()
    guia.current = null
  }, [pararBucle])

  useEffect(() => soltarTodo, [soltarTodo])

  /**
   * Caso 9.4 — Volver tras una ausencia larga.
   *
   * Si estuvo fuera más de un ciclo, la máquina pausa: **no se finge que la
   * sesión siguió**. Honestidad por encima de continuidad, que es la misma
   * decisión que gobierna toda la app.
   */
  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    function alCambiarVisibilidad() {
      if (document.visibilityState === 'hidden') {
        oculta.current = Date.now()
        return
      }
      const desde = oculta.current
      oculta.current = null
      if (desde === null) return
      maquina.current?.notificarAusencia(Date.now() - desde)
      // RN-RE-SND-24 — Al volver el foco, el contexto puede venir suspendido.
      reanudar().then((corriendo) => {
        if (corriendo) aplicarAudio(maquina.current?.instantanea()?.estado)
      })
    }

    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  }, [])

  /** Traduce el estado de sesión a volúmenes. La regla vive en el mezclador. */
  function aplicarAudio(estado) {
    if (!ambiente.current || !estado) return
    ambiente.current.aplicarEstado({
      estadoSesion: estado,
      volumenAmbiente: config.current.volumenAmbiente,
      volumenGuia: config.current.volumenGuia,
      guiaActiva: config.current.guiaSonoraActiva,
    })
    // RN-RE-SND-13 — Al pausar la guía se calla del todo.
    guia.current?.silenciar(estado === ESTADOS.PAUSADO || !config.current.guiaSonoraActiva)
  }

  /**
   * Arranca. **Se llama desde el manejador del toque**, y de ahí cuelga todo lo
   * demás: es el único instante en que un navegador entrega un `AudioContext`
   * que suena (RN-AUD-01, §2.2).
   *
   * Caso 8.13 — Idempotente: el segundo toque no crea una segunda sesión.
   */
  const empezar = useCallback(() => {
    if (maquina.current !== null) return

    const ctx = adquirir()
    if (ctx !== null) {
      ambiente.current = crearMotorAmbiente(ctx)
      const sonido = config.current.sonidoAmbienteId ?? ID_SILENCIO
      if (sonido !== ID_SILENCIO) ambiente.current.cambiarSonido(sonido)
      // RN-RE-SND-09 — Entra durante el acomodo, para estar ya presente cuando
      // arranque el primer inhalar.
      ambiente.current.entrar()

      if (config.current.guiaSonoraActiva) {
        guia.current = crearAudioRespiracion()
        guia.current.iniciar()
      }
    }

    maquina.current = crearMaquina({
      patron: config.current.patron,
      duracion: config.current.duracion,
      alCambiarEstado(estado) {
        setEstadoSesion(estado)
        aplicarAudio(estado)
        if (estado === ESTADOS.COMPLETADO) {
          pararBucle()
          const duracionSalida = ambiente.current?.salir(
            maquina.current?.resumen()?.terminadaPorPersona ? 'terminar' : 'completado',
          )
          alCompletar?.(maquina.current?.resumen(), duracionSalida)
        }
      },
      /**
       * RN-RE-SND-19/20 — La guía se dispara desde **el cambio de fase que emite
       * el motor**, nunca desde un temporizador propio. Fuente de verdad única:
       * dos relojes para el mismo pulso acaban separándose, y el desfase entre
       * lo que se ve y lo que se oye es de lo peor que puede pasar aquí.
       */
      alCambiarFase(ritmo) {
        setEstadoRitmo(ritmo)
        if (!FASES_CON_PULSO.has(ritmo.fase)) {
          guia.current?.fase('pausa', 0)
          return
        }
        guia.current?.fase(ritmo.fase, ritmo.msRestantesFase / 1000)
      },
    })

    maquina.current.iniciar()
    pararBucle()
    frame.current = requestAnimationFrame(pintarFrame)
  }, [alCompletar, pintarFrame, pararBucle])

  const pausar = useCallback(() => maquina.current?.pausar(), [])
  const reanudarSesion = useCallback(() => maquina.current?.reanudar(), [])
  const saltarAcomodo = useCallback(() => maquina.current?.saltarAcomodo(), [])

  /** RN-RE-NAV-27 — Salir no pide confirmación. Strivo no retiene. */
  const terminar = useCallback(() => maquina.current?.terminar(), [])

  /** Al salir de la pantalla: todo suelto, incluido el contexto compartido. */
  const salir = useCallback(() => {
    soltarTodo()
    liberar()
    setEstadoSesion(ESTADOS.INACTIVO)
    setEstadoRitmo(null)
  }, [soltarTodo])

  /**
   * RN-RE-NAV-24 — Cambiar de sonido o de volumen **sin interrumpir el ritmo**.
   * La máquina ni se entera: sigue corriendo donde estaba, y lo único que se
   * toca es el grafo de audio.
   */
  const ajustarEnVivo = useCallback(
    (cambios) => {
      config.current = { ...config.current, ...cambios }
      if (cambios.sonidoAmbienteId !== undefined) {
        ambiente.current?.cambiarSonido(cambios.sonidoAmbienteId)
      }
      if (cambios.volumenAmbiente !== undefined) {
        ambiente.current?.ajustarVolumen(cambios.volumenAmbiente)
      }
      aplicarAudio(maquina.current?.instantanea()?.estado ?? estadoSesion)
    },
    [estadoSesion],
  )

  /** Lo que la pantalla necesita para pintar el progreso. */
  const instantanea = useCallback(() => maquina.current?.instantanea() ?? null, [])
  const resumen = useCallback(() => maquina.current?.resumen() ?? null, [])

  return {
    estadoSesion,
    estadoRitmo,
    refVisual: visual,
    empezar,
    pausar,
    reanudar: reanudarSesion,
    saltarAcomodo,
    terminar,
    salir,
    ajustarEnVivo,
    instantanea,
    resumen,
    /** Para la vista previa de `inactivo`: el ritmo sin sesión (§9 de SPEC_14). */
    ritmoPrevio: () => resolverEstado(config.current.patron, 0),
  }
}

export default useSesionRespiracion
