// SPEC_24B — Con la marca de borrado puesta no sube ni baja nada de ese uid
// (criterio 8), la lista de borrado es la de la restauración (criterio 9) y el
// teléfono queda vacío según el inventario aprobado (criterio 13).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { UID, resetLocalDB } from './helpers.js'
import * as diario from '../diario.js'
import { enqueue, esRutaLocal, leerTodoDelUid, listQueue, writePath } from '../local.js'
import { cancelRetries, flush, startSync } from '../sync.js'
import { LISTA_DE_LA_NUBE, MOTIVOS, restaurar, rutasQueSeBorranSinLeer } from '../restaurar.js'
import { guardarMarcaDeBorrado, quitarMarcaDeBorrado } from '../marcaDeBorrado.js'
import { guardarClave, leerClave } from '../clavesDelTelefono.js'
import { SHARED_DOCS } from '../shared.js'
import { COLECCIONES as RESPIRACION } from '@/breathing/data/esquema'
import { vaciarTelefono } from '../../limpiezaDelTelefono.js'
import { completarMudanzaPendiente } from '../../entradaCuenta.js'

const OTRO = 'otra-cuenta'
const enviados = []
const lecturasDeFirebase = { n: 0 }

vi.mock('../../firebase.js', () => ({
  get db() {
    lecturasDeFirebase.n += 1
    return { __fake: true }
  },
}))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: async (ref) => {
    enviados.push(ref.path)
  },
  deleteDoc: async (ref) => {
    enviados.push(ref.path)
  },
}))

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    key: (i) => [...m.keys()][i] ?? null,
    get length() {
      return m.size
    },
  }
}

beforeEach(async () => {
  enviados.length = 0
  lecturasDeFirebase.n = 0
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
})

afterEach(() => {
  cancelRetries()
  vi.unstubAllGlobals()
})

describe('criterio 8: con la marca, nada sube para ese uid', () => {
  it('flush no envía ninguna entrada suya, y sí las de otro uid', async () => {
    await diario.saveMorningEntry(UID, '2026-11-14', { action: 'lo mío' })
    await diario.saveMorningEntry(OTRO, '2026-11-14', { action: 'lo de otra' })
    guardarMarcaDeBorrado(UID, { fase: 'nube' })
    await flush(null)
    expect(enviados).toEqual([`users/${OTRO}/diario/morningEntry/items/2026-11-14`])
    // Lo suyo sigue en la cola, intacto: «Conservar» lo necesita.
    expect(await listQueue(UID)).toHaveLength(1)
  })

  it('flush(uid) tampoco', async () => {
    await diario.saveMorningEntry(UID, '2026-11-14', { action: 'lo mío' })
    guardarMarcaDeBorrado(UID, { fase: 'revocando' })
    const r = await flush(UID)
    expect(enviados).toEqual([])
    expect(r.pending).toBe(1)
  })

  it('startSync no arranca nada para un uid marcado', async () => {
    await diario.saveMorningEntry(UID, '2026-11-14', { action: 'lo mío' })
    guardarMarcaDeBorrado(UID, { fase: 'nube' })
    const parar = startSync(UID)
    await new Promise((r) => setTimeout(r, 20))
    parar()
    expect(enviados).toEqual([])
  })

  it('sin la marca, todo vuelve a subir', async () => {
    await diario.saveMorningEntry(UID, '2026-11-14', { action: 'lo mío' })
    guardarMarcaDeBorrado(UID, { fase: 'nube' })
    await flush(UID)
    quitarMarcaDeBorrado(UID)
    await flush(UID)
    expect(enviados).toEqual([`users/${UID}/diario/morningEntry/items/2026-11-14`])
  })

  it('cada disparador termina en flush, y la guarda está dentro del bucle', () => {
    const fuente = readFileSync('src/lib/db/sync.js', 'utf8')
    expect(fuente).toMatch(
      /for \(const entry of queue\) \{\s+[\s\S]{0,600}if \(hayMarcaDeBorrado\(entry\.uid\)\) continue/,
    )
    expect(fuente).toMatch(/function scheduleRetry[\s\S]{0,200}hayMarcaDeBorrado\(uid\)/)
    expect(fuente).toMatch(
      /export function startSync\(uid\) \{[\s\S]{0,200}hayMarcaDeBorrado\(uid\)/,
    )
  })
})

describe('criterio 8: con la marca, nada baja para ese uid', () => {
  it('restaurar no lee nada, no marca y dice «borrando»', async () => {
    guardarMarcaDeBorrado(UID, { fase: 'nube' })
    const r = await restaurar(UID)
    expect(r.ok).toBe(false)
    expect(r.motivo).toBe(MOTIVOS.borrando)
    expect(lecturasDeFirebase.n).toBe(0)
    expect(leerClave(`strivo.restaurado.${UID}`)).toBe(null)
  })

  it('una mudanza pendiente hacia la cuenta no se completa', async () => {
    guardarClave(`strivo.mudanzaPendiente.${UID}`, 'local-x')
    await writePath({
      uid: 'local-x',
      path: 'users/local-x/diario/journal/items/a',
      collection: 'diario/journal',
      id: 'a',
      data: { text: 'x', updatedAt: 'y' },
      sync: false,
    })
    guardarMarcaDeBorrado(UID, { fase: 'nube' })
    expect(await completarMudanzaPendiente(UID)).toBe(null)
    expect(await listQueue(UID)).toEqual([])
  })
})

describe('criterio 9: la lista de borrado es la de la restauración', () => {
  // Todo lo que `sync.js` puede llegar a encolar, construido desde el esquema
  // y no copiado de la lista: si alguien añade una colección sin añadirla a la
  // lista de la nube, esto falla.
  const encolables = () => {
    const rutas = [
      ...SHARED_DOCS.map((doc) => `shared/${doc}`),
      'shared/frases',
      'diario/pinConfig',
      ...['journal', 'morningEntry', 'nightRitual', 'dayState', 'frasesDelDia'].map(
        (c) => `diario/${c}/items/x`,
      ),
      'breathing/unica',
      ...Object.entries(RESPIRACION)
        .filter(([clave]) => clave !== 'preferencias')
        .map(([, coleccion]) => `${coleccion}/items/x`),
    ]
    return rutas.filter((ruta) => !esRutaLocal(`users/${UID}/${ruta}`))
  }

  it('cada ruta que puede subir está cubierta por la lista que se enumera para borrar', () => {
    const cubre = (ruta) =>
      LISTA_DE_LA_NUBE.documentos.includes(ruta) ||
      LISTA_DE_LA_NUBE.subcolecciones.some((items) => ruta.startsWith(`${items}/`))
    const sinCubrir = encolables().filter((ruta) => !cubre(ruta))
    expect(sinCubrir).toEqual([])
  })

  it('lo que vive solo en el teléfono no está en la lista, salvo pinConfig, que se borra sin leerlo', () => {
    expect(LISTA_DE_LA_NUBE.documentos).not.toContain('shared/frases')
    expect(rutasQueSeBorranSinLeer(UID)).toEqual([`users/${UID}/diario/pinConfig`])
  })

  it('la lista de la nube que conoce el borrado es exactamente la de la restauración', () => {
    expect([...LISTA_DE_LA_NUBE.documentos].sort()).toEqual([
      'breathing/unica',
      'shared/auth',
      'shared/onboarding',
      'shared/preferences',
      'shared/profile',
    ])
    expect(LISTA_DE_LA_NUBE.subcolecciones).toHaveLength(7)
  })

  it('una ruta que la app podría escribir y la lista no conoce se encolaría igual: esta prueba la vería', async () => {
    await enqueue({ uid: UID, path: `users/${UID}/diario/inventada/items/x`, op: 'put', data: {} })
    const encolada = (await listQueue(UID))[0].path.replace(`users/${UID}/`, '')
    const cubierta = LISTA_DE_LA_NUBE.subcolecciones.some((i) => encolada.startsWith(`${i}/`))
    expect(cubierta).toBe(false)
  })
})

describe('criterio 13: el teléfono queda vacío según el inventario', () => {
  it('filas y cola de todos los uid, claves strivo.* de las cuatro familias; se queda strivo.almacen', async () => {
    await diario.saveMorningEntry(UID, '2026-11-14', { action: 'lo mío' })
    await diario.saveMorningEntry('local-viejo', '2026-11-13', { action: 'de antes de entrar' })
    guardarClave('strivo.uid.local', UID)
    guardarClave(`strivo.restaurado.${UID}`, 'si')
    guardarClave(`strivo.mudanzaPendiente.${UID}`, 'local-viejo')
    guardarMarcaDeBorrado(UID, { fase: 'telefono' })
    localStorage.setItem('strivo.almacen', 'sqlite')

    const avisos = vi.fn(async () => {})
    const faceId = vi.fn(async () => {})
    const copiaVieja = vi.fn(async () => true)
    await vaciarTelefono({ avisos, faceId, copiaVieja })

    expect(await leerTodoDelUid(UID)).toEqual([])
    expect(await leerTodoDelUid('local-viejo')).toEqual([])
    expect(await listQueue(null)).toEqual([])
    for (const clave of [
      'strivo.uid.local',
      `strivo.restaurado.${UID}`,
      `strivo.mudanzaPendiente.${UID}`,
      `strivo.borrado.${UID}`,
    ]) {
      expect(leerClave(clave)).toBe(null)
    }
    expect(localStorage.getItem('strivo.almacen')).toBe('sqlite')
    expect(avisos).toHaveBeenCalledTimes(1)
    expect(faceId).toHaveBeenCalledTimes(1)
    expect(copiaVieja).toHaveBeenCalledTimes(1)
  })

  it('la copia vieja de IndexedDB solo se borra en la app nativa y con la sesión sobre SQLite', () => {
    const fuente = readFileSync('src/lib/limpiezaDelTelefono.js', 'utf8')
    expect(fuente).toMatch(
      /if \(!nativa \|\| !idb \|\| adaptador\(\)\.nombre !== 'sqlite'\) return false/,
    )
    expect(fuente).toMatch(/deleteDatabase\(nombre\)/)
  })

  it('la base SQLite se vacía, no se borra ni se mueve (DP-17B.2)', () => {
    const sqlite = readFileSync('src/lib/db/adaptadorSQLite.js', 'utf8')
    expect(sqlite).toMatch(/DELETE FROM registros', valores: \[\] \}/)
    expect(sqlite).not.toMatch(/DROP TABLE|unlink|removeItem\(at/)
  })
})
