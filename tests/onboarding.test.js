// tests/onboarding.test.js
// De borrador a perfil real: lo que P5 guarda antes de que haya cuenta y lo que
// P11 materializa al cerrar el flujo.

import { describe, it, expect } from 'vitest'
import { emptyDraft, savePrimeraVictoria } from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { getLocalUserId, getCurrentUserId, getAccountUserId } from '@lib/user'
import { filasDe } from './helpers/db.js'

const borrador = (extra = {}) => ({
  ...emptyDraft,
  identidadCentral: 'crece cada día',
  nombre: 'Alejandra',
  areas: ['salud', 'trabajo'],
  identidadesArea: { salud: 'cuida su cuerpo' },
  horaDespertar: '06:45',
  horaDormir: '22:30',
  habitosManana: [{ id: 'hm1', texto: 'Beber agua', areaId: 'salud', momento: 'manana' }],
  habitosNoche:  [{ id: 'hn1', texto: 'Guardar el teléfono', areaId: null, momento: 'noche' }],
  ...extra,
})

describe('P5 · la primera cosa buena', () => {
  it('se guarda como victoria ya lograda, sin cuenta', async () => {
    const victoria = await savePrimeraVictoria('Salí a caminar')

    expect(victoria).toMatchObject({
      texto: 'Salí a caminar',
      estado: 'lograda',
      areaId: null,
      origen: 'onboarding',
    })
    expect(victoria.userId).toBe(getLocalUserId())
    expect(await filasDe('victories')).toHaveLength(1)
  })

  it('volver atrás y guardar otra vez actualiza la misma fila', async () => {
    await savePrimeraVictoria('Salí a caminar')
    await savePrimeraVictoria('Salí a caminar dos veces')

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0].texto).toBe('Salí a caminar dos veces')
  })
})

describe('P11 · materializar el borrador', () => {
  it('escribe perfil, áreas y hábitos con la forma de §7.2', async () => {
    const userId = await finishOnboarding(borrador())

    const [perfil] = await filasDe('userProfile')
    expect(perfil).toMatchObject({
      userId,
      nombre: 'Alejandra',
      identidadCentral: 'crece cada día',
      horaDespertar: '06:45',
      horaDormir: '22:30',
      diaTerminaA: '03:00',
    })
    expect(perfil.identidadCentralHistorial).toEqual([
      { texto: 'crece cada día', desde: expect.any(String), hasta: null },
    ])

    const areas = await filasDe('areas')
    expect(areas).toHaveLength(2)
    expect(areas.find(a => a.tipo === 'salud')).toMatchObject({
      nombre: 'Salud',
      identidadArea: 'cuida su cuerpo',
      estado: 'activa',
    })
    expect(areas.find(a => a.tipo === 'trabajo').identidadArea).toBeNull()

    const habitos = await filasDe('habits')
    expect(habitos).toHaveLength(2)
    expect(habitos.find(h => h.nombre === 'Beber agua')).toMatchObject({
      momento: 'manana',
      estado: 'activo',
      totalCompletados: 0,
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
    })
  })

  it('el hábito apunta a la fila del área, y "General" queda en null', async () => {
    const userId = await finishOnboarding(borrador())

    const habitos = await filasDe('habits')
    const conArea = habitos.find(h => h.nombre === 'Beber agua')
    const general = habitos.find(h => h.nombre === 'Guardar el teléfono')

    const salud = (await filasDe('areas')).find(a => a.tipo === 'salud')
    expect(conArea.areaId).toBe(salud.id)
    expect(general.areaId).toBeNull()
    expect(salud.id).toBe(`${userId}_area_salud`)
  })

  it('llegar dos veces a P11 no duplica nada', async () => {
    await finishOnboarding(borrador())
    await finishOnboarding(borrador())

    expect(await filasDe('userProfile')).toHaveLength(1)
    expect(await filasDe('areas')).toHaveLength(2)
    expect(await filasDe('habits')).toHaveLength(2)
  })

  it('sin áreas ni hábitos también cierra', async () => {
    const userId = await finishOnboarding({
      ...emptyDraft,
      identidadCentral: 'vive con calma',
    })

    expect(userId).toBe(getLocalUserId())
    expect(await filasDe('areas')).toHaveLength(0)
    expect(await filasDe('habits')).toHaveLength(0)
    expect((await filasDe('userProfile'))[0].recordatorios).toEqual({
      activos: false,
      permiso: 'default',
    })
  })
})

describe('P10 · lo escrito antes de la cuenta no se pierde', () => {
  it('la victoria de P5 pasa a ser del usuario de la cuenta', async () => {
    const localUserId = getLocalUserId()
    await savePrimeraVictoria('Salí a caminar')

    await finishOnboarding(borrador({
      cuenta: { uid: 'firebase-123', correo: 'hola@strivo.com', proveedor: 'correo' },
    }))

    const victorias = await filasDe('victories')
    expect(victorias).toHaveLength(1)
    expect(victorias[0]).toMatchObject({
      userId: 'firebase-123',
      texto: 'Salí a caminar',
    })
    expect(victorias[0].id).not.toContain(localUserId)
  })

  it('el id de la cuenta pasa a ser el vigente', async () => {
    await finishOnboarding(borrador({
      cuenta: { uid: 'firebase-123', correo: 'hola@strivo.com', proveedor: 'correo' },
    }))

    expect(getAccountUserId()).toBe('firebase-123')
    expect(getCurrentUserId()).toBe('firebase-123')
    expect((await filasDe('userProfile'))[0].userId).toBe('firebase-123')
  })

  it('sin cuenta, todo se queda bajo el id local', async () => {
    await savePrimeraVictoria('Salí a caminar')
    await finishOnboarding(borrador())

    expect(getAccountUserId()).toBeNull()
    expect((await filasDe('victories'))[0].userId).toBe(getLocalUserId())
  })
})
