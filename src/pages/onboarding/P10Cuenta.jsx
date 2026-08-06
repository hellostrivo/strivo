// src/pages/onboarding/P10Cuenta.jsx
// P10 — Crear cuenta
// Copy: copy.onboarding.p10 · Errores: copy.errors.generic
//
// La cuenta llega al final y no al principio: para entonces la persona ya
// escribió su identidad, sus hábitos y una cosa buena de hoy, y todo eso ya
// está guardado en el dispositivo. La cuenta solo lo respalda (RN-07), así que
// "Ahora no" no bloquea nada y se dice tal cual.
//
// Si algo falla se muestra copy amable y el mismo botón sirve de reintento;
// el código del error se queda en la consola (criterio 5). Cerrar la ventana
// del proveedor no es un error: no muestra nada.

import { useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import {
  isAuthAvailable,
  signInWithGoogle,
  signInWithApple,
  createAccountWithEmail,
} from '@lib/auth'
import Button from '@components/ui/Button'
import OnboardingLayout from '@components/onboarding/OnboardingLayout'

const MIN_PASSWORD = 8

export default function P10Cuenta({ step, totalSteps, cuenta, onChange, onBack, onNext }) {
  const headingRef = useRef(null)
  const correoRef  = useRef(null)

  const [conCorreo, setConCorreo]   = useState(false)
  const [correo, setCorreo]         = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enCurso, setEnCurso]       = useState(null)   // 'google' | 'apple' | 'correo'
  const [motivo, setMotivo]         = useState(null)   // 'correoExistente' | 'generico'

  useEffect(() => { headingRef.current?.focus() }, [])
  useEffect(() => { if (conCorreo) correoRef.current?.focus() }, [conCorreo])

  const correoValido = correo.includes('@') && contrasena.length >= MIN_PASSWORD

  // Sin Firebase configurado no se ofrecen opciones que van a fallar: la
  // pantalla dice lo que es cierto igualmente (todo funciona sin cuenta) y sigue.
  const authDisponible = isAuthAvailable()

  const intentar = async (via, accion) => {
    setEnCurso(via)
    setMotivo(null)
    const resultado = await accion()
    setEnCurso(null)

    if (resultado.ok) {
      onChange(resultado.cuenta)
      return
    }
    // 'cancelado' es una decisión, no un fallo: la pantalla se queda como estaba
    if (resultado.motivo !== 'cancelado') setMotivo(resultado.motivo)
  }

  const aviso = {
    correoExistente: copy.onboarding.p10.emailExists,
    generico:        copy.errors.generic.title,
  }[motivo]

  // Cuenta creada: la pantalla ya no pide nada, solo confirma
  if (cuenta) {
    return (
      <OnboardingLayout
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        footer={
          <Button variant="primary" size="lg" fullWidth onClick={onNext}>
            {copy.onboarding.nav.continue}
          </Button>
        }
      >
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-xl leading-tight text-ink focus:outline-none"
        >
          {copy.onboarding.p10.ready}
        </h1>

        {cuenta.correo && (
          <p className="mt-3 text-base text-ink/80">{cuenta.correo}</p>
        )}
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={authDisponible ? (
        <Button variant="ghost" size="md" fullWidth onClick={onNext}>
          {copy.onboarding.p10.skip}
        </Button>
      ) : (
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          {copy.onboarding.nav.continue}
        </Button>
      )}
    >
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {copy.onboarding.p10.question}
      </h1>

      <p className="mt-3 text-base text-ink/80">
        {copy.onboarding.p10.hint}
      </p>

      {authDisponible && (
        <div className="mt-10 flex flex-col gap-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            loading={enCurso === 'google'}
            disabled={!!enCurso}
            onClick={() => intentar('google', signInWithGoogle)}
          >
            {copy.onboarding.p10.google}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            loading={enCurso === 'apple'}
            disabled={!!enCurso}
            onClick={() => intentar('apple', signInWithApple)}
          >
            {copy.onboarding.p10.apple}
          </Button>

          {!conCorreo && (
            <Button
              variant="ghost"
              size="md"
              fullWidth
              disabled={!!enCurso}
              onClick={() => setConCorreo(true)}
            >
              {copy.onboarding.p10.email}
            </Button>
          )}
        </div>
      )}

      {conCorreo && (
        <div id="p10-correo" className="mt-8 animate-fade-up">
          <label htmlFor="p10-correo-campo" className="block text-base text-ink/80">
            {copy.onboarding.p10.emailLabel}
          </label>
          <input
            id="p10-correo-campo"
            ref={correoRef}
            type="email"
            value={correo}
            autoComplete="email"
            autoCapitalize="none"
            enterKeyHint="next"
            onChange={event => setCorreo(event.target.value)}
            className={campoClase}
          />

          <label htmlFor="p10-clave" className="mt-6 block text-base text-ink/80">
            {copy.onboarding.p10.passwordLabel}
          </label>
          <input
            id="p10-clave"
            type="password"
            value={contrasena}
            autoComplete="new-password"
            enterKeyHint="done"
            aria-describedby="p10-clave-pista"
            onChange={event => setContrasena(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && correoValido) {
                intentar('correo', () => createAccountWithEmail(correo.trim(), contrasena))
              }
            }}
            className={campoClase}
          />
          <p id="p10-clave-pista" className="mt-2 text-sm text-ink/70">
            {copy.onboarding.p10.passwordHint}
          </p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-6"
            loading={enCurso === 'correo'}
            disabled={!correoValido || !!enCurso}
            onClick={() => intentar('correo', () => createAccountWithEmail(correo.trim(), contrasena))}
          >
            {copy.onboarding.p10.create}
          </Button>
        </div>
      )}

      <p className="mt-8 text-base text-ink/80" aria-live="polite">
        {aviso ?? copy.onboarding.p10.skipNote}
      </p>
    </OnboardingLayout>
  )
}

const campoClase = [
  'mt-3 w-full min-h-touch',
  'rounded-md bg-surface border border-border',
  'px-4 py-4 text-md text-ink',
  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
  'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
].join(' ')
