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

export function entradaNueva(userId, fecha = strivoDayKey()) {
  const ahora = new Date().toISOString()
  return {
    id: newId(),
    userId,
    fecha,
    texto: '',
    creadoEn: ahora,
    actualizadoEn: ahora,
  }
}

/**
 * Guarda si hay algo que guardar. Devuelve la entrada guardada, o null si el
 * texto está en blanco: así el editor puede llamar a esto cuantas veces quiera
 * sin llenar el historial de entradas vacías.
 */
export async function guardarEntrada(entrada) {
  const texto = entrada.texto.trim()
  if (!texto) return null

  const guardada = { ...entrada, texto, actualizadoEn: new Date().toISOString() }
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
