// src/lumia/__tests__/diario.test.js
// El día de Lumia: lectura, escritura y síntesis de cierre (§5.3, §5.4).

import { beforeEach, describe, expect, it } from 'vitest'

import { initUserTree, lumia, shared } from '@/lib/db'
import { UID, resetLocalDB } from '../../lib/db/__tests__/helpers.js'
import {
  animoBajoReciente,
  cargarDia,
  guardarEstadoSueno,
  guardarManana,
  mananaEscrita,
  nocheEscrita,
  recuentoDelDia,
  sintesisDelDia,
} from '../diario.js'
import { guardarFilas } from '../victorias.js'

const HOY = '2026-08-10'

describe('el día de Lumia', () => {
  beforeEach(resetLocalDB)

  it('carga el día entero en una sola lectura, con perfil y frase', async () => {
    await initUserTree(UID, { identityCentral: 'alguien que crece', profile: { name: 'Mariana', gender: 'f' } })
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
    expect(dia.victorias).toEqual([])
    expect(await lumia.getMorningEntry(UID, HOY)).toBeNull()
  })

  it('guarda por bloques: escribir uno no borra los demás', async () => {
    await guardarManana(UID, HOY, { gratitude: ['uno'] })
    await guardarManana(UID, HOY, { granVision: 'un día sin prisa' })
    const morning = await lumia.getMorningEntry(UID, HOY)
    expect(morning).toEqual({ gratitude: ['uno'], granVision: 'un día sin prisa' })
  })

  it('no persiste el ánimo derivado: es una vista, no un dato (§5.4.1)', async () => {
    await guardarEstadoSueno(UID, HOY, ['cansado'], '')
    expect(await lumia.getDayState(UID, HOY)).toBeNull()
    expect(await lumia.getNightRitual(UID, HOY)).toEqual({
      sleepState: ['cansado'],
      sleepStateOther: null,
    })
  })

  it('reconoce si la mañana y la noche tienen algo escrito', async () => {
    expect(mananaEscrita(null)).toBe(false)
    expect(mananaEscrita({ gratitude: [] })).toBe(false)
    expect(mananaEscrita({ emotions: ['en_paz'] })).toBe(true)

    expect(nocheEscrita(null, [])).toBe(false)
    expect(nocheEscrita({ sleepState: ['en_paz'] }, [])).toBe(true)
    expect(nocheEscrita(null, [{ state: 'lograda' }])).toBe(true)
  })

  describe('síntesis de cierre', () => {
    it('cuenta victorias logradas y logros no planeados', () => {
      const night = { newWins: ['ayudé a alguien'], gratitude: ['el café', 'la tarde'] }
      const victorias = [{ state: 'lograda' }, { state: 'pendiente' }]
      expect(recuentoDelDia(night, victorias)).toEqual({ logros: 2, gracias: 2 })
      expect(sintesisDelDia(night, victorias)).toBe('Hoy reconociste 2 logros y agradeciste 2 cosas.')
    })

    it('concuerda el singular', () => {
      expect(sintesisDelDia({ gratitude: ['el café'] }, [{ state: 'lograda' }])).toBe(
        'Hoy reconociste un logro y agradeciste una cosa.',
      )
    })

    it('solo agradecimientos, solo logros', () => {
      expect(sintesisDelDia({ gratitude: ['uno', 'dos'] }, [])).toBe(
        'Hoy encontraste 2 cosas que agradecer.',
      )
      expect(sintesisDelDia(null, [{ state: 'lograda' }, { state: 'lograda' }])).toBe(
        'Hoy reconociste 2 logros que lograste.',
      )
    })

    it('con el día en blanco, el cierre funciona igual', () => {
      expect(sintesisDelDia(null, [])).toBe('Hoy solo viniste. También cuenta.')
    })

    it('cierra bien un día escrito de principio a fin', async () => {
      const victorias = await guardarFilas(
        UID,
        HOY,
        [{ id: null, texto: 'caminar' }],
        'lograda',
      )
      await guardarEstadoSueno(UID, HOY, ['en_paz'], '')
      const dia = await cargarDia(UID, HOY)
      expect(sintesisDelDia(dia.night, victorias)).toBe('Hoy reconociste un logro que lograste.')
    })
  })

  describe('frase del día y ánimo reciente', () => {
    it('sin registros previos, el ánimo no se da por bajo', async () => {
      expect(await animoBajoReciente(UID, HOY)).toBe(false)
    })

    it('tres noches pesadas seguidas retiran las frases de esfuerzo', async () => {
      await guardarEstadoSueno(UID, '2026-08-09', ['cansado'], '')
      await guardarEstadoSueno(UID, '2026-08-08', ['inquieto'], '')
      await guardarEstadoSueno(UID, '2026-08-07', ['cansado'], '')
      expect(await animoBajoReciente(UID, HOY)).toBe(true)

      const dia = await cargarDia(UID, HOY)
      expect(dia.frase.tema).not.toBe('esfuerzo')
    })

    it('una noche buena entre medias y el repertorio vuelve entero', async () => {
      await guardarEstadoSueno(UID, '2026-08-09', ['cansado'], '')
      await guardarEstadoSueno(UID, '2026-08-08', ['en_paz'], '')
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
