// src/diario/__tests__/diario.test.js
// El día: lectura, escritura y síntesis de cierre (§5.3, §5.4).

import { beforeEach, describe, expect, it } from 'vitest'

// La rama de datos se llama `diario` desde el renombrado del paso 9, y este
// archivo ya usaba ese nombre para el módulo que prueba. Se le da alias: `db`
// es la capa de datos y `diario` la lógica del día que se apoya en ella.
import { initUserTree, diario as db, shared } from '@/lib/db'
import { UID, resetLocalDB } from '../../lib/db/__tests__/helpers.js'
import * as diario from '../diario.js'
import {
  animoBajoReciente,
  cargarDia,
  guardarManana,
  guardarNoche,
  mananaEscrita,
  nocheEscrita,
} from '../diario.js'

const HOY = '2026-08-10'

describe('el día', () => {
  beforeEach(resetLocalDB)

  it('carga el día entero en una sola lectura, con perfil y frase', async () => {
    await initUserTree(UID, {
      identityCentral: 'alguien que crece',
      profile: { name: 'Mariana', gender: 'f' },
    })
    await guardarManana(UID, HOY, { gratitude: ['el café'] })

    const dia = await cargarDia(UID, HOY)
    expect(dia.fecha).toBe(HOY)
    expect(dia.nombre).toBe('Mariana')
    expect(dia.genero).toBe('f')
    expect(dia.morning.gratitude).toEqual(['el café'])
    expect(dia.frase.texto).toBeTruthy()
  })

  it('un día sin nada escrito se lee vacío, no se inventa un registro', async () => {
    await initUserTree(UID, { identityCentral: 'alguien que crece' })
    const dia = await cargarDia(UID, HOY)
    expect(dia.morning).toBeNull()
    expect(dia.night).toBeNull()
    expect(await db.getMorningEntry(UID, HOY)).toBeNull()
  })

  it('guarda por bloques: escribir uno no borra los demás', async () => {
    await guardarManana(UID, HOY, { gratitude: ['uno'] })
    await guardarManana(UID, HOY, { action: 'salir a caminar' })
    const morning = await db.getMorningEntry(UID, HOY)
    expect(morning).toEqual({ gratitude: ['uno'], action: 'salir a caminar' })
  })

  it('no persiste el ánimo derivado: es una vista, no un dato (§5.4.1)', async () => {
    await guardarNoche(UID, HOY, { closingFeeling: 'cansado' })
    expect(await db.getDayState(UID, HOY)).toBeNull()
    expect(await db.getNightRitual(UID, HOY)).toEqual({ closingFeeling: 'cansado' })
  })

  it('el estado de sueño se fue con su pregunta: ya no hay quien lo escriba', () => {
    expect(diario.guardarEstadoSueno).toBeUndefined()
  })

  it('la síntesis de cierre se retiró: §10 prohíbe los recuentos', () => {
    // "Hoy encontraste 2 cosas que agradecer" era una nota al final del día.
    expect(diario.sintesisDelDia).toBeUndefined()
    expect(diario.recuentoDelDia).toBeUndefined()
  })

  it('reconoce si la mañana y la noche tienen algo escrito', async () => {
    expect(mananaEscrita(null)).toBe(false)
    expect(mananaEscrita({ gratitude: [] })).toBe(false)
    expect(mananaEscrita({ feeling: 'calma' })).toBe(true)
    expect(mananaEscrita({ action: 'salir a caminar' })).toBe(true)
    // Un día de la versión anterior sigue contando como día con algo escrito.
    expect(mananaEscrita({ emotions: ['en_paz'] })).toBe(true)
    expect(mananaEscrita({ granVision: 'un día sin prisa' })).toBe(true)

    expect(nocheEscrita(null)).toBe(false)
    expect(nocheEscrita({})).toBe(false)
    expect(nocheEscrita({ recognized: ['aguanté el día'] })).toBe(true)
    expect(nocheEscrita({ closingFeeling: 'cansado' })).toBe(true)
    expect(nocheEscrita({ reflection: 'me costó' })).toBe(true)
    expect(nocheEscrita({ release: 'la conversación pendiente' })).toBe(true)
    // Una noche de la versión anterior sigue contando como noche con algo escrito.
    expect(nocheEscrita({ sleepState: ['en_paz'] })).toBe(true)
    expect(nocheEscrita({ gratitude: ['el café'] })).toBe(true)
    expect(nocheEscrita({ learning: 'que se puede pedir ayuda' })).toBe(true)
  })

  describe('frase del día y ánimo reciente', () => {
    it('sin registros previos, el ánimo no se da por bajo', async () => {
      expect(await animoBajoReciente(UID, HOY)).toBe(false)
    })

    it('tres noches pesadas seguidas retiran las frases de esfuerzo', async () => {
      await guardarNoche(UID, '2026-08-09', { closingFeeling: 'cansado' })
      await guardarNoche(UID, '2026-08-08', { closingFeeling: 'triste' })
      await guardarNoche(UID, '2026-08-07', { closingFeeling: 'abrumado' })
      expect(await animoBajoReciente(UID, HOY)).toBe(true)

      const dia = await cargarDia(UID, HOY)
      expect(dia.frase.tema).not.toBe('esfuerzo')
    })

    it('una noche buena entre medias y el repertorio vuelve entero', async () => {
      await guardarNoche(UID, '2026-08-09', { closingFeeling: 'cansado' })
      await guardarNoche(UID, '2026-08-08', { closingFeeling: 'en_paz' })
      expect(await animoBajoReciente(UID, HOY)).toBe(false)
    })
  })

  it('funciona sin perfil: nadie tiene que declarar género ni nombre', async () => {
    const dia = await cargarDia(UID, HOY)
    expect(dia.nombre).toBeNull()
    expect(dia.genero).toBe('n')
    expect(await shared.getProfile(UID)).toBeNull()
  })
})
