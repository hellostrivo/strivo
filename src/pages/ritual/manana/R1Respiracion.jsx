// src/pages/ritual/manana/R1Respiracion.jsx
// R1 — Respiración
// Copy: docs/copy-library.md §2 → copy.ritualManana.r1
// Cuerpo compartido con N1: @components/ritual/Respiracion

import { copy } from '@copy'
import Respiracion from '@components/ritual/Respiracion'

export default function R1Respiracion({ onNext }) {
  return <Respiracion textos={copy.ritualManana.r1} onNext={onNext} />
}
