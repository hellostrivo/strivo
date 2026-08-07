// tests/areas.test.js
// El foco: como máximo 3 áreas activas (§8.5-bis) y lo que pasa al soltar una.
// También el catálogo (§8.4) y las sugerencias por área de P4C (§10.6).

import { describe, it, expect } from 'vitest'
import { copy } from '@copy'
import {
  AREA_TYPES,
  AREAS,
  MAX_AREAS_ACTIVAS,
  LimiteDeAreasError,
  limitarAreas,
  getAreaName,
} from '@lib/areas'
import {
  saveArea,
  saveHabit,
  getAreaIdentities,
  getHabits,
  markHabit,
  getConstancia,
  updateDailyEntry,
} from '@lib/db'
import { emptyDraft } from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { filasDe, habitoDePrueba } from './helpers/db.js'

const area = (tipo, extra = {}) => ({
  id:     `u1_area_${tipo}`,
  userId: 'u1',
  tipo,
  nombre: getAreaName(tipo),
  color:  AREAS.find(a => a.tipo === tipo)?.color,
  identidadArea: null,
  estado: 'activa',
  ...extra,
})

describe('Catálogo de áreas (§8.4)', () => {
  it('siguen siendo siete: ninguna añadida, ninguna eliminada', () => {
    expect(AREA_TYPES).toHaveLength(7)
    expect(AREA_TYPES).toEqual([
      'salud', 'trabajo', 'relaciones', 'finanzas', 'espiritual', 'personal', 'creatividad',
    ])
  })

  it('cambian dos etiquetas visibles, ningún id interno', () => {
    // Los ids están referenciados en hábitos, en HabitLog y en los perfiles ya
    // guardados: renombrarlos rompería el historial.
    expect(getAreaName('espiritual')).toBe('Espiritualidad')
    expect(getAreaName('personal')).toBe('Crecimiento personal')
    expect(AREA_TYPES).toContain('espiritual')
    expect(AREA_TYPES).toContain('personal')
  })

  it('"Espiritual" y "Personal" ya no aparecen como etiqueta', () => {
    const etiquetas = AREA_TYPES.map(getAreaName)
    expect(etiquetas).not.toContain('Espiritual')
    expect(etiquetas).not.toContain('Personal')
  })
})

describe('El límite de 3 se valida en la capa de datos (§8.5-bis)', () => {
  it('deja activar tres', async () => {
    await saveArea(area('salud'))
    await saveArea(area('trabajo'))
    await saveArea(area('relaciones'))

    expect(await filasDe('areas')).toHaveLength(3)
  })

  it('rechaza la cuarta activa, venga de donde venga', async () => {
    await saveArea(area('salud'))
    await saveArea(area('trabajo'))
    await saveArea(area('relaciones'))

    await expect(saveArea(area('finanzas'))).rejects.toThrow(LimiteDeAreasError)
    expect(await filasDe('areas')).toHaveLength(3)
  })

  it('actualizar una de las tres no cuenta como una cuarta', async () => {
    await saveArea(area('salud'))
    await saveArea(area('trabajo'))
    await saveArea(area('relaciones'))

    await saveArea(area('salud', { identidadArea: 'cuida su cuerpo con cariño' }))

    const salud = (await filasDe('areas')).find(a => a.tipo === 'salud')
    expect(salud.identidadArea).toBe('cuida su cuerpo con cariño')
  })

  it('soltar un área siempre es posible, y deja sitio para otra', async () => {
    await saveArea(area('salud'))
    await saveArea(area('trabajo'))
    await saveArea(area('relaciones', { identidadArea: 'expresa lo que siente' }))

    // Soltar nunca se rechaza
    await saveArea(area('relaciones', {
      estado: 'pausada',
      identidadArea: 'expresa lo que siente',
    }))
    await saveArea(area('finanzas'))

    const areas = await filasDe('areas')
    expect(areas).toHaveLength(4)
    expect(areas.filter(a => a.estado === 'activa')).toHaveLength(MAX_AREAS_ACTIVAS)
  })

  it('soltar no borra: al reactivarla vuelve con su identidad', async () => {
    await saveArea(area('relaciones', { identidadArea: 'expresa lo que siente' }))
    await saveArea(area('relaciones', {
      estado: 'pausada',
      identidadArea: 'expresa lo que siente',
    }))

    const soltada = (await filasDe('areas')).find(a => a.tipo === 'relaciones')
    expect(soltada.identidadArea).toBe('expresa lo que siente')

    await saveArea({ ...soltada, estado: 'activa' })

    const devuelta = (await filasDe('areas')).find(a => a.tipo === 'relaciones')
    expect(devuelta).toMatchObject({
      estado: 'activa',
      identidadArea: 'expresa lo que siente',
    })
  })

  it('las identidades por área se leen por id interno, incluidas las inactivas', async () => {
    await saveArea(area('salud', { identidadArea: 'escucha lo que necesita' }))
    await saveArea(area('personal', {
      estado: 'pausada',
      identidadArea: 'aprende algo nuevo sin prisa',
    }))

    // Es el `profile.areaIdentities` de la especificación (§10.15)
    expect(await getAreaIdentities('u1')).toEqual({
      salud: 'escucha lo que necesita',
      personal: 'aprende algo nuevo sin prisa',
    })
  })

  it('limitarAreas recorta conservando el orden de elección', () => {
    expect(limitarAreas(['trabajo', 'salud', 'creatividad', 'finanzas']))
      .toEqual(['trabajo', 'salud', 'creatividad'])
  })

  it('el cierre del onboarding nunca falla por un borrador con cuatro', async () => {
    await finishOnboarding({
      ...emptyDraft,
      identidadCentral: 'crece cada día',
      areas: ['salud', 'trabajo', 'relaciones', 'finanzas'],
    })

    const areas = await filasDe('areas')
    expect(areas).toHaveLength(3)
    expect(areas.map(a => a.tipo)).not.toContain('finanzas')
  })
})

describe('Un área soltada no rompe sus hábitos (§11.2)', () => {
  it('el hábito sigue registrándose, con su constancia y su color', async () => {
    await saveArea(area('salud', { identidadArea: 'se mueve porque le hace bien' }))
    await saveHabit(habitoDePrueba({ id: 'h-caminar', areaId: 'u1_area_salud' }))

    // Dos días registrados antes de soltar el área
    await updateDailyEntry('u1', '2026-08-05', { animo: 'tranquilo' })
    await updateDailyEntry('u1', '2026-08-06', { animo: 'tranquilo' })
    await markHabit('h-caminar', 'u1', '2026-08-05')
    expect(await getConstancia('u1')).toBe(2)

    // Se suelta el área
    await saveArea(area('salud', {
      estado: 'pausada',
      identidadArea: 'se mueve porque le hace bien',
    }))

    // El hábito sigue ahí, apuntando a su área, y se puede seguir marcando
    const [habito] = await getHabits('u1')
    expect(habito.areaId).toBe('u1_area_salud')

    await markHabit('h-caminar', 'u1', '2026-08-06')
    expect(await filasDe('habitLogs')).toHaveLength(2)
    expect((await getHabits('u1'))[0].totalCompletados).toBe(2)

    // La constancia no se toca al soltar un área: nunca se reinicia
    expect(await getConstancia('u1')).toBe(2)

    // Y el color del área sigue disponible para pintar sus hábitos
    const areaSoltada = (await filasDe('areas')).find(a => a.tipo === 'salud')
    expect(areaSoltada.color).toBe(AREAS.find(a => a.tipo === 'salud').color)
  })
})

describe('Sugerencias de P4C (§10.6 y §10.7)', () => {
  const ideas = copy.onboarding.p4c.ideas

  it('las siete áreas tienen las suyas, resueltas por id interno', () => {
    for (const tipo of AREA_TYPES) {
      expect(ideas[tipo], `faltan las ideas de ${tipo}`).toBeDefined()
      expect(ideas[tipo].length).toBeGreaterThanOrEqual(3)
      expect(ideas[tipo].length).toBeLessThanOrEqual(4)
    }
  })

  it('ninguna se repite entre áreas', () => {
    const todas = AREA_TYPES.flatMap(tipo => ideas[tipo])
    expect(new Set(todas).size).toBe(todas.length)
  })

  it('cada una continúa "…alguien que" y cabe en un chip', () => {
    // La rúbrica pide entre 3 y 9 palabras (§10.7). "se trata con la misma
    // amabilidad que a los demás" tiene 10 y está confirmada tal cual en §10.6,
    // así que el tope aquí es 10: la regla vale para las que se escriban nuevas.
    for (const tipo of AREA_TYPES) {
      for (const idea of ideas[tipo]) {
        const palabras = idea.trim().split(/\s+/).length
        expect(palabras, `"${idea}"`).toBeGreaterThanOrEqual(3)
        expect(palabras, `"${idea}"`).toBeLessThanOrEqual(10)
        // Tercera persona, en minúscula: la frase ya venía empezada
        expect(idea[0]).toBe(idea[0].toLocaleLowerCase('es'))
      }
    }
  })

  it('Finanzas no habla de montos, plazos, deuda ni de controlar', () => {
    const prohibido = /\d|%|controla|deuda|presupuest|ahorra\s+\d|meta|plazo/i
    for (const idea of ideas.finanzas) {
      expect(idea, `"${idea}"`).not.toMatch(prohibido)
    }
  })

  it('ninguna lleva marca de género', () => {
    // Están en tercera persona ("cuida su cuerpo", "está presente"), así que no
    // necesitan variantes. Lo que se busca son las marcas prohibidas de §2.5:
    // barras, "elle", "@" y "x". Lo que concuerda con un sustantivo —"la misma
    // amabilidad"— no es una marca de género y no se cuenta.
    const marcaDeGenero = /\w+[oa]s?\/[oa]s?\b|\belles?\b|\w+@s?\b|\bnosotrxs?\b/i
    for (const tipo of AREA_TYPES) {
      for (const idea of ideas[tipo]) {
        expect(idea, `"${idea}"`).not.toMatch(marcaDeGenero)
      }
    }
  })
})
