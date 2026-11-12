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
import {
  actual,
  adquirir,
  alSiguienteToque,
  audioMudo,
  despertarAlVolver,
  liberar,
  medirReloj,
  reanudar,
  sonoFuera,
} from '@lib/audio/contextoAudio'
import { avisar } from '@lib/audio/observadorAudio'
import {
  estadoDelCuadro,
  ponerCuadro,
  quitarCuadro,
  reclamar,
  soltar,
  vigilar,
} from '@lib/audio/sesionAudio'
import { crearAcompanamientoDeFondo } from '@lib/respiracion/acompanamientoDeFondo'
import { crearAudioRespiracion } from '@lib/audioRespiracion'
import { toqueSuave } from '@lib/haptica'
import { crearMotorAmbiente } from '../audio/motorAmbiente.js'
import { ID_SILENCIO } from '../data/catalogoSonidos.js'

/**
 * SPEC_23B — ¿Toca vibrar en un cambio de fase con la sesión en este estado?
 * Solo con el ritmo de verdad en marcha: `activo` o `cerrando` (el último
 * ciclo). Nunca en el acomodo, en pausa ni sin sesión.
 */
export function vibraEnFase(estado) {
  return estado === ESTADOS.ACTIVO || estado === ESTADOS.CERRANDO
}

/** Las fases en las que suena la guía. En las retenciones, el silencio marca. */
const FASES_CON_PULSO = new Set(['inhalar', 'exhalar'])

/**
 * Los estados en los que, al volver a la app, el ambiente vuelve a su volumen.
 * En `completado` ya se fue con su fundido de salida y en `inactivo` no hay
 * sesión: restablecerlo ahí lo haría sonar otra vez sobre el cierre.
 */
const ESTADOS_QUE_SUENAN = new Set([
  ESTADOS.ACOMODANDO,
  ESTADOS.ACTIVO,
  ESTADOS.PAUSADO,
  ESTADOS.CERRANDO,
])

/**
 * @param {object} configuracion - patrón, visual, sonido, volúmenes y duración.
 * @param {{alCompletar?: Function}} [manejadores]
 */
export function useSesionRespiracion(configuracion, { alCompletar = null, cuadro = null } = {}) {
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
  /** Cancela la espera para despertar el audio al volver a la app (D-21.13). */
  const retirarEsperaDeToque = useRef(null)
  const config = useRef(configuracion)

  // ─── SPEC_23 Parte 2: el sonido fuera de la app ─────────────────────────────
  /** Si esta sesión reclamó «reproducción» (tiene sonido). */
  const conSonidoReclamado = useRef(false)
  /** Lo que WebKit hace con el contexto: pausa y reproducir de la pantalla de bloqueo. */
  const vigilancia = useRef(null)
  /** La pausa vino de la pantalla de bloqueo: solo esa se reanuda sola. */
  const pausadaDesdeBloqueo = useRef(false)
  /** Con la app fuera y sonido, la guía va programada por adelantado. */
  const enFondo = useRef(false)
  const fondo = useRef(null)
  /** El reloj del audio y el de pared al irse, para saber si sonó fuera. */
  const alIrse = useRef(null)
  /** Cancela la reconstrucción que espera al siguiente toque (DP-23.21). */
  const retirarReconstruccion = useRef(null)
  /** Suelta el sonido al acabar el fundido final (DP-23.19). */
  const temporizadorSoltar = useRef(null)
  const textosCuadro = useRef(cuadro)
  textosCuadro.current = cuadro

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
   * diaria, o esta misma pantalla antes de que el teléfono se bloqueara— y un
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
    retirarEsperaDeToque.current?.()
    retirarEsperaDeToque.current = null
    // SPEC_23 Parte 2 — `'auto'` antes de cerrar nada, y el cuadro fuera.
    soltarSonido()
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
        const ctx = actual()
        alIrse.current = ctx ? { audio: ctx.currentTime, pared: performance.now() } : null
        // DP-23.22 — Con sonido, la guía sigue programada por adelantado.
        if (conSonidoReclamado.current && maquina.current) {
          enFondo.current = true
          obtenerFondo().entrar()
        }
        return
      }
      const desde = oculta.current
      oculta.current = null
      if (desde === null) return

      // Vuelve la app: lo programado se cancela y la guía sigue con `fase()`
      // desde el valor que suena; el fundido final, si no terminó, también.
      if (enFondo.current) {
        enFondo.current = false
        fondo.current?.salir()
        const estado = maquina.current?.instantanea()?.estado
        if (ambiente.current?.saliendo() && estado !== ESTADOS.COMPLETADO) restablecerAudio(estado)
        if (vibraEnFase(estado)) resincronizarGuia()
      }

      // DP-23.23 — Si la sesión tenía sonido y sonó fuera, siguió.
      const ctx = actual()
      const ido = alIrse.current
      alIrse.current = null
      const sono =
        conSonidoReclamado.current &&
        ido !== null &&
        ctx !== null &&
        sonoFuera({
          avanceAudio: ctx.currentTime - ido.audio,
          segundosFuera: (performance.now() - ido.pared) / 1000,
        })
      maquina.current?.notificarAusencia(Date.now() - desde, { sono })
      // RN-RE-SND-24 — Al volver el foco, el contexto puede venir suspendido, o
      // `'interrupted'` en iOS (D-21.13). Se intenta ya; si WebKit exige un
      // gesto, se espera al siguiente toque en esta pantalla. Sin eso la sesión
      // seguía y el sonido no volvía nunca. Cuando corre, el volumen vuelve con
      // la rampa de la vuelta, una sola vez.
      if (ambiente.current === null) return
      retirarEsperaDeToque.current?.()
      retirarEsperaDeToque.current = despertarAlVolver(document, () => {
        retirarEsperaDeToque.current = null
        restablecerAudio(maquina.current?.instantanea()?.estado)
      })

      // DP-23.21 — El respaldo: si el audio no vuelve (iOS 16, o el fallo de
      // WebKit tras una llamada), el siguiente toque reconstruye el motor.
      if (!conSonidoReclamado.current) return
      const medido = actual()
      medirReloj(medido).then((medida) => {
        if (actual() !== medido || !conSonidoReclamado.current) return
        const mudo = audioMudo({
          ...medida,
          pasoPorInterrumpido: vigilancia.current?.pasoPorInterrumpido() ?? false,
        })
        vigilancia.current?.olvidarInterrupcion()
        if (mudo !== true) return
        retirarEsperaDeToque.current?.()
        retirarEsperaDeToque.current = null
        retirarReconstruccion.current?.()
        retirarReconstruccion.current = alSiguienteToque(document, () => {
          retirarReconstruccion.current = null
          reconstruirAudio()
        })
      })
    }

    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  }, [])

  /**
   * RN-RE-SND-24 — Al volver a la app con el contexto ya corriendo, el ambiente
   * vuelve a su volumen con `restablecer()` —la rampa de 0,4 s de
   * `FUNDIDOS.reanudarContexto`— y no con la de pausa de `aplicarAudio`
   * (D-21.13). La guía no pasa por el mezclador: se vuelve a callar o no según
   * el estado, igual que en `aplicarAudio`.
   */
  function restablecerAudio(estado) {
    if (!ambiente.current || !ESTADOS_QUE_SUENAN.has(estado)) return
    ambiente.current.restablecer({
      estadoSesion: estado,
      volumenAmbiente: config.current.volumenAmbiente,
    })
    guia.current?.silenciar(estado === ESTADOS.PAUSADO || !config.current.guiaSonoraActiva)
  }

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

  // ─── SPEC_23 Parte 2: el sonido fuera de la app ─────────────────────────────

  /** ¿Esta configuración suena? Ambiente distinto de silencio, o guía. */
  function conSonido() {
    const actualConfig = config.current
    return (
      (actualConfig.sonidoAmbienteId ?? ID_SILENCIO) !== ID_SILENCIO ||
      actualConfig.guiaSonoraActiva === true
    )
  }

  /** La fase en curso, con `fase()`, desde el valor que suena ahora. */
  function resincronizarGuia() {
    const ritmo = maquina.current?.instantanea()?.ritmo
    if (!ritmo || !guia.current) return
    if (FASES_CON_PULSO.has(ritmo.fase)) {
      guia.current.fase(ritmo.fase, ritmo.msRestantesFase / 1000)
    } else {
      guia.current.fase('pausa', 0)
    }
  }

  /**
   * DP-23.24 y 23.25 — Lo que WebKit hace con el contexto. Con Web Audio, los
   * botones de la pantalla de bloqueo no llaman a nuestro código: WebKit
   * suspende o reanuda el contexto, y aquí se lee. Una llamada lo interrumpe:
   * se pausa y **no** se reanuda sola al colgar; se reanuda con «Seguir».
   */
  function vigilarContexto() {
    vigilancia.current?.cancelar()
    vigilancia.current = vigilar(actual(), {
      alSuspender() {
        const estado = maquina.current?.instantanea()?.estado
        if (!vibraEnFase(estado)) return
        pausadaDesdeBloqueo.current = true
        maquina.current?.pausar()
      },
      alReanudar() {
        if (!pausadaDesdeBloqueo.current) return
        pausadaDesdeBloqueo.current = false
        // Reproducir llega con la app fuera. Si está a la vista, quien reanudó
        // el contexto fue la vuelta a la app, y la pausa se queda: se sigue
        // con «Seguir».
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') return
        maquina.current?.reanudar()
        const estado = maquina.current?.instantanea()?.estado
        // La vuelta con la rampa de 0,4 s (RN-RE-SND-24), no con la de pausa.
        restablecerAudio(estado)
        if (!enFondo.current) resincronizarGuia()
      },
      alInterrumpir() {
        pausadaDesdeBloqueo.current = false
        const estado = maquina.current?.instantanea()?.estado
        if (vibraEnFase(estado)) maquina.current?.pausar()
      },
    })
  }

  /**
   * DP-23.19 — Suelta «reproducción»: primero `'auto'` y después se cierra el
   * contexto, que es lo que devuelve el volumen a la música de la persona.
   * Leído en WebKit: `'auto'` sola no desactiva la sesión de audio.
   */
  function soltarSonido() {
    clearTimeout(temporizadorSoltar.current)
    temporizadorSoltar.current = null
    retirarReconstruccion.current?.()
    retirarReconstruccion.current = null
    fondo.current?.salir()
    enFondo.current = false
    vigilancia.current?.cancelar()
    vigilancia.current = null
    if (!conSonidoReclamado.current) return
    conSonidoReclamado.current = false
    quitarCuadro()
    soltar()
    guia.current?.detener()
    guia.current = null
    ambiente.current?.liberar()
    ambiente.current = null
    if (prestado.current) {
      prestado.current = false
      liberar()
    }
  }

  /** Reclama «reproducción» y pone el cuadro. Dentro del toque. */
  function reclamarSonido() {
    reclamar()
    conSonidoReclamado.current = true
    if (textosCuadro.current) ponerCuadro(textosCuadro.current)
  }

  /** Crea la guía si toca y no existe: al empezar o al encenderla a media sesión. */
  function asegurarGuia() {
    if (!config.current.guiaSonoraActiva || guia.current !== null) return
    guia.current = crearAudioRespiracion()
    guia.current.iniciar()
    const estado = maquina.current?.instantanea()?.estado
    guia.current.silenciar(estado === ESTADOS.PAUSADO)
  }

  /**
   * DP-23.21 — Cerrar el contexto y montar uno nuevo **dentro de un toque**,
   * en el punto de la sesión y con la rampa de 0,4 s. Es lo que hacía
   * «Probar con un audio nuevo» en el diagnóstico (D8), hecho normal.
   */
  function reconstruirAudio() {
    const foto = maquina.current?.instantanea()
    const estado = foto?.estado
    if (!ESTADOS_QUE_SUENAN.has(estado)) return
    vigilancia.current?.cancelar()
    guia.current?.detener()
    guia.current = null
    ambiente.current?.liberar()
    ambiente.current = null
    if (prestado.current) {
      prestado.current = false
      liberar()
    }
    if (conSonidoReclamado.current) reclamar()
    const motor = asegurarAudio()
    if (motor === null) return
    motor.confirmarSonido(config.current.sonidoAmbienteId ?? ID_SILENCIO)
    motor.restablecer({ estadoSesion: estado, volumenAmbiente: config.current.volumenAmbiente })
    asegurarGuia()
    guia.current?.silenciar(estado === ESTADOS.PAUSADO || !config.current.guiaSonoraActiva)
    if (estado !== ESTADOS.PAUSADO) resincronizarGuia()
    vigilarContexto()
  }

  /** DP-23.22 — Quien mueve la sesión y programa la guía con la app fuera. */
  function obtenerFondo() {
    if (fondo.current) return fondo.current
    fondo.current = crearAcompanamientoDeFondo({
      instante() {
        const m = maquina.current
        if (!m) return null
        m.evaluarAhora()
        const foto = m.instantanea()
        if (!foto?.ritmo) return { corriendo: false, ms: foto?.ms ?? 0, finFaseMs: 0, finMs: null }
        return {
          corriendo: vibraEnFase(foto.estado),
          ms: foto.ms,
          finFaseMs: foto.ms + foto.ritmo.msRestantesFase,
          finMs: m.msCierrePrevisto(),
        }
      },
      resolver(ms) {
        const estado = resolverEstado(config.current.patron, ms)
        return {
          fase: FASES_CON_PULSO.has(estado.fase) ? estado.fase : 'pausa',
          restanteMs: estado.msRestantesFase,
        }
      },
      guia: () => guia.current,
      relojAudio: () => actual()?.currentTime ?? null,
      sincronizar: resincronizarGuia,
      alCierre(instanteAudio) {
        ambiente.current?.salirEn('completado', instanteAudio)
      },
    })
    return fondo.current
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

    // SPEC_23 Parte 2 (DP-23.19) — Con sonido, «reproducción» se reclama aquí,
    // dentro del toque y **antes** de crear o reanudar el contexto. En
    // silencio no se reclama nada (§3.3): ni cuadro ni música ajena tocada.
    clearTimeout(temporizadorSoltar.current)
    temporizadorSoltar.current = null
    if (conSonido()) reclamarSonido()

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
        // Si el fundido final ya se programó con la pantalla bloqueada, no se
        // pisa con la rampa del estado: se deja terminar.
        if (!(estado === ESTADOS.COMPLETADO && ambiente.current?.saliendo())) aplicarAudio(estado)
        estadoDelCuadro(estado !== ESTADOS.PAUSADO)
        if (estado === ESTADOS.COMPLETADO) {
          pararBucle()
          fondo.current?.salir()
          const duracionSalida = ambiente.current?.salir(
            maquina.current?.resumen()?.terminadaPorPersona ? 'terminar' : 'completado',
          )
          // DP-23.19 — Al acabar el fundido, la música de la persona vuelve a
          // su volumen: `'auto'` y el contexto cerrado. «Otra vez» monta uno
          // nuevo en su toque.
          if (conSonidoReclamado.current) {
            clearTimeout(temporizadorSoltar.current)
            temporizadorSoltar.current = setTimeout(
              () => {
                temporizadorSoltar.current = null
                if (maquina.current?.instantanea()?.estado === ESTADOS.COMPLETADO) soltarSonido()
              },
              ((duracionSalida ?? 0) + 0.2) * 1000,
            )
          }
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
        // DP-23.22 — Con la app fuera, la guía va programada por adelantado y
        // la mano no siente nada: ni `fase()` ni toque.
        if (enFondo.current) return
        // SPEC_23B — Un toque suave en cada cambio de fase, solo con la sesión
        // corriendo. El reloj no emite durante el acomodo ni en pausa, y al
        // reanudar no repite la fase en la que se pausó; la guarda lo dice
        // igual en voz alta, por si eso cambiara algún día.
        if (vibraEnFase(maquina.current?.instantanea()?.estado)) toqueSuave()
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
    if (conSonidoReclamado.current) vigilarContexto()

    // SPEC_23C (DP-23.16 y 23.17 b) — Solo con la bandera del diagnóstico: lo
    // que el panel lee de esta sesión, y «Probar con un audio nuevo», que
    // corre dentro del toque. El orden importa: primero la guía (guarda su
    // propio préstamo), luego el ambiente y luego el préstamo de aquí; con
    // los préstamos a cero el contexto se cierra y `asegurarAudio` crea otro.
    // SPEC_23C (DP-23.16 y 23.28) — Solo con la bandera del diagnóstico: lo
    // que el panel lee de esta sesión. «Probar con un audio nuevo» ya no está:
    // la reconstrucción es comportamiento normal (DP-23.21).
    if (import.meta.env.VITE_DIAG_AUDIO === '1') {
      avisar('sesion', {
        motor: () => ambiente.current,
        programadas: () => guia.current?.programado?.() ?? null,
      })
    }
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
      const antes = conSonido()
      config.current = { ...config.current, ...cambios }
      const sesionViva =
        vibraEnFase(maquina.current?.instantanea()?.estado) ||
        maquina.current?.instantanea()?.estado === ESTADOS.PAUSADO ||
        maquina.current?.instantanea()?.estado === ESTADOS.ACOMODANDO

      // SPEC_23 Parte 2 (DP-23.19) — Pasar a silencio a media sesión suelta
      // «reproducción» (y la música ajena recupera su volumen); activar el
      // sonido la reclama en este mismo toque. El cambio de tipo vale al
      // instante para el contexto que ya suena: no hace falta reconstruirlo.
      if (sesionViva && antes && !conSonido()) {
        soltarSonido()
      } else if (sesionViva && !conSonidoReclamado.current && conSonido()) {
        reclamarSonido()
        if (ambiente.current === null) {
          const motor = asegurarAudio()
          motor?.confirmarSonido(config.current.sonidoAmbienteId ?? ID_SILENCIO)
          motor?.restablecer({
            estadoSesion: maquina.current?.instantanea()?.estado,
            volumenAmbiente: config.current.volumenAmbiente,
          })
        }
        vigilarContexto()
      }

      // Encender la guía a media sesión la crea en este toque. Hasta aquí no
      // se creaba nunca: solo al empezar.
      if (sesionViva && cambios.guiaSonoraActiva === true && guia.current === null) {
        asegurarGuia()
        if (vibraEnFase(maquina.current?.instantanea()?.estado)) resincronizarGuia()
      }

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
