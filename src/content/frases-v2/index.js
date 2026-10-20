// src/content/frases-v2/index.js
// El catálogo de frases del día, versión 2 (SPEC_29).
//
// Reúne las siete audiencias y las citas candidatas en una sola lista y
// responde a dos preguntas: qué frases existen (`FRASES_V2`, todas, también las
// pendientes y las retiradas) y cuáles puede ver un perfil (`elegiblesPara`,
// solo las aprobadas y compatibles). Qué frase toca cada día no se decide aquí:
// es de `src/diario/fraseDelDia.js`.
//
// El repertorio anterior (`../frases-del-dia.js`, 200 entradas) **sigue en el
// repo y no se toca**: es el que sabe resolver una asignación de la versión 1
// si alguna existiera, y retirarlo antes de tiempo dejaría sin respuesta lo
// que ya se vio (SPEC_29 §13).

import universal from './universal.js'
import secular from './secular.js'
import espiritual from './espiritual.js'
import cristianismo from './cristianismo.js'
import budismo from './budismo.js'
import hinduismo from './hinduismo.js'
import estoicismo from './estoicismo.js'
import citas from './citas.js'

export {
  CATALOGO_VERSION,
  ESTADOS,
  SUBTEMAS,
  TEMAS,
  TEMAS_DE_RENDIMIENTO,
  TIPOS,
} from './construir.js'

/** Todas las entradas del catálogo v2, en cualquier estado. */
export const FRASES_V2 = Object.freeze([
  ...universal,
  ...secular,
  ...espiritual,
  ...cristianismo,
  ...budismo,
  ...hinduismo,
  ...estoicismo,
  ...citas,
])

const POR_ID = new Map(FRASES_V2.map((frase) => [frase.id, frase]))

/** Una entrada por su id, en cualquier estado, o `null`. */
export function fraseV2PorId(id) {
  return POR_ID.get(id) ?? null
}

/** Las que pueden llegar a la app: aprobadas y nada más. */
export const APROBADAS = Object.freeze(FRASES_V2.filter((frase) => frase.estado === 'aprobada'))

/**
 * Las frases que un perfil puede ver: aprobadas y con al menos una audiencia
 * entre las suyas. `universal` está en todos los perfiles; las demás, solo en
 * el que las eligió (`src/referencias/preferencias.js`, `perfilDeFrases`).
 *
 * @param {string[]} audiencias
 */
export function elegiblesPara(audiencias, catalogo = APROBADAS) {
  return catalogo.filter((frase) => frase.audiencias.some((a) => audiencias.includes(a)))
}

/** Las citas aprobadas, para la vista de Fuentes de Tu perfil. */
export function citasAprobadas(catalogo = APROBADAS) {
  return catalogo.filter((frase) => frase.tipo === 'cita')
}

/**
 * Las cadenas de una frase que tienen que pasar el léxico de §3.6.
 *
 * Es la misma regla que en el repertorio anterior: **el texto de una cita no
 * se revisa** —es de una edición; corregirlo la dejaría de ser cita—, y la
 * atribución y el texto de las originales, sí. Vive junto a los datos porque
 * lo consumen `scripts/lint-copy.js` y `scripts/validar-frases.js`.
 */
export function revisablesDe(frase) {
  if (!frase) return []
  const texto = frase.tipo === 'cita' ? '' : frase.texto
  return [texto, frase.atribucion].filter((cadena) => typeof cadena === 'string' && cadena !== '')
}

export default FRASES_V2
