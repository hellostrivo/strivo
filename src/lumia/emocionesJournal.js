// src/lumia/emocionesJournal.js
// Emociones del Journal: "¿Cómo me siento?" (§5.8.1).
//
// Son **quince y aquí sí están las difíciles**: Triste, Ansioso, Frustrado,
// Preocupado, Melancólico, Solo y Cansado. Este es el punto del producto donde
// caben los días malos, y ninguna de ellas lleva tratamiento de advertencia.
//
// Es un catálogo distinto del de la mañana (`emociones.js`) a propósito: la
// mañana pregunta **qué quieres cultivar** y por eso solo ofrece positivas en
// futuro; el Journal pregunta **qué hay** y tiene que poder recibir cualquier
// cosa. Dos catálogos, dos propósitos (§5.3.2).
//
// El chip "+ Otra" sigue exactamente las reglas de "Algo más" de §5.4.1: una
// sola palabra, 24 caracteres, sin transformar y sin pasar por el helper de
// género (RN-GEN-06). Cuenta como una de las tres selecciones.
//
// RN-GEN-04 — Se persiste el `id`. La etiqueta se resuelve al pintar, así que
// cambiar el género del perfil reescribe también las entradas ya guardadas.

import { copy } from '@copy'
import { resolveGender } from '@copy/gender'

const textos = copy.diario.journal.editor.emociones

/** Orden fijo, de las más ligeras a las más pesadas (§5.8.1). */
export const CATALOGO = Object.freeze(textos.catalogo)

export const IDS = Object.freeze(CATALOGO.map((emocion) => emocion.id))

/** §5.8.1 — Tres es el máximo. La cuarta entra y la más antigua sale. */
export const MAX_EMOCIONES = 3

/** El id del chip que abre un campo de texto. No está en el catálogo. */
export const ID_OTRA = 'otra'

/** Longitud máxima de la palabra propia (§5.4.1, "Algo más"). */
export const MAX_PALABRA = 24

export function esEmocion(id) {
  return IDS.includes(id)
}

/** ¿Es una selección válida, del catálogo o la palabra propia? */
export function esSeleccionable(id) {
  return id === ID_OTRA || esEmocion(id)
}

export function emocionPorId(id) {
  return CATALOGO.find((emocion) => emocion.id === id) ?? null
}

/** Etiqueta resuelta al género del perfil (RN-GEN-01: solo se lee desde aquí). */
export function etiquetaDe(id, genero) {
  const emocion = emocionPorId(id)
  return emocion ? resolveGender(emocion.label, genero) : ''
}

/**
 * Toca una emoción: la añade, la quita, o suelta la más antigua si ya hay tres.
 *
 * La cuarta selección **no se rechaza** y no produce ningún mensaje de error:
 * entra, y la primera sale con una animación suave (§5.8.1).
 *
 * @param {string[]} seleccion - Ids en orden de selección.
 * @param {string} id
 * @returns {{seleccion: string[], desplazada: string|null}}
 */
export function alternarEmocion(seleccion, id) {
  const actual = Array.isArray(seleccion) ? seleccion : []
  if (!esSeleccionable(id)) return { seleccion: actual, desplazada: null }

  if (actual.includes(id)) {
    return { seleccion: actual.filter((otra) => otra !== id), desplazada: null }
  }

  if (actual.length < MAX_EMOCIONES) {
    return { seleccion: [...actual, id], desplazada: null }
  }

  const [masAntigua, ...resto] = actual
  return { seleccion: [...resto, id], desplazada: masAntigua }
}

/**
 * "+ Otra" acepta **una** palabra y solo una: los espacios no crean una
 * segunda. Se guarda tal cual, sin autocorrección y sin helper de género.
 */
export function primeraPalabra(texto) {
  const limpio = String(texto ?? '').trim()
  if (limpio === '') return ''
  return limpio.split(/\s+/)[0].slice(0, MAX_PALABRA)
}

/**
 * Lo que de verdad se guarda. Si alguien tocó "+ Otra" y no escribió nada, la
 * selección se descarta: no se guarda un chip vacío (§5.4.1).
 *
 * @returns {{emotions: string[], otherText: string|null}}
 */
export function paraGuardar(seleccion, otra) {
  const palabra = primeraPalabra(otra)
  const emotions = (seleccion ?? [])
    .filter((id) => esSeleccionable(id))
    .filter((id) => id !== ID_OTRA || palabra !== '')
    .slice(0, MAX_EMOCIONES)

  return {
    emotions,
    otherText: emotions.includes(ID_OTRA) ? palabra : null,
  }
}

/**
 * La palabra propia, lista para presentarse: entrecomillada y sin transformar,
 * igual que en el estado de sueño (§5.4.1). Vacía si no hay palabra.
 *
 * **Este es el único sitio donde vive ese formato.** Lo leen la lista de
 * entradas y el propio chip "+ Otra", que es lo que hace que la palabra se
 * presente igual mientras se escribe y una vez guardada: dos formatos para lo
 * mismo acabarían separándose.
 */
export function etiquetaPropia(texto) {
  const palabra = primeraPalabra(texto)
  return palabra === '' ? '' : `«${palabra}»`
}

/**
 * Etiquetas para presentar una entrada guardada. La palabra propia va
 * entrecomillada y sin transformar, igual que en el estado de sueño (§5.4.1).
 */
export function etiquetasDe(seleccion, otra, genero) {
  return (seleccion ?? []).map((id) =>
    id === ID_OTRA ? etiquetaPropia(otra) : etiquetaDe(id, genero),
  )
}
