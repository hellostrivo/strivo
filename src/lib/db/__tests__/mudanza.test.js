// src/lib/db/__tests__/mudanza.test.js
// Una semilla no sube ni después de mudarse (DP-17.10; instrucción SPEC_17A.2 §2).
//
// El caso que lo motivó se midió en la validación manual de SPEC_17A: entrar
// en P7 a una cuenta que ya tenía datos, desde un dispositivo que nunca la
// vio, mudaba el árbol sembrado por `initShared` y lo encolaba entero; la cola
// sube con `setDoc` sin `merge`, así que un `shared/profile` con `name: null`
// reemplazaba en Firestore el perfil real. Lo que se vigila aquí es la
// diferencia entre las tres cosas que puede traer una fila mudada: nada
// (semilla, no sube), una marca legible (sube) y una marca ilegible (sube,
// porque alguien escribió ahí).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as shared from '../shared.js'
import * as diario from '../diario.js'
import { initUserTree } from '../index.js'
import { listQueue, mudarUid, pendingCount, readPath, writePath } from '../local.js'
import { cancelRetries, flush } from '../sync.js'
import { paths } from '../schema.js'
import { UID, resetLocalDB } from './helpers.js'

const CUENTA = 'AbC123firebaseUid'
const T0 = '2026-09-17T12:00:00.000Z'

// Firestore de mentira, el mismo patrón que `sync.test.js`.
const escrituras = []
vi.mock('../../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: async (ref, data) => {
    escrituras.push({ path: ref.path, data })
  },
  deleteDoc: async () => {},
}))

/** Una fila cualquiera bajo el uid local, sin encolar: lo que importa es qué hace la mudanza. */
function fila(collection, segmento, data, id = null) {
  return writePath({
    uid: UID,
    path: `users/${UID}/${segmento}`,
    collection,
    id,
    data,
    sync: false,
  })
}

const rutas = async (uid) => (await listQueue(uid)).map((entrada) => entrada.path)

beforeEach(async () => {
  escrituras.length = 0
  await resetLocalDB()
  vi.stubGlobal('navigator', { onLine: true })
})

afterEach(() => {
  cancelRetries()
  vi.unstubAllGlobals()
})

describe('criterio 1: un árbol sembrado se muda, y no se encola', () => {
  it('los cuatro documentos de shared/ cambian de uid y la cola queda vacía', async () => {
    await initUserTree(UID)

    const { mudados, conservados } = await mudarUid(UID, CUENTA)

    // La mudanza sigue mudando: los cuatro documentos están bajo la cuenta.
    expect(mudados).toBe(4)
    expect(conservados).toBe(0)
    for (const doc of ['profile', 'auth', 'preferences', 'onboarding']) {
      expect(await readPath(paths.sharedDoc(CUENTA, doc))).not.toBeNull()
      expect(await readPath(paths.sharedDoc(UID, doc))).toBeNull()
    }
    // Y no tiene nada que contarle a la nube.
    expect(await pendingCount(CUENTA)).toBe(0)
    expect(await pendingCount()).toBe(0)
  })

  it('la semilla sigue siendo semilla después de mudarse: sin marca, y no se le fabrica una', async () => {
    await initUserTree(UID)
    await mudarUid(UID, CUENTA)
    const perfil = await shared.getProfile(CUENTA)
    expect(perfil.name).toBeNull()
    expect('updatedAt' in perfil).toBe(false)
  })
})

describe('criterio 2: lo que alguien escribió sí se reencola', () => {
  it('una mañana, un journal, un dayState, un perfil editado y un favorito con actualizadoEn', async () => {
    await initUserTree(UID)
    await shared.updateProfile(UID, { name: 'Alejandra' })
    // La mañana lleva el sello que le pone la pantalla (`sello()` en
    // `DiarioManana.jsx`): `saveMorningEntry` no sella por su cuenta, y una
    // mañana sin `updatedAt` sería un hueco también para la fusión.
    await diario.saveMorningEntry(UID, '2026-09-10', { action: 'Salir a caminar.', updatedAt: T0 })
    const journal = await diario.createJournalEntry(UID, { date: '2026-09-10', text: 'Hoy.' })
    await diario.saveDayState(UID, '2026-09-10', { mood: 'tranquilo' })
    await fila(
      'breathing/favoritos',
      'breathing/favoritos/fav-1',
      { nombre: 'Mi ritmo', actualizadoEn: T0 },
      'fav-1',
    )
    // Lo escrito bajo el uid local está encolado ahí; la mudanza lo retira y
    // lo vuelve a encolar bajo la cuenta.
    expect(await pendingCount(UID)).toBeGreaterThan(0)

    await mudarUid(UID, CUENTA)

    const cola = await rutas(CUENTA)
    expect(cola).toContain(paths.sharedDoc(CUENTA, 'profile'))
    expect(cola).toContain(paths.diarioItem(CUENTA, 'morningEntry', '2026-09-10'))
    expect(cola).toContain(paths.diarioItem(CUENTA, 'journal', journal.id))
    expect(cola).toContain(paths.diarioItem(CUENTA, 'dayState', '2026-09-10'))
    expect(cola).toContain(`users/${CUENTA}/breathing/favoritos/fav-1`)
    expect(await pendingCount(UID)).toBe(0)
  })

  it('en un árbol con perfil editado, sube el perfil y no suben los tres documentos que siguen sembrados', async () => {
    await initUserTree(UID)
    await shared.updateProfile(UID, { name: 'Alejandra' })

    await mudarUid(UID, CUENTA)

    expect(await rutas(CUENTA)).toEqual([paths.sharedDoc(CUENTA, 'profile')])
  })
})

describe('criterio 3: una marca presente pero ilegible se reencola igual', () => {
  it.each([
    ['una cadena que no es fecha', 'ayer'],
    ['cero', 0],
    ['un número', 1726000000000],
  ])('updatedAt es %s: alguien escribió ahí', async (_nombre, valor) => {
    await fila('shared', 'shared/profile', { name: 'Alguien', updatedAt: valor }, 'profile')

    await mudarUid(UID, CUENTA)

    expect(await rutas(CUENTA)).toEqual([paths.sharedDoc(CUENTA, 'profile')])
    // Y la marca se muda tal cual: no se corrige en silencio (RN-DB4-08).
    expect((await shared.getProfile(CUENTA)).updatedAt).toBe(valor)
  })

  it('un favorito de respiración con actualizadoEn ilegible también', async () => {
    await fila(
      'breathing/favoritos',
      'breathing/favoritos/fav-1',
      { nombre: 'Mi ritmo', actualizadoEn: 'hace poco' },
      'fav-1',
    )
    await mudarUid(UID, CUENTA)
    expect(await rutas(CUENTA)).toEqual([`users/${CUENTA}/breathing/favoritos/fav-1`])
  })
})

describe('criterio 4: una colección sin campo de marca se encola como siempre', () => {
  it('breathing/sesiones no es semilla aunque marcaDe devuelva null', async () => {
    await fila('breathing/sesiones', 'breathing/sesiones/s-1', { duracion: 300 }, 's-1')

    await mudarUid(UID, CUENTA)

    expect(await rutas(CUENTA)).toEqual([`users/${CUENTA}/breathing/sesiones/s-1`])
  })
})

describe('regresión: la mudanza no cambia en lo demás', () => {
  it('el PIN se muda y sigue sin salir, tenga o no marca', async () => {
    await diario.savePinConfig(UID, {
      salt: 'sal',
      hash: 'huella',
      iterations: 100000,
      algorithm: 'PBKDF2',
      enabled: true,
    })
    await mudarUid(UID, CUENTA)
    expect((await diario.getPinConfig(CUENTA)).enabled).toBe(true)
    expect(await pendingCount()).toBe(0)
  })

  it('sigue sin pisar lo que ya hubiera en la cuenta, y cuenta lo conservado', async () => {
    await initUserTree(CUENTA)
    await initUserTree(UID)
    const { mudados, conservados } = await mudarUid(UID, CUENTA)
    expect(mudados).toBe(0)
    expect(conservados).toBe(4)
  })
})

describe('criterio 6: sembrar → mudar → flush, de punta a punta con dobles', () => {
  it('Firestore no recibe ninguna escritura a users/{cuenta}/shared/*', async () => {
    await initUserTree(UID)
    await mudarUid(UID, CUENTA)

    const resultado = await flush(CUENTA)

    expect(resultado.sent).toBe(0)
    expect(escrituras.filter((e) => e.path.startsWith(`users/${CUENTA}/shared/`))).toEqual([])
    expect(escrituras).toEqual([])
  })

  it('y lo escrito sí llega, como antes (sin regresión contra el criterio 18)', async () => {
    await initUserTree(UID)
    await shared.updateProfile(UID, { name: 'Alejandra' })
    await mudarUid(UID, CUENTA)

    const resultado = await flush(CUENTA)

    expect(resultado.sent).toBe(1)
    expect(escrituras.map((e) => e.path)).toEqual([paths.sharedDoc(CUENTA, 'profile')])
    expect(escrituras[0].data.name).toBe('Alejandra')
    expect(await pendingCount(CUENTA)).toBe(0)
  })
})
