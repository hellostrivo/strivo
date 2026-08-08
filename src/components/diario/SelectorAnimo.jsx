// src/components/diario/SelectorAnimo.jsx
// Cómo te vas a dormir — nueve estados, se eligen hasta dos.
// Compartido por el Ritual de Noche (N6) y la Vista de Noche (bloque 5).
// Copy: copy.ritualNoche.n6 · ids, orden, emojis y límite: @lib/animos
//
// El cuadro, los chips y el campo de "Algo más" viven en @components/strivo/
// SelectorDeChips, los mismos que la pregunta de la mañana. Aquí solo se dice
// qué se pregunta, con qué opciones y de qué color es la tarjeta: las dos
// preguntas son el mismo gesto en dos momentos del día, y el tono es lo único
// que las distingue.
//
// Ninguno es mejor que otro: "Inquieta" no es peor que "En paz", solo distinto,
// y ninguno se pinta en rojo ni abre una pregunta de seguimiento.
//
// De aquí sale el saludo de mañana (R2 cambia si el día se cerró con cansancio
// o inquietud), así que responder tiene consecuencia, pero no calificación.
//
// Lo que se guarda son ids, no lo que se lee: el rótulo cambia con el género y
// el id no (ver la nota de @lib/animos).

import { copy } from '@copy'
import useCopy from '@hooks/useCopy'
import {
  ANIMOS,
  ANIMO_OTRO,
  MAX_ANIMOS,
  OTRO_MAX_LENGTH,
  normalizarAnimos,
  nombreDeAnimo,
} from '@lib/animos'
import { momento } from '@tokens'
import SelectorDeChips from '@components/strivo/SelectorDeChips'

export default function SelectorAnimo({ animos = [], onChange, tituloRef, tituloComo }) {
  const t = useCopy()

  // La palabra propia ya viene dentro de la lista (la pliega @lib/ritualNoche al
  // cargar). "Algo más" a secas —lo que guardaba la versión anterior cuando no
  // había palabra— no tiene chip que lo represente, así que no ocupa sitio aquí.
  const elegidos = normalizarAnimos(animos).filter(id => id !== ANIMO_OTRO)

  return (
    <SelectorDeChips
      titulo={copy.ritualNoche.n6.question}
      subtitulo={copy.ritualNoche.n6.subtitle}
      opciones={ANIMOS}
      nombreDe={id => nombreDeAnimo(id, t)}
      selected={elegidos}
      onChange={siguientes => onChange({ animos: siguientes })}
      max={MAX_ANIMOS}
      otraId={ANIMO_OTRO}
      otraLabel={copy.ritualNoche.n6.otherLabel}
      otraPlaceholder={copy.ritualNoche.n6.otherPlaceholder}
      otraAdd={copy.ritualNoche.n6.otherAdd}
      otraMaxLength={OTRO_MAX_LENGTH}
      // Aquí cabe una palabra, y se dice cuando hace falta en vez de comerse el
      // espacio en silencio: escribir "muy contenta" y ver "muycontenta" no
      // explica nada. La mañana admite una frase corta, así que no lleva pista.
      otraPistaUnaPalabra={copy.ritualNoche.n6.otherHint}
      countTemplate={copy.ritualNoche.n6.countTemplate}
      tono={momento.noche}
      idBase="animo"
      // Los ocho rótulos miden casi lo mismo y alineados a la izquierda se
      // cuadran en dos columnas. Centrados vuelven a leerse como un grupo.
      alineacion="centro"
      tituloRef={tituloRef}
      tituloComo={tituloComo}
    />
  )
}
