import { closeLocalDB } from '../local.js'
import { reiniciarAlmacenParaPruebas, usarAdaptador } from '../almacen.js'
import { almacenSQLiteDePruebas } from './dobleDeAlmacen.js'

export const UID = 'usuario-de-prueba'

/**
 * ¿Corre esta prueba sobre SQLite? Lo decide el proyecto `sqlite` de
 * `vitest.workspace.js` (SPEC_17B, criterio 2): las mismas pruebas, sin cambiar
 * lo que comprueban, contra los dos adaptadores.
 */
export const EN_SQLITE = process.env.STRIVO_ALMACEN === 'sqlite'

/** Deja la base local vacía entre pruebas: la de IndexedDB y, en el proyecto `sqlite`, una SQLite nueva. */
export async function resetLocalDB() {
  await closeLocalDB()
  reiniciarAlmacenParaPruebas()
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase('strivo')
    request.onsuccess = resolve
    request.onerror = resolve
    request.onblocked = resolve
  })
  if (EN_SQLITE) usarAdaptador((await almacenSQLiteDePruebas()).adaptador)
}
