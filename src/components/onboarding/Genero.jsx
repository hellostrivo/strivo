// src/components/onboarding/Genero.jsx
// P2A — con qué género hablarle a quien acaba de escribir su nombre.
//
// **Es un sub-paso y no un paso**: cuelga del nombre y no cuenta en el
// indicador, que por eso no se pinta mientras dura.
//
// La pregunta explica para qué sirve la respuesta. Sin esa frase, preguntar el
// género en la tercera pantalla de una app de refugio es una intromisión; con
// ella es lo que es: la diferencia entre "cansado", "cansada" y "con cansancio"
// en todo lo que la app diga a partir de aquí.
//
// Cuatro opciones y tres valores guardados: "prefiero no contestar" y "otro"
// llevan las dos al neutro, que es también lo que vale si se pasa de largo
// (RN-GEN-05). Cuál de las dos se tocó vive en la pantalla y no en el modelo.

import { ListaDeChips } from './Chips'
import { OPCIONES } from '@/onboarding/genero'

export default function Genero({ textos, valor, onCambiar }) {
  const opciones = OPCIONES.map((id) => ({ id, texto: textos.options[id] }))

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.question}</h1>
        <p className="text-base text-on-surface-soft">{textos.hint}</p>
      </div>

      <ListaDeChips
        etiqueta={textos.question}
        opciones={opciones}
        elegidas={valor ? [valor] : []}
        onTocar={onCambiar}
      />
    </section>
  )
}
