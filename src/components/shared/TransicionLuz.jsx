// src/components/shared/TransicionLuz.jsx
// La transición de entrada: luz tenue y una frase (§C7.5).
//
// **Un umbral, no una secuencia.** Al disolverse el Ritual de Mañana, el pop-up
// se llevó tres cosas —umbral, orden y cierre— y de las tres solo se recupera
// la primera. Esta pieza es el umbral y nada más: sin pasos, sin preguntas, sin
// botón de continuar.
//
// **RN-LU-MAN-02 es una regla sobre lo que NO se le puede añadir.** Cada cosa
// que entre aquí —un segundo fotograma, un "seguir", una elección— la acerca al
// wizard del Anexo E, que es exactamente lo que la división vino a eliminar. Si
// alguien se ve añadiendo algo a este archivo, conviene releer el Anexo E antes.
//
// **Es la misma pieza en los dos sitios** (RN-LU-MAN-01): la entrada a la app y
// la entrada a la mañana. Si acaba habiendo dos variantes, la segunda ya es
// algo específico de Mañana y el wizard ha empezado a volver.
//
// **RN-LU-MAN-03 — Aquí no hay respiración.** La respiración diaria es
// voluntaria (RN-LU-RESP-01) y no se dispara con esto. Este archivo no la
// menciona y no la importa.
//
// Vive en `components/shared/` y no fija ni un color: el tono del velo y de la
// luz los pone el tema desde `globals.css`, así que la misma pieza sirve sobre
// el crema de la mañana y sobre el índigo de la noche sin saberlo (RN-TEC-05).
//
// **`conFrase` no es una segunda variante**, es la misma pieza sin su texto. La
// frase es contenido —el repertorio de apertura de §C7.5— y no estructura, así
// que quien monte el umbral sin ella sigue teniendo el mismo umbral: luz tenue,
// cinco segundos y saltable por toda su superficie.

import { useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import { fraseDeApertura } from '@/content/frases-apertura'

/** §C7.5 — Duración calmada, la misma de P1. */
export const DURACION = 5000

/** ¿Está activada la preferencia del sistema? Se consulta, no se asume. */
export function prefiereMenosMovimiento() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function TransicionLuz({ onTerminar, conFrase = true }) {
  // La frase se elige una sola vez, al montar: recalcularla en cada render la
  // haría cambiar a mitad de los cinco segundos. Sin frase no se saca ninguna
  // del bombo: gastarla sin enseñarla dejaría un hueco en el repertorio.
  const [frase] = useState(function elegir() {
    if (conFrase) return fraseDeApertura()
    return null
  })
  const temporizador = useRef(null)
  const terminado = useRef(false)

  // Salir es idempotente: el toque y el temporizador llegan al mismo sitio y
  // el primero que llegue apaga al otro.
  const terminar = () => {
    if (terminado.current) return
    terminado.current = true
    clearTimeout(temporizador.current)
    onTerminar()
  }

  useEffect(() => {
    temporizador.current = setTimeout(terminar, DURACION)
    return () => clearTimeout(temporizador.current)
    // Sin dependencias a propósito: se monta una vez y se va. Una dependencia
    // aquí reiniciaría la cuenta a mitad y dejaría a alguien esperando diez
    // segundos delante de un umbral de cinco.
  }, [])

  return (
    // Toda la superficie salta la transición: no hay que buscar un botón, y
    // `button` en vez de `div` para que también se pueda con teclado (criterio 3).
    <button
      type="button"
      onClick={terminar}
      aria-label={copy.shared.transicion.saltar}
      className="velo-transicion transicion-entrada fixed inset-0 z-50 flex items-center justify-center px-8 text-center"
    >
      <span
        aria-hidden="true"
        className="luz-transicion pointer-events-none absolute h-72 w-72 rounded-full"
      />
      {frase && (
        <p className="relative font-display text-lg text-on-surface leading-snug">{frase.texto}</p>
      )}
    </button>
  )
}
