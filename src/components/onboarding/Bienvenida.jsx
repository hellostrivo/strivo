// src/components/onboarding/Bienvenida.jsx
// P1 — la primera pantalla. Dice qué es esto y ofrece empezar.
//
// No promete resultados y no pide nada: es la única pantalla del recorrido sin
// una sola respuesta que dar. El nombre de la app no se repite aquí —la
// cabecera de la marca ya está— y no se explica de dónde viene: ninguna pieza
// de copy se apoya en eso.
//
// **Quien ya tiene cuenta encuentra aquí por dónde entrar** (SPEC_30): un
// enlace debajo de «Empezar», en el secundario y sin competir con él. No es una
// pregunta —quien llega por primera vez no gasta ni un toque— y solo aparece
// sin cuenta en el dispositivo (`conEntrar`).

import Button from '@components/ui/Button'
import { ENLACE } from '@components/shared/FormularioEntrar'

// **Se centra en la pantalla, no se apoya en su techo.** Esta pantalla no pide
// nada: son dos frases y una invitación a empezar, y pegadas al borde de arriba
// se leen como el encabezado de un formulario que viene detrás. El hueco
// entero se lo da el marco; lo que se decide aquí es qué hacer con él.
export default function Bienvenida({ textos, enlace, conEntrar, onContinuar, onEntrar }) {
  return (
    <section className="flex flex-1 flex-col justify-center gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.subtitle}</h1>
        <p className="text-base text-on-surface-soft leading-relaxed">{textos.support}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <Button variant="surface" onClick={onContinuar}>
            {textos.cta}
          </Button>
        </div>
        {conEntrar && (
          <button type="button" className={ENLACE} onClick={onEntrar}>
            {enlace}
          </button>
        )}
      </div>
    </section>
  )
}
