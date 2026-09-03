// src/onboarding/__tests__/catalogos.test.js
// Los dos catálogos del recorrido: género y motivo.
//
// Las dos preguntas guardan **identificadores y no etiquetas** (RN-DB-06), y
// las dos se pueden dejar en blanco. Lo que aquí se vigila de verdad es lo que
// no está: el motivo no ofrece construir hábitos, y la identidad central —que
// era el tercer catálogo— salió entera del recorrido el 2 de septiembre de
// 2026, con su pantalla, su copy y su módulo.

import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { GENEROS } from '@copy/gender'
import { OPCIONES as GENERO_OPCIONES, alternar as alternarGenero, generoDe } from '../genero.js'
import {
  ID_OTRO,
  MAX_OTRO,
  OPCIONES as MOTIVOS,
  alternar as alternarMotivo,
  paraGuardar as motivoParaGuardar,
  recortarOtro,
} from '../motivos.js'

const textos = copy.diario.onboarding

describe('P2A — cuatro opciones, tres valores guardados', () => {
  it('se ofrecen cuatro y el copy las nombra todas', () => {
    expect(GENERO_OPCIONES).toHaveLength(4)
    GENERO_OPCIONES.forEach((id) => expect(typeof textos.p2a.options[id]).toBe('string'))
    expect(Object.keys(textos.p2a.options)).toEqual([...GENERO_OPCIONES])
  })

  it('lo que se guarda es siempre uno de los tres del modelo', () => {
    GENERO_OPCIONES.forEach((opcion) => expect(GENEROS).toContain(generoDe(opcion)))
  })

  it('"prefiero no contestar" y "otro" llevan al neutro, igual que no contestar', () => {
    expect(generoDe('masculino')).toBe('m')
    expect(generoDe('femenino')).toBe('f')
    expect(generoDe('prefiero_no_contestar')).toBe('n')
    expect(generoDe('otro')).toBe('n')
    expect(generoDe(null)).toBe('n')
    expect(generoDe('lo_que_sea')).toBe('n')
  })

  it('tocar la elegida la suelta: así se deja la pregunta en blanco', () => {
    expect(alternarGenero(null, 'femenino')).toBe('femenino')
    expect(alternarGenero('femenino', 'femenino')).toBeNull()
    expect(alternarGenero('femenino', 'masculino')).toBe('masculino')
    expect(alternarGenero('femenino', 'inventada')).toBe('femenino')
  })
})

describe('P3 — cinco motivos y una palabra propia', () => {
  it('son cinco más "otro", y ninguno habla de hábitos', () => {
    expect(MOTIVOS).toEqual(['paz', 'avance', 'escucha', 'sueno', 'espacio', 'otro'])
    expect(MOTIVOS.filter((id) => id !== ID_OTRO)).toHaveLength(5)
    expect(textos.p3.options.habitos).toBeUndefined()
    Object.values(textos.p3.options).forEach((etiqueta) =>
      expect(etiqueta).not.toMatch(/h[áa]bito/i),
    )
  })

  it('el copy nombra exactamente las opciones que existen', () => {
    expect(Object.keys(textos.p3.options)).toEqual([...MOTIVOS])
  })

  it('se pueden elegir varias, y no hay tope', () => {
    let elegidos = []
    MOTIVOS.forEach((id) => {
      elegidos = alternarMotivo(elegidos, id)
    })
    expect(elegidos).toEqual([...MOTIVOS])
  })

  it('lo elegido se devuelve en el orden del catálogo, no en el de los toques', () => {
    // Guardar el orden de los toques sería guardar una prioridad que nadie dio.
    expect(alternarMotivo(alternarMotivo([], 'espacio'), 'paz')).toEqual(['paz', 'espacio'])
  })

  it('tocar lo elegido lo suelta', () => {
    expect(alternarMotivo(['paz', 'sueno'], 'paz')).toEqual(['sueno'])
    expect(alternarMotivo(['paz'], 'inventado')).toEqual(['paz'])
  })

  it('"otro" sin escribir nada no se guarda', () => {
    expect(motivoParaGuardar([ID_OTRO], '   ')).toEqual({ motivos: [], motivoOtro: null })
    expect(motivoParaGuardar(['paz', ID_OTRO], '')).toEqual({
      motivos: ['paz'],
      motivoOtro: null,
    })
  })

  it('"otro" con texto guarda las dos cosas', () => {
    expect(motivoParaGuardar(['paz', ID_OTRO], ' dormir sin pantallas ')).toEqual({
      motivos: ['paz', 'otro'],
      motivoOtro: 'dormir sin pantallas',
    })
  })

  it('la palabra propia se recorta, no se rechaza (RN-DB-07)', () => {
    expect(MAX_OTRO).toBe(60)
    expect(recortarOtro('x'.repeat(200))).toHaveLength(60)
    expect(recortarOtro(null)).toBe('')
  })

  it('sin haber tocado "otro", el texto suelto no se cuela', () => {
    expect(motivoParaGuardar(['paz'], 'algo que escribí y luego solté')).toEqual({
      motivos: ['paz'],
      motivoOtro: null,
    })
  })
})

describe('la identidad central ya no se pregunta', () => {
  it('no queda copy suyo en el recorrido', () => {
    expect(textos.p4).toBeUndefined()
    // Y el cierre, que la leía, dice otra cosa: un saludo y nada más.
    expect(textos.p8.closingTemplate).toBeUndefined()
  })
})
