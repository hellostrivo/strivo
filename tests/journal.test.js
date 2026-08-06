// tests/journal.test.js
// Journal (§5.8): guardar sin fricción y buscar por palabra.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  entradaNueva,
  guardarEntrada,
  loadEntradas,
  loadEntradasDeFecha,
  buscar,
  normalizar,
  resumen,
} from '@lib/journal'
import { getCurrentUserId } from '@lib/user'
import { filasDe } from './helpers/db.js'

const UNA_TARDE = new Date(2026, 7, 5, 17, 0)
const HOY = '2026-08-05'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UNA_TARDE)
})
afterEach(() => vi.useRealTimers())

describe('escribir', () => {
  it('una entrada nueva nace vacía y con la fecha de hoy', () => {
    const entrada = entradaNueva('u1')
    expect(entrada).toMatchObject({ userId: 'u1', fecha: HOY, texto: '' })
  })

  it('abrir el editor y arrepentirse no deja rastro', async () => {
    const entrada = entradaNueva('u1')

    expect(await guardarEntrada(entrada)).toBeNull()
    expect(await guardarEntrada({ ...entrada, texto: '   \n  ' })).toBeNull()
    expect(await filasDe('journalEntries')).toHaveLength(0)
  })

  it('guardar dos veces la misma entrada no crea dos', async () => {
    const entrada = entradaNueva('u1')

    await guardarEntrada({ ...entrada, texto: 'Hoy pensé en' })
    await guardarEntrada({ ...entrada, texto: 'Hoy pensé en mi hermana' })

    const filas = await filasDe('journalEntries')
    expect(filas).toHaveLength(1)
    expect(filas[0].texto).toBe('Hoy pensé en mi hermana')
  })

  it('recorta los espacios de los bordes pero respeta lo de dentro', async () => {
    const guardada = await guardarEntrada({
      ...entradaNueva('u1'),
      texto: '  Primera línea\n\nSegunda línea  ',
    })
    expect(guardada.texto).toBe('Primera línea\n\nSegunda línea')
  })

  it('la lista llega con lo más reciente primero', async () => {
    const userId = getCurrentUserId()

    vi.setSystemTime(new Date(2026, 7, 3, 10, 0))
    await guardarEntrada({ ...entradaNueva(userId), texto: 'La más vieja' })
    vi.setSystemTime(new Date(2026, 7, 5, 10, 0))
    await guardarEntrada({ ...entradaNueva(userId), texto: 'La más nueva' })

    const entradas = await loadEntradas(userId)
    expect(entradas.map(e => e.texto)).toEqual(['La más nueva', 'La más vieja'])
  })

  it('se pueden leer las entradas de un día concreto', async () => {
    const userId = getCurrentUserId()
    await guardarEntrada({ ...entradaNueva(userId), texto: 'De hoy' })
    await guardarEntrada({ ...entradaNueva(userId, '2026-08-01'), texto: 'De otro día' })

    const deHoy = await loadEntradasDeFecha(userId, HOY)
    expect(deHoy.map(e => e.texto)).toEqual(['De hoy'])
  })
})

describe('buscar', () => {
  const entradas = [
    { id: '1', texto: 'Hoy fue un día tranquilo con mi hermana' },
    { id: '2', texto: 'Mañana quiero levantarme temprano' },
    { id: '3', texto: 'MAÑANA es otro día' },
  ]

  it('sin consulta devuelve todo', () => {
    expect(buscar(entradas, '')).toHaveLength(3)
    expect(buscar(entradas, '   ')).toHaveLength(3)
  })

  it('encuentra por palabra suelta', () => {
    expect(buscar(entradas, 'hermana').map(e => e.id)).toEqual(['1'])
  })

  it('no distingue mayúsculas', () => {
    expect(buscar(entradas, 'mañana').map(e => e.id)).toEqual(['2', '3'])
  })

  it('no distingue acentos, en los dos sentidos', () => {
    expect(buscar(entradas, 'manana').map(e => e.id)).toEqual(['2', '3'])
    expect(buscar([{ id: 'x', texto: 'Manana sin tilde' }], 'mañana').map(e => e.id)).toEqual(['x'])
  })

  it('encuentra por trozo de palabra', () => {
    expect(buscar(entradas, 'tranq').map(e => e.id)).toEqual(['1'])
  })

  it('sin resultados devuelve una lista vacía, no un error', () => {
    expect(buscar(entradas, 'bicicleta')).toEqual([])
  })

  it('normalizar aguanta lo que no es texto', () => {
    expect(normalizar(null)).toBe('')
    expect(normalizar(undefined)).toBe('')
  })
})

describe('resumen para la lista', () => {
  it('deja el texto corto tal cual', () => {
    expect(resumen('Un día tranquilo')).toBe('Un día tranquilo')
  })

  it('junta los saltos de línea en una sola línea', () => {
    expect(resumen('Primera\n\nSegunda')).toBe('Primera Segunda')
  })

  it('corta lo largo con puntos suspensivos', () => {
    const largo = 'palabra '.repeat(40)
    const corto = resumen(largo, 20)

    expect(corto.length).toBeLessThanOrEqual(21)
    expect(corto.endsWith('…')).toBe(true)
  })
})
