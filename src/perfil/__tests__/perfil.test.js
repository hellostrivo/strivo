// src/perfil/__tests__/perfil.test.js
// Tu perfil: qué bloques hay y qué escribe cada uno.
//
// Lo que más importa aquí no es la lista de hoy, es que la lista **sea** la
// costura: que ningún bloque pueda declararse sin texto, y que lo que la
// pantalla escribe siga cabiendo entero en `shared/profile`. Las fases
// siguientes traen plan y suscripción, y esta prueba es la que va a avisar si
// alguien los añade a medias.

import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FIELDS, GENDERS } from '@/lib/db/schema'
import { BLOQUES, es } from '../bloques.js'
import { generoDe, opcionDe, OPCIONES } from '@/onboarding/genero'
import { perfilDesde } from '@/onboarding/estado'

const textos = copy.diario.perfil

describe('los bloques del perfil', () => {
  it('son los tres de esta fase, en su orden', () => {
    expect(BLOQUES).toEqual(['nombre', 'genero', 'horarios'])
  })

  it('la identidad central salió del perfil con el paso que la preguntaba', () => {
    expect(BLOQUES).not.toContain('identidad')
    expect(es('identidad')).toBe(false)
    expect(textos.identidad).toBeUndefined()
  })

  it('cada bloque declarado tiene su texto: no se puede añadir a medias', () => {
    BLOQUES.forEach((id) => {
      expect(textos[id], `falta copy.diario.perfil.${id}`).toBeDefined()
      expect(typeof textos[id].titulo).toBe('string')
    })
  })

  it('lo que no está declarado no es un bloque', () => {
    expect(es('nombre')).toBe(true)
    expect(es('plan')).toBe(false)
    expect(es('suscripcion')).toBe(false)
  })

  it('la pantalla se anuncia con su nombre y no promete lo que no hay', () => {
    expect(textos.titulo).toBe('Tu perfil')
    const cadenas = JSON.stringify(textos)
    expect(cadenas).not.toMatch(/pr[óo]ximamente|muy pronto|disponible pronto/i)
  })
})

describe('lo que el perfil escribe', () => {
  const valores = {
    nombre: 'Alejandra',
    genero: 'femenino',
    despertar: '06:30',
    dormir: '23:15',
  }

  it('cada campo cabe en el modelo canónico', () => {
    Object.keys(perfilDesde(valores)).forEach((campo) => expect(FIELDS.profile).toContain(campo))
  })

  it('escribe exactamente los mismos campos que el onboarding', () => {
    // Es la misma función y ese es el punto: el perfil no es un segundo sitio
    // donde se decide cómo se guarda una respuesta, es el sitio donde se vuelve
    // a preguntar.
    expect(Object.keys(perfilDesde(valores)).sort()).toEqual([
      'gender',
      'name',
      'sleepTime',
      'wakeTime',
    ])
  })

  it('no toca la identidad central que alguien escribió en la versión anterior', () => {
    // `updateProfile` fusiona: si el parche la trajera como `null`, guardar el
    // nombre borraría de paso una frase que nadie pidió borrar (RN-DB-04).
    expect(perfilDesde(valores)).not.toHaveProperty('identidadCentral')
    expect(FIELDS.profile).toContain('identidadCentral')
  })

  it('no escribe nada de áreas ni nada que mida', () => {
    Object.keys(perfilDesde(valores)).forEach((campo) => {
      expect(campo).not.toMatch(/[áa]rea/i)
      expect(campo).not.toMatch(/racha|streak|score|nivel|total/i)
    })
  })
})

describe('el género va y vuelve sin inventarse nada', () => {
  it('lo guardado siempre es uno de los tres del modelo', () => {
    OPCIONES.forEach((opcion) => expect(GENDERS).toContain(generoDe(opcion)))
  })

  it('masculino y femenino vuelven marcados', () => {
    expect(opcionDe(generoDe('masculino'))).toBe('masculino')
    expect(opcionDe(generoDe('femenino'))).toBe('femenino')
  })

  it('el neutro vuelve sin marcar, porque es lo que vale sin contestar', () => {
    // Elegir por alguien cuál de las dos opciones neutras tocó sería inventarle
    // una respuesta que no dio (RN-GEN-05).
    expect(opcionDe(generoDe('prefiero_no_contestar'))).toBeNull()
    expect(opcionDe(generoDe('otro'))).toBeNull()
    expect(opcionDe(null)).toBeNull()
  })
})
