// src/unaPausa/modelo/validar.js
// Qué le falta a una cápsula para avanzar.
//
// Devuelve **códigos, no frases**: `{ codigo, campo }`. El texto para la
// editora lo pone el script del canal (28.2), así que aquí no hay una sola
// cadena visible (RN-TEC-02), y ningún código llega nunca a la app: las faltas
// son para quien edita, no para quien lee.
//
// Las reglas dependen del estado. Un `borrador` puede estar incompleto y solo
// se le revisa el léxico; desde `en_revision` se exige todo. `rechazada` se
// trata como un borrador: nunca se muestra. Lo que no depende del estado es la
// forma del archivo —campos que no existen, fechas mal escritas—, que se revisa
// siempre.
//
// Los avisos no bloquean: los decide la editora.
//
// `validarConjunto` mira lo que ninguna cápsula ve sola: dos con el mismo id, o
// dos programadas en la misma semana. `CODIGOS` es el catálogo de todo lo que
// el modelo puede devolver, para que quien pone las frases no se deje ninguno;
// una prueba de repo saca los literales de estos archivos y comprueba que están.

import { AMPLIADO, CLINICO, FORBIDDEN } from '../../lib/lexico.js'
import { contarPalabras } from '../../lib/palabras.js'
import {
  CAMPOS,
  CAMPOS_DE_FUENTE,
  DESTINOS_DE_PRACTICA,
  MARCAS,
  SECCIONES_REVISABLES,
} from './capsula.js'
import { coherente, desde } from './estados.js'
import { CODIGOS_DE_PORTADA } from './portada.js'
import {
  esClave,
  esLunes,
  esMarca,
  fechaEnZona,
  instanteEnZona,
  limiteValidacionFinal,
  restarDias,
} from './semana.js'

/**
 * Exención léxica temporal de Una pausa (DP-28.13). Son ids de reglas de
 * `CLINICO`: «estrés» y «ansiedad», con sus plurales —que esas dos reglas ya
 * no alcanzan—. Sus derivados («estresante», «ansioso») siguen dando falta,
 * porque son otras reglas.
 *
 * **Caduca con la adenda de la cápsula piloto**, que revisa los criterios. Ojo
 * al retirarla: una cápsula ya publicada que use estas palabras dejará de pasar
 * `validar` y saldrá del calendario y del archivo (límite de Fase A).
 */
export const EXENCION_UNA_PAUSA = Object.freeze(['ansiedad', 'estres'])

// Exportados para que los mensajes del canal los digan sin copiarlos.
export const MAX_PALABRAS = 320
export const MAX_HALLAZGOS = 3
export const MAX_CARACTERES_DE_PREGUNTA = 140

/**
 * El id es el nombre del archivo (`<id>.json`) y será una ruta de la app
 * (`/una-pausa/:id`): minúsculas, cifras y guiones sueltos.
 */
export const FORMA_DE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * `coverAsset` es el nombre de un archivo de `contenido/una-pausa/portadas/`, y
 * el script del canal lo copia de ahí. Sin carpetas ni puntos de más: un
 * `../algo` publicaría cualquier archivo del repo.
 */
export const FORMA_DE_PORTADA = /^[a-z0-9]+(-[a-z0-9]+)*\.webp$/

/** Lo que cuenta como lectura: las fuentes no. */
const CAMPOS_DE_LECTURA = [
  'title',
  'opening',
  'evidenceSummary',
  'keyFindings',
  'practiceLabel',
  'practiceText',
  'journalPrompt',
]

/** Lo que revisa el léxico: la lectura, la etiqueta y el texto accesible de la portada. */
const CAMPOS_DEL_LEXICO = [...CAMPOS_DE_LECTURA, 'theme', 'coverAltText']

const ENTRE_LETRAS = (cuerpo) =>
  new RegExp(`(?<![\\p{L}\\p{N}])(?:${cuerpo})(?![\\p{L}\\p{N}])`, 'iu')

/** Promesas de resultado. Un texto de evidencia acompaña; no asegura nada. */
const PROMESAS = Object.freeze([
  { id: 'garantiza', pattern: ENTRE_LETRAS('garantiz\\p{L}*') },
  { id: 'elimina', pattern: ENTRE_LETRAS('elimin\\p{L}*') },
  { id: 'comprobado-que', pattern: ENTRE_LETRAS('comprobad[oa]s?\\s+que') },
  { id: 'te-hara', pattern: ENTRE_LETRAS('te\\s+har[áa]n?') },
  { id: 'demostrado-que', pattern: ENTRE_LETRAS('demostrad[oa]s?\\s+que') },
  { id: 'esta-probado', pattern: ENTRE_LETRAS('est[áa]\\s+probad[oa]s?') },
  { id: 'te-vas-a-sentir', pattern: ENTRE_LETRAS('te\\s+vas\\s+a\\s+sentir') },
  { id: 'te-sentiras', pattern: ENTRE_LETRAS('te\\s+sentir[áa]s') },
])

/** Formas atenuadas: al menos una en `evidenceSummary`. */
const ATENUADAS = Object.freeze([
  ENTRE_LETRAS('sugier\\p{L}*'),
  ENTRE_LETRAS('se\\s+asoci\\p{L}*'),
  ENTRE_LETRAS('pued(?:e|en)'),
  ENTRE_LETRAS('podr[íi]\\p{L}*'),
  ENTRE_LETRAS('parec\\p{L}*'),
  ENTRE_LETRAS('tiend(?:e|en)'),
  ENTRE_LETRAS('se\\s+relacion\\p{L}*'),
])

// Las listas compartidas traen expresiones con `/g`, que guardan estado entre
// llamadas. Se copian una vez sin esa bandera y no se vuelven a tocar.
const sinEstado = (regla) =>
  Object.freeze({
    ...regla,
    pattern: new RegExp(regla.pattern.source, regla.pattern.flags.replace('g', '')),
  })

/** Una regla por id: las que están en FORBIDDEN y en CLINICO se cuentan una vez. */
function unaPorId(reglas) {
  const vistas = new Set()
  return reglas.filter((r) => !vistas.has(r.id) && vistas.add(r.id))
}

const LEXICO_QUE_BLOQUEA = unaPorId([
  ...FORBIDDEN,
  ...CLINICO,
  ...AMPLIADO.filter((r) => r.nivel === 'falta'),
])
  .filter((r) => !EXENCION_UNA_PAUSA.includes(r.id))
  .map(sinEstado)

const LEXICO_QUE_AVISA = AMPLIADO.filter((r) => r.nivel === 'aviso').map(sinEstado)

const EXCLAMACION = /[¡!]/u
const DOI = /^10\.\d{4,9}\/\S+$/
const HTTPS = /^https:\/\/\S+$/

const vacio = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
const texto = (v) => (typeof v === 'string' ? v.normalize('NFC') : '')

/** Los trozos de texto de esos campos, con la ruta de cada uno. */
function trozos(capsula, campos) {
  return campos.flatMap((campo) => {
    const valor = capsula[campo]
    if (Array.isArray(valor)) {
      return valor.map((v, i) => ({ campo: `${campo}[${i}]`, texto: texto(v) }))
    }
    return typeof valor === 'string' ? [{ campo, texto: texto(valor) }] : []
  })
}

function revisarForma(c, faltas) {
  // Siempre, también sin id: una cápsula sin id no tiene archivo ni ruta.
  if (typeof c.id !== 'string' || !FORMA_DE_ID.test(c.id)) {
    faltas.push({ codigo: 'id.forma', campo: 'id' })
  }
  if (!vacio(c.coverAsset) && !FORMA_DE_PORTADA.test(String(c.coverAsset))) {
    faltas.push({ codigo: 'portada.nombre', campo: 'coverAsset' })
  }
  for (const campo of Object.keys(c)) {
    if (!CAMPOS.includes(campo)) faltas.push({ codigo: 'campo.desconocido', campo })
  }
  if (Array.isArray(c.sources)) {
    c.sources.forEach((fuente, i) => {
      for (const campo of Object.keys(fuente ?? {})) {
        if (!CAMPOS_DE_FUENTE.includes(campo)) {
          faltas.push({ codigo: 'campo.desconocido', campo: `sources[${i}].${campo}` })
        }
      }
    })
  }
  if (Array.isArray(c.reviewedSections)) {
    c.reviewedSections.forEach((seccion, i) => {
      if (!SECCIONES_REVISABLES.includes(seccion)) {
        faltas.push({ codigo: 'campo.desconocido', campo: `reviewedSections[${i}]` })
      }
    })
  }
  if (!vacio(c.weekStart)) {
    if (!esClave(c.weekStart)) faltas.push({ codigo: 'fecha.forma', campo: 'weekStart' })
    else if (!esLunes(c.weekStart))
      faltas.push({ codigo: 'semana.no-es-lunes', campo: 'weekStart' })
  }
  for (const campo of MARCAS) {
    if (!vacio(c[campo]) && !esMarca(c[campo])) faltas.push({ codigo: 'fecha.forma', campo })
  }
}

function revisarLexico(c, faltas, avisos) {
  for (const { campo, texto: t } of trozos(c, CAMPOS_DEL_LEXICO)) {
    for (const regla of LEXICO_QUE_BLOQUEA) {
      if (regla.pattern.test(t)) faltas.push({ codigo: `lexico.${regla.id}`, campo })
    }
    if (EXCLAMACION.test(t)) faltas.push({ codigo: 'lexico.exclamacion', campo })
    for (const regla of LEXICO_QUE_AVISA) {
      if (regla.pattern.test(t)) avisos.push({ codigo: `lexico.${regla.id}`, campo })
    }
    for (const regla of PROMESAS) {
      if (regla.pattern.test(t)) avisos.push({ codigo: `promesa.${regla.id}`, campo })
    }
  }
  const resumen = texto(c.evidenceSummary)
  if (resumen.trim() !== '' && !ATENUADAS.some((p) => p.test(resumen))) {
    avisos.push({ codigo: 'atenuacion.falta', campo: 'evidenceSummary' })
  }
}

function revisarContenido(c, faltas) {
  for (const campo of ['title', 'opening', 'evidenceSummary', 'theme']) {
    if (vacio(c[campo])) faltas.push({ codigo: 'texto.falta', campo })
  }

  // La piloto no ocupa ninguna semana: solo se ve en la vista previa (DP-28.16).
  // Es lo único que se le exime; si trae semana, los plazos le rigen igual.
  if (vacio(c.weekStart) && c.reserva !== true && c.piloto !== true) {
    faltas.push({ codigo: 'semana.falta', campo: 'weekStart' })
  }

  const hallazgos = Array.isArray(c.keyFindings) ? c.keyFindings : []
  if (hallazgos.length < 1 || hallazgos.length > MAX_HALLAZGOS) {
    faltas.push({ codigo: 'hallazgos.cantidad', campo: 'keyFindings' })
  }
  hallazgos.forEach((h, i) => {
    if (vacio(h)) faltas.push({ codigo: 'texto.falta', campo: `keyFindings[${i}]` })
  })

  // Una sola invitación: destino y rótulo van juntos o no van, y la práctica
  // escrita existe solo si se practica dentro de la cápsula.
  const destino = c.practiceDestination
  const conDestino = !vacio(destino)
  const practicaIncompleta =
    conDestino !== !vacio(c.practiceLabel) ||
    (conDestino && !DESTINOS_DE_PRACTICA.includes(destino)) ||
    (destino === 'in_capsule') === vacio(c.practiceText)
  if (practicaIncompleta)
    faltas.push({ codigo: 'practica.incompleta', campo: 'practiceDestination' })

  if (!vacio(c.journalPrompt)) {
    const pregunta = texto(c.journalPrompt).trim()
    const cuenta = (signo) => pregunta.split(signo).length - 1
    // Una pregunta en español abre y cierra: «Qué me ocupa hoy?» no está bien
    // escrita, aunque termine en «?».
    const bienFormada =
      pregunta.endsWith('?') &&
      cuenta('?') === 1 &&
      cuenta('¿') === 1 &&
      [...pregunta].length <= MAX_CARACTERES_DE_PREGUNTA
    if (!bienFormada) faltas.push({ codigo: 'pregunta.forma', campo: 'journalPrompt' })
  }

  const fuentes = Array.isArray(c.sources) ? c.sources : []
  if (fuentes.length === 0) faltas.push({ codigo: 'fuentes.falta', campo: 'sources' })
  fuentes.forEach((f, i) => {
    const fuente = f ?? {}
    const ruta = (campo) => `sources[${i}].${campo}`
    for (const campo of ['title', 'authorsOrInstitution']) {
      if (vacio(fuente[campo])) faltas.push({ codigo: 'fuentes.incompleta', campo: ruta(campo) })
    }
    if (!(fuente.year === null || Number.isInteger(fuente.year))) {
      faltas.push({ codigo: 'fuentes.incompleta', campo: ruta('year') })
    }
    if (typeof fuente.originalUrl !== 'string' || !HTTPS.test(fuente.originalUrl)) {
      faltas.push({ codigo: 'fuentes.incompleta', campo: ruta('originalUrl') })
    }
    if (!vacio(fuente.doi) && !DOI.test(String(fuente.doi))) {
      faltas.push({ codigo: 'fuentes.doi', campo: ruta('doi') })
    }
  })

  const lectura = trozos(c, CAMPOS_DE_LECTURA)
    .map((t) => t.texto)
    .join('\n')
  if (contarPalabras(lectura) > MAX_PALABRAS) faltas.push({ codigo: 'lectura.larga', campo: null })
}

function revisarPrevalidacion(c, faltas) {
  const fuentes = Array.isArray(c.sources) ? c.sources : []
  fuentes.forEach((f, i) => {
    if (f?.reviewed !== true) {
      faltas.push({ codigo: 'fuentes.sin-revisar', campo: `sources[${i}].reviewed` })
    }
  })
  for (const campo of ['coverAsset', 'coverAltText']) {
    if (vacio(c[campo])) faltas.push({ codigo: 'portada.falta', campo })
  }
  // Cuatro semanas: el día de Monterrey de la prevalidación, en o antes del
  // lunes de publicación menos 28 días. Las claves se comparan como texto.
  if (esLunes(c.weekStart) && esMarca(c.prevalidatedAt)) {
    if (fechaEnZona(c.prevalidatedAt) > restarDias(c.weekStart, 28)) {
      faltas.push({ codigo: 'plazo.cuatro-semanas', campo: 'prevalidatedAt' })
    }
  }
}

function revisarAprobacion(c, faltas) {
  if (esLunes(c.weekStart) && esMarca(c.approvedAt)) {
    if (Date.parse(c.approvedAt) > limiteValidacionFinal(c.weekStart)) {
      faltas.push({ codigo: 'plazo.validacion-final', campo: 'approvedAt' })
    }
  }
}

function revisarProgramacion(c, faltas) {
  // Programar es decir qué se publica un lunes, y se dice antes de que llegue:
  // una semana que ya empezó no se programa hacia atrás (límite de Fase A).
  if (esLunes(c.weekStart) && esMarca(c.scheduledAt)) {
    if (Date.parse(c.scheduledAt) > instanteEnZona(c.weekStart)) {
      faltas.push({ codigo: 'plazo.programada-tarde', campo: 'scheduledAt' })
    }
  }
}

/** Sin repetir la misma falta en el mismo campo. */
function unicas(lista) {
  const vistas = new Set()
  return lista.filter((f) => {
    const clave = `${f.codigo}|${f.campo}`
    return !vistas.has(clave) && vistas.add(clave)
  })
}

/**
 * @param {import('./capsula.js').WeeklyCapsule} capsula
 * @returns {{faltas: {codigo: string, campo: string|null}[], avisos: {codigo: string, campo: string|null}[]}}
 */
export function validar(capsula) {
  const c = capsula !== null && typeof capsula === 'object' ? capsula : {}
  const estado = c.status
  const faltas = []
  const avisos = []

  revisarForma(c, faltas)

  if (desde(estado, 'borrador') || estado === 'rechazada') revisarLexico(c, faltas, avisos)
  if (desde(estado, 'en_revision')) revisarContenido(c, faltas)
  if (desde(estado, 'prevalidada')) revisarPrevalidacion(c, faltas)
  if (desde(estado, 'aprobada')) revisarAprobacion(c, faltas)
  if (desde(estado, 'programada')) revisarProgramacion(c, faltas)

  faltas.push(...coherente(c))

  return { faltas: unicas(faltas), avisos: unicas(avisos) }
}

/** ¿Pasa? Atajo para quien solo necesita saber eso. */
export function esValida(capsula) {
  return validar(capsula).faltas.length === 0
}

/**
 * Lo que solo se ve mirando todas las cápsulas a la vez. `campo` es el id de la
 * cápsula afectada: un choque nombra a las dos.
 * @param {object[]} capsulas
 * @returns {{faltas: {codigo: string, campo: string}[]}}
 */
export function validarConjunto(capsulas) {
  const lista = (Array.isArray(capsulas) ? capsulas : []).filter(
    (c) => c !== null && typeof c === 'object' && !vacio(c.id),
  )
  const faltas = []

  const vecesPorId = new Map()
  for (const { id } of lista) vecesPorId.set(id, (vecesPorId.get(id) ?? 0) + 1)
  for (const [id, veces] of vecesPorId) {
    if (veces > 1) faltas.push({ codigo: 'conjunto.id-repetido', campo: id })
  }

  // Dos programadas en la misma semana. La piloto no ocupa semana.
  const programadas = lista.filter(
    (c) => c.status === 'programada' && c.piloto !== true && !vacio(c.weekStart),
  )
  for (const c of programadas) {
    if (programadas.some((otra) => otra !== c && otra.weekStart === c.weekStart)) {
      faltas.push({ codigo: 'conjunto.choque', campo: c.id })
    }
  }

  return { faltas: unicas(faltas) }
}

/** Los ids de las promesas, para quien pone una frase a cada `promesa.<id>`. */
export const IDS_DE_PROMESA = Object.freeze(PROMESAS.map((p) => p.id))

/**
 * Las dos familias de códigos que se forman con un id: `lexico.<id>` (los ids
 * de `lib/lexico.js`) y `promesa.<id>` (`IDS_DE_PROMESA`).
 */
export const PREFIJOS = Object.freeze(['lexico.', 'promesa.'])

/**
 * Todo código fijo que el modelo puede devolver: el validador, la coherencia
 * de estados, el conjunto y la portada. `lexico.exclamacion` va aquí porque no
 * es una regla de `lexico.js`.
 */
export const CODIGOS = Object.freeze([
  'estado.desconocido',
  'estado.derivado-en-fase-a',
  'estado.reserva-con-semana',
  'estado.generado-sin-fecha',
  'estado.editora-desconocida',
  'estado.revision-incompleta',
  'estado.revision-antes-de-generar',
  'estado.sin-aprobar',
  'estado.sin-programar',
  'id.forma',
  'campo.desconocido',
  'fecha.forma',
  'semana.no-es-lunes',
  'semana.falta',
  'lexico.exclamacion',
  'atenuacion.falta',
  'texto.falta',
  'hallazgos.cantidad',
  'practica.incompleta',
  'pregunta.forma',
  'fuentes.falta',
  'fuentes.incompleta',
  'fuentes.doi',
  'fuentes.sin-revisar',
  'lectura.larga',
  'portada.falta',
  'portada.nombre',
  'plazo.cuatro-semanas',
  'plazo.validacion-final',
  'plazo.programada-tarde',
  'conjunto.id-repetido',
  'conjunto.choque',
  ...CODIGOS_DE_PORTADA,
])
