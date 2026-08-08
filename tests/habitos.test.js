// tests/habitos.test.js
// El módulo de Hábitos (§5.7): agrupación, ciclo de vida, cuadrícula de 90 días
// y —lo importante— que crear un hábito baste para que aparezca en su ritual.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { copy } from '@copy'
import { markHabit, saveHabit, saveArea, getActiveHabitsForMoment } from '@lib/db'
import {
  MOMENTOS,
  agruparPorMomento,
  crearHabito,
  pausarHabito,
  reanudarHabito,
  archivarHabito,
  loadHabitos,
  loadDetalleHabito,
  cuadriculaDe,
  rangoDeCuadricula,
  sugerenciasPara,
  nombreDeMomento,
  DIAS_TODOS,
} from '@lib/habits'
import { loadRitualManana } from '@lib/ritualManana'
import { loadRitualNoche } from '@lib/ritualNoche'
import { getCurrentUserId } from '@lib/user'
import { habitoDePrueba, filasDe } from './helpers/db.js'

const UN_MIERCOLES = new Date(2026, 7, 5, 8, 0)
const HOY = '2026-08-05'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UN_MIERCOLES)
})
afterEach(() => vi.useRealTimers())

describe('H1 · agrupar por momento', () => {
  const habitos = [
    habitoDePrueba({ id: 'a', momento: 'noche' }),
    habitoDePrueba({ id: 'b', momento: 'manana' }),
    habitoDePrueba({ id: 'c', momento: 'dia' }),
    habitoDePrueba({ id: 'd', momento: 'manana' }),
  ]

  it('ordena los grupos como transcurre el día', () => {
    const { grupos } = agruparPorMomento(habitos)
    expect(grupos.map(g => g.momento)).toEqual(['manana', 'noche'])
  })

  it('un momento sin hábitos no se pinta vacío', () => {
    const { grupos } = agruparPorMomento([habitoDePrueba({ momento: 'noche' })])
    expect(grupos.map(g => g.momento)).toEqual(['noche'])
  })

  it('los pausados van aparte y no cuentan como activos', () => {
    const conPausado = [...habitos, habitoDePrueba({ id: 'e', estado: 'pausado' })]
    const { grupos, pausados, totalActivos } = agruparPorMomento(conPausado)

    expect(totalActivos).toBe(4)
    expect(pausados.map(h => h.id)).toEqual(['e'])
    expect(grupos.flatMap(g => g.habitos.map(h => h.id))).not.toContain('e')
  })

  it('los archivados no se listan', async () => {
    const userId = getCurrentUserId()
    await saveHabit(habitoDePrueba({ id: 'vivo', userId }))
    await saveHabit(habitoDePrueba({ id: 'archivado', userId, estado: 'archivado' }))

    const listados = await loadHabitos(userId)
    expect(listados.map(h => h.id)).toEqual(['vivo'])
  })
})

describe('H3 · crear', () => {
  it('nace activo, todos los días y con su momento', async () => {
    const habito = await crearHabito('u1', { nombre: '  Estirar  ', momento: 'noche' })

    expect(habito).toMatchObject({
      nombre: 'Estirar',        // recortado
      momento: 'noche',
      estado: 'activo',
      totalCompletados: 0,
      areaId: null,
      diasSemana: DIAS_TODOS,
    })
  })

  it('guarda los días elegidos, ordenados', async () => {
    const habito = await crearHabito('u1', { nombre: 'Correr', diasSemana: [4, 0, 2] })
    expect(habito.diasSemana).toEqual([0, 2, 4])
  })

  it('las sugerencias siguen a las áreas y no repiten lo que ya existe', () => {
    const areas = [
      { id: 'a-salud', tipo: 'salud', color: '#7E9E86' },
      { id: 'a-esp', tipo: 'espiritual', color: '#8B6BA8' },
    ]
    const existentes = [{ nombre: 'beber agua' }]   // ya creado, en minúsculas

    const sugerencias = sugerenciasPara(areas, existentes)
    const textos = sugerencias.map(s => s.texto)

    expect(textos).not.toContain('Beber agua')
    expect(textos).toContain('Estirar')
    expect(textos).toContain('Meditar')
    expect(sugerencias.find(s => s.texto === 'Meditar').areaId).toBe('a-esp')
  })

  it('sin áreas también hay algo que ofrecer', () => {
    expect(sugerenciasPara([], []).length).toBeGreaterThan(0)
    expect(sugerenciasPara([], []).every(s => s.areaId === null)).toBe(true)
  })
})

describe('proyección automática a los rituales (RN-HR-01)', () => {
  it('crear uno de mañana lo pone en el Ritual de Mañana, sin más pasos', async () => {
    const userId = getCurrentUserId()
    await crearHabito(userId, { nombre: 'Beber agua', momento: 'manana' })

    const { habitos } = await loadRitualManana()
    expect(habitos.map(h => h.nombre)).toEqual(['Beber agua'])
  })

  it('crear uno de noche lo pone en el Ritual de Noche', async () => {
    const userId = getCurrentUserId()
    await crearHabito(userId, { nombre: 'Guardar el teléfono', momento: 'noche' })

    vi.setSystemTime(new Date(2026, 7, 5, 22, 30))
    const { habitos } = await loadRitualNoche()
    expect(habitos.map(h => h.nombre)).toEqual(['Guardar el teléfono'])
  })

  // "A lo largo del día" se retiró: era el único momento que no proyectaba a
  // ningún ritual, así que esos hábitos vivían fuera de las dos ceremonias.
  it('el momento retirado se guarda como de mañana y sí llega a su ritual', async () => {
    const userId = getCurrentUserId()
    const habito = await crearHabito(userId, { nombre: 'Respirar', momento: 'dia' })

    expect(habito.momento).toBe('manana')
    expect((await loadRitualManana()).habitos.map(h => h.nombre)).toEqual(['Respirar'])
  })

  it('solo aparece los días que le tocan', async () => {
    const userId = getCurrentUserId()
    // 5 ago 2026 es miércoles → índice 2 (0 = lunes)
    await crearHabito(userId, { nombre: 'Solo lunes', momento: 'manana', diasSemana: [0] })
    await crearHabito(userId, { nombre: 'Miércoles', momento: 'manana', diasSemana: [2] })

    const { habitos } = await loadRitualManana()
    expect(habitos.map(h => h.nombre)).toEqual(['Miércoles'])
  })

  it('pausar lo saca del ritual sin borrar su historial (RN-04)', async () => {
    const userId = getCurrentUserId()
    const habito = await crearHabito(userId, { nombre: 'Beber agua', momento: 'manana' })
    await markHabit(habito.id, userId, HOY)

    const pausado = await pausarHabito(habito)
    expect((await loadRitualManana()).habitos).toHaveLength(0)
    expect(await filasDe('habitLogs')).toHaveLength(1)
    expect(pausado.totalCompletados).toBe(1)

    // Y reanudarlo lo devuelve tal cual estaba
    await reanudarHabito(pausado)
    const { habitos } = await loadRitualManana()
    expect(habitos.map(h => h.nombre)).toEqual(['Beber agua'])
    expect(habitos[0].totalCompletados).toBe(1)
  })

  it('archivar tampoco borra nada', async () => {
    const userId = getCurrentUserId()
    const habito = await crearHabito(userId, { nombre: 'Beber agua', momento: 'manana' })
    await markHabit(habito.id, userId, HOY)

    await archivarHabito(habito)

    expect((await loadRitualManana()).habitos).toHaveLength(0)
    expect(await loadHabitos(userId)).toHaveLength(0)
    expect(await filasDe('habits')).toHaveLength(1)      // la fila sigue ahí
    expect(await filasDe('habitLogs')).toHaveLength(1)
  })
})

describe('H2 · cuadrícula de 90 días', () => {
  it('son 90 celdas, de la más antigua a hoy', () => {
    const cuadricula = cuadriculaDe([], HOY)

    expect(cuadricula).toHaveLength(90)
    expect(cuadricula.at(-1).fecha).toBe(HOY)
    expect(cuadricula[0].fecha).toBe(rangoDeCuadricula(HOY).desde)
  })

  it('marca hecho solo donde hay registro', () => {
    const cuadricula = cuadriculaDe(
      [{ fecha: HOY }, { fecha: '2026-08-03' }],
      HOY
    )

    expect(cuadricula.at(-1).hecho).toBe(true)
    expect(cuadricula.at(-2).hecho).toBe(false)   // 4 de agosto
    expect(cuadricula.at(-3).hecho).toBe(true)    // 3 de agosto
    expect(cuadricula.filter(d => d.hecho)).toHaveLength(2)
  })

  it('un día sin marca es solo eso: no existe el estado "fallado"', () => {
    const cuadricula = cuadriculaDe([], HOY)
    const estados = new Set(cuadricula.map(d => Object.keys(d).join(',')))

    expect([...estados]).toEqual(['fecha,hecho'])
    expect(cuadricula.every(d => d.hecho === false)).toBe(true)
  })

  it('cruza meses hacia atrás sin saltarse días', () => {
    const cuadricula = cuadriculaDe([], '2026-03-01', 3)
    expect(cuadricula.map(d => d.fecha)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01'])
  })

  it('el detalle cuenta los últimos 30 días y el total de siempre', async () => {
    const userId = getCurrentUserId()
    const habito = await crearHabito(userId, { nombre: 'Beber agua' })

    // Dos marcas dentro de los últimos 30 días y una muy anterior
    await markHabit(habito.id, userId, HOY)
    await markHabit(habito.id, userId, '2026-08-01')
    await markHabit(habito.id, userId, '2026-06-15')

    const conMarcas = (await filasDe('habits'))[0]
    const detalle = await loadDetalleHabito(conMarcas, HOY)

    expect(detalle.ultimos30).toBe(2)
    expect(detalle.total).toBe(3)
    expect(detalle.cuadricula.filter(d => d.hecho)).toHaveLength(3)
  })

  it('un hábito recién creado no enseña números vacíos', async () => {
    const habito = await crearHabito(getCurrentUserId(), { nombre: 'Estirar' })
    const detalle = await loadDetalleHabito(habito, HOY)

    expect(detalle.total).toBe(0)
    expect(detalle.ultimos30).toBe(0)
    expect(detalle.cuadricula.every(d => !d.hecho)).toBe(true)
  })
})

describe('etiquetas', () => {
  it('el nombre del momento sale de copy', () => {
    expect(nombreDeMomento('manana')).toBe(copy.habits.create.moments[0])
    expect(nombreDeMomento('noche')).toBe(copy.habits.create.moments[1])
  })

  it('ya no se ofrece "a lo largo del día" en ninguna parte', () => {
    expect(MOMENTOS).toEqual(['manana', 'noche'])
    expect(copy.habits.create.moments).toHaveLength(2)
    expect(copy.habits.list.groups).toHaveLength(2)
    const todoElCopy = JSON.stringify(copy)
    expect(todoElCopy).not.toContain('A lo largo del día')
  })
})
