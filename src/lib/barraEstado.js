// src/lib/barraEstado.js
// El color de la hora y la batería en la app de iPhone (SPEC_21.1 §4.8).
//
// **La barra de estado se pinta encima de lo que haya arriba, y lo que hay
// arriba no es la paleta: es el cromo.** La cabecera (`NavStrivo`) llega hasta
// el borde de la pantalla y su fondo es el contratono oscuro `#1D1833` en la
// Mañana y en las otras cuatro secciones, y claro solo en la Noche de Hoy
// (`globals.css`, `.cromo-espacio`). Decidir por la paleta —texto oscuro de día,
// claro de noche— dejaría la hora oscura sobre `#1D1833` en casi toda la app.
// Sin cromo —escribiendo, en los cierres, en una sesión de respiración— sí se
// ve el fondo de la pantalla, y ahí la paleta acierta. Lo aprobó la fundadora
// en el reporte previo de 21.1.
//
// | Situación                                        | Debajo              | Texto  |
// |--------------------------------------------------|---------------------|--------|
// | Arranque y umbral de apertura · mañana           | velo papel          | oscuro |
// | Arranque y umbral de apertura · noche            | velo índigo         | claro  |
// | Onboarding y presentación · mañana               | degradado claro     | oscuro |
// | Onboarding y presentación · noche                | índigo              | claro  |
// | Hoy · Mañana, con su recorrido                   | contratono #1D1833  | claro  |
// | Hoy · Noche, con su recorrido                    | cromo claro         | oscuro |
// | Hoy · «Respira un momento» · Mañana (sin cromo)  | degradado claro     | oscuro |
// | Hoy · «Respira un momento» · Noche (sin cromo)   | índigo              | claro  |
// | El buen deseo de la mañana (encima de todo)      | papel de la mañana  | oscuro |
// | «Buenas noches» (encima de todo)                 | noche               | claro  |
// | Journal · con candado y lista de entradas        | contratono          | claro  |
// | Journal · escribiendo (sin cromo)                | papel del espacio   | oscuro |
// | Respiración · configuración (y su hoja «Guardar»,| contratono          | claro  |
// |   que va en línea)                               |                     |        |
// | Respiración · sesión y su cierre (sin cromo; el  | papel del espacio   | oscuro |
// |   panel de ajustes es una hoja inferior)         |                     |        |
// | Historial · Tu perfil                            | contratono          | claro  |
// | Confirmación (modal a pantalla completa)         | papel del espacio   | oscuro |
//
// **Los recorridos de la mañana y de la noche no ocultan el cromo**: en Hoy,
// la navegación solo se retira para «Respira un momento». El buen deseo,
// «Buenas noches» y la confirmación se pintan encima de todo a pantalla
// completa, así que piden su propio color mientras están montados.
//
// **Lo que decide es una función pura** (`textoDeBarra`), probada fila por
// fila. Lo demás es fontanería: una pila, porque hay pantallas que se pintan
// encima de otras —la presentación sobre Hoy, el umbral sobre todo— y mientras
// están montadas mandan ellas; al irse, vuelve a mandar la de debajo.
//
// **En web no hace nada.** Ni siquiera llama al plugin: la barra de un
// navegador no es nuestra.

import { useEffect, useRef } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'
import { esNativa } from './plataforma.js'

/** Los dos colores de texto posibles, en nuestras palabras. */
export const TEXTO = Object.freeze({ claro: 'claro', oscuro: 'oscuro' })

/**
 * De qué color va el texto de la barra.
 *
 * @param {object} situacion
 * @param {'pantalla'|'secciones'|'modal'} situacion.capa
 *   `pantalla`: algo que ocupa la pantalla entera con el fondo de su momento —el
 *   velo del arranque y del umbral, el onboarding, la presentación, el buen
 *   deseo, «Buenas noches»—.
 *   `secciones`: las cinco secciones, con o sin cromo.
 *   `modal`: una confirmación a pantalla completa, sobre el papel del espacio.
 * @param {'manana'|'noche'} [situacion.momento] - Con `pantalla`.
 * @param {boolean} [situacion.cromo] - Con `secciones`: ¿se ve la cabecera?
 * @param {?('manana'|'noche')} [situacion.momentoHoy] - Con `secciones`: el
 *   momento que muestra Hoy, o `null` fuera de Hoy.
 * @returns {'claro'|'oscuro'}
 */
export function textoDeBarra({ capa, momento, cromo = false, momentoHoy = null }) {
  if (capa === 'modal') return TEXTO.oscuro

  if (capa === 'secciones') {
    const deNoche = momentoHoy === 'noche'
    // El cromo es oscuro en todas partes salvo en la Noche de Hoy, que lo
    // invierte. Sin cromo se ve el fondo: índigo en la Noche de Hoy, claro en
    // todo lo demás —la Mañana y el papel de las otras secciones—.
    if (cromo) return deNoche ? TEXTO.oscuro : TEXTO.claro
    return deNoche ? TEXTO.claro : TEXTO.oscuro
  }

  return momento === 'noche' ? TEXTO.claro : TEXTO.oscuro
}

/**
 * La traducción al plugin, que nombra el estilo por el fondo y no por el texto:
 * `Style.Dark` es «para fondos oscuros», o sea, **texto claro**. Al revés de lo
 * que parece, y por eso vive aquí y en ningún otro sitio.
 */
export function estiloDeCapacitor(texto) {
  return texto === TEXTO.claro ? Style.Dark : Style.Light
}

// ─── La pila ─────────────────────────────────────────────────────────────────

const pila = []
let base = null
let aplicado = null

/** El texto que manda ahora: el de lo último montado que ya dijo algo. */
export function textoVigente() {
  for (let i = pila.length - 1; i >= 0; i -= 1) {
    if (pila[i].texto) return pila[i].texto
  }
  return base
}

function aplicar() {
  const texto = textoVigente()
  if (!texto || texto === aplicado || !esNativa()) return
  aplicado = texto
  // Un fallo aquí no es de nadie: la hora sigue en su sitio, solo que de otro
  // color. Nada que contar (RN-EST-04).
  StatusBar.setStyle({ style: estiloDeCapacitor(texto) }).catch(() => {
    aplicado = null
  })
}

/**
 * Lo que vale cuando nadie más ha dicho nada: el velo de los dos instantes de
 * arranque, que se pintan antes de que monte ninguna pantalla. Lo fija
 * `main.jsx`.
 */
export function fijarBase(texto) {
  base = texto
  aplicar()
}

/**
 * Pide un color de texto mientras el componente esté montado.
 *
 * @param {'claro'|'oscuro'} texto - Normalmente, `textoDeBarra(...)`.
 */
export function useBarraDeEstado(texto) {
  const entrada = useRef(null)

  useEffect(() => {
    const propia = { texto: null }
    entrada.current = propia
    pila.push(propia)
    return () => {
      pila.splice(pila.indexOf(propia), 1)
      aplicar()
    }
  }, [])

  useEffect(() => {
    entrada.current.texto = texto
    aplicar()
  }, [texto])
}

/** Solo para las pruebas: vacía la pila y olvida lo aplicado. */
export function olvidarBarra() {
  pila.length = 0
  base = null
  aplicado = null
}
