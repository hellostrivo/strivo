// src/lumia/__tests__/emocionesJournal.test.js
// El catálogo de emociones del Journal (§5.8.1) y su regla de selección.

import { describe, expect, it } from 'vitest'

import {
  CATALOGO,
  ID_OTRA,
  IDS,
  MAX_EMOCIONES,
  MAX_PALABRA,
  alternarEmocion,
  etiquetaDe,
  etiquetasDe,
  paraGuardar,
  primeraPalabra,
} from '../emocionesJournal.js'
import { CATALOGO as CATALOGO_MANANA } from '../emociones.js'

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
