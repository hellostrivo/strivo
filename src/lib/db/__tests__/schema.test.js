// src/lib/db/__tests__/schema.test.js
// El modelo canónico de §C5 y sus validadores (SPEC_02).
//
// **Revisión del paso 8 del plan de separación técnica (25 ago 2026).** Este
// archivo custodiaba cinco bloques y pierde cuatro, todos por el mismo motivo:
// **probaban un modelo de datos que ya no existe**, retirado de `schema.js` en
// el paso 3. Se eliminan y no se reescriben porque no queda nada que verificar.
//
//   · catálogo de áreas (§C5.4) — `AREA_IDS`, `emptyAreasMap`,
//     `validateAreasMap` y `MAX_SELECTED_AREAS` salieron del esquema.
//   · identityRef (§C5.5) — con ellos se van RN-DB4-05, 06, 07 y 09: las cuatro
//     hablan de a qué identidad pertenece un hábito, y no hay hábitos.
//   · validateHabit — se lleva la única comprobación de RN-DB4-08 que quedaba
//     aquí. **La regla sigue viva**: el rechazo de campos fuera de lista lo
//     ejercitan `validateJournalEntry` y `validateDayState`, abajo.
//   · validateHabitLog (RN-06) — la constancia era de aquel modelo, y su módulo
//     se retiró con los tres ayudantes huérfanos de `lib/`.
//
// Sobreviven intactos los registros del diario y la fecha del día (RN-DB-01),
// que no dependían de nada retirado.

import { describe, expect, it } from 'vitest'

import {
  COLLECTIONS,
  ERROR_CODES,
  FIELDS,
  StrivoDataError,
  paths,
  validateDayState,
  validateJournalEntry,
} from '../schema.js'
import { strivoDateKey, toDateKey } from '../dates.js'

function codeOf(fn) {
  try {
    fn()
  } catch (error) {
    return error instanceof StrivoDataError ? error.code : `no-es-StrivoDataError:${error.name}`
  }
  return null
}

describe('registros de Lumia', () => {
  it('journal solo admite los campos de SPEC_02 §5', () => {
    expect(
      validateJournalEntry({ date: '2026-08-10', text: 'Hoy', emotions: ['calma'] }),
    ).toBeTruthy()
    expect(codeOf(() => validateJournalEntry({ titulo: 'x' }))).toBe(ERROR_CODES.UNKNOWN_FIELD)
  })

  // La victoria salió del modelo el 23 ago: no hay validador, no hay lista de
  // campos y no hay etiqueta de colección. `nightRitual` pierde con ella sus
  // dos campos de logros.
  it('la victoria ya no existe en el modelo canónico', () => {
    expect(FIELDS.victory).toBeUndefined()
    expect(COLLECTIONS.victories).toBeUndefined()
    expect(FIELDS.nightRitual).not.toContain('newWins')
    expect(FIELDS.nightRitual).not.toContain('inheritedWins')
  })

  it('dayState solo guarda mood, con la paleta de ánimo de §6.3.5', () => {
    expect(validateDayState({ mood: 'en_paz' })).toBeTruthy()
    expect(codeOf(() => validateDayState({ mood: 'feliz' }))).toBe(ERROR_CODES.MOOD_INVALID)
    expect(codeOf(() => validateDayState({ state: 'cerrado' }))).toBe(ERROR_CODES.UNKNOWN_FIELD)
  })
})

describe('rutas (§C5.2)', () => {
  it('toda ruta tiene un número par de segmentos, como pide Firestore', () => {
    // El caso sobrevive entero: la regla de Firestore no cambia porque el árbol
    // tenga dos raíces en vez de tres. Lo que se va son las tres rutas del
    // alcance retirado, que ya no existen en `paths`.
    const rutas = [
      paths.sharedDoc('u1', 'profile'),
      paths.diarioDoc('u1', 'pinConfig'),
      paths.diarioItem('u1', 'journal', 'e1'),
      paths.diarioItem('u1', 'morningEntry', '2026-08-10'),
    ]
    // Y que no queden constructores de ruta sin árbol al que apuntar.
    expect(Object.keys(paths).sort()).toEqual(['diarioDoc', 'diarioItem', 'sharedDoc'])
    rutas.forEach((ruta) => {
      expect(ruta.split('/').length % 2).toBe(0)
      expect(ruta.startsWith('users/u1/')).toBe(true)
    })
  })

  // **Caso nuevo, con el renombrado de la rama** (tanda B del paso 9). La rama
  // pasó de `lumia/` a `diario/` y la mitad de las rutas son cadenas que se
  // arman a mano: aquí, en `COLLECTIONS` y en las etiquetas de los validadores.
  // Una rama a medias —una ruta con el nombre nuevo y una etiqueta con el
  // viejo— no rompería nada al escribir y dejaría dos árboles paralelos.
  it('la rama del diario se llama igual en la ruta y en la colección', () => {
    expect(paths.diarioDoc('u1', 'pinConfig')).toBe('users/u1/diario/pinConfig')
    expect(paths.diarioItem('u1', 'journal', 'e1')).toBe('users/u1/diario/journal/items/e1')

    Object.entries(COLLECTIONS).forEach(([clave, valor]) => {
      if (clave === 'shared') return expect(valor).toBe('shared')
      expect(valor.startsWith('diario')).toBe(true)
    })

    // Y que no quede ni un rastro del nombre viejo en ninguna de las dos.
    const todo = [...Object.values(COLLECTIONS), paths.diarioDoc('u1', 'x')].join(' ')
    expect(todo).not.toMatch(/lumia/i)
  })
})

describe('fecha del día (RN-DB-01)', () => {
  it('con diaTerminaA 03:00, la 01:30 pertenece al día anterior', () => {
    const madrugada = new Date(2026, 7, 11, 1, 30)
    expect(strivoDateKey('03:00', madrugada)).toBe('2026-08-10')
  })

  it('con diaTerminaA 03:00, las 09:00 pertenecen al día en curso', () => {
    const manana = new Date(2026, 7, 11, 9, 0)
    expect(strivoDateKey('03:00', manana)).toBe('2026-08-11')
  })

  it('usa la hora local y no desplaza el día al pasar por UTC', () => {
    const casiMedianoche = new Date(2026, 7, 10, 23, 45)
    expect(toDateKey(casiMedianoche)).toBe('2026-08-10')
    expect(strivoDateKey('00:00', casiMedianoche)).toBe('2026-08-10')
  })
})
