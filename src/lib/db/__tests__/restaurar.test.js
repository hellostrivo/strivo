// src/lib/db/__tests__/restaurar.test.js
// La restauración (SPEC_17A §4.3; criterios 1, 2, 3, 6, 7 y 8).
//
// Firestore de mentira sobre un mapa ruta → datos, con el mismo patrón que
// `sync.test.js`: se registra qué se lee para poder afirmar qué **no** se
// lee (el PIN), y se puede hacer fallar a mitad para probar la interrupción.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

import * as shared from '../shared.js'
import * as diario from '../diario.js'
import { pendingCount, readCollection, readPath, writePath } from '../local.js'
import {
  MOTIVOS,
  TAMANO_PAGINA,
  hayMarcaDeRestauracion,
  olvidarResultados,
  restaurar,
  retirarMarcaDeRestauracion,
  ultimoResultado,
} from '../restaurar.js'
import { UID, resetLocalDB } from './helpers.js'

// ─── Firestore de mentira ─────────────────────────────────────────────────────

const nube = new Map() // ruta → datos
const lecturas = [] // rutas pedidas con getDoc o getDocs
const fallarEn = { ruta: null } // getDocs de esta colección lanza
const configurado = { db: { __fake: true } }

vi.mock('../../firebase.js', () => ({
  get db() {
    return configurado.db
  },
}))

vi.mock('firebase/firestore', () => {
  const snapshotDe = (path, data) => ({
    id: path.split('/').pop(),
    exists: () => data !== undefined,
    data: () => data,
  })
  return {
    doc: (_db, path) => ({ path }),
    collection: (_db, path) => ({ path }),
    documentId: () => '__name__',
    orderBy: (campo) => ({ orderBy: campo }),
    limit: (n) => ({ limit: n }),
    startAfter: (snap) => ({ startAfter: snap.id }),
    query: (col, ...partes) => ({ col, partes }),
    getDoc: async (ref) => {
      lecturas.push(ref.path)
      return snapshotDe(ref.path, nube.get(ref.path))
    },
    getDocs: async ({ col, partes }) => {
      lecturas.push(col.path)
      if (fallarEn.ruta && col.path.endsWith(fallarEn.ruta)) throw new Error('sin red')
      const limite = partes.find((p) => p.limit)?.limit ?? Infinity
      const desde = partes.find((p) => p.startAfter)?.startAfter ?? null
      const prefijo = `${col.path}/`
      let ids = [...nube.keys()]
        .filter((k) => k.startsWith(prefijo) && !k.slice(prefijo.length).includes('/'))
        .map((k) => k.slice(prefijo.length))
        .sort()
      if (desde !== null) ids = ids.filter((id) => id > desde)
      ids = ids.slice(0, limite)
      return { docs: ids.map((id) => snapshotDe(`${prefijo}${id}`, nube.get(`${prefijo}${id}`))) }
    },
  }
})

function enNube(sufijo, data) {
  nube.set(`users/${UID}/${sufijo}`, data)
}

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

beforeEach(async () => {
  nube.clear()
  lecturas.length = 0
  fallarEn.ruta = null
  configurado.db = { __fake: true }
  olvidarResultados()
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
})

afterEach(() => vi.unstubAllGlobals())

const T0 = '2026-09-01T10:00:00.000Z'
const T1 = '2026-09-02T10:00:00.000Z'

// ─── Criterio 1: la única lectura de Firestore ────────────────────────────────

describe('criterio 1: nadie más lee de Firestore', () => {
  it('getDoc/getDocs aparecen solo en restaurar.js y en sus pruebas', () => {
    const encontrados = []
    const recorrer = (dir) => {
      for (const nombre of readdirSync(dir)) {
        const ruta = join(dir, nombre)
        if (statSync(ruta).isDirectory()) recorrer(ruta)
        else if (/\.(js|jsx)$/.test(nombre) && /getDocs?\b/.test(readFileSync(ruta, 'utf8'))) {
          encontrados.push(ruta)
        }
      }
    }
    recorrer('src')
    expect(encontrados.sort()).toEqual([
      'src/lib/db/__tests__/restaurar.test.js',
      'src/lib/db/restaurar.js',
    ])
  })
})

// ─── Sin nube ─────────────────────────────────────────────────────────────────

describe('sin configuración o sin red, no pasa nada', () => {
  it('sin db devuelve sin_configuracion, no lanza y no marca', async () => {
    configurado.db = undefined
    const r = await restaurar(UID)
    expect(r).toEqual({ ok: false, motivo: MOTIVOS.sinConfiguracion, escritos: 0, fusionados: 0 })
    expect(hayMarcaDeRestauracion(UID)).toBe(false)
    expect(lecturas).toEqual([])
  })

  it('sin red devuelve sin_red antes de tocar el SDK, y no marca', async () => {
    vi.stubGlobal('navigator', { onLine: false })
    const r = await restaurar(UID)
    expect(r.ok).toBe(false)
    expect(r.motivo).toBe(MOTIVOS.sinRed)
    expect(lecturas).toEqual([])
    expect(hayMarcaDeRestauracion(UID)).toBe(false)
  })

  it('sin uid es un error de programación', async () => {
    await expect(restaurar('')).rejects.toMatchObject({ code: 'UID_REQUIRED' })
  })
})

// ─── Con datos ────────────────────────────────────────────────────────────────

describe('con datos en la nube y nada local', () => {
  beforeEach(() => {
    enNube('shared/profile', { name: 'Alejandra', gender: 'f', updatedAt: T0 })
    enNube('shared/preferences', { soundEnabled: false, updatedAt: T0 })
    enNube('diario/journal/items/j1', { date: '2026-09-01', text: 'hola', updatedAt: T0 })
    enNube('diario/morningEntry/items/2026-09-01', { action: 'Salir.', updatedAt: T0 })
    enNube('diario/nightRitual/items/2026-09-01', { release: 'nada', updatedAt: T0 })
    enNube('diario/dayState/items/2026-09-01', { mood: 'tranquilo', updatedAt: T0 })
    enNube('breathing/unica', { patron: 'cuadrada', actualizadoEn: T0 })
    enNube('breathing/favoritos/items/f1', { nombre: 'Calma', actualizadoEn: T0 })
    enNube('breathing/recientes/items/r1', { usadoEn: T0 })
    enNube('breathing/sesiones/items/s1', { iniciadaEn: T0 })
  })

  it('baja todo, con la etiqueta de colección con la que la app lo lee', async () => {
    const r = await restaurar(UID)
    expect(r).toEqual({ ok: true, escritos: 10, fusionados: 0 })

    expect((await shared.getProfile(UID)).name).toBe('Alejandra')
    expect((await shared.getPreferences(UID)).soundEnabled).toBe(false)
    expect((await diario.listJournalEntries(UID)).map((e) => e.id)).toEqual(['j1'])
    expect((await diario.getMorningEntry(UID, '2026-09-01')).action).toBe('Salir.')
    expect((await diario.getNightRitual(UID, '2026-09-01')).release).toBe('nada')
    expect((await diario.getDayState(UID, '2026-09-01')).mood).toBe('tranquilo')
    expect(await readPath(`users/${UID}/breathing/unica`)).toEqual({
      patron: 'cuadrada',
      actualizadoEn: T0,
    })
    expect((await readCollection(UID, 'breathing/favoritos')).map((f) => f.id)).toEqual(['f1'])
    expect((await readCollection(UID, 'breathing/recientes')).map((f) => f.id)).toEqual(['r1'])
    expect((await readCollection(UID, 'breathing/sesiones')).map((f) => f.id)).toEqual(['s1'])
  })

  it('criterio 2: lo que baja no vuelve a subir', async () => {
    await restaurar(UID)
    expect(await pendingCount(UID)).toBe(0)
  })

  it('deja la marca solo al terminar entera', async () => {
    expect(hayMarcaDeRestauracion(UID)).toBe(false)
    await restaurar(UID)
    expect(hayMarcaDeRestauracion(UID)).toBe(true)
  })

  it('la marca es por uid: la de una cuenta no vale para otra', async () => {
    await restaurar(UID)
    expect(hayMarcaDeRestauracion('otro-uid')).toBe(false)
    retirarMarcaDeRestauracion(UID)
    expect(hayMarcaDeRestauracion(UID)).toBe(false)
  })

  it('guarda el último resultado de la sesión, por uid', async () => {
    expect(ultimoResultado(UID)).toBeNull()
    await restaurar(UID)
    expect(ultimoResultado(UID)).toEqual({ ok: true, escritos: 10, fusionados: 0 })
    expect(ultimoResultado('otro-uid')).toBeNull()
  })

  it('criterio 8: correrla dos veces no duplica nada', async () => {
    await restaurar(UID)
    const segunda = await restaurar(UID)
    expect(segunda).toEqual({ ok: true, escritos: 0, fusionados: 0 })
    expect(await diario.listJournalEntries(UID)).toHaveLength(1)
    expect(await readCollection(UID, 'breathing/favoritos')).toHaveLength(1)
    expect(await pendingCount(UID)).toBe(0)
  })
})

// ─── Criterio 3: sin validadores ──────────────────────────────────────────────

describe('criterio 3: la bajada no pasa por los validadores', () => {
  it('una mañana de agosto con granVision y feeling se escribe sin lanzar', async () => {
    enNube('diario/morningEntry/items/2026-08-10', {
      feeling: 'cansado',
      granVision: 'algo',
      updatedAt: '2026-08-10T07:00:00-05:00',
    })
    await expect(restaurar(UID)).resolves.toMatchObject({ ok: true, escritos: 1 })
    const dia = await diario.getMorningEntry(UID, '2026-08-10')
    expect(dia.feeling).toBe('cansado')
    expect(dia.granVision).toBe('algo')
  })

  it('una noche con closingFeeling y learning también', async () => {
    enNube('diario/nightRitual/items/2026-08-10', { closingFeeling: 'en_paz', learning: 'x' })
    await expect(restaurar(UID)).resolves.toMatchObject({ ok: true })
    expect((await diario.getNightRitual(UID, '2026-08-10')).closingFeeling).toBe('en_paz')
  })

  it('y un perfil con un campo que el modelo no admite ya, tal cual', async () => {
    enNube('shared/profile', { name: 'A', campoViejo: 1, updatedAt: T0 })
    await expect(restaurar(UID)).resolves.toMatchObject({ ok: true })
    expect((await shared.getProfile(UID)).campoViejo).toBe(1)
  })
})

// ─── Criterio 6: las tres reglas, desde la restauración ───────────────────────

describe('criterio 6: las tres reglas del §2 en la bajada', () => {
  it('regla 1: ruta ausente en local, la escribe lo remoto', async () => {
    enNube('diario/journal/items/j1', { text: 'de la nube', updatedAt: T0 })
    await restaurar(UID)
    expect((await diario.getJournalEntry(UID, 'j1')).text).toBe('de la nube')
  })

  it('regla 2: perfil sembrado (sin marca) frente a remoto con marca, gana el remoto', async () => {
    await shared.initShared(UID)
    expect(await shared.getProfile(UID)).not.toHaveProperty('updatedAt')
    enNube('shared/profile', { name: 'Alejandra', gender: 'f', updatedAt: T0 })

    const r = await restaurar(UID)
    expect(r).toMatchObject({ ok: true, fusionados: 1 })
    expect((await shared.getProfile(UID)).name).toBe('Alejandra')
    expect(await pendingCount(UID)).toBe(0)
  })

  it('regla 3: ambas sin marca, gana lo local', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/shared/profile`,
      collection: 'shared',
      id: 'profile',
      data: { name: 'de aquí' },
      sync: false,
    })
    enNube('shared/profile', { name: 'de allá' })
    const r = await restaurar(UID)
    expect(r).toMatchObject({ ok: true, escritos: 0, fusionados: 0 })
    expect((await shared.getProfile(UID)).name).toBe('de aquí')
  })

  it('regla 3: lo local más nuevo se conserva, lo remoto más nuevo gana', async () => {
    await diario.saveMorningEntry(UID, '2026-09-01', { action: 'local', updatedAt: T1 })
    await diario.saveMorningEntry(UID, '2026-09-02', { action: 'local', updatedAt: T0 })
    enNube('diario/morningEntry/items/2026-09-01', { action: 'remoto', updatedAt: T0 })
    enNube('diario/morningEntry/items/2026-09-02', { action: 'remoto', updatedAt: T1 })

    const r = await restaurar(UID)
    expect(r).toMatchObject({ ok: true, escritos: 0, fusionados: 1 })
    expect((await diario.getMorningEntry(UID, '2026-09-01')).action).toBe('local')
    expect((await diario.getMorningEntry(UID, '2026-09-02')).action).toBe('remoto')
  })

  it('cuando gana lo remoto, se escribe entero: nada de mezclar campos', async () => {
    await diario.saveMorningEntry(UID, '2026-09-01', { action: 'local', updatedAt: T0 })
    enNube('diario/morningEntry/items/2026-09-01', { reflection: 'remoto', updatedAt: T1 })
    await restaurar(UID)
    expect(await diario.getMorningEntry(UID, '2026-09-01')).toEqual({
      reflection: 'remoto',
      updatedAt: T1,
    })
  })

  it('criterio 5 desde la bajada: una sesión local nunca la pisa la remota', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/breathing/sesiones/items/s1`,
      collection: 'breathing/sesiones',
      id: 's1',
      data: { iniciadaEn: T0, local: true },
      sync: false,
    })
    enNube('breathing/sesiones/items/s1', { iniciadaEn: T1, updatedAt: T1 })
    await restaurar(UID)
    expect((await readPath(`users/${UID}/breathing/sesiones/items/s1`)).local).toBe(true)
  })

  it('un favorito fusiona por actualizadoEn', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/breathing/favoritos/items/f1`,
      collection: 'breathing/favoritos',
      id: 'f1',
      data: { nombre: 'viejo', actualizadoEn: T0 },
      sync: false,
    })
    enNube('breathing/favoritos/items/f1', { nombre: 'nuevo', actualizadoEn: T1 })
    await restaurar(UID)
    expect((await readPath(`users/${UID}/breathing/favoritos/items/f1`)).nombre).toBe('nuevo')
  })
})

// ─── Criterio 7: el PIN ───────────────────────────────────────────────────────

describe('criterio 7: el PIN no se lee ni se escribe', () => {
  it('aunque exista en la nube, no se pide y no llega', async () => {
    enNube('diario/pinConfig', {
      salt: 'x',
      hash: 'y',
      iterations: 1,
      algorithm: 'a',
      enabled: true,
    })
    enNube('shared/profile', { name: 'A', updatedAt: T0 })
    await restaurar(UID)
    expect(lecturas.some((r) => r.includes('pinConfig'))).toBe(false)
    expect(await diario.getPinConfig(UID)).toBeNull()
  })

  it('y un PIN local se queda como está', async () => {
    const pin = { salt: 'local', hash: 'h', iterations: 1, algorithm: 'a', enabled: true }
    await diario.savePinConfig(UID, pin)
    enNube('diario/pinConfig', {
      salt: 'nube',
      hash: 'h',
      iterations: 1,
      algorithm: 'a',
      enabled: true,
    })
    await restaurar(UID)
    expect((await diario.getPinConfig(UID)).salt).toBe('local')
  })
})

// ─── Criterio 8: interrupción ─────────────────────────────────────────────────

describe('criterio 8: una restauración interrumpida', () => {
  beforeEach(() => {
    enNube('shared/profile', { name: 'Alejandra', updatedAt: T0 })
    enNube('diario/journal/items/j1', { text: 'a', updatedAt: T0 })
    enNube('diario/nightRitual/items/2026-09-01', { release: 'b', updatedAt: T0 })
  })

  it('no deja marca, cuenta como fallo y conserva lo que ya bajó', async () => {
    fallarEn.ruta = 'diario/nightRitual/items'
    const r = await restaurar(UID)
    expect(r.ok).toBe(false)
    expect(r.motivo).toBe(MOTIVOS.interrumpida)
    expect(hayMarcaDeRestauracion(UID)).toBe(false)
    expect(ultimoResultado(UID)).toMatchObject({ ok: false })
    // Lo que alcanzó a bajar se queda: está escrito por ruta.
    expect((await shared.getProfile(UID)).name).toBe('Alejandra')
    expect(await diario.getJournalEntry(UID, 'j1')).not.toBeNull()
    expect(await diario.getNightRitual(UID, '2026-09-01')).toBeNull()
  })

  it('la siguiente corre entera y termina, sin duplicar lo que ya estaba', async () => {
    fallarEn.ruta = 'diario/nightRitual/items'
    await restaurar(UID)
    fallarEn.ruta = null
    const r = await restaurar(UID)
    expect(r).toEqual({ ok: true, escritos: 1, fusionados: 0 })
    expect(hayMarcaDeRestauracion(UID)).toBe(true)
    expect(await diario.listJournalEntries(UID)).toHaveLength(1)
    expect(await pendingCount(UID)).toBe(0)
  })

  it('un fallo no toca la marca de una restauración anterior que sí terminó', async () => {
    await restaurar(UID)
    expect(hayMarcaDeRestauracion(UID)).toBe(true)
    fallarEn.ruta = 'diario/journal/items'
    await restaurar(UID)
    expect(hayMarcaDeRestauracion(UID)).toBe(true)
  })
})

// ─── Paginación ───────────────────────────────────────────────────────────────

describe('subcolecciones grandes', () => {
  it('pagina de a TAMANO_PAGINA y no se deja ninguno', async () => {
    const total = TAMANO_PAGINA * 2 + 7
    for (let i = 0; i < total; i += 1) {
      enNube(`diario/journal/items/e${String(i).padStart(4, '0')}`, { text: String(i) })
    }
    const r = await restaurar(UID)
    expect(r).toEqual({ ok: true, escritos: total, fusionados: 0 })
    expect(await diario.listJournalEntries(UID)).toHaveLength(total)
    // Tres páginas para el journal, una para cada una de las otras seis.
    expect(lecturas.filter((l) => l.endsWith('diario/journal/items'))).toHaveLength(3)
  })

  it('una colección de exactamente una página pide una segunda vacía y termina', async () => {
    for (let i = 0; i < TAMANO_PAGINA; i += 1) {
      enNube(`diario/journal/items/e${String(i).padStart(4, '0')}`, { text: String(i) })
    }
    const r = await restaurar(UID)
    expect(r.escritos).toBe(TAMANO_PAGINA)
    expect(lecturas.filter((l) => l.endsWith('diario/journal/items'))).toHaveLength(2)
  })
})

// ─── Sin localStorage ─────────────────────────────────────────────────────────

describe('sin localStorage disponible', () => {
  it('restaura igual y simplemente no marca', async () => {
    vi.stubGlobal('localStorage', undefined)
    enNube('shared/profile', { name: 'A', updatedAt: T0 })
    const r = await restaurar(UID)
    expect(r.ok).toBe(true)
    expect(hayMarcaDeRestauracion(UID)).toBe(false)
  })
})
