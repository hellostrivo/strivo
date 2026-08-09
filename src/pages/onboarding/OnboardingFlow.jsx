// src/pages/onboarding/OnboardingFlow.jsx
// Secuencia del onboarding de Strivo.
//
// Implementado: P1 (Bienvenida) · P2 (Nombre) · P2A (Género) · P3 (Motivo) ·
//               P4 (Identidad central) · P4B (Áreas) · T-4B (transición) ·
//               P4C (Identidad por área, opcional) · P6 (Horarios) · P7 y P8
//               (hábitos de mañana y de noche) · P9 (Recordatorios) ·
//               P10 (Cuenta) · P11 (Cierre).
//
// El orden va de lo fácil de contestar (nombre, género) a lo introspectivo
// (identidad, áreas) y deja la cuenta para el final (§1.1 del documento de
// cambios).
//
// Cada paso persiste al instante en local (RN-02): salir y volver no pierde nada.
// En P11 el borrador se convierte en perfil, áreas y hábitos reales.

import { useCallback, useEffect, useState } from 'react'
import { loadDraft, saveDraft, saveGenero } from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { setGender } from '@lib/genderStore'
import { normalizarIdentidad } from '@lib/identidad'
import P1Bienvenida       from './P1Bienvenida'
import P2Nombre           from './P2Nombre'
import P2AGenero          from './P2AGenero'
import P3Motivo           from './P3Motivo'
import P4Identidad        from './P4Identidad'
import P4BAreas           from './P4BAreas'
import T4BTransicion      from './T4BTransicion'
import P4CIdentidadArea   from './P4CIdentidadArea'
import P6Horarios         from './P6Horarios'
import P7HabitosManana    from './P7HabitosManana'
import P8HabitosNoche     from './P8HabitosNoche'
import P9Recordatorios    from './P9Recordatorios'
import P10Cuenta          from './P10Cuenta'
import P11Cierre          from './P11Cierre'

const STEPS = [
  { id: 'p1'  },
  { id: 'p2'  },
  { id: 'p2a' },
  { id: 'p3'  },
  { id: 'p4'  },
  { id: 'p4b' },
  // Sin áreas no hay nada que reencuadrar ni que nombrar: los dos pasos
  // desaparecen y de P4B se va directo a P6.
  //
  // La transición es un respiro, no un paso: hacia atrás no se reproduce.
  {
    id: 't4b',
    esTransicion: true,
    skipWhen: draft => draft.areas.length === 0,
  },
  { id: 'p4c', skipWhen: draft => draft.areas.length === 0 },
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
    // null si se dejó en blanco: es una respuesta válida y se completa otro día
    identidadCentral: normalizarIdentidad(draft.identidadCentral),
    identidadesArea,
    nombre: (draft.nombre ?? '').trim(),
  }
}

export default function OnboardingFlow({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft]         = useState(loadDraft)

  // Qué área está viendo P4C. Vive aquí y no dentro de la pantalla para que
  // volver desde P6 devuelva a la última área, no a la primera (§14.3).
  const [areaEnFoco, setAreaEnFoco] = useState(0)

  const steps   = STEPS.filter(s => !s.skipWhen?.(draft))
  const index   = Math.min(stepIndex, steps.length - 1)
  const current = steps[index]

  // El copy de las pantallas siguientes habla en el género contestado en P2A.
  // También al retomar un borrador a medias: lo que se eligió sigue vigente sin
  // volver a preguntarlo (§2.4).
  useEffect(() => { setGender(draft.gender) }, [draft.gender])

  const update = patch => {
    const next = { ...draft, ...patch }
    setDraft(next)
    saveDraft(next)
  }

  // Hacia atrás las transiciones se saltan: son un respiro entre dos pantallas,
  // y volver a verlas al corregir algo las convertiría en un peaje (§10.13).
  const back = () => {
    let anterior = index - 1
    while (anterior > 0 && steps[anterior].esTransicion) anterior -= 1
    setStepIndex(Math.max(0, anterior))
  }
  const next = () => {
    if (index === steps.length - 1) {
      onComplete?.(finalize(draft))
      return
    }
    setStepIndex(index + 1)
  }

  // P2A — el borrador se actualiza en el acto y la fila del perfil se escribe
  // detrás, sin hacer esperar a la selección (§5.9: se guarda al elegir, no al
  // pulsar Continuar). Si el almacén falla, el borrador conserva la respuesta y
  // el motor de lenguaje ya está en el género correcto.
  const guardarGenero = gender => {
    update({ gender })
    saveGenero(gender).catch(error => {
      console.warn('[Strivo] El género se queda solo en el borrador:', error)
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
        <P2Nombre
          {...common}
          nombre={draft.nombre}
          onChange={nombre => update({ nombre })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p2a':
      return (
        <P2AGenero
          {...common}
          gender={draft.gender}
          onChange={guardarGenero}
          onBack={back}
          onNext={next}
        />
      )

    case 'p3':
      return (
        <P3Motivo
          {...common}
          reasons={draft.reasons}
          otro={draft.reasonOther}
          onChangeReasons={reasons => update({ reasons })}
          onChangeOtro={reasonOther => update({ reasonOther })}
          onBack={back}
          onNext={next}
        />
      )

    case 'p4':
      return (
        <P4Identidad
          {...common}
          identidad={draft.identidadCentral}
          fuente={draft.identidadCentralFuente}
          onChange={(identidadCentral, identidadCentralFuente) =>
            update({ identidadCentral, identidadCentralFuente })
          }
          onBack={back}
          onNext={next}
        />
      )

    case 'p4b':
      return (
        <P4BAreas
          {...common}
          areas={draft.areas}
          onChange={areas => update({ areas })}
          onBack={back}
          onNext={next}
        />
      )

    case 't4b':
      return <T4BTransicion onNext={next} />

    case 'p4c':
      return (
        <P4CIdentidadArea
          {...common}
          areas={draft.areas}
          identidades={draft.identidadesArea}
          indice={areaEnFoco}
          onIndice={setAreaEnFoco}
          onChange={(tipo, texto) =>
            update({ identidadesArea: { ...draft.identidadesArea, [tipo]: texto } })
          }
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
          identidad={normalizarIdentidad(draft.identidadCentral)}
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
