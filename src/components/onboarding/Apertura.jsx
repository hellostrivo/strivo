// src/components/onboarding/Apertura.jsx
// Una palabra, una vez en la vida de la cuenta, antes del primer paso.
//
// **No es `TransicionLuz` y no debe llegar a serlo.** Aquel es el umbral de
// §C7.5 —una frase del repertorio, una vez por sesión— y su archivo dice, con
// razón, que cada contenido nuevo que se le mete lo acerca al wizard derogado.
// Esto es otra cosa: ocurre una sola vez, no sale de ningún repertorio y no se
// vuelve a ver nunca. Lo que sí comparten es el aspecto, y por eso comparten
// las clases del velo (`globals.css`) en vez de compartir el componente: el
// tono lo sigue poniendo el tema y aquí no se escribe ni un color (RN-VIS-02).
//
// **Con "reducir movimiento" no se monta**, igual que el umbral (RN-VIS-05).
// Quien lo decide es el contenedor, que es quien sabe si hay que enseñarla.
//
// Toda la superficie la salta. No hay botón de avanzar y no hay nada que
// decidir: es una pausa, no una pantalla.

import { useEffect, useRef } from 'react'

/**
 * §C7.5 — La misma duración calmada del umbral. Se declara aquí y no se importa
 * de `TransicionLuz` para no arrastrar con ella el video de apertura, que pesa y
 * que esta pieza no usa.
 */
export const DURACION = 5000

export default function Apertura({ textos, onTerminar }) {
  const temporizador = useRef(null)
  const terminado = useRef(false)

  const terminar = () => {
    if (terminado.current) return
    terminado.current = true
    clearTimeout(temporizador.current)
    onTerminar()
  }

  useEffect(() => {
    temporizador.current = setTimeout(terminar, DURACION)
    return () => clearTimeout(temporizador.current)
    // Sin dependencias: se monta una vez y se va. Una dependencia aquí
    // reiniciaría la cuenta a mitad.
  }, [])

  return (
    <button
      type="button"
      onClick={terminar}
      aria-label={textos.entrar}
      className="velo-transicion transicion-entrada fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-8 text-center"
    >
      <span
        aria-hidden="true"
        className="luz-transicion pointer-events-none absolute h-72 w-72 rounded-full"
      />
      <p className="relative font-display text-lg text-on-surface leading-snug">{textos.palabra}</p>
    </button>
  )
}
