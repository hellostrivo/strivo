// src/hooks/useFondoHorario.js
// El fondo que toca ahora, y que se actualiza solo (§18.3.5).
//
// Con la app abierta al cruzar una franja, el color cambia sin esperar a un
// reinicio. Se comprueba cada minuto: el degradado se mueve tan despacio que
// mirar más a menudo solo gastaría batería.

import { useEffect, useState } from 'react'
import { fondoHorario } from '@lib/gradienteHorario'

const UN_MINUTO = 60 * 1000

export default function useFondoHorario() {
  const [fondo, setFondo] = useState(() => fondoHorario())

  useEffect(() => {
    const revisar = () => {
      const ahora = fondoHorario()
      // Solo se re-renderiza cuando el color de verdad cambió
      setFondo(previo =>
        previo.from === ahora.from && previo.to === ahora.to ? previo : ahora
      )
    }

    const reloj = setInterval(revisar, UN_MINUTO)
    // Volver de segundo plano después de un rato: el fondo se pone al día ya
    document.addEventListener('visibilitychange', revisar)

    return () => {
      clearInterval(reloj)
      document.removeEventListener('visibilitychange', revisar)
    }
  }, [])

  return fondo
}
