// tests/genero.test.js
// El motor de lenguaje adaptativo (§2): derivación del modo, resolución de las
// variantes y lo que pasa cuando no hay respuesta.

import { describe, it, expect, beforeEach } from 'vitest'
import { openDB } from 'idb'
import { copy } from '@copy'
import { upgradeSchema } from '@lib/db'
import { resolveCopy, hasVariants } from '@copy/resolve'
import { deriveGenderMode, normalizeGender, GENDER_OPTIONS } from '@lib/gender'
import {
  getGender,
  getGenderMode,
  setGender,
  subscribeGenderMode,
  resetGenderStore,
} from '@lib/genderStore'
import { emptyDraft, saveGenero } from '@lib/onboardingStorage'
import { finishOnboarding } from '@lib/onboardingProfile'
import { getCurrentUserId } from '@lib/user'
import { filasDe } from './helpers/db.js'

beforeEach(() => resetGenderStore())

describe('Derivación del modo (§2.2)', () => {
  it('cada respuesta lleva a su modo', () => {
    expect(deriveGenderMode('masculino')).toBe('m')
    expect(deriveGenderMode('femenino')).toBe('f')
    expect(deriveGenderMode('prefiero_no_contestar')).toBe('n')
    expect(deriveGenderMode('otro')).toBe('n')
  })

  it('sin respuesta, o con una que no existe, el modo es neutro', () => {
    expect(deriveGenderMode(null)).toBe('n')
    expect(deriveGenderMode(undefined)).toBe('n')
    expect(deriveGenderMode('cualquier-cosa')).toBe('n')
  })

  it('nunca devuelve null', () => {
    for (const valor of [...GENDER_OPTIONS, null, undefined, '', 0, {}]) {
      expect(deriveGenderMode(valor)).toMatch(/^[mfn]$/)
    }
  })

  it('normalizeGender solo deja pasar el catálogo', () => {
    expect(normalizeGender('femenino')).toBe('femenino')
    expect(normalizeGender('otra-cosa')).toBeNull()
    expect(normalizeGender(undefined)).toBeNull()
  })
})

describe('Resolución del copy (§2.4)', () => {
  const entrada = {
    m: 'cuida de sí mismo.',
    f: 'cuida de sí misma.',
    n: 'se cuida.',
  }

  it('devuelve la variante del modo', () => {
    expect(resolveCopy(entrada, 'm')).toBe('cuida de sí mismo.')
    expect(resolveCopy(entrada, 'f')).toBe('cuida de sí misma.')
    expect(resolveCopy(entrada, 'n')).toBe('se cuida.')
  })

  it('un string plano se devuelve tal cual', () => {
    expect(resolveCopy('Continuar', 'f')).toBe('Continuar')
  })

  it('sin modo, o con uno inválido, cae en la neutra', () => {
    expect(resolveCopy(entrada)).toBe('se cuida.')
    expect(resolveCopy(entrada, 'x')).toBe('se cuida.')
  })

  it('resuelve listas elemento a elemento', () => {
    expect(resolveCopy(['Uno', entrada], 'm')).toEqual(['Uno', 'cuida de sí mismo.'])
  })

  it('un subárbol del copy no se confunde con una entrada de variantes', () => {
    expect(hasVariants(copy.onboarding.p4)).toBe(false)
    expect(resolveCopy(copy.onboarding.p4, 'f')).toBe(copy.onboarding.p4)
  })
})

describe('El copy del onboarding habla en el género contestado (§2.8)', () => {
  const sugerenciaCuidado = modo => resolveCopy(copy.onboarding.p4.placeholders, modo)[1]
  const motivoConectar    = modo => resolveCopy(copy.onboarding.p3.options, modo)[2]

  it('masculino', () => {
    expect(sugerenciaCuidado('m')).toBe('…cuida de sí mismo')
    expect(motivoConectar('m')).toBe('Conectar conmigo mismo')
  })

  it('femenino', () => {
    expect(sugerenciaCuidado('f')).toBe('…cuida de sí misma')
    expect(motivoConectar('f')).toBe('Conectar conmigo misma')
  })

  it('neutro: reformulado, sin barras', () => {
    expect(sugerenciaCuidado('n')).toBe('…se cuida')
    expect(motivoConectar('n')).toBe('Reconectar conmigo')
  })

  it('ninguna variante usa "elle", "@" ni "x" como marca de género', () => {
    const textos = []
    const recorrer = node => {
      if (typeof node === 'string') return textos.push(node)
      if (node && typeof node === 'object') Object.values(node).forEach(recorrer)
    }
    recorrer(copy)

    for (const texto of textos) {
      expect(texto).not.toMatch(/\belles?\b/i)
      expect(texto).not.toMatch(/[a-záéíóúñ]+@s?\b/i)
      expect(texto).not.toMatch(/\b(?:todes|nosotres|amigues|chiques|niñes)\b/i)
    }
  })
})

describe('Almacén reactivo del modo (§2.4)', () => {
  it('arranca en neutro', () => {
    expect(getGenderMode()).toBe('n')
    expect(getGender()).toBeNull()
  })

  it('avisa a quien esté suscrito cuando cambia', () => {
    let avisos = 0
    const desuscribir = subscribeGenderMode(() => { avisos++ })

    setGender('femenino')
    expect(getGenderMode()).toBe('f')
    expect(avisos).toBe(1)

    // Cambiar Ajustes de nuevo vuelve a reescribir lo que está en pantalla
    setGender('masculino')
    expect(getGenderMode()).toBe('m')
    expect(avisos).toBe(2)

    desuscribir()
    setGender('otro')
    expect(avisos).toBe(2)
    expect(getGenderMode()).toBe('n')
  })

  it('no avisa si el valor no cambió', () => {
    setGender('femenino')
    let avisos = 0
    const desuscribir = subscribeGenderMode(() => { avisos++ })
    setGender('femenino')
    expect(avisos).toBe(0)
    desuscribir()
  })

  it('"prefiero no contestar" y "otro" guardan lo contestado, no solo el modo', () => {
    setGender('prefiero_no_contestar')
    expect(getGender()).toBe('prefiero_no_contestar')
    expect(getGenderMode()).toBe('n')

    setGender('otro')
    expect(getGender()).toBe('otro')
    expect(getGenderMode()).toBe('n')
  })
})

describe('El género baja al perfil (§2.2)', () => {
  const borrador = (extra = {}) => ({
    ...emptyDraft,
    identidadCentral: 'crece cada día',
    ...extra,
  })

  it('se guarda lo contestado en P2A', async () => {
    await finishOnboarding(borrador({ gender: 'femenino' }))
    expect((await filasDe('userProfile'))[0].gender).toBe('femenino')
  })

  it('sin contestar queda en null, no ausente', async () => {
    await finishOnboarding(borrador())
    const [perfil] = await filasDe('userProfile')
    expect(perfil.gender).toBeNull()
    expect('gender' in perfil).toBe(true)
  })

  it('un valor fuera del catálogo se guarda como sin respuesta', async () => {
    await finishOnboarding(borrador({ gender: 'inventado' }))
    expect((await filasDe('userProfile'))[0].gender).toBeNull()
  })
})

describe('P2A · el género se guarda al elegir (§5.9)', () => {
  it('baja a IndexedDB sin esperar a Continuar', async () => {
    await saveGenero('femenino')

    const [perfil] = await filasDe('userProfile')
    expect(perfil).toMatchObject({ userId: getCurrentUserId(), gender: 'femenino' })
  })

  it('cambiar de opción actualiza la misma fila', async () => {
    await saveGenero('masculino')
    await saveGenero('prefiero_no_contestar')

    const perfiles = await filasDe('userProfile')
    expect(perfiles).toHaveLength(1)
    expect(perfiles[0].gender).toBe('prefiero_no_contestar')
  })

  it('lo que P2A escribió sigue ahí cuando P11 completa el perfil', async () => {
    await saveGenero('femenino')
    await finishOnboarding({ ...emptyDraft, gender: 'femenino', identidadCentral: 'crece' })

    const perfiles = await filasDe('userProfile')
    expect(perfiles).toHaveLength(1)
    expect(perfiles[0]).toMatchObject({ gender: 'femenino', identidadCentral: 'crece' })
  })

  it('con cuenta, no queda un perfil huérfano bajo el id local', async () => {
    await saveGenero('femenino')
    await finishOnboarding({
      ...emptyDraft,
      gender: 'femenino',
      cuenta: { uid: 'firebase-123', correo: 'hola@strivo.com', proveedor: 'correo' },
    })

    const perfiles = await filasDe('userProfile')
    expect(perfiles).toHaveLength(1)
    expect(perfiles[0].userId).toBe('firebase-123')
    expect(perfiles[0].gender).toBe('femenino')
  })
})

describe('Migración del almacén local a v2 (§2.2)', () => {
  // Se prueba contra una base desechable: la de la app la comparten las demás
  // pruebas y abrirla en v1 las dejaría a media migración.
  const NOMBRE = 'strivo-migracion-de-prueba'

  it('los perfiles escritos antes de P2A quedan con gender: null', async () => {
    const v1 = await openDB(NOMBRE, 1, {
      upgrade(db) {
        db.createObjectStore('userProfile', { keyPath: 'userId' })
      },
    })
    await v1.put('userProfile', { userId: 'u1', nombre: 'Alejandra' })
    await v1.put('userProfile', { userId: 'u2', nombre: 'Sofía', gender: 'femenino' })
    v1.close()

    const v2 = await openDB(NOMBRE, 2, { upgrade: upgradeSchema })
    const sinRespuesta = await v2.get('userProfile', 'u1')
    const conRespuesta = await v2.get('userProfile', 'u2')
    v2.close()

    expect(sinRespuesta.gender).toBeNull()
    expect('gender' in sinRespuesta).toBe(true)
    // Lo que ya estaba contestado no se toca
    expect(conRespuesta.gender).toBe('femenino')
    // Y nada de lo demás se pierde por el camino
    expect(sinRespuesta.nombre).toBe('Alejandra')
  })
})
