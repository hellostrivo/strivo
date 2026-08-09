// tests/emocionesJournal.test.js
// Las quince emociones del Journal (bloque 06) y su convivencia con las quince
// de la Vista de Mañana, que son otras y preguntan otra cosa.

import { describe, it, expect } from 'vitest'
import { copy } from '@copy'
import { resolveCopy } from '@copy/resolve'
import {
  EMOCIONES_JOURNAL,
  EMOCION_JOURNAL_OTRA,
  MAX_EMOCIONES_JOURNAL,
  OTRA_MAX_LENGTH,
  emojiDeEmocionJournal,
  nombreDeEmocionJournal,
  normalizarEmocionesJournal,
  palabraPropiaDe,
  comoPropia,
} from '@lib/emocionesJournal'
import { EMOCIONES } from '@lib/emociones'

const opciones = copy.journal.emociones.opciones
const resolver = modo => id => resolveCopy(opciones[id], modo)
const nombre = (id, modo = 'n') => nombreDeEmocionJournal(id, ruta => {
  const clave = ruta.replace('journal.emociones.opciones.', '')
  return resolveCopy(opciones[clave], modo)
})

describe('El catálogo', () => {
  it('son quince, en el orden de la referencia', () => {
    expect(EMOCIONES_JOURNAL).toHaveLength(15)
    expect(EMOCIONES_JOURNAL.map(e => e.id)).toEqual([
      'feliz', 'en_paz', 'gratitud', 'energia', 'amor', 'fuerza',
      'emocion', 'esperanza', 'neutral', 'tristeza', 'ansiedad',
      'cansancio', 'frustracion', 'preocupacion', 'melancolia',
    ])
  })

  it('cada una tiene su emoji, y ninguno se repite', () => {
    const emojis = EMOCIONES_JOURNAL.map(e => e.emoji)
    expect(emojis.every(Boolean)).toBe(true)
    expect(new Set(emojis).size).toBe(emojis.length)
  })

  it('los emojis son los de la referencia', () => {
    expect(emojiDeEmocionJournal('feliz')).toBe('😊')
    expect(emojiDeEmocionJournal('esperanza')).toBe('🌤️')
    expect(emojiDeEmocionJournal('melancolia')).toBe('🌧️')
    expect(emojiDeEmocionJournal('nada')).toBeNull()
  })

  it('todas tienen nombre, y "Otra" también', () => {
    for (const emocion of EMOCIONES_JOURNAL) {
      expect(opciones[emocion.id], emocion.id).toBeDefined()
    }
    expect(opciones[EMOCION_JOURNAL_OTRA]).toBeDefined()
  })

  it('caben tres, una más que el cierre de la noche', () => {
    expect(MAX_EMOCIONES_JOURNAL).toBe(3)
  })
})

describe('Aquí sí caben las difíciles', () => {
  // Es la razón de que este catálogo exista aparte: el Journal registra el
  // presente, y un presente sin tristeza ni cansancio no es honesto.
  const DIFICILES = ['tristeza', 'ansiedad', 'frustracion', 'preocupacion', 'melancolia']

  it('las cinco están', () => {
    for (const id of DIFICILES) {
      expect(EMOCIONES_JOURNAL.map(e => e.id), id).toContain(id)
    }
  })

  it('y ninguna de ellas se coló en la pregunta de la mañana', () => {
    // Allí se pregunta qué se quiere cultivar: ofrecer "ansiosa" no tiene
    // sentido, y ese bloque no se toca desde aquí (§22).
    for (const id of DIFICILES) {
      expect(EMOCIONES.map(e => e.id), id).not.toContain(id)
    }
  })

  it('no se pintan distinto ni se nombran como un problema', () => {
    // Ninguna lleva marca de estado: en el catálogo solo hay id y emoji.
    for (const emocion of EMOCIONES_JOURNAL) {
      expect(Object.keys(emocion).sort()).toEqual(['emoji', 'id'])
    }
  })
})

describe('Las dos preguntas son independientes', () => {
  it('el título y el subtítulo no son los de la mañana', () => {
    expect(copy.journal.emociones.titulo).toBe('¿Cómo me siento?')
    expect(copy.hoy.emociones.titulo).toBe('¿Cómo me quiero sentir hoy?')
    expect(copy.journal.emociones.subtitulo).not.toBe(copy.hoy.emociones.subtitulo)
  })

  it('cada una tiene su propio catálogo de ids', () => {
    const journal = EMOCIONES_JOURNAL.map(e => e.id)
    const manana  = EMOCIONES.map(e => e.id)
    expect(journal).not.toEqual(manana)
  })

  it('los ids que comparten nombre se resuelven en su propio copy', () => {
    // 'amor' existe en las dos, y no dice lo mismo: la mañana admite "Amado/a"
    // como excepción autorizada, aquí la neutra se reformula.
    expect(resolver('n')('amor')).toBe('Con amor')
    expect(resolveCopy(copy.hoy.emociones.opciones.amor, 'n')).toBe('Amado/a')
  })
})

describe('Variantes de género', () => {
  it('nueve cambian con el género y seis no', () => {
    const conVariantes = EMOCIONES_JOURNAL
      .map(e => e.id)
      .filter(id => typeof opciones[id] !== 'string')
    expect(conVariantes).toHaveLength(9)
  })

  it('cada variante existe en los tres modos y ninguna queda vacía', () => {
    for (const id of [...EMOCIONES_JOURNAL.map(e => e.id), EMOCION_JOURNAL_OTRA]) {
      for (const modo of ['m', 'f', 'n']) {
        expect(resolver(modo)(id), `${id} en ${modo}`).toBeTruthy()
      }
    }
  })

  it('la neutra se redacta sin marcas de género', () => {
    for (const id of EMOCIONES_JOURNAL.map(e => e.id)) {
      expect(resolver('n')(id), id).not.toMatch(/\/a\b|@|\belle\b/i)
    }
  })

  it('el rótulo que se lee sale del género vigente', () => {
    expect(nombre('cansancio', 'm')).toBe('Cansado')
    expect(nombre('cansancio', 'f')).toBe('Cansada')
    expect(nombre('cansancio', 'n')).toBe('Con cansancio')
  })

  it('lo escrito a mano se devuelve tal cual, y un id de otro tiempo también', () => {
    expect(nombre(comoPropia('nostálgica'))).toBe('nostálgica')
    expect(nombre('un_id_que_ya_no_existe')).toBe('un_id_que_ya_no_existe')
    expect(nombre(null)).toBe('')
  })
})

describe('Lo que se guarda', () => {
  it('una entrada sin el campo se lee como lista vacía', () => {
    expect(normalizarEmocionesJournal(undefined)).toEqual([])
    expect(normalizarEmocionesJournal(null)).toEqual([])
    expect(normalizarEmocionesJournal('tristeza')).toEqual([])
  })

  it('quita repetidos y huecos sin tocar el orden', () => {
    expect(normalizarEmocionesJournal(['feliz', '', 'feliz', 'en_paz', null]))
      .toEqual(['feliz', 'en_paz'])
  })

  it('"Otra" a secas no ocupa sitio: o hay palabra, o no hay nada', () => {
    expect(normalizarEmocionesJournal(['feliz', 'otra'])).toEqual(['feliz'])
  })

  it('la palabra propia viaja dentro de la lista y se puede leer aparte', () => {
    const emociones = ['feliz', comoPropia('nostálgica')]
    expect(palabraPropiaDe(emociones)).toBe('nostálgica')
    expect(palabraPropiaDe(['feliz'])).toBe('')
  })

  it('la palabra propia es corta a propósito', () => {
    expect(OTRA_MAX_LENGTH).toBe(20)
  })
})
