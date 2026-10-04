// SPEC_28.3 §4.3, criterio 4 — la caché de Una pausa, con fake-indexeddb.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  NOMBRE_CACHE,
  cerrarCache,
  guardarCanal,
  guardarPortada,
  leerCanalGuardado,
  leerPortadaGuardada,
} from '../cache.js'

const canal = (id = 'calma') => ({
  formato: 1,
  semana: '2026-12-07',
  vigente: { id, title: 'Calma' },
  archivo: [],
})

beforeEach(async () => {
  await cerrarCache()
  await new Promise((resolve) => {
    const peticion = indexedDB.deleteDatabase(NOMBRE_CACHE)
    peticion.onsuccess = peticion.onerror = peticion.onblocked = () => resolve()
  })
})

afterEach(async () => {
  vi.unstubAllGlobals()
  await cerrarCache()
})

describe('criterio 4: el último canal válido', () => {
  it('sin nada guardado, null', async () => {
    expect(await leerCanalGuardado()).toBeNull()
  })

  it('un canal válido se guarda y se relee', async () => {
    expect(await guardarCanal(canal())).toBe(true)
    expect(await leerCanalGuardado()).toEqual(canal())
  })

  it('el siguiente válido sustituye al anterior: solo interesa el último', async () => {
    await guardarCanal(canal('calma'))
    await guardarCanal(canal('espacio'))
    expect((await leerCanalGuardado()).vigente.id).toBe('espacio')
  })

  it('uno inválido no pisa al bueno', async () => {
    await guardarCanal(canal())
    for (const roto of [null, { formato: 2 }, { ...canal(), archivo: 'x' }, '<!doctype html>']) {
      expect(await guardarCanal(roto)).toBe(false)
    }
    expect(await leerCanalGuardado()).toEqual(canal())
  })
})

describe('criterio 4: una base aparte, fuera del árbol del usuario', () => {
  it('se llama strivo-contenido y no es la del usuario', async () => {
    expect(NOMBRE_CACHE).toBe('strivo-contenido')
    await guardarCanal(canal())
    const bases = (await indexedDB.databases()).map((b) => b.name)
    expect(bases).toContain('strivo-contenido')
    expect(bases).not.toContain('strivo')
  })
})

describe('la portada de la vigente', () => {
  const webp = (texto) => new Blob([texto], { type: 'image/webp' })

  it('se guarda como bytes y vuelve como blob, con su tipo', async () => {
    expect(await guardarPortada('https://x/calma.webp', webp('RIFF-calma'))).toBe(true)
    const blob = await leerPortadaGuardada('https://x/calma.webp')
    expect(blob.type).toBe('image/webp')
    expect(await blob.text()).toBe('RIFF-calma')
  })

  it('guardar otra olvida la anterior', async () => {
    await guardarPortada('https://x/calma.webp', webp('a'))
    await guardarPortada('https://x/espacio.webp', webp('b'))
    expect(await leerPortadaGuardada('https://x/calma.webp')).toBeNull()
    expect(await (await leerPortadaGuardada('https://x/espacio.webp')).text()).toBe('b')
  })

  it('lo que no es una portada no se guarda', async () => {
    expect(await guardarPortada(null, webp('a'))).toBe(false)
    expect(await guardarPortada('https://x/a.webp', 'no soy un blob')).toBe(false)
    expect(await leerPortadaGuardada(undefined)).toBeNull()
  })
})

describe('sin IndexedDB, la sección funciona igual', () => {
  it('leer da null y guardar da false, sin lanzar', async () => {
    vi.stubGlobal('indexedDB', undefined)
    expect(await leerCanalGuardado()).toBeNull()
    expect(await guardarCanal(canal())).toBe(false)
    expect(await leerPortadaGuardada('https://x/a.webp')).toBeNull()
    expect(await guardarPortada('https://x/a.webp', new Blob(['a']))).toBe(false)
  })

  it('con IndexedDB fallando, igual', async () => {
    vi.stubGlobal('indexedDB', {
      open() {
        throw new Error('roto')
      },
    })
    expect(await leerCanalGuardado()).toBeNull()
    expect(await guardarCanal(canal())).toBe(false)
  })
})
