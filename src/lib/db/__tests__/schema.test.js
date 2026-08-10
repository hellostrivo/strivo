import { describe, expect, it } from 'vitest'

import {
  AREA_IDS,
  ERROR_CODES,
  MAX_SELECTED_AREAS,
  StrivoDataError,
  assertCentralIdentity,
  assertIdentityRef,
  emptyAreasMap,
  isValidIdentityRef,
  paths,
  validateAreasMap,
  validateDayState,
  validateHabit,
  validateHabitLog,
  validateJournalEntry,
  validateVictory,
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

describe('catálogo de áreas (§C5.4)', () => {
  it('tiene exactamente las 7 áreas de SPEC_02 §5', () => {
    expect(AREA_IDS).toEqual([
      'salud',
      'trabajo',
      'relaciones',
      'espiritualidad',
      'crecimiento',
      'finanzas',
      'creatividad',
    ])
  })

  it('un mapa nuevo trae las 7 sin seleccionar y con sus atributos', () => {
    const areas = emptyAreasMap()
    expect(Object.keys(areas)).toHaveLength(7)
    AREA_IDS.forEach((id) => {
      expect(areas[id]).toEqual({
        selected: false,
        identityText: null,
        color: expect.stringMatching(/^#[0-9A-F]{6}$/i),
        icon: id,
        order: expect.any(Number),
        state: 'activa',
      })
    })
  })

  it(`rechaza más de ${MAX_SELECTED_AREAS} áreas seleccionadas`, () => {
    const areas = emptyAreasMap()
    ;['salud', 'trabajo', 'relaciones', 'finanzas'].forEach((id) => {
      areas[id].selected = true
    })
    expect(codeOf(() => validateAreasMap(areas))).toBe(ERROR_CODES.AREAS_MAX_SELECTED)
  })

  it('rechaza un areaId fuera del catálogo', () => {
    expect(codeOf(() => validateAreasMap({ deportes: { selected: true } }))).toBe(
      ERROR_CODES.AREA_UNKNOWN,
    )
  })
})

describe('identityRef (§C5.5)', () => {
  it('RN-DB4-05: null, undefined y cadena vacía se rechazan', () => {
    ;[null, undefined, ''].forEach((value) => {
      expect(codeOf(() => assertIdentityRef(value))).toBe(ERROR_CODES.HABIT_IDENTITY_REQUIRED)
    })
  })

  it('RN-DB4-06: solo "central" o un areaId del catálogo', () => {
    expect(isValidIdentityRef('central')).toBe(true)
    expect(isValidIdentityRef('salud')).toBe(true)
    expect(isValidIdentityRef('deportes')).toBe(false)
    expect(codeOf(() => assertIdentityRef('deportes'))).toBe(ERROR_CODES.HABIT_IDENTITY_UNKNOWN)
  })

  it('RN-DB4-07: un área con selected:false sigue siendo destino válido', () => {
    const areas = emptyAreasMap()
    expect(areas.salud.selected).toBe(false)
    expect(isValidIdentityRef('salud', areas)).toBe(true)
  })

  it('RN-DB4-09: la identidad central no se escribe vacía', () => {
    expect(codeOf(() => assertCentralIdentity('   '))).toBe(
      ERROR_CODES.IDENTITY_CENTRAL_REQUIRED,
    )
    expect(assertCentralIdentity('Alguien que crece')).toBe('Alguien que crece')
  })
})

describe('validateHabit', () => {
  const base = { name: 'Caminar', identityRef: 'central' }

  it('acepta un hábito con identidad central', () => {
    expect(validateHabit(base)).toBe(base)
  })

  it('pide un nombre', () => {
    expect(codeOf(() => validateHabit({ name: '  ', identityRef: 'central' }))).toBe(
      ERROR_CODES.HABIT_NAME_REQUIRED,
    )
  })

  it('context admite manana, noche o null, nada más', () => {
    expect(validateHabit({ ...base, context: 'noche' })).toBeTruthy()
    expect(validateHabit({ ...base, context: null })).toBeTruthy()
    expect(codeOf(() => validateHabit({ ...base, context: 'dia' }))).toBe(
      ERROR_CODES.HABIT_CONTEXT_INVALID,
    )
  })

  it('RN-DB4-08: un campo fuera del modelo se rechaza, no se descarta callando', () => {
    expect(codeOf(() => validateHabit({ ...base, momento: 'manana' }))).toBe(
      ERROR_CODES.UNKNOWN_FIELD,
    )
    expect(codeOf(() => validateHabit({ ...base, areaId: 'salud' }))).toBe(
      ERROR_CODES.UNKNOWN_FIELD,
    )
    expect(codeOf(() => validateHabit({ ...base, icono: 'x' }))).toBe(ERROR_CODES.UNKNOWN_FIELD)
  })

  it('state admite el enum de §7.2', () => {
    expect(validateHabit({ ...base, state: 'pausado' })).toBeTruthy()
    expect(codeOf(() => validateHabit({ ...base, state: 'muerto' }))).toBe(
      ERROR_CODES.STATE_INVALID,
    )
  })
})

describe('validateHabitLog (RN-06)', () => {
  it('acepta una fila de completado', () => {
    const log = { habitId: 'h1', date: '2026-08-10', completedAt: '2026-08-10T21:00:00.000Z' }
    expect(validateHabitLog(log)).toBe(log)
  })

  it('no existe campo para decir que algo no se hizo', () => {
    expect(
      codeOf(() => validateHabitLog({ habitId: 'h1', date: '2026-08-10', completado: false })),
    ).toBe(ERROR_CODES.UNKNOWN_FIELD)
  })

  it('exige una fecha con forma YYYY-MM-DD', () => {
    expect(codeOf(() => validateHabitLog({ habitId: 'h1', date: '10/08/2026' }))).toBe(
      ERROR_CODES.DATE_INVALID,
    )
  })
})

describe('registros de Lumia', () => {
  it('journal solo admite los campos de SPEC_02 §5', () => {
    expect(
      validateJournalEntry({ date: '2026-08-10', text: 'Hoy', emotions: ['calma'] }),
    ).toBeTruthy()
    expect(codeOf(() => validateJournalEntry({ titulo: 'x' }))).toBe(ERROR_CODES.UNKNOWN_FIELD)
  })

  it('la victoria admite identityRef, pero no lo exige (§C5.3)', () => {
    expect(validateVictory({ text: 'Salí a caminar', date: '2026-08-10' })).toBeTruthy()
    expect(
      validateVictory({ text: 'Salí a caminar', date: '2026-08-10', identityRef: 'salud' }),
    ).toBeTruthy()
    expect(codeOf(() => validateVictory({ text: 'x', identityRef: 'deportes' }))).toBe(
      ERROR_CODES.HABIT_IDENTITY_UNKNOWN,
    )
  })

  it('dayState solo guarda mood, con la paleta de ánimo de §6.3.5', () => {
    expect(validateDayState({ mood: 'en_paz' })).toBeTruthy()
    expect(codeOf(() => validateDayState({ mood: 'feliz' }))).toBe(ERROR_CODES.MOOD_INVALID)
    expect(codeOf(() => validateDayState({ state: 'cerrado' }))).toBe(ERROR_CODES.UNKNOWN_FIELD)
  })
})

describe('rutas (§C5.2)', () => {
  it('toda ruta tiene un número par de segmentos, como pide Firestore', () => {
    const rutas = [
      paths.sharedDoc('u1', 'profile'),
      paths.lumiaDoc('u1', 'pinConfig'),
      paths.lumiaItem('u1', 'journal', 'e1'),
      paths.formiaDoc('u1', 'identity'),
      paths.formiaItem('u1', 'habits', 'h1'),
      paths.formiaItem('u1', 'habitLogs', 'h1_2026-08-10'),
    ]
    rutas.forEach((ruta) => {
      expect(ruta.split('/').length % 2).toBe(0)
      expect(ruta.startsWith('users/u1/')).toBe(true)
    })
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
