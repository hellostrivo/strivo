import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as formia from '../formia.js'
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
    await lumia.saveDailyIntention(UID, '2026-08-10', { intentionText: 'Ir despacio.' })
    const queue = await listQueue(UID)

    expect(queue).toHaveLength(1)
    expect(queue[0].path).toBe('users/usuario-de-prueba/lumia/dailyIntention/items/2026-08-10')
    expect(queue[0].op).toBe('put')
  })

  it('cinco escrituras sobre la misma ruta dejan una entrada con el último estado', async () => {
    for (const texto of ['a', 'b', 'c', 'd', 'e']) {
      await lumia.saveDailyIntention(UID, '2026-08-10', { intentionText: texto })
    }

    const queue = await listQueue(UID)
    expect(queue).toHaveLength(1)
    expect(queue[0].data.intentionText).toBe('e')
  })
})

describe('criterio 5: sin red se guarda en local y se sincroniza al volver', () => {
  it('la escritura persiste con la red caída y sale una sola vez al volver', async () => {
    conRed(false)

    await formia.initFormia(UID, { identityCentral: 'Alguien que crece' })
    const habit = await formia.createHabit(UID, { name: 'Caminar', identityRef: 'central' })
    await formia.markHabit(UID, habit.id, '2026-08-10')
    await formia.markHabit(UID, habit.id, '2026-08-10')

    // Lo escrito está a salvo aunque la red no exista.
    expect(await formia.getHabit(UID, habit.id)).toBeTruthy()
    expect(await formia.listHabitLogs(UID)).toHaveLength(1)

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

    // Nada duplicado: una escritura por ruta, y la fila de hábito marcado es una.
    const rutas = escrituras.map((escritura) => escritura.path)
    expect(new Set(rutas).size).toBe(rutas.length)
    expect(rutas.filter((ruta) => ruta.includes('habitLogs'))).toHaveLength(1)
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
