// src/breathing/components/SelectorVisual.jsx
// Círculo o línea (SPEC_16 §3.2).
//
// Dos opciones y ninguna por defecto "mejor": el círculo dice cómo respirar
// ahora y la línea dice además lo que viene. Quién prefiere cuál no se puede
// adivinar, así que se enseñan las dos con el mismo peso.

import { copy } from '@copy'
import { VISUALES } from './visuales/GuiaVisual.jsx'

const CLAVE = { circulo: 'visualCirculo', linea: 'visualLinea' }

export default function SelectorVisual({ visual, onCambiar }) {
  const textos = copy.respiracion.configuracion

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm text-on-surface-soft">{textos.visual}</legend>
      <div className="flex gap-2" role="radiogroup" aria-label={textos.visual}>
        {VISUALES.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={visual === id}
            onClick={() => onCambiar(id)}
            data-elegido={visual === id ? 'si' : 'no'}
            className="respiracion-opcion min-h-touch flex-1 rounded-full border border-on-surface px-4 text-sm text-on-surface"
          >
            {textos[CLAVE[id]]}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
