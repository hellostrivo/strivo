// SPEC_28.2 §4.2 y criterio 11: `CODIGOS` es el catálogo de lo que el modelo
// puede devolver, y no puede quedarse atrás. Los literales se sacan de las
// fuentes: un código nuevo que no se añada al catálogo hace fallar esta prueba
// antes de que el script del canal lo imprima sin frase.
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { CODIGOS_DE_PORTADA } from '../portada.js'
import { CODIGOS, IDS_DE_PROMESA, PREFIJOS, validar } from '../validar.js'

const DIR = 'src/unaPausa/modelo'
const FUENTES = readdirSync(DIR)
  .filter((n) => n.endsWith('.js'))
  .map((n) => readFileSync(join(DIR, n), 'utf8'))
  .join('\n')

// `codigo: '…'` y `falta('…'`: las dos formas en que el modelo emite un código.
const FIJOS = [...FUENTES.matchAll(/(?:codigo:\s*|falta\(\s*)'([^']+)'/g)].map((m) => m[1])
// `codigo: `prefijo.${…}``: las familias que se forman con un id.
const FAMILIAS = [...FUENTES.matchAll(/codigo:\s*`([a-z]+\.)\$\{/g)].map((m) => m[1])

describe('el catálogo de códigos', () => {
  it('la extracción ve lo que tiene que ver', () => {
    expect(FIJOS).toContain('id.forma')
    expect(FIJOS).toContain('estado.desconocido')
    expect(FIJOS).toContain('portada.peso')
    expect(FIJOS).toContain('conjunto.choque')
    expect(new Set(FAMILIAS)).toEqual(new Set(['lexico.', 'promesa.']))
  })

  it('todo literal del modelo está en CODIGOS', () => {
    expect([...new Set(FIJOS)].filter((c) => !CODIGOS.includes(c))).toEqual([])
  })

  it('todo lo de CODIGOS aparece en el modelo: no hay códigos muertos', () => {
    expect(CODIGOS.filter((c) => !FIJOS.includes(c))).toEqual([])
  })

  it('sin repetidos, y con los de la portada', () => {
    expect(new Set(CODIGOS).size).toBe(CODIGOS.length)
    for (const c of CODIGOS_DE_PORTADA) expect(CODIGOS).toContain(c)
  })

  it('toda familia está en PREFIJOS', () => {
    expect([...new Set(FAMILIAS)].sort()).toEqual([...PREFIJOS].sort())
  })

  it('IDS_DE_PROMESA son los ids que de verdad devuelve el validador', () => {
    const c = {
      id: 'x',
      status: 'borrador',
      opening:
        'Garantiza y elimina. Está comprobado que te hará bien; está probado. ' +
        'Está demostrado que te vas a sentir mejor y te sentirás así.',
    }
    const promesas = validar(c)
      .avisos.map((a) => a.codigo)
      .filter((codigo) => codigo.startsWith('promesa.'))
      .map((codigo) => codigo.slice('promesa.'.length))
    expect(promesas.sort()).toEqual([...IDS_DE_PROMESA].sort())
  })
})
