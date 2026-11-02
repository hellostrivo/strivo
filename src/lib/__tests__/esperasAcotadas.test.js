// src/lib/__tests__/esperasAcotadas.test.js
// Ningún botón se queda sin respuesta (SPEC_31, criterio 5) y la pista de
// D-N8 en la frase de contraseña equivocada (criterio 10).
//
// Con Firestore colgado —escrituras y lecturas que no contestan nunca—,
// «Intentar de nuevo» (`reintentarYMirar`) y la comprobación de «Cerrar sesión»
// (`comprobarSalida`) contestan pasado el techo, y lo que dicen es lo que ya
// decían: `sinExito` y `pendiente`. Cerrar sesión sigue sin dejar salir con
// algo pendiente (DP-19.1).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as diario from '@lib/db/diario'
import { pendingCount } from '@lib/db/local'
import { cancelRetries } from '@lib/db/sync'
import { LIMITE_DE_RED_MS } from '@lib/db/limite'
import { resetLocalDB } from '@lib/db/__tests__/helpers.js'
import { ESTADOS_SESION, TECHO_DE_ESPERA_MS } from '../sesion.js'
import { copy } from '@copy'

const CUENTA = 'AbC123firebaseUid'
const T0 = '2026-11-01T12:00:00.000Z'

const sesion = { cerradas: 0 }
vi.mock('../cuenta.js', async (original) => ({
  ...(await original()),
  cerrarSesion: async () => {
    sesion.cerradas += 1
  },
}))

vi.mock('../firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: () => new Promise(() => {}),
  deleteDoc: () => new Promise(() => {}),
  disableNetwork: async () => {},
  enableNetwork: async () => {},
}))

// La restauración se dobla entera: aquí no se prueba cómo baja (eso es
// `restaurar.test.js`), sino que el botón no la espera sin fin.
const bajada = { ultimo: null }
vi.mock('../db/restaurar.js', async (original) => ({
  ...(await original()),
  ultimoResultado: () => bajada.ultimo,
  restaurar: () => new Promise(() => {}),
}))

const { SALIDA, comprobarSalida, salirDeCuenta } = await import('../salidaCuenta.js')
const { ACUSES, estadoDe, reintentarYMirar } = await import('@/perfil/useSincronizacion')
const { MOTIVOS, claveDeError } = await import('../cuenta.js')

async function asentar(vueltas = 20) {
  for (let i = 0; i < vueltas; i += 1) await new Promise((r) => globalThis.setImmediate(r))
}

const mirar = async () =>
  estadoDe({
    estadoSesion: ESTADOS_SESION.conCuenta,
    enLinea: true,
    pendientes: await pendingCount(CUENTA),
    ultimaRestauracion: null,
  })

beforeEach(async () => {
  sesion.cerradas = 0
  bajada.ultimo = null
  vi.stubGlobal('navigator', { onLine: true })
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  })
  await resetLocalDB()
  await diario.saveMorningEntry(CUENTA, '2026-11-01', { action: 'x', updatedAt: T0 })
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(async () => {
  // Deja vencer lo que quedó colgado antes de borrar la base.
  await vi.advanceTimersByTimeAsync(LIMITE_DE_RED_MS * 4)
  await asentar()
  cancelRetries()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Corre `promesa` moviendo el reloj hasta `ms`, y devuelve lo que contestó. */
async function aLos(promesa, ms) {
  let hecho = false
  let valor
  promesa.then((v) => {
    hecho = true
    valor = v
  })
  await asentar()
  await vi.advanceTimersByTimeAsync(ms)
  await asentar()
  return { hecho, valor }
}

describe('criterio 5: con Firestore colgado, los botones contestan', () => {
  it('«Intentar de nuevo» contesta sinExito, y como mucho al techo', async () => {
    const { hecho, valor } = await aLos(reintentarYMirar(CUENTA, mirar), TECHO_DE_ESPERA_MS)
    expect(hecho).toBe(true)
    expect(valor).toBe(ACUSES.sinExito)
    expect(await pendingCount(CUENTA)).toBe(1)
  })

  it('también con la restauración fallida por delante, que tampoco contesta', async () => {
    bajada.ultimo = { ok: false, motivo: 'interrumpida' }

    const { hecho, valor } = await aLos(reintentarYMirar(CUENTA, mirar), TECHO_DE_ESPERA_MS)
    expect(hecho).toBe(true)
    expect(valor).toBe(ACUSES.sinExito)
  })

  it('el techo manda aunque lo de dentro tarde más', async () => {
    const { hecho } = await aLos(reintentarYMirar(CUENTA, mirar, { techoMs: 50 }), 50)
    expect(hecho).toBe(true)
  })

  it('la comprobación de salida contesta pendiente', async () => {
    const { hecho, valor } = await aLos(comprobarSalida(CUENTA), TECHO_DE_ESPERA_MS)
    expect(hecho).toBe(true)
    expect(valor).toBe(SALIDA.pendiente)
  })

  it('y cerrar sesión lo dice sin cerrar ni borrar nada (DP-19.1)', async () => {
    const { hecho, valor } = await aLos(salirDeCuenta(CUENTA), TECHO_DE_ESPERA_MS)
    expect(hecho).toBe(true)
    expect(valor).toEqual({ ok: false, motivo: SALIDA.pendiente })
    expect(sesion.cerradas).toBe(0)
    expect(await diario.getMorningEntry(CUENTA, '2026-11-01')).not.toBeNull()
  })
})

describe('criterio 10: la pista de D-N8', () => {
  it('en web nombra solo Google; en el iPhone, Google y Apple', () => {
    expect(claveDeError(MOTIVOS.credenciales, false)).toBe('credenciales')
    expect(claveDeError(MOTIVOS.credenciales, true)).toBe('credencialesNativa')
    expect(copy.cuenta.error.credenciales).toBe(
      'Ese correo y esa contraseña no coinciden. Si alguna vez entraste con Google, prueba con ese botón.',
    )
    expect(copy.cuenta.error.credencialesNativa).toBe(
      'Ese correo y esa contraseña no coinciden. Si alguna vez entraste con Google o con Apple, prueba con ese botón.',
    )
    expect(copy.cuenta.error.credenciales).not.toMatch(/Apple/)
  })

  it('el correo ya en uso lleva la misma frase, y lo demás no cambia', () => {
    expect(claveDeError(MOTIVOS.correoEnUso, true)).toBe('credencialesNativa')
    expect(claveDeError(MOTIVOS.sinConexion, true)).toBe('sinConexion')
    expect(claveDeError(MOTIVOS.otroMetodo, true)).toBe('otroMetodo')
    expect(claveDeError(MOTIVOS.rechazado, true)).toBeNull()
  })
})
