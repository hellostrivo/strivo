// src/diario/__tests__/journal.test.js
// El Journal (§5.8): guardado, agrupación y búsqueda.

import { beforeEach, describe, expect, it } from 'vitest'

import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { diario } from '@/lib/db'
import {
  agrupar,
  buscar,
  entradaNueva,
  esVacia,
  extractoDe,
  guardar,
  listar,
  normalizar,
} from '../journal.js'

const TITULOS = { hoy: 'Hoy', semana: 'Esta semana' }

beforeEach(async () => {
  await resetLocalDB()
})

describe('una entrada vacía no se guarda (§5.8.1, criterio 4)', () => {
  it('sin texto y sin emociones no crea nada', async () => {
    expect(await guardar(UID, entradaNueva('2026-08-10'))).toBeNull()
    expect(await listar(UID)).toHaveLength(0)
  })

  it('solo con emociones sí se guarda', async () => {
    const guardada = await guardar(UID, {
      ...entradaNueva('2026-08-10'),
      emotions: ['triste'],
    })
    expect(guardada.emotions).toEqual(['triste'])
    expect(await listar(UID)).toHaveLength(1)
  })

  it('solo con texto sí se guarda', async () => {
    await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Hoy hablé con mi hermana' })
    expect(await listar(UID)).toHaveLength(1)
  })

  it('`esVacia` distingue el espacio en blanco del silencio', () => {
    expect(esVacia({ text: '   ', emotions: [] })).toBe(true)
    expect(esVacia({ text: '', emotions: ['solo'] })).toBe(false)
  })
})

describe('editar no duplica', () => {
  it('guardar dos veces la misma entrada la actualiza', async () => {
    const primera = await guardar(UID, {
      ...entradaNueva('2026-08-10'),
      text: 'Primera versión',
    })
    await guardar(UID, { ...primera, text: 'Segunda versión' })

    const entradas = await listar(UID)
    expect(entradas).toHaveLength(1)
    expect(entradas[0].text).toBe('Segunda versión')
  })

  it('vaciar una entrada existente la retira', async () => {
    const entrada = await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Algo' })
    expect(await guardar(UID, { ...entrada, text: '', emotions: [] })).toBeNull()
    expect(await listar(UID)).toHaveLength(0)
  })

  it('conserva la fecha y las marcas de tiempo del modelo canónico', async () => {
    const entrada = await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Algo' })
    const guardada = await diario.getJournalEntry(UID, entrada.id)
    expect(guardada.date).toBe('2026-08-10')
    expect(guardada.createdAt).toBeTruthy()
    expect(guardada.updatedAt).toBeTruthy()
  })
})

describe('la lista', () => {
  it('viene de la más reciente a la más antigua', async () => {
    await guardar(UID, { ...entradaNueva('2026-08-01'), text: 'Vieja' })
    await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Nueva' })
    const entradas = await listar(UID)
    expect(entradas[0].text).toBe('Nueva')
  })

  it('la tarjeta enseña la primera línea', () => {
    expect(extractoDe({ text: '\nHoy hablé con mi jefa\ny salió bien' })).toBe(
      'Hoy hablé con mi jefa',
    )
    expect(extractoDe({ text: 'a'.repeat(200) })).toHaveLength(121)
  })
})

describe('agrupación por cercanía (§5.8, wireframe)', () => {
  const entradas = [
    { id: '1', date: '2026-08-10', text: 'hoy' },
    { id: '2', date: '2026-08-07', text: 'esta semana' },
    { id: '3', date: '2026-07-02', text: 'julio' },
  ]

  it('reparte en hoy, esta semana y los meses anteriores', () => {
    const grupos = agrupar(entradas, '2026-08-10', TITULOS)
    expect(grupos.map((grupo) => grupo.id)).toEqual(['hoy', 'semana', '2026-07'])
    expect(grupos[2].titulo).toMatch(/julio/i)
  })

  it('un grupo vacío no se pinta: la lista nunca enseña un hueco', () => {
    const grupos = agrupar([entradas[0]], '2026-08-10', TITULOS)
    expect(grupos).toHaveLength(1)
    expect(grupos[0].id).toBe('hoy')
  })

  it('sin nada escrito no hay ningún grupo', () => {
    expect(agrupar([], '2026-08-10', TITULOS)).toEqual([])
  })
})

describe('búsqueda simple (§5.8, criterio 3)', () => {
  const entradas = [
    { id: '1', date: '2026-08-10', text: 'Hablé con mi hermana', emotions: [], otherText: null },
    { id: '2', date: '2026-08-09', text: 'Día largo', emotions: ['melancolico'], otherText: null },
  ]

  it('encuentra por texto', () => {
    expect(buscar(entradas, 'hermana', 'f').map((entrada) => entrada.id)).toEqual(['1'])
  })

  it('encuentra por la etiqueta de la emoción, no por su id', () => {
    expect(buscar(entradas, 'melancólica', 'f').map((entrada) => entrada.id)).toEqual(['2'])
  })

  it('no le importan los acentos ni las mayúsculas', () => {
    expect(buscar(entradas, 'MELANCOLICA', 'f')).toHaveLength(1)
    expect(normalizar('Melancolía')).toBe('melancolia')
  })

  it('sin consulta devuelve todo', () => {
    expect(buscar(entradas, '   ', 'n')).toHaveLength(2)
  })
})
