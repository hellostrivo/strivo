// src/pages/formia/Progreso.jsx
// La vista de progreso de Formia (§C3.7, SPEC_05).
//
// Es donde Formia cumple su promesa: *actúa desde tu identidad, no desde tus
// hábitos*. No es un panel de estadísticas — es la evidencia acumulada de quién
// estás siendo, organizada por identidad (RN-FO-ID-04).
//
// RN-FO-PRO-01 — Aquí no hay ningún dato emocional: ni ánimo, ni emociones, ni
// extractos de journal. Cruzar constancia con ánimo es Strivo Intelligence
// (Capítulo 4), y en Fase 1 no se cruza nada (§C7.4).
//
// RN-FO-PRO-02 — El progreso de hábitos vive únicamente aquí. Ninguna
// superficie de Lumia lo replica.
//
// RN-SI-02 — El insight tiene su propia superficie y no se inyecta dentro del
// espacio de hábitos: por eso vive en esta pantalla y no en H1.

import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import ConstanciaPorIdentidad from '@components/formia/ConstanciaPorIdentidad'
import { copy, interpolate } from '@copy'
import { constanciaTotal, progresoPorIdentidad } from '@/lib/constancia'
import { useHabitos } from '@/formia/useHabitos'

const textos = copy.formia.progreso

function textoConstancia(dias) {
  if (dias === 0) return textos.constancia.cero
  if (dias === 1) return textos.constancia.uno
  return interpolate(textos.constancia.template, { n: dias })
}

export default function Progreso({ uid }) {
  // La misma lectura que usa la lista de hábitos: no hace falta un segundo
  // cargador, y así los dos sitios no pueden discrepar.
  const { estado, carga, reintentar } = useHabitos(uid)

  if (carga === 'cargando') {
    return <div className="min-h-screen bg-espacio px-5 py-8" aria-busy="true" />
  }

  if (carga === 'error') {
    return (
      <div className="min-h-screen bg-espacio px-5 py-8 flex flex-col gap-4">
        <p className="text-base text-ink">{copy.formia.habitos.error.load.body}</p>
        <div>
          <Button size="sm" onClick={reintentar}>
            {copy.formia.habitos.error.load.retry}
          </Button>
        </div>
      </div>
    )
  }

  const { habits, logs, areas, central, hoy } = estado
  const identidades = progresoPorIdentidad(habits, logs, areas, hoy)
  const dias = constanciaTotal(logs)

  return (
    <div className="min-h-screen bg-espacio px-5 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-ink">{textos.title}</h1>
        <p className="text-base text-ink/80">{textos.lead}</p>
      </header>

      <Card className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-ink/80">{textos.constancia.title}</h2>
        {/* Sin días todavía, la tarjeta dice una frase normal. Poner un cero en
            tipografía grande sería subrayar lo que no hay. */}
        <p
          className={
            dias === 0 ? 'text-base text-ink/80' : 'font-display text-xl text-ink leading-tight'
          }
        >
          {textoConstancia(dias)}
        </p>
      </Card>

      {identidades.length === 0 ? (
        // Invitación tranquila. No hay nada que echar en falta todavía.
        <p className="text-base text-ink/80">{textos.empty}</p>
      ) : (
        identidades.map((identidad) => (
          <ConstanciaPorIdentidad
            key={identidad.identityRef}
            identidad={identidad}
            central={central}
          />
        ))
      )}
    </div>
  )
}
