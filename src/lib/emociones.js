// src/lib/emociones.js
// Qué se quiere cultivar hoy (§22).
//
// La lista anterior mezclaba emociones que se quieren y emociones que se
// padecen: ofrecer "irritable" como algo a cultivar no tiene sentido y, en el
// peor caso, invita a anclarse en un estado del que la app debería ayudar a
// salir. Esta pantalla es de intención, no de diagnóstico.
//
// Mismo reparto que @lib/areas: el nombre visible vive en @copy —con sus
// variantes de género, que once de las quince necesitan— y aquí el orden, los
// ids y el emoji de cada una.
//
// Los emojis vienen de la referencia visual y no se sustituyen. Son decorativos:
// el nombre de la emoción es la información (§22.8).

export const EMOCIONES = [
  { id: 'orgullo',     emoji: '🦁' },
  { id: 'gratitud',    emoji: '🙏' },
  { id: 'amor',        emoji: '💗' },
  { id: 'compania',    emoji: '🤝' },
  { id: 'fe',          emoji: '🕊️' },
  { id: 'prosperidad', emoji: '🌱' },
  { id: 'paz',         emoji: '☮️' },
  { id: 'energia',     emoji: '⚡' },
  { id: 'alegria',     emoji: '😊' },
  { id: 'serenidad',   emoji: '🌊' },
  { id: 'confianza',   emoji: '🦋' },
  { id: 'plenitud',    emoji: '🌸' },
  { id: 'inspiracion', emoji: '💡' },
  { id: 'poder',       emoji: '🔥' },
  { id: 'radiante',    emoji: '✨' },
]

// "Otra" no es una emoción del catálogo: es el atajo para escribir la propia.
// Sin emoji y sin selector — el de §16 es para hábitos, que son permanentes;
// una emoción de hoy no justifica esa decisión (§22.6).
export const EMOCION_OTRA = 'otra'
export const OTRA_MAX_LENGTH = 30

// Las que se escriben a mano se guardan con este prefijo, para distinguirlas de
// un id del catálogo sin perder lo que la persona escribió.
export const PREFIJO_PROPIA = 'propia:'

export const esPropia = id => typeof id === 'string' && id.startsWith(PREFIJO_PROPIA)
export const textoDePropia = id => (esPropia(id) ? id.slice(PREFIJO_PROPIA.length) : null)
export const comoPropia = texto => `${PREFIJO_PROPIA}${texto.trim()}`

export const emojiDe = id => EMOCIONES.find(e => e.id === id)?.emoji ?? null

/**
 * El nombre visible de una emoción guardada.
 *
 * `t` es el resolvedor de @hooks/useCopy: hace falta porque once de las quince
 * cambian con el género. Lo que se escribió a mano se devuelve tal cual, y un id
 * que ya no esté en el catálogo —de una entrada vieja del historial— se devuelve
 * como está en vez de desaparecer.
 */
export function nombreDeEmocion(id, t) {
  if (esPropia(id)) return textoDePropia(id)
  if (EMOCIONES.some(e => e.id === id)) return t(`hoy.emociones.opciones.${id}`)
  return id
}
