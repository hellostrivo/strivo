// src/components/ritual/Respiracion.jsx
// Respiración guiada — cuerpo compartido de R1 (mañana) y N1 (noche).
//
// Trece segundos: inhalar 5, exhalar 5 y una pausa de reposo de 3 al final.
// La pausa va DESPUÉS de exhalar; no es una retención entre las dos fases
// (decisión de producto cerrada el 7 ago 2026). Un ciclo, y al terminar el
// ritual avanza solo, para que respirar sea lo único que haya que hacer.
//
// MOTION: las duraciones de 5000 y 3000 ms exceden a propósito el rango
// 120–900 ms del sistema. Es la cuarta excepción autorizada (ver CLAUDE.md §5
// y motion.respiracion en design-tokens.json): aquí la duración no es una
// transición de interfaz, es el ejercicio. No "corregir" a 900 ms.
//
// Con movimiento reducido desaparece la escala del círculo —el ritmo lo llevan
// el halo y las palabras— y tampoco hay avance automático: sin el círculo que
// seguir, saltar de pantalla al terminar sería un sobresalto. Ahí manda el
// botón. Las duraciones se mantienen: lo que se reduce es el movimiento, no la
// calma.
//
// "Continuar" está disponible desde el primer instante en los dos casos (lo
// pone el ritual en su pie): nadie queda atrapado esperando a que la app le dé
// permiso.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { respiracion } from '@tokens'
import { crearVozDeRespiracion } from '@lib/audioRespiracion'
import { leerSonido, guardarSonido, SONIDO_POR_DEFECTO } from '@lib/sonido'
import useReducedMotion from '@hooks/useReducedMotion'

// El halo acompaña con su opacidad; el núcleo se queda siempre opaco, porque
// rebajárselo lo mezcla con el fondo del ritual y pierde la cota de 3:1.
const FASES = [
  { id: 'inhalar', ms: respiracion.inhalar, escala: respiracion.escalaMaxima, halo: 0.95 },
  { id: 'exhalar', ms: respiracion.exhalar, escala: 1,                        halo: 0.45 },
  { id: 'reposo',  ms: respiracion.reposo,  escala: 1,                        halo: 0.12 },
]

// El primer y el último fotograma del ejercicio: el círculo quieto, el halo
// apenas encendido. Con este estado se pinta antes de arrancar, para que la
// inhalación tenga desde dónde crecer en vez de aparecer ya expandida.
const QUIETO = { id: 'quieto', ms: respiracion.cruce, escala: 1, halo: 0.3 }

export default function Respiracion({
  textos,                              // { prompt, breatheIn, breatheOut, rest }
  onNext,
  textoClase = 'text-ink',
}) {
  const headingRef    = useRef(null)
  const reducedMotion = useReducedMotion()

  // -1 = quieto, antes de arrancar. 0..2 = las tres fases del ciclo.
  const [indice, setIndice]       = useState(-1)
  const [terminado, setTerminado] = useState(false)

  // `leida` evita el único caso feo posible: que la primera inhalación empiece
  // a sonar con el valor por defecto y se corte medio segundo después porque el
  // almacén dijo que estaba silenciado.
  const [sonido, setSonido] = useState(SONIDO_POR_DEFECTO)
  const [leida, setLeida]   = useState(false)

  // El AudioContext no se crea aquí: crearVozDeRespiracion() solo prepara el
  // objeto y espera a despertar(), que es quien lo abre tras el gesto.
  const vozRef = useRef(null)
  if (vozRef.current === null) vozRef.current = crearVozDeRespiracion()

  useEffect(() => { headingRef.current?.focus() }, [])

  useEffect(() => {
    let vigente = true
    leerSonido().then(valor => {
      if (!vigente) return
      setSonido(valor)
      setLeida(true)
    })
    return () => { vigente = false }
  }, [])

  // Limpieza obligatoria: al desmontar se cierra el contexto, y si la pestaña
  // se va a segundo plano se suspende. Nada sigue sonando fuera de la pantalla.
  useEffect(() => {
    const voz = vozRef.current
    const alCambiarVisibilidad = () => { if (document.hidden) voz.dormir() }

    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    return () => {
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
      voz.cerrar()
    }
  }, [])

  // Dos fotogramas de reposo y arranca. Sin esta espera el círculo se pintaría
  // ya expandido y no habría inhalación que ver.
  useEffect(() => {
    const relevo = setTimeout(() => setIndice(0), respiracion.arranque)
    return () => clearTimeout(relevo)
  }, [])

  // Cada fase programa su relevo. Al acabar la última el ciclo se da por hecho.
  useEffect(() => {
    if (indice < 0 || terminado) return undefined

    const relevo = setTimeout(() => {
      if (indice === FASES.length - 1) setTerminado(true)
      else setIndice(indice + 1)
    }, FASES[indice].ms)

    return () => clearTimeout(relevo)
  }, [indice, terminado])

  useEffect(() => {
    if (terminado && !reducedMotion) onNext()
  }, [terminado, reducedMotion, onNext])

  // El sonido acompaña a la fase que esté sonando. En el reposo no se programa
  // nada: la cola de la exhalación se apaga sola y esos 3 s son silencio.
  useEffect(() => {
    const voz  = vozRef.current
    const fase = indice < 0 ? null : FASES[indice]

    if (!leida || !sonido || terminado || !fase || fase.id === 'reposo') return undefined

    let vigente = true
    voz.despertar().then(disponible => {
      // Bloqueado por el navegador: el ejercicio sigue igual, en silencio y sin
      // avisos ni errores en consola
      if (!vigente || !disponible) return
      const segundos = fase.ms / 1000
      if (fase.id === 'inhalar') voz.inhalar(segundos)
      else                       voz.exhalar(segundos)
    })

    return () => { vigente = false }
  }, [indice, sonido, leida, terminado])

  // Se declara después del efecto que suena para que, al silenciar, primero se
  // invalide el tono en vuelo y luego se apague lo que ya sonaba.
  useEffect(() => {
    if (!sonido) vozRef.current.dormir()
  }, [sonido])

  useEffect(() => {
    if (terminado) vozRef.current.callar()
  }, [terminado])

  // Este toque es un gesto de la persona: es el mejor momento para abrir el
  // AudioContext, porque aquí el navegador nunca lo bloquea.
  const alternarSonido = () => {
    const siguiente = !sonido
    setSonido(siguiente)
    guardarSonido(siguiente)
    if (siguiente) vozRef.current.despertar()
  }

  const fase      = indice < 0 || terminado ? QUIETO : FASES[indice]
  const etiquetas = [
    { id: 'inhalar', texto: textos.breatheIn },
    { id: 'exhalar', texto: textos.breatheOut },
    { id: 'reposo',  texto: textos.rest },
  ]
  const etiquetaActual = etiquetas.find(e => e.id === fase.id)?.texto ?? ''

  // La duración de la transición es la de la fase que entra: el círculo tarda
  // en expandirse exactamente lo que dura la inhalación.
  const ritmo = {
    '--respiracion-fase': `${fase.ms}ms`,
    transitionDuration:   'var(--respiracion-fase)',
    transitionTimingFunction: respiracion.easing,
  }

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={`font-display text-xl leading-tight text-center focus:outline-none ${textoClase}`}
      >
        {textos.prompt}
      </h1>

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <div className="w-full flex justify-end">
          <BotonSonido activo={sonido} onClick={alternarSonido} className={textoClase} />
        </div>

        {/* El círculo es decorativo: lo que se anuncia es la región de abajo.
            La escala y el halo viven en transform y opacity, así que crecer no
            desplaza nada ni provoca desbordamiento en 360 px. */}
        <div
          className="relative"
          style={{ width: respiracion.diametro, height: respiracion.diametro }}
          aria-hidden="true"
        >
          <div
            className="respiracion-fase absolute rounded-full transition-[opacity,transform]"
            style={{
              inset: `${-respiracion.haloSobresale * 100}%`,
              background: respiracion.halo,
              opacity: fase.halo,
              transform: reducedMotion ? undefined : `scale(${fase.escala})`,
              ...ritmo,
            }}
          />
          <div
            className="respiracion-fase absolute inset-0 rounded-full transition-transform"
            style={{
              background: respiracion.nucleo,
              transform: reducedMotion ? undefined : `scale(${fase.escala})`,
              ...ritmo,
            }}
          />
        </div>

        {/* Las palabras se cruzan en lugar de saltar: las tres ocupan el mismo
            sitio y solo cambia cuál está a la vista. */}
        <div className="relative w-full h-8" aria-hidden="true">
          {etiquetas.map(etiqueta => (
            <p
              key={etiqueta.id}
              className={clsx(
                'absolute inset-0 flex items-center justify-center',
                'text-md transition-opacity ease-smooth motion-reduce:transition-none',
                textoClase
              )}
              style={{
                opacity: etiqueta.id === fase.id ? 0.8 : 0,
                transitionDuration: `${respiracion.cruce}ms`,
              }}
            >
              {etiqueta.texto}
            </p>
          ))}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {etiquetaActual}
        </p>
      </div>
    </>
  )
}

// Altavoz encendido o tachado. Área táctil de 48 px, por encima del mínimo de
// 44, y nombre accesible desde la biblioteca de copy.
//
// Sin aria-pressed a propósito: el nombre ya dice qué va a pasar al pulsarlo
// ("Silenciar el sonido"), y añadirle un estado encima se lee al revés.
function BotonSonido({ activo, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-12 h-12 -mr-3 inline-flex items-center justify-center rounded-full',
        'opacity-60 hover:opacity-100 transition-opacity duration-260 ease-smooth',
        'motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
        className
      )}
    >
      <span className="sr-only">
        {activo ? copy.ritual.sonido.silenciar : copy.ritual.sonido.activar}
      </span>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        {activo ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <>
            <path d="M16 9.5l5 5" />
            <path d="M21 9.5l-5 5" />
          </>
        )}
      </svg>
    </button>
  )
}
