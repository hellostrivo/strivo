// tests/ritualNoche.test.js
// El Ritual de Noche (§5.6): la herencia de victorias, lo que se añade y el
// cierre del día.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { copy } from '@copy'
import { saveHabit, saveUserProfile, saveVictory, getDailyEntry, markHabit } from '@lib/db'
import {
  loadRitualNoche,
  decidirVictoria,
  anadirLogro,
  guardarAgradecimientos,
  guardarAprendizaje,
  guardarAnimoCierre,
  completarRitualNoche,
  ritualNocheHecho,
  sintesisDelDia,
  fraseSintesis,
  preguntaAprendizaje,
} from '@lib/ritualNoche'
import { filasDe, habitoDePrueba, victoriaDePrueba } from './helpers/db.js'

const UNA_NOCHE = new Date(2026, 7, 5, 22, 15)   // 5 ago 2026, 22:15
const LA_MADRUGADA = new Date(2026, 7, 6, 1, 30) // 6 ago 2026, 01:30
const HOY    = '2026-08-05'
const MANANA = '2026-08-06'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(UNA_NOCHE)
})
afterEach(() => vi.useRealTimers())

async function usuario() {
  const { getCurrentUserId } = await import('@lib/user')
  return getCurrentUserId()
}

describe('abrir el ritual', () => {
  it('repasa los hábitos del día entero, noche y mañana', async () => {
    const userId = await usuario()
    await saveHabit(habitoDePrueba({ id: 'noche1', userId, momento: 'noche' }))
    await saveHabit(habitoDePrueba({ id: 'manana1', userId, momento: 'manana' }))
    await markHabit('manana1', userId, HOY)

    const datos = await loadRitualNoche()

    expect(datos.habitos.map(h => h.id).sort()).toEqual(['manana1', 'noche1'])
    expect(datos.hechos.has('manana1')).toBe(true)
  })

  it('hereda solo las victorias que siguen sin decidir', async () => {
    const userId = await usuario()
    await saveVictory(victoriaDePrueba({ id: 'v1', userId, fecha: HOY, estado: 'pendiente' }))
    await saveVictory(victoriaDePrueba({ id: 'v2', userId, fecha: HOY, estado: 'lograda' }))
    await saveVictory(victoriaDePrueba({ id: 'v3', userId, fecha: HOY, estado: 'soltada' }))

    const datos = await loadRitualNoche()

    expect(datos.heredadas.map(v => v.id)).toEqual(['v1'])
    expect(datos.logros.map(v => v.id)).toEqual(['v2'])
  })

  it('a la 1:30 sigue cerrando el día de ayer', async () => {
    vi.setSystemTime(LA_MADRUGADA)
    const userId = await usuario()
    await saveUserProfile({ userId, diaTerminaA: '03:00' })

    expect((await loadRitualNoche()).fecha).toBe(HOY)
  })
})

describe('decidir una victoria heredada', () => {
  it('"Lo lograste" la deja lograda', async () => {
    const victoria = victoriaDePrueba()
    await saveVictory(victoria)

    await decidirVictoria(victoria, 'lograda')

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0].estado).toBe('lograda')
  })

  it('"No se dio" no crea ningún registro de fallo, solo cambia el estado', async () => {
    const victoria = victoriaDePrueba()
    await saveVictory(victoria)

    await decidirVictoria(victoria, 'noSeDio')

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0].estado).toBe('no_se_dio')
  })

  it('"Pasarla a mañana" crea la de mañana y recuerda de dónde viene', async () => {
    const victoria = victoriaDePrueba()
    await saveVictory(victoria)

    await decidirVictoria(victoria, 'aManana')

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(2)

    const deManana = victorias.find(v => v.fecha === MANANA)
    expect(deManana).toMatchObject({
      texto: 'Llamar a mi hermana',
      estado: 'pendiente',
      origenId: 'v1',
    })
    // La de hoy no se borra: se queda con su decisión
    expect(victorias.find(v => v.fecha === HOY).estado).toBe('no_se_dio')
  })

  it('"Dejarla ir" la suelta sin borrarla (RN-04)', async () => {
    const victoria = victoriaDePrueba()
    await saveVictory(victoria)

    await decidirVictoria(victoria, 'soltada')

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0]).toMatchObject({ estado: 'soltada', texto: 'Llamar a mi hermana' })
  })
})

describe('logros no planeados', () => {
  it('nacen ya logrados: son algo que pasó', async () => {
    const logro = await anadirLogro('u1', HOY, 'Terminé el informe')

    expect(logro).toMatchObject({
      texto: 'Terminé el informe',
      estado: 'lograda',
      areaId: null,
      fecha: HOY,
    })
  })

  it('cada uno es una fila propia', async () => {
    await anadirLogro('u1', HOY, 'Uno')
    await anadirLogro('u1', HOY, 'Otro')

    expect(await filasDe('victories')).toHaveLength(2)
  })
})

describe('cerrar el día', () => {
  it('guarda cada bloque sin pisar los demás', async () => {
    const userId = await usuario()

    await guardarAgradecimientos(userId, HOY, ['Mi familia', 'El silencio'])
    await guardarAprendizaje(userId, HOY, 'Pedir ayuda antes')
    await guardarAnimoCierre(userId, HOY, 'tranquilo')
    await completarRitualNoche(userId, HOY)

    const entrada = await getDailyEntry(userId, HOY)
    expect(entrada).toMatchObject({
      agradecimientos: ['Mi familia', 'El silencio'],
      aprendizaje: 'Pedir ayuda antes',
      animoCierre: 'tranquilo',
    })
    expect(ritualNocheHecho(entrada)).toBe(true)
  })

  it('se cierra igual con el día en blanco', async () => {
    const userId = await usuario()
    await completarRitualNoche(userId, HOY)

    expect(ritualNocheHecho(await getDailyEntry(userId, HOY))).toBe(true)
  })
})

describe('la síntesis del cierre', () => {
  const c = copy.ritualNoche.closing
  const frase = (agradecimientos, logros) =>
    fraseSintesis(sintesisDelDia({ agradecimientos, logros }), c)

  it('un día en blanco no recibe un cero', () => {
    expect(frase([], [])).toBe(c.nothingWritten)
  })

  it('cuenta agradecimientos y logros', () => {
    expect(frase(['a', 'b', 'c'], [{}, {}])).toBe('Hoy agradeciste 3 cosas. Lograste 2.')
  })

  it('concuerda en singular', () => {
    expect(frase(['a'], [{}])).toBe('Hoy agradeciste una cosa. Lograste 1.')
  })

  it('no menciona lo que no hubo', () => {
    expect(frase([], [{}])).toBe('Hoy lograste 1.')
    expect(frase(['a', 'b'], [])).toBe('Hoy agradeciste 2 cosas.')
  })

  it('los campos en blanco no cuentan', () => {
    expect(frase(['a', '   ', ''], [])).toBe('Hoy agradeciste una cosa.')
  })
})

describe('la pregunta de la reflexión', () => {
  it('rota de un día a otro y es estable dentro del mismo', () => {
    const l = copy.diarioNoche.learning
    expect(preguntaAprendizaje(HOY, l)).toBe(preguntaAprendizaje(HOY, l))
    expect(preguntaAprendizaje(HOY, l)).not.toBe(preguntaAprendizaje(MANANA, l))
  })
})
