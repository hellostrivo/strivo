// src/lib/__tests__/plataforma.test.js
// SPEC_21.1 §4.1 — dónde corre la app, y un solo sitio que lo pregunta.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { esNativa } from '../plataforma.js'

describe('esNativa', () => {
  it('dentro de la app de iPhone, sí', () => {
    expect(esNativa({ isNativePlatform: () => true })).toBe(true)
  })

  it('con Capacitor en un navegador, no', () => {
    expect(esNativa({ isNativePlatform: () => false })).toBe(false)
  })

  it('sin Capacitor, no', () => {
    expect(esNativa(null)).toBe(false)
    expect(esNativa({})).toBe(false)
  })

  it('si la pregunta falla, no: ante la duda, web', () => {
    const roto = {
      isNativePlatform: () => {
        throw new Error('sin puente')
      },
    }
    expect(esNativa(roto)).toBe(false)
  })

  it('una respuesta que no es exactamente true no cuenta como nativa', () => {
    expect(esNativa({ isNativePlatform: () => 'ios' })).toBe(false)
  })

  it('en las pruebas, con el Capacitor de verdad, es web', () => {
    expect(esNativa()).toBe(false)
  })
})

/** Todos los .js y .jsx de `src/`, sin las pruebas. */
function fuentes(dir = 'src') {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : fuentes(ruta)
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

describe('un solo sitio pregunta la plataforma', () => {
  it('nadie fuera de lib/plataforma.js importa @capacitor/core', () => {
    const intrusos = fuentes().filter(
      (ruta) =>
        !ruta.endsWith(join('lib', 'plataforma.js')) &&
        /from ['"]@capacitor\/core['"]/.test(readFileSync(ruta, 'utf8')),
    )
    expect(intrusos).toEqual([])
  })

  it('nadie llama a isNativePlatform fuera de lib/plataforma.js', () => {
    const intrusos = fuentes().filter(
      (ruta) =>
        !ruta.endsWith(join('lib', 'plataforma.js')) &&
        /isNativePlatform/.test(readFileSync(ruta, 'utf8')),
    )
    expect(intrusos).toEqual([])
  })
})
