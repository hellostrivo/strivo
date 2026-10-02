// src/components/perfil/TuCuenta.jsx
// El bloque Tu cuenta: el estado de la sesión y lo que se puede hacer con él
// (SPEC_19.1 §4.8).
//
// **Cuatro vistas dentro del bloque, sin rutas nuevas**: el estado con sus
// acciones, el formulario de entrar o crear, el de recuperar el acceso y la
// confirmación de salir. Son vistas y no pantallas para no tocar el router, y
// porque ninguna es un sitio al que se vuelva: se entra, se hace y se regresa
// al estado.
//
// Lo que decide cada cosa no vive aquí: la sesión —entrar, crear, salir— es
// del contexto (`useSesion`), que es quien puede cambiar el uid; recuperar la
// contraseña no cambia nada de la sesión y se pide directamente a `lib/cuenta`.
// Este componente pinta y traduce motivos a frases.
//
// **Nada bloquea.** Ningún control lleva `disabled`, `required` ni
// `aria-invalid`: un formulario vacío se puede enviar, y lo que salga se dice
// en palabras, junto al campo y anunciado por `aria-describedby`. Un segundo
// toque mientras el primero está en camino no hace nada, en vez de apagar el
// botón. Un error lleva el foco al primer campo y **conserva lo escrito**.
//
// Sin cuenta no hay nada que esté mal: el estado lo dice como un hecho y
// ofrece crearla. Con la sesión vencida, lo escrito sigue aquí y se dice; lo
// que se ofrece es volver a entrar.

import { useEffect, useId, useRef, useState } from 'react'
import Button from '@components/ui/Button'
import { CampoLinea } from '@components/shared/Campo'
import Confirmacion from '@components/shared/Confirmacion'
import { copy, interpolate } from '@copy'
import { MOTIVOS, PROVEEDORES_WEB, recuperarContrasena } from '@lib/cuenta'
import { SALIDA } from '@lib/salidaCuenta'
import { ESTADOS_SESION } from '@lib/sesion'
import { useSesion } from '@lib/useSesion'

const textos = copy.cuenta

// P7 ya dice "Continuar con Google" y "Crear cuenta": se leen de allí.
const P7 = copy.diario.onboarding.p7

const VISTAS = Object.freeze({
  estado: 'estado',
  entrar: 'entrar',
  crear: 'crear',
  recuperar: 'recuperar',
})

/** Qué frase toca para cada motivo. `null` es no decir nada: cerrar la ventana de Google no es un error. */
function errorDe(motivo) {
  if (motivo === MOTIVOS.rechazado) return null
  if (motivo === MOTIVOS.credenciales || motivo === MOTIVOS.correoEnUso) return 'credenciales'
  if (motivo === MOTIVOS.sinConexion) return 'sinConexion'
  return 'generico'
}

const ENLACE =
  'self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'

export default function TuCuenta() {
  const sesion = useSesion()
  const [vista, setVista] = useState(VISTAS.estado)
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [salida, setSalida] = useState(null)

  const ocupado = useRef(false)
  const campoCorreo = useRef(null)
  const idError = useId()

  // Un error lleva el foco al primer campo, que es el que lo explica.
  useEffect(() => {
    if (error) campoCorreo.current?.focus()
  }, [error])

  const ir = (destino) => {
    setVista(destino)
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
      ir(VISTAS.estado)
      return
    }
    setError(errorDe(resultado.motivo))
  }

  const enviarFormulario = (evento) => {
    evento.preventDefault()
    unaVez(async () => {
      setError(null)
      const accion = vista === VISTAS.crear ? sesion.crear : sesion.entrar
      tras(await accion(correo, contrasena))
    })
  }

  const conProveedor = () =>
    unaVez(async () => {
      setError(null)
      tras(await sesion.entrarConGoogle())
    })

  const enviarRecuperacion = (evento) => {
    evento.preventDefault()
    unaVez(async () => {
      setError(null)
      const r = await recuperarContrasena(correo)
      if (r.ok) setEnviado(true)
      else setError(errorDe(r.motivo))
    })
  }

  const pedirSalida = () =>
    unaVez(async () => {
      setSalida(await sesion.comprobarSalida())
    })

  const confirmarSalida = () =>
    unaVez(async () => {
      const r = await sesion.salir()
      if (!r.ok) setSalida(SALIDA.pendiente)
    })

  const mensajeDeError = error && (
    <p id={idError} className="text-base text-on-surface" aria-live="polite">
      {textos.error[error]}
    </p>
  )
  const descrito = error ? idError : undefined

  // ─── Formulario de entrar o crear ──────────────────────────────────────
  if (vista === VISTAS.entrar || vista === VISTAS.crear) {
    const creando = vista === VISTAS.crear
    return (
      <form className="flex flex-col gap-4" onSubmit={enviarFormulario} noValidate>
        <h3 className="font-display text-base text-on-surface">
          {creando ? textos.formulario.tituloCrear : textos.formulario.tituloEntrar}
        </h3>

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
          {creando ? P7.create : textos.formulario.entrar}
        </Button>

        {PROVEEDORES_WEB.map((proveedor) => (
          <Button key={proveedor} type="button" variant="surface" fullWidth onClick={conProveedor}>
            {P7[proveedor]}
          </Button>
        ))}

        {!creando && (
          <button type="button" className={ENLACE} onClick={() => ir(VISTAS.recuperar)}>
            {textos.formulario.olvide}
          </button>
        )}
        <button type="button" className={ENLACE} onClick={() => ir(VISTAS.estado)}>
          {textos.formulario.volver}
        </button>
      </form>
    )
  }

  // ─── Recuperar el acceso ───────────────────────────────────────────────
  if (vista === VISTAS.recuperar) {
    return (
      <form className="flex flex-col gap-4" onSubmit={enviarRecuperacion} noValidate>
        <h3 className="font-display text-base text-on-surface">{textos.recuperar.titulo}</h3>
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
        <button type="button" className={ENLACE} onClick={() => ir(VISTAS.entrar)}>
          {textos.formulario.volver}
        </button>
      </form>
    )
  }

  // ─── El estado y sus acciones ──────────────────────────────────────────
  const { estado } = sesion
  const frase =
    estado === ESTADOS_SESION.conCuenta
      ? interpolate(textos.estado.conCuenta, { correo: sesion.correo ?? '' })
      : textos.estado[estado]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-on-surface leading-relaxed" aria-live="polite">
        {frase}
      </p>

      {(estado === ESTADOS_SESION.sinCuenta || estado === ESTADOS_SESION.vencida) && (
        <div className="flex flex-col gap-3">
          <Button type="button" variant="surface" fullWidth onClick={() => ir(VISTAS.entrar)}>
            {textos.acciones.entrar}
          </Button>
          {estado === ESTADOS_SESION.sinCuenta && (
            <Button type="button" variant="surface" fullWidth onClick={() => ir(VISTAS.crear)}>
              {textos.acciones.crear}
            </Button>
          )}
        </div>
      )}

      {estado === ESTADOS_SESION.conCuenta && (
        <div>
          <Button type="button" size="sm" variant="surface" onClick={pedirSalida}>
            {textos.acciones.salir}
          </Button>
        </div>
      )}

      {/* Con cosas sin subir, la confirmación explica por qué no y solo
          ofrece quedarse: borrar ahí sería perder lo escrito (DP-19.1). */}
      <Confirmacion
        abierta={salida !== null}
        titulo={textos.salir.titulo}
        texto={salida === SALIDA.pendiente ? textos.salir.pendiente : textos.salir.texto}
        cancelar={{ texto: textos.salir.cancelar, onClick: () => setSalida(null) }}
        confirmar={
          salida === SALIDA.libre
            ? { texto: textos.salir.confirmar, onClick: confirmarSalida }
            : null
        }
      />
    </div>
  )
}
