// SPEC_28.3 §4.4, criterio 3 y desvío 3 — qué ve la persona, y que nada de lo
// que falle en Una pausa se convierta en una excepción.
import { describe, expect, it } from 'vitest'
import {
  ESTADOS_DE_LA_SECCION,
  cargarSeccion,
  crearPortadaLocal,
  estadoDeLaSeccion,
} from '../useUnaPausa.js'

const canal = (vigente = { id: 'calma' }) => ({
  formato: 1,
  semana: '2026-12-07',
  vigente,
  archivo: [],
})
const leida = (c = canal()) => ({ ok: true, canal: c })
const fallida = { ok: false, motivo: 'red' }

describe('criterio 3: la tabla de §4.4', () => {
  it('sin caché y con la lectura en curso: cargando', () => {
    expect(estadoDeLaSeccion({ cache: null, lectura: null, enLinea: true })).toEqual({
      estado: 'cargando',
    })
  })

  it('con caché o sin ella, una lectura válida: listo con lo leído', () => {
    const nuevo = canal({ id: 'espacio' })
    for (const cache of [null, canal()]) {
      expect(estadoDeLaSeccion({ cache, lectura: leida(nuevo), enLinea: true })).toEqual({
        estado: 'listo',
        canal: nuevo,
      })
    }
  })

  it('con caché y la lectura fallando: listo con la caché, sin aviso de error', () => {
    for (const enLinea of [true, false]) {
      expect(estadoDeLaSeccion({ cache: canal(), lectura: fallida, enLinea })).toEqual({
        estado: 'listo',
        canal: canal(),
      })
    }
  })

  it('sin caché, falla y sin red: vacío', () => {
    expect(estadoDeLaSeccion({ cache: null, lectura: fallida, enLinea: false })).toEqual({
      estado: 'vacio',
    })
  })

  it('sin caché, falla y con red: error', () => {
    expect(estadoDeLaSeccion({ cache: null, lectura: fallida, enLinea: true })).toEqual({
      estado: 'error',
    })
  })

  it('una lectura válida sin vigente: vacío', () => {
    for (const cache of [null, canal()]) {
      expect(estadoDeLaSeccion({ cache, lectura: leida(canal(null)), enLinea: true })).toEqual({
        estado: 'vacio',
      })
    }
  })
})

describe('lo que la tabla deja entre líneas (resolución H de la §0)', () => {
  it('con caché, mientras se lee, la caché se enseña enseguida', () => {
    expect(estadoDeLaSeccion({ cache: canal(), lectura: null, enLinea: true })).toEqual({
      estado: 'listo',
      canal: canal(),
    })
  })

  it('una caché sin vigente: cargando mientras se lee, vacío si la lectura falla', () => {
    const vacia = canal(null)
    expect(estadoDeLaSeccion({ cache: vacia, lectura: null, enLinea: true }).estado).toBe(
      'cargando',
    )
    expect(estadoDeLaSeccion({ cache: vacia, lectura: fallida, enLinea: true }).estado).toBe(
      'vacio',
    )
  })

  it('solo cuatro estados, y ninguno lleva un código', () => {
    expect(ESTADOS_DE_LA_SECCION).toEqual(['cargando', 'listo', 'vacio', 'error'])
    const error = estadoDeLaSeccion({ cache: null, lectura: fallida, enLinea: true })
    expect(Object.keys(error)).toEqual(['estado'])
  })
})

describe('cargarSeccion: enseña la caché, lee detrás, guarda lo bueno', () => {
  it('con caché: primero la caché, después lo leído, y lo leído se guarda', async () => {
    const vistos = []
    const guardados = []
    const nuevo = canal({ id: 'espacio' })
    const final = await cargarSeccion({
      leerGuardado: async () => canal(),
      leer: async () => leida(nuevo),
      guardar: async (c) => guardados.push(c),
      enLinea: () => true,
      alCambiar: (e) => vistos.push(e),
    })
    expect(vistos).toEqual([
      { estado: 'listo', canal: canal() },
      { estado: 'listo', canal: nuevo },
    ])
    expect(final).toEqual({ estado: 'listo', canal: nuevo })
    expect(guardados).toEqual([nuevo])
  })

  it('una lectura fallida no se guarda', async () => {
    const guardados = []
    await cargarSeccion({
      leerGuardado: async () => null,
      leer: async () => fallida,
      guardar: async (c) => guardados.push(c),
      enLinea: () => true,
    })
    expect(guardados).toEqual([])
  })
})

describe('desvío 3: con todo fallando, cargarSeccion no rechaza', () => {
  const lanza = () => {
    throw new Error('roto')
  }
  const rechaza = async () => {
    throw new Error('roto')
  }

  it('caché, lectura, guardado y red lanzando: termina en error, sin excepción', async () => {
    const final = await cargarSeccion({
      leerGuardado: rechaza,
      leer: lanza,
      guardar: rechaza,
      enLinea: lanza,
      alCambiar: () => {},
    })
    expect(final).toEqual({ estado: 'error' })
  })

  it('con caché, aunque guardar lance, se ve lo leído', async () => {
    const final = await cargarSeccion({
      leerGuardado: async () => canal(),
      leer: async () => leida(canal({ id: 'espacio' })),
      guardar: rechaza,
      enLinea: () => true,
    })
    expect(final.canal.vigente.id).toBe('espacio')
  })

  it('una lectura que devuelve nada cuenta como fallida', async () => {
    const final = await cargarSeccion({
      leerGuardado: async () => null,
      leer: async () => undefined,
      enLinea: () => false,
    })
    expect(final).toEqual({ estado: 'vacio' })
  })
})

describe('el objectURL de la portada se libera', () => {
  function espia() {
    const creadas = []
    const liberadas = []
    let n = 0
    const portada = crearPortadaLocal({
      crear: () => {
        const url = `blob:una-pausa/${++n}`
        creadas.push(url)
        return url
      },
      liberar: (url) => liberadas.push(url),
    })
    return { portada, creadas, liberadas }
  }

  it('al cambiar de portada, la anterior se libera', () => {
    const { portada, liberadas } = espia()
    const primera = portada.poner(new Blob(['a']))
    expect(liberadas).toEqual([])
    portada.poner(new Blob(['b']))
    expect(liberadas).toEqual([primera])
  })

  it('al soltar (desmontar), la última se libera, y una sola vez', () => {
    const { portada, creadas, liberadas } = espia()
    portada.poner(new Blob(['a']))
    portada.poner(new Blob(['b']))
    portada.soltar()
    portada.soltar()
    expect(liberadas).toEqual(creadas)
  })

  it('el hook suelta la suya al desmontar y al cambiar de portada', async () => {
    // El efecto de la portada no corre sin navegador: se comprueba en la fuente
    // que su limpieza suelta la URL, y que depende de la `src`.
    const { readFileSync } = await import('fs')
    const fuente = readFileSync('src/unaPausa/useUnaPausa.js', 'utf8')
    const efecto = fuente.slice(fuente.indexOf('const portada = crearPortadaLocal()'))
    expect(efecto.slice(0, efecto.indexOf('}, [src])'))).toMatch(
      /return \(\) => \{[^}]*portada\.soltar\(\)/,
    )
  })
})
