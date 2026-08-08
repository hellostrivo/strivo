// src/components/strivo/SelectorEmociones.jsx
// Cómo me quiero sentir hoy (§22).
// Copy: copy.hoy.emociones · catálogo, ids y emojis: @lib/emociones
//
// El cuadro, los chips y el campo de "Otra" viven en @components/strivo/
// SelectorDeChips, compartidos con la pregunta de cierre de la noche. Aquí solo
// se dice qué se pregunta, con qué opciones y de qué color es la tarjeta.

import { copy } from '@copy'
import useCopy from '@hooks/useCopy'
import { EMOCIONES, EMOCION_OTRA, OTRA_MAX_LENGTH, nombreDeEmocion } from '@lib/emociones'
import { momento } from '@tokens'
import SelectorDeChips from '@components/strivo/SelectorDeChips'

export default function SelectorEmociones({ selected = [], onChange, max }) {
  const t = useCopy()

  return (
    <SelectorDeChips
      titulo={copy.hoy.emociones.titulo}
      subtitulo={copy.hoy.emociones.subtitulo}
      opciones={EMOCIONES}
      nombreDe={id => nombreDeEmocion(id, t)}
      selected={selected}
      onChange={onChange}
      max={max}
      otraId={EMOCION_OTRA}
      otraLabel={copy.hoy.emociones.otraLabel}
      otraPlaceholder={copy.hoy.emociones.otraPlaceholder}
      otraAdd={copy.hoy.emociones.otraAdd}
      otraMaxLength={OTRA_MAX_LENGTH}
      countTemplate={copy.hoy.emociones.countTemplate}
      tono={momento.manana}
      idBase="emociones"
    />
  )
}
