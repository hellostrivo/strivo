// src/lib/respiracion/__tests__/motorRitmo.test.js
// El motor de ritmo generalizado (SPEC_13 §6). Criterios 2, 3, 4, 5, 6 y 7.
//
// Vive en un módulo puro por el mismo motivo que `constancia.js` o el propio
// `ritmoRespiracion.js` de SPEC_08: un ciclo de duración exacta y una amplitud
// continua se miden sin React, sin Web Audio y sin reloj de pared.

import { describe, expect, it } from 'vitest'

import { cosenoElevado, lineal } from '../curvas.js'
import {
  AVISOS,
  FASES_EN_ORDEN,
  MAX_CICLO,
  MAX_FASE,
  MIN_CICLO,
  MIN_FASE_ACTIVA,
  PATRON_BASE,
  amplitudEn,
  duracionCiclo,
  esCaja,
  fasesDelCiclo,
  resolverEstado,
  sonIguales,
  validarPatron,
} from '../motorRitmo.js'

// Los seis presets de §5.2, escritos aquí a mano a propósito: si el catálogo
// cambia un número, estas pruebas siguen midiendo el motor y no se mueven con él.
const PRESETS = [
  { id: 'calma-553', inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 },
  { id: 'caja', inhalar: 40, retenerLleno: 40, exhalar: 40, retenerVacio: 40 },
  { id: 'cuatro-siete-ocho', inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 },
  { id: 'exhalacion-larga', inhalar: 40, retenerLleno: 0, exhalar: 80, retenerVacio: 0 },
  { id: 'coherencia', inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 0 },
  { id: 'entrada-suave', inhalar: 40, retenerLleno: 0, exhalar: 60, retenerVacio: 0 },
]

const sinId = ({ id: _id, ...patron }) => patron

describe('el orden de las fases es el único que existe', () => {
  it('inhalar, retener lleno, exhalar, retener vacío', () => {
    expect(FASES_EN_ORDEN).toEqual(['inhalar', 'retenerLleno', 'exhalar', 'retenerVacio'])
  })
})

describe('duración del ciclo (criterio 3)', () => {
  it.each(PRESETS)('$id: las fases suman el ciclo exacto', (preset) => {
    const patron = sinId(preset)
    const suma = fasesDelCiclo(patron).reduce((total, tramo) => total + tramo.ms, 0)
    expect(suma).toBe(duracionCiclo(patron))
    expect(Number.isInteger(duracionCiclo(patron))).toBe(true)
  })

  it('los ciclos declarados en §5.2 son los que salen', () => {
    expect(duracionCiclo(sinId(PRESETS[0]))).toBe(13_000)
    expect(duracionCiclo(sinId(PRESETS[1]))).toBe(16_000)
    expect(duracionCiclo(sinId(PRESETS[2]))).toBe(19_000)
    expect(duracionCiclo(sinId(PRESETS[3]))).toBe(12_000)
    expect(duracionCiclo(sinId(PRESETS[4]))).toBe(10_000)
    expect(duracionCiclo(sinId(PRESETS[5]))).toBe(10_000)
  })

  it('los tramos son contiguos y empiezan en cero', () => {
    const tramos = fasesDelCiclo(sinId(PRESETS[1]))
    expect(tramos[0].msInicio).toBe(0)
    tramos.forEach((tramo, i) => {
      if (i > 0) expect(tramo.msInicio).toBe(tramos[i - 1].msFin)
    })
  })
})

describe('caso 9.1 — un patrón sin retenciones', () => {
  it('las fases de duración 0 no aparecen en el ciclo', () => {
    const tramos = fasesDelCiclo({ inhalar: 40, retenerLleno: 0, exhalar: 60, retenerVacio: 0 })
    expect(tramos.map((tramo) => tramo.fase)).toEqual(['inhalar', 'exhalar'])
  })

  it('se pasa de inhalar a exhalar sin escalón: la amplitud llega a 1 y baja', () => {
    const patron = { inhalar: 40, retenerLleno: 0, exhalar: 60, retenerVacio: 0 }
    expect(resolverEstado(patron, 3999).amplitud).toBeCloseTo(1, 3)
    expect(resolverEstado(patron, 4001).amplitud).toBeCloseTo(1, 3)
  })
})

describe('resolverEstado en los seis presets (criterio 2)', () => {
  it.each(PRESETS)('$id: la fase resuelta coincide con el tramo, en 24 puntos', (preset) => {
    const patron = sinId(preset)
    const total = duracionCiclo(patron)
    const tramos = fasesDelCiclo(patron)

    for (let i = 0; i < 24; i += 1) {
      const ms = Math.floor((total * i) / 24)
      const esperado = tramos.find((tramo) => ms >= tramo.msInicio && ms < tramo.msFin)
      const estado = resolverEstado(patron, ms)
      expect(estado.fase).toBe(esperado.fase)
      expect(estado.progresoFase).toBeGreaterThanOrEqual(0)
      expect(estado.progresoFase).toBeLessThan(1)
      expect(estado.msRestantesFase).toBe(esperado.msFin - ms)
    }
  })

  it.each(PRESETS)('$id: los ciclos se cuentan desde 1 y avanzan', (preset) => {
    const patron = sinId(preset)
    const total = duracionCiclo(patron)
    expect(resolverEstado(patron, 0).cicloActual).toBe(1)
    expect(resolverEstado(patron, total - 1).cicloActual).toBe(1)
    expect(resolverEstado(patron, total).cicloActual).toBe(2)
    expect(resolverEstado(patron, total * 9).cicloActual).toBe(10)
  })

  it('el progreso dentro del ciclo va de 0 a casi 1', () => {
    const patron = sinId(PRESETS[0])
    expect(resolverEstado(patron, 0).progresoCiclo).toBe(0)
    expect(resolverEstado(patron, 6500).progresoCiclo).toBeCloseTo(0.5, 5)
  })
})

describe('la amplitud es el contrato con la interfaz (§6.3)', () => {
  it.each(PRESETS)('$id: es continua entre fotogramas de 16 ms (criterio 4)', (preset) => {
    const patron = sinId(preset)
    const total = duracionCiclo(patron)
    let anterior = resolverEstado(patron, 0).amplitud

    for (let ms = 16; ms <= total * 2; ms += 16) {
      const actual = resolverEstado(patron, ms).amplitud
      expect(Math.abs(actual - anterior)).toBeLessThanOrEqual(0.08)
      anterior = actual
    }
  })

  it.each(PRESETS)('$id: nunca se sale de 0..1', (preset) => {
    const patron = sinId(preset)
    const total = duracionCiclo(patron)
    for (let ms = 0; ms < total; ms += 37) {
      const { amplitud } = resolverEstado(patron, ms)
      expect(amplitud).toBeGreaterThanOrEqual(0)
      expect(amplitud).toBeLessThanOrEqual(1)
    }
  })

  it('vale exactamente 1 en toda la retención llena (criterio 5)', () => {
    const patron = sinId(PRESETS[2]) // 4-7-8: retiene 7,0 s con el pulmón lleno
    for (let ms = 4000; ms < 11_000; ms += 100) {
      const estado = resolverEstado(patron, ms)
      expect(estado.fase).toBe('retenerLleno')
      expect(estado.amplitud).toBe(1)
    }
  })

  it('vale exactamente 0 en toda la retención vacía (criterio 5)', () => {
    const patron = sinId(PRESETS[0]) // 5-5-3: descansa 3,0 s con el pulmón vacío
    for (let ms = 10_000; ms < 13_000; ms += 50) {
      const estado = resolverEstado(patron, ms)
      expect(estado.fase).toBe('retenerVacio')
      expect(estado.amplitud).toBe(0)
    }
  })

  it('sube al inhalar y baja al exhalar', () => {
    const patron = sinId(PRESETS[4])
    expect(resolverEstado(patron, 0).amplitud).toBe(0)
    expect(resolverEstado(patron, 2500).amplitud).toBeCloseTo(0.5, 5)
    expect(resolverEstado(patron, 4999).amplitud).toBeGreaterThan(0.99)
    expect(resolverEstado(patron, 7500).amplitud).toBeCloseTo(0.5, 5)
  })

  it('amplitudEn es el único sitio donde se decide (§6.3)', () => {
    expect(amplitudEn('inhalar', 0.25)).toBe(0.25)
    expect(amplitudEn('retenerLleno', 0.9)).toBe(1)
    expect(amplitudEn('exhalar', 0.25)).toBe(0.75)
    expect(amplitudEn('retenerVacio', 0.9)).toBe(0)
    expect(amplitudEn('fase-que-no-existe', 0.5)).toBe(0)
  })
})

describe('RN-RE-MOT-10 — la curva es un parámetro', () => {
  it('con la lineal el punto medio de la inhalación es otro', () => {
    const patron = sinId(PRESETS[4])
    const conCoseno = resolverEstado(patron, 1250, { curva: cosenoElevado }).amplitud
    const conRecta = resolverEstado(patron, 1250, { curva: lineal }).amplitud
    expect(conRecta).toBeCloseTo(0.25, 5)
    expect(conCoseno).not.toBeCloseTo(conRecta, 3)
  })

  it('la curva no altera las duraciones, solo el recorrido', () => {
    const patron = sinId(PRESETS[4])
    const a = resolverEstado(patron, 1250, { curva: cosenoElevado })
    const b = resolverEstado(patron, 1250, { curva: lineal })
    expect(a.fase).toBe(b.fase)
    expect(a.progresoFase).toBe(b.progresoFase)
    expect(a.msRestantesFase).toBe(b.msRestantesFase)
  })

  it('las retenciones no llevan curva: su amplitud ya es constante', () => {
    const patron = sinId(PRESETS[2])
    const estado = resolverEstado(patron, 7000, { curva: lineal })
    expect(estado.progresoSuave).toBe(estado.progresoFase)
  })
})

describe('caso 9.2 — el ciclo más corto que se admite', () => {
  it('un ciclo de 6,0 s resuelve una fase por tramo, sin saltarse ninguna', () => {
    const patron = validarPatron({
      inhalar: 20,
      retenerLleno: 10,
      exhalar: 20,
      retenerVacio: 10,
    }).patron
    expect(duracionCiclo(patron)).toBe(MIN_CICLO * 100)
    const vistas = new Set()
    for (let ms = 0; ms < 6000; ms += 50) vistas.add(resolverEstado(patron, ms).fase)
    expect([...vistas].sort()).toEqual(['exhalar', 'inhalar', 'retenerLleno', 'retenerVacio'])
  })
})

describe('validarPatron corrige y nunca lanza (criterio 6 · RN-RE-MOT-07)', () => {
  it.each([null, undefined, {}, [], 0, 'un texto', NaN])('no lanza con %s', (entrada) => {
    expect(() => validarPatron(entrada)).not.toThrow()
    const { patron } = validarPatron(entrada)
    FASES_EN_ORDEN.forEach((fase) => expect(Number.isInteger(patron[fase])).toBe(true))
  })

  it('sin nada que corregir, dice que es válido', () => {
    const { valido, avisos } = validarPatron(PATRON_BASE)
    expect(valido).toBe(true)
    expect(avisos).toEqual([])
  })

  it('RN-RE-MOT-01: inhalar y exhalar nunca pueden ser 0', () => {
    const { patron, avisos } = validarPatron({ ...PATRON_BASE, inhalar: 0, exhalar: 0 })
    expect(patron.inhalar).toBeGreaterThanOrEqual(MIN_FASE_ACTIVA)
    expect(patron.exhalar).toBeGreaterThanOrEqual(MIN_FASE_ACTIVA)
    expect(avisos.some((aviso) => aviso.codigo === AVISOS.MINIMO_FASE)).toBe(true)
  })

  it('RN-RE-MOT-02: las retenciones sí pueden ser 0', () => {
    const { patron, valido } = validarPatron({
      inhalar: 40,
      retenerLleno: 0,
      exhalar: 60,
      retenerVacio: 0,
    })
    expect(patron.retenerLleno).toBe(0)
    expect(patron.retenerVacio).toBe(0)
    expect(valido).toBe(true)
  })

  it('RN-RE-MOT-03: una fase de 300 se recorta a 200', () => {
    const { patron, avisos } = validarPatron({ ...PATRON_BASE, inhalar: 300 })
    expect(patron.inhalar).toBe(MAX_FASE)
    expect(avisos.some((aviso) => aviso.codigo === AVISOS.MAXIMO_FASE)).toBe(true)
  })

  it('un valor negativo sube al mínimo de su fase', () => {
    const { patron } = validarPatron({
      inhalar: -40,
      retenerLleno: -5,
      exhalar: -1,
      retenerVacio: -9,
    })
    expect(patron.inhalar).toBeGreaterThanOrEqual(MIN_FASE_ACTIVA)
    expect(patron.retenerLleno).toBe(0)
    expect(patron.retenerVacio).toBe(0)
  })

  it('RN-RE-MOT-05: un decimal se redondea al múltiplo de 5 más cercano', () => {
    const { patron, avisos } = validarPatron({ ...PATRON_BASE, inhalar: 42.4, exhalar: 47.6 })
    expect(patron.inhalar).toBe(40)
    expect(patron.exhalar).toBe(50)
    expect(avisos.filter((aviso) => aviso.codigo === AVISOS.REDONDEADO)).toHaveLength(2)
  })

  it('RN-RE-MOT-04: un ciclo demasiado corto crece dando aire, no pausa', () => {
    const { patron, avisos } = validarPatron({
      inhalar: 10,
      retenerLleno: 0,
      exhalar: 10,
      retenerVacio: 0,
    })
    const total = patron.inhalar + patron.retenerLleno + patron.exhalar + patron.retenerVacio
    expect(total).toBeGreaterThanOrEqual(MIN_CICLO)
    expect(patron.retenerLleno).toBe(0)
    expect(patron.retenerVacio).toBe(0)
    expect(avisos.some((aviso) => aviso.codigo === AVISOS.CICLO_CORTO)).toBe(true)
  })

  it('RN-RE-MOT-04: un ciclo demasiado largo se recorta por la fase mayor', () => {
    const { patron, avisos } = validarPatron({
      inhalar: 200,
      retenerLleno: 200,
      exhalar: 200,
      retenerVacio: 200,
    })
    const total = patron.inhalar + patron.retenerLleno + patron.exhalar + patron.retenerVacio
    expect(total).toBeLessThanOrEqual(MAX_CICLO)
    expect(avisos.some((aviso) => aviso.codigo === AVISOS.CICLO_LARGO)).toBe(true)
  })

  it('el patrón corregido siempre resuelve un estado utilizable', () => {
    for (const entrada of [null, {}, { inhalar: 0 }, { exhalar: 'x' }, { inhalar: 999 }]) {
      const { patron } = validarPatron(entrada)
      const estado = resolverEstado(patron, 1234)
      expect(FASES_EN_ORDEN).toContain(estado.fase)
      expect(Number.isFinite(estado.amplitud)).toBe(true)
    }
  })

  it('cada aviso dice de qué a qué, no solo que pasó algo', () => {
    const { avisos } = validarPatron({ ...PATRON_BASE, inhalar: 300 })
    const aviso = avisos.find((a) => a.codigo === AVISOS.MAXIMO_FASE)
    expect(aviso).toMatchObject({ fase: 'inhalar', de: 300, a: MAX_FASE })
  })
})

describe('un patrón sin ninguna fase no rompe el motor', () => {
  it('devuelve reposo en vez de dividir entre cero', () => {
    const estado = resolverEstado({ inhalar: 0, retenerLleno: 0, exhalar: 0, retenerVacio: 0 }, 500)
    expect(estado.amplitud).toBe(0)
    expect(estado.cicloActual).toBe(1)
    expect(duracionCiclo({})).toBe(0)
  })

  it('un instante imposible no devuelve un estado imposible', () => {
    const patron = sinId(PRESETS[0])
    expect(resolverEstado(patron, -900).fase).toBe('inhalar')
    expect(resolverEstado(patron, NaN).fase).toBe('inhalar')
    expect(resolverEstado(patron, undefined).fase).toBe('inhalar')
  })
})

describe('RN-RE-MOT-09 — igualdad de patrones', () => {
  it('dos patrones con las cuatro fases iguales lo son', () => {
    expect(sonIguales(PATRON_BASE, { ...PATRON_BASE })).toBe(true)
  })

  it('una sola fase distinta basta para que no lo sean', () => {
    expect(sonIguales(PATRON_BASE, { ...PATRON_BASE, retenerVacio: 35 })).toBe(false)
  })

  it('nada que no sea un patrón es igual a un patrón', () => {
    expect(sonIguales(PATRON_BASE, null)).toBe(false)
    expect(sonIguales(null, null)).toBe(false)
    expect(sonIguales(PATRON_BASE, 'calma-553')).toBe(false)
  })
})

describe('esCaja', () => {
  it('las cuatro fases valen lo mismo', () => {
    expect(esCaja({ inhalar: 40, retenerLleno: 40, exhalar: 40, retenerVacio: 40 })).toBe(true)
    expect(esCaja({ inhalar: 55, retenerLleno: 55, exhalar: 55, retenerVacio: 55 })).toBe(true)
  })

  it('una fase distinta y deja de serlo', () => {
    expect(esCaja({ inhalar: 40, retenerLleno: 40, exhalar: 45, retenerVacio: 40 })).toBe(false)
    expect(esCaja(PATRON_BASE)).toBe(false)
    expect(esCaja(null)).toBe(false)
  })
})
