// src/pages/TuPage.jsx
// Pestaña "Tú" — espacio de autoconocimiento (§4.3.1)
//
// En Fase 0 contiene el módulo de Hábitos. Insights, Historial y Perfil se
// añaden aquí como entradas hermanas cuando existan.
//
// Desde Hoy: Tú → Hábitos (2 toques) → detalle (3). Dentro de RN-10.

import { useState } from 'react'
import { copy } from '@copy'
import HabitosModulo from '@/pages/habitos/HabitosModulo'
import Button from '@components/ui/Button'

export default function TuPage() {
  const [seccion, setSeccion] = useState(null)   // null | 'habitos'

  if (seccion === 'habitos') {
    return <HabitosModulo onSalir={() => setSeccion(null)} />
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <h1 className="font-display text-xl text-ink">Tú</h1>

      <div className="mt-10 flex flex-col gap-3">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setSeccion('habitos')}
        >
          {copy.habits.list.title}
        </Button>
      </div>

      <p className="mt-10 text-sm text-ink/40">
        Insights · Historial · Perfil — Fase 1
      </p>
    </div>
  )
}
