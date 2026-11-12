// src/components/shared/Respiracion.jsx
// El ejercicio de respiración guiada: 5-5-3, tres ciclos (§C2.3 · §5.1.2).
//
// **Hoy lo monta un solo sitio**, «Respira un momento» de Hoy. Se escribió para
// dos —también P1 del onboarding (RN-LU-RESP-02)—, y P1 dejó de montarlo; el
// componente se queda en `components/shared/` y **no conoce ningún espacio**:
// no importa `diario/` ni `breathing/`, no lee la capa de datos y no sabe qué
// copy está pintando. Todo llega por props. Dos implementaciones divergentes es
// exactamente lo que produjo la contradicción que v4.1 vino a cerrar.
//
// **RN-LU-RESP-01 — Enteramente voluntaria.** No se abre sola, no arranca al
// montarse y la salida está visible desde el primer fotograma. Esa regla es la
// condición que hace aceptables los 39 segundos: si algún día se le añade
// activación automática, se convierte en un peaje diario y hay que revisar la
// decisión, no ignorarla.
//
// **Un solo reloj.** El mismo bucle que mueve el círculo programa la envolvente
// del tono, así que no hay dos temporizadores que puedan desfasarse (§6.12.1).
// La escala se escribe directamente sobre el nodo, no en el estado de React:
// sesenta renders por segundo para mover un círculo sería caro y además
// innecesario — lo único que cambia de verdad nueve veces en 39 s es la fase.
//
// RN-AUD-01 — El contexto de audio se crea dentro del manejador del gesto que
// arranca el ejercicio, que es lo que hace el botón de empezar.

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { despertarAlVolver } from '@lib/audio/contextoAudio'
// SPEC_23 Parte 2 (DP-23.21) — El respaldo, del mismo módulo y aparte: la
// línea de arriba es la del camino de vuelta de D-21.13, que una prueba vigila.
import { actual, alSiguienteToque, audioMudo, medirReloj } from '@lib/audio/contextoAudio'
import { avisar } from '@lib/audio/observadorAudio'
import { ponerCuadro, quitarCuadro, reclamar, soltar, vigilar } from '@lib/audio/sesionAudio'
import { crearAudioRespiracion } from '@lib/audioRespiracion'
import { toqueSuave } from '@lib/haptica'
import { crearAcompanamientoDeFondo } from '@lib/respiracion/acompanamientoDeFondo'
import {
  CICLOS,
  DURACION_CICLO,
  OPACIDAD_ESTATICA,
  claveDeFase,
  escalaEn,
  faseEn,
} from '@lib/ritmoRespiracion'
import { unaVezCon } from './unaVez'

// SPEC_23C (DP-23.16) — El panel del diagnóstico del audio, solo con su bandera.
const DiagnosticoAudio =
  import.meta.env.VITE_DIAG_AUDIO === '1' ? lazy(() => import('./DiagnosticoAudio')) : null

/** ¿Está activada la preferencia del sistema? Se consulta, no se asume. */
function usaMovimientoReducido() {
  const [reducido, setReducido] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducido(consulta.matches)
    const alCambiar = (evento) => setReducido(evento.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  return reducido
}

/**
 * @param {object}   textos      - Namespace de copy de quien lo monta.
 * @param {number}   [ciclos]    - Tres, y los mismos en P1 (RN-LU-RESP-02).
 * @param {boolean}  [sonido]    - Preferencia persistida. Silenciado por
 *                                 defecto, coherente con §6.12 y con A-03.
 * @param {Function} [onSonido]  - Persiste el cambio de preferencia.
 * @param {Function} onSalir     - Saltar y cerrar al terminar van al mismo sitio.
 */
export default function Respiracion({
  textos,
  ciclos = CICLOS,
  sonido = false,
  onSonido,
  onSalir,
  cuadro: textosCuadro = null,
}) {
  const [corriendo, setCorriendo] = useState(false)
  const [empezado, setEmpezado] = useState(false)
  const [fase, setFase] = useState(null)
  const [silenciado, setSilenciado] = useState(!sonido)
  const reducido = usaMovimientoReducido()

  const circulo = useRef(null)
  const audio = useRef(null)
  const cuadro = useRef(null)
  // Lo que se lleva respirado. Vive fuera del estado porque lo lee el bucle en
  // cada fotograma y porque pausar tiene que poder retomarlo donde lo dejó.
  const transcurrido = useRef(0)
  const desde = useRef(0)
  const faseActual = useRef(null)
  // SPEC_23B — La última fase que vibró (ciclo y fase). No se borra al pausar
  // ni al volver a la app, a diferencia de `faseActual`: así la misma fase no
  // vibra dos veces.
  const ultimoToque = useRef(null)
  // Un «Empezar» a la vez: un doble toque mientras se crea el audio dejaba dos
  // bucles, y el huérfano seguía emitiendo fases —y vibrando— en la pausa.
  const arrancando = useRef(false)
  const unaVez = useRef(unaVezCon(arrancando)).current
  // Cancela la espera para despertar el audio al volver a la app (D-21.13).
  const cancelarDespertar = useRef(null)

  // ─── SPEC_23 Parte 2 (DP-23.26): lo mismo que la sección, a su escala ───────
  // Con el sonido activado reclama «reproducción»: suena fuera de la app, la
  // guía sigue con la pantalla bloqueada y, si termina fuera, al volver ya está
  // cerrada. En silencio, nada de esto.
  const reclamado = useRef(false)
  const vigilancia = useRef(null)
  const pausadaDesdeBloqueo = useRef(false)
  const fondo = useRef(null)
  const enFondo = useRef(false)
  const retirarReconstruccion = useRef(null)
  // Espejos del estado para lo que corre fuera de React (temporizador, WebKit).
  const corriendoAhora = useRef(false)
  const silenciadoAhora = useRef(!sonido)
  silenciadoAhora.current = silenciado

  const parar = useCallback(() => {
    if (cuadro.current) cancelAnimationFrame(cuadro.current)
    cuadro.current = null
  }, [])

  /** Lo que se lleva respirado ahora mismo, en ms. */
  const msAhora = () =>
    transcurrido.current + (corriendoAhora.current ? performance.now() - desde.current : 0)

  /** Reclama «reproducción» y pone el cuadro. Dentro del toque, antes del contexto. */
  const reclamarSonido = () => {
    reclamar()
    reclamado.current = true
    if (textosCuadro) ponerCuadro(textosCuadro)
  }

  /**
   * Suelta «reproducción»: primero `'auto'` y después se cierra el contexto
   * deteniendo la guía, que es su único préstamo. Así la música de la persona
   * recupera su volumen (DP-23.19).
   */
  const soltarSonido = () => {
    fondo.current?.salir()
    enFondo.current = false
    vigilancia.current?.cancelar()
    vigilancia.current = null
    retirarReconstruccion.current?.()
    retirarReconstruccion.current = null
    if (!reclamado.current) return
    reclamado.current = false
    quitarCuadro()
    soltar()
    audio.current?.detener()
    audio.current = null
  }

  /** RN-AUD-04 — Al salir no queda ni un nodo vivo ni un temporizador suelto. */
  const limpiar = useCallback(() => {
    cancelarDespertar.current?.()
    cancelarDespertar.current = null
    corriendoAhora.current = false
    soltarSonido()
    parar()
    audio.current?.detener()
    audio.current = null
    // `soltarSonido` cambia en cada pintado y no decide nada aquí.
  }, [parar])

  useEffect(() => limpiar, [limpiar])

  /**
   * D-21.13 — Al volver a la app, el sonido vuelve (RN-RE-SND-24).
   *
   * En iOS WebKit deja el contexto `'interrupted'` al pasar a segundo plano y
   * puede exigir un gesto para despertarlo. Es el mismo camino que la sección
   * de Respiración (`despertarAlVolver`): se intenta ya y, si no corre, con el
   * siguiente toque en esta pantalla, una sola vez. Cuando corre se vuelve a
   * poner el silencio que tocaba y se olvida la fase, para que el siguiente
   * fotograma reprograme la envolvente desde donde va el círculo y no desde
   * donde se quedó el reloj del audio.
   */
  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    function alCambiarVisibilidad() {
      // DP-23.26 — Con sonido, la guía sigue programada por adelantado.
      if (document.visibilityState === 'hidden') {
        if (reclamado.current && audio.current) {
          enFondo.current = true
          obtenerFondo().entrar()
        }
        return
      }
      if (enFondo.current) {
        enFondo.current = false
        fondo.current?.salir()
        // El siguiente fotograma sigue desde el valor que suena.
        faseActual.current = null
      }
      if (!audio.current) return
      vigilarRespaldo()
      const guia = audio.current
      cancelarDespertar.current?.()
      cancelarDespertar.current = despertarAlVolver(
        document,
        () => {
          cancelarDespertar.current = null
          if (audio.current !== guia) return
          guia.restablecer()
          faseActual.current = null
        },
        { reanudar: () => guia.reanudar() },
      )
    }

    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  }, [])

  const terminar = useCallback(() => {
    limpiar()
    onSalir()
  }, [limpiar, onSalir])

  /** Retoma sin gesto: lo usa el «reproducir» de la pantalla de bloqueo. */
  const seguir = () => {
    if (corriendoAhora.current || !audio.current) return
    desde.current = performance.now()
    corriendoAhora.current = true
    setCorriendo(true)
    cuadro.current = requestAnimationFrame(avanzar)
  }

  /**
   * DP-23.24 y 23.25 — Lo que WebKit hace con el contexto: la pausa y el
   * reproducir de la pantalla de bloqueo, o una llamada, que pausa y no se
   * reanuda sola.
   */
  function vigilarContexto() {
    vigilancia.current?.cancelar()
    vigilancia.current = vigilar(actual(), {
      alSuspender() {
        if (!corriendoAhora.current) return
        pausadaDesdeBloqueo.current = true
        pausar()
      },
      alReanudar() {
        if (!pausadaDesdeBloqueo.current) return
        pausadaDesdeBloqueo.current = false
        if (document.visibilityState === 'visible') return
        seguir()
      },
      alInterrumpir() {
        pausadaDesdeBloqueo.current = false
        if (corriendoAhora.current) pausar()
      },
    })
  }

  /** DP-23.26 — Con la app fuera: el reloj avanza por tics y la guía va por delante. */
  function obtenerFondo() {
    if (fondo.current) return fondo.current
    const total = DURACION_CICLO * ciclos
    fondo.current = crearAcompanamientoDeFondo({
      instante() {
        if (!corriendoAhora.current)
          return { corriendo: false, ms: msAhora(), finFaseMs: 0, finMs: total }
        const ms = msAhora()
        const punto = faseEn(ms, ciclos)
        if (punto.terminado) {
          // Terminó con la app fuera: al volver ya está cerrada, como hoy.
          terminar()
          return null
        }
        return { corriendo: true, ms, finFaseMs: ms + punto.restante, finMs: total }
      },
      resolver(ms) {
        const punto = faseEn(ms, ciclos)
        return punto.terminado ? null : { fase: punto.fase, restanteMs: punto.restante }
      },
      guia: () => audio.current,
      relojAudio: () => audio.current?.ahora?.() ?? null,
      sincronizar() {
        const punto = faseEn(msAhora(), ciclos)
        if (!punto.terminado) audio.current?.fase(punto.fase, punto.restante / 1000)
      },
    })
    return fondo.current
  }

  /** La guía nueva, dentro del toque: la del respaldo y la de activar el sonido. */
  const montarGuia = () => {
    audio.current?.detener()
    audio.current = crearAudioRespiracion()
    const guia = audio.current
    guia.iniciar().then(() => {
      if (audio.current !== guia) return
      guia.silenciar(silenciadoAhora.current)
      if (reclamado.current) vigilarContexto()
    })
    faseActual.current = null
  }

  /**
   * DP-23.21 — Al volver con sonido: si el audio está mudo (iOS 16, o el
   * fallo de WebKit tras una llamada), el siguiente toque monta una guía nueva.
   */
  function vigilarRespaldo() {
    if (!reclamado.current) return
    const medido = actual()
    medirReloj(medido).then((medida) => {
      if (actual() !== medido || !reclamado.current) return
      const mudo = audioMudo({
        ...medida,
        pasoPorInterrumpido: vigilancia.current?.pasoPorInterrumpido() ?? false,
      })
      vigilancia.current?.olvidarInterrupcion()
      if (mudo !== true) return
      cancelarDespertar.current?.()
      cancelarDespertar.current = null
      retirarReconstruccion.current?.()
      retirarReconstruccion.current = alSiguienteToque(document, () => {
        retirarReconstruccion.current = null
        if (reclamado.current) reclamar()
        montarGuia()
      })
    })
  }

  const avanzar = useCallback(() => {
    const ms = transcurrido.current + (performance.now() - desde.current)
    const punto = faseEn(ms, ciclos)

    if (punto.terminado) {
      // §C2.3 — El avance automático de R1 sobrevive como **cierre** automático:
      // al acabar el último ciclo no hay pantalla siguiente a la que ir.
      terminar()
      return
    }

    if (punto.fase !== faseActual.current) {
      faseActual.current = punto.fase
      setFase(punto.fase)
      audio.current?.fase(punto.fase, punto.restante / 1000)
      const clave = claveDeFase(punto)
      if (clave !== ultimoToque.current) {
        ultimoToque.current = clave
        toqueSuave()
      }
    }

    if (circulo.current) {
      circulo.current.style.transform = reducido
        ? null
        : `scale(${escalaEn(punto.fase, punto.progreso)})`
      circulo.current.style.opacity = reducido ? String(OPACIDAD_ESTATICA[punto.fase]) : null
    }

    cuadro.current = requestAnimationFrame(avanzar)
  }, [ciclos, reducido, terminar])

  const arrancar = () =>
    unaVez(async () => {
      // Si ya hay un bucle en marcha, no se arranca otro.
      if (cuadro.current) return
      // El contexto de audio nace **aquí dentro**, en el manejador del gesto
      // (RN-AUD-01). Si arrancara al montarse, el gesto habría ocurrido en la
      // pantalla anterior y el navegador entregaría un contexto suspendido.
      // DP-23.26 — Con el sonido activado, «reproducción» antes del contexto.
      if (!silenciado && !reclamado.current) reclamarSonido()
      if (!audio.current) {
        audio.current = crearAudioRespiracion()
        await audio.current.iniciar()
        audio.current.silenciar(silenciado)
        if (reclamado.current) vigilarContexto()
        // SPEC_23C (DP-23.28) — Solo con la bandera del diagnóstico: lo que el
        // panel lee. La reconstrucción ya es comportamiento normal.
        if (import.meta.env.VITE_DIAG_AUDIO === '1') {
          avisar('momento', {
            motor: () => audio.current,
            programadas: () => audio.current?.programado?.() ?? null,
          })
        }
      }
      desde.current = performance.now()
      corriendoAhora.current = true
      setEmpezado(true)
      setCorriendo(true)
      cuadro.current = requestAnimationFrame(avanzar)
    })

  const pausar = () => {
    if (!corriendoAhora.current) return
    transcurrido.current += performance.now() - desde.current
    corriendoAhora.current = false
    parar()
    setCorriendo(false)
    // Silencio real mientras está en pausa: un tono sostenido de fondo sería
    // justo lo contrario de lo que pide una pausa.
    audio.current?.fase('pausa', 0)
    faseActual.current = null
  }

  const alternarSonido = () => {
    const siguiente = !silenciado
    setSilenciado(siguiente)
    silenciadoAhora.current = siguiente
    // DP-23.19 — Activar el sonido reclama «reproducción» en este toque;
    // silenciarlo la suelta y cierra el contexto, y la música de la persona
    // recupera su volumen. Sin empezar todavía, lo decide «Empezar».
    if (empezado && !siguiente && !reclamado.current) {
      reclamarSonido()
      if (audio.current) vigilarContexto()
      else montarGuia()
    } else if (siguiente && reclamado.current) {
      soltarSonido()
    }
    audio.current?.silenciar(siguiente)
    onSonido?.(!siguiente)
  }

  return (
    // Cabe entera en la ventana que de verdad se ve (3 oct 2026). Medía
    // `min-h-screen` —`100vh`, que en un teléfono incluye la barra del
    // navegador— y repartía con `justify-between`: el título quedaba pegado
    // arriba y «Activar el sonido» y «Salir» por debajo del borde. Ahora mide
    // `alto-pantalla` y lo agrupa todo en el centro. Si una pantalla muy baja
    // no lo contiene, se desplaza por dentro en vez de recortar (RN-VIS-06).
    <section className="alto-pantalla flex flex-col items-center justify-center gap-10 overflow-y-auto px-5 pt-safe pb-safe">
      <header className="flex w-full max-w-sm flex-col items-center gap-2 text-center">
        <h1 className="font-display text-lg text-on-surface">{textos.titulo}</h1>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </header>

      <div className="flex flex-col items-center gap-10">
        {/* Sin cuenta atrás y sin números: el copy de fase es la única señal
            textual (§5.1.2). */}
        <span
          ref={circulo}
          aria-hidden="true"
          className="circulo-respiracion aspect-square h-[min(10rem,24dvh)] shrink-0 rounded-full"
        />

        {/* RN-AUD-05 — El sonido nunca sustituye a la señal visual, y esta
            región la anuncia también a quien no ve la pantalla. */}
        <p aria-live="polite" className="min-h-[1.5rem] text-md text-on-surface">
          {fase ? textos.fases[fase] : ''}
        </p>
      </div>

      {/* Orden de foco de §5.1.2: iniciar/pausar → silenciar → saltar. */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        <Button
          fullWidth
          variant="surface"
          onClick={corriendo ? pausar : arrancar}
          aria-pressed={corriendo}
        >
          {corriendo ? textos.pausar : empezado ? textos.seguir : textos.empezar}
        </Button>

        <div className="flex w-full items-center justify-center gap-6">
          <button
            type="button"
            onClick={alternarSonido}
            aria-pressed={!silenciado}
            className={clsx(
              'rounded-full px-3 py-2 min-h-touch-sm text-sm',
              'text-on-surface-soft hover:text-on-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
            )}
          >
            {silenciado ? textos.sonido.activar : textos.sonido.silenciar}
          </button>

          {/* Visible desde el segundo 0. Saltar no tiene coste, no pide
              confirmación y no se registra como abandono (RN-LU-RESP-01). */}
          <button
            type="button"
            onClick={terminar}
            className={clsx(
              'rounded-full px-3 py-2 min-h-touch-sm text-sm',
              'text-on-surface-soft hover:text-on-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
            )}
          >
            {empezado ? textos.saltar : textos.salir}
          </button>
        </div>
        {DiagnosticoAudio && (
          <Suspense fallback={null}>
            <DiagnosticoAudio
              origen="momento"
              sesion={corriendo ? 'activo' : empezado ? 'pausado' : 'inactivo'}
              fase={fase}
            />
          </Suspense>
        )}
      </div>
    </section>
  )
}
