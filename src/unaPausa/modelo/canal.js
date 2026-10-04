// src/unaPausa/modelo/canal.js
// La forma de `feed.json`: lo único que sale de `contenido/una-pausa/` hacia un
// teléfono.
//
// Es **el único sitio que sabe qué forma tiene el canal**. Lo escribe el script
// de Fase A (`scripts/publicar-pausa.js`), lo leerá la app en 28.3 y lo
// escribirá igual el servidor de Fase B: la app no cambia entre fases.
//
// Qué cápsula toca y qué hay en el archivo lo decide `vigente.js`; aquí solo se
// elige qué campos salen. **La lista es blanca**: un campo que no esté en
// `CAMPOS_PUBLICOS` no sale, aunque mañana se añada al modelo. Los editoriales
// —estado, quién revisó, cuándo se aprobó— no llegan nunca a la app (DP-28.15).

import { desde } from './estados.js'
import { validar } from './validar.js'
import { archivo, calendarioEfectivo, capsulaVigente } from './vigente.js'
import { lunesDe, restarDias } from './semana.js'

export const FORMATO_CANAL = 1

/** Lo que sale de una cápsula, en este orden. */
export const CAMPOS_PUBLICOS = Object.freeze([
  'id',
  'version',
  'theme',
  'title',
  'opening',
  'evidenceSummary',
  'keyFindings',
  'practiceDestination',
  'practiceLabel',
  'practiceText',
  'journalPrompt',
  'generatedWithAi',
])

/** Lo que sale de cada fuente. `reviewed` no: es una marca editorial. */
export const CAMPOS_PUBLICOS_DE_FUENTE = Object.freeze([
  'title',
  'authorsOrInstitution',
  'year',
  'originalUrl',
  'doi',
])

/**
 * Dónde van las portadas, relativo al canal. Relativo para que la vista previa
 * —que sirve su canal en el origen de la app— y producción se lean igual.
 */
export const CARPETA_DE_PORTADAS = 'portadas'

/** Ausente, `null`, `''` o `[]` no se escriben. `false` sí: es un dato. */
const vacio = (v) =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

function solo(objeto, campos) {
  const fuera = {}
  for (const campo of campos) {
    if (!vacio(objeto?.[campo])) fuera[campo] = objeto[campo]
  }
  return fuera
}

/**
 * Una cápsula tal como sale en el canal.
 * @param {object} capsula
 * @param {string|null} publicadaEl  El lunes en que apareció por primera vez.
 * @param {Set<string>} portadas     Las portadas que de verdad se van a copiar.
 */
function entrada(capsula, publicadaEl, portadas) {
  const fuera = solo(capsula, CAMPOS_PUBLICOS)
  if (!vacio(publicadaEl)) fuera.publicadaEl = publicadaEl
  const fuentes = (Array.isArray(capsula.sources) ? capsula.sources : []).map((f) =>
    solo(f, CAMPOS_PUBLICOS_DE_FUENTE),
  )
  if (fuentes.length > 0) fuera.fuentes = fuentes
  // Una portada que no se copia tampoco se nombra: el canal no apunta nunca a
  // un archivo que no está.
  if (portadas.has(capsula.coverAsset)) {
    fuera.portada = solo(
      { src: `${CARPETA_DE_PORTADAS}/${capsula.coverAsset}`, alt: capsula.coverAltText },
      ['src', 'alt'],
    )
  }
  return fuera
}

/**
 * La piloto que se enseña en la vista previa: `en_revision` o más adelante, y
 * pasando `validar`. Desde `en_revision` el validador exige la cápsula entera,
 * así que lo que se ve en el teléfono nunca es un borrador a medias. Con dos,
 * gana el id menor.
 */
function pilotoDeVistaPrevia(capsulas) {
  // El mismo orden que `vigente.js`: por punto de código, no por idioma.
  const porId = (a, b) => (String(a.id) > String(b.id)) - (String(a.id) < String(b.id))
  const [primera = null] = capsulas
    .filter((c) => c?.piloto === true && desde(c.status, 'en_revision'))
    .filter((c) => validar(c).faltas.length === 0)
    .sort(porId)
  return primera
}

/**
 * El archivo de la vista previa con la piloto dentro (DP-28.19): la misma
 * cápsula, con la semana anterior a la del canal como fecha, en su sitio de la
 * más reciente a la más antigua. **Si comparte fecha con una publicada, va
 * detrás**: la piloto nunca desplaza una publicación de verdad. Las claves
 * `YYYY-MM-DD` se comparan como texto, que es comparar fechas.
 */
function conPiloto(archivo, piloto) {
  const sitio = archivo.findIndex((e) => (e.publicadaEl ?? '') < piloto.publicadaEl)
  if (sitio === -1) return [...archivo, piloto]
  return [...archivo.slice(0, sitio), piloto, ...archivo.slice(sitio)]
}

/**
 * El canal de la semana de `ahora`.
 *
 * Con `vistaPrevia` —solo en los deploys de rama de la app (DP-28.16)— la
 * piloto válida va como vigente, con la semana del canal como fecha, y la
 * vigente calculada pasa a encabezar el archivo. **La piloto entra además en
 * el archivo** (DP-28.19), para recorrer en el teléfono el camino entero
 * —vigente, archivo, detalle— antes de que exista ninguna publicada. Sin
 * `vistaPrevia`, la piloto no aparece nunca: `vigente.js` ya la deja fuera.
 *
 * @param {object[]} capsulas
 * @param {Date|number|string} ahora
 * @param {{vistaPrevia?: boolean, portadas?: Iterable<string>}} [opciones]
 *   `portadas`: los `coverAsset` con archivo presente y válido. Solo esas se
 *   nombran; sin la opción, ninguna.
 */
export function generarCanal(capsulas, ahora, { vistaPrevia = false, portadas = [] } = {}) {
  const lista = Array.isArray(capsulas) ? capsulas : []
  const conArchivo = new Set(portadas)
  const semana = lunesDe(ahora)

  const primeraVez = new Map()
  for (const { weekStart, id } of calendarioEfectivo(lista, ahora)) {
    if (!primeraVez.has(id)) primeraVez.set(id, weekStart)
  }
  const publicada = (c) => entrada(c, primeraVez.get(c.id) ?? null, conArchivo)

  const vigente = capsulaVigente(lista, ahora)
  const anteriores = archivo(lista, ahora)

  const piloto = vistaPrevia ? pilotoDeVistaPrevia(lista) : null
  if (piloto !== null) {
    return {
      formato: FORMATO_CANAL,
      semana,
      vigente: entrada(piloto, semana, conArchivo),
      archivo: conPiloto(
        [vigente, ...anteriores].filter(Boolean).map(publicada),
        entrada(piloto, restarDias(semana, 7), conArchivo),
      ),
    }
  }

  return {
    formato: FORMATO_CANAL,
    semana,
    vigente: vigente === null ? null : publicada(vigente),
    archivo: anteriores.map(publicada),
  }
}

/**
 * Los `coverAsset` que el canal nombra. El script copia esas y ninguna otra.
 * @param {{vigente: object|null, archivo: object[]}} canal
 * @returns {string[]}
 */
export function portadasPublicadas(canal) {
  const prefijo = `${CARPETA_DE_PORTADAS}/`
  const nombres = [canal?.vigente, ...(canal?.archivo ?? [])]
    .map((e) => e?.portada?.src)
    .filter((src) => typeof src === 'string' && src.startsWith(prefijo))
    .map((src) => src.slice(prefijo.length))
  return [...new Set(nombres)].sort()
}
