// src/components/onboarding/Cierre.jsx
// P8 — el final del recorrido.
//
// **Dos redacciones y solo dos**: con identidad escrita y sin ella. La versión
// que insertaba áreas en la frase no existe en el copy y no tiene de dónde
// salir; quien busque aquí `{areas}` no va a encontrarlo, que es exactamente el
// punto.
//
// Sin identidad, la frase no dice que falte nada: dice que aquí empieza tu
// espacio. Una pantalla de cierre que señalara la pregunta que se dejó en
// blanco sería la primera acusación del producto, y la última pantalla del
// onboarding es el peor sitio posible para estrenarla (RN-EST-01).
//
// La hora de la vuelta solo aparece si hay hora que decir.

import Button from '@components/ui/Button'
import { cierreDe } from '@/onboarding/estado'

export default function Cierre({ textos, identidad, despertar, onEntrar }) {
  const { frase, proxima } = cierreDe(textos, { identidad, despertar })

  return (
    // Centrada en la pantalla, con la misma composición que la bienvenida: el
    // recorrido abre y cierra igual, y lo que se lee al final no es el
    // encabezado de nada.
    <section className="flex flex-1 flex-col justify-center gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-lg text-on-surface leading-snug">{frase}</h1>
        {proxima && <p className="text-base text-on-surface-soft">{proxima}</p>}
      </div>

      <div>
        <Button variant="surface" onClick={onEntrar}>
          {textos.ctaLabel}
        </Button>
      </div>
    </section>
  )
}
