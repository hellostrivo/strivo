// src/lib/db/__tests__/sync.test.js
// La cola de sincronización (RN-02, criterio 5 de SPEC_02).
//
// **Revisión del paso 8 del plan de separación técnica (25 ago 2026).** La regla
// que custodia este archivo **no cambia**: se guarda en local al instante, la red
// es asíncrona, y lo escrito sin red sale una sola vez al volver. Lo único que
// cambia es el dato de partida — el caso 5 poblaba el árbol con una identidad y
// un hábito marcado dos veces, y esa rama del árbol ya no existe.
//
// El dato nuevo conserva la forma del viejo, que es lo que hacía útil al caso:
// dos escrituras sobre **la misma ruta** que tienen que colapsar en una sola
// entrada de cola y en una sola escritura a Firestore.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as shared from '../shared.js'
import * as lumia from '../lumia.js'
import { listQueue } from '../local.js'
import { cancelRetries, flush } from '../sync.js'
import { UID, resetLocalDB } from './helpers.js'

// Firestore de mentira: registra lo que recibe para poder contarlo.
const escrituras = []
const borrados = []
let falla = false

vi.mock('../../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: async (ref, data) => {
    if (falla) throw new Error('sin red')
    escrituras.push({ path: ref.path, data })
  },
  deleteDoc: async (ref) => {
    if (falla) throw new Error('sin red')
    borrados.push(ref.path)
  },
}))

function conRed(online) {
  vi.stubGlobal('navigator', { onLine: online })
}

beforeEach(async () => {
  escrituras.length = 0
  borrados.length = 0
  falla = false
  await resetLocalDB()
  conRed(true)
})

afterEach(() => {
  cancelRetries()
  vi.unstubAllGlobals()
})

describe('cola local-first (RN-02)', () => {
  it('una escritura encola exactamente una entrada por ruta', async () => {
    await lumia.saveMorningEntry(UID, '2026-08-10', { action: 'Salir a caminar.' })
    const queue = await listQueue(UID)

    expect(queue).toHaveLength(1)
    expect(queue[0].path).toBe('users/usuario-de-prueba/lumia/morningEntry/items/2026-08-10')
    expect(queue[0].op).toBe('put')
  })

  it('cinco escrituras sobre la misma ruta dejan una entrada con el último estado', async () => {
    for (const texto of ['a', 'b', 'c', 'd', 'e']) {
      await lumia.saveMorningEntry(UID, '2026-08-10', { action: texto })
    }

    const queue = await listQueue(UID)
    expect(queue).toHaveLength(1)
    expect(queue[0].data.action).toBe('e')
  })
})

describe('criterio 5: sin red se guarda en local y se sincroniza al volver', () => {
  it('la escritura persiste con la red caída y sale una sola vez al volver', async () => {
    conRed(false)

    await shared.initShared(UID, { profile: { name: 'Alejandra' } })
    await lumia.saveMorningEntry(UID, '2026-08-10', { feeling: 'calma' })
    await lumia.saveMorningEntry(UID, '2026-08-10', { action: 'Salir a caminar.' })

    // Lo escrito está a salvo aunque la red no exista, y las dos escrituras
    // parciales sobre el mismo día se han fundido en un solo registro.
    expect((await shared.getProfile(UID)).name).toBe('Alejandra')
    expect(await lumia.getMorningEntry(UID, '2026-08-10')).toMatchObject({
      feeling: 'calma',
      action: 'Salir a caminar.',
    })

    const sinRed = await flush(UID)
    expect(sinRed).toMatchObject({ sent: 0, skipped: 'sin_red' })
    expect(escrituras).toHaveLength(0)

    const pendientesAntes = await listQueue(UID)
    expect(pendientesAntes.length).toBeGreaterThan(0)

    // Vuelve la red.
    conRed(true)
    const conRedResult = await flush(UID)

    expect(conRedResult.pending).toBe(0)
    expect(await listQueue(UID)).toHaveLength(0)

    // Nada duplicado: una escritura por ruta, y la mañana del día 10 sale una
    // sola vez pese a haberse escrito dos.
    const rutas = escrituras.map((escritura) => escritura.path)
    expect(new Set(rutas).size).toBe(rutas.length)
    expect(rutas.filter((ruta) => ruta.includes('morningEntry'))).toHaveLength(1)
  })

  it('volver a vaciar la cola no reenvía lo que ya salió', async () => {
    await lumia.saveDayState(UID, '2026-08-10', { mood: 'tranquilo' })
    await flush(UID)
    const enviadasPrimeraVez = escrituras.length

    await flush(UID)
    expect(escrituras).toHaveLength(enviadasPrimeraVez)
  })

  it('si Firestore falla, la entrada se queda en la cola', async () => {
    await lumia.saveDayState(UID, '2026-08-10', { mood: 'tranquilo' })
    falla = true

    const resultado = await flush(UID)
    expect(resultado.sent).toBe(0)
    expect(resultado.pending).toBe(1)

    const queue = await listQueue(UID)
    expect(queue[0].attempts).toBe(1)

    // Con la red de vuelta, sale sin haber perdido nada.
    falla = false
    cancelRetries()
    const segundo = await flush(UID)
    expect(segundo.sent).toBe(1)
    expect(await listQueue(UID)).toHaveLength(0)
  })

  it('un borrado también viaja por la cola', async () => {
    const entry = await lumia.createJournalEntry(UID, { date: '2026-08-10', text: 'x' })
    await flush(UID)

    await lumia.deleteJournalEntry(UID, entry.id)
    await flush(UID)

    expect(borrados).toHaveLength(1)
    expect(borrados[0]).toContain('lumia/journal/items/')
  })
})
