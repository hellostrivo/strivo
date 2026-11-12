// src/components/diario/BloqueoPin.jsx
// La superficie del PIN del Journal (§5.8.2): desbloqueo, recuperación y alta.
//
// **Bloqueo de acceso, no protección del contenido.** Es la limitación más
// importante de la funcionalidad y el copy la dice en voz alta: el PIN impide
// entrar al módulo desde la interfaz y nada más. Ninguna cadena de este flujo
// promete inviolabilidad, y una prueba automática recorre el namespace entero
// para que siga siendo verdad (§7.8).
//
// RN-JR-PIN-01 — Quien monta este componente en modo desbloqueo **no ha montado
// el Journal todavía**. Aquí no llega ni una entrada: no hay lista difuminada,
// ni títulos, ni conteo, ni previsualización bajo un velo.
//
// Sin límite de intentos ni bloqueo temporal (§5.8.2): no hay nada protegido
// criptográficamente que un límite mejore, y castigar a quien se equivoca
// escribiendo en su propio journal no tiene ningún sentido.
//
// **Con una cuenta de correo, verificarse es escribir su contraseña**
// (SPEC_19.2, DP-19.6). El campo no está de antemano: aparece cuando la
// verificación dice que hace falta (`pide-contrasena`), recibe el foco y el
// mismo botón vuelve a intentar con lo escrito. **La contraseña vive solo en el
// estado de este componente**: no va a ningún almacén, ni a la cola, ni a un
// registro, y se olvida al salir del paso.
//
// **Face ID y Touch ID** (SPEC_23A), solo en la app de iPhone: otra forma de
// abrir la misma puerta. En `desbloqueo`, si está activo, iOS pide la cara sola
// al montar —una vez por montaje, y solo con la app a la vista—; cancelar deja
// esta pantalla tal cual, sin mensaje, y «Abrir con Face ID» lo vuelve a
// intentar. En `ajustes`, el interruptor solo existe con PIN activo y con la
// biometría disponible para Strivo; en la web no existe nunca.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import CuentaParaPin from './CuentaParaPin'
import Button from '@components/ui/Button'
import { CampoLinea } from '@components/shared/Campo'
import { copy, interpolate } from '@copy'
import { MAX_DIGITOS, MIN_DIGITOS, esPinValido, soloDigitos } from '@/diario/pin'

const textos = copy.diario.journal.pin

/** «Face ID» o «Touch ID», según lo que diga el teléfono. */
function conNombre(plantilla, tipo) {
  const { nombres } = textos.biometria
  return interpolate(plantilla, { biometria: nombres[tipo] ?? nombres.faceId })
}

/**
 * El interruptor de Face ID: el estado se ve por la posición y el relleno, no
 * solo por el color, y el lector de pantalla lo dice con `aria-checked`. Es la
 * misma forma que el de los recordatorios de Tu perfil.
 */
function Interruptor({ encendido, etiqueta, onCambiar }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      onClick={onCambiar}
      className={clsx(
        'flex min-h-touch-sm w-full items-center justify-between gap-4 text-left',
        'rounded-md text-base text-on-surface',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
      )}
    >
      <span>{etiqueta}</span>
      <span
        aria-hidden="true"
        className={clsx(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-on-surface transicion-tema',
          encendido ? 'bg-current' : 'bg-transparent',
        )}
      >
        <span
          className={clsx(
            'absolute h-5 w-5 rounded-full transicion-tema',
            encendido ? 'right-0.5 bg-raised' : 'left-0.5 bg-current',
          )}
        />
      </span>
    </button>
  )
}

/** El teclado es numérico y no revela los dígitos introducidos (§5.8.2). */
function CampoPin({ value, onChange, etiqueta, id }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-on-surface-soft">
        {etiqueta}
      </label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={MAX_DIGITOS}
        value={value}
        onChange={(evento) => onChange(soloDigitos(evento.target.value))}
        className={clsx(
          'w-full max-w-[12rem] rounded-md border border-on-surface bg-strivo-campo',
          'px-4 py-3 min-h-touch-sm text-md tracking-[0.4em] text-on-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
        )}
      />
    </div>
  )
}

function Nota({ children, id }) {
  return (
    <p id={id} className="text-sm text-on-surface-soft" role="status">
      {children}
    </p>
  )
}

/**
 * @param {'desbloqueo'|'ajustes'} modo
 * @param {object} pin - Lo que devuelve `usePin`: `{ estado, acciones }`.
 */
export default function BloqueoPin({ modo, estado, acciones, onCerrar }) {
  const [paso, setPaso] = useState(modo === 'desbloqueo' ? 'abrir' : 'inicio')
  const [codigo, setCodigo] = useState('')
  const [repetido, setRepetido] = useState('')
  const [nota, setNota] = useState(null)
  // Solo con cuenta de correo, y solo después de que la verificación lo pida.
  const [pideContrasena, setPideContrasena] = useState(false)
  const [contrasena, setContrasena] = useState('')
  const campoContrasena = useRef(null)

  const limpiar = (siguiente) => {
    setCodigo('')
    setRepetido('')
    setNota(null)
    setContrasena('')
    setPideContrasena(false)
    setPaso(siguiente)
  }

  // Al aparecer, el foco va al campo: es lo único que queda por hacer.
  useEffect(() => {
    if (pideContrasena) campoContrasena.current?.focus()
  }, [pideContrasena])

  const biometria = estado.biometria ?? { estado: 'apagada', disponible: false, tipo: null }
  const conCara = biometria.estado === 'activa'

  /** SPEC_23A — Pide la cara. Cancelar no dice nada; `cambiada` sí. */
  const abrirConCara = async () => {
    const resultado = await acciones.abrirConBiometria?.(textos.biometria.motivo)
    if (resultado?.motivo === 'cambiada') {
      setNota(conNombre(textos.biometria.cambiada, biometria.tipo))
    }
  }

  // SPEC_23A (DP-23.11) — Al montar la pantalla del PIN con Face ID activo,
  // iOS pide la cara solo: una vez por montaje (la referencia sobrevive al
  // doble montaje del modo estricto) y solo con la app a la vista; si está en
  // el fondo, espera a que vuelva.
  const caraPedida = useRef(false)
  useEffect(() => {
    if (modo !== 'desbloqueo' || !conCara || caraPedida.current) return undefined
    if (typeof document === 'undefined') return undefined

    const intentar = () => {
      if (caraPedida.current || document.visibilityState !== 'visible') return
      caraPedida.current = true
      abrirConCara()
    }
    intentar()
    if (caraPedida.current) return undefined
    document.addEventListener('visibilitychange', intentar)
    return () => document.removeEventListener('visibilitychange', intentar)
    // `abrirConCara` cambia en cada pintado y no decide nada aquí.
  }, [modo, conCara])

  /** Activar Face ID desde los ajustes (DP-23.10). */
  const activarCara = async () => {
    const resultado = await acciones.activarBiometria(codigo, textos.biometria.motivo)
    if (resultado.ok) return limpiar('inicio')
    if (resultado.motivo === 'incorrecto') {
      setCodigo('')
      return setNota(textos.bloqueo.incorrecto)
    }
    // Cancelar, fallar o negar el permiso: iOS ya lo dijo. Sin texto propio.
    return limpiar('inicio')
  }

  const abrir = async () => {
    if (await acciones.desbloquear(codigo)) return
    setCodigo('')
    setNota(textos.bloqueo.incorrecto)
  }

  const verificar = async () => {
    const resultado = await acciones.reautenticar(pideContrasena ? { contrasena } : undefined)
    if (resultado.ok) return limpiar('nuevo')
    // Cerrar la hoja de Google o de Apple no es un error: se vuelve a esta
    // pantalla tal como estaba, sin nota (SPEC_21.2 §4.6).
    if (resultado.motivo === 'cancelado') return setNota(null)
    if (resultado.motivo === 'pide-contrasena') {
      setPideContrasena(true)
      return setNota(textos.recuperar.pideContrasena)
    }
    setNota(
      {
        'sin-sesion': textos.recuperar.sinSesion,
        'sin-metodo': textos.recuperar.sinMetodo,
        credenciales: textos.recuperar.credenciales,
        'sin-conexion': copy.cuenta.error.sinConexion,
      }[resultado.motivo] ?? textos.recuperar.noVerificado,
    )
    // Con un error del campo, el foco vuelve a él.
    if (pideContrasena) campoContrasena.current?.focus()
    return undefined
  }

  /** Confirmación en dos pasos. Si no coinciden, se repite sin culpabilizar. */
  const fijar = async (accion) => {
    if (!esPinValido(codigo)) return setNota(textos.corto)
    if (codigo !== repetido) {
      setRepetido('')
      return setNota(textos.repetir.noCoincide)
    }
    const resultado = await accion(codigo)
    if (!resultado.ok) {
      return setNota(resultado.motivo === 'sin-metodo' ? textos.cuenta.lead : textos.corto)
    }
    limpiar(modo === 'desbloqueo' ? 'abierto' : 'inicio')
    setNota(textos.guardado)
    return undefined
  }

  const retirar = async () => {
    const resultado = await acciones.desactivar(codigo)
    if (!resultado.ok) {
      setCodigo('')
      return setNota(textos.bloqueo.incorrecto)
    }
    limpiar('inicio')
    setNota(textos.retirado)
    return undefined
  }

  const camposDeAlta = (
    <>
      <CampoPin
        id="pin-nuevo"
        value={codigo}
        onChange={setCodigo}
        etiqueta={`${textos.campo.label} · ${textos.campo.hint}`}
      />
      <CampoPin
        id="pin-repetir"
        value={repetido}
        onChange={setRepetido}
        etiqueta={textos.repetir.label}
      />
    </>
  )

  // ─── Desbloqueo ─────────────────────────────────────────────────────────────

  if (modo === 'desbloqueo') {
    if (paso === 'recuperar') {
      return (
        <section className="flex min-h-screen flex-col justify-center gap-6 px-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-lg text-on-surface">{textos.recuperar.titulo}</h1>
            <p className="text-base text-on-surface-soft">{textos.recuperar.lead}</p>
          </div>
          {pideContrasena && (
            <div className="flex flex-col gap-1">
              <label htmlFor="pin-contrasena" className="text-sm text-on-surface-soft">
                {textos.recuperar.contrasena}
              </label>
              <CampoLinea
                ref={campoContrasena}
                id="pin-contrasena"
                type="password"
                autoComplete="current-password"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                aria-describedby={nota ? 'pin-recuperar-nota' : undefined}
              />
            </div>
          )}
          {nota && <Nota id="pin-recuperar-nota">{nota}</Nota>}
          <Button variant="surface" onClick={verificar}>
            {textos.recuperar.cta}
          </Button>
          <button
            type="button"
            onClick={() => limpiar('abrir')}
            className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {textos.recuperar.volver}
          </button>
        </section>
      )
    }

    if (paso === 'nuevo') {
      return (
        <section className="flex min-h-screen flex-col justify-center gap-6 px-5">
          <h1 className="font-display text-lg text-on-surface">{textos.recuperar.nuevo}</h1>
          {camposDeAlta}
          {nota && <Nota>{nota}</Nota>}
          <Button variant="surface" onClick={() => fijar(acciones.reestablecer)}>
            {textos.guardar}
          </Button>
        </section>
      )
    }

    return (
      <section className="flex min-h-screen flex-col justify-center gap-6 px-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-lg text-on-surface">{textos.bloqueo.titulo}</h1>
          <p className="text-base text-on-surface-soft">{textos.bloqueo.lead}</p>
        </div>

        <CampoPin
          id="pin-abrir"
          value={codigo}
          onChange={setCodigo}
          etiqueta={textos.campo.label}
        />
        {nota && <Nota>{nota}</Nota>}

        <Button variant="surface" onClick={abrir} disabled={codigo.length < MIN_DIGITOS}>
          {textos.bloqueo.abrir}
        </Button>

        {conCara && (
          <button
            type="button"
            onClick={abrirConCara}
            className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {conNombre(textos.biometria.abrir, biometria.tipo)}
          </button>
        )}

        <button
          type="button"
          onClick={() => limpiar('recuperar')}
          className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.bloqueo.olvide}
        </button>
      </section>
    )
  }

  // ─── Ajustes ────────────────────────────────────────────────────────────────
  // Desactivado por defecto. La app nunca propone activarlo por su cuenta ni lo
  // sugiere de forma repetida (§5.8.2).

  return (
    <section className="flex flex-col gap-4 rounded-md border border-on-surface bg-strivo-campo p-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-md text-on-surface">{textos.title}</h2>
        <p className="text-base text-on-surface-soft">{textos.lead}</p>
        <p className="text-sm text-on-surface-soft">{textos.alcance}</p>
      </div>

      {estado.sinSalida && <Nota>{textos.cuenta.aviso}</Nota>}

      {paso === 'crear' && (
        <>
          {camposDeAlta}
          {nota && <Nota>{nota}</Nota>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="surface" onClick={() => fijar(acciones.crear)}>
              {textos.guardar}
            </Button>
            <Button size="sm" variant="surface" onClick={() => limpiar('inicio')}>
              {textos.cancelar}
            </Button>
          </div>
        </>
      )}

      {paso === 'retirar' && (
        <>
          <CampoPin
            id="pin-retirar"
            value={codigo}
            onChange={setCodigo}
            etiqueta={textos.campo.label}
          />
          {nota && <Nota>{nota}</Nota>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="surface" onClick={retirar}>
              {textos.desactivar}
            </Button>
            <Button size="sm" variant="surface" onClick={() => limpiar('inicio')}>
              {textos.cancelar}
            </Button>
          </div>
        </>
      )}

      {paso === 'activarBiometria' && (
        <>
          <CampoPin
            id="pin-biometria"
            value={codigo}
            onChange={setCodigo}
            etiqueta={conNombre(textos.biometria.confirmarPin, biometria.tipo)}
          />
          {nota && <Nota>{nota}</Nota>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="surface" onClick={activarCara}>
              {textos.biometria.activar}
            </Button>
            <Button size="sm" variant="surface" onClick={() => limpiar('inicio')}>
              {textos.cancelar}
            </Button>
          </div>
        </>
      )}

      {paso === 'inicio' && (
        <>
          {estado.activo && <Nota>{textos.activo}</Nota>}

          {/* SPEC_23A (DP-23.9) — Solo con PIN y con Face ID o Touch ID
              disponible para Strivo. En la web no existe. */}
          {estado.activo && biometria.disponible && (
            <div className="flex flex-col gap-1">
              <Interruptor
                encendido={conCara}
                etiqueta={conNombre(textos.biometria.interruptor, biometria.tipo)}
                onCambiar={() =>
                  conCara ? acciones.apagarBiometria() : limpiar('activarBiometria')
                }
              />
              <p aria-live="polite" className="text-sm text-on-surface-soft">
                {biometria.estado === 'cambiada'
                  ? conNombre(textos.biometria.cambiada, biometria.tipo)
                  : textos.biometria.texto}
              </p>
            </div>
          )}

          {nota && <Nota>{nota}</Nota>}

          {/* RN-JR-PIN-02 — Sin forma de recuperarlo no se ofrece el alta: se
              ofrece la salida que la desbloquea. */}
          {!estado.activo && !estado.puedeActivar ? (
            <CuentaParaPin onVincular={acciones.vincular} />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="surface"
                onClick={() => limpiar(estado.activo ? 'retirar' : 'crear')}
              >
                {estado.activo ? textos.desactivar : textos.activar}
              </Button>
              {onCerrar && (
                <Button size="sm" variant="surface" onClick={onCerrar}>
                  {textos.cerrar}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
