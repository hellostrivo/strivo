// src/onboarding/__tests__/estado.test.js
// Qué del recorrido llega al árbol de datos, y qué se pinta al final.
//
// Las dos comprobaciones que importan aquí: que lo dejado en blanco se guarde
// como respuesta y no como hueco, y que el cierre diga **una sola cosa** —el
// saludo, en el género de quien lo lee— y no arme una frase con nada más.

import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FIELDS } from '@/lib/db/schema'
import { ORDEN, PASOS, VERSION } from '../pasos.js'
import {
  RESPUESTAS_INICIALES,
  anotarPaso,
  bienvenidaDe,
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
    const enBlanco = perfilDesde({ ...RESPUESTAS_INICIALES, nombre: '   ' })
    expect(enBlanco.name).toBeNull()
    // Sin contestar, el género es el neutro y no la ausencia de género.
    expect(enBlanco.gender).toBe('n')
  })

  it('la identidad central ya no se escribe: la que haya guardada se queda quieta', () => {
    // P4 salió del recorrido, así que nadie vuelve a poner esa frase. El campo
    // sigue en el modelo para poder leer un perfil viejo (RN-DB-04), pero no
    // aparece en el parche: `updateProfile` fusiona, y un `null` aquí borraría
    // lo que alguien escribió en la versión anterior.
    expect(perfilDesde(CONTESTADO)).not.toHaveProperty('identidadCentral')
    expect(RESPUESTAS_INICIALES).not.toHaveProperty('identidad')
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
  it('saluda por el nombre, en el género que se eligió', () => {
    expect(bienvenidaDe(textos.p8, { nombre: 'Alejandra', genero: 'f' })).toBe(
      'Bienvenida, Alejandra',
    )
    expect(bienvenidaDe(textos.p8, { nombre: 'Alejandro', genero: 'm' })).toBe(
      'Bienvenido, Alejandro',
    )
    expect(bienvenidaDe(textos.p8, { nombre: 'Alex', genero: 'n' })).toBe(
      'Te damos la bienvenida, Alex',
    )
  })

  it('sin género declarado saluda en neutro, que es lo que vale sin contestar', () => {
    expect(bienvenidaDe(textos.p8, { nombre: 'Alex' })).toBe('Te damos la bienvenida, Alex')
    expect(bienvenidaDe(textos.p8, { nombre: 'Alex', genero: null })).toBe(
      'Te damos la bienvenida, Alex',
    )
  })

  it('el nombre se limpia de espacios antes de saludar', () => {
    expect(bienvenidaDe(textos.p8, { nombre: '  Alejandra  ', genero: 'f' })).toBe(
      'Bienvenida, Alejandra',
    )
  })

  it('sin nombre saluda igual: sin coma colgando, sin hueco y sin señalar nada', () => {
    ;[{}, { nombre: '' }, { nombre: '   ' }, { nombre: null }].forEach((respuesta) => {
      const saludo = bienvenidaDe(textos.p8, { ...respuesta, genero: 'f' })
      expect(saludo).toBe('Bienvenida')
      expect(saludo).not.toMatch(/,\s*$|\{nombre\}/)
      expect(saludo).not.toMatch(/falta|incompleto|sin responder|pendiente/i)
    })
  })

  it('no queda una segunda frase que explique el saludo', () => {
    // Un saludo y un botón. La frase con la identidad central se fue con la
    // pantalla que la preguntaba, y la hora de la vuelta con ella.
    expect(textos.p8.closingTemplate).toBeUndefined()
    expect(textos.p8.closingPlain).toBeUndefined()
    expect(textos.p8.nextTemplate).toBeUndefined()
    expect(Object.keys(textos.p8)).toEqual(['welcomeTemplate', 'welcomePlain', 'ctaLabel'])
  })

  it('nunca intenta interpolar áreas ni identidad, porque no existen', () => {
    ;['f', 'm', 'n'].forEach((genero) => {
      const saludo = bienvenidaDe(textos.p8, { nombre: 'Alex', genero })
      expect(saludo).not.toMatch(/\{areas\}|\{identidad\}/)
      expect(saludo).not.toMatch(/[áa]rea/i)
    })
    expect(textos.p8.closingWithAreas).toBeUndefined()
    expect(textos.p8.closingPlainWithAreas).toBeUndefined()
    expect(textos.p8.areasJoin).toBeUndefined()
  })
})
