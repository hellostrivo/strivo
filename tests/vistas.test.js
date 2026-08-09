// tests/vistas.test.js
// Las Vistas del Diario (§5.3): lo que cargan y lo que guardan bloque a bloque.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { saveHabit, saveUserProfile, saveArea, saveVictory, markHabit, getDailyEntry } from '@lib/db'
import { loadVistaManana, guardarBloque, guardarVictoria } from '@lib/vistaManana'
import { loadVistaNoche } from '@lib/vistaNoche'
import { completarRitualNoche } from '@lib/ritualNoche'
import { filasDe, habitoDePrueba, victoriaDePrueba } from './helpers/db.js'

const UNA_MANANA = new Date(2026, 7, 5, 8, 0)
const HOY = '2026-08-05'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UNA_MANANA)
})
afterEach(() => vi.useRealTimers())

async function usuario() {
  const { getCurrentUserId } = await import('@lib/user')
  return getCurrentUserId()
}

describe('Vista de Mañana · carga', () => {
  it('trae los seis bloques con lo que ya había', async () => {
    const userId = await usuario()
    await saveUserProfile({ userId, identidadCentral: 'crece cada día', diaTerminaA: '03:00' })
    await saveHabit(habitoDePrueba({ userId, momento: 'manana' }))
    await markHabit('h-agua', userId, HOY)
    await guardarBloque(userId, HOY, {
      agradecimientos: ['Mi familia'],
      emociones: ['tranquilo'],
      emocionesNecesito: 'Dormir bien',
      granDia: 'Sin prisas',
      intencion: 'Con calma',
    })

    const datos = await loadVistaManana()

    expect(datos.agradecimientos).toEqual(['Mi familia'])
    expect(datos.emociones).toEqual(['tranquilo'])
    expect(datos.emocionesNecesito).toBe('Dormir bien')
    expect(datos.granDia).toBe('Sin prisas')
    expect(datos.intencion).toBe('Con calma')
    expect(datos.hechos.has('h-agua')).toBe(true)
  })

  it('solo ofrece las áreas activas para colocar victorias', async () => {
    const userId = await usuario()
    await saveArea({ id: 'a1', userId, tipo: 'salud', nombre: 'Salud', estado: 'activa' })
    await saveArea({ id: 'a2', userId, tipo: 'trabajo', nombre: 'Trabajo', estado: 'pausada' })

    const datos = await loadVistaManana()
    expect(datos.areas.map(a => a.tipo)).toEqual(['salud'])
  })

  it('un día en blanco no rompe nada', async () => {
    const datos = await loadVistaManana()

    expect(datos.agradecimientos).toEqual([])
    expect(datos.emociones).toEqual([])
    expect(datos.victorias).toEqual([])
    expect(datos.granDia).toBe('')
  })
})

describe('Vista de Mañana · victorias', () => {
  it('nacen pendientes, que es lo que hereda la noche', async () => {
    const fila = await guardarVictoria('u1', HOY, { texto: '  Llamar a mi hermana  ', areaId: 'a1' })

    expect(fila).toMatchObject({
      texto: 'Llamar a mi hermana',   // recortada
      estado: 'pendiente',
      areaId: 'a1',
      fecha: HOY,
    })
  })

  it('editarla actualiza la misma fila, no crea otra', async () => {
    const primera = await guardarVictoria('u1', HOY, { texto: 'Llamar', areaId: null })
    await guardarVictoria('u1', HOY, { ...primera, texto: 'Llamar a mi hermana' })

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0].texto).toBe('Llamar a mi hermana')
  })

  it('cambiar el área conserva el texto y la fila', async () => {
    const primera = await guardarVictoria('u1', HOY, { texto: 'Caminar', areaId: null })
    await guardarVictoria('u1', HOY, { ...primera, areaId: 'a-salud' })

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0]).toMatchObject({ texto: 'Caminar', areaId: 'a-salud' })
  })

  it('vaciar el texto la suelta en vez de borrarla (RN-04)', async () => {
    const primera = await guardarVictoria('u1', HOY, { texto: 'Caminar', areaId: null })
    const resultado = await guardarVictoria('u1', HOY, { ...primera, texto: '   ' })

    expect(resultado).toBeNull()
    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0].estado).toBe('soltada')
  })

  it('un campo vacío que nunca se guardó no crea nada', async () => {
    expect(await guardarVictoria('u1', HOY, { texto: '  ' })).toBeNull()
    expect(await filasDe('victories')).toHaveLength(0)
  })
})

describe('Vista de Noche · carga', () => {
  it('el checklist es solo de hábitos de noche', async () => {
    const userId = await usuario()
    await saveHabit(habitoDePrueba({ id: 'noche1', userId, momento: 'noche' }))
    await saveHabit(habitoDePrueba({ id: 'manana1', userId, momento: 'manana' }))

    const datos = await loadVistaNoche()
    expect(datos.habitos.map(h => h.id)).toEqual(['noche1'])
  })

  it('separa lo heredado de lo ya logrado', async () => {
    const userId = await usuario()
    await saveVictory(victoriaDePrueba({ id: 'v1', userId, estado: 'pendiente' }))
    await saveVictory(victoriaDePrueba({ id: 'v2', userId, estado: 'lograda' }))
    await saveVictory(victoriaDePrueba({ id: 'v3', userId, estado: 'soltada' }))

    const datos = await loadVistaNoche()
    expect(datos.heredadas.map(v => v.id)).toEqual(['v1'])
    expect(datos.logros.map(v => v.id)).toEqual(['v2'])
  })

  it('sabe si el día ya está cerrado, para no volver a pedirlo', async () => {
    const userId = await usuario()
    expect((await loadVistaNoche()).diaCerrado).toBe(false)

    await completarRitualNoche(userId, HOY)
    expect((await loadVistaNoche()).diaCerrado).toBe(true)
  })
})

describe('los bloques no se pisan entre sí', () => {
  it('escribir de mañana y de noche deja una sola entrada del día', async () => {
    const userId = await usuario()

    await guardarBloque(userId, HOY, { granDia: 'Sin prisas' })
    await guardarBloque(userId, HOY, { agradecimientos: ['Mi familia'] })
    await guardarBloque(userId, HOY, { animoCierre: 'tranquilo' })

    expect(await filasDe('dailyEntries')).toHaveLength(1)
    expect(await getDailyEntry(userId, HOY)).toMatchObject({
      granDia: 'Sin prisas',
      agradecimientos: ['Mi familia'],
      animoCierre: 'tranquilo',
    })
  })
})
