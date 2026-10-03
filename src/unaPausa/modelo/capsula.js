// src/unaPausa/modelo/capsula.js
// La forma de una cápsula de Una pausa, y las constantes que la acompañan.
//
// `src/unaPausa/modelo/` es **el único sitio de las reglas editoriales** de Una
// pausa (SPEC_28 §4). Lo leen el script del canal (28.2), la pantalla (28.3) y,
// en Fase B, el servidor. Por eso es lógica pura: sin React, sin navegador, sin
// `fs`, sin red y sin alias de Vite. Todos sus imports son relativos y con
// extensión, para que Node los cargue con `import()` sin pasar por Vite.
//
// Los nombres de campo van en inglés, como el resto de los datos del repo
// (`lib/db/schema.js`); los identificadores de código, en español.

/**
 * Los nueve estados de una cápsula, en el orden del recorrido editorial.
 * `rechazada` es una salida lateral, no un paso más: va al final de la lista y
 * fuera del orden (`estados.js`, `nivelDe`).
 *
 * `publicada` y `archivada` existen en el tipo porque Fase B los escribirá. **En
 * Fase A no se escriben, se derivan**: una cápsula `programada` cuya semana
 * llegó es la publicada, y la anterior pasa al archivo (`vigente.js`).
 */
export const ESTADOS = Object.freeze([
  'tema_calendarizado',
  'borrador',
  'en_revision',
  'prevalidada',
  'aprobada',
  'programada',
  'publicada',
  'archivada',
  'rechazada',
])

/** A dónde lleva la única invitación de una cápsula. */
export const DESTINOS_DE_PRACTICA = Object.freeze(['breathing', 'journal', 'in_capsule'])

/** Las secciones que la editora marca como revisadas (DP-28.9, provisional). */
export const SECCIONES_REVISABLES = Object.freeze([
  'opening',
  'evidence',
  'practice',
  'prompt',
  'sources',
  'cover',
])

/**
 * Quién puede revisar y aprobar. **Identificadores, nunca un correo ni un
 * nombre completo**: el repo es público (DP-28.15).
 */
export const EDITORAS = Object.freeze(['fundadora'])

/** Dónde vive el canal (DP-28.3). Esta entrega solo la nombra. */
export const URL_CANAL = 'https://contenido.hellostrivo.com/una-pausa/feed.json'

/**
 * @typedef {object} Fuente
 * @property {string} title                 Título tal como se publicó. Se cita como es: el léxico no lo revisa.
 * @property {string} authorsOrInstitution
 * @property {number|null} year             `null` declarado si la fuente no tiene año.
 * @property {string} originalUrl           `https://`.
 * @property {string} [doi]                 Con forma `10.x/...`.
 * @property {boolean} reviewed             La editora abrió y leyó la fuente.
 */

/**
 * @typedef {object} WeeklyCapsule
 * @property {string} id
 * @property {number} version               Sube en cada cambio de texto. En Fase A, el historial es git.
 * @property {string} status                Uno de `ESTADOS`.
 * @property {string|null} weekStart        Clave `AAAA-MM-DD` de un lunes. `null` solo en reservas y en un tema sin fecha.
 * @property {string} theme
 * @property {string} title
 * @property {string} opening
 * @property {string} evidenceSummary
 * @property {string[]} keyFindings         Entre uno y tres.
 * @property {string} [practiceDestination] Uno de `DESTINOS_DE_PRACTICA`; va con `practiceLabel` o no va.
 * @property {string} [practiceLabel]
 * @property {string} [practiceText]        La práctica escrita, solo con `in_capsule`.
 * @property {string} [journalPrompt]       Una sola pregunta.
 * @property {Fuente[]} sources
 * @property {string} [coverAsset]
 * @property {string} [coverAltText]        Describe la escena, no la interpreta.
 * @property {boolean} [generatedWithAi]
 * @property {string} [generatedAt]         ISO 8601 con desfase, como todas las marcas de abajo.
 * @property {string} [reviewedBy]          Uno de `EDITORAS`.
 * @property {string} [reviewedAt]
 * @property {string[]} [reviewedSections]  Ids de `SECCIONES_REVISABLES`.
 * @property {string} [prevalidatedAt]
 * @property {string} [approvedBy]          Uno de `EDITORAS`.
 * @property {string} [approvedAt]
 * @property {string} [scheduledAt]
 * @property {boolean} [reserva]            Aprobada sin semana, para cubrir una semana vacía.
 * @property {boolean} [piloto]             Nunca sale en el canal ni en el archivo.
 */

/**
 * Los campos que existen. Uno fuera de la lista es una errata —«keyFinding»—
 * que de otro modo se ignoraría en silencio (`campo.desconocido`).
 */
export const CAMPOS = Object.freeze([
  'id',
  'version',
  'status',
  'weekStart',
  'theme',
  'title',
  'opening',
  'evidenceSummary',
  'keyFindings',
  'practiceDestination',
  'practiceLabel',
  'practiceText',
  'journalPrompt',
  'sources',
  'coverAsset',
  'coverAltText',
  'generatedWithAi',
  'generatedAt',
  'reviewedBy',
  'reviewedAt',
  'reviewedSections',
  'prevalidatedAt',
  'approvedBy',
  'approvedAt',
  'scheduledAt',
  'reserva',
  'piloto',
])

export const CAMPOS_DE_FUENTE = Object.freeze([
  'title',
  'authorsOrInstitution',
  'year',
  'originalUrl',
  'doi',
  'reviewed',
])

/** Las marcas de tiempo de una cápsula. */
export const MARCAS = Object.freeze([
  'generatedAt',
  'reviewedAt',
  'prevalidatedAt',
  'approvedAt',
  'scheduledAt',
])
