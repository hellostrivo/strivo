// src/diario/exportar.js
// Los días, para el archivo de «Llevarme lo que escribí» (SPEC_24A).
//
// **Devuelve datos, no Markdown.** Qué bloques tiene un día, en qué orden y con
// qué pregunta delante lo deciden los mismos que lo deciden en pantalla —una
// regla, un sitio—:
//
//   - la mañana y la noche de hoy, `resumenDeManana` y `resumenDeNoche`, que
//     son lo que pintan las dos consultas: la pregunta delante de cada
//     respuesta, que es el diferenciador del producto;
//   - los campos de versiones anteriores, `bloquesHeredadosDeManana` y
//     `bloquesHeredadosDeNoche`, que son lo que pinta el Historial, con sus
//     rótulos propios (RN-HIS-07);
//   - el journal, con la hora y las emociones como en la vista de día.
//
// **Nada de lo escrito se cae.** Los resúmenes omiten la pausa de la mañana y
// la reflexión de la noche cuando su pregunta no se puede reconstruir —sin
// `reflectionId`, o ligada a una mañana que ya no tiene intención—; en
// pantalla no pasa nada, porque el Historial las rotula aparte, pero el
// archivo no puede perderlas. Aquí salen con el rótulo del Historial («Tu
// pausa», «Tu reflexión»).
//
// Cada bloque lleva además, para el `.json`, los identificadores de lo que se
// eligió con su rótulo al lado, en el género de la persona.

import { copy } from '@copy'
import {
  PREGUNTAS as MANANA,
  animosDeManana,
  bloquesHeredadosDeManana,
  fichasDeAnimo,
  fichasDeIntencion,
  hayAlgoEscrito as hayAlgoDeManana,
  hayReflexion as hayPausa,
  intencionesDeManana,
  resumenDeManana,
} from './manana.js'
import {
  PREGUNTAS as NOCHE,
  bloquesHeredadosDeNoche,
  emocionesDeCierre,
  fichasDeCierre,
  hayAlgoEscrito as hayAlgoDeNoche,
  hayReflexion,
  resumenDeNoche,
} from './noche.js'
import {
  ID_OTRA as OTRA_JOURNAL,
  etiquetaDe as etiquetaJournal,
  etiquetaPropia,
  etiquetasDe as etiquetasJournal,
} from './emocionesJournal.js'
import { etiquetaDe as etiquetaHeredada } from './emociones.js'
import { horaDe } from './journal.js'
import { fechaLarga } from './fechas.js'

const rotulos = () => copy.diario.historial.dia

/** `[{ id, rotulo }]`: lo elegido, con el rótulo que se lee en pantalla. */
function conRotulo(ids, rotuloDe) {
  return (ids ?? []).map((id) => ({ id, rotulo: rotuloDe(id) ?? null }))
}

function texto(valor) {
  return String(valor ?? '').trim()
}

/** Los identificadores de un bloque de fichas, para el `.json`. */
function emocionesDe(bloque, entrada, genero) {
  switch (bloque.id) {
    case MANANA.animo:
      return conRotulo(
        animosDeManana(entrada),
        (id) =>
          fichasDeAnimo({ feelings: [id], feelingOther: entrada.feelingOther }, genero)[0]?.texto,
      )
    case MANANA.intencion:
      return conRotulo(
        intencionesDeManana(entrada),
        (id) =>
          fichasDeIntencion({ intentions: [id], intentionOther: entrada.intentionOther }, genero)[0]
            ?.texto,
      )
    case NOCHE.emocion:
      return conRotulo(
        emocionesDeCierre(entrada),
        (id) =>
          fichasDeCierre(
            { closingFeelings: [id], closingFeelingOther: entrada.closingFeelingOther },
            genero,
          )[0]?.texto,
      )
    case 'emociones':
      return conRotulo(entrada.emotions, (id) => etiquetaHeredada(id, genero))
    default:
      return undefined
  }
}

function conEmociones(bloques, entrada, genero) {
  return bloques.map((bloque) => {
    if (bloque.forma !== 'chip') return bloque
    return { ...bloque, emociones: emocionesDe(bloque, entrada, genero) }
  })
}

/** Los bloques de una mañana, en el orden en que se leen. */
export function bloquesDeManana(entrada, genero) {
  if (!hayAlgoDeManana(entrada)) return []
  const bloques = resumenDeManana(entrada, genero)
  if (hayPausa(entrada) && !bloques.some((b) => b.id === MANANA.pausa)) {
    bloques.push({
      id: MANANA.pausa,
      titulo: rotulos().pausa,
      forma: 'texto',
      numerado: false,
      fichas: [],
      lineas: [texto(entrada.reflection)],
    })
  }
  bloques.push(...bloquesHeredadosDeManana(entrada, genero))
  return conEmociones(bloques, entrada, genero)
}

/** Los bloques de una noche. La reflexión ligada a la mañana necesita esa mañana. */
export function bloquesDeNoche(entrada, morning, genero, fecha) {
  if (!hayAlgoDeNoche(entrada)) return []
  const bloques = resumenDeNoche(entrada, morning, genero, fecha)
  if (hayReflexion(entrada) && !bloques.some((b) => b.id === NOCHE.reflexion)) {
    // Va donde iría la reflexión: detrás del reconocimiento.
    const despues = bloques.findIndex((b) => b.id === NOCHE.reconocimiento) + 1
    bloques.splice(despues, 0, {
      id: NOCHE.reflexion,
      titulo: rotulos().reflexion,
      forma: 'texto',
      numerado: false,
      fichas: [],
      lineas: [texto(entrada.reflection)],
    })
  }
  bloques.push(...bloquesHeredadosDeNoche(entrada, genero))
  return conEmociones(bloques, entrada, genero)
}

/** Una entrada del journal, con la hora y las emociones de la vista de día. */
export function entradaDeJournal(entrada, genero) {
  const emociones = (entrada.emotions ?? [])
    .filter((id) => id !== OTRA_JOURNAL)
    .map((id) => ({ id, rotulo: etiquetaJournal(id, genero) || null }))
  const propia = (entrada.emotions ?? []).includes(OTRA_JOURNAL)
    ? etiquetaPropia(entrada.otherText)
    : ''
  return {
    id: entrada.id ?? null,
    creadaEn: entrada.createdAt ?? null,
    actualizadaEn: entrada.updatedAt ?? null,
    hora: horaDe(entrada),
    texto: String(entrada.text ?? ''),
    emociones,
    emocionPropia: propia || null,
    // En el orden en que se eligieron, como en la vista de día.
    etiquetas: etiquetasJournal(entrada.emotions, entrada.otherText, genero).filter(Boolean),
  }
}

function porCreacion(a, b) {
  return String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''))
}

/**
 * Todos los días con algo escrito, de más antiguo a más reciente.
 *
 * @param {object} registros
 * @param {Array<{fecha: string, data: object}>} registros.mananas
 * @param {Array<{fecha: string, data: object}>} registros.noches
 * @param {object[]} registros.journal - entradas con su campo `date`.
 * @param {'m'|'f'|'n'} genero
 * @returns {Array<{fecha, titulo, manana, noche, journal}>}
 */
export function diasParaExportar({ mananas = [], noches = [], journal = [] }, genero) {
  const porFecha = new Map()
  const dia = (fecha) => {
    if (!porFecha.has(fecha)) porFecha.set(fecha, { fecha, manana: null, noche: null, journal: [] })
    return porFecha.get(fecha)
  }
  for (const { fecha, data } of mananas) dia(fecha).manana = data
  for (const { fecha, data } of noches) dia(fecha).noche = data
  for (const entrada of journal) {
    if (typeof entrada?.date === 'string' && entrada.date !== '')
      dia(entrada.date).journal.push(entrada)
  }

  return [...porFecha.values()]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map(({ fecha, manana, noche, journal: entradas }) => {
      const deManana = manana ? bloquesDeManana(manana, genero) : []
      const deNoche = noche ? bloquesDeNoche(noche, manana, genero, fecha) : []
      return {
        fecha,
        titulo: fechaLarga(fecha) || fecha,
        manana: manana ? { registro: manana, bloques: deManana } : null,
        noche: noche ? { registro: noche, bloques: deNoche } : null,
        journal: [...entradas].sort(porCreacion).map((e) => entradaDeJournal(e, genero)),
      }
    })
    .filter((d) => d.manana || d.noche || d.journal.length > 0)
}

/**
 * El día como partes del `.md`: «Tu mañana», «Tu noche» y «Lo que escribiste»,
 * con los rótulos del Historial. Lo que no tiene contenido no aparece.
 */
export function partesDelDia(diaExportado) {
  const textos = rotulos()
  const partes = []
  if (diaExportado.manana?.bloques.length) {
    partes.push({ titulo: textos.manana, bloques: diaExportado.manana.bloques })
  }
  if (diaExportado.noche?.bloques.length) {
    partes.push({ titulo: textos.noche, bloques: diaExportado.noche.bloques })
  }
  if (diaExportado.journal.length > 0) {
    partes.push({
      titulo: textos.journal,
      entradas: diaExportado.journal.map((e) => ({
        encabezado: e.hora,
        detalle: e.etiquetas.join(' · '),
        texto: e.texto,
      })),
    })
  }
  return partes
}
