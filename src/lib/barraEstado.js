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
// fila. Lo demás es la pila: hay pantallas que se pintan encima de otras —la
// presentación sobre Hoy, una confirmación sobre Tu perfil— y mientras están
// montadas mandan ellas; al irse, vuelve a mandar la de debajo.
//
// **Manda la capa, no el orden de montaje.** React monta los efectos de los
// hijos antes que los del padre, así que una confirmación que ya estaba dentro
// de las secciones al montarse se apunta *antes* que ellas: por orden de
// llegada quedaría debajo y, al abrirse, no mandaría. Por eso cada entrada
// declara su capa y gana la de más prioridad —modal, pantalla, secciones y, por
// debajo de todo, la base del arranque—; dentro de la misma capa, la última
// apuntada. La pila son funciones puras (`apuntar`, `actualizar`, `quitar`,
// `textoVigente`) y se prueba sin DOM.
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

/** Cuánto manda cada capa. La base del arranque va por debajo de todas. */
export const PRIORIDAD = Object.freeze({ secciones: 1, pantalla: 2, modal: 3 })

/** Apunta una entrada nueva, todavía sin capa ni texto. Devuelve otra pila. */
export function apuntar(pila, id) {
  return [...pila, { id, capa: null, texto: null }]
}

/** Cambia la capa y el texto de una entrada sin moverla de sitio. */
export function actualizar(pila, id, { capa, texto }) {
  return pila.map((entrada) => (entrada.id === id ? { ...entrada, capa, texto } : entrada))
}

/** Quita una entrada. */
export function quitar(pila, id) {
  return pila.filter((entrada) => entrada.id !== id)
}

/**
 * El texto que manda: el de la capa con más prioridad entre las que piden
 * algo; dentro de la misma capa, el de la última apuntada. Si nadie pide nada,
 * la base.
 *
 * @param {Array<{id: *, capa: ?string, texto: ?string}>} pila
 * @param {?string} base
 */
export function textoVigente(pila, base = null) {
  let ganadora = null
  for (const entrada of pila) {
    if (!entrada.texto) continue
    const prioridad = PRIORIDAD[entrada.capa] ?? 0
    // `>=` y no `>`: a igual capa, gana la que va después, que es la última
    // apuntada.
    if (ganadora === null || prioridad >= (PRIORIDAD[ganadora.capa] ?? 0)) ganadora = entrada
  }
  return ganadora?.texto ?? base
}

let pila = []
let base = null
let aplicado = null
let siguienteId = 0

function aplicar() {
  const texto = textoVigente(pila, base)
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
 * @param {?object} situacion - La misma que recibe `textoDeBarra`, que es de
 *   donde salen la capa y el texto. Con `null` el componente sigue montado pero
 *   no pide nada, y manda lo de debajo: es lo que hace una confirmación cerrada.
 */
export function useBarraDeEstado(situacion) {
  const capa = situacion?.capa ?? null
  const texto = situacion ? textoDeBarra(situacion) : null
  const propia = useRef(null)

  useEffect(() => {
    siguienteId += 1
    const id = siguienteId
    propia.current = id
    pila = apuntar(pila, id)
    return () => {
      pila = quitar(pila, id)
      aplicar()
    }
  }, [])

  useEffect(() => {
    pila = actualizar(pila, propia.current, { capa, texto })
    aplicar()
  }, [capa, texto])
}

/** Solo para las pruebas: vacía la pila y olvida lo aplicado. */
export function olvidarBarra() {
  pila = []
  base = null
  aplicado = null
}

/** Solo para las pruebas: lo que manda ahora en la pila del módulo. */
export function textoAplicable() {
  return textoVigente(pila, base)
}
