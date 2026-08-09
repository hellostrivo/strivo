// src/lib/propias.js
// Lo que la persona escribe con sus propias palabras dentro de un selector de
// chips (§22.6): la emoción que no está en la lista, el estado de cierre que no
// está en la lista.
//
// Vive aparte de @lib/emociones y de @lib/animos porque los dos lo usan igual, y
// porque el prefijo tiene que ser el mismo en los dos sitios: es lo que
// distingue un id del catálogo de una palabra escrita a mano, sin perder lo que
// se escribió.

export const PREFIJO_PROPIA = 'propia:'

export const esPropia = id => typeof id === 'string' && id.startsWith(PREFIJO_PROPIA)

export const textoDePropia = id => (esPropia(id) ? id.slice(PREFIJO_PROPIA.length) : null)

export const comoPropia = texto => `${PREFIJO_PROPIA}${texto.trim()}`
