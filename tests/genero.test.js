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

// Todo lo que la persona puede llegar a leer, venga de una entrada plana o de
// una variante de género.
function todosLosTextos() {
  const textos = []
  const recorrer = node => {
    if (typeof node === 'string') return textos.push(node)
    if (node && typeof node === 'object') Object.values(node).forEach(recorrer)
  }
  recorrer(copy)
  return textos
}

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
  // El chip de cuidado de P4: la frase completa se lee "Soy alguien que…"
  const sugerenciaCuidado = modo => resolveCopy(copy.onboarding.p4.chips.cuidado, modo)

  it('masculino', () => {
    expect(sugerenciaCuidado('m')).toBe('cuida de sí mismo.')
  })

  it('femenino', () => {
    expect(sugerenciaCuidado('f')).toBe('cuida de sí misma.')
  })

  it('neutro: reformulado, sin barras', () => {
    expect(sugerenciaCuidado('n')).toBe('se cuida.')
  })

  it('ninguna variante usa "elle", "@" ni "x" como marca de género', () => {
    for (const texto of todosLosTextos()) {
      expect(texto).not.toMatch(/\belles?\b/i)
      expect(texto).not.toMatch(/[a-záéíóúñ]+@s?\b/i)
      expect(texto).not.toMatch(/\b(?:todes|nosotres|amigues|chiques|niñes)\b/i)
    }
  })

  // La barra parte la lectura en dos y obliga a elegir en voz alta: la neutra se
  // redacta sin marca de género (un sustantivo o una locución), no con un atajo
  // tipográfico. Las excepciones son las que no tienen reformulación natural, y
  // se listan aquí una a una para que añadir la siguiente sea una decisión y no
  // un descuido.
  const BARRAS_AUTORIZADAS = [
    'mismo/a',   // no hay locución equivalente que conserve el reflexivo
    'Amado/a',   // "Con amor" es amar a otros, no sentirse querido (§2.5.4)
  ]

  // Una barra de género es una palabra ya flexionada seguida de la otra
  // terminación ("cansado/a"). Se pide que el tronco acabe en -o/-a para no
  // confundirla con una barra de unidades ("99 MXN/año").
  const BARRA_DE_GENERO = /\p{L}*[oa]\/[oa]s?(?!\p{L})/giu

  it('ninguna forma neutra resuelve el género con una barra', () => {
    for (const texto of todosLosTextos()) {
      const conBarra = texto.match(BARRA_DE_GENERO) ?? []
      const sinPermiso = conBarra.filter(
        forma => !BARRAS_AUTORIZADAS.some(ok => ok.toLowerCase() === forma.toLowerCase())
      )
      expect(sinPermiso, `en "${texto}"`).toEqual([])
    }
  })

  it('toda entrada con variantes resuelve a un string en los tres modos', () => {
    const entradas = []
    const recorrer = node => {
      if (!node || typeof node !== 'object') return
      if (hasVariants(node)) return entradas.push(node)
      Object.values(node).forEach(recorrer)
    }
    recorrer(copy)

    // Si esto llega a 0, la prueba dejó de comprobar nada
    expect(entradas.length).toBeGreaterThan(0)

    for (const entrada of entradas) {
      for (const modo of ['m', 'f', 'n']) {
        const resuelto = resolveCopy(entrada, modo)
        expect(typeof resuelto, JSON.stringify(entrada)).toBe('string')
        expect(resuelto.length).toBeGreaterThan(0)
        expect(resuelto).not.toBe('[object Object]')
      }
    }
  })

  // Las tres que se convirtieron en el bloque 01. Se nombran para que quitarles
  // una variante rompa aquí y no en la pantalla de alguien.
  it('la promesa de la app se dice sin marca de género en neutro', () => {
    expect(resolveCopy(copy.tagline, 'f')).toContain('contigo misma')
    expect(resolveCopy(copy.tagline, 'n')).not.toMatch(/mism[oa]/)
  })

  it('el insight de desequilibrio habla en el género del perfil', () => {
    expect(resolveCopy(copy.insights.area.lowActivity, 'f')).toContain('enfocada')
    expect(resolveCopy(copy.insights.area.lowActivity, 'n')).not.toMatch(/enfocad[oa]/)
  })

  it('la confirmación de cancelar también', () => {
    expect(resolveCopy(copy.profile.cancel.title, 'f')).toContain('Segura')
    expect(resolveCopy(copy.profile.cancel.title, 'n')).not.toMatch(/Segur[oa]/)
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

describe('Migración del almacén local a v4 (§14.4)', () => {
  const NOMBRE = 'strivo-migracion-p5'

  it('lo que capturaba P5 se retira; lo demás se queda', async () => {
    const v3 = await openDB(NOMBRE, 3, {
      upgrade(db) {
        const v = db.createObjectStore('victories', { keyPath: 'id' })
        v.createIndex('byUserDate', ['userId', 'fecha'])
        v.createIndex('byUser', 'userId')
      },
    })
    await v3.put('victories', {
      id: 'u1_primera', userId: 'u1', fecha: '2026-08-01',
      texto: 'Salí a caminar', estado: 'lograda', origen: 'onboarding',
    })
    await v3.put('victories', {
      id: 'u1_v2', userId: 'u1', fecha: '2026-08-02',
      texto: 'Llamé a mi hermana', estado: 'lograda',
    })
    v3.close()

    const v4 = await openDB(NOMBRE, 4, { upgrade: upgradeSchema })
    const quedan = await v4.getAll('victories')
    v4.close()

    expect(quedan).toHaveLength(1)
    expect(quedan[0].texto).toBe('Llamé a mi hermana')
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
