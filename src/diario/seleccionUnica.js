// src/diario/seleccionUnica.js
// Mecánica de un catálogo de **selección única** con palabra propia.
//
// La usan las dos preguntas emocionales de la mañana: "¿Cómo me siento esta
// mañana?" y "¿Cómo me gustaría sentirme durante el día de hoy?". Las dos
// admiten **una** respuesta: nombrar un estado no es hacer un inventario, y la
// intención pierde su sentido si son tres a la vez.
//
// Es distinto del catálogo del Journal (`emocionesJournal.js`), que admite tres
// y pide una sola palabra: aquí la respuesta propia es libre hasta 30
// caracteres y no se transforma. Por eso la mecánica vive aparte y no se
// reutiliza aquella: son dos reglas de selección, no dos copias de la misma.
//
// Aquí no hay copy: este módulo recibe el catálogo ya construido. Lo que sale
// de `src/copy/index.js` lo enlaza `mananaEmociones.js`.
//
// RN-GEN-04 — Se persiste el `id`. La etiqueta se resuelve al pintar, así que
// cambiar el género del perfil reescribe también los días ya guardados. La
// palabra propia **no** pasa por el helper de género (RN-GEN-06): es de quien
// la escribió y no se corrige.

import { resolveGender } from '@copy/gender'

/** El id del chip que abre el campo de texto. No está en ningún catálogo. */
export const ID_OTRA = 'otra'

/** §3 — "un máximo aproximado de 30 caracteres". */
export const MAX_PALABRA_PROPIA = 30

/** Recorta la palabra propia sin transformarla de ninguna otra forma. */
export function recortarPropia(texto) {
  return String(texto ?? '').slice(0, MAX_PALABRA_PROPIA)
}

/** La palabra propia, lista para presentarse. Vacía si no hay nada escrito. */
export function etiquetaPropia(texto) {
  const palabra = recortarPropia(texto).trim()
  return palabra === '' ? '' : `«${palabra}»`
}

/**
 * Enlaza un catálogo del copy con su mecánica.
 *
 * @param {{catalogo: object[]}} textos - Nodo de copy con `catalogo`.
 * @returns {object} las funciones de ese catálogo.
 */
export function crearSeleccion(textos) {
  const CATALOGO = Object.freeze(textos.catalogo)
  const IDS = Object.freeze(CATALOGO.map((opcion) => opcion.id))

  const es = (id) => IDS.includes(id)
  const esSeleccionable = (id) => id === ID_OTRA || es(id)

  const porId = (id) => CATALOGO.find((opcion) => opcion.id === id) ?? null

  /** Etiqueta resuelta al género del perfil (RN-GEN-01). */
  const etiquetaDe = (id, genero) => {
    const opcion = porId(id)
    return opcion ? resolveGender(opcion.label, genero) : ''
  }

  /**
   * El emoji de una opción del catálogo, o `null`.
   *
   * `null` para la palabra propia, y no es un hueco que rellenar: §3 dice
   * expresamente que a una respuesta escrita a mano **no se le asigna emoji**.
   * Elegirle uno sería la app interpretando lo que alguien acaba de nombrar.
   */
  const emojiDe = (id) => porId(id)?.emoji ?? null

  /**
   * Toca una opción. Selección única: la nueva sustituye a la anterior, y
   * tocar la que ya estaba elegida la suelta —que es cómo se deja la pregunta
   * en blanco sin tener que borrar nada.
   */
  const alternar = (seleccion, id) => {
    if (!esSeleccionable(id)) return seleccion ?? null
    return seleccion === id ? null : id
  }

  /**
   * Lo que de verdad se guarda. Si se tocó "Algo más" y no se escribió nada,
   * la selección se descarta: no se guarda un chip vacío.
   *
   * @returns {{valor: ?string, otro: ?string}}
   */
  const paraGuardar = (seleccion, propia) => {
    const palabra = recortarPropia(propia).trim()
    if (seleccion === ID_OTRA) {
      return palabra === '' ? { valor: null, otro: null } : { valor: ID_OTRA, otro: palabra }
    }
    return esSeleccionable(seleccion)
      ? { valor: seleccion, otro: null }
      : { valor: null, otro: null }
  }

  /** Cómo se lee una respuesta ya guardada: del catálogo o entre comillas. */
  const etiquetaDeRespuesta = (seleccion, otro, genero) =>
    seleccion === ID_OTRA ? etiquetaPropia(otro) : etiquetaDe(seleccion, genero)

  return {
    CATALOGO,
    IDS,
    es,
    esSeleccionable,
    etiquetaDe,
    emojiDe,
    alternar,
    paraGuardar,
    etiquetaDeRespuesta,
  }
}
