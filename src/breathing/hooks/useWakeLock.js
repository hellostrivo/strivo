// src/breathing/hooks/useWakeLock.js
// Mantener la pantalla encendida mientras se respira (RN-RE-NAV-28).
//
// **Degradación silenciosa, sin excepción** (caso 8.12). La Wake Lock API no
// existe en todos los navegadores y, donde existe, el sistema puede negarla —
// batería baja, ahorro de energía— sin que haya nada que hacer al respecto.
// Decírselo a alguien que está a punto de respirar sería convertir una
// limitación del teléfono en un problema suyo. Si no se puede, la pantalla se
// apagará y el audio seguirá sonando (RN-RE-SND-23), que es una degradación
// aceptable y no un fallo.
//
// Se pide en `activo` y en `cerrando`, y se suelta en cuanto se pausa, se
// completa o se sale: un bloqueo que sobrevive a la sesión se come la batería
// de alguien sin que sirva para nada.

import { useEffect, useRef } from 'react'

/** Estados en los que tiene sentido mantener la pantalla despierta. */
const ESTADOS_DESPIERTOS = new Set(['activo', 'cerrando'])

export function soportaWakeLock() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

/**
 * @param {boolean} activo - Si el estado de sesión lo pide.
 * @param {boolean} permitido - La preferencia `mantenerPantallaEncendida`.
 */
export function useWakeLock(activo, permitido = true) {
  const bloqueo = useRef(null)

  useEffect(() => {
    let cancelado = false

    async function pedir() {
      if (!permitido || !activo || !soportaWakeLock()) return
      try {
        const nuevo = await navigator.wakeLock.request('screen')
        // La pantalla pudo cambiar de estado mientras se resolvía la promesa.
        if (cancelado) {
          nuevo.release?.()
          return
        }
        bloqueo.current = nuevo
      } catch {
        // Sin bloqueo y sin ruido. La sesión no depende de esto.
      }
    }

    function soltar() {
      bloqueo.current?.release?.().catch(() => {})
      bloqueo.current = null
    }

    if (activo) pedir()
    else soltar()

    // SPEC_23 Parte 2 (DP-23.27) — El sistema suelta el bloqueo cuando la app
    // se va. Tras una ausencia corta la sesión sigue en `activo` y este efecto
    // no se volvía a correr, así que la pantalla podía apagarse sola después.
    // Al volver, si se soltó, se pide otra vez.
    function alVolver() {
      if (document.visibilityState !== 'visible' || !activo) return
      if (bloqueo.current && bloqueo.current.released !== true) return
      bloqueo.current = null
      pedir()
    }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', alVolver)

    return () => {
      cancelado = true
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', alVolver)
      }
      soltar()
    }
  }, [activo, permitido])
}

/** ¿Este estado de sesión pide pantalla encendida? Puro, para poder probarlo. */
export function pidePantallaEncendida(estadoSesion, permitido = true) {
  return Boolean(permitido) && ESTADOS_DESPIERTOS.has(estadoSesion)
}

export default useWakeLock
