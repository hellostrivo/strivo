// src/lumia/journal.js
// El Journal: escritura libre, sin preguntas y sin estructura (§5.8).
//
// Es el contrapeso del Diario. Si el Diario es la conversación guiada, el
// Journal es el silencio disponible: aquí el sistema no sugiere nada, no
// corrige nada y no comenta nada (RN-JR-03).
//
// RN-DB4-01 — Ni un dato de Formia. RN-02 — Local-first: se escribe en
// IndexedDB al instante y la red va detrás.
//
// **Lo que el modelo canónico no guarda, y por eso no se construye:** título,
// etiquetas `#`, ánimo por entrada, adjuntos y plantillas. `FIELDS.journal` de
// SPEC_02 es exhaustivo —`date, text, emotions, otherText, createdAt,
// updatedAt`— y rechaza cualquier otro campo al escribir. Si alguna de esas
// piezas de §5.8 vuelve, se amplía SPEC_02 §5 primero.

import { lumia, shared, strivoDateKey } from '@/lib/db'
import { etiquetasDe, paraGuardar } from './emocionesJournal.js'

/** RN-JR-01 — Ninguna entrada se elimina automáticamente jamás. */
export const BORRADO_AUTOMATICO = false

/** La fecha a la que pertenece este momento, según el perfil (RN-DB-01). */
export async function fechaDeHoy(uid) {
  return strivoDateKey(await shared.getDiaTerminaA(uid))
}

/** Una entrada en blanco: lo que abre el editor al pulsar "Escribir". */
export function entradaNueva(fecha) {
  return { id: null, date: fecha, text: '', emotions: [], otherText: null }
}

/**
 * ¿Está vacía? Una entrada sin texto **y** sin emociones no se guarda (§5.8).
 * Con solo emociones o con solo texto, sí (§5.8.1, criterio 4).
 */
export function esVacia(entrada) {
  const conTexto = String(entrada?.text ?? '').trim() !== ''
  const conEmociones = (entrada?.emotions ?? []).length > 0
  return !conTexto && !conEmociones
}

/** Lo escrito, de lo más reciente a lo más antiguo. */
export async function listar(uid) {
  return lumia.listJournalEntries(uid)
}

export async function cargarDeDia(uid, fecha) {
  return lumia.listJournalEntriesByDate(uid, fecha)
}

/**
 * Guarda una entrada: la crea si es nueva, la actualiza si ya existe y la borra
 * si se quedó sin nada.
 *
 * Borrar la que se vació no contradice RN-JR-01: lo que esa regla protege es lo
 * escrito, y una entrada sin texto ni emociones nunca llegó a ser una entrada.
 * Es la misma distinción que separa vaciar una fila de victoria de "dejarla ir".
 *
 * @param {string} uid
 * @param {{id: ?string, date: string, text: string, emotions: string[], otherText: ?string}} entrada
 * @returns {Promise<object|null>} la entrada guardada, o `null` si se borró.
 */
export async function guardar(uid, entrada) {
  const { emotions, otherText } = paraGuardar(entrada.emotions, entrada.otherText)
  const datos = {
    date: entrada.date,
    text: String(entrada.text ?? ''),
    emotions,
    otherText,
  }

  if (esVacia(datos)) {
    if (entrada.id) await lumia.deleteJournalEntry(uid, entrada.id)
    return null
  }

  if (entrada.id) return lumia.updateJournalEntry(uid, entrada.id, datos)
  return lumia.createJournalEntry(uid, datos)
}

/** Borrar a mano una entrada que sí existió. Solo lo pide quien la escribió. */
export async function borrar(uid, entryId) {
  if (!entryId) return
  await lumia.deleteJournalEntry(uid, entryId)
}

// ─── Presentación ─────────────────────────────────────────────────────────────

/** La primera línea, que es lo que la tarjeta enseña (§5.8, wireframe). */
export function extractoDe(entrada, maximo = 120) {
  const texto = String(entrada?.text ?? '').trim()
  if (texto === '') return ''
  const primera = texto.split('\n').find((linea) => linea.trim() !== '') ?? ''
  return primera.length > maximo ? `${primera.slice(0, maximo).trimEnd()}…` : primera
}

/** 'HH:MM' de cuándo se escribió. Se registra sola y no se edita (§5.8). */
export function horaDe(entrada) {
  const marca = entrada?.createdAt
  if (!marca) return ''
  const fecha = new Date(marca)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ─── Agrupación de la lista ───────────────────────────────────────────────────
// El wireframe de §5.8 agrupa por cercanía: HOY, ESTA SEMANA y después por mes.
// Un grupo vacío no se pinta: la lista nunca enseña un hueco.

const LOCALE = 'es'

function claveDeMes(fecha) {
  return String(fecha ?? '').slice(0, 7)
}

function nombreDeMes(clave) {
  const [year, month] = clave.split('-').map(Number)
  if (!year || !month) return ''
  const fecha = new Date(year, month - 1, 1, 12, 0, 0)
  const texto = fecha.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/**
 * Reparte las entradas en grupos con título.
 *
 * "Esta semana" son los seis días anteriores a hoy, no la semana del calendario:
 * lo que importa es la cercanía a quien lee, no dónde cayó el lunes.
 *
 * @param {object[]} entradas - Ya ordenadas de más reciente a más antigua.
 * @param {string} hoy - Clave de fecha del día en curso.
 * @param {{hoy: string, semana: string}} titulos
 * @returns {Array<{id: string, titulo: string, entradas: object[]}>}
 */
export function agrupar(entradas, hoy, titulos) {
  const lista = Array.isArray(entradas) ? entradas : []
  const limiteSemana = restarDias(hoy, 6)

  const deHoy = lista.filter((entrada) => entrada.date === hoy)
  const deLaSemana = lista.filter((entrada) => entrada.date < hoy && entrada.date >= limiteSemana)
  const anteriores = lista.filter((entrada) => entrada.date < limiteSemana)

  const grupos = []
  if (deHoy.length > 0) grupos.push({ id: 'hoy', titulo: titulos.hoy, entradas: deHoy })
  if (deLaSemana.length > 0) {
    grupos.push({ id: 'semana', titulo: titulos.semana, entradas: deLaSemana })
  }

  const porMes = new Map()
  anteriores.forEach((entrada) => {
    const clave = claveDeMes(entrada.date)
    if (!porMes.has(clave)) porMes.set(clave, [])
    porMes.get(clave).push(entrada)
  })
  porMes.forEach((delMes, clave) => {
    grupos.push({ id: clave, titulo: nombreDeMes(clave), entradas: delMes })
  })

  return grupos
}

/** Resta días a una clave de fecha sin pasar por `new Date(cadena)` (UTC). */
function restarDias(dateKey, dias) {
  const [year, month, day] = String(dateKey ?? '')
    .split('-')
    .map(Number)
  if (!year || !month || !day) return dateKey
  const fecha = new Date(year, month - 1, day, 12, 0, 0)
  fecha.setDate(fecha.getDate() - dias)
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Búsqueda ─────────────────────────────────────────────────────────────────

/** Sin acentos y en minúsculas: buscar "melancolia" encuentra "melancolía". */
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Búsqueda simple sobre el texto y las emociones de cada entrada.
 *
 * Las emociones entran por su etiqueta resuelta al género, no por su id: quien
 * busca "triste" no sabe ni tiene por qué saber cómo se llama el campo dentro.
 *
 * @param {object[]} entradas
 * @param {string} consulta
 * @param {'m'|'f'|'n'} genero
 */
export function buscar(entradas, consulta, genero) {
  const aguja = normalizar(consulta)
  if (aguja === '') return entradas
  return (entradas ?? []).filter((entrada) => {
    const etiquetas = etiquetasDe(entrada.emotions, entrada.otherText, genero).join(' ')
    return normalizar(`${entrada.text ?? ''} ${etiquetas}`).includes(aguja)
  })
}
