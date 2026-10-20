// src/lib/db/__tests__/frasesLocales.test.js
// La preferencia de frases y las asignaciones viven solo en el dispositivo
// (SPEC_29 §7): no se encolan, no se suben al mudar el árbol y no se restauran.

import { readFileSync } from 'fs'
import { beforeEach, describe, expect, it } from 'vitest'

import { diario, initUserTree, mudarUid, shared } from '../index.js'
import { enqueue, esRutaLocal, listQueue, readPath } from '../local.js'
import { UID, resetLocalDB } from './helpers.js'

const ASIGNACION = {
  phraseId: 'F2-UNI-CAL-001',
  fecha: '2026-10-04',
  huella: 'h1-abcdef01',
  catalogoVersion: 2,
  asignadaEn: '2026-10-04T08:00:00.000Z',
}

describe('frases: datos locales', () => {
  beforeEach(resetLocalDB)

  it('guardar la preferencia y la asignación no encola nada hacia Firestore', async () => {
    await initUserTree(UID)
    const antes = (await listQueue(UID)).length
    await shared.saveFrasesPreferencias(UID, {
      modo: 'guiadas',
      afinidades: ['budismo'],
      version: 1,
    })
    await diario.saveFraseAsignada(UID, ASIGNACION)
    const cola = await listQueue(UID)
    expect(cola).toHaveLength(antes)
    expect(cola.some((e) => esRutaLocal(e.path))).toBe(false)
  })

  it('la cola rechaza estas rutas aunque alguien las encole a mano', async () => {
    await enqueue({ uid: UID, path: `users/${UID}/shared/frases`, op: 'put', data: {} })
    await enqueue({
      uid: UID,
      path: `users/${UID}/diario/frasesDelDia/items/2026-10-04~h1`,
      op: 'put',
      data: {},
    })
    expect(await listQueue(UID)).toEqual([])
  })

  it('reconoce las rutas locales y solo esas', () => {
    expect(esRutaLocal('users/u/shared/frases')).toBe(true)
    expect(esRutaLocal('users/u/diario/frasesDelDia/items/2026-10-04~h1')).toBe(true)
    expect(esRutaLocal('users/u/diario/pinConfig')).toBe(true)
    expect(esRutaLocal('users/u/shared/profile')).toBe(false)
    expect(esRutaLocal('users/u/shared/preferences')).toBe(false)
  })

  it('al mudar el árbol a una cuenta se muda en local y no sube', async () => {
    await initUserTree('local-1')
    await shared.saveFrasesPreferencias('local-1', {
      modo: 'seculares',
      afinidades: [],
      version: 1,
    })
    await diario.saveFraseAsignada('local-1', ASIGNACION)
    await mudarUid('local-1', 'cuenta-1')
    expect((await shared.getFrasesPreferencias('cuenta-1')).modo).toBe('seculares')
    const cola = await listQueue('cuenta-1')
    expect(cola.some((e) => esRutaLocal(e.path))).toBe(false)
  })

  it('restablecer borra la elección entera', async () => {
    await initUserTree(UID)
    await shared.saveFrasesPreferencias(UID, {
      modo: 'guiadas',
      afinidades: ['hinduismo'],
      version: 1,
    })
    await shared.clearFrasesPreferencias(UID)
    expect(await readPath(`users/${UID}/shared/frases`)).toBeNull()
  })

  it('la preferencia guarda lo mínimo: modo, afinidades, versión y sello', async () => {
    await initUserTree(UID)
    await expect(
      shared.saveFrasesPreferencias(UID, {
        modo: 'guiadas',
        afinidades: [],
        version: 1,
        motivo: 'x',
      }),
    ).rejects.toThrow(/UNKNOWN_FIELD|fuera del modelo/)
    const guardada = await shared.saveFrasesPreferencias(UID, {
      modo: 'guiadas',
      afinidades: ['budismo'],
      version: 1,
    })
    expect(Object.keys(guardada).sort()).toEqual(['afinidades', 'modo', 'updatedAt', 'version'])
  })

  it('la restauración no las baja: no están en su lista de rutas', () => {
    const fuente = readFileSync('src/lib/db/restaurar.js', 'utf8')
    expect(fuente).not.toMatch(/shared\/frases|frasesDelDia/)
  })
})
