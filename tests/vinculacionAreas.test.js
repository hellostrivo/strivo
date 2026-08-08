// tests/vinculacionAreas.test.js
// La deducción del área de una victoria (§24.4). Lo que se prueba sobre todo es
// el silencio: por defecto no se etiqueta, y una etiqueta equivocada es peor
// que ninguna.

import { describe, it, expect } from 'vitest'
import { areaDe, normalizar, LEXICO } from '@lib/lexicoAreas'
import { AREA_TYPES } from '@lib/areas'

const TODAS = [...AREA_TYPES]

describe('Cuándo sí se etiqueta (§24.4)', () => {
  it('"Comer saludablemente" con Salud elegida → Salud', () => {
    expect(areaDe('Comer saludablemente', ['salud', 'trabajo'])).toBe('salud')
  })

  it('coincide por raíz, no por cadena exacta', () => {
    for (const texto of ['Comer mejor', 'Comiendo con calma', 'Preparar la comida']) {
      expect(areaDe(texto, ['salud']), texto).toBe('salud')
    }
  })

  it('los acentos y los signos no estorban', () => {
    expect(areaDe('Hacer ejercicio, aunque sea poco.', ['salud'])).toBe('salud')
    expect(areaDe('Llamar a mi mamá', ['relaciones'])).toBe('relaciones')
  })
})

describe('Cuándo se calla (§24.4)', () => {
  it('sin el área entre las elegidas, no etiqueta', () => {
    expect(areaDe('Comer saludablemente', ['trabajo', 'finanzas'])).toBeNull()
  })

  it('sin áreas elegidas, no etiqueta', () => {
    expect(areaDe('Comer saludablemente', [])).toBeNull()
  })

  it('si toca dos áreas, no adivina', () => {
    // "Llamar" es de relaciones y "cliente" de trabajo: con las dos elegidas,
    // silencio.
    expect(areaDe('Llamar a un cliente', ['relaciones', 'trabajo'])).toBeNull()
  })

  it('sin relación con nada, no etiqueta', () => {
    expect(areaDe('Que salga el sol', TODAS)).toBeNull()
    expect(areaDe('Terminar el rompecabezas', TODAS)).toBeNull()
  })

  it('un texto muy corto no se evalúa', () => {
    expect(areaDe('ok', TODAS)).toBeNull()
    expect(areaDe('  ', TODAS)).toBeNull()
    expect(areaDe('', TODAS)).toBeNull()
  })

  it('nunca coincide por fragmento suelto dentro de otra palabra', () => {
    // "paz" dentro de "capaz" es el caso que §24.6 prohíbe expresamente
    expect(areaDe('Sentirme capaz', TODAS)).toBeNull()
    // "fe" dentro de "feliz" tampoco
    expect(areaDe('Estar feliz', TODAS)).toBeNull()
  })
})

describe('El comportamiento por defecto es no etiquetar (§24.4)', () => {
  it('en diez victorias variadas, ninguna etiqueta es incorrecta', () => {
    const elegidas = ['salud', 'trabajo', 'relaciones']
    const casos = [
      ['Comer saludablemente',            'salud'],
      ['Dormir ocho horas',               'salud'],
      ['Salir a caminar',                 'salud'],
      ['Terminar el informe',             'trabajo'],
      ['Preparar la presentación',        'trabajo'],
      ['Llamar a mi hermana',             'relaciones'],
      ['Escuchar de verdad a mi pareja',  'relaciones'],
      ['Que el día se sienta ligero',      null],
      ['Encontrar un momento para mí',     null],
      ['Sentirme capaz',                   null],
    ]

    for (const [texto, esperado] of casos) {
      expect(areaDe(texto, elegidas), texto).toBe(esperado)
    }
  })

  it('la mayoría de las líneas se quedan sin etiqueta', () => {
    // Si al probarlo aparecen etiquetas en casi todas, el léxico es demasiado
    // amplio y hay que restringirlo (§24.4).
    const sueltas = [
      'Que hoy se sienta distinto', 'Sonreír más', 'Tener un buen día',
      'Sentirme en paz', 'Que salga bien', 'Estar presente',
    ]
    const etiquetadas = sueltas.filter(texto => areaDe(texto, TODAS))
    expect(etiquetadas).toHaveLength(0)
  })
})

describe('El léxico', () => {
  it('cubre las siete áreas del catálogo', () => {
    for (const tipo of AREA_TYPES) {
      expect(LEXICO[tipo], tipo).toBeDefined()
      expect(LEXICO[tipo].length).toBeGreaterThan(5)
    }
  })

  it('normalizar deja palabras limpias, sin acentos ni signos', () => {
    expect(normalizar('¡Comer más frutas!')).toEqual(['comer', 'mas', 'frutas'])
  })
})
