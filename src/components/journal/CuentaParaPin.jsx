// src/components/journal/CuentaParaPin.jsx
// La cuenta que hace falta para poder poner un PIN (bloque 07, §07.D.5).
//
// El PIN necesita una cuenta porque es lo único que permite volver a entrar si
// se olvida. Sin ella, poner un PIN sería tenderle una trampa a la persona.
//
// P10 pasa una sola vez y quien dijo "Ahora no" no volvía a verla nunca: el
// aviso de "necesitas una cuenta" era un callejón sin salida. Esta es la puerta
// que faltaba, y no una pantalla de cuenta nueva: llama a las mismas funciones
// de @lib/auth que P10 y usa el mismo copy (copy.onboarding.p10), así que no
// hay dos formas distintas de crear la misma cuenta.
//
// Vincular no pierde nada de lo escrito antes: @lib/onboardingProfile mueve las
// filas del id local al de la cuenta, igual que al cerrar el onboarding.

import { useState } from 'react'
import { copy } from '@copy'
import {
  isAuthAvailable,
  signInWithGoogle,
  signInWithApple,
  createAccountWithEmail,
} from '@lib/auth'
import { vincularCuenta } from '@lib/onboardingProfile'
import Button from '@components/ui/Button'

const MIN_PASSWORD = 8
const p10 = copy.onboarding.p10
const c   = copy.journal.proteccion

export default function CuentaParaPin({ onVinculada }) {
  const [conCorreo, setConCorreo]   = useState(false)
  const [correo, setCorreo]         = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enCurso, setEnCurso]       = useState(null)
  const [motivo, setMotivo]         = useState(null)

  // Sin Firebase configurado no hay cuenta que crear ni PIN que ofrecer. Se
  // dice lo que es cierto en vez de ofrecer botones que van a fallar.
  if (!isAuthAvailable()) {
    return <p className="mt-4 text-sm text-ink/80">{c.sinConexionDeCuenta}</p>
  }

  const correoValido = correo.includes('@') && contrasena.length >= MIN_PASSWORD

  const intentar = async (via, accion) => {
    setEnCurso(via)
    setMotivo(null)
    const resultado = await accion()

    if (!resultado.ok) {
      setEnCurso(null)
      // Cerrar la ventana del proveedor es una decisión, no un fallo
      if (resultado.motivo !== 'cancelado') setMotivo(resultado.motivo)
      return
    }

    // La cuenta existe; ahora lo escrito hasta hoy pasa a ser suyo
    try {
      await vincularCuenta(resultado.cuenta)
      onVinculada?.(resultado.cuenta)
    } catch (error) {
      console.warn('[Strivo] La cuenta se vincula más tarde:', error)
      setMotivo('generico')
    } finally {
      setEnCurso(null)
    }
  }

  const aviso = {
    correoExistente: p10.emailExists,
    generico:        copy.errors.generic.title,
  }[motivo]

  return (
    <div className="mt-5">
      <p className="text-sm text-ink/80">{c.cuenta.ayuda}</p>

      <div className="mt-4 flex flex-col gap-3">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          loading={enCurso === 'google'}
          disabled={!!enCurso}
          onClick={() => intentar('google', signInWithGoogle)}
        >
          {p10.google}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          loading={enCurso === 'apple'}
          disabled={!!enCurso}
          onClick={() => intentar('apple', signInWithApple)}
        >
          {p10.apple}
        </Button>

        {!conCorreo && (
          <Button
            variant="ghost"
            size="md"
            fullWidth
            disabled={!!enCurso}
            onClick={() => setConCorreo(true)}
          >
            {p10.email}
          </Button>
        )}
      </div>

      {conCorreo && (
        <div className="mt-6 animate-fade-up motion-reduce:animate-none">
          <label htmlFor="pin-cuenta-correo" className="block text-base text-ink/80">
            {p10.emailLabel}
          </label>
          <input
            id="pin-cuenta-correo"
            type="email"
            value={correo}
            autoComplete="email"
            autoCapitalize="none"
            enterKeyHint="next"
            onChange={event => setCorreo(event.target.value)}
            className={campoClase}
          />

          <label htmlFor="pin-cuenta-clave" className="mt-6 block text-base text-ink/80">
            {p10.passwordLabel}
          </label>
          <input
            id="pin-cuenta-clave"
            type="password"
            value={contrasena}
            autoComplete="new-password"
            enterKeyHint="done"
            aria-describedby="pin-cuenta-pista"
            onChange={event => setContrasena(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && correoValido) {
                intentar('correo', () => createAccountWithEmail(correo.trim(), contrasena))
              }
            }}
            className={campoClase}
          />
          <p id="pin-cuenta-pista" className="mt-2 text-sm text-ink/80">
            {p10.passwordHint}
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
            {p10.create}
          </Button>
        </div>
      )}

      <p className="mt-4 text-sm text-ink/80" aria-live="polite">{aviso ?? ''}</p>
    </div>
  )
}

const campoClase = [
  'mt-3 w-full min-h-touch',
  'rounded-md bg-surface border border-border',
  'px-4 py-4 text-base text-ink',
  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
  'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
].join(' ')
