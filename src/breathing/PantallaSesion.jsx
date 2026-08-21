// src/breathing/PantallaSesion.jsx
// `/respiracion/sesion` — respirar (SPEC_16 §3.3).
//
// **La visual domina y todo lo demás es periférico** (RN-RE-NAV-21). Es la
// pantalla más vacía de la app a propósito: lo único que hay que hacer aquí es
// seguir un ritmo, y cada elemento que compita por la atención es un elemento
// que la aparta de él.
//
// **Los controles se atenúan solos a los seis segundos** (RN-RE-NAV-23). Es lo
// que permite cerrar los ojos sin que la pantalla siga gritando, y siguen siendo
// tocables mientras están tenues: atenuar no es desactivar. Vuelven enteros al
// tocar en cualquier parte.
//
// **Salir no pide confirmación** (RN-RE-NAV-27). Pide confirmación quien quiere
// retener, y Strivo no retiene. Se llama `terminar()` y se va.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { copy } from '@copy'
import { haySoporte } from '@lib/audio/contextoAudio'
import { ESTADOS } from '@lib/respiracion/maquinaSesion'

import GuiaVisual from './components/visuales/GuiaVisual.jsx'
import ProgresoSesion from './components/ProgresoSesion.jsx'
import PanelAjustesVivo from './components/PanelAjustesVivo.jsx'
import CierreSesion from './components/CierreSesion.jsx'
import { usarMovimientoReducido } from './lib/preferenciaMovimiento.js'
import { useWakeLock, pidePantallaEncendida } from './hooks/useWakeLock.js'

/** RN-RE-NAV-23 — Seis segundos sin tocar nada y los controles se retiran. */
export const MS_ANTES_DE_ATENUAR = 6000

export default function PantallaSesion({
  sesion,
  configuracion,
  onAjustar,
  onSalir,
  onRepetir,
  hayTeclado = false,
}) {
  const navegar = useNavigate()
  const { estadoSesion, estadoRitmo, refVisual } = sesion
  const [atenuado, setAtenuado] = useState(false)
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false)
  const controlPausa = useRef(null)

  const movimientoReducido = usarMovimientoReducido(configuracion.movimientoReducido)
  useWakeLock(
    pidePantallaEncendida(estadoSesion, configuracion.mantenerPantallaEncendida),
    configuracion.mantenerPantallaEncendida,
  )

  // RN-RE-NAV-41 — El foco arranca en el control de pausa: es lo que se va a
  // querer tocar, y es lo único que se toca durante toda la sesión.
  useEffect(() => {
    controlPausa.current?.focus({ preventScroll: true })
  }, [])

  /**
   * RN-RE-NAV-45 — Con teclado o lector de pantalla, los controles **no** se
   * atenúan. Quien navega tabulando necesita ver dónde está el foco, y un foco
   * al 25 % de opacidad es un foco perdido.
   */
  useEffect(() => {
    if (hayTeclado || ajustesAbiertos) {
      setAtenuado(false)
      return undefined
    }
    setAtenuado(false)
    const temporizador = setTimeout(() => setAtenuado(true), MS_ANTES_DE_ATENUAR)
    return () => clearTimeout(temporizador)
  }, [hayTeclado, ajustesAbiertos, estadoSesion])

  const despertar = () => setAtenuado(false)

  if (estadoSesion === ESTADOS.COMPLETADO) {
    return (
      <CierreSesion
        resumen={sesion.resumen()}
        onRepetir={onRepetir}
        onVolver={() => {
          onSalir()
          navegar('/')
        }}
      />
    )
  }

  const enPausa = estadoSesion === ESTADOS.PAUSADO
  const instantanea = sesion.instantanea()

  return (
    <div
      className="flex min-h-screen flex-col"
      onPointerDown={despertar}
      data-atenuado={atenuado ? 'si' : 'no'}
    >
      <header className="flex items-center px-5 py-4">
        <button
          type="button"
          onClick={() => {
            // RN-RE-NAV-27 — Sin confirmación. `terminar()` corta de inmediato
            // y el ambiente se va con su fundido de 800 ms.
            sesion.terminar()
            onSalir()
            navegar('/respiracion')
          }}
          aria-label={copy.respiracion.accesibilidad.salir}
          className="respiracion-control min-h-touch min-w-touch rounded-full text-on-surface"
        >
          ✕
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-5">
        <GuiaVisual
          ref={refVisual}
          visual={configuracion.visual}
          patron={configuracion.patron}
          estado={estadoRitmo}
          estadoSesion={estadoSesion}
          movimientoReducido={movimientoReducido}
        />
      </div>

      <div className="flex flex-col items-center gap-4 px-5 pb-10">
        <button
          ref={controlPausa}
          type="button"
          onClick={() => {
            despertar()
            if (enPausa) sesion.reanudar()
            else sesion.pausar()
          }}
          aria-label={
            enPausa
              ? copy.respiracion.accesibilidad.reanudar
              : copy.respiracion.accesibilidad.pausar
          }
          className="respiracion-control min-h-touch rounded-full border border-espacio px-6 text-sm text-on-surface"
        >
          {enPausa ? copy.respiracion.controles.reanudar : copy.respiracion.controles.pausar}
        </button>

        <button
          type="button"
          onClick={() => {
            despertar()
            setAjustesAbiertos(true)
          }}
          aria-label={copy.respiracion.accesibilidad.abrirAjustes}
          className="respiracion-control min-h-touch rounded-full px-5 text-sm text-on-surface-soft"
        >
          {copy.respiracion.sesion.ajustes}
        </button>

        <ProgresoSesion
          duracion={configuracion.duracion}
          ciclosCompletados={instantanea?.ciclosCompletados ?? 0}
          ms={instantanea?.ms ?? 0}
        />
      </div>

      {/* RN-RE-NAV-24 — Se ajusta sin detener el ritmo: la máquina ni se entera. */}
      {ajustesAbiertos ? (
        <PanelAjustesVivo
          hayAudio={haySoporte()}
          configuracion={configuracion}
          onAjustar={onAjustar}
          onCerrar={() => setAjustesAbiertos(false)}
        />
      ) : null}
    </div>
  )
}
