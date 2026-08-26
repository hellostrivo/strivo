// src/components/onboarding/Identidad.jsx
// P4 — la identidad central: "Soy alguien que…".
//
// **No hay áreas aquí, ni las va a haber.** En la implementación anterior esta
// pantalla escribía una identidad por área y el acoplamiento acabó filtrándose
// hasta las vistas del día. Aquí la frase es una y no se reparte: este
// componente no conoce ninguna lista de áreas, no la importa y no hay de dónde
// sacarla.
//
// **Las sugerencias proponen; no rellenan a medias.** Tocar una escribe su
// texto en el campo, que sigue siendo editable a partir de ese momento. Desde
// entonces es texto de la persona y no vuelve a pasar por el resolutor de
// género (RN-GEN-06): cambiarlo mañana no reescribiría una frase que alguien ya
// hizo suya.
//
// "Otro" **no borra lo escrito**: lleva el foco al campo y se aparta. Vaciarlo
// sería destruir contenido sin preguntar, y lo único que se confirma en este
// producto es justo eso (RN-EST-07).

import { useRef } from 'react'
import { CampoTexto } from '@components/shared/Campo'
import { ListaDeChips } from '@components/shared/Chips'
import { chipsDe, recortar } from '@/onboarding/identidad'

export default function Identidad({ textos, valor, genero, onCambiar }) {
  const campo = useRef(null)
  const sugerencias = chipsDe(textos.chips, genero)
  const escrito = recortar(valor)

  const tocar = (id) => {
    const elegida = sugerencias.find((chip) => chip.id === id)
    if (elegida) onCambiar(elegida.texto)
    campo.current?.focus()
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.headline}</h1>
        <p className="text-base text-on-surface-soft leading-relaxed">{textos.subhead}</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-base text-on-surface">{textos.prefix}</span>
        <CampoTexto
          ref={campo}
          filas={3}
          value={escrito}
          onChange={(evento) => onCambiar(recortar(evento.target.value))}
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-on-surface-soft">{textos.suggestionsLabel}</p>
        <ListaDeChips
          etiqueta={textos.suggestionsLabel}
          opciones={[...sugerencias, { id: 'otro', texto: textos.chipOther }]}
          elegidas={sugerencias.filter((chip) => chip.texto === escrito).map((chip) => chip.id)}
          punteados={['otro']}
          onTocar={tocar}
        />
      </div>

      <p className="text-sm text-on-surface-soft leading-relaxed">{textos.closing}</p>
    </section>
  )
}
