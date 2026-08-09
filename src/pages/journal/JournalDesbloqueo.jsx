// src/pages/journal/JournalDesbloqueo.jsx
// La puerta del Journal (bloque 07, §07.D.4 y §07.D.5).
// Copy: copy.journal.proteccion.desbloqueo y .recuperar
//
// Esta pantalla se dibuja ENTERA en lugar del journal. No renderiza ni la lista
// ni el editor ni una fecha: JournalPage decide antes de montar nada, así que
// no hay un fotograma en el que se vea lo que hay dentro (§07.D.4).
//
// Sin candados, sin "acceso denegado", sin contador de intentos y sin espera
// tras fallar. Un PIN que no es se dice en una línea y se puede volver a
// intentar las veces que haga falta.
//
// Tres momentos, en este orden: escribir el PIN, volver a entrar con la cuenta
// si se olvidó, y elegir uno nuevo. Del segundo al tercero solo se pasa con la
// reautenticación de Firebase completada en ese momento.

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import {
  metodoDeRecuperacion,
  enviarEnlaceDeRestablecimiento,
  reautenticar,
} from '@lib/auth'
import { desbloquearCon, pinCompleto, restablecerPin } from '@lib/journalPin'
import { superficieJournal } from '@tokens'
import Button from '@components/ui/Button'
import CampoPin from '@components/journal/CampoPin'

const c = copy.journal.proteccion

export default function JournalDesbloqueo({ onDesbloqueado }) {
  const [vista, setVista] = useState('pin')   // 'pin' | 'recuperar' | 'nuevo'

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      {vista === 'pin' && (
        <Entrada
          onEntrar={onDesbloqueado}
          onOlvide={() => setVista('recuperar')}
        />
      )}

      {vista === 'recuperar' && (
        <Recuperar
          onVolver={() => setVista('pin')}
          onIdentificado={() => setVista('nuevo')}
        />
      )}

      {vista === 'nuevo' && <PinNuevo onListo={onDesbloqueado} />}
    </div>
  )
}

// ─── 1 · Escribir el PIN ─────────────────────────────────────────────────────
function Entrada({ onEntrar, onOlvide }) {
  const headingRef = useRef(null)
  const [pin, setPin]         = useState('')
  const [fallo, setFallo]     = useState(false)
  const [enCurso, setEnCurso] = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  const intentar = async () => {
    if (!pinCompleto(pin) || enCurso) return
    setEnCurso(true)
    setFallo(false)
    const acierta = await desbloquearCon(pin).catch(() => false)
    setEnCurso(false)
    if (acierta) {
      onEntrar()
      return
    }
    // Se vacía el campo y se dice en una línea. Nada más: ni cuántas van, ni
    // cuántas quedan, ni una espera antes del siguiente intento.
    setFallo(true)
    setPin('')
  }

  return (
    <>
      {/* La misma tarjeta tintada con la que el bloque 06 abre la escritura.
          Es la puerta del journal y se ve como el journal: no es una pantalla
          de acceso de otra app que se hubiera colado aquí. */}
      <div
        data-surface="light"
        className="rounded-lg px-5 py-4 animate-fade-up motion-reduce:animate-none"
        style={{ backgroundColor: superficieJournal.escritura }}
      >
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-md text-ink focus:outline-none"
        >
          {c.desbloqueo.titulo}
        </h1>
        {/* ink/80 y no ink/70: el mismo criterio de contraste que las demás
            tarjetas del Journal (ver tests/contraste.test.js) */}
        <p id="desbloqueo-ayuda" className="mt-1 text-sm text-ink/80">
          {c.desbloqueo.ayuda}
        </p>
      </div>

      <div className="mt-8">
        <CampoPin
          id="desbloqueo-pin"
          label={c.desbloqueo.campo}
          value={pin}
          autoFocus
          describedBy="desbloqueo-ayuda"
          onChange={valor => { setPin(valor); setFallo(false) }}
          onEnter={intentar}
        />
      </div>

      <p className="mt-3 text-sm text-ink/80 min-h-5" aria-live="polite">
        {fallo ? c.desbloqueo.incorrecto : ''}
      </p>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-5"
        loading={enCurso}
        disabled={!pinCompleto(pin)}
        onClick={intentar}
      >
        {c.desbloqueo.entrar}
      </Button>

      {/* Discreto a propósito: es la salida de emergencia, no el camino. */}
      <div className="mt-8 flex justify-center">
        <Button variant="ghost" size="sm" onClick={onOlvide}>
          {c.desbloqueo.olvide}
        </Button>
      </div>
    </>
  )
}

// ─── 2 · Volver a entrar con la cuenta ───────────────────────────────────────
// No basta con que haya sesión guardada: se completa el flujo del proveedor
// ahora. Si bastara, cualquiera con el teléfono en la mano se saltaría el PIN.
function Recuperar({ onVolver, onIdentificado }) {
  const headingRef = useRef(null)
  const [metodo, setMetodo]         = useState(undefined)  // undefined = leyendo
  const [contrasena, setContrasena] = useState('')
  const [enCurso, setEnCurso]       = useState(null)       // 'entrar' | 'enlace'
  const [aviso, setAviso]           = useState(null)

  useEffect(() => { headingRef.current?.focus() }, [])

  useEffect(() => {
    let vigente = true
    metodoDeRecuperacion()
      .then(via => { if (vigente) setMetodo(via) })
      .catch(() => { if (vigente) setMetodo(null) })
    return () => { vigente = false }
  }, [])

  const entrar = async () => {
    if (enCurso) return
    setEnCurso('entrar')
    setAviso(null)
    const resultado = await reautenticar(metodo, { contrasena })
    setEnCurso(null)

    if (resultado.ok) {
      // Identificada la persona, se pasa a elegir PIN nuevo. La contraseña se
      // suelta aquí: no viaja al paso siguiente ni se queda en ningún estado.
      setContrasena('')
      onIdentificado()
      return
    }
    // Cerrar la ventana del proveedor es una decisión, no un fallo
    if (resultado.motivo === 'cancelado') return
    setAviso({
      credenciales: c.recuperar.credenciales,
      otraCuenta:   c.recuperar.otraCuenta,
    }[resultado.motivo] ?? c.recuperar.error)
  }

  const enviarEnlace = async () => {
    if (enCurso) return
    setEnCurso('enlace')
    setAviso(null)
    const resultado = await enviarEnlaceDeRestablecimiento(metodo.correo)
    setEnCurso(null)
    setAviso(resultado.ok ? c.recuperar.enviado : c.recuperar.errorEnvio)
  }

  const porCorreo = metodo?.via === 'correo'

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl text-ink focus:outline-none"
      >
        {c.recuperar.titulo}
      </h1>
      <p className="mt-2 text-base text-ink/80">{c.recuperar.ayuda}</p>

      {metodo && (
        <>
          {metodo.correo && (
            <p className="mt-6 text-base text-ink">
              {interpolate(c.recuperar.cuentaTemplate, { correo: metodo.correo })}
            </p>
          )}

          {porCorreo ? (
            <>
              <label htmlFor="recuperar-contrasena" className="mt-6 block text-base text-ink/80">
                {c.recuperar.contrasena}
              </label>
              <input
                id="recuperar-contrasena"
                type="password"
                value={contrasena}
                autoComplete="current-password"
                enterKeyHint="done"
                onChange={event => setContrasena(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter') entrar() }}
                className={[
                  'mt-3 w-full min-h-touch',
                  'rounded-md bg-surface border border-border',
                  'px-4 py-4 text-md text-ink',
                  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                  'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
                ].join(' ')}
              />

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-6"
                loading={enCurso === 'entrar'}
                disabled={!contrasena || !!enCurso}
                onClick={entrar}
              >
                {c.recuperar.continuar}
              </Button>

              {/* Para quien también olvidó la contraseña: el enlace de
                  restablecimiento que manda Firebase a su correo. Por ahí no
                  viaja el PIN, ni su huella, ni su sal. */}
              <Button
                variant="ghost"
                size="md"
                fullWidth
                className="mt-2"
                loading={enCurso === 'enlace'}
                disabled={!!enCurso}
                onClick={enviarEnlace}
              >
                {c.recuperar.enviarEnlace}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-6"
              loading={enCurso === 'entrar'}
              disabled={!!enCurso}
              onClick={entrar}
            >
              {metodo.via === 'google' ? c.recuperar.google : c.recuperar.apple}
            </Button>
          )}
        </>
      )}

      {/* metodo === null: no hay cuenta con la que volver a entrar. Sin cuenta
          no se ofrece poner PIN, así que aquí no se llega por el camino normal;
          si alguien cambió de cuenta entre medias, se dice con calma en vez de
          dejar la pantalla muda. */}
      {metodo === null && (
        <p className="mt-6 text-base text-ink/80">{c.sinCuenta}</p>
      )}

      <p className="mt-4 text-sm text-ink/80" aria-live="polite">{aviso ?? ''}</p>

      <div className="mt-8 flex justify-center">
        <Button variant="ghost" size="sm" onClick={onVolver}>
          {c.recuperar.volver}
        </Button>
      </div>
    </>
  )
}

// ─── 3 · Elegir un PIN nuevo ─────────────────────────────────────────────────
// El hash anterior queda invalidado: `restablecerPin` sobrescribe la fila
// entera, con sal e iteraciones nuevas. Las entradas del journal no se tocan en
// ningún punto de este camino.
function PinNuevo({ onListo }) {
  const headingRef = useRef(null)
  const [nuevo, setNuevo]         = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [aviso, setAviso]         = useState(null)
  const [enCurso, setEnCurso]     = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  const completo = pinCompleto(nuevo) && pinCompleto(confirmar)

  const guardar = async () => {
    if (!completo || enCurso) return
    if (nuevo !== confirmar) {
      setAviso(c.crear.noCoinciden)
      setNuevo('')
      setConfirmar('')
      return
    }
    setEnCurso(true)
    const guardado = await restablecerPin(nuevo).catch(() => false)
    setEnCurso(false)
    if (guardado) onListo()
    else setAviso(c.recuperar.error)
  }

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl text-ink focus:outline-none"
      >
        {c.recuperar.nuevoTitulo}
      </h1>
      <p id="nuevo-pin-ayuda" className="mt-2 text-base text-ink/80">
        {c.crear.ayuda}
      </p>

      <div className="mt-8 flex flex-col gap-5">
        <CampoPin
          id="nuevo-pin"
          label={c.crear.campo}
          value={nuevo}
          autoFocus
          describedBy="nuevo-pin-ayuda"
          onChange={valor => { setNuevo(valor); setAviso(null) }}
        />
        <CampoPin
          id="nuevo-pin-confirmar"
          label={c.crear.confirmar}
          value={confirmar}
          onChange={valor => { setConfirmar(valor); setAviso(null) }}
          onEnter={guardar}
        />
      </div>

      <p className="mt-3 text-sm text-ink/80 min-h-5" aria-live="polite">
        {aviso ?? ''}
      </p>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-5"
        loading={enCurso}
        disabled={!completo}
        onClick={guardar}
      >
        {c.crear.guardar}
      </Button>
    </>
  )
}
