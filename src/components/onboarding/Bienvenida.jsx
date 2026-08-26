// src/components/onboarding/Bienvenida.jsx
// P1 — la primera pantalla. Dice qué es esto y ofrece empezar.
//
// No promete resultados y no pide nada: es la única pantalla del recorrido sin
// una sola respuesta que dar. El nombre de la app no se repite aquí —la
// cabecera de la marca ya está— y no se explica de dónde viene: ninguna pieza
// de copy se apoya en eso.

import Button from '@components/ui/Button'

// **Se centra en la pantalla, no se apoya en su techo.** Esta pantalla no pide
// nada: son dos frases y una invitación a empezar, y pegadas al borde de arriba
// se leen como el encabezado de un formulario que viene detrás. El hueco
// entero se lo da el marco; lo que se decide aquí es qué hacer con él.
export default function Bienvenida({ textos, onContinuar }) {
  return (
    <section className="flex flex-1 flex-col justify-center gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.subtitle}</h1>
        <p className="text-base text-on-surface-soft leading-relaxed">{textos.support}</p>
      </div>

      <div>
        <Button variant="surface" onClick={onContinuar}>
          {textos.cta}
        </Button>
      </div>
    </section>
  )
}
