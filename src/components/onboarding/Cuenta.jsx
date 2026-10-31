// src/components/onboarding/Cuenta.jsx
// P7 — la cuenta, que respalda y no es la puerta.
//
// **"Ahora no" está a la vista, no escondido.** Sin cuenta funciona todo, y la
// frase que lo dice va al lado del enlace y no en una nota al pie: lo que
// asegura que este paso no bloquee es que se vea que no bloquea.
//
// Dos tropiezos tienen nombre propio, porque cada uno tiene una salida concreta
// que ofrecer: el correo ya registrado —probar con la contraseña de siempre— y,
// con Google o Apple, el correo que ya tiene cuenta con otra forma de entrar
// (SPEC_21.2, DP-21.2.7). Lo demás se cuenta con la frase amable de siempre,
// **sin un código a la vista** (RN-EST-04). Nada de esta pantalla vibra.
//
// **Quien ya tiene cuenta tiene por dónde decirlo** (SPEC_30, D30-4): «Ya
// tengo una cuenta» abre la vista de entrar, que avisa antes de entrar de que
// sigue lo guardado en la cuenta. Crear con un correo que ya existe sigue
// entrando sin decirlo (D30-9).
//
// Ningún control lleva `disabled` ni `required`: los campos vacíos no frenan
// nada, y lo que salga se cuenta en palabras.

import { useState } from 'react'
import Button from '@components/ui/Button'
import BotonProveedor from '@components/shared/BotonProveedor'
import { CampoLinea } from '@components/shared/Campo'
import { ENLACE } from '@components/shared/FormularioEntrar'
import { copy } from '@copy'
import { MOTIVOS, proveedoresDisponibles } from '@lib/cuenta'

export default function Cuenta({
  textos,
  enlace,
  motivo,
  listo,
  onProveedor,
  onCrear,
  onEntrar,
  onSaltar,
}) {
  const [conCorreo, setConCorreo] = useState(false)
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')

  // Cerrar la hoja de Google o de Apple no es un error: no se dice nada.
  const AVISOS = {
    [MOTIVOS.correoEnUso]: textos.emailExists,
    [MOTIVOS.otroMetodo]: copy.cuenta.error.otroMetodo,
    [MOTIVOS.rechazado]: null,
  }
  const aviso = motivo ? (AVISOS[motivo] ?? null) : null
  const generico = motivo && !(motivo in AVISOS) ? copy.errors.generic.body : null

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.question}</h1>
        <p className="text-base text-on-surface-soft leading-relaxed">{textos.hint}</p>
      </div>

      {listo ? (
        <p className="text-base text-on-surface">{textos.ready}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Los proveedores que hay aquí: en web, solo Google (DP-21.2.2); en
              la app de iPhone, Apple y luego Google (SPEC_21.2, DP-21.2.4). */}
          {proveedoresDisponibles().map((proveedor) => (
            <BotonProveedor
              key={proveedor}
              proveedor={proveedor}
              texto={textos[proveedor]}
              onClick={() => onProveedor(proveedor)}
            />
          ))}

          {conCorreo ? (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-on-surface-soft">{textos.emailLabel}</span>
                <CampoLinea
                  type="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(evento) => setCorreo(evento.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-on-surface-soft">{textos.passwordLabel}</span>
                <CampoLinea
                  type="password"
                  autoComplete="new-password"
                  value={contrasena}
                  onChange={(evento) => setContrasena(evento.target.value)}
                />
                <span className="text-sm text-on-surface-faint">{textos.passwordHint}</span>
              </label>

              <Button variant="surface" onClick={() => onCrear(correo, contrasena)}>
                {textos.create}
              </Button>
            </div>
          ) : (
            <Button variant="surface" fullWidth onClick={() => setConCorreo(true)}>
              {textos.email}
            </Button>
          )}

          <button type="button" className={ENLACE} onClick={onEntrar}>
            {enlace}
          </button>
        </div>
      )}

      {aviso && <p className="text-base text-on-surface">{aviso}</p>}
      {generico && <p className="text-base text-on-surface">{generico}</p>}

      {/* Con la cuenta creada ya no hay nada que saltarse: el contenedor pone
          "Continuar" en su lugar. La nota de que sin cuenta funciona todo se
          va con el enlace, porque solo tiene sentido junto a él. */}
      {!listo && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSaltar}
            className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {textos.skip}
          </button>
          <p className="text-sm text-on-surface-soft">{textos.skipNote}</p>
        </div>
      )}
    </section>
  )
}
