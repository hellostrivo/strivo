// src/onboarding/__tests__/estado.test.js
// Qué del recorrido llega al árbol de datos, y qué se pinta al final.
//
// Las dos comprobaciones que importan aquí: que lo dejado en blanco se guarde
// como respuesta y no como hueco, y que el cierre **no arme nunca una frase con
// áreas**, que es lo que este spec vino a evitar.

import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FIELDS } from '@/lib/db/schema'
import { ORDEN, PASOS, VERSION } from '../pasos.js'
import {
  RESPUESTAS_INICIALES,
  anotarPaso,
  cierreDe,
  expedienteDe,
  motivoDesde,
  perfilDesde,
} from '../estado.js'

const textos = copy.diario.onboarding

const CONTESTADO = {
  ...RESPUESTAS_INICIALES,
  nombre: '  Alejandra  ',
  genero: 'femenino',
  motivos: ['paz', 'otro'],
  motivoOtro: 'dormir mejor',
  identidad: 'cuida de sí misma.',
  despertar: '6:30',
  dormir: '23:15',
}

describe('lo que se escribe en el perfil', () => {
  it('cada campo va a su sitio del modelo canónico', () => {
    const perfil = perfilDesde(CONTESTADO)
    Object.keys(perfil).forEach((campo) => expect(FIELDS.profile).toContain(campo))
  })

  it('el nombre se limpia de espacios y el género se resuelve al modelo', () => {
    const perfil = perfilDesde(CONTESTADO)
    expect(perfil.name).toBe('Alejandra')
    expect(perfil.gender).toBe('f')
  })

  it('las horas se normalizan a "HH:MM"', () => {
    expect(perfilDesde(CONTESTADO).wakeTime).toBe('06:30')
    expect(perfilDesde(CONTESTADO).sleepTime).toBe('23:15')
  })

  it('lo dejado en blanco se guarda como respuesta, no como hueco', () => {
    const enBlanco = perfilDesde({ ...RESPUESTAS_INICIALES, nombre: '   ', identidad: '' })
    expect(enBlanco.name).toBeNull()
    expect(enBlanco.identidadCentral).toBeNull()
    // Sin contestar, el género es el neutro y no la ausencia de género.
    expect(enBlanco.gender).toBe('n')
  })

  it('el perfil no lleva ni un campo de áreas', () => {
    const perfil = perfilDesde(CONTESTADO)
    Object.keys(perfil).forEach((campo) => expect(campo).not.toMatch(/[áa]rea/i))
    expect(FIELDS.profile).not.toContain('areas')
    expect(FIELDS.profile).not.toContain('identidadPorArea')
  })

  it('`diaTerminaA` no se toca desde aquí', () => {
    // Dormirse a las dos no es querer que el día cambie de fecha a las dos.
    expect(perfilDesde(CONTESTADO).diaTerminaA).toBeUndefined()
  })
})

describe('lo que se escribe en el expediente', () => {
  it('el motivo va con sus dos campos y ninguno más', () => {
    const motivo = motivoDesde(CONTESTADO)
    expect(motivo).toEqual({ motivos: ['paz', 'otro'], motivoOtro: 'dormir mejor' })
    Object.keys(motivo).forEach((campo) => expect(FIELDS.onboarding).toContain(campo))
  })

  it('los pasos recorridos se anotan sin duplicar y en el orden del recorrido', () => {
    expect(anotarPaso(['p3', 'p1'], 'p2')).toEqual(['p1', 'p2', 'p3'])
    expect(anotarPaso(['p1'], 'p1')).toEqual(['p1'])
  })

  it('el expediente lleva la versión y por dónde va, y no la marca de cierre', () => {
    const expediente = expedienteDe(PASOS.horarios, ['p1'])
    expect(expediente.version).toBe(VERSION)
    expect(expediente.currentStep).toBe('p5')
    expect(expediente.completedSteps).toEqual(['p1', 'p5'])
    // `completedAt` lo escribe el final del recorrido y solo él (RN-DB-09).
    expect(expediente.completedAt).toBeUndefined()
    Object.keys(expediente).forEach((campo) => expect(FIELDS.onboarding).toContain(campo))
  })

  it('el sub-paso también se anota: se pasó por él', () => {
    expect(anotarPaso([], PASOS.genero)).toEqual(['p2a'])
    expect(ORDEN).toContain('p2a')
  })
})

describe('el cierre (P8)', () => {
  it('con identidad, la frase la lleva dentro y sin doble punto', () => {
    const { frase } = cierreDe(textos.p8, { identidad: 'cuida de sí misma.' })
    expect(frase).toBe('Te estás convirtiendo en alguien que cuida de sí misma.')
    expect(frase).not.toMatch(/\.\./)
  })

  it('sin identidad, dice otra cosa y no señala lo que falta', () => {
    const { frase } = cierreDe(textos.p8, { identidad: null })
    expect(frase).toBe(textos.p8.closingPlain)
    expect(frase).not.toMatch(/falta|incompleto|sin responder|pendiente/i)
  })

  it('nunca intenta interpolar áreas, porque no existen', () => {
    const conYSin = [
      cierreDe(textos.p8, { identidad: 'vive con intención' }),
      cierreDe(textos.p8, {}),
    ]
    conYSin.forEach(({ frase }) => {
      expect(frase).not.toMatch(/\{areas\}|\{identidad\}/)
      expect(frase).not.toMatch(/[áa]rea/i)
    })
    expect(textos.p8.closingWithAreas).toBeUndefined()
    expect(textos.p8.closingPlainWithAreas).toBeUndefined()
    expect(textos.p8.areasJoin).toBeUndefined()
  })

  it('la hora de la vuelta solo aparece si hay hora que decir', () => {
    expect(cierreDe(textos.p8, { despertar: '07:00' }).proxima).toBe(
      'Nos vemos mañana a las 07:00.',
    )
    expect(cierreDe(textos.p8, { despertar: '' }).proxima).toBeNull()
    expect(cierreDe(textos.p8, {}).proxima).toBeNull()
  })
})
