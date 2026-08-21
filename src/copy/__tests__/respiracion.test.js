// src/copy/__tests__/respiracion.test.js
// La voz del namespace `respiracion` (SPEC_13 §7.1).
//
// `lint:copy` ya recorre este namespace, y esta prueba lo duplica a propósito:
// el script se corre a mano antes de comitear y `npm test` corre siempre. Es el
// mismo reparto que SPEC_05 hizo con el vocabulario de rendimiento en `progreso`
// y SPEC_07 con el copy del PIN.

import { describe, expect, it } from 'vitest'

import { copy, interpolate } from '../index.js'

const respiracion = copy.respiracion

/** Todas las cadenas del namespace, con su ruta. */
function hojas(nodo, ruta = 'respiracion') {
  if (typeof nodo === 'string') return [[ruta, nodo]]
  if (nodo === null || typeof nodo !== 'object') return []
  return Object.entries(nodo).flatMap(([clave, valor]) => hojas(valor, `${ruta}.${clave}`))
}

const CADENAS = hojas(respiracion)

describe('el namespace existe y está completo (§7.2)', () => {
  it('tiene los nueve bloques que pide el spec', () => {
    expect(Object.keys(respiracion).sort()).toEqual([
      'accesibilidad',
      'acomodo',
      'cierre',
      // `configuracion`, `home` y `sesion` los añadió SPEC_16 (§6).
      'configuracion',
      'controles',
      'duracion',
      // `estados` lo añadió SPEC_14 para RN-RE-VIS-26. Ver el comentario en copy/.
      'estados',
      'fases',
      'fasesAccesibles',
      // `favoritos` y `sonidos` los añadió SPEC_15 (§4.4).
      'favoritos',
      'home',
      'patrones',
      'seguridad',
      'sesion',
      'sonidos',
      'subtitulo',
      'titulo',
      'vacio',
    ])
  })

  it('las cuatro fases tienen nombre visible y etiqueta accesible', () => {
    const fases = ['inhalar', 'retenerLleno', 'exhalar', 'retenerVacio']
    fases.forEach((fase) => {
      expect(respiracion.fases[fase]).toBeTruthy()
      expect(respiracion.fasesAccesibles[fase]).toContain('{segundos}')
    })
  })

  it('los siete patrones tienen nombre y descripción', () => {
    const patrones = [
      'calma553',
      'caja',
      'cuatroSieteOcho',
      'exhalacionLarga',
      'coherencia',
      'entradaSuave',
      'personalizado',
    ]
    patrones.forEach((clave) => {
      expect(respiracion.patrones[clave].nombre, clave).toBeTruthy()
      expect(respiracion.patrones[clave].descripcion, clave).toBeTruthy()
    })
  })

  it('la etiqueta accesible es más explícita que la visual', () => {
    expect(respiracion.fasesAccesibles.retenerLleno.length).toBeGreaterThan(
      respiracion.fases.retenerLleno.length,
    )
  })
})

describe('§7.3 — la interpolación es la que ya existía', () => {
  it('resuelve {n} y {segundos}', () => {
    expect(interpolate(respiracion.duracion.ciclos, { n: 5 })).toBe('5 respiraciones')
    expect(interpolate(respiracion.cierre.resumenCiclos, { n: 12 })).toBe('Respiraste 12 veces.')
    expect(interpolate(respiracion.fasesAccesibles.exhalar, { segundos: 8 })).toBe(
      'Exhala durante 8 segundos',
    )
  })

  it('no hizo falta inventar una segunda: `interpolate` estaba desde Fase 0', () => {
    expect(typeof interpolate).toBe('function')
  })
})

describe('§7.1 — Strivo es un refugio, no una consulta', () => {
  const CLINICO = [
    /\bansiedad\b/i,
    /\bansios[ao]s?\b/i,
    /\bestr[ée]s\b/i,
    /\bp[áa]nico\b/i,
    /\bterap/i,
    /\btrastorno\b/i,
    /\bcura/i,
    /\btratamiento\b/i,
    /\bs[íi]ntoma/i,
  ]

  const RENDIMIENTO = [/\brendimiento\b/i, /\boptimiz/i, /\bproductividad\b/i, /\bmaximiz/i]

  /** Devuelve las rutas que incumplen, para que el fallo diga cuál es. */
  const infractoras = (patrones) =>
    CADENAS.filter(([, cadena]) => patrones.some((patron) => patron.test(cadena))).map(
      ([ruta]) => ruta,
    )

  it('ninguna cadena usa registro clínico', () => {
    expect(infractoras(CLINICO)).toEqual([])
  })

  it('ninguna cadena usa vocabulario de rendimiento', () => {
    expect(infractoras(RENDIMIENTO)).toEqual([])
  })

  it('ninguna cadena dice "elle": el neutro se consigue redactando', () => {
    CADENAS.forEach(([, cadena]) => expect(cadena).not.toMatch(/\belle\b/i))
  })

  it('el aviso de seguridad no es lenguaje médico ni pide aceptar nada', () => {
    const aviso = respiracion.seguridad.aviso
    expect(aviso).toMatch(/respira normal/)
    expect(aviso).not.toMatch(/acepto|términos|consulta a tu médico/i)
  })
})

describe('§3.6 — el léxico de siempre tampoco aparece', () => {
  const PROHIBIDO = [
    /\bfallaste\b/i,
    /\bincumpliste\b/i,
    /\babandonaste\b/i,
    /\bracha\b/i,
    /\bstreak\b/i,
    /\bdeber[íi]as?\b/i,
    /\btendr[íi]as?\b/i,
  ]

  it('ninguna cadena lo usa', () => {
    const infractoras = CADENAS.filter(([, cadena]) =>
      PROHIBIDO.some((patron) => patron.test(cadena)),
    ).map(([ruta]) => ruta)
    expect(infractoras).toEqual([])
  })

  it('no hay una sola exclamación', () => {
    CADENAS.forEach(([, cadena]) => {
      expect(cadena).not.toMatch(/[¡!]/)
    })
  })

  it('no hay emojis: los del catálogo son vocabulario de quien escribe', () => {
    CADENAS.forEach(([, cadena]) => {
      expect(cadena).not.toMatch(/\p{Extended_Pictographic}/u)
    })
  })
})

describe('la voz es de Strivo madre, no de un espacio', () => {
  it('no se nombra a Lumia ni a Formia', () => {
    CADENAS.forEach(([, cadena]) => {
      expect(cadena).not.toMatch(/\b(lumia|formia)\b/i)
    })
  })

  it('RN-RE-MOT-20: el tiempo se ofrece como aproximado, nunca como promesa', () => {
    expect(respiracion.duracion.minutos).toMatch(/^Unos /)
    expect(respiracion.duracion.aproximado).toMatch(/puede alargarse/)
  })

  it('el estado vacío invita, no acusa', () => {
    expect(respiracion.vacio.sinFavoritos).toMatch(/Cuando encuentres/)
    expect(respiracion.vacio.sinFavoritos).not.toMatch(/no tienes|vacío|sin nada/i)
  })

  it('los controles se dicen sin imperativos duros', () => {
    expect(Object.values(respiracion.controles)).toEqual([
      'Empezar',
      'Pausar',
      'Seguir',
      'Terminar',
      'Salir',
    ])
  })
})
