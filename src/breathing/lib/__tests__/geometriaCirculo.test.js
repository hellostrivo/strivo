// src/breathing/lib/__tests__/geometriaCirculo.test.js
// Criterios 2, 3, 4, 5 y 6 de SPEC_14, y las reglas de §7 sobre el círculo.
//
// Todo se comprueba sin DOM y sin React: la geometría es pura, y esa es la
// razón de que viva fuera del `.jsx` (§2.2).

import { describe, expect, it } from 'vitest'

import {
  CENTRO,
  ESCALONES,
  FRACCION_MINIMA,
  OPACIDAD_HALO_QUIETA,
  RADIO_BASE,
  VIEWBOX,
  calcularArco,
  calcularRadios,
  cuantizarAmplitud,
  cuantizarProgreso,
} from '../geometriaCirculo.js'
import { CATALOGO_PATRONES } from '@/breathing/data/catalogoPatrones.js'
import { duracionCiclo, fasesDelCiclo, resolverEstado } from '@lib/respiracion/motorRitmo.js'

const R = 96

describe('los radios del disco (criterio 2, RN-RE-VIS-04)', () => {
  it('vacío es exactamente el 32 % del anillo, nunca cero', () => {
    expect(calcularRadios(0, R).radioDisco).toBe(0.32 * R)
  })

  it('lleno es exactamente el radio del anillo', () => {
    expect(calcularRadios(1, R).radioDisco).toBe(R)
  })

  it('un punto que desaparece se sentiría como asfixia: el mínimo es 0,32', () => {
    expect(FRACCION_MINIMA).toBe(0.32)
    for (let a = 0; a <= 1; a += 0.05) {
      expect(calcularRadios(a, R).radioDisco).toBeGreaterThanOrEqual(0.32 * R)
    }
  })

  it('recorta las amplitudes fuera de rango en vez de dibujar un radio absurdo', () => {
    expect(calcularRadios(-3, R).radioDisco).toBe(0.32 * R)
    expect(calcularRadios(7, R).radioDisco).toBe(R)
    expect(calcularRadios(NaN, R).radioDisco).toBe(0.32 * R)
  })

  it('el halo sigue al disco al 118 %', () => {
    for (const a of [0, 0.25, 0.5, 0.75, 1]) {
      const { radioDisco, radioHalo } = calcularRadios(a, R)
      expect(radioHalo).toBeCloseTo(radioDisco * 1.18, 10)
    }
  })

  it('la opacidad del halo crece con la amplitud, de 0,06 a 0,16', () => {
    expect(calcularRadios(0, R).opacidadHalo).toBeCloseTo(0.06, 10)
    expect(calcularRadios(1, R).opacidadHalo).toBeCloseTo(0.16, 10)
  })

  it('usa el radio de §3.4 cuando no le pasan ninguno', () => {
    expect(calcularRadios(1).radioDisco).toBe(RADIO_BASE)
    expect(RADIO_BASE).toBe(96)
    expect(CENTRO).toBe(160)
    expect(VIEWBOX).toEqual({ ancho: 320, alto: 320 })
  })
})

describe('el disco a lo largo de las fases (criterios 3 y 4)', () => {
  const presets = CATALOGO_PATRONES.map((entrada) => [entrada.id, entrada.patron])

  it.each(presets)('%s: el radio nunca decrece mientras se inhala', (_id, patron) => {
    const tramo = fasesDelCiclo(patron).find((t) => t.fase === 'inhalar')
    let anterior = -Infinity
    for (let ms = tramo.msInicio; ms < tramo.msFin; ms += 20) {
      const radio = calcularRadios(resolverEstado(patron, ms).amplitud, R).radioDisco
      expect(radio).toBeGreaterThanOrEqual(anterior)
      anterior = radio
    }
  })

  it.each(presets)('%s: el radio nunca crece mientras se exhala', (_id, patron) => {
    const tramo = fasesDelCiclo(patron).find((t) => t.fase === 'exhalar')
    let anterior = Infinity
    for (let ms = tramo.msInicio; ms < tramo.msFin; ms += 20) {
      const radio = calcularRadios(resolverEstado(patron, ms).amplitud, R).radioDisco
      expect(radio).toBeLessThanOrEqual(anterior)
      anterior = radio
    }
  })

  it.each(presets)('%s: en las retenciones el radio no se mueve (RN-RE-VIS-05)', (_id, patron) => {
    for (const tramo of fasesDelCiclo(patron)) {
      if (tramo.fase !== 'retenerLleno' && tramo.fase !== 'retenerVacio') continue
      const radios = new Set()
      for (let ms = tramo.msInicio; ms < tramo.msFin; ms += 20) {
        radios.add(calcularRadios(resolverEstado(patron, ms).amplitud, R).radioDisco)
      }
      // Varianza cero: un solo valor distinto en toda la fase. La quietud del
      // dibujo es la instrucción; un latido decorativo diría "sigue moviéndote".
      expect(radios.size).toBe(1)
    }
  })

  it('retenerLleno se queda arriba del todo y retenerVacio abajo del todo', () => {
    const patron = { inhalar: 40, retenerLleno: 40, exhalar: 40, retenerVacio: 40 }
    expect(resolverEstado(patron, 5000).amplitud).toBe(1)
    expect(resolverEstado(patron, 13000).amplitud).toBe(0)
  })
})

describe('el arco de fase (criterios 5 y 6, RN-RE-VIS-06)', () => {
  it('a progreso 0 no se ve nada', () => {
    expect(calcularArco(0, R).longitudVisible).toBe(0)
  })

  it('a progreso 1 se ve la circunferencia entera (± 0,5)', () => {
    const { longitudVisible, longitudTotal } = calcularArco(1, R)
    expect(longitudTotal).toBeCloseTo(2 * Math.PI * R, 6)
    expect(Math.abs(longitudVisible - 2 * Math.PI * R)).toBeLessThan(0.5)
  })

  it('el desfase es lo que falta por recorrer', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const arco = calcularArco(t, R)
      expect(arco.desfase + arco.longitudVisible).toBeCloseTo(arco.longitudTotal, 8)
    }
  })

  it('arranca a las 12 en punto y da la vuelta en dos medias vueltas', () => {
    // Un solo arco de 360° es ambiguo en SVG: el punto inicial y el final
    // coinciden y hay motores que no lo pintan.
    const { d } = calcularArco(1, R, CENTRO)
    expect(d.startsWith(`M ${CENTRO} ${CENTRO - R}`)).toBe(true)
    expect(d.match(/A /g)).toHaveLength(2)
  })

  it('mide la fase actual y no el ciclo: se reinicia en cada cambio de fase', () => {
    const patron = { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 }
    for (const tramo of fasesDelCiclo(patron)) {
      const alEmpezar = resolverEstado(patron, tramo.msInicio)
      expect(alEmpezar.fase).toBe(tramo.fase)
      expect(calcularArco(alEmpezar.progresoFase, R).longitudVisible).toBe(0)
    }
  })

  it('se reinicia también en el segundo ciclo y en el décimo', () => {
    const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
    const ciclo = duracionCiclo(patron)
    for (const n of [1, 9]) {
      const estado = resolverEstado(patron, n * ciclo)
      expect(estado.fase).toBe('inhalar')
      expect(calcularArco(estado.progresoFase, R).longitudVisible).toBe(0)
    }
  })

  it('recorta un progreso imposible en vez de dibujar dos vueltas', () => {
    expect(calcularArco(4, R).longitudVisible).toBeCloseTo(2 * Math.PI * R, 6)
    expect(calcularArco(-1, R).longitudVisible).toBe(0)
  })
})

describe('movimiento reducido: cuatro escalones, no sesenta pasos (§7)', () => {
  it('los escalones son 0, 33 %, 66 % y 100 %', () => {
    expect(ESCALONES).toEqual([0, 1 / 3, 2 / 3, 1])
  })

  it('cualquier amplitud cae en uno de los cuatro', () => {
    const vistos = new Set()
    for (let a = 0; a <= 1; a += 0.001) vistos.add(cuantizarAmplitud(a))
    expect([...vistos].sort((x, y) => x - y)).toEqual(ESCALONES.slice())
  })

  it('los extremos no se pierden por el redondeo', () => {
    expect(cuantizarAmplitud(0)).toBe(0)
    expect(cuantizarAmplitud(1)).toBe(1)
  })

  it('el arco avanza de segundo en segundo, no por frame', () => {
    const msFase = 7000
    const vistos = new Set()
    for (let ms = 0; ms < msFase; ms += 16) vistos.add(cuantizarProgreso(ms / msFase, msFase))
    // Siete segundos de retención → siete posiciones, no cuatrocientas.
    expect(vistos.size).toBe(7)
  })

  it('un paso dura un segundo tanto en una fase de 4 s como en una de 20 s', () => {
    expect(cuantizarProgreso(0.5, 4000)).toBeCloseTo(2000 / 4000, 10)
    expect(cuantizarProgreso(0.5, 20000)).toBeCloseTo(10000 / 20000, 10)
  })

  it('sin duración de fase devuelve el progreso tal cual, sin romperse', () => {
    expect(cuantizarProgreso(0.42, 0)).toBeCloseTo(0.42, 10)
    expect(cuantizarProgreso(0.42, NaN)).toBeCloseTo(0.42, 10)
  })

  it('la opacidad del halo se queda fija, sin latido', () => {
    expect(OPACIDAD_HALO_QUIETA).toBe(0.1)
  })
})
