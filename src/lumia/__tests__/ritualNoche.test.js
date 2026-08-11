// src/lumia/__tests__/ritualNoche.test.js
// El Ritual de Noche (§5.6 · §C7.7.1): cinco pantallas y ni rastro de N2.
//
// El criterio 1 de SPEC_07 se comprueba de dos maneras porque son dos cosas
// distintas: que el recorrido tenga cinco pasos, y que nadie haya dejado un N2
// en el repositorio. Lo segundo se lee del disco.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import {
  PANTALLAS,
  TOTAL,
  anterior,
  esPantalla,
  esUltima,
  posicionDe,
  primera,
  siguiente,
} from '../ritualNoche.js'

const ARBOL_LUMIA = ['src/lumia', 'src/pages/lumia', 'src/components/lumia']

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) {
      return nombre === '__tests__' ? [] : archivosDe(ruta)
    }
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

const ARCHIVOS = ARBOL_LUMIA.flatMap(archivosDe)

describe('cinco pantallas, no seis (SPEC_07, criterio 1)', () => {
  it('el recorrido es N1, N3, N4, N5, N6', () => {
    expect(PANTALLAS).toEqual(['N1', 'N3', 'N4', 'N5', 'N6'])
    expect(TOTAL).toBe(5)
  })

  it('N2 no existe y su número no se reasigna', () => {
    expect(PANTALLAS).not.toContain('N2')
    expect(esPantalla('N2')).toBe(false)
    // El hueco es intencional: N3 sigue llamándose N3 aunque sea la segunda.
    expect(PANTALLAS[1]).toBe('N3')
    expect(posicionDe('N3')).toBe(2)
  })

  it('no hay ningún archivo N2 en el árbol de Lumia', () => {
    const sospechosos = ARCHIVOS.filter((ruta) => /N2/.test(ruta))
    expect(sospechosos).toEqual([])
  })

  it('ningún archivo de Lumia menciona una pantalla N2 como algo que exista', () => {
    ARCHIVOS.forEach((ruta) => {
      const codigo = readFileSync(ruta, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      expect(`${ruta}: ${codigo}`).not.toMatch(/\bN2\b/)
    })
  })

  it('existen los cinco componentes, con su identificador real', () => {
    const enRitual = readdirSync('src/components/lumia/ritual').sort()
    expect(enRitual).toEqual([
      'N1Descompresion.jsx',
      'N3Logros.jsx',
      'N4Agradecimientos.jsx',
      'N5EstadoSueno.jsx',
      'N6Cierre.jsx',
    ])
  })
})

describe('navegar el ritual', () => {
  it('empieza en N1 y termina en N6', () => {
    expect(primera()).toBe('N1')
    expect(esUltima('N6')).toBe(true)
    expect(esUltima('N5')).toBe(false)
  })

  it('avanza saltándose el hueco de N2', () => {
    expect(siguiente('N1')).toBe('N3')
    expect(siguiente('N3')).toBe('N4')
    expect(siguiente('N5')).toBe('N6')
  })

  it('no hay nada después de la última ni antes de la primera', () => {
    expect(siguiente('N6')).toBeNull()
    expect(anterior('N1')).toBeNull()
  })

  it('volver atrás recorre el mismo camino', () => {
    expect(anterior('N3')).toBe('N1')
    expect(anterior('N6')).toBe('N5')
  })

  it('un identificador desconocido no mueve nada', () => {
    expect(siguiente('N2')).toBeNull()
    expect(anterior('N9')).toBeNull()
  })
})

describe('el ritual no toca hábitos (§C7.7.1, SPEC_07 criterio 2)', () => {
  const DEL_RITUAL = [
    'src/lumia/ritualNoche.js',
    'src/components/lumia/RitualNoche.jsx',
    ...archivosDe('src/components/lumia/ritual'),
  ]

  it('ninguno de sus archivos importa formia ni nombra un hábito', () => {
    DEL_RITUAL.forEach((ruta) => {
      const codigo = readFileSync(ruta, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      expect(`${ruta}: ${codigo}`).not.toMatch(/formia/i)
      expect(`${ruta}: ${codigo}`).not.toMatch(/h[áa]bito|habitLog/i)
    })
  })
})
