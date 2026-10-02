// src/lib/__tests__/entradaCuenta.test.js
// Entrar a una cuenta que ya existía, sin destruir nada (SPEC_19.1 §4.4;
// criterio 2).
//
// La restauración es la de verdad, sobre un Firestore de mentira: así lo que
// se prueba es el algoritmo entero —bajar primero, mudar después con la regla
// de cada colección— y no un doble que ya sabe la respuesta.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as shared from '@lib/db/shared'
import * as diario from '@lib/db/diario'
import { listQueue } from '@lib/db/local'
import { hayMarcaDeRestauracion } from '@lib/db/restaurar'
import { paths } from '@lib/db/schema'
import { UID, resetLocalDB } from '@lib/db/__tests__/helpers.js'

const CUENTA = 'AbC123firebaseUid'
const T0 = '2026-09-17T12:00:00.000Z'
const T1 = '2026-09-18T12:00:00.000Z'

// ─── Firestore de mentira ─────────────────────────────────────────────────────

const nube = new Map()
const control = { fallar: false, colgar: false }

vi.mock('../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => {
  const snap = (path, data) => ({
    id: path.split('/').pop(),
    exists: () => data !== undefined,
    data: () => data,
  })
  const esperar = async () => {
    if (control.colgar) await new Promise(() => {})
    if (control.fallar) throw new Error('sin permiso')
  }
  return {
    doc: (_db, path) => ({ path }),
    collection: (_db, path) => ({ path }),
    documentId: () => '__name__',
    orderBy: () => ({}),
    limit: (n) => ({ limit: n }),
    startAfter: () => ({}),
    query: (col) => ({ col }),
    getDoc: async (ref) => {
      await esperar()
      return snap(ref.path, nube.get(ref.path))
    },
    getDocs: async ({ col }) => {
      await esperar()
      const prefijo = `${col.path}/`
      const ids = [...nube.keys()]
        .filter((k) => k.startsWith(prefijo) && !k.slice(prefijo.length).includes('/'))
        .sort()
      return { docs: ids.map((k) => snap(k, nube.get(k))) }
    },
  }
})

const { entrarACuenta } = await import('../entradaCuenta.js')

function enNube(sufijo, data) {
  nube.set(`users/${CUENTA}/${sufijo}`, data)
}

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

const rutas = async (uid) => (await listQueue(uid)).map((e) => e.path)
const CUENTA_INFO = { uid: CUENTA, email: 'ale@ejemplo.com' }

beforeEach(async () => {
  nube.clear()
  control.fallar = false
  control.colgar = false
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
})

afterEach(() => vi.unstubAllGlobals())

describe('shared/*: gana la cuenta', () => {
  it('perfil de la cuenta + perfil anónimo sellado: gana la cuenta y no se encola shared/profile', async () => {
    enNube('shared/profile', { name: 'Alejandra', gender: 'f', updatedAt: T0 })
    await shared.initShared(UID)
    await shared.updateProfile(UID, { name: 'Anónima' }) // sellado, y más nuevo

    const r = await entrarACuenta(UID, CUENTA_INFO)

    expect(r.uid).toBe(CUENTA)
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await rutas(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'profile'))
    // Lo anónimo no se borra: se queda bajo su uid.
    expect((await shared.getProfile(UID)).name).toBe('Anónima')
  })

  it('perfil de la cuenta semilla + perfil anónimo escrito: entra el anónimo y se encola', async () => {
    await shared.initShared(CUENTA) // semilla local de la cuenta; la nube no tiene nada
    await shared.initShared(UID)
    await shared.updateProfile(UID, { name: 'Anónima' })

    await entrarACuenta(UID, CUENTA_INFO)

    expect((await shared.getProfile(CUENTA)).name).toBe('Anónima')
    expect(await rutas(CUENTA)).toContain(paths.sharedDoc(CUENTA, 'profile'))
  })

  it('el expediente de la cuenta no lo reemplaza el de la sesión anónima', async () => {
    enNube('shared/onboarding', { version: 2, completedAt: T0, updatedAt: T0 })
    await shared.initShared(UID)
    await shared.updateOnboarding(UID, { currentStep: 'p3' })

    await entrarACuenta(UID, CUENTA_INFO)

    expect(await shared.onboardingPendiente(CUENTA)).toBe(false)
    expect(await rutas(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'onboarding'))
  })
})

describe('diario/*: gana lo más nuevo, y lo que pierde se conserva', () => {
  it('mañana del mismo día más nueva en el origen: reemplaza y se encola', async () => {
    enNube('diario/morningEntry/items/2026-09-18', { action: 'cuenta', updatedAt: T0 })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T1 })

    const r = await entrarACuenta(UID, CUENTA_INFO)

    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('anónima')
    expect(await rutas(CUENTA)).toContain(paths.diarioItem(CUENTA, 'morningEntry', '2026-09-18'))
    expect(r.mudados).toBeGreaterThan(0)
  })

  it('más nueva en el destino: el origen queda bajo su uid y cuenta en conservados', async () => {
    enNube('diario/morningEntry/items/2026-09-18', { action: 'cuenta', updatedAt: T1 })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T0 })

    const r = await entrarACuenta(UID, CUENTA_INFO)

    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('cuenta')
    expect((await diario.getMorningEntry(UID, '2026-09-18')).action).toBe('anónima')
    expect(r.conservados).toBe(1)
  })

  it('journal con ids distintos: se mudan todos', async () => {
    enNube('diario/journal/items/de-la-cuenta', { text: 'de antes', date: '2026-09-01' })
    const a = await diario.createJournalEntry(UID, { date: '2026-09-18', text: 'uno' })
    const b = await diario.createJournalEntry(UID, { date: '2026-09-18', text: 'dos' })

    await entrarACuenta(UID, CUENTA_INFO)

    const textos = (await diario.listJournalEntries(CUENTA)).map((e) => e.text).sort()
    expect(textos).toEqual(['de antes', 'dos', 'uno'])
    expect(await rutas(CUENTA)).toEqual(
      expect.arrayContaining([
        paths.diarioItem(CUENTA, 'journal', a.id),
        paths.diarioItem(CUENTA, 'journal', b.id),
      ]),
    )
  })
})

describe('si la restauración no termina, shared/* del origen no se muda', () => {
  async function arbolAnonimo() {
    await shared.initShared(UID)
    await shared.updateProfile(UID, { name: 'Anónima' })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T1 })
  }

  it('restauración fallida: shared se queda, el diario se muda, y no hay marca', async () => {
    control.fallar = true
    await arbolAnonimo()

    const r = await entrarACuenta(UID, CUENTA_INFO)

    expect(r.restauracion.ok).toBe(false)
    expect(await shared.getProfile(CUENTA)).toBeNull()
    expect((await shared.getProfile(UID)).name).toBe('Anónima')
    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('anónima')
    expect(await rutas(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'profile'))
    expect(hayMarcaDeRestauracion(CUENTA)).toBe(false)
  })

  it('el techo cuenta como no terminada', async () => {
    control.colgar = true
    await arbolAnonimo()
    const velo = []

    const r = await entrarACuenta(UID, CUENTA_INFO, {
      techoMs: 20,
      enRestauracion: (a) => velo.push(a),
    })

    expect(r.restauracion).toBeNull()
    expect(velo).toEqual([true, false])
    expect(await shared.getProfile(CUENTA)).toBeNull()
    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('anónima')
  })
})

describe('el resto del algoritmo', () => {
  it('anota el correo en shared/auth de la cuenta', async () => {
    await entrarACuenta(UID, CUENTA_INFO)
    expect(await shared.getAuthRecord(CUENTA)).toMatchObject({
      uid: CUENTA,
      email: 'ale@ejemplo.com',
    })
  })

  it('la misma cuenta que estaba vencida: ni baja ni muda nada', async () => {
    enNube('shared/profile', { name: 'Alejandra', updatedAt: T0 })
    const velo = []
    const r = await entrarACuenta(CUENTA, CUENTA_INFO, { enRestauracion: (a) => velo.push(a) })
    expect(r).toEqual({ uid: CUENTA, mudados: 0, conservados: 0, restauracion: null })
    expect(velo).toEqual([])
    expect(await shared.getProfile(CUENTA)).toBeNull()
  })

  it('la frase de restauración se pone y se quita una vez', async () => {
    const velo = []
    await entrarACuenta(UID, CUENTA_INFO, { enRestauracion: (a) => velo.push(a) })
    expect(velo).toEqual([true, false])
  })
})
