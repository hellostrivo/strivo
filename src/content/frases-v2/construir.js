// src/content/frases-v2/construir.js
// La forma de una frase del catálogo v2 y cómo se construye (SPEC_29 §8).
//
// **El catálogo es material editorial y vive separado de la lógica que lo
// elige.** Aquí no se decide qué frase toca hoy: eso es de
// `src/diario/fraseDelDia.js`. Aquí solo se dice qué es una frase.
//
// ─── Identificadores ──────────────────────────────────────────────────────────
//
// Cada frase original se escribe en su archivo de audiencia, dentro de la
// lista de su tema, y su id sale de esa posición: `F2-UNI-CAL-007` es la
// séptima frase de calma del repertorio universal. **Los ids son el contrato
// con lo ya asignado**: una asignación guardada en el dispositivo apunta a uno
// y tiene que seguir encontrándolo. Por eso:
//
//   · **Solo se añade al final de cada lista.** Insertar o reordenar dentro de
//     una lista cambiaría el id de todo lo que viene detrás.
//   · **Retirar no es borrar.** Una frase que ya no debe salir se lista en
//     `RETIRADAS` de su archivo; conserva el id y deja de ser elegible.
//
// Las citas no siguen esta regla: llevan su id escrito a mano, porque su
// identidad es su fuente y no su posición.

/** Versión del esquema del catálogo. Una asignación guardada la lleva consigo. */
export const CATALOGO_VERSION = 2

/**
 * Los cinco temas del ciclo, **en el orden en que rotan**. Es el mismo orden
 * del repertorio anterior, y no es indiferente: con esfuerzo al final, sus dos
 * vecinos son aceptación y gratitud, así que sustituirlo por calma con ánimo
 * bajo no pone dos días consecutivos del mismo tema.
 */
export const TEMAS = Object.freeze(['gratitud', 'calma', 'identidad', 'aceptacion', 'esfuerzo'])

/**
 * Matices dentro de un tema. No entran en el ciclo: sirven para ver de un
 * vistazo que el repertorio también habla de presencia, de esperanza serena,
 * de un optimismo con los pies en el suelo, de empatía y de amabilidad.
 */
export const SUBTEMAS = Object.freeze([
  'presencia',
  'esperanza_serena',
  'optimismo_realista',
  'empatia',
  'amabilidad',
])

/** Redacción propia de Strivo, o reproducción textual de una edición verificada. */
export const TIPOS = Object.freeze(['original', 'cita'])

/**
 * Solo `aprobada` llega a la app. `pendiente_revision` es una cita con el
 * texto verificado y la revisión editorial o jurídica sin firmar; `retirada`
 * es algo que salió y conserva su id.
 */
export const ESTADOS = Object.freeze(['aprobada', 'pendiente_revision', 'retirada'])

/** El tema que se retira cuando el ánimo reciente es bajo (§5.3, Bloque 1). */
export const TEMAS_DE_RENDIMIENTO = Object.freeze(['esfuerzo'])

const PREFIJO_AUDIENCIA = Object.freeze({
  universal: 'UNI',
  secular: 'SEC',
  espiritual_general: 'ESP',
  cristianismo: 'CRI',
  budismo: 'BUD',
  hinduismo: 'HIN',
  estoicismo: 'EST',
})

const PREFIJO_TEMA = Object.freeze({
  gratitud: 'GRA',
  calma: 'CAL',
  identidad: 'IDE',
  aceptacion: 'ACE',
  esfuerzo: 'ESF',
})

/** El id de la frase original número `n` (desde 1) de un tema y una audiencia. */
export function idDeOriginal(audiencia, tema, n) {
  return `F2-${PREFIJO_AUDIENCIA[audiencia]}-${PREFIJO_TEMA[tema]}-${String(n).padStart(3, '0')}`
}

/**
 * Construye las frases originales de una audiencia.
 *
 * Cada entrada es el texto, o `[texto, subtema]`. **Ninguna original lleva
 * comillas ni atribución**: es voz de Strivo, aunque una idea antigua la haya
 * inspirado, y atribuírsela a otra persona sería inventar una cita.
 *
 * Las frases de esfuerzo nunca son aptas con ánimo bajo. Las de otros temas lo
 * son salvo que se listen en `noAptas`: lo decide quien edita, frase a frase.
 *
 * @param {string} audiencia
 * @param {Record<string, Array<string|[string, string]>>} porTema
 * @param {{noAptas?: string[], retiradas?: string[]}} [opciones]
 */
export function originales(audiencia, porTema, { noAptas = [], retiradas = [] } = {}) {
  const frases = []
  for (const tema of TEMAS) {
    ;(porTema[tema] ?? []).forEach((entrada, i) => {
      const [texto, subtema = null] = Array.isArray(entrada) ? entrada : [entrada]
      const id = idDeOriginal(audiencia, tema, i + 1)
      frases.push(
        Object.freeze({
          id,
          catalogoVersion: CATALOGO_VERSION,
          texto,
          tema,
          subtema,
          tipo: 'original',
          audiencias: Object.freeze([audiencia]),
          estado: retiradas.includes(id) ? 'retirada' : 'aprobada',
          aptaConAnimoBajo: !TEMAS_DE_RENDIMIENTO.includes(tema) && !noAptas.includes(id),
          atribucion: null,
          fuenteClave: null,
        }),
      )
    })
  }
  return Object.freeze(frases)
}

/**
 * Una cita: su id, su fuente y su estado se escriben a mano. El texto es el de
 * la edición, carácter por carácter; las comillas las pone el componente.
 */
export function cita({
  id,
  texto,
  tema,
  subtema = null,
  audiencias,
  estado,
  aptaConAnimoBajo = true,
  atribucion,
  fuenteClave,
}) {
  return Object.freeze({
    id,
    catalogoVersion: CATALOGO_VERSION,
    texto,
    tema,
    subtema,
    tipo: 'cita',
    audiencias: Object.freeze([...audiencias]),
    estado,
    aptaConAnimoBajo: aptaConAnimoBajo && !TEMAS_DE_RENDIMIENTO.includes(tema),
    atribucion,
    fuenteClave,
  })
}
