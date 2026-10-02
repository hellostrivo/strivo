// src/lib/__tests__/entradaCuenta.test.js
// Entrar a una cuenta que ya existía, sin destruir nada (SPEC_19.1 §4.4;
// criterio 2).
//
// La restauración es la de verdad, sobre un Firestore de mentira: así lo que
// se prueba es el algoritmo entero —bajar primero, mudar después con la regla
// de cada colección— y no un doble que ya sabe la respuesta.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'

import * as shared from '@lib/db/shared'
import * as diario from '@lib/db/diario'
import { borrarUid, claveDeMudanzaPendiente, listQueue } from '@lib/db/local'
import { hayMarcaDeRestauracion, restaurar } from '@lib/db/restaurar'
import { paths } from '@lib/db/schema'
import { UID, resetLocalDB } from '@lib/db/__tests__/helpers.js'

const CUENTA = 'AbC123firebaseUid'
const T0 = '2026-09-17T12:00:00.000Z'
const T1 = '2026-09-18T12:00:00.000Z'

// ─── Firestore de mentira ─────────────────────────────────────────────────────

const nube = new Map()
// `colgar`: la lectura espera hasta que alguien llame a `soltar()`.
const control = { fallar: false, colgar: false, esperando: [] }
function soltar() {
  control.colgar = false
  control.esperando.splice(0).forEach((resolve) => resolve())
}

vi.mock('../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => {
  const snap = (path, data) => ({
    id: path.split('/').pop(),
    exists: () => data !== undefined,
    data: () => data,
  })
  const esperar = async () => {
    if (control.colgar) await new Promise((resolve) => control.esperando.push(resolve))
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

const {
  completarMudanzaPendiente,
  entrarACuenta,
  escucharMudanzasPendientes,
  mudanzaPendiente,
  reintentarEntradaAlVolverLaRed,
} = await import('../entradaCuenta.js')

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
  control.esperando.length = 0
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

describe('F1: si la restauración no termina bien, no se muda nada', () => {
  async function arbolAnonimo() {
    await shared.initShared(UID)
    await shared.updateProfile(UID, { name: 'Anónima' })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T1 })
  }

  /** Espera a que el doble de Firestore tenga una lectura colgada. */
  async function hastaQueCuelgue() {
    while (control.esperando.length === 0) await new Promise((r) => setTimeout(r, 0))
  }

  /** Espera a que la mudanza aplazada termine (la clave se retira al final). */
  async function hastaQueMude() {
    while (mudanzaPendiente(CUENTA)) await new Promise((r) => setTimeout(r, 5))
    await new Promise((r) => setTimeout(r, 5))
  }

  it('restauración fallida: ninguna fila del origen se muda ni se encola, y la clave queda puesta', async () => {
    control.fallar = true
    await arbolAnonimo()
    const colaAntes = await rutas(UID)

    const r = await entrarACuenta(UID, CUENTA_INFO)

    expect(r).toMatchObject({ uid: CUENTA, mudados: 0, conservados: 0, pendiente: true })
    expect(r.restauracion.ok).toBe(false)
    expect(localStorage.getItem(claveDeMudanzaPendiente(CUENTA))).toBe(UID)
    // Lo anónimo, intacto bajo su uid y con su cola.
    expect((await shared.getProfile(UID)).name).toBe('Anónima')
    expect((await diario.getMorningEntry(UID, '2026-09-18')).action).toBe('anónima')
    expect(await rutas(UID)).toEqual(colaAntes)
    // Y la cuenta no recibe ni una fila ni una entrada de cola, tampoco shared/auth.
    expect(await diario.getMorningEntry(CUENTA, '2026-09-18')).toBeNull()
    expect(await shared.getAuthRecord(CUENTA)).toBeNull()
    expect(await rutas(CUENTA)).toEqual([])
    expect(hayMarcaDeRestauracion(CUENTA)).toBe(false)
  })

  it('techo y bajada que termina bien después: la mudanza ocurre entonces, con la política completa', async () => {
    enNube('shared/profile', { name: 'Alejandra', updatedAt: T0 })
    enNube('diario/morningEntry/items/2026-09-18', { action: 'cuenta', updatedAt: T0 })
    await arbolAnonimo() // mañana anónima T1, más nueva
    const mudadas = []
    const quitar = escucharMudanzasPendientes({ alMudar: (uid) => mudadas.push(uid) })
    control.colgar = true

    const entrada = entrarACuenta(UID, CUENTA_INFO, { techoMs: 20 })
    await hastaQueCuelgue()
    const r = await entrada
    expect(r).toMatchObject({ uid: CUENTA, restauracion: null, pendiente: true })
    expect(await rutas(CUENTA)).toEqual([])

    soltar()
    await hastaQueMude()
    quitar()

    expect(mudadas).toEqual([CUENTA])
    // La mañana más nueva queda en local y en la cola.
    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('anónima')
    expect(await rutas(CUENTA)).toContain(paths.diarioItem(CUENTA, 'morningEntry', '2026-09-18'))
    // Y shared/* con la política completa: gana la cuenta.
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await rutas(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'profile'))
    expect((await shared.getAuthRecord(CUENTA)).email).toBeNull()
  })

  it('si la versión de la cuenta es la más nueva, es la que queda, y no se encola nada del origen', async () => {
    enNube('diario/morningEntry/items/2026-09-18', { action: 'cuenta', updatedAt: T1 })
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T0 })
    const quitar = escucharMudanzasPendientes()
    control.colgar = true

    const entrada = entrarACuenta(UID, CUENTA_INFO, { techoMs: 20 })
    await hastaQueCuelgue()
    await entrada
    soltar()
    await hastaQueMude()
    quitar()

    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('cuenta')
    expect((await diario.getMorningEntry(UID, '2026-09-18')).action).toBe('anónima')
    expect(await rutas(CUENTA)).not.toContain(
      paths.diarioItem(CUENTA, 'morningEntry', '2026-09-18'),
    )
  })

  it('una segunda restauración correcta no repite la mudanza', async () => {
    control.fallar = true
    await arbolAnonimo()
    await entrarACuenta(UID, CUENTA_INFO)
    const mudadas = []
    const quitar = escucharMudanzasPendientes({ alMudar: (uid) => mudadas.push(uid) })

    control.fallar = false
    await restaurar(CUENTA)
    await hastaQueMude()
    await restaurar(CUENTA)
    await new Promise((r) => setTimeout(r, 10))
    quitar()

    expect(mudadas).toEqual([CUENTA])
    expect(mudanzaPendiente(CUENTA)).toBeNull()
  })

  it('una restauración fallida no dispara la mudanza pendiente', async () => {
    control.fallar = true
    await arbolAnonimo()
    await entrarACuenta(UID, CUENTA_INFO)
    const quitar = escucharMudanzasPendientes()
    await restaurar(CUENTA)
    await new Promise((r) => setTimeout(r, 10))
    quitar()
    expect(mudanzaPendiente(CUENTA)).toBe(UID)
    expect(await diario.getMorningEntry(CUENTA, '2026-09-18')).toBeNull()
  })

  it('con la clave puesta y el origen sin filas, se retira sin hacer nada', async () => {
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), 'local-vacio')
    expect(await completarMudanzaPendiente(CUENTA)).toBeNull()
    expect(mudanzaPendiente(CUENTA)).toBeNull()
    expect(await shared.getAuthRecord(CUENTA)).toBeNull()
  })

  it('dos disparos a la vez son una sola mudanza', async () => {
    await arbolAnonimo()
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), UID)
    const a = completarMudanzaPendiente(CUENTA)
    const b = completarMudanzaPendiente(CUENTA)
    expect(b).toBe(a)
    expect(await a).toMatchObject({ mudados: expect.any(Number) })
  })

  it('una entrada que sí restaura retira la clave vieja que apuntaba al mismo origen', async () => {
    await arbolAnonimo()
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), UID)
    const r = await entrarACuenta(UID, CUENTA_INFO)
    expect(r.pendiente).toBe(false)
    expect(mudanzaPendiente(CUENTA)).toBeNull()
    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('anónima')
  })

  it('borrarUid (al salir) retira la clave de mudanza pendiente de ese uid, y solo esa', async () => {
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), UID)
    localStorage.setItem(claveDeMudanzaPendiente('OtraCuenta9'), UID)
    await borrarUid(CUENTA)
    expect(mudanzaPendiente(CUENTA)).toBeNull()
    expect(mudanzaPendiente('OtraCuenta9')).toBe(UID)
  })

  it('la mudanza parcial sin shared/* ya no existe', () => {
    const fuente = readFileSync('src/lib/entradaCuenta.js', 'utf8')
    expect(fuente).not.toMatch(/sinTocarShared/)
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
    expect(r).toEqual({
      uid: CUENTA,
      mudados: 0,
      conservados: 0,
      restauracion: null,
      pendiente: false,
    })
    expect(velo).toEqual([])
    expect(await shared.getProfile(CUENTA)).toBeNull()
  })

  it('la frase de restauración se pone y se quita una vez', async () => {
    const velo = []
    await entrarACuenta(UID, CUENTA_INFO, { enRestauracion: (a) => velo.push(a) })
    expect(velo).toEqual([true, false])
  })
})

describe('F3: una entrada aplazada por falta de red reintenta al volver la red', () => {
  function ventanaDeMentira() {
    const oyentes = new Map()
    return {
      addEventListener: (tipo, fn) => oyentes.set(fn, tipo),
      removeEventListener: (_tipo, fn) => oyentes.delete(fn),
      disparar: (tipo) =>
        [...oyentes.entries()].filter(([, t]) => t === tipo).forEach(([fn]) => fn()),
      cuantos: () => oyentes.size,
    }
  }

  const aplazada = (motivo) => ({ pendiente: true, restauracion: { ok: false, motivo } })

  it('solo con pendiente y motivo sin_red deja un oyente', () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    expect(typeof reintentarEntradaAlVolverLaRed(aplazada('sin_red'), CUENTA)).toBe('function')
    expect(w.cuantos()).toBe(1)
  })

  it('con otro motivo, con el techo o sin entrada aplazada, no', () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    expect(reintentarEntradaAlVolverLaRed(aplazada('interrumpida'), CUENTA)).toBeNull()
    expect(
      reintentarEntradaAlVolverLaRed({ pendiente: true, restauracion: null }, CUENTA),
    ).toBeNull()
    expect(
      reintentarEntradaAlVolverLaRed({ pendiente: false, restauracion: null }, CUENTA),
    ).toBeNull()
    expect(w.cuantos()).toBe(0)
  })

  it('al volver la red restaura una vez y, si termina bien, la mudanza pendiente se completa', async () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    await shared.initShared(UID)
    await diario.saveMorningEntry(UID, '2026-09-18', { action: 'anónima', updatedAt: T1 })
    const quitarMudanzas = escucharMudanzasPendientes()

    vi.stubGlobal('navigator', { onLine: false })
    const entrada = await entrarACuenta(UID, CUENTA_INFO)
    expect(entrada).toMatchObject({ pendiente: true, restauracion: { motivo: 'sin_red' } })
    reintentarEntradaAlVolverLaRed(entrada, CUENTA)
    expect(w.cuantos()).toBe(1)

    vi.stubGlobal('navigator', { onLine: true })
    w.disparar('online')
    while (mudanzaPendiente(CUENTA)) await new Promise((r) => setTimeout(r, 5))
    await new Promise((r) => setTimeout(r, 5))
    quitarMudanzas()

    expect(w.cuantos()).toBe(0)
    expect((await diario.getMorningEntry(CUENTA, '2026-09-18')).action).toBe('anónima')
    expect(hayMarcaDeRestauracion(CUENTA)).toBe(true)
  })

  it('quitar el oyente antes de que vuelva la red no dispara nada', () => {
    const w = ventanaDeMentira()
    vi.stubGlobal('window', w)
    const corridas = []
    const quitar = reintentarEntradaAlVolverLaRed(aplazada('sin_red'), CUENTA, (u) =>
      corridas.push(u),
    )
    quitar()
    w.disparar('online')
    expect(corridas).toEqual([])
  })

  it('ArranqueProvisional lo pone en las dos entradas y lo retira al desmontar y al salir', () => {
    const fuente = readFileSync('src/components/ArranqueProvisional.jsx', 'utf8')
    expect(fuente.match(/ponerOyenteRed\(reintentarEntradaAlVolverLaRed\(/g)).toHaveLength(2)
    expect(fuente).toMatch(/useEffect\(\(\) => \(\) => quitarOyenteRed\.current\?\.\(\), \[\]\)/)
    const salir = fuente.slice(fuente.indexOf('const salir = useCallback'))
    expect(salir.indexOf('retirarOyenteRed()')).toBeLessThan(salir.indexOf('salirDeCuenta('))
  })
})
