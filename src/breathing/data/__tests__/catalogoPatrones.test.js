// src/breathing/data/__tests__/catalogoPatrones.test.js
// El catálogo de §5.2 y la regla de la caja (criterio 7 · RN-RE-MOT-08).

import { describe, expect, it } from 'vitest'

import { PATRON_BASE, duracionCiclo, validarPatron } from '@lib/respiracion/motorRitmo'
import { copy } from '@copy/index.js'

import {
  CATALOGO_PATRONES,
  EDICION,
  ID_CAJA,
  ID_PERSONALIZADO,
  ID_POR_DEFECTO,
  IDS_PATRON,
  LADO_CAJA_MAX,
  LADO_CAJA_MIN,
  obtenerPreset,
  patronDe,
  patronDeLado,
  presetPrimeraVez,
  resolverPatronBaseId,
} from '../catalogoPatrones.js'

describe('el catálogo (§5.2)', () => {
  it('son los siete de la tabla, en su orden', () => {
    expect(IDS_PATRON).toEqual([
      'calma-553',
      'caja',
      'cuatro-siete-ocho',
      'exhalacion-larga',
      'coherencia',
      'entrada-suave',
      'personalizado',
    ])
    expect(CATALOGO_PATRONES.map((p) => p.orden)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('los ciclos declarados en la tabla son los que salen', () => {
    expect(duracionCiclo(patronDe('calma-553'))).toBe(13_000)
    expect(duracionCiclo(patronDe('caja'))).toBe(16_000)
    expect(duracionCiclo(patronDe('cuatro-siete-ocho'))).toBe(19_000)
    expect(duracionCiclo(patronDe('exhalacion-larga'))).toBe(12_000)
    expect(duracionCiclo(patronDe('coherencia'))).toBe(10_000)
    expect(duracionCiclo(patronDe('entrada-suave'))).toBe(10_000)
  })

  it('todos los presets son válidos sin que haya que corregirlos', () => {
    CATALOGO_PATRONES.forEach((entrada) => {
      expect(validarPatron(entrada.patron).valido).toBe(true)
    })
  })

  it('cada entrada apunta a su copy, y ese copy existe', () => {
    CATALOGO_PATRONES.forEach((entrada) => {
      const texto = copy.respiracion.patrones[entrada.claveCopy]
      expect(texto, entrada.id).toBeDefined()
      expect(typeof texto.nombre).toBe('string')
      expect(typeof texto.descripcion).toBe('string')
    })
  })

  it('ninguna entrada guarda un nombre: los textos viven en copy/', () => {
    CATALOGO_PATRONES.forEach((entrada) => {
      expect(entrada).not.toHaveProperty('nombre')
      expect(entrada).not.toHaveProperty('descripcion')
    })
  })

  it('`calma-553` es el de por defecto, y es el ritmo de la casa', () => {
    expect(ID_POR_DEFECTO).toBe('calma-553')
    // El puente de identidad de §5.2: el motor guarda el mismo patrón como base
    // y no puede importarlo de aquí, así que se comprueba que no se separen.
    expect(patronDe(ID_POR_DEFECTO)).toEqual({ ...PATRON_BASE })
  })

  it('`entrada-suave` es el de la primera vez, y no tiene retenciones', () => {
    const primera = presetPrimeraVez()
    expect(primera.id).toBe('entrada-suave')
    expect(primera.tieneRetenciones).toBe(false)
  })

  it('`tieneRetenciones` sale de las fases, no de una etiqueta a mano', () => {
    expect(obtenerPreset('cuatro-siete-ocho').tieneRetenciones).toBe(true)
    expect(obtenerPreset('caja').tieneRetenciones).toBe(true)
    expect(obtenerPreset('calma-553').tieneRetenciones).toBe(true)
    expect(obtenerPreset('coherencia').tieneRetenciones).toBe(false)
    expect(obtenerPreset('exhalacion-larga').tieneRetenciones).toBe(false)
  })

  it('solo la caja se edita por lado único', () => {
    const porLado = CATALOGO_PATRONES.filter((p) => p.editable === EDICION.LADO_UNICO)
    expect(porLado.map((p) => p.id)).toEqual([ID_CAJA])
    expect(obtenerPreset(ID_PERSONALIZADO).editable).toBe(EDICION.LIBRE)
  })

  it('un id que no existe devuelve null, y su patrón el de por defecto', () => {
    expect(obtenerPreset('respiracion-de-dragon')).toBeNull()
    expect(patronDe('respiracion-de-dragon')).toEqual(patronDe(ID_POR_DEFECTO))
  })

  it('el catálogo está congelado: nadie lo edita en caliente', () => {
    expect(Object.isFrozen(CATALOGO_PATRONES)).toBe(true)
    expect(Object.isFrozen(obtenerPreset(ID_CAJA).patron)).toBe(true)
  })

  it('patronDe devuelve una copia, no el original', () => {
    const uno = patronDe(ID_POR_DEFECTO)
    uno.inhalar = 999
    expect(patronDe(ID_POR_DEFECTO).inhalar).toBe(50)
  })
})

describe('la caja y su lado único', () => {
  it('el lado mueve las cuatro fases a la vez', () => {
    expect(patronDeLado(60)).toEqual({
      inhalar: 60,
      retenerLleno: 60,
      exhalar: 60,
      retenerVacio: 60,
    })
  })

  it('el lado se queda entre 3,0 y 8,0 s', () => {
    expect(patronDeLado(5).inhalar).toBe(LADO_CAJA_MIN)
    expect(patronDeLado(500).inhalar).toBe(LADO_CAJA_MAX)
    expect(patronDeLado('nada').inhalar).toBe(LADO_CAJA_MIN)
  })

  it('un lado dentro de rango sigue dando un ciclo válido', () => {
    for (let lado = LADO_CAJA_MIN; lado <= LADO_CAJA_MAX; lado += 5) {
      expect(validarPatron(patronDeLado(lado)).valido).toBe(true)
    }
  })
})

describe('criterio 7 y RN-RE-MOT-08 — cuándo un patrón deja de llamarse como el preset', () => {
  it('una caja editada fase por fase pasa a personalizado', () => {
    const caja = patronDe(ID_CAJA)
    const editada = { ...caja, exhalar: caja.exhalar + 5 }
    expect(resolverPatronBaseId(ID_CAJA, editada)).toBe(ID_PERSONALIZADO)
  })

  it('mover el lado único NO la saca de ser una caja', () => {
    // Es toda la razón de que la caja tenga regla propia: 5-5-5-5 sigue siendo
    // una caja aunque no coincida con el preset guardado, que es 4-4-4-4.
    expect(resolverPatronBaseId(ID_CAJA, patronDeLado(50))).toBe(ID_CAJA)
    expect(resolverPatronBaseId(ID_CAJA, patronDeLado(80))).toBe(ID_CAJA)
  })

  it('una caja fuera del rango del lado ya no lo es', () => {
    const gigante = { inhalar: 100, retenerLleno: 100, exhalar: 100, retenerVacio: 100 }
    expect(resolverPatronBaseId(ID_CAJA, gigante)).toBe(ID_PERSONALIZADO)
  })

  it('cualquier otro preset editado también pasa a personalizado', () => {
    const suave = patronDe('entrada-suave')
    expect(resolverPatronBaseId('entrada-suave', suave)).toBe('entrada-suave')
    expect(resolverPatronBaseId('entrada-suave', { ...suave, inhalar: 45 })).toBe(ID_PERSONALIZADO)
  })

  it('un preset sin tocar conserva su nombre', () => {
    CATALOGO_PATRONES.filter((p) => p.id !== ID_PERSONALIZADO && p.id !== ID_CAJA).forEach(
      (entrada) => {
        expect(resolverPatronBaseId(entrada.id, entrada.patron)).toBe(entrada.id)
      },
    )
  })

  it('personalizado siempre es personalizado, y un id inventado también', () => {
    expect(resolverPatronBaseId(ID_PERSONALIZADO, PATRON_BASE)).toBe(ID_PERSONALIZADO)
    expect(resolverPatronBaseId('lo-que-sea', PATRON_BASE)).toBe(ID_PERSONALIZADO)
    expect(resolverPatronBaseId(null, PATRON_BASE)).toBe(ID_PERSONALIZADO)
  })
})
