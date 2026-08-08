// tests/animos.test.js
// Cómo te vas a dormir (§5.6, N6) en el género de cada quien.
//
// El bug: quien contestaba "femenino" en P2A leía "Tranquilo", "Pensativo",
// "Cansado". Los cinco estados llevan ahora variante, y lo que se guarda es un
// id que no se flexiona, para que decirlo en femenino no rompa nada de lo que
// depende de esa respuesta (el saludo de la mañana siguiente y el color del
// calendario).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { openDB } from 'idb'
import { copy } from '@copy'
import { resolveCopy } from '@copy/resolve'
import { upgradeSchema, updateDailyEntry, saveUserProfile } from '@lib/db'
import { setGender, resetGenderStore } from '@lib/genderStore'
import { getCurrentUserId } from '@lib/user'
import { loadRitualManana } from '@lib/ritualManana'
import { loadMes, loadDia, colorDeAnimo, COLOR_SIN_ANIMO } from '@lib/historial'
import {
  ANIMOS,
  ANIMOS_DIFICILES,
  idDeAnimo,
  nombreDeAnimo,
  esAnimoConocido,
  colorDeAnimoId,
} from '@lib/animos'

beforeEach(() => resetGenderStore())

// El resolvedor que usan las pantallas, sin montar React
const traductor = modo => path =>
  resolveCopy(path.split('.').reduce((nodo, clave) => nodo?.[clave], copy), modo)

describe('El estado de cierre se dice en el género del perfil', () => {
  it('en femenino, ninguno de los cinco viene en masculino', () => {
    const t = traductor('f')
    const nombres = ANIMOS.map(({ id }) => nombreDeAnimo(id, t))

    expect(nombres).toEqual(['Tranquila', 'Pensativa', 'Cansada', 'Inquieta', 'Otra'])
  })

  it('en masculino se lee como siempre', () => {
    const t = traductor('m')
    expect(ANIMOS.map(({ id }) => nombreDeAnimo(id, t)))
      .toEqual(['Tranquilo', 'Pensativo', 'Cansado', 'Inquieto', 'Otro'])
  })

  it('sin contestar el género, son locuciones sin marca', () => {
    const t = traductor('n')
    expect(ANIMOS.map(({ id }) => nombreDeAnimo(id, t)))
      .toEqual(['En calma', 'Con la mente activa', 'Con cansancio', 'Con inquietud', 'De otra forma'])
  })

  it('ninguna neutra resuelve el género con una barra', () => {
    const t = traductor('n')
    for (const { id } of ANIMOS) {
      expect(nombreDeAnimo(id, t), id).not.toMatch(/[oa]\/[oa]/)
    }
  })

  it('ninguna neutra es el masculino reciclado', () => {
    const neutro = traductor('n')
    const masculino = traductor('m')
    for (const { id } of ANIMOS) {
      expect(nombreDeAnimo(id, neutro), id).not.toBe(nombreDeAnimo(id, masculino))
    }
  })

  it('un id que ya no existe se muestra tal cual, no desaparece', () => {
    expect(nombreDeAnimo('inventado', traductor('f'))).toBe('inventado')
  })

  it('sin ánimo no hay nombre que mostrar', () => {
    expect(nombreDeAnimo('', traductor('f'))).toBe('')
    expect(nombreDeAnimo(null, traductor('f'))).toBe('')
  })
})

describe('Lo que se guarda es el id, no el rótulo', () => {
  it('los cinco ids son minúsculas sin marca de género', () => {
    for (const { id } of ANIMOS) {
      expect(id, id).toMatch(/^[a-z]+$/)
    }
  })

  it('un rótulo de los de antes se reconoce como su id', () => {
    expect(idDeAnimo('Cansado')).toBe('cansado')
    expect(idDeAnimo('Tranquilo')).toBe('tranquilo')
    expect(idDeAnimo('Otro')).toBe('otro')
  })

  it('un id ya migrado se queda como está', () => {
    expect(idDeAnimo('cansado')).toBe('cansado')
  })

  it('lo que no se reconoce no se toca ni se inventa', () => {
    expect(idDeAnimo('vaya-a-saber')).toBe('vaya-a-saber')
    expect(idDeAnimo('')).toBe('')
    expect(idDeAnimo(undefined)).toBeUndefined()
  })

  it('nunca se guarda una forma flexionada', () => {
    // Lo que escribiría el selector en femenino si guardara el rótulo
    expect(esAnimoConocido('Cansada')).toBe(false)
    expect(idDeAnimo('Cansada')).not.toBe('cansado')
  })
})

// Esto es lo que se habría roto en silencio si el rótulo fuera la clave: la app
// diría "Cansada", guardaría "Cansada", y a la mañana siguiente no se
// reconocería a sí misma.
describe('El saludo de la mañana sigue reconociendo el día difícil', () => {
  const UN_MIERCOLES = new Date(2026, 7, 5, 7, 30)
  const AYER = '2026-08-04'

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(UN_MIERCOLES)
  })
  afterEach(() => vi.useRealTimers())

  const cerrarAyerCon = async animoCierre => {
    const userId = getCurrentUserId()
    await saveUserProfile({
      userId,
      nombre: 'Alejandra',
      identidadCentral: 'crece cada día',
      diaTerminaA: '03:00',
      gender: 'femenino',
    })
    await updateDailyEntry(userId, AYER, { animoCierre })
  }

  it('los ánimos difíciles son ids, no palabras visibles', () => {
    expect(ANIMOS_DIFICILES).toEqual(['cansado', 'inquieto'])
    for (const id of ANIMOS_DIFICILES) expect(esAnimoConocido(id)).toBe(true)
  })

  it('con el género en femenino, un cierre cansado se sigue reconociendo', async () => {
    setGender('femenino')
    await cerrarAyerCon('cansado')

    expect((await loadRitualManana()).diaDificil).toBe(true)
  })

  it('y un cierre tranquilo sigue sin serlo', async () => {
    setGender('femenino')
    await cerrarAyerCon('tranquilo')

    expect((await loadRitualManana()).diaDificil).toBe(false)
  })

  it('una entrada vieja con el rótulo también se reconoce', async () => {
    // Por si llega tarde desde la sincronización, después de la migración
    await cerrarAyerCon('Cansado')

    expect((await loadRitualManana()).diaDificil).toBe(true)
  })

  // Lo que habría pasado sin este arreglo
  it('el rótulo en femenino nunca llega a guardarse, pero si llegara no engaña', () => {
    expect(ANIMOS_DIFICILES.includes(idDeAnimo('Cansada'))).toBe(false)
  })
})

describe('El color del calendario no depende del rótulo', () => {
  it('cada estado conserva su color', () => {
    for (const { id, color } of ANIMOS) {
      expect(colorDeAnimo(id), id).toBe(color)
      expect(colorDeAnimoId(id), id).toBe(color)
    }
  })

  it('un mes anterior a la migración conserva sus colores', () => {
    expect(colorDeAnimo('Cansado')).toBe(colorDeAnimo('cansado'))
    expect(colorDeAnimo('Inquieto')).toBe(colorDeAnimo('inquieto'))
  })

  it('lo que no se reconoce se pinta como día sin ánimo, no se pierde', () => {
    expect(colorDeAnimo('Inventado')).toBe(COLOR_SIN_ANIMO)
    expect(colorDeAnimo(null)).toBe(COLOR_SIN_ANIMO)
  })

  it('el historial devuelve ids, aunque lo guardado sea un rótulo viejo', async () => {
    const userId = getCurrentUserId()
    await updateDailyEntry(userId, '2026-08-03', { animoCierre: 'Inquieto' })

    const dias = await loadMes(userId, 2026, 8)
    expect(dias.get('2026-08-03').animo).toBe('inquieto')

    const dia = await loadDia(userId, '2026-08-03')
    expect(dia.animo).toBe('inquieto')
  })
})

describe('Migración v6 del almacén local', () => {
  const NOMBRE = 'strivo-migracion-animos'

  it('el rótulo guardado pasa a id sin perder nada del día', async () => {
    const v5 = await openDB(NOMBRE, 5, {
      upgrade(db) {
        const de = db.createObjectStore('dailyEntries', { keyPath: 'id' })
        de.createIndex('byUserDate', ['userId', 'fecha'])
      },
    })
    await v5.put('dailyEntries', {
      id: 'u1_2026-08-01', userId: 'u1', fecha: '2026-08-01',
      animoCierre: 'Cansado',
      agradecimientos: ['Mi hermana'],
      intencion: 'Ir despacio',
    })
    await v5.put('dailyEntries', {
      id: 'u1_2026-08-02', userId: 'u1', fecha: '2026-08-02',
      animoCierre: 'Otro',
    })
    // Un día sin ánimo: la migración no puede inventarle uno
    await v5.put('dailyEntries', {
      id: 'u1_2026-08-03', userId: 'u1', fecha: '2026-08-03',
      granDia: 'Dormir bien',
    })
    v5.close()

    const v6 = await openDB(NOMBRE, 6, { upgrade: upgradeSchema })
    const uno  = await v6.get('dailyEntries', 'u1_2026-08-01')
    const dos  = await v6.get('dailyEntries', 'u1_2026-08-02')
    const tres = await v6.get('dailyEntries', 'u1_2026-08-03')
    v6.close()

    expect(uno.animoCierre).toBe('cansado')
    expect(dos.animoCierre).toBe('otro')
    expect(tres.animoCierre).toBeUndefined()

    // Y lo demás del día sigue intacto
    expect(uno.agradecimientos).toEqual(['Mi hermana'])
    expect(uno.intencion).toBe('Ir despacio')
    expect(tres.granDia).toBe('Dormir bien')
  })
})
