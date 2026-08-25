// src/diario/__tests__/emocionesJournal.test.js
// El catálogo de emociones del Journal (§5.8.1) y su regla de selección.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import {
  CATALOGO,
  ID_OTRA,
  IDS,
  MAX_EMOCIONES,
  MAX_PALABRA,
  alternarEmocion,
  etiquetaDe,
  etiquetaPropia,
  etiquetasDe,
  paraGuardar,
  primeraPalabra,
} from '../emocionesJournal.js'
import { CATALOGO as CATALOGO_MANANA } from '../emociones.js'

const CHIPS = 'src/components/diario/ChipsEmociones.jsx'
const JOURNAL = 'src/pages/diario/Journal.jsx'
const MANANA = 'src/components/diario/DiarioManana.jsx'

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('el catálogo (§5.8.1)', () => {
  it('tiene quince emociones, en orden fijo', () => {
    expect(CATALOGO).toHaveLength(15)
    expect(IDS[0]).toBe('feliz')
    expect(IDS[IDS.length - 1]).toBe('solo')
  })

  it('las emociones difíciles son obligatorias y están todas', () => {
    const dificiles = [
      'cansado',
      'triste',
      'ansioso',
      'frustrado',
      'preocupado',
      'melancolico',
      'solo',
    ]
    dificiles.forEach((id) => expect(IDS).toContain(id))
  })

  it('cada emoción trae emoji y las tres formas de género', () => {
    CATALOGO.forEach((emocion) => {
      expect(emocion.emoji).toBeTruthy()
      expect(typeof emocion.label.m).toBe('string')
      expect(typeof emocion.label.f).toBe('string')
      expect(typeof emocion.label.n).toBe('string')
    })
  })

  it('es un catálogo distinto del de la mañana (§5.3.2)', () => {
    // La mañana pregunta qué cultivar y no puede ofrecer "Ansiosa" como algo a
    // cultivar; el Journal pregunta qué hay y tiene que poder recibirlo.
    const deLaManana = CATALOGO_MANANA.map((emocion) => emocion.id)
    expect(deLaManana).not.toContain('triste')
    expect(deLaManana).not.toContain('ansioso')
    expect(IDS).toContain('triste')
    expect(IDS).toContain('ansioso')
  })

  it('la etiqueta se resuelve al género del perfil (RN-GEN-04)', () => {
    expect(etiquetaDe('cansado', 'f')).toBe('Cansada')
    expect(etiquetaDe('cansado', 'm')).toBe('Cansado')
    expect(etiquetaDe('cansado', 'n')).toBe('Con cansancio')
    expect(etiquetaDe('cansado', undefined)).toBe('Con cansancio')
  })
})

describe('selección: máximo tres, sin bloquear (§5.8.1, criterio 1)', () => {
  it('añade y quita al tocar', () => {
    expect(alternarEmocion([], 'feliz').seleccion).toEqual(['feliz'])
    expect(alternarEmocion(['feliz'], 'feliz').seleccion).toEqual([])
  })

  it('la cuarta entra y sale la más antigua, sin error', () => {
    const tres = ['feliz', 'triste', 'ansioso']
    const { seleccion, desplazada } = alternarEmocion(tres, 'solo')
    expect(seleccion).toEqual(['triste', 'ansioso', 'solo'])
    expect(seleccion).toHaveLength(MAX_EMOCIONES)
    expect(desplazada).toBe('feliz')
  })

  it('lo que no está en el catálogo no entra', () => {
    expect(alternarEmocion([], 'inventada').seleccion).toEqual([])
  })

  it('"+ Otra" sí entra y cuenta como una de las tres', () => {
    const { seleccion } = alternarEmocion(['feliz'], ID_OTRA)
    expect(seleccion).toEqual(['feliz', ID_OTRA])
  })
})

describe('"+ Otra": una sola palabra (§5.8.1, criterio 3)', () => {
  it('se queda con la primera palabra', () => {
    expect(primeraPalabra('  serena  y tranquila ')).toBe('serena')
  })

  it('corta a la longitud máxima', () => {
    expect(primeraPalabra('a'.repeat(60))).toHaveLength(MAX_PALABRA)
  })

  it('se guarda tal cual, sin transformar', () => {
    expect(primeraPalabra('Serena')).toBe('Serena')
  })

  it('sin palabra, la selección se descarta', () => {
    expect(paraGuardar([ID_OTRA], '  ')).toEqual({ emotions: [], otherText: null })
  })

  it('con palabra, se guarda con ella', () => {
    expect(paraGuardar(['feliz', ID_OTRA], 'serena')).toEqual({
      emotions: ['feliz', ID_OTRA],
      otherText: 'serena',
    })
  })

  it('al presentarla va entrecomillada y sin género', () => {
    expect(etiquetasDe(['feliz', ID_OTRA], 'serena', 'f')).toEqual(['Feliz', '«serena»'])
  })
})

describe('lo que se guarda', () => {
  it('descarta lo que no sea del catálogo y respeta el tope', () => {
    expect(paraGuardar(['feliz', 'inventada', 'triste', 'solo', 'ansioso'], null).emotions).toEqual(
      ['feliz', 'triste', 'solo'],
    )
  })

  it('sin emociones, `otherText` es null y no una cadena vacía', () => {
    expect(paraGuardar([], '').otherText).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// El chip "+ Otra" acusa recibo, y Enter es una forma válida de confirmarlo.
//
// Antes no lo era: el campo solo tenía `onChange` desde SPEC_07, así que Enter
// no hacía absolutamente nada. Y como tampoco había acuse por ninguna otra vía
// —ni botón, ni `onBlur`—, escribir la palabra no cambiaba un solo píxel en
// pantalla, aunque sí se estuviera guardando. Las dos mitades se arreglan
// juntas: sin la primera, Enter seguiría sin verse; sin la segunda, seguiría
// sin ocurrir.

describe('la palabra propia se presenta igual en todas partes', () => {
  it('va entrecomillada, se escriba donde se escriba', () => {
    expect(etiquetaPropia('serena')).toBe('«serena»')
    expect(etiquetasDe([ID_OTRA], 'serena', 'f')).toEqual([etiquetaPropia('serena')])
  })

  it('sin palabra no hay etiqueta, así que el chip conserva su rótulo', () => {
    expect(etiquetaPropia('')).toBe('')
    expect(etiquetaPropia('   ')).toBe('')
    expect(etiquetaPropia(null)).toBe('')
  })

  it('aplica la regla de una sola palabra, igual que al guardar', () => {
    expect(etiquetaPropia('muy serena hoy')).toBe('«muy»')
    expect(etiquetaPropia('a'.repeat(MAX_PALABRA + 8))).toBe(`«${'a'.repeat(MAX_PALABRA)}»`)
  })
})

describe('Enter confirma la palabra propia', () => {
  it('el campo escucha Enter y suelta el foco', () => {
    const codigo = codigoDe(CHIPS)
    expect(codigo).toMatch(/evento\.key !== 'Enter'/)
    expect(codigo).toMatch(/onConfirmar\?\.\(\)/)
    expect(codigo).toMatch(/currentTarget\.blur\(\)/)
  })

  it('confirma con lo que ya está en el borrador: no valida por su cuenta', () => {
    // La regla de una sola palabra corre en `onCambiarValor`, en cada tecla.
    // Si Enter tuviera su propio `primeraPalabra`, habría dos sitios donde vive
    // la misma regla y uno de los dos envejecería.
    const chips = codigoDe(CHIPS)
    expect(chips).not.toMatch(/primeraPalabra/)
    expect(codigoDe(JOURNAL)).toMatch(/onCambiarValor: \(valor\) =>[\s\S]{0,80}primeraPalabra/)
  })

  it('Enter vuelca lo mismo que el autoguardado, no una segunda vía', () => {
    expect(codigoDe(JOURNAL)).toMatch(/onConfirmar: acciones\.volcar/)
  })

  it('un espacio no puede colarse por ninguna vía', () => {
    // Lo que Enter confirma es lo que hay en el borrador, y ahí no hay espacios.
    expect(primeraPalabra('serena y en paz')).toBe('serena')
    expect(paraGuardar([ID_OTRA], 'serena y en paz').otherText).toBe('serena')
  })
})

describe('el acuse vive en el chip', () => {
  it('con el chip elegido y palabra escrita, el chip muestra la palabra', () => {
    const codigo = codigoDe(CHIPS)
    expect(codigo).toMatch(/seleccion\.includes\(otra\.id\) && otra\.etiquetaValor/)
    expect(codigo).toMatch(/<span>\{textoDeOtra\}<\/span>/)
  })

  it('el lector de pantalla oye lo mismo que se ve', () => {
    expect(codigoDe(CHIPS)).toMatch(/aria-label=\{`\$\{textoDeOtra\}/)
  })

  it('el formato no se construye en el componente: llega ya hecho', () => {
    // El componente lo comparten dos catálogos y no puede conocer el de uno.
    expect(codigoDe(CHIPS)).not.toMatch(/«/)
    expect(codigoDe(JOURNAL)).toMatch(/etiquetaValor: etiquetaPropia/)
  })
})

describe('la mañana no tiene palabra propia (§5.3.2)', () => {
  it('su catálogo no ofrece "+ Otra", así que el arreglo no la alcanza', () => {
    const manana = codigoDe(MANANA)
    const monta = manana.slice(manana.indexOf('<ChipsEmociones'))
    expect(monta.slice(0, monta.indexOf('/>'))).not.toMatch(/\botra=/)
    expect(CATALOGO_MANANA.some((emocion) => emocion.id === ID_OTRA)).toBe(false)
  })
})
