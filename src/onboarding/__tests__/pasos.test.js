// src/onboarding/__tests__/pasos.test.js
// El recorrido: siete pasos, un sub-paso y ningún hueco.
//
// Lo que estas pruebas custodian no es el orden por el orden: es que el género
// siga sin contar en el indicador. Un día alguien va a querer "arreglar" que
// P2A no tenga número, y arreglarlo significa que el total pase a ocho para
// unas personas y a siete para otras.
//
// Y custodian que los identificadores no se renumeren al retirar un paso: `p5`
// es el cuarto número que se enseña y sigue llamándose `p5`, porque así se
// escribió en los expedientes que ya existen.

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

describe('los siete pasos y su sub-paso', () => {
  it('el recorrido son ocho pantallas en un orden fijo', () => {
    expect(ORDEN).toEqual(['p1', 'p2', 'p2a', 'p3', 'p5', 'p6', 'p7', 'p8'])
    expect(ORDEN).toHaveLength(8)
  })

  it('la identidad central salió del recorrido y no queda de ella ni el hueco', () => {
    expect(ORDEN).not.toContain('p4')
    expect(CONTADOS).not.toContain('p4')
    expect(PASOS.identidad).toBeUndefined()
    expect(Object.values(PASOS)).not.toContain('p4')
    expect(es('p4')).toBe(false)
    expect(indicadorDe('p4')).toBeNull()
  })

  it('el indicador cuenta siete, y el género no está entre ellos', () => {
    expect(TOTAL).toBe(7)
    expect(CONTADOS).not.toContain(PASOS.genero)
    expect(CONTADOS).toHaveLength(7)
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

  it('los números van del uno al siete, sin saltarse ninguno', () => {
    expect(CONTADOS.map((paso) => indicadorDe(paso).n)).toEqual([1, 2, 3, 4, 5, 6, 7])
    CONTADOS.forEach((paso) => expect(indicadorDe(paso).total).toBe(7))
  })

  it('el número lo da la posición, no el nombre: los horarios son el 4 y se llaman p5', () => {
    expect(PASOS.horarios).toBe('p5')
    expect(indicadorDe(PASOS.horarios).n).toBe(4)
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

  it('quien se quedó en la identidad central sigue por donde iba, no desde cero', () => {
    // Es lo único que hubo que migrar de aquel paso: el resto de lo que dejó
    // escrito —nombre, género, motivo— sigue en su sitio y se relee igual.
    expect(retomarEn('p4')).toBe(PASOS.horarios)
  })

  it('sin expediente, o con uno de otra versión, se empieza por el principio', () => {
    expect(retomarEn(null)).toBe(PASOS.bienvenida)
    expect(retomarEn(undefined)).toBe(PASOS.bienvenida)
    expect(retomarEn('p11')).toBe(PASOS.bienvenida)
  })
})

describe('la versión del recorrido', () => {
  it('se guarda para poder leer un onboarding viejo sabiendo qué se preguntó', () => {
    // Subió a 3 el 8 de septiembre de 2026 sin que el recorrido cambiara: es lo
    // que distingue a quien lo terminó con la presentación de las secciones
    // detrás de quien lo terminó antes de que existiera, y de eso depende que a
    // nadie que ya entró le aparezca de golpe (`presentacion/entrada.js`).
    expect(VERSION).toBe(3)
  })
})
