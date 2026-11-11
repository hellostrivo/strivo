// src/components/perfil/TusRecordatorios.jsx
// El bloque «Recordatorios» de Tu perfil (SPEC_22, DP-22.8).
//
// **Solo en la app de iPhone.** En la web no se pinta, ni con un texto de
// «solo en la app» (DP-22.2): lo decide `visibles` en `perfil/bloques.js`.
//
// **El interruptor y el permiso son dos cosas, y el bloque las dice por
// separado.** El interruptor es `preferences.remindersEnabled`: lo que la
// persona quiere, y viaja con su cuenta. El permiso es del teléfono: no se
// guarda, se consulta. Por eso, con el permiso retirado en Ajustes, el
// interruptor sigue encendido y debajo se dice que falta el permiso.
//
// Lo que se ve, fila a fila (la tabla de DP-22.8 y el §9):
//
//   apagado                         → el interruptor y nada más
//   encendido · concedido · horas    → nada más: los avisos llegan
//   encendido · concedido · sin horas → `sinHoras`
//   encendido · sin pedir            → `sinPermiso` con «Permitir avisos»
//   encendido · denegado             → `sinPermiso` con «Abrir Ajustes del teléfono»
//
// **El permiso va por delante**: `sinHoras` solo aparece con el permiso
// concedido. Y si se niega al encender, el interruptor **se queda apagado** y
// la frase con «Abrir Ajustes del teléfono» se ve mientras se siga en la
// pantalla: es estado de la pantalla y no se guarda.
//
// **El permiso solo se pide con un toque**: encender o «Permitir avisos».
// Nunca al abrir la pantalla. Tras cada cambio se pide reconciliar, y el
// resultado de cada reconciliación vuelve a pintar el permiso: volver de
// Ajustes lo actualiza sin tocar nada.
//
// Nada vibra, nada se pone en rojo y ningún control lleva `disabled`.

import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { unaVezCon } from '@components/shared/unaVez'
import { shared } from '@/lib/db'
import { PERMISO, puente } from '@lib/avisosNativos'
import { alReconciliar, pedirReconciliacion } from '@lib/avisos/pedido'

// El diagnóstico de las pruebas manuales, solo con `VITE_DIAG_AVISOS=1`. Sin
// la bandera, la condición es `false` al construir y ni el componente ni sus
// textos llegan a `dist/`.
const DiagnosticoAvisos =
  import.meta.env.VITE_DIAG_AVISOS === '1' ? lazy(() => import('./DiagnosticoAvisos')) : null

/** La URL que abre la página de Strivo en Ajustes. Capacitor la pasa al sistema. */
export const AJUSTES_DEL_TELEFONO = 'app-settings:'

/**
 * Qué se dice debajo del interruptor, sin React. `null` es nada.
 * @returns {null | {frase: 'sinPermiso'|'sinHoras', boton?: 'permitir'|'abrirAjustes'}}
 */
export function avisoDelBloque({ encendido, permiso, conHoras, recienNegado = false }) {
  if (!encendido) return recienNegado ? { frase: 'sinPermiso', boton: 'abrirAjustes' } : null
  if (permiso === PERMISO.sinPedir) return { frase: 'sinPermiso', boton: 'permitir' }
  if (permiso === PERMISO.denegado) return { frase: 'sinPermiso', boton: 'abrirAjustes' }
  if (permiso === PERMISO.concedido && !conHoras) return { frase: 'sinHoras' }
  return null
}

export default function TusRecordatorios({ uid, textos, conHoras }) {
  const [encendido, setEncendido] = useState(false)
  const [permiso, setPermiso] = useState(null)
  const [recienNegado, setRecienNegado] = useState(false)
  const ocupado = useRef(false)
  const unaVez = unaVezCon(ocupado)

  // Lo que la persona quiere y lo que el teléfono deja, al abrir la pantalla.
  // Consultar el permiso no lo pide.
  useEffect(() => {
    let vivo = true
    shared
      .getPreferences(uid)
      .then((p) => vivo && setEncendido(p?.remindersEnabled === true))
      .catch(() => {})
    puente.permiso().then((p) => vivo && setPermiso(p))
    const dejar = alReconciliar((resultado) => vivo && setPermiso(resultado.permiso))
    return () => {
      vivo = false
      dejar()
    }
  }, [uid])

  const guardar = async (valor) => {
    setEncendido(valor)
    try {
      await shared.updatePreferences(uid, { remindersEnabled: valor })
    } catch {
      // Un error de guardado no es un error visible (RN-EST-05): sigue en local.
    }
    pedirReconciliacion()
  }

  const encender = async () => {
    let actual = await puente.permiso()
    if (actual === PERMISO.sinPedir) actual = await puente.pedirPermiso()
    setPermiso(actual)
    if (actual === PERMISO.concedido) {
      setRecienNegado(false)
      return guardar(true)
    }
    // iOS no vuelve a preguntar: el interruptor se queda apagado y se dice
    // dónde darlo.
    setRecienNegado(true)
    return undefined
  }

  const apagar = () => {
    setRecienNegado(false)
    return guardar(false)
  }

  const permitir = async () => {
    setPermiso(await puente.pedirPermiso())
    pedirReconciliacion()
  }

  const abrirAjustes = () => {
    window.location.href = AJUSTES_DEL_TELEFONO
  }

  const aviso = avisoDelBloque({ encendido, permiso, conHoras, recienNegado })
  const acciones = { permitir, abrirAjustes }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={encendido}
        onClick={() => unaVez(encendido ? apagar : encender)}
        className={clsx(
          'flex min-h-touch-sm w-full items-center justify-between gap-4 text-left',
          'rounded-md text-base text-on-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
        )}
      >
        <span>{textos.interruptor}</span>
        {/* El estado se ve por la posición y el relleno, no solo por el color,
            y el lector de pantalla lo dice con `aria-checked`. */}
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

      <div aria-live="polite" className="flex flex-col gap-3">
        {aviso && (
          <p className="text-sm text-on-surface-soft leading-relaxed">{textos[aviso.frase]}</p>
        )}
        {aviso?.boton && (
          <div>
            <Button size="sm" variant="surface" onClick={() => unaVez(acciones[aviso.boton])}>
              {textos[aviso.boton]}
            </Button>
          </div>
        )}
      </div>

      {DiagnosticoAvisos && (
        <Suspense fallback={null}>
          <DiagnosticoAvisos />
        </Suspense>
      )}
    </div>
  )
}
