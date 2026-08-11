// src/components/shared/Respiracion.jsx
// El ejercicio de respiración guiada: 5-5-3, tres ciclos (§C2.3 · §5.1.2).
//
// **Un solo componente para los dos sitios** que lo usan: la respiración diaria
// de la sección Mañana de Lumia y P1 del onboarding (RN-LU-RESP-02). Por eso
// vive en `components/shared/` y **no conoce ninguno de los dos espacios**: no
// importa `lumia/` ni `formia/`, no lee la capa de datos y no sabe qué copy
// está pintando. Todo llega por props. Dos implementaciones divergentes es
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

import { useCallback, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { crearAudioRespiracion } from '@lib/audioRespiracion'
import { CICLOS, OPACIDAD_ESTATICA, escalaEn, faseEn } from '@lib/ritmoRespiracion'

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
export default function Respiracion({ textos, ciclos = CICLOS, sonido = false, onSonido, onSalir }) {
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

  const parar = useCallback(() => {
    if (cuadro.current) cancelAnimationFrame(cuadro.current)
    cuadro.current = null
  }, [])

  /** RN-AUD-04 — Al salir no queda ni un nodo vivo ni un temporizador suelto. */
  const limpiar = useCallback(() => {
    parar()
    audio.current?.detener()
    audio.current = null
  }, [parar])

  useEffect(() => limpiar, [limpiar])

  const terminar = useCallback(() => {
    limpiar()
    onSalir()
  }, [limpiar, onSalir])

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
    }

    if (circulo.current) {
      circulo.current.style.transform = reducido
        ? null
        : `scale(${escalaEn(punto.fase, punto.progreso)})`
      circulo.current.style.opacity = reducido ? String(OPACIDAD_ESTATICA[punto.fase]) : null
    }

    cuadro.current = requestAnimationFrame(avanzar)
  }, [ciclos, reducido, terminar])

  const arrancar = async () => {
    // El contexto de audio nace **aquí dentro**, en el manejador del gesto
    // (RN-AUD-01). Si arrancara al montarse, el gesto habría ocurrido en la
    // pantalla anterior y el navegador entregaría un contexto suspendido.
    if (!audio.current) {
      audio.current = crearAudioRespiracion()
      await audio.current.iniciar()
      audio.current.silenciar(silenciado)
    }
    desde.current = performance.now()
    setEmpezado(true)
    setCorriendo(true)
    cuadro.current = requestAnimationFrame(avanzar)
  }

  const pausar = () => {
    transcurrido.current += performance.now() - desde.current
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
    audio.current?.silenciar(siguiente)
    onSonido?.(!siguiente)
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-between gap-8 px-5 pb-12 pt-6">
      <header className="flex w-full flex-col items-center gap-2 text-center">
        <h1 className="font-display text-lg text-on-surface">{textos.titulo}</h1>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </header>

      <div className="flex flex-col items-center gap-8">
        {/* Sin cuenta atrás y sin números: el copy de fase es la única señal
            textual (§5.1.2). */}
        <span
          ref={circulo}
          aria-hidden="true"
          className="circulo-respiracion h-40 w-40 rounded-full"
        />

        {/* RN-AUD-05 — El sonido nunca sustituye a la señal visual, y esta
            región la anuncia también a quien no ve la pantalla. */}
        <p aria-live="polite" className="min-h-[1.5rem] text-md text-on-surface">
          {fase ? textos.fases[fase] : ''}
        </p>
      </div>

      {/* Orden de foco de §5.1.2: iniciar/pausar → silenciar → saltar. */}
      <div className="flex w-full flex-col items-center gap-3">
        <Button
          fullWidth
          variant="surface"
          onClick={corriendo ? pausar : arrancar}
          aria-pressed={corriendo}
        >
          {corriendo ? textos.pausar : empezado ? textos.seguir : textos.empezar}
        </Button>

        <div className="flex w-full items-center justify-between gap-3">
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
      </div>
    </section>
  )
}
