// src/onboarding/identidad.js
// P4 — la identidad central: "Soy alguien que…".
//
// **No depende de áreas, y esa es la razón de que este archivo exista aparte.**
// En la implementación anterior la identidad terminó acoplada a un modelo de
// áreas que se filtró mucho más allá del onboarding, hasta las vistas del día.
// Aquí la identidad es una frase y nada más: no se combina, no se reparte y no
// tiene con qué cruzarse. Si algún día hace falta un `area` para pintarla, algo
// se está copiando del modelo viejo.
//
// Se guarda en `shared/profile.identidadCentral` y la lee el cierre (P8).
//
// **Los chips proponen y no rellenan a medias**: tocar uno escribe su texto en
// el campo, que sigue siendo editable. A partir de ahí es texto de la persona y
// **no vuelve a pasar por el resolutor de género** (RN-GEN-06): cambiar el
// género mañana no reescribe una frase que alguien ya hizo suya.

import { resolveGender } from '@copy/gender'

/**
 * El largo de la frase. Como el resto de límites del producto, es una
 * sugerencia y no una validación (RN-DB-07): se recorta y nada se pone en rojo.
 */
export const MAX_IDENTIDAD = 120

/** Recorta la frase sin transformarla de ninguna otra forma. */
export function recortar(texto) {
  return String(texto ?? '').slice(0, MAX_IDENTIDAD)
}

/** Lo que se guarda: la frase tal como se escribió, o `null` si no hay nada. */
export function paraGuardar(texto) {
  const frase = recortar(texto).trim()
  return frase === '' ? null : frase
}

/**
 * Los chips de sugerencia, ya resueltos al género del perfil.
 *
 * Solo el primero lleva marca de género; los demás están redactados para no
 * necesitarla, que es lo que evita mantener tres repertorios.
 *
 * @param {object} chips - `copy.diario.onboarding.p4.chips`
 * @param {'m'|'f'|'n'} genero
 * @returns {Array<{id: string, texto: string}>}
 */
export function chipsDe(chips, genero) {
  return Object.entries(chips ?? {}).map(([id, valor]) => ({
    id,
    texto: resolveGender(valor, genero),
  }))
}

/**
 * La frase, preparada para entrar en la plantilla del cierre.
 *
 * La plantilla ya termina en punto —"…alguien que {identidad}."— y los chips
 * también, así que sin esto el cierre saldría con dos. Se quita **uno** y solo
 * al pintar: lo guardado sigue siendo lo que la persona escribió, con su punto
 * si lo puso (RN-DB-02, nada se corrige en silencio).
 */
export function paraCierre(identidad) {
  return String(identidad ?? '')
    .trim()
    .replace(/\.$/, '')
}
