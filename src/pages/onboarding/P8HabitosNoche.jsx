// src/pages/onboarding/P8HabitosNoche.jsx
// P8 — Hábitos del ritual de noche
// Copy: copy.onboarding.p8 · Cuerpo compartido: @components/onboarding/SeleccionHabitos
//
// Mismo mecanismo que P7 con el momento de la noche. Se ofrece después de la
// mañana y no antes porque el cierre del día es el hábito más difícil de
// sostener: llega cuando ya se entendió cómo funciona elegir.

import { copy } from '@copy'
import { suggestionsFor } from '@lib/habitSuggestions'
import SeleccionHabitos from '@components/onboarding/SeleccionHabitos'

export default function P8HabitosNoche({ areas, ...props }) {
  return (
    <SeleccionHabitos
      {...props}
      momento="noche"
      question={copy.onboarding.p8.question}
      hint={copy.onboarding.p8.hint}
      otherPlaceholder={copy.onboarding.p8.otherPlaceholder}
      suggestions={suggestionsFor('noche', areas)}
    />
  )
}
