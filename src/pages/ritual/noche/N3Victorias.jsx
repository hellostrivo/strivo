// src/pages/ritual/noche/N3Victorias.jsx
// N3 — Victorias heredadas de la mañana + logros no planeados
// Copy: copy.ritualNoche.n3 · etiquetas de acción en copy.diarioNoche
//
// Las dos mitades van juntas en el ritual porque son la misma pregunta —qué
// pasó hoy— y así se recorren de una vez. En la Vista de Noche son dos bloques
// separados, pero los componentes son los mismos:
//   @components/diario/VictoriasHeredadas · @components/diario/LogrosNoPlaneados

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import VictoriasHeredadas from '@components/diario/VictoriasHeredadas'
import LogrosNoPlaneados from '@components/diario/LogrosNoPlaneados'

export default function N3Victorias({
  heredadas,
  decisiones,
  logros,
  onDecidir,
  onAnadirLogro,
  onQuitarLogro,
}) {
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.ritualNoche.n3.question}
      </h1>

      {heredadas.length > 0 && (
        <div className="mt-8">
          <p className="text-base text-ink/80">
            {copy.diarioNoche.victories.label}
          </p>
          <div className="mt-4">
            <VictoriasHeredadas
              heredadas={heredadas}
              decisiones={decisiones}
              onDecidir={onDecidir}
            />
          </div>
        </div>
      )}

      <div className="mt-10">
        <LogrosNoPlaneados
          logros={logros}
          onAnadir={onAnadirLogro}
          onQuitar={onQuitarLogro}
          idCampo="n3-logro"
        />
      </div>
    </>
  )
}
