// src/components/onboarding/Motivo.jsx
// P3 — qué le gustaría a alguien encontrar aquí.
//
// **Cinco motivos y una palabra propia. Sin la opción de construir hábitos**,
// que pertenecía al alcance retirado: ofrecer un motivo que este producto no
// atiende sería prometerlo.
//
// Selección múltiple, sin tope: lo que alguien viene a buscar rara vez es una
// sola cosa, y pedirle que elija una sería pedirle que priorice antes de
// entrar.
//
// El contador del campo propio dice cuánto cabe, no cuánto falta: es una
// sugerencia y el texto se recorta sin avisos ni bordes rojos (RN-DB-07).

import { CampoLinea } from '@components/shared/Campo'
import { ListaDeChips } from '@components/shared/Chips'
import { interpolate } from '@copy'
import { ID_OTRO, MAX_OTRO, OPCIONES, recortarOtro } from '@/onboarding/motivos'

export default function Motivo({ textos, motivos, otro, onTocar, onOtro }) {
  const opciones = OPCIONES.map((id) => ({ id, texto: textos.options[id] }))
  const abierto = motivos.includes(ID_OTRO)
  const escrito = recortarOtro(otro)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.question}</h1>
        <p className="text-base text-on-surface-soft">{textos.hint}</p>
      </div>

      <ListaDeChips
        etiqueta={textos.question}
        opciones={opciones}
        elegidas={motivos}
        punteados={[ID_OTRO]}
        onTocar={onTocar}
      />

      {abierto && (
        <label className="flex flex-col gap-2">
          <span className="text-sm text-on-surface-soft">{textos.otherLabel}</span>
          <CampoLinea
            value={escrito}
            placeholder={textos.otherPlaceholder}
            onChange={(evento) => onOtro(recortarOtro(evento.target.value))}
          />
          <span className="text-sm text-on-surface-faint">
            {interpolate(textos.otherCounterTemplate, { n: escrito.length, max: MAX_OTRO })}
          </span>
        </label>
      )}
    </section>
  )
}
