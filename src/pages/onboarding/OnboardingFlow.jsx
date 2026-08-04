// src/pages/onboarding/OnboardingFlow.jsx
// Secuencia del onboarding de Strivo.
//
// Implementado: P1 (Bienvenida) · P2 (Motivo) · P3 (Identidad central) ·
//               P3B (Áreas) · P3C (Identidad por área, opcional).
// Pendientes: P4 (nombre), P5 (primer valor), P11 (cierre). Añadirlos es
// alargar STEPS: el progreso, el "Atrás" y el borrador local ya son genéricos.
//
// Cada paso persiste al instante en local (RN-02): salir y volver no pierde nada.

import { useState } from 'react'
import { loadDraft, saveDraft } from '@lib/onboardingStorage'
import P1Bienvenida       from './P1Bienvenida'
import P2Motivo           from './P2Motivo'
import P3Identidad        from './P3Identidad'
import P3BAreas           from './P3BAreas'
import P3CIdentidadArea   from './P3CIdentidadArea'

const STEPS = [
  { id: 'p1'  },
  { id: 'p2'  },
  { id: 'p3'  },
  { id: 'p3b' },
  // Sin áreas no hay nada que nombrar: el paso desaparece en vez de mostrarse vacío.
  { id: 'p3c', skipWhen: draft => draft.areas.length === 0 },
]

// El borrador guarda lo que se escribió aunque después se quite el área
// (así reaparece si se vuelve a elegir). Al cerrar el flujo se entrega solo
// lo que sigue vigente y con contenido.
function finalize(draft) {
  const identidadesArea = {}
  for (const tipo of draft.areas) {
    const texto = (draft.identidadesArea[tipo] ?? '').trim()
    if (texto) identidadesArea[tipo] = texto
  }
  return {
    ...draft,
    identidadCentral: draft.identidadCentral.trim(),
    identidadesArea,
  }
}

export default function OnboardingFlow({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft]         = useState(loadDraft)

  const steps   = STEPS.filter(s => !s.skipWhen?.(draft))
  const index   = Math.min(stepIndex, steps.length - 1)
  const current = steps[index]

  const update = patch => {
    const next = { ...draft, ...patch }
    setDraft(next)
    saveDraft(next)
  }

  const back = () => setStepIndex(Math.max(0, index - 1))
  const next = () => {
    if (index === steps.length - 1) {
      onComplete?.(finalize(draft))
      return
    }
    setStepIndex(index + 1)
  }

  const common = { step: index + 1, totalSteps: steps.length }

  switch (current.id) {
    case 'p1':
      return <P1Bienvenida {...common} onNext={next} />

    case 'p2':
      return (
        <P2Motivo
          {...common}
          motivos={draft.motivos}
          propios={draft.motivosPropios}
          onChangeMotivos={motivos => update({ motivos })}
          onChangePropios={motivosPropios => update({ motivosPropios })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p3':
      return (
        <P3Identidad
          {...common}
          identidad={draft.identidadCentral}
          onChange={identidadCentral => update({ identidadCentral })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p3b':
      return (
        <P3BAreas
          {...common}
          areas={draft.areas}
          onChange={areas => update({ areas })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p3c':
      return (
        <P3CIdentidadArea
          {...common}
          areas={draft.areas}
          identidades={draft.identidadesArea}
          onChange={(tipo, texto) =>
            update({ identidadesArea: { ...draft.identidadesArea, [tipo]: texto } })
          }
          onBack={back}
          onNext={next}
        />
      )

    default:
      return null
  }
}
