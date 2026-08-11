// src/components/lumia/CierreDelDia.jsx
// La secuencia de cierre (§3.3, etapa 4 · §5.4).
//
// Es el momento más importante del producto: la pantalla se oscurece, aparece
// una síntesis construida con datos reales, una frase de cierre y un solo
// botón. Después la app se atenúa y no devuelve a ningún menú.
//
// **Nunca falla.** Si no hay nada escrito, la síntesis es "Hoy solo viniste.
// También cuenta." y el cierre ocurre igual.
//
// RN-VN-04 — Con un estado de sueño pesado no hay celebración: ni punto de luz,
// ni frase de logro. Solo el copy compasivo y las buenas noches.

import { useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { copy } from '@copy'

const textos = copy.lumia.diario.noche.cierre

export default function CierreDelDia({ sintesis, compasivo, onTerminar }) {
  const [despidiendo, setDespidiendo] = useState(false)

  return (
    <div
      data-surface="dark"
      data-lumia="noche"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-night px-8 text-center"
    >
      {despidiendo ? (
        <button
          type="button"
          onClick={onTerminar}
          className="flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30 rounded-md p-4"
        >
          <p className="font-display text-lg text-on-surface">{textos.despedida}</p>
          <p className="text-sm text-on-surface-soft">{textos.reabrir}</p>
        </button>
      ) : (
        <>
          {/* Punto de luz cálida: una sola vez, sin sonido, y solo si el día no
              se cerró pesado (§3.3, etapa 4, mecanismo 5). */}
          {!compasivo && (
            <span
              aria-hidden="true"
              className="h-1 w-24 rounded-full bg-amber/60 animate-light-sweep motion-reduce:animate-none"
            />
          )}

          <p
            className={clsx(
              'font-display text-lg text-on-surface leading-snug',
              'animate-fade-up motion-reduce:animate-none',
            )}
            role="status"
          >
            {sintesis}
          </p>

          <p className="text-base text-on-surface-soft">
            {compasivo ? textos.compasivo : textos.paz}
          </p>

          <Button variant="surface" onClick={() => setDespidiendo(true)}>
            {textos.despedida}
          </Button>
        </>
      )}
    </div>
  )
}
