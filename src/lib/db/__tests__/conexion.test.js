// src/lib/db/__tests__/conexion.test.js
// La conexión local se suelta cuando alguien pide borrar la base (DP-17.12).
//
// Sin `blocking`, `deleteDatabase('strivo')` con la app abierta se quedaba en
// `blocked` para siempre y sin avisar, y las peticiones colgadas detrás
// congelaban cualquier transacción posterior de esa página. `fake-indexeddb`
// emite `versionchange` en el borrado igual que un navegador, así que aquí se
// puede afirmar lo que el criterio 1 pide comprobar a mano en consola.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { closeLocalDB, getLocalDB, readPath, writePath } from '../local.js'
import { UID, resetLocalDB } from './helpers.js'

const RUTA = `users/${UID}/shared/profile`

/** Pide borrar la base y dice por qué evento terminó. */
function borrar() {
  return new Promise((resolve, reject) => {
    const peticion = indexedDB.deleteDatabase('strivo')
    let bloqueada = false
    peticion.onblocked = () => {
      bloqueada = true
    }
    peticion.onsuccess = () => resolve({ resultado: 'success', bloqueada })
    peticion.onerror = () => reject(peticion.error)
  })
}

/** Que una promesa no se quede esperando para siempre, que es justo el fallo. */
function conPlazo(promesa, ms = 500) {
  return Promise.race([
    promesa,
    new Promise((_, reject) => setTimeout(() => reject(new Error('colgada')), ms)),
  ])
}

beforeEach(resetLocalDB)
afterEach(resetLocalDB)

describe('DP-17.12: borrar la base con la conexión abierta', () => {
  it('criterio 1: deleteDatabase resuelve por success, no se queda en blocked', async () => {
    await getLocalDB()
    await writePath({ uid: UID, path: RUTA, collection: 'shared', id: 'profile', data: { a: 1 } })

    const { resultado } = await conPlazo(borrar())

    expect(resultado).toBe('success')
    const bases = await indexedDB.databases()
    expect(bases.some((b) => b.name === 'strivo')).toBe(false)
  })

  it('criterio 2: la siguiente lectura reabre la base sin colgarse, y está vacía', async () => {
    await getLocalDB()
    await writePath({ uid: UID, path: RUTA, collection: 'shared', id: 'profile', data: { a: 1 } })
    await conPlazo(borrar())

    expect(await conPlazo(readPath(RUTA))).toBeNull()
    // Y se puede volver a escribir: la app sigue funcionando.
    await conPlazo(
      writePath({ uid: UID, path: RUTA, collection: 'shared', id: 'profile', data: { a: 2 } }),
    )
    expect((await readPath(RUTA)).a).toBe(2)
  })

  it('la conexión que se soltó no es la que se usa después: getLocalDB da una nueva', async () => {
    const antes = await getLocalDB()
    await conPlazo(borrar())
    const despues = await getLocalDB()
    expect(despues).not.toBe(antes)
  })

  it('criterio 4: closeLocalDB sigue igual, y borrar después de cerrar también resuelve', async () => {
    await getLocalDB()
    await closeLocalDB()
    const { resultado, bloqueada } = await conPlazo(borrar())
    expect(resultado).toBe('success')
    expect(bloqueada).toBe(false)
    // Idempotente: cerrar sin conexión no falla.
    await closeLocalDB()
  })
})
