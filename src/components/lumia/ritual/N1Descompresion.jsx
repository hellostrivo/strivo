// src/components/lumia/ritual/N1Descompresion.jsx
// N1 — Descompresión (§5.6).
//
// Un círculo que respira durante seis segundos y una frase: "El día ya pasó.
// Vamos a mirarlo con calma." No escribe nada, no pregunta nada y no espera
// nada: el botón de seguir está disponible desde el primer instante.
//
// **No es la respiración diaria de SPEC_08.** Aquella son tres ciclos de 5-5-3
// y tiene su propia especificación. Esto es un respiro de entrada de seis
// segundos, y confundirlos alargaría el ritual justo donde hay menos energía.
//
// Con `prefers-reduced-motion` el círculo no se mueve: la regla global de
// `globals.css` anula la animación y queda una forma quieta, que sigue
// funcionando como punto donde descansar la vista.

import { copy } from '@copy'

const textos = copy.lumia.ritualNoche.n1

export default function N1Descompresion() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
      <span
        aria-label={textos.respiracion}
        role="img"
        className="respiracion-lenta h-28 w-28 rounded-full border border-on-surface bg-lumia-tarjeta motion-reduce:animate-none"
      />

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-on-surface">{textos.titulo}</h2>
        <p className="text-base text-on-surface-soft">{textos.lead}</p>
      </div>
    </section>
  )
}
