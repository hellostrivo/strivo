// src/lib/db/__tests__/clavesDelTelefono.test.js
// Los hechos del teléfono y su copia en SQLite (SPEC_17B, DP-17B.4).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CLAVE_UID,
  clavesEnLocal,
  esClaveDelTelefono,
  fijarEspejo,
  guardarClave,
  leerClave,
  quitarClave,
  reconciliarClaves,
} from '../clavesDelTelefono.js'

function memoriaLocal(inicial = {}) {
  const datos = new Map(Object.entries(inicial))
  return {
    get length() {
      return datos.size
    },
    key: (i) => [...datos.keys()][i] ?? null,
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    removeItem: (k) => datos.delete(k),
    datos,
  }
}

/** Una copia en memoria con la forma de `copiaDeClaves`. */
function copiaEnMemoria(inicial = []) {
  const tabla = new Map(inicial)
  return {
    tabla,
    leer: async () => [...tabla.entries()],
    reemplazar: async (pares) => {
      tabla.clear()
      for (const [k, v] of pares) tabla.set(k, v)
    },
  }
}

const esperarCopia = () => new Promise((r) => setTimeout(r, 0))

let local
beforeEach(() => {
  local = memoriaLocal()
  vi.stubGlobal('localStorage', local)
})
afterEach(() => {
  fijarEspejo(null)
  vi.unstubAllGlobals()
})

describe('qué se copia', () => {
  it('las tres familias, y nada más', () => {
    expect(esClaveDelTelefono(CLAVE_UID)).toBe(true)
    expect(esClaveDelTelefono('strivo.restaurado.abc')).toBe(true)
    expect(esClaveDelTelefono('strivo.mudanzaPendiente.abc')).toBe(true)
    expect(esClaveDelTelefono('strivo.almacen')).toBe(false)
    expect(esClaveDelTelefono('otra.cosa')).toBe(false)
  })
})

describe('escribir', () => {
  it('localStorage primero, y la copia detrás', async () => {
    const espejo = vi.fn(async () => {})
    fijarEspejo(espejo)
    guardarClave(CLAVE_UID, 'local-1')
    expect(leerClave(CLAVE_UID)).toBe('local-1')
    await esperarCopia()
    expect(espejo).toHaveBeenCalledWith({ clave: CLAVE_UID, valor: 'local-1' })

    quitarClave(CLAVE_UID)
    expect(leerClave(CLAVE_UID)).toBeNull()
    await esperarCopia()
    expect(espejo).toHaveBeenLastCalledWith({ clave: CLAVE_UID, valor: null })
  })

  it('una copia que falla no rompe la escritura', async () => {
    fijarEspejo(async () => {
      throw new Error('SQLite no contestó')
    })
    expect(() => guardarClave(CLAVE_UID, 'local-2')).not.toThrow()
    await esperarCopia()
    expect(leerClave(CLAVE_UID)).toBe('local-2')
  })

  it('en la web no hay copia, y la pista del almacén no se copia nunca', async () => {
    const espejo = vi.fn(async () => {})
    guardarClave(CLAVE_UID, 'web')
    fijarEspejo(espejo)
    guardarClave('strivo.almacen', 'sqlite')
    await esperarCopia()
    expect(espejo).not.toHaveBeenCalled()
  })
})

describe('al arrancar', () => {
  it('sin uid en localStorage, se recupera todo lo de SQLite', async () => {
    const copia = copiaEnMemoria([
      [CLAVE_UID, 'local-guardado'],
      ['strivo.restaurado.cuenta', '2026-11-10T10:00:00.000Z'],
    ])
    expect(await reconciliarClaves(copia, local)).toEqual({ recuperadas: 2 })
    expect(local.getItem(CLAVE_UID)).toBe('local-guardado')
    expect(local.getItem('strivo.restaurado.cuenta')).toBe('2026-11-10T10:00:00.000Z')
  })

  it('con uid en localStorage, manda localStorage y SQLite se iguala: nada resucita', async () => {
    local.setItem(CLAVE_UID, 'local-vigente')
    local.setItem('strivo.mudanzaPendiente.cuenta', 'local-vigente')
    const copia = copiaEnMemoria([
      [CLAVE_UID, 'local-viejo'],
      ['strivo.restaurado.cuenta-cerrada', '2026-10-01T10:00:00.000Z'],
    ])
    expect(await reconciliarClaves(copia, local)).toEqual({ recuperadas: 0 })
    expect(Object.fromEntries(copia.tabla)).toEqual({
      [CLAVE_UID]: 'local-vigente',
      'strivo.mudanzaPendiente.cuenta': 'local-vigente',
    })
    expect(local.getItem('strivo.restaurado.cuenta-cerrada')).toBeNull()
  })

  it('clavesEnLocal solo lista las que se copian', () => {
    local.setItem(CLAVE_UID, 'u')
    local.setItem('strivo.almacen', 'sqlite')
    local.setItem('otra', 'x')
    expect(clavesEnLocal(local)).toEqual([[CLAVE_UID, 'u']])
  })
})
