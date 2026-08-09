// tests/emociones.test.js
// Las quince emociones que sí se pueden cultivar (§22) y sus variantes de
// género, que son once de quince: sin ellas, media lista le hablaría mal a
// media gente en la pantalla más emocional del ritual.

import { describe, it, expect } from 'vitest'
import { copy } from '@copy'
import { resolveCopy } from '@copy/resolve'
import {
  EMOCIONES,
  EMOCION_OTRA,
  comoPropia,
  esPropia,
  nombreDeEmocion,
  emojiDe,
} from '@lib/emociones'

const opciones = copy.hoy.emociones.opciones
const resolver = modo => id => resolveCopy(opciones[id], modo)

describe('El catálogo (§22.3)', () => {
  it('son quince, en el orden de la referencia', () => {
    expect(EMOCIONES).toHaveLength(15)
    expect(EMOCIONES.map(e => e.id)).toEqual([
      'orgullo', 'gratitud', 'amor', 'compania', 'fe', 'prosperidad',
      'paz', 'energia', 'alegria', 'serenidad', 'confianza', 'plenitud',
      'inspiracion', 'poder', 'radiante',
    ])
  })

  it('cada una tiene su emoji, y ninguno se repite', () => {
    const emojis = EMOCIONES.map(e => e.emoji)
    expect(emojis.every(Boolean)).toBe(true)
    expect(new Set(emojis).size).toBe(emojis.length)
  })

  it('los emojis son los de la referencia', () => {
    expect(emojiDe('orgullo')).toBe('🦁')
    expect(emojiDe('fe')).toBe('🕊️')
    expect(emojiDe('poder')).toBe('🔥')
    expect(emojiDe('radiante')).toBe('✨')
  })

  it('todas tienen nombre, y "Otra" también', () => {
    for (const emocion of EMOCIONES) {
      expect(opciones[emocion.id], emocion.id).toBeDefined()
    }
    expect(opciones[EMOCION_OTRA]).toBeDefined()
  })

  it('ninguna emoción negativa sobrevive', () => {
    const fuera = ['irritable', 'abrumado', 'nostalgico', 'ansioso', 'triste',
      'cansado', 'inseguro']
    for (const id of fuera) {
      expect(EMOCIONES.map(e => e.id), id).not.toContain(id)
      expect(opciones[id], id).toBeUndefined()
    }
  })

  it('el título anterior ya no existe en el bloque', () => {
    expect(copy.hoy.emociones.titulo).toBe('¿Cómo me quiero sentir hoy?')
    expect(copy.hoy.emociones.subtitulo).toBe('Elige las emociones que quieres cultivar')
    // El bloque del diario ya no tiene etiqueta propia: la lleva la tarjeta
    expect(copy.diarioManana.emotions.label).toBeUndefined()
    // El aviso de la mañana conserva su propia redacción: es otro momento y
    // otra superficie, y §22 no lo toca.
    expect(copy.notifications.manana).toBe('¿Cómo quieres sentirte hoy?')
  })
})

describe('Variantes de género (§22.4)', () => {
  it('once de las quince cambian con el género', () => {
    const conVariante = EMOCIONES.filter(e => typeof opciones[e.id] === 'object')
    expect(conVariante).toHaveLength(11)
  })

  it('las cuatro invariables son un solo string', () => {
    for (const id of ['paz', 'energia', 'alegria', 'radiante']) {
      expect(typeof opciones[id], id).toBe('string')
    }
  })

  it('cada modo dice lo suyo', () => {
    expect(resolver('m')('orgullo')).toBe('Orgulloso de mí')
    expect(resolver('f')('orgullo')).toBe('Orgullosa de mí')
    expect(resolver('n')('orgullo')).toBe('Con orgullo de mí')

    expect(resolver('m')('fe')).toBe('Conectado con Dios')
    expect(resolver('f')('fe')).toBe('Conectada con Dios')
    expect(resolver('n')('fe')).toBe('Cerca de Dios')
  })

  it('en neutro solo "Amado/a" usa barra, y es la excepción autorizada', () => {
    const conBarra = Object.entries(opciones)
      .filter(([, entrada]) => typeof entrada === 'object')
      .filter(([, entrada]) => entrada.n.includes('/'))
      .map(([id]) => id)

    expect(conBarra).toEqual(['amor'])
    expect(resolver('n')('amor')).toBe('Amado/a')
  })
})

describe('La emoción propia (§22.6)', () => {
  const t = ruta => {
    const id = ruta.split('.').pop()
    return resolveCopy(opciones[id], 'f')
  }

  it('se guarda distinguible de un id del catálogo', () => {
    const id = comoPropia('Curiosa')
    expect(esPropia(id)).toBe(true)
    expect(nombreDeEmocion(id, t)).toBe('Curiosa')
  })

  it('un id del catálogo se resuelve con su nombre', () => {
    expect(nombreDeEmocion('gratitud', t)).toBe('Agradecida')
  })

  it('un id viejo del historial se devuelve tal cual en vez de desaparecer', () => {
    expect(nombreDeEmocion('irritable', t)).toBe('irritable')
  })
})
