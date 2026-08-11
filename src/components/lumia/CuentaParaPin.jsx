// src/components/lumia/CuentaParaPin.jsx
// Vincular un correo o un teléfono para poder tener PIN (§5.8.2).
//
// **RN-JR-PIN-02 / RN-SEC-PIN-01** — Nunca puede existir un PIN activo sobre
// una cuenta sin método de recuperación. Quien creó su cuenta sin correo ni
// teléfono no puede fijar un PIN, porque no existiría ninguna vía de vuelta y
// quedaría bloqueado fuera de su propio journal de forma permanente.
//
// Por eso esta pantalla no es un aviso de error, es la salida: explica qué
// falta y lo resuelve en el mismo sitio, sin mandar a nadie a buscar un ajuste.

import { useState } from 'react'
import Button from '@components/ui/Button'
import { CampoLinea } from './Campo'
import { copy } from '@copy'

const textos = copy.lumia.journal.pin.cuenta

export default function CuentaParaPin({ onVincular }) {
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [listo, setListo] = useState(false)

  const hayAlgo = email.trim() !== '' || telefono.trim() !== ''

  const guardar = async () => {
    const metodo = await onVincular({ email, phone: telefono })
    if (metodo) setListo(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-md text-on-surface">{textos.titulo}</h3>
        <p className="text-base text-on-surface-soft">{textos.lead}</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-on-surface-soft">{textos.email.label}</span>
          <CampoLinea
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder={textos.email.placeholder}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-on-surface-soft">{textos.telefono.label}</span>
          <CampoLinea
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={telefono}
            onChange={(evento) => setTelefono(evento.target.value)}
            placeholder={textos.telefono.placeholder}
          />
        </label>
      </div>

      {listo && (
        <p className="text-sm text-on-surface-soft" role="status">
          {textos.listo}
        </p>
      )}

      <div>
        <Button size="sm" variant="surface" onClick={guardar} disabled={!hayAlgo}>
          {textos.guardar}
        </Button>
      </div>
    </div>
  )
}
