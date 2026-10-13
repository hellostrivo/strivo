// src/lib/pantallaArranque.js
// Retirar la pantalla de arranque de iOS cuando la app ya se ve (SPEC_21.1 §4.7).
//
// **El sistema enseña la «S» sobre papel mientras carga el WebView, y no la
// quita solo** (`launchAutoHide: false` en `capacitor.config.json`): si se fuera
// antes de que React pintara, entre la «S» y la app habría un fotograma en
// blanco. Se quita aquí, después del primer pintado, y lo que hay debajo es el
// velo de la apertura.
//
// **Con un fundido corto, y sin fundido con «reducir movimiento»** (decidido en
// el reporte previo de 21.1). De día el velo es papel, el mismo tono que la
// pantalla de arranque, así que el paso no se ve. **De noche el velo es índigo**,
// y el fundido es lo que convierte ese cambio en un paso y no en un corte. Lo
// arreglaría del todo decidir el tono del velo nocturno, que sigue abierto.
//
// En web no hace nada: no hay pantalla de arranque que retirar.

import { SplashScreen } from '@capacitor/splash-screen'
import { esNativa } from './plataforma.js'

/** El fundido de salida, en ms. El mismo tiempo que un cambio de momento (RN-VIS-04). */
export const FUNDIDO_DE_SALIDA = 320

/** Cómo se retira, según la preferencia de movimiento. */
export function opcionesDeOcultar(menosMovimiento) {
  return { fadeOutDuration: menosMovimiento ? 0 : FUNDIDO_DE_SALIDA }
}

function prefiereMenosMovimiento() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  } catch {
    return false
  }
}

/**
 * Retira la pantalla de arranque en el siguiente pintado. Se llama una vez,
 * desde `main.jsx`, justo después de montar la app.
 */
export function retirarPantallaDeArranque() {
  if (!esNativa()) return
  // Dos fotogramas: el primero es el del render, el segundo garantiza que ya
  // está en pantalla.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      SplashScreen.hide(opcionesDeOcultar(prefiereMenosMovimiento())).catch(() => {})
    }),
  )
}
