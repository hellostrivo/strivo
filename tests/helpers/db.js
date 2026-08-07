// tests/helpers/db.js
// Utilidades para dejar la base de datos en un estado conocido y para mirar
// dentro de ella sin pasar por las funciones que se están probando.

import { getDB } from '@lib/db'

const STORES = [
  'userProfile',
  'areas',
  'dailyEntries',
  'victories',
  'habits',
  'habitLogs',
  'journalEntries',
  'syncQueue',
  'appFlags',
]

export async function limpiarBaseDeDatos() {
  const db = await getDB()
  const tx = db.transaction(STORES, 'readwrite')
  await Promise.all(STORES.map(store => tx.objectStore(store).clear()))
  await tx.done
}

export async function filasDe(store) {
  const db = await getDB()
  return db.getAll(store)
}

export async function fila(store, id) {
  const db = await getDB()
  return db.get(store, id)
}

// Un hábito activo todos los días, para que la prueba no dependa del día en
// que se ejecute
export function habitoDePrueba(overrides = {}) {
  return {
    id: 'h-agua',
    userId: 'u1',
    nombre: 'Beber agua',
    areaId: null,
    momento: 'manana',
    diasSemana: [0, 1, 2, 3, 4, 5, 6],
    estado: 'activo',
    totalCompletados: 0,
    ...overrides,
  }
}

export function victoriaDePrueba(overrides = {}) {
  return {
    id: 'v1',
    userId: 'u1',
    fecha: '2026-08-05',
    texto: 'Llamar a mi hermana',
    areaId: null,
    estado: 'pendiente',
    ...overrides,
  }
}
