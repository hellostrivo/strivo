// src/pages/onboarding/OnboardingFlow.jsx
// Secuencia del onboarding de Strivo.
//
// Implementado: P1 (Bienvenida) · P2 (Motivo) · P3 (Identidad central) ·
//               P3B (Áreas) · P3C (Identidad por área, opcional) · P4 (Nombre) ·
//               P5 (Primer momento de valor) · P6 (Horarios) · P7 y P8 (hábitos
//               de mañana y de noche) · P9 (Recordatorios) · P10 (Cuenta) ·
//               P11 (Cierre).
//
// Cada paso persiste al instante en local (RN-02): salir y volver no pierde nada.
// En P11 el borrador se convierte en perfil, áreas y hábitos reales.

import { useCallback, useState } from 'react'
import { loadDraft, saveDraft, savePrimeraVictoria } from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { todayKey } from '@lib/timeSlot'
import P1Bienvenida       from './P1Bienvenida'
import P2Motivo           from './P2Motivo'
import P3Identidad        from './P3Identidad'
import P3BAreas           from './P3BAreas'
import P3CIdentidadArea   from './P3CIdentidadArea'
import P4Nombre           from './P4Nombre'
import P5PrimerValor      from './P5PrimerValor'
import P6Horarios         from './P6Horarios'
import P7HabitosManana    from './P7HabitosManana'
import P8HabitosNoche     from './P8HabitosNoche'
import P9Recordatorios    from './P9Recordatorios'
import P10Cuenta          from './P10Cuenta'
import P11Cierre          from './P11Cierre'

const STEPS = [
  { id: 'p1'  },
  { id: 'p2'  },
  { id: 'p3'  },
  { id: 'p3b' },
  // Sin áreas no hay nada que nombrar: el paso desaparece en vez de mostrarse vacío.
  { id: 'p3c', skipWhen: draft => draft.areas.length === 0 },
  { id: 'p4'  },
  { id: 'p5'  },
  { id: 'p6'  },
  { id: 'p7'  },
  { id: 'p8'  },
  { id: 'p9'  },
  { id: 'p10' },
  { id: 'p11' },
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
    nombre: (draft.nombre ?? '').trim(),
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

  // P5 — el borrador se actualiza en el acto (síncrono, nunca falla) y la fila de
  // IndexedDB se escribe detrás, sin hacer esperar a la confirmación. Si el
  // almacén no está disponible, lo escrito sigue vivo en el borrador: la promesa
  // de la pantalla ("se queda guardada aquí") se cumple igual.
  const guardarPrimeraVictoria = texto => {
    update({ primeraVictoria: { texto, fecha: todayKey() } })
    savePrimeraVictoria(texto).catch(error => {
      console.warn('[Strivo] La primera victoria se queda solo en el borrador:', error)
    })
  }

  // P11 — el borrador pasa a ser perfil, áreas y hábitos. Se escribe al entrar
  // a la pantalla y sin bloquearla: si el almacén falla, el borrador conserva
  // todo y la persona entra igual (§3.3 — el cierre nunca falla).
  const materializar = useCallback(() => {
    finishOnboarding(finalize(draft)).catch(error => {
      console.warn('[Strivo] El perfil se queda en el borrador local:', error)
    })
  }, [draft])

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

    case 'p4':
      return (
        <P4Nombre
          {...common}
          nombre={draft.nombre}
          onChange={nombre => update({ nombre })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p5':
      return (
        <P5PrimerValor
          {...common}
          identidad={draft.identidadCentral.trim()}
          victoria={draft.primeraVictoria}
          onSave={guardarPrimeraVictoria}
          onBack={back}
          onNext={next}
        />
      )

    case 'p6':
      return (
        <P6Horarios
          {...common}
          horaDespertar={draft.horaDespertar}
          horaDormir={draft.horaDormir}
          onChange={update}
          onBack={back}
          onNext={next}
        />
      )

    case 'p7':
      return (
        <P7HabitosManana
          {...common}
          areas={draft.areas}
          habitos={draft.habitosManana}
          onChange={habitosManana => update({ habitosManana })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p8':
      return (
        <P8HabitosNoche
          {...common}
          areas={draft.areas}
          habitos={draft.habitosNoche}
          onChange={habitosNoche => update({ habitosNoche })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p9':
      return (
        <P9Recordatorios
          {...common}
          horaDespertar={draft.horaDespertar}
          horaDormir={draft.horaDormir}
          recordatorios={draft.recordatorios}
          onChange={recordatorios => update({ recordatorios })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p10':
      return (
        <P10Cuenta
          {...common}
          cuenta={draft.cuenta}
          onChange={cuenta => update({ cuenta })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p11':
      return (
        <P11Cierre
          {...common}
          identidad={draft.identidadCentral.trim()}
          areas={draft.areas}
          horaDespertar={draft.horaDespertar}
          onEnter={materializar}
          onBack={back}
          onNext={next}
        />
      )

    default:
      return null
  }
}
