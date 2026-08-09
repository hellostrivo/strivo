// src/components/journal/ProteccionJournal.jsx
// El interruptor del PIN del Journal (bloque 07, §07.D.2).
// Copy: copy.journal.proteccion · Almacén y cripto: @lib/journalPin
//
// Vive en dos sitios y es el mismo componente en los dos: en "Tú", que es el
// cajón de ajustes, y dentro del propio Journal, que es donde a alguien se le
// ocurre que ese espacio podría cerrarse.
//
// Desactivado de partida, siempre. Nadie se encuentra un PIN que no puso.
//
// No se ofrece a quien no podría recuperarlo: sin cuenta con correo, poner un
// PIN es tenderle una trampa a la persona que lo olvide. En ese caso la fila
// explica por qué en una línea y no insiste más (§07.D.5, caso sin cuenta).

import { useEffect, useState } from 'react'
import { copy } from '@copy'
import { metodoDeRecuperacion } from '@lib/auth'
import {
  hayCripto,
  hayPin,
  pinCompleto,
  guardarPin,
  cambiarPin,
  quitarPin,
} from '@lib/journalPin'
import Button from '@components/ui/Button'
import CampoPin from '@components/journal/CampoPin'
import CuentaParaPin from '@components/journal/CuentaParaPin'

const c = copy.journal.proteccion

export default function ProteccionJournal({ onCambio }) {
  const [cargando, setCargando] = useState(true)
  const [hayCuenta, setHayCuenta] = useState(false)  // con qué recuperarlo
  const [activo, setActivo]     = useState(false)
  const [vista, setVista]       = useState(null)    // null|'crear'|'cambio'|'retirar'
  const [aviso, setAviso]       = useState(null)

  // Sin WebCrypto no hay forma de guardar un PIN sin guardarlo en claro, y eso
  // no se hace. Pasa en contextos no seguros (http fuera de localhost).
  const conCripto = hayCripto()

  useEffect(() => {
    let vigente = true
    Promise.all([metodoDeRecuperacion(), hayPin()])
      .then(([metodo, tiene]) => {
        if (!vigente) return
        setHayCuenta(!!metodo)
        setActivo(tiene)
      })
      .catch(error => console.warn('[Strivo] El PIN del Journal se consulta luego:', error))
      .finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [])

  const alTerminar = (estaActivo, mensaje) => {
    setActivo(estaActivo)
    setVista(null)
    setAviso(mensaje)
    onCambio?.(estaActivo)
  }

  if (cargando) return null

  return (
    <section aria-labelledby="proteccion-journal-titulo">
      <h2 id="proteccion-journal-titulo" className="font-display text-md text-ink">
        {c.titulo}
      </h2>
      <p className="mt-1 text-sm text-ink/80">{c.descripcion}</p>

      {!conCripto ? (
        <p className="mt-4 text-sm text-ink/80">{c.sinCripto}</p>
      ) : !hayCuenta ? (
        // Ya no es un aviso sin salida: aquí mismo se crea la cuenta que hace
        // falta, y al terminar aparece el interruptor sin recargar nada.
        <>
          <p className="mt-4 text-sm text-ink/80">{c.cuenta.titulo}</p>
          <CuentaParaPin onVinculada={() => setHayCuenta(true)} />
        </>
      ) : (
        <>
          <Interruptor
            activo={activo}
            onActivar={() => { setAviso(null); setVista('crear') }}
            onDesactivar={() => { setAviso(null); setVista('retirar') }}
          />

          <p className="mt-3 text-sm text-ink/80" aria-live="polite">
            {aviso ?? (activo ? c.activo : c.inactivo)}
          </p>

          {activo && !vista && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 -ml-4"
              onClick={() => { setAviso(null); setVista('cambio') }}
            >
              {c.cambiar}
            </Button>
          )}

          {vista === 'crear' && (
            <FormularioPin
              titulo={c.crear.titulo}
              ayuda={c.crear.ayuda}
              campos={[
                { clave: 'nuevo',     label: c.crear.campo },
                { clave: 'confirmar', label: c.crear.confirmar },
              ]}
              accion={c.crear.guardar}
              onCancelar={() => setVista(null)}
              onEnviar={async ({ nuevo, confirmar }) => {
                if (nuevo !== confirmar) return c.crear.noCoinciden
                await guardarPin(nuevo)
                alTerminar(true, c.crear.listo)
                return null
              }}
            />
          )}

          {vista === 'cambio' && (
            <FormularioPin
              titulo={c.cambio.titulo}
              ayuda={c.crear.ayuda}
              campos={[
                { clave: 'actual',    label: c.cambio.actual },
                { clave: 'nuevo',     label: c.cambio.nuevo },
                { clave: 'confirmar', label: c.cambio.confirmar },
              ]}
              accion={c.cambio.guardar}
              onCancelar={() => setVista(null)}
              onEnviar={async ({ actual, nuevo, confirmar }) => {
                if (nuevo !== confirmar) return c.crear.noCoinciden
                if (!(await cambiarPin(actual, nuevo))) return c.desbloqueo.incorrecto
                alTerminar(true, c.cambio.listo)
                return null
              }}
            />
          )}

          {vista === 'retirar' && (
            <FormularioPin
              titulo={c.retirar.titulo}
              ayuda={c.retirar.ayuda}
              campos={[{ clave: 'actual', label: c.retirar.campo }]}
              accion={c.retirar.confirmar}
              onCancelar={() => setVista(null)}
              onEnviar={async ({ actual }) => {
                // Quitar la protección no borra ni una entrada: `quitarPin`
                // solo retira su fila de `appFlags` (RN-04, §07.D.2).
                if (!(await quitarPin(actual))) return c.desbloqueo.incorrecto
                alTerminar(false, c.retirar.listo)
                return null
              }}
            />
          )}
        </>
      )}
    </section>
  )
}

// ─── El interruptor ──────────────────────────────────────────────────────────
// Un switch de verdad (role="switch"), no una casilla: lo que hace es encender
// y apagar algo, y así se anuncia. Encender abre el formulario de crear;
// apagar, el que pide el PIN de ahora. El estado solo cambia cuando la
// operación termina.
function Interruptor({ activo, onActivar, onDesactivar }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={activo ? onDesactivar : onActivar}
      className={[
        'mt-5 w-full min-h-touch',
        'flex items-center justify-between gap-4',
        'rounded-md bg-surface border border-border px-4 py-3',
        'text-left text-base text-ink',
        'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
      ].join(' ')}
    >
      <span>{c.interruptor}</span>
      <span
        aria-hidden="true"
        className={[
          'shrink-0 w-12 h-7 rounded-full p-1',
          'flex items-center',
          'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
          activo ? 'bg-ink justify-end' : 'bg-border justify-start',
        ].join(' ')}
      >
        <span className="w-5 h-5 rounded-full bg-paper" />
      </span>
    </button>
  )
}

// ─── El formulario ───────────────────────────────────────────────────────────
// Uno solo para los tres casos: crear, cambiar y quitar solo se diferencian en
// cuántos campos piden y en qué hacen al final. `onEnviar` devuelve el texto de
// lo que no salió, o null si salió.
function FormularioPin({ titulo, ayuda, campos, accion, onEnviar, onCancelar }) {
  const [valores, setValores] = useState(() =>
    Object.fromEntries(campos.map(campo => [campo.clave, '']))
  )
  const [problema, setProblema] = useState(null)
  const [enCurso, setEnCurso]   = useState(false)

  const completo = campos.every(campo => pinCompleto(valores[campo.clave]))

  const enviar = async () => {
    if (!completo || enCurso) return
    setEnCurso(true)
    setProblema(null)
    try {
      const mensaje = await onEnviar(valores)
      if (mensaje) {
        setProblema(mensaje)
        // Los campos se vacían enteros. Es una regla sola para los tres
        // formularios y nunca deja escrito algo que ya se sabe que no era.
        setValores(Object.fromEntries(campos.map(campo => [campo.clave, ''])))
      }
    } catch (error) {
      console.warn('[Strivo] El PIN del Journal no se pudo guardar:', error)
      setProblema(copy.journal.proteccion.recuperar.error)
    } finally {
      setEnCurso(false)
    }
  }

  return (
    <div className="mt-6 animate-fade-up motion-reduce:animate-none">
      <h3 className="font-display text-base text-ink">{titulo}</h3>
      {ayuda && <p id="pin-ayuda" className="mt-1 text-sm text-ink/80">{ayuda}</p>}

      <div className="mt-4 flex flex-col gap-5">
        {campos.map((campo, indice) => (
          <CampoPin
            key={campo.clave}
            id={`pin-${campo.clave}`}
            label={campo.label}
            value={valores[campo.clave]}
            autoFocus={indice === 0}
            describedBy={ayuda ? 'pin-ayuda' : undefined}
            onChange={valor => setValores(actual => ({ ...actual, [campo.clave]: valor }))}
            onEnter={enviar}
          />
        ))}
      </div>

      {/* Solo lo que no salió. La ayuda va arriba y es fija: meterla aquí la
          haría anunciarse sola cada vez que cambia un dígito. */}
      <p className="mt-3 text-sm text-ink/80 min-h-5" aria-live="polite">
        {problema ?? ''}
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={enCurso}
          disabled={!completo}
          onClick={enviar}
        >
          {accion}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onCancelar}>
          {c.cancelar}
        </Button>
      </div>
    </div>
  )
}
