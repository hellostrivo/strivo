// src/onboarding/__tests__/pasos.test.js
// El recorrido: ocho pasos, un sub-paso y ningún hueco.
//
// Lo que estas pruebas custodian no es el orden por el orden: es que el género
// siga sin contar en el indicador. Un día alguien va a querer "arreglar" que
// P2A no tenga número, y arreglarlo significa que el total pase a nueve para
// unas personas y a ocho para otras.

import { describe, expect, it } from 'vitest'

import {
  CONTADOS,
  ORDEN,
  PASOS,
  TOTAL,
  VERSION,
  anterior,
  es,
  esSubPaso,
  indicadorDe,
  retomarEn,
  siguiente,
} from '../pasos.js'

describe('los ocho pasos y su sub-paso', () => {
  it('el recorrido son nueve pantallas en un orden fijo', () => {
    expect(ORDEN).toEqual(['p1', 'p2', 'p2a', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])
    expect(ORDEN).toHaveLength(9)
  })

  it('el indicador cuenta ocho, y el género no está entre ellos', () => {
    expect(TOTAL).toBe(8)
    expect(CONTADOS).not.toContain(PASOS.genero)
    expect(CONTADOS).toHaveLength(8)
  })

  it('el género es el único sub-paso', () => {
    expect(esSubPaso(PASOS.genero)).toBe(true)
    ORDEN.filter((paso) => paso !== PASOS.genero).forEach((paso) =>
      expect(esSubPaso(paso)).toBe(false),
    )
  })

  it('en el sub-paso no hay número que enseñar', () => {
    expect(indicadorDe(PASOS.genero)).toBeNull()
  })

  it('los números van del uno al ocho, sin saltarse ninguno', () => {
    expect(CONTADOS.map((paso) => indicadorDe(paso).n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    CONTADOS.forEach((paso) => expect(indicadorDe(paso).total).toBe(8))
  })

  it('el nombre y el motivo son el 2 y el 3, con el género entre medias', () => {
    // El sub-paso no corre la numeración: pasar por él no gasta un número.
    expect(indicadorDe(PASOS.nombre).n).toBe(2)
    expect(indicadorDe(PASOS.motivo).n).toBe(3)
    expect(siguiente(PASOS.nombre)).toBe(PASOS.genero)
    expect(siguiente(PASOS.genero)).toBe(PASOS.motivo)
  })
})

describe('moverse por el recorrido', () => {
  it('el primero no tiene atrás y el último no tiene siguiente', () => {
    expect(anterior(PASOS.bienvenida)).toBeNull()
    expect(siguiente(PASOS.cierre)).toBeNull()
  })

  it('atrás deshace exactamente lo que hizo continuar', () => {
    ORDEN.slice(1).forEach((paso) => expect(siguiente(anterior(paso))).toBe(paso))
  })

  it('un paso que no existe no rompe la navegación', () => {
    expect(es('p99')).toBe(false)
    expect(anterior('p99')).toBeNull()
    expect(siguiente('p99')).toBe('p1')
  })
})

describe('retomar a medias (RN-09)', () => {
  it('se vuelve al paso donde se estaba, no al principio', () => {
    expect(retomarEn(PASOS.horarios)).toBe(PASOS.horarios)
    expect(retomarEn(PASOS.genero)).toBe(PASOS.genero)
  })

  it('sin expediente, o con uno de otra versión, se empieza por el principio', () => {
    expect(retomarEn(null)).toBe(PASOS.bienvenida)
    expect(retomarEn(undefined)).toBe(PASOS.bienvenida)
    expect(retomarEn('p11')).toBe(PASOS.bienvenida)
  })
})

describe('la versión del recorrido', () => {
  it('se guarda para poder leer un onboarding viejo sabiendo qué se preguntó', () => {
    expect(VERSION).toBe(1)
  })
})
