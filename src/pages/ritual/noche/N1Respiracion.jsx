// src/pages/ritual/noche/N1Respiracion.jsx
// N1 — Respiración
// Copy: docs/copy-library.md §2 → copy.ritualNoche.n1
// Cuerpo compartido con R1: @components/ritual/Respiracion
//
// Mismo ciclo de 13s que la mañana y el mismo círculo dorado. El plum de antes
// se retiró con el rediseño del ejercicio (bloque 05): al 25 % sobre el
// degradado claro de la noche era justo el círculo que se perdía, y el color
// del ejercicio ahora es un token propio, no el acento del momento del día. El
// ritual entero sigue yendo sobre gradientsBySlot.noche; lo único que se atenúa
// a oscuro es la ceremonia de cierre.

import { copy } from '@copy'
import Respiracion from '@components/ritual/Respiracion'

export default function N1Respiracion({ onNext }) {
  return <Respiracion textos={copy.ritualNoche.n1} onNext={onNext} />
}
