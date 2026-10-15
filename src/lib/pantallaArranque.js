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
// **Y el fundido no empieza en el primer pintado: espera** (D-21.9, 13 oct
// 2026). Dos fotogramas después de montar, la app todavía no está a la vista:
// iOS sigue enseñando su propia imagen del arranque mientras termina el zoom
// desde el ícono. Un fundido que empezaba ahí corría sin verse, y cuando iOS
// destapaba la ventana ya iba al 41 %: de noche, un salto de un cuadro del papel
// a un gris violáceo, y el resto del fundido después. La espera hace que el
// relevo de iOS caiga sobre papel quieto y que el fundido se vea entero.
//
// **Y la pantalla de arranque se retira siempre.** Con `launchAutoHide: false`,
// un `hide()` que no llega deja a alguien delante de la «S» para siempre, así
// que la llamada tiene tres redes: un techo que la hace aunque los fotogramas no
// lleguen nunca, una guarda que la hace una sola vez, y un segundo intento, sin
// fundido, si la primera lanza o se rechaza.
//
// En web no hace nada: no hay pantalla de arranque que retirar.

import { SplashScreen } from '@capacitor/splash-screen'
import { esNativa } from './plataforma.js'

/** El fundido de salida, en ms. El mismo tiempo que un cambio de momento (RN-VIS-04). */
export const FUNDIDO_DE_SALIDA = 320

/**
 * Cuánto se queda el papel quieto tras el primer pintado antes de empezar el
 * fundido, en ms.
 *
 * **De dónde salen los 300.** En un iPhone 17 (iOS 26.6.2), grabado a 60 fps,
 * el fundido iba al 41 % cuando iOS destapó la ventana: 0,41 × 320 ≈ 131 ms
 * corrieron sin verse. 300 es ese tiempo con un margen de 2,3×. **Hay que
 * recalibrarla si cambia el aparato mínimo**: en un teléfono más lento el zoom
 * de apertura puede tardar más, y el síntoma de que se quedó corta es el mismo
 * salto de un cuadro al destaparse.
 */
export const ESPERA_ANTES_DE_RETIRAR = 300

/**
 * Pase lo que pase con los fotogramas, a esta altura se retira. Muy por encima
 * de lo que tarda el camino normal (dos fotogramas más la espera), para que
 * solo actúe si algo se atasca.
 */
export const TECHO_DE_RETIRADA = 2000

/**
 * Cuándo y cómo se retira la pantalla de arranque. `null` en web: no hay nada
 * que retirar.
 *
 * Con «reducir movimiento» no hay espera ni fundido: el paso es un corte por
 * diseño (§4.7), así que no hay ningún fundido que pueda quedarse a medias.
 */
export function planDeRetirada({ nativa, menosMovimiento }) {
  if (!nativa) return null
  if (menosMovimiento) return { espera: 0, fadeOutDuration: 0 }
  return { espera: ESPERA_ANTES_DE_RETIRAR, fadeOutDuration: FUNDIDO_DE_SALIDA }
}

function prefiereMenosMovimiento() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  } catch {
    return false
  }
}

/** El reloj del navegador. Las pruebas pasan uno propio. */
const RELOJ = {
  siguienteCuadro: (fn) => requestAnimationFrame(fn),
  esperar: (fn, ms) => setTimeout(fn, ms),
  cancelar: (id) => clearTimeout(id),
}

// Llama a `ocultar` y avisa si falla, tanto si lanza como si su promesa se
// rechaza. No deja escapar nada: lo que falla aquí lo resuelve quien llama.
function intentar(ocultar, opciones, alFallar) {
  try {
    Promise.resolve(ocultar(opciones)).catch(alFallar)
  } catch {
    alFallar()
  }
}

/**
 * Retira la pantalla de arranque tras el primer pintado y la espera del plan.
 * Se llama una vez, desde `main.jsx`, antes que nada más.
 *
 * Todo es inyectable para las pruebas; en la app se llama sin argumentos.
 */
export function retirarPantallaDeArranque({
  nativa = esNativa(),
  menosMovimiento = prefiereMenosMovimiento(),
  ocultar = (opciones) => SplashScreen.hide(opciones),
  reloj = RELOJ,
} = {}) {
  const plan = planDeRetirada({ nativa, menosMovimiento })
  if (!plan) return

  let retirada = false
  let techo = null

  const retirar = () => {
    if (retirada) return
    retirada = true
    if (techo !== null) reloj.cancelar(techo)
    // Si el primer intento falla, el segundo va sin fundido: lo que importa ya
    // no es cómo se va, es que se vaya. Lo que falle en ese no tiene a quién
    // contárselo (RN-EST-04).
    intentar(ocultar, { fadeOutDuration: plan.fadeOutDuration }, () =>
      intentar(ocultar, { fadeOutDuration: 0 }, () => {}),
    )
  }

  // La red de debajo de todo, armada antes que el camino normal: si los
  // fotogramas no llegan nunca —la página se queda oculta, el reloj se atasca—
  // o algo lanza por el camino, el techo retira igual. Si ni siquiera se puede
  // armar, queda el camino normal, y si ese también lanza, se retira ya.
  try {
    techo = reloj.esperar(retirar, TECHO_DE_RETIRADA)
  } catch {
    techo = null
  }

  try {
    // Dos fotogramas: el primero es el del render, el segundo garantiza que ya
    // está pintado. Después, la espera para que el relevo de iOS caiga sobre
    // papel.
    reloj.siguienteCuadro(() =>
      reloj.siguienteCuadro(() => {
        reloj.esperar(retirar, plan.espera)
      }),
    )
  } catch {
    retirar()
  }
}
