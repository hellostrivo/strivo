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

import { useState } from 'react'
import { clsx } from 'clsx'
import CuentaParaPin from './CuentaParaPin'
import Button from '@components/ui/Button'
import { copy } from '@copy'
import { MAX_DIGITOS, MIN_DIGITOS, esPinValido, soloDigitos } from '@/diario/pin'

const textos = copy.diario.journal.pin

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

function Nota({ children }) {
  return (
    <p className="text-sm text-on-surface-soft" role="status">
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

  const limpiar = (siguiente) => {
    setCodigo('')
    setRepetido('')
    setNota(null)
    setPaso(siguiente)
  }

  const abrir = async () => {
    if (await acciones.desbloquear(codigo)) return
    setCodigo('')
    setNota(textos.bloqueo.incorrecto)
  }

  const verificar = async () => {
    const resultado = await acciones.reautenticar()
    if (resultado.ok) return limpiar('nuevo')
    setNota(
      {
        'sin-sesion': textos.recuperar.sinSesion,
        'sin-metodo': textos.recuperar.sinMetodo,
      }[resultado.motivo] ?? textos.recuperar.noVerificado,
    )
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
          {nota && <Nota>{nota}</Nota>}
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

      {paso === 'inicio' && (
        <>
          {estado.activo && <Nota>{textos.activo}</Nota>}
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
