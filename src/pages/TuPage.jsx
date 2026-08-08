// src/pages/TuPage.jsx
// Pestaña "Tú" — espacio de autoconocimiento (§4.3.1)
//
// En Fase 0 contiene Historial. Insights y Perfil se añaden aquí como entradas
// hermanas cuando existan.
//
// Los hábitos salieron de aquí: ahora son su propia pestaña (§19). Se van sin
// dejar un enlace de reenvío, que solo sería un rodeo más.

import { useState } from 'react'
import { copy } from '@copy'
import HistorialModulo from '@/pages/historial/HistorialModulo'
import Button from '@components/ui/Button'

export default function TuPage() {
  const [seccion, setSeccion] = useState(null)   // null | 'historial'

  if (seccion === 'historial') {
    return <HistorialModulo onSalir={() => setSeccion(null)} />
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <h1 className="font-display text-xl text-ink">{copy.nav.tu}</h1>

      <div className="mt-10 flex flex-col gap-3">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setSeccion('historial')}
        >
          {copy.historial.title}
        </Button>
      </div>

      <p className="mt-10 text-sm text-ink/40">
        Insights · Perfil — Fase 1
      </p>
    </div>
  )
}
