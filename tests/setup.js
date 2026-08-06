// tests/setup.js
// Lo que el navegador da por hecho y Node no.
//
// Se corre en entorno node y no en jsdom a propósito: lo que se prueba aquí son
// las librerías de datos (@lib/*), que solo necesitan IndexedDB y localStorage.
// Montar un DOM entero para eso costaría más de lo que aporta.

import 'fake-indexeddb/auto'
import { beforeEach } from 'vitest'

// localStorage mínimo: el borrador del onboarding y los ids de usuario lo usan
class LocalStorageDePrueba {
  #datos = new Map()
  getItem(clave)        { return this.#datos.has(clave) ? this.#datos.get(clave) : null }
  setItem(clave, valor) { this.#datos.set(clave, String(valor)) }
  removeItem(clave)     { this.#datos.delete(clave) }
  clear()               { this.#datos.clear() }
}

globalThis.localStorage = new LocalStorageDePrueba()

// Cada prueba arranca con el almacén vacío: nada se hereda de la anterior
beforeEach(async () => {
  localStorage.clear()

  const { limpiarBaseDeDatos } = await import('./helpers/db.js')
  await limpiarBaseDeDatos()
})
