// src/components/lumia/ListaVictorias.jsx
// "Tres victorias que quisiera conseguir hoy" (§5.3, Bloque 5).
//
// Tres campos numerados que crecen hasta seis. Cada uno se guarda como un
// registro propio en `lumia/victories`, y la Vista de Noche los recupera por
// fecha: es la herencia que sostiene el diferenciador del producto (RN-VM-02).
//
// **No hay selector de área.** §5.3 pedía un chip con las áreas elegidas en el
// onboarding, pero esas áreas viven en Formia y desde aquí no se leen
// (RN-DB4-01). El vínculo se deduce del texto y se guarda callado; en Lumia no
// se pinta ninguna etiqueta (§C7.7.5).

import FilasDinamicas from './FilasDinamicas'
import { copy } from '@copy'
import { LIMITES } from '@/lumia/filas'

const textos = copy.lumia.diario.manana.victorias

export default function ListaVictorias({ filas, onCambiar, onVolcar }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.ayuda}</p>
      </div>

      <FilasDinamicas
        filas={filas}
        limites={LIMITES.victorias}
        onCambiar={onCambiar}
        onVolcar={onVolcar}
        placeholder={textos.placeholder}
        etiqueta={textos.titulo}
        numeradas
      />
    </section>
  )
}
