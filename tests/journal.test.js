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
import { comoPropia } from '@lib/emocionesJournal'
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

describe('cómo me siento (bloque 06)', () => {
  it('una entrada nueva nace sin emociones elegidas', () => {
    expect(entradaNueva('u1').emociones).toEqual([])
  })

  it('se guardan como ids, no como rótulos', async () => {
    const guardada = await guardarEntrada({
      ...entradaNueva('u1'),
      texto: 'Un día raro',
      emociones: ['cansancio', 'esperanza'],
    })

    expect(guardada.emociones).toEqual(['cansancio', 'esperanza'])
    const filas = await filasDe('journalEntries')
    expect(filas[0].emociones).toEqual(['cansancio', 'esperanza'])
  })

  it('elegir una emoción y no escribir nada también se guarda', async () => {
    // La emoción no es un adorno del texto: registrar cómo fue el día cuenta
    const guardada = await guardarEntrada({
      ...entradaNueva('u1'),
      emociones: ['tristeza'],
    })

    expect(guardada).not.toBeNull()
    expect(guardada.texto).toBe('')
    expect(await filasDe('journalEntries')).toHaveLength(1)
  })

  it('sin texto y sin emociones sigue sin dejar rastro', async () => {
    expect(await guardarEntrada({ ...entradaNueva('u1'), emociones: [] })).toBeNull()
    expect(await filasDe('journalEntries')).toHaveLength(0)
  })

  it('la palabra propia se guarda dentro de la lista y también en claro', async () => {
    const guardada = await guardarEntrada({
      ...entradaNueva('u1'),
      texto: 'Hoy',
      emociones: ['feliz', comoPropia('nostálgica')],
    })

    expect(guardada.emociones).toEqual(['feliz', 'propia:nostálgica'])
    expect(guardada.emocionOtra).toBe('nostálgica')
  })

  it('una entrada de antes del bloque 06 se abre sin emociones y sin errores', async () => {
    // No se migra nada: lo viejo se lee, no se reescribe
    const vieja = { ...entradaNueva('u1'), texto: 'De hace meses' }
    delete vieja.emociones
    delete vieja.emocionOtra

    const guardada = await guardarEntrada(vieja)
    expect(guardada.emociones).toEqual([])
    expect(guardada.texto).toBe('De hace meses')

    const [leida] = await loadEntradas('u1')
    expect(leida.emociones).toEqual([])
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
