// src/pages/ritual/noche/N1Respiracion.jsx
// N1 — Respiración
// Copy: docs/copy-library.md §2 → copy.ritualNoche.n1
// Cuerpo compartido con R1: @components/ritual/Respiracion
//
// Mismo ciclo de 6s que la mañana, con el círculo en plum en vez de amber. El
// ritual entero va sobre el degradado claro de la noche (gradientsBySlot.noche);
// lo único que se atenúa a oscuro es la ceremonia de cierre.

import { copy } from '@copy'
import Respiracion from '@components/ritual/Respiracion'

export default function N1Respiracion({ onNext }) {
  return (
    <Respiracion
      textos={copy.ritualNoche.n1}
      onNext={onNext}
      circuloClase="bg-plum/25 border-plum/40"
    />
  )
}
