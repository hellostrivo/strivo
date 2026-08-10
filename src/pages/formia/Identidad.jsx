// src/pages/formia/Identidad.jsx
// Espacio de identidad de Formia — pantalla raíz (SPEC_03, §C3.3).
//
// Es un destino, no un tránsito: se entra, se lee y se sale sin completar nada.
// Sin "siguiente", sin "paso 2 de 5", sin barra de progreso y sin nada que
// cierre una secuencia (§C3.0, principio 1). Nadie tiene que pasar por aquí
// ningún día concreto.
//
// RN-DB4-01 — Esta pantalla no lee `lumia/`: aquí no hay journal, ni ánimo, ni
// victorias. El vocabulario también es de Formia: se construye, no se reflexiona.

import { useState } from 'react'
import Button from '@components/ui/Button'
import AreaCard from '@components/formia/AreaCard'
import IdentidadCentral from '@components/formia/IdentidadCentral'
import SelectorAreas from '@components/formia/SelectorAreas'
import { copy } from '@copy'
import { areasEnMarcha, areasPausadas } from '@/formia/identidad'
import { useIdentidad } from '@/formia/useIdentidad'

const textos = copy.formia.identidad

export default function Identidad({ uid }) {
  const { estado, carga, aviso, error, acciones, limpiarAviso, reintentar } = useIdentidad(uid)
  const [eligiendo, setEligiendo] = useState(false)

  if (carga === 'cargando') {
    return <main className="min-h-screen bg-paper px-5 py-8" aria-busy="true" />
  }

  // Sin árbol no hay identidad central que enseñar, y RN-DB4-08 prohíbe
  // inventarla. Para quien mira es lo mismo que un fallo de lectura: se dice
  // con calma y se ofrece volver a intentarlo.
  if (carga === 'error' || !estado.existe) {
    return (
      <main className="min-h-screen bg-paper px-5 py-8 flex flex-col gap-4">
        <p className="text-base text-ink">{textos.error.load.body}</p>
        <div>
          <Button size="sm" onClick={reintentar}>
            {textos.error.load.retry}
          </Button>
        </div>
      </main>
    )
  }

  const enMarcha = areasEnMarcha(estado.areas)
  const pausadas = areasPausadas(estado.areas)
  const sinAreas = enMarcha.length === 0 && pausadas.length === 0

  const manejadoresDeArea = {
    onGuardarIdentidad: acciones.guardarIdentidadArea,
    onPausar: acciones.pausarArea,
    onReanudar: acciones.reanudarArea,
    onQuitar: acciones.quitarArea,
  }

  return (
    <main className="min-h-screen bg-paper px-5 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-ink">{textos.title}</h1>
        <p className="text-base text-ink/80">{textos.lead}</p>
      </header>

      {/* La central siempre se ve, haya o no áreas (RN-ID-01). */}
      <IdentidadCentral
        central={estado.central}
        history={estado.history}
        restaurada={aviso === 'restaurada'}
        onGuardar={acciones.guardarCentral}
        onCerrarAviso={limpiarAviso}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-ink">{textos.areas.title}</h2>
          <p className="text-sm text-ink/80">{textos.areas.lead}</p>
        </div>

        {enMarcha.map((area) => (
          <AreaCard key={area.id} area={area} {...manejadoresDeArea} />
        ))}

        {/* RN-ID-04 — Pausadas: fuera de la vista activa, enteras en los datos. */}
        {pausadas.length > 0 && (
          <div className="flex flex-col gap-4 pt-2">
            <h3 className="text-sm font-medium text-ink/80">{textos.areas.pausedTitle}</h3>
            {pausadas.map((area) => (
              <AreaCard key={area.id} area={area} {...manejadoresDeArea} />
            ))}
          </div>
        )}

        {/* Cero áreas es un estado válido, no un hueco por llenar (RN-ID-02). */}
        {sinAreas && !eligiendo && <p className="text-base text-ink/80">{textos.areas.empty}</p>}

        {eligiendo ? (
          <div className="flex flex-col gap-4">
            <SelectorAreas
              areas={estado.areas}
              aviso={aviso}
              onElegir={acciones.elegirArea}
              onQuitar={acciones.quitarArea}
            />
            <div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  limpiarAviso()
                  setEligiendo(false)
                }}
              >
                {textos.areas.close}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button size="sm" variant="secondary" onClick={() => setEligiendo(true)}>
              {textos.areas.open}
            </Button>
          </div>
        )}
      </section>

      {/* Un guardado que no salió: copy amable y reintento, nunca un código. */}
      {error && (
        <p className="flex flex-wrap items-center gap-3 text-sm text-ink/80" role="status">
          {textos.error.save.body}
          <Button size="sm" variant="ghost" onClick={error.reintentar}>
            {textos.error.save.retry}
          </Button>
        </p>
      )}
    </main>
  )
}
