// src/lib/db/__tests__/conflictos.test.js
// Las reglas de fusión de la restauración (SPEC_17A §2 y §4.2; criterios 4, 5 y 6).
//
// Es lógica pura: aquí no hay base ni red, solo dos registros y una colección.
// Lo que se vigila es que lo remoto nunca sobrescriba algo local que no se
// pueda demostrar más viejo, y que "más viejo" se decida por instante y no
// por cómo esté escrita la fecha.

import { describe, expect, it } from 'vitest'

import { CAMPO_DE_MARCA, campoDeMarca, ganaRemoto, marcaDe } from '../conflictos.js'

const T0 = '2026-09-17T12:00:00.000Z'
const T1 = '2026-09-17T13:00:00.000Z'

describe('campoDeMarca: qué mira cada colección', () => {
  it('shared/ y diario/ miran updatedAt, sin declararlo uno por uno', () => {
    for (const c of ['shared', 'diario/journal', 'diario/morningEntry', 'diario/nightRitual']) {
      expect(campoDeMarca(c)).toBe('updatedAt')
    }
    expect(campoDeMarca('diario/dayState')).toBe('updatedAt')
  })

  it('respiración mira sus propios campos, escritos aquí en literal (D10)', () => {
    expect(campoDeMarca('breathing')).toBe('actualizadoEn')
    expect(campoDeMarca('breathing/favoritos')).toBe('actualizadoEn')
    expect(campoDeMarca('breathing/recientes')).toBe('usadoEn')
  })

  it('las sesiones no tienen campo: nunca gana lo remoto', () => {
    expect(campoDeMarca('breathing/sesiones')).toBeNull()
    expect(CAMPO_DE_MARCA['breathing/sesiones']).toBeNull()
  })

  it('el mapa no se puede mutar desde fuera', () => {
    expect(Object.isFrozen(CAMPO_DE_MARCA)).toBe(true)
  })

  it('una colección desconocida cae al campo por defecto, no a un error', () => {
    expect(campoDeMarca('algo/que/no/existe')).toBe('updatedAt')
  })

  it('el mapa no se importa de breathing/: lib/db no conoce las ramas de arriba', async () => {
    const { readFileSync } = await import('fs')
    const fuente = readFileSync('src/lib/db/conflictos.js', 'utf8')
    expect(fuente).not.toMatch(/from ['"][^'"]*breathing/)
    expect(fuente).not.toMatch(/import\s*\(/)
  })
})

describe('marcaDe: el instante, o nada', () => {
  it('lee una marca ISO en UTC', () => {
    expect(marcaDe('shared', { updatedAt: T0 })).toBe(Date.parse(T0))
  })

  it('lee una marca de marcaLocal(), con su desfase', () => {
    expect(marcaDe('diario/morningEntry', { updatedAt: '2026-09-17T07:00:00-05:00' })).toBe(
      Date.parse('2026-09-17T12:00:00.000Z'),
    )
  })

  it('sin campo devuelve null y no inventa nada (RN-DB4-08)', () => {
    expect(marcaDe('shared', { name: 'Ale' })).toBeNull()
    expect(marcaDe('shared', {})).toBeNull()
    expect(marcaDe('shared', null)).toBeNull()
    expect(marcaDe('shared', undefined)).toBeNull()
  })

  it('una marca que no es cadena o no se puede leer es "sin marca"', () => {
    expect(marcaDe('shared', { updatedAt: 1758110400000 })).toBeNull()
    expect(marcaDe('shared', { updatedAt: 'ayer por la tarde' })).toBeNull()
    expect(marcaDe('shared', { updatedAt: null })).toBeNull()
  })

  it('en respiración lee el campo que le toca a cada colección', () => {
    expect(marcaDe('breathing', { actualizadoEn: T0, updatedAt: T1 })).toBe(Date.parse(T0))
    expect(marcaDe('breathing/recientes', { usadoEn: T1 })).toBe(Date.parse(T1))
    expect(marcaDe('breathing/favoritos', { usadoEn: T1 })).toBeNull()
  })

  it('en una sesión siempre es null, aunque traiga fechas', () => {
    expect(marcaDe('breathing/sesiones', { iniciadaEn: T0, updatedAt: T1 })).toBeNull()
  })
})

describe('ganaRemoto: las reglas 2 y 3 del §2', () => {
  it('regla 2: local sin marca y remoto con marca, gana el remoto', () => {
    // Es el caso del perfil sembrado por initShared frente al perfil real que
    // espera en la nube, y el de cualquier registro anterior a esta SPEC.
    expect(ganaRemoto('shared', { name: null }, { name: 'Ale', updatedAt: T0 })).toBe(true)
  })

  it('regla 3: ambas sin marca, gana lo local', () => {
    expect(ganaRemoto('shared', { name: 'aquí' }, { name: 'allá' })).toBe(false)
  })

  it('regla 3: local con marca y remoto sin marca, gana lo local', () => {
    expect(ganaRemoto('shared', { updatedAt: T0 }, { name: 'allá' })).toBe(false)
  })

  it('regla 3: empate exacto, gana lo local', () => {
    expect(ganaRemoto('shared', { updatedAt: T0 }, { updatedAt: T0 })).toBe(false)
  })

  it('regla 3: marca remota menor, gana lo local', () => {
    expect(ganaRemoto('shared', { updatedAt: T1 }, { updatedAt: T0 })).toBe(false)
  })

  it('marca remota estrictamente mayor, gana el remoto', () => {
    expect(ganaRemoto('shared', { updatedAt: T0 }, { updatedAt: T1 })).toBe(true)
  })

  it('un milisegundo basta, en las dos direcciones', () => {
    const a = '2026-09-17T12:00:00.000Z'
    const b = '2026-09-17T12:00:00.001Z'
    expect(ganaRemoto('diario/journal', { updatedAt: a }, { updatedAt: b })).toBe(true)
    expect(ganaRemoto('diario/journal', { updatedAt: b }, { updatedAt: a })).toBe(false)
  })

  it('regla 2 solo con el campo ausente: una marca local ilegible protege lo local', () => {
    // Ilegible es prueba de que alguien escribió ahí; lo único que no se sabe
    // es cuándo. "No puedo leerlo" no se convierte en "no existe" (RN-DB4-08).
    expect(ganaRemoto('shared', { updatedAt: 'no es fecha' }, { updatedAt: T0 })).toBe(false)
    expect(ganaRemoto('shared', { updatedAt: 1758110400000 }, { updatedAt: T0 })).toBe(false)
  })

  it('un campo con null es ausente, no ilegible: es la siembra, y el remoto con marca gana', () => {
    // `null` es la convención de "todavía no" en toda la casa, y es lo que
    // siembra `preferenciasDeFabrica()` en `actualizadoEn`. Protegerlo dejaría
    // unas preferencias de fábrica por encima de las que sí se ajustaron.
    expect(ganaRemoto('shared', { updatedAt: null }, { updatedAt: T0 })).toBe(true)
    expect(ganaRemoto('breathing', { actualizadoEn: null }, { actualizadoEn: T0 })).toBe(true)
    expect(ganaRemoto('shared', { updatedAt: undefined }, { updatedAt: T0 })).toBe(true)
  })

  it('ausente de verdad —sin la clave— es el único caso en que el remoto con marca gana', () => {
    expect(ganaRemoto('shared', { name: 'sembrado' }, { updatedAt: T0 })).toBe(true)
    expect(ganaRemoto('shared', {}, { updatedAt: T0 })).toBe(true)
  })

  it('una marca remota ilegible nunca gana, ni sobre local sin marca', () => {
    expect(ganaRemoto('shared', {}, { updatedAt: 'no es fecha' })).toBe(false)
  })
})

describe('criterio 4: por instante, nunca por cadena', () => {
  it('formatos mezclados: la cadena "menor" puede ser el instante mayor', () => {
    // Como texto, "2026-09-17T07:00:00-05:00" < "2026-09-17T09:00:00Z".
    // Como instante, son las 12:00Z frente a las 09:00Z: tres horas después.
    const local = { updatedAt: '2026-09-17T09:00:00Z' }
    const remoto = { updatedAt: '2026-09-17T07:00:00-05:00' }
    expect(remoto.updatedAt < local.updatedAt).toBe(true)
    expect(ganaRemoto('diario/nightRitual', local, remoto)).toBe(true)
  })

  it('husos distintos: el mismo instante escrito en dos zonas es un empate', () => {
    const enMadrid = { updatedAt: '2026-09-17T14:00:00+02:00' }
    const enBogota = { updatedAt: '2026-09-17T07:00:00-05:00' }
    expect(ganaRemoto('diario/morningEntry', enMadrid, enBogota)).toBe(false)
    expect(ganaRemoto('diario/morningEntry', enBogota, enMadrid)).toBe(false)
  })

  it('husos distintos: gana el que ocurrió después, no el que tiene la hora mayor', () => {
    // Las 20:00 en Bogotá son la 01:00Z del día siguiente; las 23:00 en
    // Madrid son las 21:00Z. La "hora mayor" escrita es la de Madrid; el
    // instante mayor es el de Bogotá.
    const madrid = { updatedAt: '2026-09-17T23:00:00+02:00' }
    const bogota = { updatedAt: '2026-09-17T20:00:00-05:00' }
    expect(ganaRemoto('diario/journal', madrid, bogota)).toBe(true)
    expect(ganaRemoto('diario/journal', bogota, madrid)).toBe(false)
  })

  it('con y sin milisegundos, con Z y con desfase, se comparan igual', () => {
    expect(ganaRemoto('shared', { updatedAt: '2026-09-17T12:00:00Z' }, { updatedAt: T0 })).toBe(
      false,
    )
    expect(
      ganaRemoto('shared', { updatedAt: T0 }, { updatedAt: '2026-09-17T12:00:00.500+00:00' }),
    ).toBe(true)
  })
})

describe('criterio 5: respiración fusiona por sus campos', () => {
  it('un favorito fusiona por actualizadoEn', () => {
    expect(ganaRemoto('breathing/favoritos', { actualizadoEn: T0 }, { actualizadoEn: T1 })).toBe(
      true,
    )
    expect(ganaRemoto('breathing/favoritos', { actualizadoEn: T1 }, { actualizadoEn: T0 })).toBe(
      false,
    )
  })

  it('un favorito no mira updatedAt aunque venga', () => {
    expect(
      ganaRemoto(
        'breathing/favoritos',
        { actualizadoEn: T1, updatedAt: T0 },
        { actualizadoEn: T0, updatedAt: T1 },
      ),
    ).toBe(false)
  })

  it('las preferencias fusionan por actualizadoEn', () => {
    expect(ganaRemoto('breathing', { actualizadoEn: null }, { actualizadoEn: T0 })).toBe(true)
    expect(ganaRemoto('breathing', { actualizadoEn: T1 }, { actualizadoEn: T0 })).toBe(false)
  })

  it('una reciente fusiona por usadoEn', () => {
    expect(ganaRemoto('breathing/recientes', { usadoEn: T0 }, { usadoEn: T1 })).toBe(true)
    expect(ganaRemoto('breathing/recientes', { usadoEn: T1 }, { usadoEn: T0 })).toBe(false)
  })

  it('una sesión nunca la gana lo remoto, ni con marcas a favor', () => {
    expect(
      ganaRemoto('breathing/sesiones', { iniciadaEn: T0 }, { iniciadaEn: T1, updatedAt: T1 }),
    ).toBe(false)
    expect(ganaRemoto('breathing/sesiones', {}, { updatedAt: T1 })).toBe(false)
  })
})
