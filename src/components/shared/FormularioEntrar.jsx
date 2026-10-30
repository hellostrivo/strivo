// src/components/shared/FormularioEntrar.jsx
// Entrar o crear una cuenta con correo, y recuperar el acceso (SPEC_30, D30-8).
//
// **Salió de Tu cuenta cuando el onboarding pasó a necesitarlo**: la vista de
// entrar de P1 y P7 pide exactamente este formulario, y dos copias del mismo se
// separan en cuanto alguien edita una. Es el mismo criterio con el que subieron
// `Campo.jsx`, `Chips.jsx` y la píldora.
//
// **Todo llega por props** (RN-TEC-05): los textos, los proveedores, qué hacer
// al enviar y cómo se traduce un motivo a frase. Aquí no se lee la sesión, ni
// `lib/cuenta`, ni el copy: este componente pinta, guarda lo tecleado y dice lo
// que salió.
//
// **Nada bloquea.** Ningún control lleva `disabled`, `required` ni
// `aria-invalid`: un formulario vacío se puede enviar, y lo que salga se dice
// en palabras, junto al campo y anunciado por `aria-describedby`. Un segundo
// toque mientras el primero está en camino no hace nada, en vez de apagar el
// botón. Un error lleva el foco al primer campo y **conserva lo escrito**.

import { useEffect, useId, useRef, useState } from 'react'
import Button from '@components/ui/Button'
import { CampoLinea } from '@components/shared/Campo'

const SUBVISTAS = Object.freeze({ formulario: 'formulario', recuperar: 'recuperar' })

export const ENLACE =
  'self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'

/**
 * @param {object} props
 * @param {'entrar'|'crear'} [props.modo]
 * @param {{formulario: object, recuperar: object, error: object}} props.textos - `copy.cuenta`.
 * @param {{crear: string, proveedores: object}} props.botones - los de P7, que no se duplican.
 * @param {string[]} [props.proveedores]
 * @param {boolean} [props.conTitulo] - sin él, el título lo pone quien lo monta.
 * @param {'h2'|'h3'} [props.nivel] - el nivel de los títulos de aquí dentro.
 * @param {(motivo: string) => ?string} props.errorDe - motivo → clave de `textos.error`.
 * @param {(correo: string, contrasena: string) => Promise<{ok: boolean, motivo?: string}>} props.onEnviar
 * @param {(proveedor: string) => Promise<{ok: boolean, motivo?: string}>} [props.onProveedor]
 * @param {(correo: string) => Promise<{ok: boolean, motivo?: string}>} [props.onRecuperar]
 * @param {(resultado: object) => void} [props.onHecho] - tras enviar o entrar con un proveedor, si salió.
 * @param {() => void} props.onVolver
 */
export default function FormularioEntrar({
  modo = 'entrar',
  textos,
  botones,
  proveedores = [],
  conTitulo = true,
  nivel = 'h3',
  errorDe,
  onEnviar,
  onProveedor,
  onRecuperar,
  onHecho,
  onVolver,
}) {
  const [subvista, setSubvista] = useState(SUBVISTAS.formulario)
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [enviado, setEnviado] = useState(false)

  const ocupado = useRef(false)
  const campoCorreo = useRef(null)
  const idError = useId()
  const Titulo = nivel
  const creando = modo === 'crear'

  // Un error lleva el foco al primer campo, que es el que lo explica.
  useEffect(() => {
    if (error) campoCorreo.current?.focus()
  }, [error])

  const ir = (destino) => {
    setSubvista(destino)
    setError(null)
    setEnviado(false)
    setContrasena('')
  }

  /** Un toque a la vez: el segundo, mientras el primero está en camino, no hace nada. */
  const unaVez = async (trabajo) => {
    if (ocupado.current) return
    ocupado.current = true
    try {
      await trabajo()
    } finally {
      ocupado.current = false
    }
  }

  const tras = (resultado) => {
    if (resultado.ok) {
      onHecho?.(resultado)
      return
    }
    setError(errorDe(resultado.motivo))
  }

  const enviarFormulario = (evento) => {
    evento.preventDefault()
    unaVez(async () => {
      setError(null)
      tras(await onEnviar(correo, contrasena))
    })
  }

  const conProveedor = (proveedor) =>
    unaVez(async () => {
      setError(null)
      tras(await onProveedor(proveedor))
    })

  const enviarRecuperacion = (evento) => {
    evento.preventDefault()
    unaVez(async () => {
      setError(null)
      const r = await onRecuperar(correo)
      if (r.ok) setEnviado(true)
      else setError(errorDe(r.motivo))
    })
  }

  const mensajeDeError = error && (
    <p id={idError} className="text-base text-on-surface" aria-live="polite">
      {textos.error[error]}
    </p>
  )
  const descrito = error ? idError : undefined

  // ─── Recuperar el acceso ───────────────────────────────────────────────
  if (subvista === SUBVISTAS.recuperar) {
    return (
      <form className="flex flex-col gap-4" onSubmit={enviarRecuperacion} noValidate>
        <Titulo className="font-display text-base text-on-surface">
          {textos.recuperar.titulo}
        </Titulo>
        <p className="text-sm text-on-surface-soft leading-relaxed">{textos.recuperar.texto}</p>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-on-surface-soft">{textos.formulario.correo}</span>
          <CampoLinea
            ref={campoCorreo}
            type="email"
            autoComplete="email"
            value={correo}
            aria-describedby={descrito}
            onChange={(evento) => setCorreo(evento.target.value)}
          />
        </label>

        {mensajeDeError}
        <div aria-live="polite">
          {enviado && <p className="text-base text-on-surface">{textos.recuperar.enviado}</p>}
        </div>

        <Button type="submit" variant="surface" fullWidth>
          {textos.recuperar.boton}
        </Button>
        <button type="button" className={ENLACE} onClick={() => ir(SUBVISTAS.formulario)}>
          {textos.formulario.volver}
        </button>
      </form>
    )
  }

  // ─── Entrar o crear ────────────────────────────────────────────────────
  return (
    <form className="flex flex-col gap-4" onSubmit={enviarFormulario} noValidate>
      {conTitulo && (
        <Titulo className="font-display text-base text-on-surface">
          {creando ? textos.formulario.tituloCrear : textos.formulario.tituloEntrar}
        </Titulo>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm text-on-surface-soft">{textos.formulario.correo}</span>
        <CampoLinea
          ref={campoCorreo}
          type="email"
          autoComplete="email"
          value={correo}
          aria-describedby={descrito}
          onChange={(evento) => setCorreo(evento.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-on-surface-soft">{textos.formulario.contrasena}</span>
        <CampoLinea
          type="password"
          autoComplete={creando ? 'new-password' : 'current-password'}
          value={contrasena}
          aria-describedby={descrito}
          onChange={(evento) => setContrasena(evento.target.value)}
        />
      </label>

      {mensajeDeError}

      <Button type="submit" variant="surface" fullWidth>
        {creando ? botones.crear : textos.formulario.entrar}
      </Button>

      {proveedores.map((proveedor) => (
        <Button
          key={proveedor}
          type="button"
          variant="surface"
          fullWidth
          onClick={() => conProveedor(proveedor)}
        >
          {botones.proveedores[proveedor]}
        </Button>
      ))}

      {!creando && onRecuperar && (
        <button type="button" className={ENLACE} onClick={() => ir(SUBVISTAS.recuperar)}>
          {textos.formulario.olvide}
        </button>
      )}
      <button type="button" className={ENLACE} onClick={onVolver}>
        {textos.formulario.volver}
      </button>
    </form>
  )
}
