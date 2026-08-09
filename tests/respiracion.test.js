// tests/respiracion.test.js
// El círculo de la respiración guiada (bloque 05).
//
// Las dos cosas del ejercicio que se pueden romper sin darse cuenta al tocar
// tokens: el ritmo 5-5-3 y el contraste del círculo contra el fondo del ritual.
// El color se eligió con estas cotas delante, no a ojo, así que aclararlo un
// paso rompe la prueba en vez de romper la visibilidad de alguien.

import { describe, it, expect } from 'vitest'
import { contraste } from '@lib/gradienteHorario'
import { colors, gradientsBySlot, respiracion } from '@tokens'

// Elementos de interfaz: 3:1 (WCAG 2.2 · §C del protocolo)
const ELEMENTO = 3

// El círculo vive en el centro de la pantalla, donde los dos degradados del
// ritual ya han llegado a papel. Los extremos superiores se comprueban igual,
// porque son el peor caso posible aunque el círculo no llegue a pisarlos.
const FONDOS = {
  papel:            colors.paper,
  amanecerArranque: gradientsBySlot.amanecer.from, // ritual de mañana
  nocheArranque:    gradientsBySlot.noche.from,    // ritual de noche
}

describe('El círculo se ve sobre el fondo del ritual', () => {
  // El extremo claro del degradado radial es el que menos margen tiene: si
  // pasa este, el profundo pasa de sobra.
  it('el núcleo cumple 3:1 contra los dos rituales, en reposo', () => {
    for (const [nombre, fondo] of Object.entries(FONDOS)) {
      expect(contraste(respiracion.core, fondo), `fondo: ${nombre}`)
        .toBeGreaterThanOrEqual(ELEMENTO)
    }
  })

  it('el extremo profundo del degradado también', () => {
    for (const [nombre, fondo] of Object.entries(FONDOS)) {
      expect(contraste(respiracion.coreDeep, fondo), `fondo: ${nombre}`)
        .toBeGreaterThanOrEqual(ELEMENTO)
    }
  })

  it('el núcleo no se pinta a media opacidad: mezclado con papel perdería la cota', () => {
    // La comprobación no es decorativa. Deja escrito por qué el componente
    // mueve la opacidad del halo y nunca la del núcleo.
    const aMedias = mezclar(respiracion.core, colors.paper, 0.25)
    expect(contraste(aMedias, colors.paper)).toBeLessThan(ELEMENTO)
  })
})

describe('El ritmo del ciclo', () => {
  it('es 5-5-3, con la pausa al final', () => {
    expect(respiracion.inhalar).toBe(5000)
    expect(respiracion.exhalar).toBe(5000)
    expect(respiracion.reposo).toBe(3000)
  })

  it('suma trece segundos exactos', () => {
    expect(respiracion.inhalar + respiracion.exhalar + respiracion.reposo)
      .toBe(respiracion.ciclo)
    expect(respiracion.ciclo).toBe(13000)
  })

  it('el cruce de las palabras sí se queda dentro del rango del sistema', () => {
    // Las fases son la excepción autorizada; el cambio de "Inhala" a "Exhala"
    // no lo es: eso es una transición de interfaz como cualquier otra.
    expect(respiracion.cruce).toBeGreaterThanOrEqual(120)
    expect(respiracion.cruce).toBeLessThanOrEqual(900)
  })
})

describe('El tamaño del círculo', () => {
  const ANCHO_ESTRECHO = 360
  const MARGEN_RITUAL  = 24 // px-6 a cada lado en RitualLayout
  const CABE = ANCHO_ESTRECHO - MARGEN_RITUAL * 2

  it('expandido cabe en una pantalla de 360 px con los márgenes del ritual', () => {
    expect(respiracion.diametro * respiracion.escalaMaxima).toBeLessThanOrEqual(CABE)
  })

  it('y la caja del halo también, que es la que de verdad puede desbordar', () => {
    // Lo que se pinta del halo se apaga mucho antes de su borde, pero la caja
    // escalada sí cuenta para el desbordamiento del contenedor del ritual.
    const halo = respiracion.diametro * (1 + respiracion.haloSobresale * 2)
    expect(halo * respiracion.escalaMaxima).toBeLessThanOrEqual(CABE)
  })
})

// Mezcla dos hex en el espacio sRGB, como haría el navegador al pintar `color`
// con opacidad sobre `fondo`.
function mezclar(color, fondo, opacidadDelFondo) {
  const canales = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  const [r, g, b] = canales(color).map((canal, i) =>
    Math.round(canal * (1 - opacidadDelFondo) + canales(fondo)[i] * opacidadDelFondo)
  )
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}
