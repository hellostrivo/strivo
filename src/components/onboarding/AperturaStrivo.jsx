// src/components/onboarding/AperturaStrivo.jsx
// Apertura de Strivo (§3.3 del documento de cambios v2.2)
//
// Cinco segundos que separan el ruido de afuera del espacio de adentro. No es un
// ejercicio guiado: hay una palabra y ninguna orden. Decirle "Inhala" a alguien
// en su primer segundo de uso contradice la promesa de que aquí no hay presión.
//
// Se monta ENCIMA del fondo de P1, nunca en lugar de él: la capa del degradado
// es la misma antes y después, así que al terminar no hay recarga ni parpadeo.
// Lo único que se va es esta capa.
//
// Motion: la secuencia dura 5000 ms y excede a propósito el rango 120–900 ms del
// sistema. Es una de las dos excepciones autorizadas (ver CLAUDE.md §5).

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { colors, apertura, aperturaNucleo } from '@tokens'
import useReducedMotion from '@hooks/useReducedMotion'

// El núcleo es luz difusa, no una figura: un gradiente radial que se desvanece
// hacia los bordes, sin borde ni contorno que lo recorte.
const LUZ = `radial-gradient(circle,
  rgba(255, 255, 255, 0.95) 0%,
  rgba(255, 249, 235, 0.65) 38%,
  rgba(254, 232, 182, 0.28) 62%,
  rgba(254, 232, 182, 0) 78%)`

function diametroPara(ancho) {
  if (ancho < aperturaNucleo.puntoDeCorteCompacto) return aperturaNucleo.diametroCompacto
  if (ancho < aperturaNucleo.puntoDeCorteAmplio)   return aperturaNucleo.diametroBase
  return aperturaNucleo.diametroAmplio
}

function useDiametroNucleo() {
  const [diametro, setDiametro] = useState(
    () => diametroPara(typeof window === 'undefined' ? 390 : window.innerWidth)
  )

  useEffect(() => {
    const alCambiar = () => setDiametro(diametroPara(window.innerWidth))
    window.addEventListener('resize', alCambiar)
    return () => window.removeEventListener('resize', alCambiar)
  }, [])

  return diametro
}

export default function AperturaStrivo({ onEnd }) {
  const reducedMotion = useReducedMotion()
  const diametro      = useDiametroNucleo()

  // Con movimiento reducido "Entrar" está desde el principio; si no, aparece a
  // los 1500 ms, cuando la secuencia ya se explicó sola.
  const [entrarVisible, setEntrarVisible] = useState(reducedMotion)
  const [saliendo, setSaliendo]           = useState(false)

  const duracion = reducedMotion ? apertura.totalReducido : apertura.total
  const cerrado  = useRef(false)

  // Salir antes: un toque en cualquier punto, o el control "Entrar". La salida
  // dura 300 ms en vez de los 800 del final natural.
  const salir = () => {
    if (cerrado.current) return
    cerrado.current = true
    setSaliendo(true)
    setTimeout(() => onEnd?.(), apertura.saltar)
  }

  useEffect(() => {
    const relevos = [
      setTimeout(() => {
        if (cerrado.current) return
        cerrado.current = true
        onEnd?.()
      }, duracion),
    ]

    if (!reducedMotion) {
      relevos.push(setTimeout(() => setEntrarVisible(true), apertura.entrarApareceEn))
    }

    return () => relevos.forEach(clearTimeout)
  }, [duracion, reducedMotion, onEnd])

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'transition-opacity ease-smooth motion-reduce:transition-none',
        saliendo && 'opacity-0'
      )}
      style={{ transitionDuration: `${apertura.saltar}ms` }}
      onPointerDown={salir}
    >
      {/* Lo que entra es el degradado, que ya está debajo: lo que se desvanece
          es esta capa del color más oscuro de la paleta. Con movimiento
          reducido el fondo se muestra ya visible, sin transición. */}
      <div
        className={clsx('absolute inset-0', !reducedMotion && 'animate-apertura-fondo')}
        style={{
          backgroundColor: colors.night,
          opacity: reducedMotion ? 0 : undefined,
        }}
        aria-hidden="true"
      />

      {/* Núcleo y palabra: decorativos. Lo único que existe para el lector de
          pantalla es el botón de salida. */}
      <div className="relative flex flex-col items-center" aria-hidden="true">
        {!reducedMotion && (
          <div
            className="rounded-full animate-apertura-nucleo"
            style={{
              width:  `${diametro}px`,
              height: `${diametro}px`,
              background: LUZ,
            }}
          />
        )}

        <p
          className={clsx(
            'font-display text-md text-ink',
            reducedMotion ? 'animate-apertura-palabra-quieta' : 'mt-10 animate-apertura-palabra'
          )}
        >
          {copy.onboarding.apertura.palabra}
        </p>
      </div>

      {/* Salida explícita: primer elemento del orden de tabulación y la única
          parte de la apertura que se anuncia. No roba el foco al aparecer. */}
      <button
        type="button"
        onClick={salir}
        className={clsx(
          'absolute bottom-10 min-h-touch-sm min-w-touch px-6 py-3',
          'font-sans text-sm text-ink rounded-full',
          'transition-opacity duration-420 ease-smooth motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
          !entrarVisible && 'pointer-events-none'
        )}
        style={{ opacity: entrarVisible ? aperturaNucleo.opacidadEntrar : 0 }}
        tabIndex={entrarVisible ? 0 : -1}
      >
        {copy.onboarding.apertura.entrar}
      </button>
    </div>
  )
}
