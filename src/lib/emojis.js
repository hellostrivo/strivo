// src/lib/emojis.js
// Símbolos de los hábitos (§16 del documento de cambios v2.0, Parte 4A).
//
// Una lista de texto plano se lee como un formulario; un hábito con su símbolo
// se lee como algo tuyo. El emoji es además lo que hace reconocible cada hábito
// de un vistazo cuando el texto compite con otros elementos.
//
// Criterios de la selección:
// - Objetos y naturaleza antes que caras: una cara carga una emoción concreta
//   que puede chocar con cómo se siente la persona ese día; un objeto es neutro.
// - Ni personas, ni partes del cuerpo (evita el asunto del tono de piel), ni
//   banderas, ni símbolos religiosos.
// - Nada más reciente que Unicode 11 (2018): lo que se añadió después sale como
//   una caja vacía en dispositivos que no lo soportan.
//
// El catálogo es corto a propósito. Mil opciones convierten una decisión de dos
// segundos en una tarea y abren la puerta a símbolos que rompen el tono.
//
// Los nombres visibles de cada símbolo viven en @copy (habitos.emoji.names).

// El que traen los hábitos propios antes de tocar nada. Un hueco vacío se lee
// como un campo obligatorio pendiente; esto se lee como algo que se puede
// cambiar si se quiere. Elegir símbolo es opcional siempre.
export const EMOJI_POR_DEFECTO = '✨'

export const EMOJI_CATEGORIAS = [
  { id: 'movimiento', emojis: ['👟', '⚽', '🏀', '🚲', '🎾', '🥾', '🛹', '⛰️'] },
  { id: 'descanso',   emojis: ['🌙', '🛏️', '💤', '🕯️', '☁️', '🧸', '🛁', '🌜'] },
  { id: 'mente',      emojis: ['💡', '📖', '📝', '🎯', '🔍', '🧩', '✏️', '📚'] },
  { id: 'casa',       emojis: ['🏠', '🧹', '🌵', '🧺', '🔑', '🛋️', '🧽', '🚿'] },
  { id: 'comida',     emojis: ['💧', '🍎', '🥗', '🍵', '🥑', '🍋', '🥕', '☕'] },
  { id: 'naturaleza', emojis: ['🌿', '🌱', '🌳', '🌊', '☀️', '🌻', '🍃', '🌷'] },
  { id: 'simbolos',   emojis: ['✨', '⭐', '🔥', '💫', '🎵', '🎨', '💬', '🕊️'] },
]

export const EMOJIS = EMOJI_CATEGORIAS.flatMap(categoria => categoria.emojis)
