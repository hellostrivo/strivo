// El léxico compartido (SPEC_28.1 §4.5). Lo que se prueba aquí es la forma de
// las listas y las reglas nuevas; que `lint:copy` dé lo mismo que antes del
// movimiento se comprobó contra su salida, no con una prueba.
import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { AMPLIADO, CLINICO, FORBIDDEN } from '../lexico.js'

const coincide = (lista, id, texto) => {
  const regla = lista.find((r) => r.id === id)
  return new RegExp(regla.pattern.source, regla.pattern.flags.replace('g', '')).test(
    texto.normalize('NFC'),
  )
}

describe('las tres listas', () => {
  it('cada regla tiene id, patrón y razón, y ningún id se repite dentro de su lista', () => {
    for (const lista of [FORBIDDEN, CLINICO, AMPLIADO]) {
      const ids = lista.map((r) => r.id)
      expect(new Set(ids).size).toBe(ids.length)
      lista.forEach((r) => {
        expect(r.id).toMatch(/^[a-z][a-z-]*$/)
        expect(r.pattern).toBeInstanceOf(RegExp)
        expect(typeof r.reason).toBe('string')
      })
    }
  })

  it('una regla que está en dos listas lleva el mismo id en las dos', () => {
    const fuente = (lista, id) => lista.find((r) => r.id === id)?.pattern.source
    for (const id of ['trastorno', 'productividad', 'maximizar']) {
      expect(fuente(FORBIDDEN, id)).toBe(fuente(CLINICO, id))
    }
  })

  it('el fallaste repetido salió de FORBIDDEN', () => {
    expect(FORBIDDEN.filter((r) => r.id === 'fallaste')).toHaveLength(1)
  })

  it('están congeladas: un consumidor no puede añadir ni quitar reglas', () => {
    expect(Object.isFrozen(FORBIDDEN)).toBe(true)
    expect(Object.isFrozen(CLINICO)).toBe(true)
    expect(Object.isFrozen(AMPLIADO)).toBe(true)
    expect(Object.isFrozen(AMPLIADO[0])).toBe(true)
  })

  it('AMPLIADO dice en cada regla si bloquea o avisa', () => {
    const porNivel = (nivel) => AMPLIADO.filter((r) => r.nivel === nivel).map((r) => r.id)
    expect(porNivel('falta')).toEqual([
      'depresion',
      'salud-mental',
      'diagnostico',
      'tienes-que',
      'debes',
    ])
    expect(porNivel('aviso')).toEqual(['meta', 'progreso', 'pendiente'])
  })

  it('lint-copy lee FORBIDDEN y CLINICO de aquí, y no lee AMPLIADO', () => {
    const script = readFileSync('scripts/lint-copy.js', 'utf8')
    expect(script).toMatch(/const LEXICO = 'src\/lib\/lexico\.js'/)
    expect(script).not.toMatch(/AMPLIADO/)
    expect(script).not.toMatch(/pattern:\s*\//)
  })
})

describe('los derivados de «estrés» (estres-derivados)', () => {
  it.each(['estresante', 'Estresado', 'estresada', 'estresantes', 'me estresa', 'estresarse'])(
    '«%s» coincide',
    (texto) => expect(coincide(CLINICO, 'estres-derivados', texto)).toBe(true),
  )

  it.each(['estrés', 'estres', 'estreses', 'estrés.', 'el estrés, a veces'])(
    '«%s» no es un derivado',
    (texto) => expect(coincide(CLINICO, 'estres-derivados', texto)).toBe(false),
  )
})

describe('las reglas nuevas miran letras Unicode a los dos lados', () => {
  it('encuentran la palabra junto a una vocal con tilde y al final de frase', () => {
    expect(coincide(AMPLIADO, 'depresion', 'La depresión.')).toBe(true)
    expect(coincide(AMPLIADO, 'diagnostico', 'sin diagnóstico')).toBe(true)
    expect(coincide(AMPLIADO, 'salud-mental', 'salud  mental')).toBe(true)
    expect(coincide(AMPLIADO, 'meta', 'Sin metas.')).toBe(true)
  })

  it('no la encuentran dentro de otra palabra', () => {
    expect(coincide(AMPLIADO, 'meta', 'metáfora')).toBe(false)
    expect(coincide(AMPLIADO, 'meta', 'cometa')).toBe(false)
    expect(coincide(AMPLIADO, 'debes', 'debesía')).toBe(false)
    expect(coincide(AMPLIADO, 'progreso', 'progresión')).toBe(false)
  })

  it('funciona con el texto escrito en NFD una vez normalizado', () => {
    expect(coincide(AMPLIADO, 'depresion', 'depresión')).toBe(true)
  })
})
