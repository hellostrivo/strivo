// src/lib/sesion.js
// Cuándo se muestra la apertura de sesión (§17.4).
//
// Este es el punto donde una pantalla bonita se convierte en un peaje. Las
// reglas están aquí, separadas de la pantalla, para poder probarlas: son la
// diferencia entre un umbral y un obstáculo.

import { getFlag, setFlag } from '@lib/db'

const MINUTO = 60 * 1000

// Volver de mirar una notificación no es empezar una sesión
export const AUSENCIA_MINIMA = 30 * MINUTO

// Aunque se cumpla todo lo demás, como mucho una vez por hora
export const DESCANSO_MINIMO = 60 * MINUTO

const CLAVE_ULTIMA = 'aperturaSesion.ultima'

/**
 * @param {object} contexto
 * @param {number}  contexto.ahora
 * @param {number?} contexto.ultimaVez      cuándo se mostró por última vez
 * @param {number?} contexto.ocultaDesde    cuándo se fue a segundo plano (null si es un arranque en frío)
 * @param {boolean} contexto.vieneDelOnboarding
 */
export function debeMostrarApertura({ ahora, ultimaVez, ocultaDesde, vieneDelOnboarding }) {
  // P11 ya es un cierre. Encadenar dos momentos ceremoniales los devalúa a los dos.
  if (vieneDelOnboarding) return false

  // Como mucho una vez por hora, pase lo que pase
  if (ultimaVez && ahora - ultimaVez < DESCANSO_MINIMO) return false

  // Arranque en frío: no venimos de ningún sitio
  if (ocultaDesde == null) return true

  // Volver a primer plano solo cuenta si la app estuvo fuera un buen rato
  return ahora - ocultaDesde >= AUSENCIA_MINIMA
}

export const ultimaApertura = () => getFlag(CLAVE_ULTIMA)
export const anotarApertura = ahora => setFlag(CLAVE_ULTIMA, ahora)
