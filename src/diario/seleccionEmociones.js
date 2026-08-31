// src/diario/seleccionEmociones.js
// Mecánica de un catálogo emocional con palabra propia.
//
// La usan las tres preguntas emocionales del día: las dos de la mañana —"¿Cómo
// me siento esta mañana?" y "¿Cómo me gustaría sentirme durante el día de
// hoy?"— y la de la noche —"¿Cómo me siento al cerrar el día?"—.
//
// **Cuántas respuestas admite cada una es del catálogo, no de la mecánica**
// (27 ago 2026). Se llamaba `seleccionUnica.js` porque las tres admitían una;
// desde que las dos de la mañana admiten hasta tres, ese nombre habría dicho lo
// contrario de lo que hace. El número lo declara quien crea la selección
// (`MAXIMO`) y de ahí lo toman el componente que pinta los chips y el que
// guarda: un tope escrito en dos sitios se separa en cuanto alguien cambia uno.
//
// **La noche sigue admitiendo una y esa asimetría es la decisión** (§7): nombrar
// cómo se cierra el día no es hacer un inventario, y de esa respuesta se deriva
// el punto de ánimo del calendario. La mañana pregunta qué hay y hacia dónde
// acompañarse, y ninguna de las dos cosas es una sola casi nunca.
//
// Es distinto del catálogo del Journal (`emocionesJournal.js`), que admite tres
// y pide una sola palabra: aquí la respuesta propia es libre hasta 30
// caracteres y no se transforma. Por eso la mecánica vive aparte y no se
// reutiliza aquella: son dos reglas de palabra propia, no dos copias de la
// misma.
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
 * @param {{maximo?: number}} [opciones] - Cuántas respuestas admite la
 *   pregunta. Uno por defecto, que es lo que admite la noche.
 * @returns {object} las funciones de ese catálogo.
 */
export function crearSeleccion(textos, { maximo = 1 } = {}) {
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

  // ─── Cuando la pregunta admite varias ──────────────────────────────────────
  //
  // Las tres funciones de arriba siguen ahí porque la noche guarda **una**
  // respuesta y la lee como tal. Estas trabajan sobre una lista, que es lo que
  // la mañana guarda desde el 27 de agosto de 2026. No son otra mecánica: son
  // las mismas reglas —qué es seleccionable, qué se descarta al guardar, cómo
  // se lee lo guardado— aplicadas a más de una respuesta.

  /**
   * Toca una opción cuando la pregunta admite varias.
   *
   * **Al llegar al tope la lista se queda como está**, y la de más no entra.
   * Lo decidió el propietario del producto el 30 de agosto de 2026, sobre la
   * alternativa de dejarla entrar soltando la más antigua —que es lo que hace
   * el Journal (`emocionesJournal.js`)—: ahí las emociones etiquetan una
   * entrada ya escrita y cuál caiga da igual, aquí son la respuesta, y quitarle
   * a alguien de la lista algo que dijo de sí mismo para hacer sitio es peor
   * que no añadir lo cuarto.
   *
   * **Esto no es un bloqueo de los que §14 prohíbe.** Nada impide avanzar,
   * nada se marca en rojo y ningún chip se apaga: la pregunta se puede dejar en
   * blanco entera y las tres elegidas se sueltan tocándolas. Lo único que no
   * ocurre es que haya cuatro. `topeAlcanzado` lo dice para que la pantalla
   * pueda contarlo en voz baja —qué pasa, no qué se hizo mal—, porque un toque
   * que no responde y no explica nada se lee como una app rota.
   *
   * **Con `maximo` en uno la nueva sustituye a la anterior**, y no es una
   * excepción a lo de arriba: es lo mismo dicho donde solo cabe una respuesta.
   * Un tope de tres se alcanza —hay tres cosas dichas y una cuarta que no
   * cabe—; un tope de una no se alcanza nunca, porque tocar otra emoción de
   * cierre no es añadir, es cambiar de respuesta. Hacer que la noche exigiera
   * soltar antes de elegir sería pedir dos toques para corregirse.
   *
   * @returns {{seleccion: string[], topeAlcanzado: boolean}}
   */
  const alternarVarias = (seleccion, id) => {
    const actual = Array.isArray(seleccion) ? seleccion : []
    if (!esSeleccionable(id)) return { seleccion: actual, topeAlcanzado: false }

    if (actual.includes(id)) {
      return { seleccion: actual.filter((otra) => otra !== id), topeAlcanzado: false }
    }

    if (maximo === 1) return { seleccion: [id], topeAlcanzado: false }

    if (actual.length < maximo) return { seleccion: [...actual, id], topeAlcanzado: false }

    return { seleccion: actual, topeAlcanzado: true }
  }

  /**
   * Lo que de verdad se guarda de una pregunta de varias. Si se tocó "Algo más"
   * y no se escribió nada, esa selección se descarta —no se guarda un chip
   * vacío—, exactamente igual que en la de una.
   *
   * @returns {{valores: string[], otro: ?string}}
   */
  const paraGuardarVarias = (seleccion, propia) => {
    const palabra = recortarPropia(propia).trim()
    const valores = (Array.isArray(seleccion) ? seleccion : [])
      .filter((id) => esSeleccionable(id))
      .filter((id) => id !== ID_OTRA || palabra !== '')
      .slice(0, maximo)

    return { valores, otro: valores.includes(ID_OTRA) ? palabra : null }
  }

  /**
   * Cómo se leen varias respuestas guardadas: cada una con su texto y su emoji,
   * en el orden en que se eligieron.
   *
   * El emoji es `null` en la palabra propia y eso no es un hueco que rellenar:
   * §3 prohíbe asignarle uno. Las que no resuelven a nada —un id de una versión
   * anterior del catálogo— se caen aquí en vez de pintarse en blanco.
   *
   * @returns {Array<{texto: string, emoji: ?string}>}
   */
  const fichasDeRespuesta = (seleccion, otro, genero) =>
    (Array.isArray(seleccion) ? seleccion : [])
      .map((id) => ({ texto: etiquetaDeRespuesta(id, otro, genero), emoji: emojiDe(id) }))
      .filter((ficha) => ficha.texto !== '')

  return {
    CATALOGO,
    IDS,
    MAXIMO: maximo,
    es,
    esSeleccionable,
    etiquetaDe,
    emojiDe,
    alternar,
    paraGuardar,
    etiquetaDeRespuesta,
    alternarVarias,
    paraGuardarVarias,
    fichasDeRespuesta,
  }
}
