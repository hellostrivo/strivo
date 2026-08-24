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

  /**
   * Si tenemos un préstamo del `AudioContext` en pie.
   *
   * Hacía falta desde que la vista previa de la pantalla de configuración monta
   * el motor de ambiente **antes** de que haya sesión: sin llevar la cuenta,
   * `empezar()` pediría un segundo préstamo sobre el mismo contexto y `salir()`
   * solo soltaría uno. El contexto nunca llegaría a cerrarse y la siguiente
   * visita heredaría el grafo de la anterior — que es exactamente la clase de
   * fallo que se manifiesta como "a veces el sonido no arranca".
   */
  const prestado = useRef(false)

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

  /**
   * El motor de ambiente, montado sobre el único contexto de la app.
   *
   * **Se llama siempre desde el manejador de un toque** (RN-AUD-01, §2.2): tanto
   * la vista previa de un sonido como "Empezar" son gestos, y ese es el único
   * instante en que un navegador entrega un contexto que suena.
   *
   * `reanudar()` no sobra aunque estemos dentro del gesto: `adquirir()` puede
   * devolver un contexto **que ya existía** —lo creó la respiración diaria de
   * Lumia, o esta misma pantalla antes de que el teléfono se bloqueara— y un
   * contexto reutilizado llega suspendido, sin error y sin sonido. Era la otra
   * mitad del "a veces suena y a veces no".
   */
  const asegurarAudio = useCallback(() => {
    if (ambiente.current !== null) {
      reanudar()
      return ambiente.current
    }
    const ctx = adquirir()
    if (ctx === null) return null
    prestado.current = true
    ambiente.current = crearMotorAmbiente(ctx)
    reanudar()
    return ambiente.current
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

  // Al desmontar no queda nada vivo **y el préstamo se devuelve**. Antes solo lo
  // devolvía `salir()`, así que salir por el botón atrás del navegador dejaba el
  // contexto abierto para siempre (RN-AUD-04).
  useEffect(
    () => () => {
      soltarTodo()
      if (prestado.current) {
        prestado.current = false
        liberar()
      }
    },
    [soltarTodo],
  )

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
    // Caso 8.13 — Idempotente mientras hay sesión viva. **Pero una sesión ya
    // terminada no cuenta**: `maquina.current` sigue en pie tras `completado` y
    // con la guarda a secas "Otra vez" del cierre no hacía absolutamente nada.
    // Se tira la máquina agotada y se monta una nueva; el audio no se toca, que
    // es lo que permite que el ambiente siga sonando entre una y otra.
    if (maquina.current !== null) {
      if (maquina.current.instantanea()?.estado !== ESTADOS.COMPLETADO) return
      pararBucle()
      maquina.current.detener()
      maquina.current = null
    }

    const motor = asegurarAudio()
    if (motor !== null) {
      const sonido = config.current.sonidoAmbienteId ?? ID_SILENCIO
      // `confirmarSonido` en vez de `cambiarSonido`: cancela el apagado
      // automático de la vista previa sin cortar lo que ya está sonando. Sin
      // esto, empezar justo después de escuchar un sonido lo dejaba enmudecer
      // solo a los veinte segundos, a mitad de sesión.
      motor.confirmarSonido(sonido)
      // RN-RE-SND-09 — Entra durante el acomodo, para estar ya presente cuando
      // arranque el primer inhalar.
      motor.entrar()

      if (config.current.guiaSonoraActiva && guia.current === null) {
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
  }, [alCompletar, asegurarAudio, pintarFrame, pararBucle])

  const pausar = useCallback(() => maquina.current?.pausar(), [])
  const reanudarSesion = useCallback(() => maquina.current?.reanudar(), [])
  const saltarAcomodo = useCallback(() => maquina.current?.saltarAcomodo(), [])

  /** RN-RE-NAV-27 — Salir no pide confirmación. Strivo no retiene. */
  const terminar = useCallback(() => maquina.current?.terminar(), [])

  /** Al salir de la pantalla: todo suelto, incluido el contexto compartido. */
  const salir = useCallback(() => {
    soltarTodo()
    if (prestado.current) {
      prestado.current = false
      liberar()
    }
    setEstadoSesion(ESTADOS.INACTIVO)
    setEstadoRitmo(null)
  }, [soltarTodo])

  /**
   * RN-RE-SND-27/28 — Escuchar un sonido al tocarlo, antes de empezar.
   *
   * **Estaba construido entero y no lo llamaba nadie**: `PantallaRespiracion`
   * declaraba la prop `vistaPreviaSonido` y el contenedor nunca se la pasaba, así
   * que elegir un sonido en la pantalla de configuración era mudo — y el único
   * momento en que se oía algo era ya dentro de la sesión. Aquí se cierra el
   * cable, y de paso es el gesto que crea el `AudioContext` (RN-RE-SND-29).
   *
   * El cruce lo hace `cambiarSonido`, que suelta la fuente anterior de verdad
   * antes de montar la nueva: cinco toques seguidos dejan exactamente una fuente
   * viva, nunca dos superpuestas (caso 6.3).
   */
  const vistaPreviaSonido = useCallback(
    (id) => {
      // Con la sesión en marcha no hay vista previa que valga: se cambia en vivo
      // y se queda. Dos caminos de audio a la vez es como se solapan los sonidos.
      if (maquina.current !== null) return
      const motor = asegurarAudio()
      if (motor === null) return
      if (id === ID_SILENCIO) motor.detenerVistaPrevia()
      else motor.vistaPrevia(id)
    },
    [asegurarAudio],
  )

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
    vistaPreviaSonido,
    instantanea,
    resumen,
    /** Para la vista previa de `inactivo`: el ritmo sin sesión (§9 de SPEC_14). */
    ritmoPrevio: () => resolverEstado(config.current.patron, 0),
  }
}

export default useSesionRespiracion
