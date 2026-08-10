import { closeLocalDB } from '../local.js'

export const UID = 'usuario-de-prueba'

/** Deja la base local vacía entre pruebas. */
export async function resetLocalDB() {
  await closeLocalDB()
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase('strivo')
    request.onsuccess = resolve
    request.onerror = resolve
    request.onblocked = resolve
  })
}
