// src/lib/__tests__/ritmoRespiracion.test.js
// El ritmo 5-5-3 (§C2.3 · §5.1.2). Es lo que comprueba el criterio 1 de
// SPEC_08, y por eso vive en un módulo puro: un ciclo de 13 s exactos se mide
// sin React y sin Web Audio.

import { describe, expect, it } from 'vitest'

import {
  CICLOS,
  DURACION_CICLO,
  DURACION_TOTAL,
  ESCALA_PLENA,
  ESCALA_REPOSO,
  FASES,
  IDS_FASE,
  OPACIDAD_ESTATICA,
  duracionDe,
  escalaEn,
  faseEn,
} from '../ritmoRespiracion.js'

describe('el ritmo (SPEC_08, criterio 1)', () => {
  it('un ciclo dura exactamente 13 s: 5 + 5 + 3', () => {
    expect(duracionDe('inhalar')).toBe(5000)
    expect(duracionDe('exhalar')).toBe(5000)
    expect(duracionDe('pausa')).toBe(3000)
    expect(DURACION_CICLO).toBe(13000)
  })

  it('la experiencia completa son tres ciclos, ~39 s', () => {
    expect(CICLOS).toBe(3)
    expect(DURACION_TOTAL).toBe(39000)
  })

  it('la pausa va al final del ciclo: es 5-5-3, no 5-3-5', () => {
    expect(IDS_FASE).toEqual(['inhalar', 'exhalar', 'pausa'])
    expect(FASES[FASES.length - 1].id).toBe('pausa')
  })
})

describe('en qué fase cae cada instante', () => {
  it('recorre las tres fases del primer ciclo', () => {
    expect(faseEn(0).fase).toBe('inhalar')
    expect(faseEn(4999).fase).toBe('inhalar')
    expect(faseEn(5000).fase).toBe('exhalar')
    expect(faseEn(9999).fase).toBe('exhalar')
    expect(faseEn(10000).fase).toBe('pausa')
    expect(faseEn(12999).fase).toBe('pausa')
  })

  it('el segundo ciclo empieza donde termina el primero', () => {
    expect(faseEn(13000)).toMatchObject({ fase: 'inhalar', ciclo: 1 })
    expect(faseEn(26000)).toMatchObject({ fase: 'inhalar', ciclo: 2 })
  })

  it('a los 39 s ha terminado, y ni un milisegundo antes', () => {
    expect(faseEn(38999).terminado).toBe(false)
    expect(faseEn(39000).terminado).toBe(true)
    expect(faseEn(120000).terminado).toBe(true)
  })

  it('dice lo que le queda a la fase, que es lo que necesita el audio', () => {
    expect(faseEn(0).restante).toBe(5000)
    expect(faseEn(2000).restante).toBe(3000)
    expect(faseEn(11000).restante).toBe(2000)
  })

  it('el progreso va de 0 a 1 dentro de la fase', () => {
    expect(faseEn(0).progreso).toBe(0)
    expect(faseEn(2500).progreso).toBe(0.5)
    expect(faseEn(11500).progreso).toBe(0.5)
  })

  it('un instante imposible no devuelve un estado imposible', () => {
    expect(faseEn(-100).fase).toBe('inhalar')
    expect(faseEn(NaN).fase).toBe('inhalar')
    expect(faseEn(undefined).fase).toBe('inhalar')
  })

  it('con un solo ciclo, termina a los 13 s', () => {
    expect(faseEn(12999, 1).terminado).toBe(false)
    expect(faseEn(13000, 1).terminado).toBe(true)
  })
})

describe('el movimiento del círculo (§5.1.2)', () => {
  it('va de 1,0 a 1,18 al inhalar y vuelve al exhalar', () => {
    expect(escalaEn('inhalar', 0)).toBeCloseTo(ESCALA_REPOSO, 5)
    expect(escalaEn('inhalar', 1)).toBeCloseTo(ESCALA_PLENA, 5)
    expect(escalaEn('exhalar', 0)).toBeCloseTo(ESCALA_PLENA, 5)
    expect(escalaEn('exhalar', 1)).toBeCloseTo(ESCALA_REPOSO, 5)
  })

  it('se queda quieto en la pausa', () => {
    expect(escalaEn('pausa', 0)).toBe(ESCALA_REPOSO)
    expect(escalaEn('pausa', 0.5)).toBe(ESCALA_REPOSO)
    expect(escalaEn('pausa', 1)).toBe(ESCALA_REPOSO)
  })

  it('crece sin tirones y nunca se sale del recorrido', () => {
    let anterior = -Infinity
    for (let p = 0; p <= 1; p += 0.05) {
      const escala = escalaEn('inhalar', p)
      expect(escala).toBeGreaterThanOrEqual(anterior)
      expect(escala).toBeLessThanOrEqual(ESCALA_PLENA)
      anterior = escala
    }
  })
})

describe('reducir movimiento cambia el cómo, nunca el cuánto (§6.10.1)', () => {
  it('hay una opacidad estática por fase', () => {
    expect(Object.keys(OPACIDAD_ESTATICA).sort()).toEqual(['exhalar', 'inhalar', 'pausa'])
    expect(OPACIDAD_ESTATICA.inhalar).toBeGreaterThan(OPACIDAD_ESTATICA.exhalar)
    expect(OPACIDAD_ESTATICA.exhalar).toBeGreaterThan(OPACIDAD_ESTATICA.pausa)
  })

  it('las duraciones no dependen de ninguna preferencia', () => {
    // La duración no es una animación: es el ejercicio. Acortarla no reduce el
    // movimiento, elimina el contenido terapéutico. Por eso el ritmo no tiene
    // ni un parámetro que permita hacerlo más corto.
    expect(DURACION_CICLO).toBe(13000)
    expect(faseEn(5000).fase).toBe('exhalar')
  })
})
