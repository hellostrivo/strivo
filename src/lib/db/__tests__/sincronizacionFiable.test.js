// src/lib/db/__tests__/sincronizacionFiable.test.js
// Que lo escrito suba solo y ninguna espera de red sea infinita (SPEC_31).
//
// Criterios automáticos 2, 3, 6 y 7, más H-1, H-2 y H-3 del reporte previo
// y los dos añadidos de la aprobación: reabrir la conexión tras un límite
// vencido (4a) y vaciar en el acto al irse al fondo (4b).
//
// Firestore de mentira con tres modos por escritura: contesta, falla, o se
// cuelga hasta que alguien la suelte —que es lo que hace el SDK de verdad con
// una conexión muerta—. `enableNetwork` revive la conexión: es el doble que
// «se cuelga y luego responde» que pide 4a.
//
// Los relojes son de mentira solo para `setTimeout`: la base de pruebas
// (fake-indexeddb) programa con `setImmediate` y sigue corriendo de verdad.
//
// El criterio 4 —una lectura de `restaurar` colgada— está en
// `restaurar.test.js`, que es donde puede nombrar las lecturas de Firestore.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

import * as diario from '../diario.js'
import { enqueue, getLocalDB, listQueue, STORE_SYNC_QUEUE } from '../local.js'
import {
  DEMORA_DE_SUBIDA_MS,
  RETRY_BACKOFF_MS,
  cancelRetries,
  flush,
  flushEnCurso,
  startSync,
} from '../sync.js'
import { LIMITE_DE_RED_MS, LimiteVencido, conLimite, esLimiteVencido } from '../limite.js'
import { EN_SQLITE, UID, resetLocalDB } from './helpers.js'

// ─── Firestore de mentira ─────────────────────────────────────────────────────

const nube = {
  escrituras: [], // { path, data } confirmadas
  llamadas: [], // lo que se pidió, en orden: 'set:<ruta>', 'disable', 'enable'
  muerta: false, // las escrituras se cuelgan hasta `enableNetwork`
  falla: false, // las escrituras se rechazan
  retener: false, // la siguiente escritura espera a `soltar()`
  soltar: null,
  disableCuelga: false,
  colgadas: [], // escrituras colgadas: al soltarlas, confirman
}

function reiniciarNube() {
  nube.escrituras.length = 0
  nube.llamadas.length = 0
  nube.muerta = false
  nube.falla = false
  nube.retener = false
  nube.soltar = null
  nube.disableCuelga = false
  nube.colgadas.length = 0
}

vi.mock('../../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => {
  const escribir = (path, data) => {
    nube.llamadas.push(`set:${path}`)
    if (nube.falla) return Promise.reject(new Error('rechazado'))
    if (nube.muerta) {
      return new Promise((resolve) =>
        nube.colgadas.push(() => {
          nube.escrituras.push({ path, data })
          resolve()
        }),
      )
    }
    if (nube.retener) {
      nube.retener = false
      return new Promise((resolve) => {
        nube.soltar = () => {
          nube.escrituras.push({ path, data })
          resolve()
        }
      })
    }
    nube.escrituras.push({ path, data })
    return Promise.resolve()
  }
  return {
    doc: (_db, path) => ({ path }),
    setDoc: (ref, data) => escribir(ref.path, data),
    deleteDoc: (ref) => escribir(ref.path, null),
    disableNetwork: () => {
      nube.llamadas.push('disable')
      return nube.disableCuelga ? new Promise(() => {}) : Promise.resolve()
    },
    enableNetwork: () => {
      nube.llamadas.push('enable')
      nube.muerta = false
      return Promise.resolve()
    },
  }
})

// ─── Ayudas ───────────────────────────────────────────────────────────────────

/** Deja correr la base y las promesas sin mover el reloj de mentira. */
async function asentar(vueltas = 20) {
  for (let i = 0; i < vueltas; i += 1) await new Promise((r) => globalThis.setImmediate(r))
}

/**
 * Deja correr la base hasta que se cumpla `cond`. Antes de mover el reloj hay
 * que saber que el temporizador ya existe: con la máquina cargada, un número
 * fijo de vueltas no siempre basta.
 */
async function hasta(cond) {
  for (let i = 0; i < 1000; i += 1) {
    if (cond()) return
    await new Promise((r) => globalThis.setImmediate(r))
  }
  throw new Error('la condición no llegó a cumplirse')
}

const pedidas = (ruta) => () => setsA(ruta).length

/** Espera a que no quede ningún vaciado en marcha. */
async function sinVaciado() {
  for (let i = 0; i < 50; i += 1) {
    const enVuelo = flushEnCurso()
    if (enVuelo) await enVuelo
    await asentar(5)
    if (!flushEnCurso()) return
  }
}

const RUTA = `users/${UID}/diario/morningEntry/items/2026-11-01`
const escrito = (texto) => diario.saveMorningEntry(UID, '2026-11-01', { action: texto })
const setsA = (ruta) => nube.llamadas.filter((l) => l === `set:${ruta}`)

function conRed(online) {
  vi.stubGlobal('navigator', { onLine: online })
}

function conVentana() {
  const ventana = new globalThis.EventTarget()
  const documento = new globalThis.EventTarget()
  documento.visibilityState = 'visible'
  vi.stubGlobal('window', ventana)
  vi.stubGlobal('document', documento)
  return { ventana, documento }
}

let parar = null

beforeEach(async () => {
  reiniciarNube()
  await resetLocalDB()
  conRed(true)
  vi.stubGlobal('localStorage', {
    m: new Map(),
    getItem(k) {
      return this.m.has(k) ? this.m.get(k) : null
    },
    setItem(k, v) {
      this.m.set(k, String(v))
    },
    removeItem(k) {
      this.m.delete(k)
    },
  })
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(async () => {
  parar?.()
  parar = null
  cancelRetries()
  // Las escrituras colgadas se sueltan para que ningún vaciado quede a medias.
  nube.muerta = false
  for (const soltar of nube.colgadas.splice(0)) soltar()
  nube.soltar?.()
  await vi.advanceTimersByTimeAsync(LIMITE_DE_RED_MS)
  await sinVaciado()
  cancelRetries()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

// ─── Las constantes, cada una en su sitio ────────────────────────────────────

describe('una regla, un sitio: los tiempos aprobados', () => {
  it('el límite es de 10 s, la demora de 2 s y la escala la aprobada', () => {
    expect(LIMITE_DE_RED_MS).toBe(10000)
    expect(DEMORA_DE_SUBIDA_MS).toBe(2000)
    expect([...RETRY_BACKOFF_MS]).toEqual([2000, 5000, 10000, 20000, 30000])
  })

  it('ni sync.js ni restaurar.js escriben un límite a mano', () => {
    for (const archivo of ['sync.js', 'restaurar.js']) {
      const codigo = readFileSync(join(process.cwd(), 'src/lib/db', archivo), 'utf8')
      // Cada espera con límite usa el que le pasan, y ese sale de la constante.
      const usos = codigo.split('\n').filter((l) => l.includes('conLimite('))
      expect(usos.length).toBeGreaterThan(0)
      for (const uso of usos) expect(uso).toMatch(/limiteMs\)/)
      expect(codigo).toMatch(/limiteMs = LIMITE_DE_RED_MS/)
    }
  })

  it('conLimite deja pasar lo que contesta y rechaza lo que no', async () => {
    await expect(conLimite(Promise.resolve('ya'), 50)).resolves.toBe('ya')
    const colgada = conLimite(new Promise(() => {}), 50)
    const resultado = colgada.catch((e) => e)
    await vi.advanceTimersByTimeAsync(50)
    const error = await resultado
    expect(error).toBeInstanceOf(LimiteVencido)
    expect(esLimiteVencido(error)).toBe(true)
    expect(esLimiteVencido(new Error('otra cosa'))).toBe(false)
  })
})

// ─── Criterio 2: escribir pone la cola en marcha (DP-31.3) ───────────────────

describe('criterio 2: tras escribir, la cola se vacía sola', () => {
  it('sin online, sin visibilidad y sin botón, a los 2 s', async () => {
    parar = startSync(UID)
    await sinVaciado()

    await escrito('Salir a caminar.')
    await asentar()
    expect(nube.escrituras).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await sinVaciado()
    expect(nube.escrituras.map((e) => e.path)).toEqual([RUTA])
    expect(await listQueue(UID)).toHaveLength(0)
  })

  it('diez escrituras seguidas son un solo vaciado', async () => {
    parar = startSync(UID)
    await sinVaciado()

    for (let i = 1; i <= 10; i += 1) await escrito(`versión ${i}`)
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await sinVaciado()

    expect(setsA(RUTA)).toHaveLength(1)
    expect(nube.escrituras[0].data.action).toBe('versión 10')
  })

  it('escribir no reinicia la espera: nada espera más que la demora', async () => {
    parar = startSync(UID)
    await sinVaciado()

    await escrito('a')
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS - 500)
    await escrito('b')
    await vi.advanceTimersByTimeAsync(500)
    await sinVaciado()
    expect(nube.escrituras.map((e) => e.data.action)).toEqual(['b'])
  })

  it('lo escrito durante un vaciado sale en otra vuelta', async () => {
    parar = startSync(UID)
    await sinVaciado()

    await escrito('primera')
    nube.retener = true
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await hasta(() => nube.soltar)

    await diario.saveDayState(UID, '2026-11-01', { mood: 'tranquilo' })
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    nube.soltar()
    await sinVaciado()
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await sinVaciado()

    expect(await listQueue(UID)).toHaveLength(0)
  })

  it('sin startSync escribir no vacía nada: la cola de las demás pruebas sigue igual', async () => {
    await escrito('x')
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS * 5)
    await asentar()
    expect(nube.escrituras).toHaveLength(0)
    expect(await listQueue(UID)).toHaveLength(1)
  })

  it('al parar startSync, una escritura armada ya no sale', async () => {
    parar = startSync(UID)
    await sinVaciado()
    await escrito('x')
    parar()
    parar = null
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await asentar()
    expect(nube.escrituras).toHaveLength(0)
  })
})

// ─── 4b: al irse al fondo, en el acto ────────────────────────────────────────

describe('4b: irse al fondo vacía en el acto', () => {
  it('visibilitychange a oculto no espera la demora', async () => {
    const { documento } = conVentana()
    parar = startSync(UID)
    await sinVaciado()

    await escrito('antes de irme')
    documento.visibilityState = 'hidden'
    documento.dispatchEvent(new globalThis.Event('visibilitychange'))
    await sinVaciado()

    expect(nube.escrituras.map((e) => e.path)).toEqual([RUTA])
  })

  it('pagehide tampoco', async () => {
    const { ventana } = conVentana()
    parar = startSync(UID)
    await sinVaciado()

    await escrito('antes de irme')
    ventana.dispatchEvent(new globalThis.Event('pagehide'))
    await sinVaciado()

    expect(nube.escrituras.map((e) => e.path)).toEqual([RUTA])
  })
})

// ─── Criterio 3: una escritura colgada cuenta como fallo ─────────────────────

describe('criterio 3: un setDoc que nunca contesta, pasado el límite', () => {
  it('la entrada sigue, flushing vuelve a false y se programa el reintento', async () => {
    await escrito('x')
    nube.muerta = true

    const vaciado = flush(UID, { limiteMs: 50 })
    await hasta(pedidas(RUTA))
    expect(flushEnCurso()).toBeInstanceOf(Promise)
    await vi.advanceTimersByTimeAsync(50)
    const r = await vaciado

    expect(r).toMatchObject({ sent: 0, pending: 1 })
    expect(flushEnCurso()).toBeNull()
    const [entrada] = await listQueue(UID)
    expect(entrada.attempts).toBe(1)
    expect(vi.getTimerCount()).toBe(1) // el reintento

    // El siguiente vaciado no contesta `en_curso`.
    const siguiente = await flush(UID, { limiteMs: 50 })
    expect(siguiente.skipped).toBeUndefined()
  })

  it('flushEnCurso termina aunque la escritura siga colgada', async () => {
    await escrito('x')
    nube.muerta = true
    flush(UID, { limiteMs: 50 })
    await hasta(pedidas(RUTA))
    const enVuelo = flushEnCurso()
    await vi.advanceTimersByTimeAsync(50)
    await expect(enVuelo).resolves.toBeUndefined()
  })

  it('el reintento sale solo con la escala, sin botón', async () => {
    await escrito('x')
    nube.falla = true
    await flush(UID)
    nube.falla = false

    await vi.advanceTimersByTimeAsync(RETRY_BACKOFF_MS[0])
    await sinVaciado()
    expect(await listQueue(UID)).toHaveLength(0)
  })
})

// ─── 4a: tras un límite vencido, se reabre la conexión ───────────────────────

describe('4a: la conexión muerta se reabre antes del siguiente intento', () => {
  it('se cuelga, vence, se reabre y entonces responde', async () => {
    await escrito('x')
    nube.muerta = true

    const primero = flush(UID, { limiteMs: 50 })
    await hasta(pedidas(RUTA))
    await vi.advanceTimersByTimeAsync(50)
    await primero
    expect(await listQueue(UID)).toHaveLength(1)

    const segundo = await flush(UID, { limiteMs: 50 })
    expect(segundo).toMatchObject({ sent: 1, pending: 0 })
    expect(nube.llamadas).toEqual([`set:${RUTA}`, 'disable', 'enable', `set:${RUTA}`])
  })

  it('con el reintento automático, sin tocar nada', async () => {
    await escrito('x')
    nube.muerta = true
    const primero = flush(UID, { limiteMs: 50 })
    await hasta(pedidas(RUTA))
    await vi.advanceTimersByTimeAsync(50)
    await primero

    await vi.advanceTimersByTimeAsync(RETRY_BACKOFF_MS[0])
    await sinVaciado()
    expect(await listQueue(UID)).toHaveLength(0)
    expect(nube.llamadas).toContain('enable')
  })

  it('un rechazo de Firestore no reabre nada: la conexión no estaba muerta', async () => {
    await escrito('x')
    nube.falla = true
    await flush(UID)
    nube.falla = false
    cancelRetries()

    await flush(UID)
    expect(nube.llamadas).not.toContain('disable')
    expect(nube.llamadas).not.toContain('enable')
  })

  it('enableNetwork se pide aunque disableNetwork no conteste', async () => {
    await escrito('x')
    nube.muerta = true
    const primero = flush(UID, { limiteMs: 50 })
    await hasta(pedidas(RUTA))
    await vi.advanceTimersByTimeAsync(50)
    await primero
    cancelRetries()

    nube.disableCuelga = true
    const segundo = flush(UID, { limiteMs: 50 })
    await hasta(() => nube.llamadas.includes('disable'))
    await vi.advanceTimersByTimeAsync(50)
    await segundo
    expect(nube.llamadas.slice(1, 3)).toEqual(['disable', 'enable'])
    expect(await listQueue(UID)).toHaveLength(0)
  })

  it('reabrir no pierde la escritura colgada: al revivir, confirma', async () => {
    await escrito('x')
    nube.muerta = true
    const primero = flush(UID, { limiteMs: 50 })
    await hasta(pedidas(RUTA))
    await vi.advanceTimersByTimeAsync(50)
    await primero

    for (const soltar of nube.colgadas.splice(0)) soltar()
    await asentar()
    expect(nube.escrituras.map((e) => e.path)).toEqual([RUTA])
  })
})

// ─── Criterio 6 y H-3: sin red no se gasta nada ──────────────────────────────

describe('criterio 6: sin red no se programa ningún reintento', () => {
  it('un fallo con la red ya caída no arma temporizador (H-3)', async () => {
    await escrito('x')
    nube.falla = true
    nube.llamadas.length = 0
    const vaciado = flush(UID)
    conRed(false)
    await vaciado
    expect(vi.getTimerCount()).toBe(0)
    expect(await listQueue(UID)).toHaveLength(1)
  })

  it('al llegar online, se vacía', async () => {
    const { ventana } = conVentana()
    conRed(false)
    parar = startSync(UID)
    await escrito('sin red')
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await asentar()
    expect(nube.escrituras).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)

    conRed(true)
    ventana.dispatchEvent(new globalThis.Event('online'))
    await sinVaciado()
    expect(await listQueue(UID)).toHaveLength(0)
  })

  it('irse la red cancela el reintento pendiente', async () => {
    const { ventana } = conVentana()
    parar = startSync(UID)
    await sinVaciado()
    await escrito('x')
    nube.falla = true
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await sinVaciado()
    expect(vi.getTimerCount()).toBe(1)

    conRed(false)
    ventana.dispatchEvent(new globalThis.Event('offline'))
    expect(vi.getTimerCount()).toBe(0)
  })
})

// ─── H-1: no se saca de la cola lo que se reescribió mientras viajaba ────────

describe('H-1: lo reescrito durante el envío se queda para el siguiente', () => {
  it('la versión nueva no se pierde camino de la nube', async () => {
    await escrito('vieja')
    nube.retener = true
    const vaciado = flush(UID)
    await hasta(() => nube.soltar)

    await escrito('nueva')
    nube.soltar()
    await vaciado

    const cola = await listQueue(UID)
    expect(cola).toHaveLength(1)
    expect(cola[0].data.action).toBe('nueva')

    await flush(UID)
    expect(nube.escrituras.map((e) => e.data.action)).toEqual(['vieja', 'nueva'])
    expect(await listQueue(UID)).toHaveLength(0)
  })

  // Escribe en IndexedDB por dentro; su equivalente en SQLite está en adaptadorSQLite.test.js.
  it.skipIf(EN_SQLITE)('una entrada de antes de SPEC_31, sin rev, sale igual', async () => {
    const db = await getLocalDB()
    await db.add(STORE_SYNC_QUEUE, {
      uid: UID,
      path: RUTA,
      op: 'put',
      data: { action: 'de antes' },
      attempts: 0,
      enqueuedAt: '2026-10-01T10:00:00.000Z',
    })
    expect(await flush(UID)).toMatchObject({ sent: 1, pending: 0 })
  })

  // Escribe en IndexedDB por dentro; su equivalente en SQLite está en adaptadorSQLite.test.js.
  it.skipIf(EN_SQLITE)('y si se reescribe mientras viaja, la nueva se queda', async () => {
    const db = await getLocalDB()
    await db.add(STORE_SYNC_QUEUE, {
      uid: UID,
      path: RUTA,
      op: 'put',
      data: { action: 'de antes' },
      attempts: 0,
      enqueuedAt: '2026-10-01T10:00:00.000Z',
    })
    nube.retener = true
    const vaciado = flush(UID)
    await hasta(() => nube.soltar)
    await enqueue({ uid: UID, path: RUTA, op: 'put', data: { action: 'nueva' } })
    nube.soltar()
    await vaciado

    const cola = await listQueue(UID)
    expect(cola).toHaveLength(1)
    expect(cola[0]).toMatchObject({ rev: 1, data: { action: 'nueva' } })
  })
})

// ─── H-2: dos vaciados a la vez son uno ──────────────────────────────────────

describe('H-2: dos llamadas en el mismo instante no envían dos veces', () => {
  it('la segunda contesta en_curso', async () => {
    await escrito('x')
    const [a, b] = await Promise.all([flush(UID), flush(UID)])
    expect([a.skipped, b.skipped]).toContain('en_curso')
    expect(setsA(RUTA)).toHaveLength(1)
  })
})

// ─── Criterio 7: lo local sigue sin salir ────────────────────────────────────

describe('criterio 7: el disparo no saca nada que no deba salir', () => {
  it('pinConfig no entra en la cola ni con startSync activo', async () => {
    parar = startSync(UID)
    await sinVaciado()
    await diario.savePinConfig(UID, {
      salt: 's',
      hash: 'h',
      iterations: 1,
      algorithm: 'PBKDF2-SHA256',
      enabled: true,
    })
    await vi.advanceTimersByTimeAsync(DEMORA_DE_SUBIDA_MS)
    await sinVaciado()
    expect(await listQueue(UID)).toHaveLength(0)
    expect(nube.llamadas.some((l) => l.includes('pinConfig'))).toBe(false)
  })
})
