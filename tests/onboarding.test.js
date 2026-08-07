// tests/onboarding.test.js
// De borrador a perfil real: lo que P5 guarda antes de que haya cuenta y lo que
// P11 materializa al cerrar el flujo.

import { describe, it, expect } from 'vitest'
import {
  emptyDraft,
  loadDraft,
  saveDraft,
  savePrimeraVictoria,
  ONBOARDING_SCHEMA_VERSION,
} from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { getFlag, setFlag } from '@lib/db'
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

describe('Apertura · la bandera del dispositivo (§3.3)', () => {
  it('la primera vez no se ha visto; después sí', async () => {
    expect(await getFlag('hasSeenIntro', false)).toBe(false)

    await setFlag('hasSeenIntro', true)

    expect(await getFlag('hasSeenIntro', false)).toBe(true)
  })

  it('una bandera que no existe devuelve su valor por defecto', async () => {
    expect(await getFlag('loQueSea')).toBeNull()
    expect(await getFlag('loQueSea', 'algo')).toBe('algo')
  })
})

describe('Borrador · migración del orden viejo (§1.4)', () => {
  // Un borrador guardado con la numeración anterior (P2 motivo, P3 identidad,
  // P3B, P3C, P4 nombre). Los campos no cambian de nombre: lo que cambia es la
  // pantalla en la que se preguntan.
  const borradorViejo = {
    schemaVersion: 1,
    paso: 4,
    motivos: ['Ordenar mis emociones'],
    motivosPropios: ['Dormir en paz'],
    identidadCentral: 'crece cada día',
    areas: ['salud'],
    identidadesArea: { salud: 'cuida su cuerpo' },
    nombre: 'Alejandra',
    horaDespertar: '06:45',
  }

  it('conserva lo capturado y se queda en la versión nueva', () => {
    localStorage.setItem('strivo.onboarding.draft', JSON.stringify(borradorViejo))

    const draft = loadDraft()

    expect(draft.schemaVersion).toBe(ONBOARDING_SCHEMA_VERSION)
    expect(draft).toMatchObject({
      nombre: 'Alejandra',
      identidadCentral: 'crece cada día',
      areas: ['salud'],
      identidadesArea: { salud: 'cuida su cuerpo' },
      horaDespertar: '06:45',
    })
    // El paso guardado se descarta: con la numeración nueva apuntaría a otra
    // pantalla. Se vuelve a empezar en P1 con todo precargado.
    expect(draft.paso).toBeUndefined()
    // Campos que no existían en la versión vieja llegan con su valor de partida
    expect(draft.gender).toBeNull()
    // Los motivos viejos eran textos y ahora son ids: no hay equivalencia que
    // inventar, así que se van con su pantalla en vez de quedarse a medias.
    expect(draft.motivos).toBeUndefined()
    expect(draft.motivosPropios).toBeUndefined()
    expect(draft.reasons).toEqual([])
    expect(draft.reasonOther).toBeNull()
  })

  it('la migración se persiste, no se repite en cada arranque', () => {
    localStorage.setItem('strivo.onboarding.draft', JSON.stringify(borradorViejo))
    loadDraft()

    const guardado = JSON.parse(localStorage.getItem('strivo.onboarding.draft'))
    expect(guardado.schemaVersion).toBe(ONBOARDING_SCHEMA_VERSION)
    expect(guardado.paso).toBeUndefined()
  })

  it('un borrador de la versión vigente pasa intacto', () => {
    const actual = { ...emptyDraft, nombre: 'Alejandra', gender: 'femenino' }
    saveDraft(actual)

    expect(loadDraft()).toMatchObject({ nombre: 'Alejandra', gender: 'femenino' })
  })
})

describe('P4 · la identidad central (§7.8)', () => {
  it('la sugerencia se guarda sin el punto con el que se lee', async () => {
    // En pantalla la frase completa es "Soy alguien que cuida de sí misma.";
    // guardada con el punto, las plantillas que la interpolan cerrarían con dos
    await finishOnboarding({
      ...emptyDraft,
      identidadCentral: 'cuida de sí misma.',
      identidadCentralFuente: 'chip:cuidado',
    })

    const [perfil] = await filasDe('userProfile')
    expect(perfil.identidadCentral).toBe('cuida de sí misma')
    expect(perfil.identidadCentralFuente).toBe('chip:cuidado')
    expect(perfil.identidadCentralHistorial).toEqual([
      { texto: 'cuida de sí misma', desde: expect.any(String), hasta: null },
    ])
  })

  it('en blanco es una respuesta válida: se guarda null y sin historial', async () => {
    await finishOnboarding({ ...emptyDraft, identidadCentral: '   ' })

    const [perfil] = await filasDe('userProfile')
    expect(perfil.identidadCentral).toBeNull()
    expect(perfil.identidadCentralFuente).toBeNull()
    expect(perfil.identidadCentralHistorial).toEqual([])
  })

  it('lo escrito a mano se guarda tal cual, marcado como libre', async () => {
    await finishOnboarding({
      ...emptyDraft,
      identidadCentral: '  no se abandona  ',
      identidadCentralFuente: 'libre',
    })

    const [perfil] = await filasDe('userProfile')
    expect(perfil.identidadCentral).toBe('no se abandona')
    expect(perfil.identidadCentralFuente).toBe('libre')
  })
})

describe('P3 · lo que se vino a buscar (§6.8)', () => {
  it('el perfil guarda ids, no las etiquetas que se leyeron', async () => {
    await finishOnboarding({
      ...emptyDraft,
      identidadCentral: 'crece cada día',
      reasons: ['paz', 'sueno', 'otro'],
      reasonOther: 'Dejar de correr todo el tiempo',
    })

    const [perfil] = await filasDe('userProfile')
    expect(perfil.reasons).toEqual(['paz', 'sueno', 'otro'])
    expect(perfil.reasonOther).toBe('Dejar de correr todo el tiempo')
  })

  it('sin elegir nada, el perfil se escribe igual', async () => {
    await finishOnboarding({ ...emptyDraft, identidadCentral: 'vive con calma' })

    const [perfil] = await filasDe('userProfile')
    expect(perfil.reasons).toEqual([])
    expect(perfil.reasonOther).toBeNull()
  })

  it('"Otro" con el campo vacío guarda la opción y ningún texto', async () => {
    await finishOnboarding({
      ...emptyDraft,
      identidadCentral: 'crece',
      reasons: ['otro'],
      reasonOther: '   ',
    })

    const [perfil] = await filasDe('userProfile')
    expect(perfil.reasons).toEqual(['otro'])
    expect(perfil.reasonOther).toBeNull()
  })
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
