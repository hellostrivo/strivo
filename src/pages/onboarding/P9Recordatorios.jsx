// src/pages/onboarding/P9Recordatorios.jsx
// P9 — Recordatorios
// Copy: copy.onboarding.p9 · Textos de los avisos: copy.notifications
//
// Se enseña exactamente lo que va a llegar y a qué hora antes de pedir el
// permiso: dos avisos al día, con las horas de P6 y sin contenido de la persona
// (§3.10 — nunca un badge numérico ni lo que escribió).
//
// El permiso solo se pide al tocar "Activar": el diálogo del sistema no aparece
// por sorpresa. Si el dispositivo lo niega, se dice sin dramatismo y se sigue;
// negar no deja la pantalla en estado de error ni se vuelve a insistir.

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import { requestNotificationPermission } from '@lib/notifications'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

export default function P9Recordatorios({
  step,
  totalSteps,
  horaDespertar,
  horaDormir,
  recordatorios,     // { activos, permiso } si ya se resolvió; null si no
  onChange,
  onBack,
  onNext,
}) {
  const headingRef = useRef(null)
  const [pidiendo, setPidiendo] = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  const permiso = recordatorios?.permiso ?? null

  const activar = async () => {
    setPidiendo(true)
    const resultado = await requestNotificationPermission()
    setPidiendo(false)
    onChange({ activos: resultado === 'granted', permiso: resultado })
  }

  const avisos = [
    { hora: horaDespertar, texto: copy.notifications.manana },
    { hora: horaDormir,    texto: copy.notifications.noche  },
  ]

  const respuesta = {
    granted:     copy.onboarding.p9.granted,
    denied:      copy.onboarding.p9.denied,
    default:     copy.onboarding.p9.denied,   // cerró el diálogo sin decidir
    unsupported: copy.onboarding.p9.unsupported,
  }[permiso]

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={permiso ? (
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          {copy.onboarding.nav.continue}
        </Button>
      ) : (
        <>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={pidiendo}
            onClick={activar}
          >
            {copy.onboarding.p9.activate}
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onNext}>
            {copy.onboarding.p9.skip}
          </Button>
        </>
      )}
    >
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p9.question}
      </h1>

      <p className="mt-3 text-base text-ink/80">
        {copy.onboarding.p9.hint}
      </p>

      <div className="mt-10 flex flex-col gap-3">
        {avisos.map(aviso => (
          <Card key={aviso.hora + aviso.texto}>
            <p className="text-base text-ink">
              {interpolate(copy.onboarding.p9.previewTemplate, {
                hora:  aviso.hora,
                texto: aviso.texto,
              })}
            </p>
          </Card>
        ))}
      </div>

      {/* La respuesta del sistema se anuncia sola: nadie tiene que ir a buscarla */}
      <p className="mt-8 text-base text-ink/80 animate-fade-up" aria-live="polite">
        {respuesta}
      </p>
    </OnboardingLayout>
  )
}
