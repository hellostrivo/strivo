// src/lib/emocionesJournal.js
// Cómo me siento ahora — las emociones del Journal (bloque 06).
//
// POR QUÉ NO SON LAS DE @lib/emociones. La pregunta de la mañana (§22) es
// aspiracional: "¿Cómo me quiero sentir hoy?" ofrece solo lo que se puede
// cultivar, porque ofrecer "ansiosa" como algo a lo que aspirar no tiene
// sentido. El Journal pregunta otra cosa: qué está pasando ahora. Ahí sí caben
// la tristeza, la ansiedad y el cansancio, porque negarlas convierte el sitio
// donde se escribe lo difícil en un sitio donde solo cabe lo bueno.
//
// Son dos catálogos, dos títulos y dos límites. Comparten el componente de
// chips (@components/strivo/SelectorDeChips) y nada más: tocar uno no toca el
// otro.
//
// Mismo reparto que @lib/emociones y @lib/animos: el nombre visible vive en
// @copy —con sus variantes de género, que nueve de las quince necesitan— y aquí
// el orden, los ids y el emoji de cada una.
//
// SE GUARDA EL ID, NO EL RÓTULO. El rótulo cambia con el género ("Cansado" /
// "Cansada"); el id no. Una entrada escrita antes de cambiar de género se sigue
// leyendo igual (misma razón que la nota de @lib/animos).

import { comoPropia, esPropia, textoDePropia } from '@lib/propias'

export const EMOCIONES_JOURNAL = [
  { id: 'feliz',        emoji: '😊'  },
  { id: 'en_paz',       emoji: '😌'  },
  { id: 'gratitud',     emoji: '🙏'  },
  { id: 'energia',      emoji: '⚡'  },
  { id: 'amor',         emoji: '🥰'  },
  { id: 'fuerza',       emoji: '💪'  },
  { id: 'emocion',      emoji: '🤩'  },
  { id: 'esperanza',    emoji: '🌤️' },
  { id: 'neutral',      emoji: '😐'  },
  { id: 'tristeza',     emoji: '😔'  },
  { id: 'ansiedad',     emoji: '😰'  },
  { id: 'cansancio',    emoji: '😴'  },
  { id: 'frustracion',  emoji: '😤'  },
  { id: 'preocupacion', emoji: '😟'  },
  { id: 'melancolia',   emoji: '🌧️' },
]

// "Otra" no es una emoción del catálogo: es el botón con el "+" que abre el
// campo para escribir la propia, y por eso queda fuera de la lista de arriba.
export const EMOCION_JOURNAL_OTRA = 'otra'

// Tres, no dos. Un día rara vez se siente con una sola palabra —se puede estar
// agradecida, cansada y esperanzada a la vez— y aquí, que es el espacio del
// matiz, cabe una más que en el cierre de la noche. Al llegar al máximo las
// demás se atenúan y dejan de responder, sin aviso y sin error.
export const MAX_EMOCIONES_JOURNAL = 3

// Una palabra, y corta: el campo no es para explicarse, es para nombrar. Lo
// largo va en el propio journal, que está justo debajo.
export const OTRA_MAX_LENGTH = 20

export const emojiDeEmocionJournal = id =>
  EMOCIONES_JOURNAL.find(e => e.id === id)?.emoji ?? null

export const esEmocionJournalConocida = id =>
  id === EMOCION_JOURNAL_OTRA || EMOCIONES_JOURNAL.some(e => e.id === id)

/**
 * El nombre visible de una emoción guardada.
 *
 * `t` es el resolvedor de @hooks/useCopy: hace falta porque nueve de las quince
 * cambian con el género. Lo escrito a mano se devuelve tal cual, y un id que ya
 * no esté en el catálogo —de una entrada de hace meses— se devuelve como está
 * en vez de desaparecer de la pantalla.
 */
export function nombreDeEmocionJournal(id, t) {
  if (!id) return ''
  if (esPropia(id)) return textoDePropia(id)
  return esEmocionJournalConocida(id) ? t(`journal.emociones.opciones.${id}`) : id
}

/**
 * La selección de una entrada, siempre como lista y sin repetidos.
 *
 * Las entradas anteriores al bloque 06 no tienen el campo: se leen como una
 * lista vacía y se abren con el selector limpio. No se migra nada.
 */
export function normalizarEmocionesJournal(valor) {
  if (!Array.isArray(valor)) return []
  const vistos = new Set()
  return valor.filter(id => {
    if (typeof id !== 'string' || !id.trim()) return false
    // "Otra" a secas no representa ninguna emoción: o hay palabra, o no hay nada
    if (id === EMOCION_JOURNAL_OTRA) return false
    if (vistos.has(id)) return false
    vistos.add(id)
    return true
  })
}

/**
 * La palabra que se escribió a mano, si la hay.
 *
 * Viaja dentro de la propia lista con el prefijo de @lib/propias, igual que en
 * las otras dos preguntas de ánimo. Esto solo la saca aparte, para que se pueda
 * leer sin conocer el prefijo.
 */
export function palabraPropiaDe(emociones) {
  const propia = normalizarEmocionesJournal(emociones).find(esPropia)
  return propia ? textoDePropia(propia) : ''
}

export { comoPropia, esPropia, textoDePropia }
