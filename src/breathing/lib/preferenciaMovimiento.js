// src/breathing/lib/preferenciaMovimiento.js
// De dónde sale `movimientoReducido` (SPEC_14 §7).
//
// Dos fuentes, y ninguna manda sobre la otra: la del sistema y un interruptor
// propio de la app (RN-RE-VIS-22). Alguien puede querer que la respiración vaya
// a saltos sin cambiar la preferencia de todo su teléfono, y también al revés:
// tener el sistema en reducido y no poder salirse de ahí sería peor. Se
// combinan con un O lógico, que es lo único que respeta las dos.
//
// La preferencia del sistema se **escucha**, no se lee una vez (RN-RE-VIS-21):
// cambiarla con la sesión abierta adapta la visual sin reiniciar el ejercicio.

import { useEffect, useState } from 'react'

export const CONSULTA = '(prefers-reduced-motion: reduce)'

/**
 * RN-RE-VIS-22 — Cualquiera de las dos activa el modo.
 * Se exporta suelta para poder probar la regla sin montar un componente.
 */
export function combinarPreferencia(sistema, manual) {
  return Boolean(sistema) || Boolean(manual)
}

/** Sin `matchMedia` —servidor, o un navegador viejo— se asume que no. */
export function leerPreferenciaSistema() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(CONSULTA).matches
}

/**
 * Se suscribe a los cambios de la preferencia del sistema.
 * @returns {Function} Para dejar de escuchar. Siempre devuelve algo llamable.
 */
export function observarPreferenciaSistema(alCambiar) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const consulta = window.matchMedia(CONSULTA)
  const manejador = (evento) => alCambiar(evento.matches)
  consulta.addEventListener('change', manejador)
  return () => consulta.removeEventListener('change', manejador)
}

/**
 * El valor que reciben las visuales.
 *
 * @param {boolean} [manual] - El interruptor de la configuración de Respiración.
 * @returns {boolean}
 */
export function usarMovimientoReducido(manual = false) {
  const [sistema, setSistema] = useState(leerPreferenciaSistema)

  useEffect(() => {
    setSistema(leerPreferenciaSistema())
    return observarPreferenciaSistema(setSistema)
  }, [])

  return combinarPreferencia(sistema, manual)
}
