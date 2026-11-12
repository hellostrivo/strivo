// src/lib/haptica.js
// Un toque suave en el iPhone (SPEC_23B).
//
// **El único archivo de `src/` que importa `@capacitor/haptics`, y bajo
// demanda.** Hay una prueba que recorre `src/` para comprobarlo.
//
// **Solo en la app de iPhone** (`esIPhone()`, DP-22.13). En la web el plugin no
// es mudo: su implementación web llama a `navigator.vibrate`, así que en Chrome
// de Android la PWA vibraría, y en Safari la promesa se rechaza. Por eso en la
// web no se carga nunca y la web no descarga ni una línea del plugin.
//
// **Cuándo vibra lo decide cada uno de los tres puntos** —cerrar el día, elegir
// una emoción, cambiar de fase en Respiración—; aquí solo se dice cómo. Nunca
// en un error y nunca para premiar nada.
//
// **Sin ajuste propio** (DP-23.1): `UIImpactFeedbackGenerator` ya respeta el
// ajuste de vibración del sistema, que iOS aplica solo. No se lee nada desde
// aquí.
//
// **No se espera y nunca lanza.** `toqueSuave()` no devuelve nada que haya que
// mirar: un plugin que falla deja la app exactamente como estaba.
//
// **El plugin nunca sale suelto de una promesa** (SPEC_21.2): es un Proxy de
// Capacitor que contesta también a `then`. `cargarPlugin` lo devuelve envuelto.

import { esIPhone } from './plataforma.js'

async function cargarPlugin() {
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
  return { plugin: Haptics, estilo: ImpactStyle.Light }
}

/**
 * Crea la función del toque. Los argumentos existen para las pruebas.
 *
 * @param {object} [opciones]
 * @param {() => Promise<{plugin: object, estilo: string}>} [opciones.cargar]
 * @param {() => boolean} [opciones.enTelefono]
 * @returns {() => void}
 */
export function crearToque({ cargar = cargarPlugin, enTelefono = esIPhone } = {}) {
  let carga = null

  return function toque() {
    try {
      if (!enTelefono()) return
      // Si la carga falla, se olvida: el siguiente toque lo vuelve a intentar.
      carga ??= cargar().catch((error) => {
        carga = null
        throw error
      })
      carga
        .then(({ plugin, estilo }) => plugin.impact({ style: estilo }))
        .catch(() => {
          // Un toque que no llega no es un error de nadie.
        })
    } catch {
      // Tampoco aquí: el toque nunca frena a quien lo pide.
    }
  }
}

/** El toque de la casa: ligero, uno solo. */
export const toqueSuave = crearToque()
