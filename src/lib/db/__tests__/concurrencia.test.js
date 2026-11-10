// src/lib/db/__tests__/concurrencia.test.js
// Nada se pisa, con IndexedDB y con SQLite (SPEC_17B, DP-17B.8, criterio 2).
//
// Corre en los dos proyectos de `vitest.workspace.js` con la misma API pública
// de `local.js`: en `indexeddb` lo garantizan las transacciones de IndexedDB;
// en `sqlite`, el cerrojo del adaptador y los lotes del plugin.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  borrarUid,
  dequeueSiIgual,
  enqueue,
  listQueue,
  mergePath,
  mudarUid,
  readCollection,
  readPath,
  writePath,
  writePathIfAbsent,
} from '../local.js'
import { UID, resetLocalDB } from './helpers.js'

const RUTA = `users/${UID}/diario/morningEntry/items/2026-11-10`
const spec = { uid: UID, path: RUTA, collection: 'diario/morningEntry', id: '2026-11-10' }

beforeEach(resetLocalDB)
afterEach(resetLocalDB)

describe('dos escrituras a la vez no se pisan', () => {
  it('dos mergePath simultáneos sobre el mismo día conservan los dos campos', async () => {
    await Promise.all([
      mergePath({ ...spec, patch: { feelings: ['calma'] } }),
      mergePath({ ...spec, patch: { action: 'Caminar' } }),
    ])
    expect(await readPath(RUTA)).toEqual({ feelings: ['calma'], action: 'Caminar' })
  })

  it('veinte mergePath a la vez, veinte campos', async () => {
    await Promise.all(
      Array.from({ length: 20 }, (_, i) => mergePath({ ...spec, patch: { [`c${i}`]: i } })),
    )
    expect(Object.keys(await readPath(RUTA))).toHaveLength(20)
  })

  it('writePathIfAbsent no pisa una escritura que llega a la vez', async () => {
    const real = { name: 'Alejandra' }
    const perfil = {
      uid: UID,
      path: `users/${UID}/shared/profile`,
      collection: 'shared',
      id: 'profile',
    }
    const [, sembro] = await Promise.all([
      writePath({ ...perfil, data: real, sync: false }),
      writePathIfAbsent({ ...perfil, data: { name: null } }),
    ])
    expect(await readPath(perfil.path)).toEqual(real)
    expect(typeof sembro).toBe('boolean')
  })

  it('dequeueSiIgual no saca una revisión nueva escrita mientras viajaba', async () => {
    await enqueue({ uid: UID, path: RUTA, op: 'put', data: { action: 'vieja' } })
    const [enviada] = await listQueue(UID)
    await enqueue({ uid: UID, path: RUTA, op: 'put', data: { action: 'nueva' } })

    expect(await dequeueSiIgual(enviada)).toBe(false)
    const [queda] = await listQueue(UID)
    expect(queda.seq).toBe(enviada.seq)
    expect(queda.rev).toBe(enviada.rev + 1)
    expect(queda.data.action).toBe('nueva')
    expect(await dequeueSiIgual(queda)).toBe(true)
    expect(await listQueue(UID)).toHaveLength(0)
  })
})

describe('mudarUid y borrarUid', () => {
  const ORIGEN = 'local-origen'
  const DESTINO = 'cuenta-destino'
  const dia = (uid, fecha, data) => ({
    uid,
    path: `users/${uid}/diario/morningEntry/items/${fecha}`,
    collection: 'diario/morningEntry',
    id: fecha,
    data,
    sync: false,
  })

  it('sin política gana el destino y el origen se conserva bajo su uid', async () => {
    await writePath(dia(ORIGEN, '2026-11-01', { action: 'del origen' }))
    await writePath(dia(ORIGEN, '2026-11-02', { action: 'solo en el origen' }))
    await writePath(dia(DESTINO, '2026-11-01', { action: 'del destino' }))

    expect(await mudarUid(ORIGEN, DESTINO)).toEqual({ mudados: 1, conservados: 1 })
    expect((await readPath(dia(DESTINO, '2026-11-01').path)).action).toBe('del destino')
    expect((await readPath(dia(DESTINO, '2026-11-02').path)).action).toBe('solo en el origen')
    expect((await readPath(dia(ORIGEN, '2026-11-01').path)).action).toBe('del origen')
    expect(await readPath(dia(ORIGEN, '2026-11-02').path)).toBeNull()
  })

  it('con política decide fila a fila, también contra un destino vacío', async () => {
    await writePath(
      dia(ORIGEN, '2026-11-01', { action: 'gana', updatedAt: '2026-11-10T10:00:00.000Z' }),
    )
    await writePath(dia(ORIGEN, '2026-11-02', { action: 'se queda' }))
    await writePath(dia(DESTINO, '2026-11-01', { action: 'pierde' }))

    const politica = (_coleccion, origen) => origen.action === 'gana'
    expect(await mudarUid(ORIGEN, DESTINO, { politica })).toEqual({ mudados: 1, conservados: 1 })
    expect((await readPath(dia(DESTINO, '2026-11-01').path)).action).toBe('gana')
    expect(await readPath(dia(DESTINO, '2026-11-02').path)).toBeNull()
    expect((await readPath(dia(ORIGEN, '2026-11-02').path)).action).toBe('se queda')
    // Lo mudado se encola para la cuenta (una semilla no subiría: lleva su
    // marca); lo conservado, no.
    expect((await listQueue(DESTINO)).map((e) => e.path)).toEqual([dia(DESTINO, '2026-11-01').path])
  })

  it('borrarUid solo borra su uid, registros y cola', async () => {
    await writePath({ ...dia(ORIGEN, '2026-11-01', { a: 1 }), sync: true })
    await writePath({ ...dia(DESTINO, '2026-11-01', { b: 2 }), sync: true })

    expect(await borrarUid(ORIGEN)).toEqual({ registros: 1, cola: 1 })
    expect(await readCollection(ORIGEN, 'diario/morningEntry')).toEqual([])
    expect(await listQueue(ORIGEN)).toEqual([])
    expect(await readCollection(DESTINO, 'diario/morningEntry')).toHaveLength(1)
    expect(await listQueue(DESTINO)).toHaveLength(1)
  })
})
