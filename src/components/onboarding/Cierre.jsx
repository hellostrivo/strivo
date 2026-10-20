// src/components/onboarding/Cierre.jsx
// P8 — el final del recorrido.
//
// **Un saludo y un botón, y nada más.** El saludo dice el nombre que se escribió
// en P2 y lo dice en el género que se eligió en P2A: "Bienvenida, Alejandra".
// Sin nombre saluda igual, sin hueco y sin señalar la pregunta que se dejó en
// blanco — una pantalla de cierre que lo hiciera sería la primera acusación del
// producto, y este es el peor sitio posible para estrenarla (RN-EST-01).
//
// Aquí vivían dos cosas más y las dos se fueron: la frase armada con la
// identidad central, que se retiró del recorrido con su pantalla, y la hora de
// la vuelta debajo. Explicar el saludo debajo del saludo es una segunda voz en
// la última pantalla que alguien lee antes de entrar.

import Button from '@components/ui/Button'
import { bienvenidaDe } from '@/onboarding/estado'

export default function Cierre({ textos, nombre, genero, onEntrar }) {
  return (
    // Centrada en la pantalla, con la misma composición que la bienvenida: el
    // recorrido abre y cierra igual, y lo que se lee al final no es el
    // encabezado de nada.
    <section className="flex flex-1 flex-col justify-center gap-6">
      <h1 className="font-display text-lg text-on-surface leading-snug">
        {bienvenidaDe(textos, { nombre, genero })}
      </h1>

      <div>
        <Button variant="surface" onClick={onEntrar}>
          {textos.ctaLabel}
        </Button>
      </div>
    </section>
  )
}
