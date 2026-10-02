// src/perfil/__tests__/sincronizacion.test.js
// El bloque "Dónde vive lo que escribes" (SPEC_17A §4.6; criterio manual 17,
// aquí su mitad automática).
//
// Lo que decide el estado es `estadoDe`, sin React: se prueba con los tres
// datos delante. Del hook y de la pantalla se comprueba la fuente —que
// sondea y no se suscribe, que no toca `sync.js`, que anuncia con texto—,
// porque no hay DOM en el que montarlos.

import { readFileSync } from 'fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { copy } from '@copy'
import { BLOQUES } from '@/perfil/bloques'
import * as diario from '@/lib/db/diario'
import { resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { alTerminarRestauracion, olvidarResultados, restaurar } from '@/lib/db/restaurar'
import { pendingCount } from '@/lib/db/local'
import { cancelRetries, flush } from '@/lib/db/sync'
import { ACUSES, ESTADOS, estadoDe, reintentarYMirar } from '@/perfil/useSincronizacion'

const textos = copy.diario.perfil.sincronizacion
const CUENTA = 'AbC123firebaseUid'

// La sesión la dice Firebase desde SPEC_19.1, no el uid: estas pruebas pasan
// el estado de sesión que daría `useSesion`.
const CON = 'conCuenta'
const SIN = 'sinCuenta'

// Firestore de mentira para el reintento: un setDoc que se puede colgar.
const nube = { colgar: false, soltar: null }
vi.mock('@/lib/firebase', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: async () => {
    if (nube.colgar) await new Promise((resolve) => (nube.soltar = resolve))
  },
  deleteDoc: async () => {},
}))

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('el bloque existe entero: identificador, copy y componente', () => {
  it('está declarado, y al final', () => {
    expect(BLOQUES[BLOQUES.length - 1]).toBe('sincronizacion')
  })

  it('su copy es el del §5, cerrado', () => {
    expect(textos).toEqual({
      titulo: 'Dónde vive lo que escribes',
      hint: 'Lo tuyo se guarda aquí primero y se respalda después.',
      alDia: 'Todo guardado',
      pendiente: 'Guardando',
      sinConexion: 'Sin conexión. Se guardará cuando vuelva.',
      sinCuenta: 'Sin cuenta, lo escrito vive solo en este teléfono.',
      reintentar: 'Intentar de nuevo',
    })
    expect(copy.shared.restauracion).toEqual({
      enCurso: 'Recuperando lo que escribiste.',
      error: 'No pudimos recuperar todo ahora. Nada se perdió y lo intentaremos de nuevo.',
      reintentar: 'Intentar de nuevo',
    })
  })

  it('cada estado tiene su texto, y ninguno lleva urgencia ni exclamación', () => {
    ESTADOS.forEach((estado) => {
      expect(typeof textos[estado]).toBe('string')
      expect(textos[estado]).not.toMatch(/!|¡|urgente|ahora mismo|error/i)
    })
  })

  it('la pantalla lo pinta con el marco de siempre y lo anuncia con texto', () => {
    const pantalla = codigoDe('src/components/perfil/Perfil.jsx')
    expect(pantalla).toMatch(/sincronizacion: \(\) =>/)
    expect(pantalla).toMatch(/aria-live="polite"/)
    expect(pantalla).toMatch(/textos\.sincronizacion\[sincronizacion\.estado\]/)
    expect(pantalla).toMatch(/copy\.shared\.restauracion\.error/)
    // Ningún componente nuevo: se pinta dentro de `Bloque`.
    expect(pantalla).not.toMatch(/import .*Sincronizacion.* from '@components/)
  })
})

describe('estadoDe: cuatro estados y una prioridad', () => {
  it('sin cuenta manda sobre todo lo demás', () => {
    const r = estadoDe({
      estadoSesion: SIN,
      enLinea: false,
      pendientes: 5,
      ultimaRestauracion: { ok: false },
    })
    expect(r.estado).toBe('sinCuenta')
    expect(r.restauracionFallida).toBe(false)
    expect(r.puedeReintentar).toBe(false)
  })

  it('con la sesión vencida dice sinCuenta: quien lo explica es Tu cuenta', () => {
    const r = estadoDe({
      estadoSesion: 'vencida',
      enLinea: true,
      pendientes: 3,
      ultimaRestauracion: { ok: false },
    })
    expect(r.estado).toBe('sinCuenta')
    expect(r.puedeReintentar).toBe(false)
  })

  it('sin configurar, también sinCuenta', () => {
    const r = estadoDe({
      estadoSesion: 'sinConfigurar',
      enLinea: true,
      pendientes: 0,
      ultimaRestauracion: null,
    })
    expect(r.estado).toBe('sinCuenta')
  })

  it('sin conexión, antes que pendiente', () => {
    const r = estadoDe({
      estadoSesion: CON,
      enLinea: false,
      pendientes: 3,
      ultimaRestauracion: null,
    })
    expect(r.estado).toBe('sinConexion')
    expect(r.puedeReintentar).toBe(false)
  })

  it('pendiente cuando hay algo en la cola y hay red', () => {
    const r = estadoDe({
      estadoSesion: CON,
      enLinea: true,
      pendientes: 2,
      ultimaRestauracion: null,
    })
    expect(r.estado).toBe('pendiente')
    expect(r.puedeReintentar).toBe(true)
  })

  it('al día cuando no queda nada', () => {
    const r = estadoDe({
      estadoSesion: CON,
      enLinea: true,
      pendientes: 0,
      ultimaRestauracion: { ok: true },
    })
    expect(r.estado).toBe('alDia')
    expect(r.puedeReintentar).toBe(false)
    expect(r.restauracionFallida).toBe(false)
  })

  it('una restauración fallida ofrece reintentar aunque la cola esté vacía', () => {
    const r = estadoDe({
      estadoSesion: CON,
      enLinea: true,
      pendientes: 0,
      ultimaRestauracion: { ok: false, motivo: 'interrumpida' },
    })
    expect(r.estado).toBe('alDia')
    expect(r.restauracionFallida).toBe(true)
    expect(r.puedeReintentar).toBe(true)
  })

  it('pero no sin red: volver a intentar sin red no es intentar nada', () => {
    const r = estadoDe({
      estadoSesion: CON,
      enLinea: false,
      pendientes: 0,
      ultimaRestauracion: { ok: false, motivo: 'sin_red' },
    })
    expect(r.estado).toBe('sinConexion')
    expect(r.puedeReintentar).toBe(false)
  })

  it('sin resultado de restauración en la sesión no hay nada que reintentar', () => {
    const r = estadoDe({
      estadoSesion: CON,
      enLinea: true,
      pendientes: 0,
      ultimaRestauracion: null,
    })
    expect(r.restauracionFallida).toBe(false)
    expect(r.puedeReintentar).toBe(false)
  })

  it('no devuelve el conteo: la pantalla no dice cuántas esperan (§4.6)', () => {
    const r = estadoDe({
      estadoSesion: CON,
      enLinea: true,
      pendientes: 214,
      ultimaRestauracion: null,
    })
    expect(r).not.toHaveProperty('pendientes')
    expect(Object.keys(r).sort()).toEqual(['estado', 'puedeReintentar', 'restauracionFallida'])
  })

  it('y la pantalla no pinta ningún número junto al estado', () => {
    const pantalla = codigoDe('src/components/perfil/Perfil.jsx')
    expect(pantalla).not.toMatch(/sincronizacion\.pendientes/)
    expect(pantalla).not.toMatch(/·\s*\{/)
  })

  it('solo devuelve estados que tienen texto', () => {
    const casos = [
      { estadoSesion: SIN, enLinea: true, pendientes: 0 },
      { estadoSesion: CON, enLinea: false, pendientes: 0 },
      { estadoSesion: CON, enLinea: true, pendientes: 1 },
      { estadoSesion: CON, enLinea: true, pendientes: 0 },
    ]
    casos.forEach((c) =>
      expect(ESTADOS).toContain(estadoDe({ ...c, ultimaRestauracion: null }).estado),
    )
  })
})

describe('el hook sondea y no se suscribe (D11)', () => {
  const hook = codigoDe('src/perfil/useSincronizacion.js')

  it('lee la cola por getPendingCount y no toca sync.js', () => {
    expect(hook).toMatch(/getPendingCount/)
    expect(hook).not.toMatch(/from ['"][^'"]*sync\.js['"]/)
  })

  it('recalcula al montar, al irse y volver la red y al volver la pestaña; sin intervalo', () => {
    expect(hook).toMatch(/addEventListener\('online'/)
    expect(hook).toMatch(/addEventListener\('offline'/)
    expect(hook).toMatch(/addEventListener\('visibilitychange'/)
    expect(hook).not.toMatch(/setInterval|setTimeout/)
  })

  it('retira los oyentes al desmontar', () => {
    expect(hook).toMatch(/removeEventListener\('online'/)
    expect(hook).toMatch(/removeEventListener\('visibilitychange'/)
  })

  it('reintentar vacía la cola y, solo si la última restauración falló, restaura', () => {
    expect(hook).toMatch(/ultimoResultado\(uid\)\?\.ok === false\) await restaurar\(uid\)/)
    expect(hook).toMatch(/await flush\(uid\)/)
  })

  it('el hook usa reintentarYMirar y no una copia', () => {
    expect(hook).toMatch(/reintentarYMirar\(uid, recalcular\)/)
  })

  it('la cuenta la dice la sesión, no el uid (SPEC_19.1 §4.10)', () => {
    expect(hook).toMatch(/useSesion\(\)/)
    expect(hook).toMatch(/ESTADOS_SESION\.conCuenta/)
    expect(hook).not.toMatch(/'local-'|esUidDeCuenta/)
  })

  it('criterio 9: recalcula también cuando cambia el sello de restauración', () => {
    expect(hook).toMatch(/\[recalcular, selloRestauracion\]/)
  })
})

describe('sync.js no se modificó (D11, SPEC §2)', () => {
  it('sigue sin emitir nada: ni oyentes propios ni EventTarget', () => {
    const sync = codigoDe('src/lib/db/sync.js')
    expect(sync).not.toMatch(/EventTarget|dispatchEvent|onChange|suscri|subscribe/)
  })
})

describe('criterio 9: reintentarYMirar espera de verdad (DP-17.15)', () => {
  const T0 = '2026-09-18T12:00:00.000Z'

  beforeEach(async () => {
    nube.colgar = false
    nube.soltar = null
    olvidarResultados()
    vi.stubGlobal('navigator', { onLine: true })
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
    await resetLocalDB()
  })

  afterEach(() => {
    cancelRetries()
    vi.unstubAllGlobals()
  })

  const mirarCon = (estadoSesion, pendientes) => async () =>
    estadoDe({
      estadoSesion,
      enLinea: true,
      pendientes: await pendientes(),
      ultimaRestauracion: null,
    })

  it('con un vaciado en curso, espera a que termine antes de mirar', async () => {
    await diario.saveMorningEntry(CUENTA, '2026-09-18', { action: 'x', updatedAt: T0 })
    nube.colgar = true
    const enMarcha = flush(CUENTA)
    while (!nube.soltar) await new Promise((r) => setTimeout(r, 0))

    const miradas = []
    const mirar = async () => {
      miradas.push('mirada')
      return mirarCon(CON, () => pendingCount(CUENTA))()
    }
    const reintento = reintentarYMirar(CUENTA, mirar)
    await new Promise((r) => setTimeout(r, 10))
    expect(miradas).toEqual([])

    nube.colgar = false
    nube.soltar()
    await enMarcha
    expect(await reintento).toBeNull()
    expect(miradas).toEqual(['mirada'])
  })

  it('si después sigue habiendo pendientes, el acuse es sinExito', async () => {
    const acuse = await reintentarYMirar(
      CUENTA,
      mirarCon(CON, async () => 2),
    )
    expect(acuse).toBe(ACUSES.sinExito)
  })

  it('con éxito no hay acuse: el cambio de estado lo dice', async () => {
    expect(
      await reintentarYMirar(
        CUENTA,
        mirarCon(CON, async () => 0),
      ),
    ).toBeNull()
  })

  it('solo restaura si la última restauración falló', async () => {
    const restauraciones = []
    const quitar = alTerminarRestauracion((uid) => restauraciones.push(uid))

    await reintentarYMirar(
      CUENTA,
      mirarCon(CON, async () => 0),
    )
    expect(restauraciones).toEqual([])

    vi.stubGlobal('navigator', { onLine: false })
    await restaurar(CUENTA) // falla por red y queda como último resultado
    vi.stubGlobal('navigator', { onLine: true })
    await reintentarYMirar(
      CUENTA,
      mirarCon(CON, async () => 0),
    )
    quitar()
    expect(restauraciones).toEqual([CUENTA, CUENTA])
  })
})
