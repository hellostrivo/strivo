// src/components/journal/SelectorEmocionesJournal.jsx
// Cómo me siento — la pregunta que abre el Journal (bloque 06).
// Copy: copy.journal.emociones · catálogo, ids y emojis: @lib/emocionesJournal
//
// El cuadro, los chips y el campo de "Otra" viven en @components/strivo/
// SelectorDeChips, los mismos que la pregunta de la mañana y el cierre de la
// noche. Aquí solo se dice qué se pregunta, con qué opciones, cuántas caben y
// de qué color es la tarjeta.
//
// NO ES la pregunta de la Vista de Mañana. Aquella es aspiracional —"¿Cómo me
// quiero sentir hoy?", solo emociones que se pueden cultivar, hasta dos— y vive
// en @components/strivo/SelectorEmociones con su propio catálogo. Esta pregunta
// por el presente, incluye las difíciles y admite tres. Son dos hermanas, no
// dos configuraciones de la misma: cambiar una no cambia la otra.

import { copy } from '@copy'
import useCopy from '@hooks/useCopy'
import {
  EMOCIONES_JOURNAL,
  EMOCION_JOURNAL_OTRA,
  MAX_EMOCIONES_JOURNAL,
  OTRA_MAX_LENGTH,
  normalizarEmocionesJournal,
  nombreDeEmocionJournal,
} from '@lib/emocionesJournal'
import { superficieJournal } from '@tokens'
import SelectorDeChips from '@components/strivo/SelectorDeChips'

export default function SelectorEmocionesJournal({ selected = [], onChange }) {
  const t = useCopy()

  return (
    <SelectorDeChips
      titulo={copy.journal.emociones.titulo}
      subtitulo={copy.journal.emociones.subtitulo}
      opciones={EMOCIONES_JOURNAL}
      nombreDe={id => nombreDeEmocionJournal(id, t)}
      selected={normalizarEmocionesJournal(selected)}
      onChange={onChange}
      max={MAX_EMOCIONES_JOURNAL}
      otraId={EMOCION_JOURNAL_OTRA}
      otraLabel={copy.journal.emociones.otraLabel}
      otraPlaceholder={copy.journal.emociones.otraPlaceholder}
      otraAdd={copy.journal.emociones.otraAdd}
      otraMaxLength={OTRA_MAX_LENGTH}
      otraPistaUnaPalabra={copy.journal.emociones.otraHint}
      countTemplate={copy.journal.emociones.countTemplate}
      tono={superficieJournal.emociones}
      idBase="journal-emociones"
    />
  )
}
