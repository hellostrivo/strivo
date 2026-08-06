// src/pages/onboarding/P7HabitosManana.jsx
// P7 — Hábitos del ritual de mañana
// Copy: copy.onboarding.p7 · Cuerpo compartido: @components/onboarding/SeleccionHabitos
//
// Lo elegido aquí se proyecta al Ritual de Mañana en cuanto se entra a la app
// (§5.7.2, RN-HR-01). Las sugerencias vienen de las áreas de P4B.

import { copy } from '@copy'
import { suggestionsFor } from '@lib/habitSuggestions'
import SeleccionHabitos from '@components/onboarding/SeleccionHabitos'

export default function P7HabitosManana({ areas, ...props }) {
  return (
    <SeleccionHabitos
      {...props}
      momento="manana"
      question={copy.onboarding.p7.question}
      hint={copy.onboarding.p7.hint}
      otherPlaceholder={copy.onboarding.p7.otherPlaceholder}
      suggestions={suggestionsFor('manana', areas)}
    />
  )
}
