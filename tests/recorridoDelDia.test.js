// tests/recorridoDelDia.test.js
// El recorrido completo, tal como lo vive una persona: onboarding, mañana,
// noche y la mañana siguiente. Es la prueba que cuida las costuras entre
// módulos — que lo escrito en un sitio aparezca donde toca en el otro.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { copy } from '@copy'
import { emptyDraft } from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { getCurrentUserId } from '@lib/user'
import { markHabit } from '@lib/db'
import { loadRitualManana, completarRitualManana } from '@lib/ritualManana'
import { loadVistaManana, guardarBloque, guardarVictoria } from '@lib/vistaManana'
import {
  loadRitualNoche,
  decidirVictoria,
  anadirLogro,
  guardarAgradecimientos,
  guardarAnimoCierre,
  completarRitualNoche,
  sintesisDelDia,
  fraseSintesis,
} from '@lib/ritualNoche'
import { filasDe } from './helpers/db.js'

const DIA_1_MANANA = new Date(2026, 7, 5, 7, 30)
const DIA_1_NOCHE  = new Date(2026, 7, 5, 22, 15)
const DIA_2_MANANA = new Date(2026, 7, 6, 7, 30)
const DIA_1 = '2026-08-05'
const DIA_2 = '2026-08-06'

beforeEach(() => vi.useFakeTimers({ toFake: ['Date'] }))
afterEach(() => vi.useRealTimers())

const borrador = {
  ...emptyDraft,
  identidadCentral: 'crece cada día',
  nombre: 'Alejandra',
  areas: ['salud'],
  identidadesArea: { salud: 'cuida su cuerpo' },
  horaDespertar: '06:45',
  horaDormir: '22:30',
  habitosManana: [{ id: 'hm1', texto: 'Beber agua', areaId: 'salud', momento: 'manana' }],
  habitosNoche:  [{ id: 'hn1', texto: 'Guardar el teléfono', areaId: null, momento: 'noche' }],
}

describe('un día entero en Strivo', () => {
  it('lo escrito por la mañana llega a la noche, y la noche llega al día siguiente', async () => {
    // ── Onboarding ────────────────────────────────────────────────────────
    vi.setSystemTime(DIA_1_MANANA)
    const userId = await finishOnboarding(borrador)
    expect(userId).toBe(getCurrentUserId())

    // ── Día 1, mañana: el ritual encuentra su hábito ──────────────────────
    const manana = await loadRitualManana()
    expect(manana.fecha).toBe(DIA_1)
    expect(manana.habitos.map(h => h.nombre)).toEqual(['Beber agua'])
    expect(manana.diaDificil).toBe(false)
    // El área del día sale de lo que la persona eligió cultivar
    expect(manana.areaDelDia.tipo).toBe('salud')
    expect(manana.areaDelDia.identidadArea).toBe('cuida su cuerpo')

    await markHabit(manana.habitos[0].id, userId, DIA_1)
    await completarRitualManana(userId, DIA_1, 'Con calma')

    // ── Día 1, mañana: la Vista recoge lo del ritual ──────────────────────
    const vistaManana = await loadVistaManana()
    expect(vistaManana.intencion).toBe('Con calma')
    expect(vistaManana.hechos.has(manana.habitos[0].id)).toBe(true)

    await guardarBloque(userId, DIA_1, { agradecimientos: ['Mi familia'] })
    const areaSalud = vistaManana.areas[0]
    await guardarVictoria(userId, DIA_1, { texto: 'Llamar a mi hermana', areaId: areaSalud.id })
    await guardarVictoria(userId, DIA_1, { texto: 'Salir a caminar', areaId: null })

    // ── Día 1, noche: hereda lo que se propuso por la mañana ──────────────
    vi.setSystemTime(DIA_1_NOCHE)
    const noche = await loadRitualNoche()

    expect(noche.fecha).toBe(DIA_1)
    expect(noche.heredadas.map(v => v.texto).sort()).toEqual(
      ['Llamar a mi hermana', 'Salir a caminar']
    )
    // Los agradecimientos de la mañana ya están escritos, no se piden de nuevo
    expect(noche.agradecimientos).toEqual(['Mi familia'])
    // El checklist repasa el día entero
    expect(noche.habitos.map(h => h.nombre).sort()).toEqual(['Beber agua', 'Guardar el teléfono'])
    expect(noche.hechos.has(manana.habitos[0].id)).toBe(true)

    // ── Día 1, noche: se decide, se añade y se cierra ─────────────────────
    const llamar  = noche.heredadas.find(v => v.texto === 'Llamar a mi hermana')
    const caminar = noche.heredadas.find(v => v.texto === 'Salir a caminar')

    await decidirVictoria(llamar, 'lograda')
    await decidirVictoria(caminar, 'aManana')
    await anadirLogro(userId, DIA_1, 'Terminé el informe')
    await guardarAgradecimientos(userId, DIA_1, ['Mi familia', 'El silencio'])
    await guardarAnimoCierre(userId, DIA_1, 'cansado')
    await completarRitualNoche(userId, DIA_1)

    // La síntesis cuenta lo que hubo: 2 agradecimientos, 2 logros
    const cerrado = await loadRitualNoche()
    const sintesis = sintesisDelDia({
      agradecimientos: cerrado.agradecimientos,
      logros: cerrado.logros,
    })
    expect(fraseSintesis(sintesis, copy.ritualNoche.closing))
      .toBe('Hoy agradeciste 2 cosas. Lograste 2.')

    // ── Día 2, mañana: la noche de ayer se nota ───────────────────────────
    vi.setSystemTime(DIA_2_MANANA)
    const manana2 = await loadRitualManana()

    expect(manana2.fecha).toBe(DIA_2)
    // Ayer se cerró cansado: R2 saluda distinto
    expect(manana2.diaDificil).toBe(true)
    // El día empieza limpio: ningún hábito arrastra la marca de ayer
    expect(manana2.hechos.size).toBe(0)
    expect(manana2.intencion).toBe('')

    // Lo que se pasó a mañana espera en la Vista, y con su origen anotado
    const vistaManana2 = await loadVistaManana()
    expect(vistaManana2.victorias.map(v => v.texto)).toEqual(['Salir a caminar'])
    expect(vistaManana2.victorias[0].origenId).toBe(caminar.id)

    // Y nada de lo escrito se perdió por el camino
    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(4)   // 2 de la mañana + 1 logro + 1 pasada a mañana
    expect(victorias.filter(v => v.estado === 'lograda')).toHaveLength(2)
    expect(victorias.filter(v => v.estado === 'pendiente')).toHaveLength(1)
  })

  it('un día en el que solo se abrió la app también cuenta', async () => {
    vi.setSystemTime(DIA_1_NOCHE)
    const userId = await finishOnboarding(borrador)

    await completarRitualNoche(userId, DIA_1)

    const datos = await loadRitualNoche()
    const sintesis = sintesisDelDia({
      agradecimientos: datos.agradecimientos,
      logros: datos.logros,
    })

    expect(fraseSintesis(sintesis, copy.ritualNoche.closing))
      .toBe(copy.ritualNoche.closing.nothingWritten)
    expect(await filasDe('habitLogs')).toHaveLength(0)
  })

  it('marcar en el ritual y marcar en la Vista son la misma marca (RN-01)', async () => {
    vi.setSystemTime(DIA_1_MANANA)
    const userId = await finishOnboarding(borrador)

    const { habitos } = await loadRitualManana()
    await markHabit(habitos[0].id, userId, DIA_1)

    expect((await loadVistaManana()).hechos.has(habitos[0].id)).toBe(true)

    vi.setSystemTime(DIA_1_NOCHE)
    expect((await loadRitualNoche()).hechos.has(habitos[0].id)).toBe(true)
  })
})
