// src/breathing/components/CierreSesion.jsx
// El final (SPEC_16 §3.4).
//
// **Se enuncia el hecho y nada más** (RN-RE-NAV-30): ni felicitación, ni
// puntaje, ni el vocabulario de acumulación que §3.6.3 prohíbe en toda la app.
// Es la misma línea que la recorre entera: la evidencia se devuelve, no se
// celebra. Celebrar el hecho de respirar convierte un refugio en un sistema de
// recompensas, y quien no vuelva mañana habrá fallado a algo — que es
// exactamente lo que Strivo no hace.
//
// **Menos de un ciclo completo: sin resumen numérico** (RN-RE-NAV-32). "Respiraste
// 0 veces" es absurdo, y además es una forma de decirle a alguien que lo que
// hizo no contó.
//
// El cruce de 900 ms es el mismo gesto de cierre del día. No se inventa otro.

import { copy, interpolate } from '@copy'

export default function CierreSesion({ resumen, onRepetir, onVolver }) {
  const textos = copy.respiracion.cierre
  const ciclos = resumen?.ciclosCompletados ?? 0
  const minutos = Math.round((resumen?.segundosActivos ?? 0) / 60)

  return (
    <section
      data-surface="light"
      className="respiracion-cierre flex min-h-screen flex-col items-center justify-center gap-6 bg-espacio px-6 py-12"
    >
      <h1 className="font-display text-lg text-on-surface">{textos.titulo}</h1>

      {resumen?.registrable ? (
        <p className="text-sm text-on-surface-soft">
          {minutos >= 1
            ? interpolate(textos.resumenTiempo, { n: minutos })
            : interpolate(textos.resumenCiclos, { n: ciclos })}
        </p>
      ) : null}

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onRepetir}
          className="min-h-touch rounded-full border border-on-surface bg-raised px-5 text-sm text-on-surface"
        >
          {textos.repetir}
        </button>
        <button
          type="button"
          onClick={onVolver}
          className="min-h-touch rounded-full px-5 text-sm text-on-surface-soft"
        >
          {textos.volverAlInicio}
        </button>
      </div>
    </section>
  )
}
