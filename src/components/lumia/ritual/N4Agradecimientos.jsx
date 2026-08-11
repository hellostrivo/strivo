// src/components/lumia/ritual/N4Agradecimientos.jsx
// N4 — Agradecimientos (§5.6): el sistema de filas dinámicas.
//
// Si ya se agradeció algo por la mañana, se muestra plegado arriba y **no se
// vuelve a pedir** (§5.4, Bloque 4). Repetir la misma pregunta a las once de la
// noche convierte una gratitud en un trámite.
//
// Las sugerencias son las nocturnas, orientadas al día vivido, y siguen la
// regla dura del bloque: tocar una idea nunca rellena el campo, abre una
// pregunta detonante. La app no escribe por nadie.

import { useEffect, useState } from 'react'
import CampoGratitud from '../CampoGratitud'
import { copy, interpolate } from '@copy'
import { LIMITES, desdeTextos, filasIniciales, textosDe } from '@/lumia/filas'

const textos = copy.lumia.diario.noche.gratitud

export default function N4Agradecimientos({ estado, acciones }) {
  const [filas, setFilas] = useState([])
  const [verManana, setVerManana] = useState(false)
  const deLaManana = estado.morning?.gratitude ?? []

  // Volver atrás y adelante en el ritual no puede perder nada: las filas se
  // rehacen de lo ya guardado, que el autoguardado deja siempre al día.
  useEffect(() => {
    setFilas(filasIniciales(desdeTextos(estado.night?.gratitude), LIMITES.gratitud))
  }, [estado.fecha])

  const guardar = (siguientes) => {
    setFilas(siguientes)
    acciones.escribirNoche({ gratitude: textosDe(siguientes) })
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>

      {deLaManana.length > 0 && (
        <div className="flex flex-col gap-1 rounded-md border border-on-surface bg-lumia-campo p-3">
          <p className="text-sm text-on-surface-soft">
            {interpolate(textos.mananaTemplate, {
              textos: verManana ? deLaManana.join(' · ') : '…',
            })}
          </p>
          <button
            type="button"
            onClick={() => setVerManana((previo) => !previo)}
            className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {verManana ? textos.ocultar : textos.ver}
          </button>
        </div>
      )}

      <CampoGratitud
        filas={filas}
        limites={LIMITES.gratitud}
        onCambiar={guardar}
        onVolcar={acciones.volcar}
        sugerencias={textos.sugerencias}
        etiqueta={textos.titulo}
        placeholder={textos.placeholder}
      />
    </section>
  )
}
