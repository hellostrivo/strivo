// src/lib/journal.js
// Journal — escritura libre (§5.8).
//
// Sin fricción quiere decir literalmente eso: no hay título, ni etiquetas, ni
// botón de guardar, ni confirmación al salir. Se abre, se escribe y ya está
// guardado. Una entrada en blanco no se guarda: abrir el editor y arrepentirse
// no deja rastro.

import { getJournalEntries, saveJournalEntry, getDB } from '@lib/db'
import { newId } from '@lib/user'
import { strivoDayKey } from '@lib/timeSlot'
import { normalizarEmocionesJournal, palabraPropiaDe } from '@lib/emocionesJournal'

export function entradaNueva(userId, fecha = strivoDayKey()) {
  const ahora = new Date().toISOString()
  return {
    id: newId(),
    userId,
    fecha,
    texto: '',
    // Cómo me siento (bloque 06). Ids, no rótulos: el rótulo cambia con el
    // género y el id no. La palabra escrita a mano viaja dentro de la lista con
    // el prefijo de @lib/propias.
    emociones: [],
    emocionOtra: '',
    creadoEn: ahora,
    actualizadoEn: ahora,
  }
}

/**
 * Guarda si hay algo que guardar. Devuelve la entrada guardada, o null si no
 * hay ni texto ni emociones: así el editor puede llamar a esto cuantas veces
 * quiera sin llenar el historial de entradas vacías.
 *
 * Elegir una emoción y no escribir nada también es haber registrado el día, así
 * que eso sí se guarda: la emoción no es un adorno del texto.
 */
export async function guardarEntrada(entrada) {
  const texto     = (entrada.texto ?? '').trim()
  const emociones = normalizarEmocionesJournal(entrada.emociones)
  if (!texto && emociones.length === 0) return null

  const guardada = {
    ...entrada,
    texto,
    emociones,
    // La palabra propia ya viaja dentro de `emociones`; esto es su copia en
    // claro, para poder leerla sin conocer el prefijo. Se recalcula siempre a
    // partir de la lista, que es la fuente.
    emocionOtra: palabraPropiaDe(emociones),
    actualizadoEn: new Date().toISOString(),
  }
  await saveJournalEntry(guardada)
  return guardada
}

export async function loadEntradas(userId) {
  return getJournalEntries(userId)
}

export async function loadEntradasDeFecha(userId, fecha) {
  const db = await getDB()
  return db.getAllFromIndex('journalEntries', 'byUserDate', [userId, fecha])
}

/**
 * Búsqueda simple por palabra: sin acentos, sin mayúsculas y por trozo de
 * palabra, para que "mañana" encuentre "Mañana" y "manana".
 */
export function buscar(entradas, consulta) {
  const termino = normalizar(consulta)
  if (!termino) return entradas
  return entradas.filter(entrada => normalizar(entrada.texto).includes(termino))
}

export function normalizar(texto) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quita los acentos
    .toLowerCase()
    .trim()
}

/** Las primeras palabras, para la lista */
export function resumen(texto, maximo = 140) {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  return limpio.length > maximo ? `${limpio.slice(0, maximo).trimEnd()}…` : limpio
}
