// tests/animos.test.js
// Cómo te vas a dormir (§5.6, N6) en el género de cada quien.
//
// El bug de origen: quien contestaba "femenino" en P2A leía "Tranquilo",
// "Pensativo", "Cansado". Los nueve estados llevan variante, se eligen hasta
// dos, y lo que se guarda son ids que no se flexionan, para que decirlo en
// femenino no rompa nada de lo que depende de esa respuesta (el saludo de la
// mañana siguiente y el color del calendario).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { openDB } from 'idb'
import { copy } from '@copy'
import { resolveCopy } from '@copy/resolve'
import { upgradeSchema, updateDailyEntry, saveUserProfile, getDailyEntry } from '@lib/db'
import { setGender, resetGenderStore } from '@lib/genderStore'
import { comoPropia } from '@lib/propias'
import { getCurrentUserId } from '@lib/user'
import { loadRitualManana } from '@lib/ritualManana'
import { guardarAnimoCierre, loadRitualNoche } from '@lib/ritualNoche'
import { loadMes, loadDia, colorDeAnimo, COLOR_SIN_ANIMO } from '@lib/historial'
import {
  ANIMOS,
  ANIMOS_DIFICILES,
  ANIMO_OTRO,
  MAX_ANIMOS,
  OTRO_MAX_LENGTH,
  idDeAnimo,
  normalizarAnimos,
  nombreDeAnimo,
  nombresDeAnimos,
  esAnimoConocido,
  colorDeAnimoId,
  esUnaPalabra,
  seleccionParaGuardar,
} from '@lib/animos'

beforeEach(() => resetGenderStore())

// El resolvedor que usan las pantallas, sin montar React
const traductor = modo => path =>
  resolveCopy(path.split('.').reduce((nodo, clave) => nodo?.[clave], copy), modo)

// Los ocho chips de la rejilla más el rótulo del botón "+ Algo más"
const TODAS = [...ANIMOS.map(a => a.id), ANIMO_OTRO]
const nombres = modo => TODAS.map(id => nombreDeAnimo(id, traductor(modo)))

describe('Las nueve opciones, en su orden', () => {
  it('están las nueve y en el orden de la spec', () => {
    expect(TODAS).toEqual([
      'en_paz', 'agradecido', 'orgulloso', 'tranquilo', 'contento',
      'pensativo', 'cansado', 'inquieto', 'otro',
    ])
  })

  // "Algo más" no es un chip de la rejilla sino el botón con el "+", igual que
  // "Otra" en la pregunta de la mañana. Por eso está fuera de ANIMOS.
  it('"Algo más" queda fuera de la rejilla', () => {
    expect(ANIMOS.map(a => a.id)).not.toContain(ANIMO_OTRO)
    expect(ANIMOS).toHaveLength(8)
  })

  it('cada opción de la rejilla lleva su emoji', () => {
    for (const { id, emoji } of ANIMOS) expect(emoji, id).toBeTruthy()
  })

  it('el catálogo y el copy nombran exactamente los mismos estados', () => {
    expect([...TODAS].sort()).toEqual(Object.keys(copy.ritualNoche.n6.states).sort())
  })

  it('el encabezado dice lo que tiene que decir', () => {
    expect(copy.ritualNoche.n6.question).toBe('¿Cómo te vas a dormir?')
    expect(copy.ritualNoche.n6.subtitle)
      .toBe('Elige una o dos. No hay una forma correcta de cerrar el día')
  })
})

describe('El estado de cierre se dice en el género del perfil', () => {
  it('en femenino, ninguno viene en masculino', () => {
    expect(nombres('f')).toEqual([
      'En paz', 'Agradecida', 'Orgullosa', 'Tranquila', 'Contenta',
      'Pensativa', 'Cansada', 'Inquieta', 'Algo más',
    ])
  })

  it('en masculino se lee como siempre', () => {
    expect(nombres('m')).toEqual([
      'En paz', 'Agradecido', 'Orgulloso', 'Tranquilo', 'Contento',
      'Pensativo', 'Cansado', 'Inquieto', 'Algo más',
    ])
  })

  it('sin contestar el género, son locuciones sin marca', () => {
    expect(nombres('n')).toEqual([
      'En paz', 'Con gratitud', 'Con orgullo', 'En calma', 'Con alegría',
      'Pensando', 'Con cansancio', 'Con inquietud', 'Algo más',
    ])
  })

  it('ninguna neutra usa barra, "elle" ni "@"', () => {
    for (const nombre of nombres('n')) {
      expect(nombre).not.toMatch(/[oa]\/[oa]/)
      expect(nombre).not.toMatch(/\belles?\b/i)
      expect(nombre).not.toMatch(/@/)
    }
  })

  it('"En paz" y "Algo más" son iguales en los tres, y no por descuido', () => {
    for (const modo of ['m', 'f', 'n']) {
      const t = traductor(modo)
      expect(nombreDeAnimo('en_paz', t)).toBe('En paz')
      expect(nombreDeAnimo(ANIMO_OTRO, t)).toBe('Algo más')
    }
  })

  it('un id que ya no existe se muestra tal cual, no desaparece', () => {
    expect(nombreDeAnimo('inventado', traductor('f'))).toBe('inventado')
  })

  it('la palabra escrita se lee tal cual, como en la mañana', () => {
    expect(nombreDeAnimo(comoPropia('serena'), traductor('f'))).toBe('serena')
  })

  it('una selección entera se lee de corrido', () => {
    expect(nombresDeAnimos(['agradecido', 'cansado'], traductor('f')))
      .toEqual(['Agradecida', 'Cansada'])
  })
})

describe('Se eligen hasta dos', () => {
  it('el máximo es dos, como dice el subtítulo', () => {
    expect(MAX_ANIMOS).toBe(2)
  })

  it('la lista no admite repetidos', () => {
    expect(normalizarAnimos(['cansado', 'cansado'])).toEqual(['cansado'])
  })

  it('cero elegidos es una respuesta válida, no un hueco', () => {
    expect(normalizarAnimos([])).toEqual([])
    expect(seleccionParaGuardar([], '')).toEqual({ animoCierre: [], animoOtroTexto: '' })
  })
})

describe('Lo que se guarda es el id, no el rótulo', () => {
  it('los ids no llevan marca de género', () => {
    for (const { id } of ANIMOS) expect(id, id).toMatch(/^[a-z_]+$/)
  })

  it('un rótulo de los de antes se reconoce como su id', () => {
    expect(idDeAnimo('Cansado')).toBe('cansado')
    expect(idDeAnimo('Tranquilo')).toBe('tranquilo')
  })

  it('nunca se reconoce una forma flexionada', () => {
    expect(esAnimoConocido('Cansada')).toBe(false)
    expect(idDeAnimo('Cansada')).not.toBe('cansado')
  })

  // Las tres formas que puede tener un registro guardado. No se migra nada:
  // lo de antes se lee, no se reescribe.
  it('se lee igual un id suelto, una lista o un rótulo antiguo', () => {
    expect(normalizarAnimos('cansado')).toEqual(['cansado'])
    expect(normalizarAnimos(['cansado', 'en_paz'])).toEqual(['cansado', 'en_paz'])
    expect(normalizarAnimos('Cansado')).toEqual(['cansado'])
    expect(normalizarAnimos('')).toEqual([])
    expect(normalizarAnimos(null)).toEqual([])
    expect(normalizarAnimos(undefined)).toEqual([])
  })

  it('un id desconocido se conserva: el registro sigue contando lo que contaba', () => {
    expect(normalizarAnimos(['de_otra_version'])).toEqual(['de_otra_version'])
  })
})

describe('"Algo más": una palabra, y se dice cuando no lo es', () => {
  it('una palabra sola cabe', () => {
    expect(esUnaPalabra('serena')).toBe(true)
    expect(esUnaPalabra('  serena  ')).toBe(true)
  })

  // Lo que motivó el cambio: antes se recortaba en silencio y quien escribía
  // "muy contenta" veía "muycontenta" sin ninguna explicación.
  it('dos palabras no caben, y no se recortan a escondidas', () => {
    expect(esUnaPalabra('muy contenta')).toBe(false)
    expect(esUnaPalabra('serena y en paz')).toBe(false)
  })

  it('lo vacío tampoco cuenta como palabra', () => {
    expect(esUnaPalabra('')).toBe(false)
    expect(esUnaPalabra('   ')).toBe(false)
    expect(esUnaPalabra(null)).toBe(false)
  })

  it('una palabra más larga de lo que cabe tampoco', () => {
    expect(esUnaPalabra('a'.repeat(OTRO_MAX_LENGTH))).toBe(true)
    expect(esUnaPalabra('a'.repeat(OTRO_MAX_LENGTH + 1))).toBe(false)
  })

  it('la pista existe y no regaña', () => {
    const pista = copy.ritualNoche.n6.otherHint
    expect(pista).toBe('Sintetízalo en una palabra')
    expect(pista).not.toMatch(/error|inválid|incorrect|no puedes/i)
  })

  it('la palabra viaja dentro de la lista, como en la mañana', () => {
    expect(seleccionParaGuardar(['en_paz', comoPropia('serena')])).toEqual({
      animoCierre: ['en_paz', 'propia:serena'],
      animoOtroTexto: '',
    })
  })

  it('"Algo más" sin palabra no llega a guardarse', () => {
    expect(seleccionParaGuardar(['en_paz', ANIMO_OTRO])).toEqual({
      animoCierre: ['en_paz'],
      animoOtroTexto: '',
    })
  })

  // Lo que guardó la primera versión de "Algo más": el id suelto y la palabra
  // en un campo aparte. Se lee y se pliega, no se reescribe en el almacén.
  it('un registro con la palabra en su campo aparte se pliega en la lista', () => {
    expect(normalizarAnimos(['en_paz', 'otro'], 'serena'))
      .toEqual(['en_paz', 'propia:serena'])
  })
})

describe('Ida y vuelta por el almacén local', () => {
  const HOY = '2026-08-05'
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 7, 5, 22, 0))
  })
  afterEach(() => vi.useRealTimers())

  const conPerfil = async () => {
    const userId = getCurrentUserId()
    await saveUserProfile({ userId, nombre: 'Alejandra', diaTerminaA: '03:00', gender: 'femenino' })
    return userId
  }

  it('dos estados y una palabra vuelven tal cual', async () => {
    const userId = await conPerfil()
    await guardarAnimoCierre(userId, HOY, ['agradecido', comoPropia('serena')])

    const datos = await loadRitualNoche()
    expect(datos.animoCierre).toEqual(['agradecido', 'propia:serena'])
  })

  it('un registro de la versión anterior vuelve ya plegado', async () => {
    const userId = await conPerfil()
    await updateDailyEntry(userId, HOY, {
      animoCierre: ['cansado', 'otro'], animoOtroTexto: 'serena',
    })

    const datos = await loadRitualNoche()
    expect(datos.animoCierre).toEqual(['cansado', 'propia:serena'])
  })

  it('cerrar sin elegir nada no escribe una elección vacía', async () => {
    const userId = await conPerfil()
    await guardarAnimoCierre(userId, HOY, [], '')

    const entrada = await getDailyEntry(userId, HOY)
    expect(entrada.animoCierre).toEqual([])
  })
})

// Esto es lo que se habría roto en silencio si el rótulo fuera la clave.
describe('El saludo de la mañana sigue reconociendo el día difícil', () => {
  const AYER = '2026-08-04'

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 7, 5, 7, 30))
  })
  afterEach(() => vi.useRealTimers())

  const cerrarAyerCon = async animoCierre => {
    const userId = getCurrentUserId()
    await saveUserProfile({ userId, nombre: 'Alejandra', diaTerminaA: '03:00', gender: 'femenino' })
    await updateDailyEntry(userId, AYER, { animoCierre })
  }

  it('los ánimos difíciles son ids, no palabras visibles', () => {
    expect(ANIMOS_DIFICILES).toEqual(['cansado', 'inquieto'])
    for (const id of ANIMOS_DIFICILES) expect(esAnimoConocido(id)).toBe(true)
  })

  it('en femenino, un cierre cansado se sigue reconociendo', async () => {
    setGender('femenino')
    await cerrarAyerCon(['cansado'])

    expect((await loadRitualManana()).diaDificil).toBe(true)
  })

  it('basta con que uno de los dos elegidos lo sea', async () => {
    await cerrarAyerCon(['agradecido', 'cansado'])
    expect((await loadRitualManana()).diaDificil).toBe(true)
  })

  it('dos estados buenos no lo activan', async () => {
    await cerrarAyerCon(['agradecido', 'en_paz'])
    expect((await loadRitualManana()).diaDificil).toBe(false)
  })

  it('una entrada vieja con un id suelto también se reconoce', async () => {
    await cerrarAyerCon('cansado')
    expect((await loadRitualManana()).diaDificil).toBe(true)
  })

  it('y una con el rótulo de antes, también', async () => {
    await cerrarAyerCon('Cansado')
    expect((await loadRitualManana()).diaDificil).toBe(true)
  })
})

describe('El color del calendario no depende del rótulo', () => {
  it('cada estado conserva su color', () => {
    for (const { id, color } of ANIMOS) {
      expect(colorDeAnimo(id), id).toBe(color)
      expect(colorDeAnimoId(id), id).toBe(color)
    }
  })

  // Los cinco que ya existían mantienen el suyo: un mes de hace semanas se ve
  // igual que antes de este cambio.
  it('los cinco estados de antes conservan el color que tenían', () => {
    expect(colorDeAnimo('tranquilo')).toBe('#7E9E86')   // sage
    expect(colorDeAnimo('pensativo')).toBe('#93A9C4')   // mist
    expect(colorDeAnimo('cansado')).toBe('#8B6BA8')     // plum
    expect(colorDeAnimo('inquieto')).toBe('#E5A25C')    // amber
    expect(colorDeAnimo('otro')).toBe('#D9CFC4')
  })

  it('con dos elegidos manda el primero', () => {
    expect(colorDeAnimo(['cansado', 'en_paz'])).toBe(colorDeAnimo('cansado'))
    expect(colorDeAnimo(['en_paz', 'cansado'])).toBe(colorDeAnimo('en_paz'))
  })

  it('un mes anterior a la migración conserva sus colores', () => {
    expect(colorDeAnimo('Cansado')).toBe(colorDeAnimo('cansado'))
  })

  it('lo que no se reconoce se pinta como día sin ánimo, no se pierde', () => {
    expect(colorDeAnimo('de_otra_version')).toBe(COLOR_SIN_ANIMO)
    expect(colorDeAnimo(null)).toBe(COLOR_SIN_ANIMO)
    expect(colorDeAnimo([])).toBe(COLOR_SIN_ANIMO)
  })

  it('el historial devuelve listas, aunque lo guardado sea un rótulo viejo', async () => {
    const userId = getCurrentUserId()
    await updateDailyEntry(userId, '2026-08-03', { animoCierre: 'Inquieto' })

    const dias = await loadMes(userId, 2026, 8)
    expect(dias.get('2026-08-03').animo).toEqual(['inquieto'])

    const dia = await loadDia(userId, '2026-08-03')
    expect(dia.animo).toEqual(['inquieto'])
  })

  it('un registro con un id desconocido no deja el bloque en blanco', async () => {
    const userId = getCurrentUserId()
    await updateDailyEntry(userId, '2026-08-09', { animoCierre: ['de_otra_version'] })

    const dia = await loadDia(userId, '2026-08-09')
    expect(dia.animo).toEqual(['de_otra_version'])
    expect(nombresDeAnimos(dia.animo, traductor('f'))).toEqual(['de_otra_version'])
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
      id: 'u1_2026-08-03', userId: 'u1', fecha: '2026-08-03',
      granDia: 'Dormir bien',
    })
    v5.close()

    const v6 = await openDB(NOMBRE, 6, { upgrade: upgradeSchema })
    const uno  = await v6.get('dailyEntries', 'u1_2026-08-01')
    const tres = await v6.get('dailyEntries', 'u1_2026-08-03')
    v6.close()

    expect(uno.animoCierre).toBe('cansado')
    expect(tres.animoCierre).toBeUndefined()

    // Y lo demás del día sigue intacto
    expect(uno.agradecimientos).toEqual(['Mi hermana'])
    expect(uno.intencion).toBe('Ir despacio')
    expect(tres.granDia).toBe('Dormir bien')
  })
})
