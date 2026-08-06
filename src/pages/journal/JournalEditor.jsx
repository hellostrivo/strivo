// src/pages/journal/JournalEditor.jsx
// Editor del Journal — sin fricción (§5.8)
//
// Se abre con el cursor puesto al final del texto: escribir es lo primero que
// se puede hacer, sin tocar nada más.
//
// No hay botón de guardar. Lo escrito se guarda solo mientras se escribe y al
// salir, así que "Listo" es solo una salida, no una confirmación. Una entrada
// que se queda en blanco no se guarda: abrir el editor y arrepentirse no deja
// rastro.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import { fechaConDiaSemana } from '@lib/fechas'
import Button from '@components/ui/Button'

const GUARDADO_MS = 900

export default function JournalEditor({ entrada, onChange, onGuardar, onSalir }) {
  const campoRef = useRef(null)

  // El cursor listo al abrir, y al final de lo ya escrito
  useEffect(() => {
    const campo = campoRef.current
    if (!campo) return
    campo.focus()
    const final = campo.value.length
    campo.setSelectionRange(final, final)
  }, [entrada.id])

  // Se guarda solo mientras se escribe: sin botón y sin avisos
  useEffect(() => {
    if (!entrada.texto.trim()) return
    const id = setTimeout(onGuardar, GUARDADO_MS)
    return () => clearTimeout(id)
  }, [entrada.texto, onGuardar])

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 pt-safe pt-6 flex items-center justify-between gap-4">
        <p className="text-base text-ink/70">
          {fechaConDiaSemana(entrada.fecha)}
        </p>

        <Button variant="ghost" size="sm" className="-mr-4" onClick={onSalir}>
          {copy.journal.back}
        </Button>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-6 pt-6 pb-10 flex">
        <textarea
          ref={campoRef}
          value={entrada.texto}
          aria-label={copy.journal.title}
          placeholder={copy.journal.placeholder}
          onChange={event => onChange(event.target.value)}
          onBlur={onGuardar}
          className={[
            'flex-1 w-full resize-none bg-transparent',
            'text-md text-ink leading-relaxed',
            'placeholder:text-ink/50',
            // Sin borde ni caja: la hoja es la pantalla
            'border-0 focus:outline-none focus:ring-0',
          ].join(' ')}
        />
      </main>
    </div>
  )
}
