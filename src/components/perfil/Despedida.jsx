// src/components/perfil/Despedida.jsx
// Lo último que se ve al borrar la cuenta (SPEC_24B, DP-24.19).
//
// Una frase y un botón, «Cerrar», que lleva a la primera pantalla del
// onboarding **sin el umbral**: no es una bienvenida. `despedida` es el único
// texto de todo el proyecto que puede sonar a cierre emocional, y no se le
// añade nada más.

import { useEffect, useRef } from 'react'
import Button from '@components/ui/Button'
import { copy } from '@copy'
import { useBarraDeEstado } from '@lib/barraEstado'

const textos = copy.cuenta.borrar

export default function Despedida({ onCerrar }) {
  const frase = useRef(null)
  useBarraDeEstado({ capa: 'modal' })

  useEffect(() => {
    frase.current?.focus()
  }, [])

  return (
    <div
      data-surface="light"
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-espacio px-8 text-center text-on-surface"
    >
      <p
        ref={frase}
        tabIndex={-1}
        aria-live="polite"
        className="font-display text-lg text-on-surface leading-snug focus:outline-none"
      >
        {textos.despedida}
      </p>
      <Button type="button" variant="surface" onClick={onCerrar}>
        {textos.cerrar}
      </Button>
    </div>
  )
}
