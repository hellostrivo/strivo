// src/lib/emotions.js
// Catálogo de emociones de la Vista de Mañana (§5.3).
//
// Mismo reparto que @lib/areas: el nombre visible vive en @copy, el color en
// @tokens y el orden canónico aquí. Antes estaban los tres dentro del
// componente, y el copy no se podía revisar sin abrir un .jsx.
//
// Son 16 emociones curadas. El blueprint menciona una tabla de 24 en §3.9; las
// 8 que faltan no están en ninguna fuente del repo, así que el catálogo se
// queda en las 16 que sí existen hasta que aparezcan.

import { copy } from '@copy'
import { colors } from '@tokens'

// El color agrupa por familia, no por "buena" o "mala": ninguna emoción se
// pinta en rojo ni se presenta como un problema (§6.3).
const CATALOGO = [
  { id: 'tranquilo',   color: colors.sage },
  { id: 'agradecido',  color: colors.amber },
  { id: 'motivado',    color: colors.mist },
  { id: 'ansioso',     color: colors.clay },
  { id: 'cansado',     color: colors.plum },
  { id: 'esperanzado', color: colors.sage },
  { id: 'irritable',   color: colors.clay },
  { id: 'enfocado',    color: colors.mist },
  { id: 'triste',      color: colors.plum },
  { id: 'contento',    color: colors.amber },
  { id: 'abrumado',    color: colors.clay },
  { id: 'curioso',     color: colors.mist },
  { id: 'presente',    color: colors.sage },
  { id: 'inseguro',    color: colors.plum },
  { id: 'aliviado',    color: colors.sage },
  { id: 'nostalgico',  color: colors.plum },
]

export const EMOTIONS = CATALOGO.map(emocion => ({
  ...emocion,
  label: copy.emotions[emocion.id],
}))

export function getEmotionName(id) {
  return copy.emotions[id] ?? id
}
