// src/lumia/__tests__/intencion.test.js
// La intención del día (§C2.4) y su separación de la gran visión (§C2.4.1).
//
// Lo que más fácil se pierde al implementar esto es la distinción entre las
// dos, así que la mitad de estas pruebas están para que no se pierda sin que
// nadie se entere.

import { readFileSync } from 'fs'
import { beforeEach, describe, expect, it } from 'vitest'

import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { lumia } from '@/lib/db'
import { FIELDS } from '@/lib/db/schema.js'
import { copy } from '@copy'
import { CHIPS, TEXTOS, chipDe } from '@/content/chips-intencion'
import { cargarDia, guardarIntencion, guardarManana } from '../diario.js'

beforeEach(async () => {
  await resetLocalDB()
})

describe('los seis chips son adverbiales (criterio 6)', () => {
  it('son seis, los de §5.5 R5, sin añadidos', () => {
    expect(CHIPS).toHaveLength(6)
    expect(TEXTOS).toEqual([
      'con calma',
      'con foco',
      'con paciencia',
      'con valentía',
      'presente',
      'sin prisa',
    ])
  })

  it('todos son un sintagma preposicional de dos palabras, o "presente"', () => {
    // Un chip que se puede completar —"con foco *en el informe*"— ha dejado de
    // decir *cómo* y ha pasado a decir *qué*, que es la gran visión. Sin un
    // analizador sintáctico, la forma estructural es el mejor apoyo: si alguien
    // añade "terminar el informe" al catálogo, esto lo detiene.
    TEXTOS.forEach((texto) => {
      expect(texto).toMatch(/^(con|sin) [a-záéíóúñ]+$|^presente$/)
    })
  })

  it('ninguno lleva verbo conjugado: se declara un modo, no un suceso', () => {
    TEXTOS.forEach((texto) => {
      expect(texto).not.toMatch(/\b(que|termine|logre|salga|haga|sea|pueda)\b/)
    })
  })

  it('ninguno necesita el helper de género', () => {
    // Son sintagmas preposicionales y un adjetivo invariable, así que son
    // cadenas y no objetos `{ m, f, n }`: no hay tres repertorios que mantener.
    CHIPS.forEach((chip) => {
      expect(typeof chip.texto).toBe('string')
      expect(chip.texto).not.toMatch(/[oa]\/[oa]|\(a\)/)
    })
  })

  it('reconoce el chip de una intención guardada, y solo ese', () => {
    expect(chipDe('con calma')?.id).toBe('calma')
    expect(chipDe('  Con Calma  ')?.id).toBe('calma')
    expect(chipDe('con calma y con foco')).toBeNull()
    expect(chipDe('')).toBeNull()
    expect(chipDe(null)).toBeNull()
  })
})

describe('guardar la intención (criterios 4 y 7)', () => {
  it('se guarda en su propio registro del día', async () => {
    await guardarIntencion(UID, '2026-08-11', 'con calma')
    expect(await lumia.getDailyIntention(UID, '2026-08-11')).toEqual({
      intentionText: 'con calma',
    })
  })

  it('es editable durante el día y guarda la última versión', async () => {
    await guardarIntencion(UID, '2026-08-11', 'con calma')
    await guardarIntencion(UID, '2026-08-11', 'sin prisa')
    const guardada = await lumia.getDailyIntention(UID, '2026-08-11')
    expect(guardada.intentionText).toBe('sin prisa')
  })

  it('quitarla deja el día sin intención, no un registro a medias', async () => {
    await guardarIntencion(UID, '2026-08-11', 'con foco')
    await guardarIntencion(UID, '2026-08-11', '')
    expect((await lumia.getDailyIntention(UID, '2026-08-11')).intentionText).toBe('')
  })

  it('hay una por día y no se pisan entre días', async () => {
    await guardarIntencion(UID, '2026-08-11', 'con calma')
    await guardarIntencion(UID, '2026-08-12', 'con foco')
    expect((await lumia.getDailyIntention(UID, '2026-08-11')).intentionText).toBe('con calma')
    expect((await lumia.getDailyIntention(UID, '2026-08-12')).intentionText).toBe('con foco')
  })
})

describe('un día sin intención es un día normal (criterio 5)', () => {
  it('el día carga igual, con la intención en null', async () => {
    const dia = await cargarDia(UID, '2026-08-11')
    expect(dia.intencion).toBeNull()
    expect(dia.fecha).toBe('2026-08-11')
  })

  it('no queda ningún registro escrito por el hecho de no ponerla', async () => {
    await cargarDia(UID, '2026-08-11')
    expect(await lumia.getDailyIntention(UID, '2026-08-11')).toBeNull()
  })
})

describe('intención y gran visión son dos cosas (criterio 1 · §C2.4.1)', () => {
  it('son dos campos distintos en dos registros distintos', () => {
    expect(FIELDS.dailyIntention).toEqual(['intentionText'])
    expect(FIELDS.morningEntry).toContain('granVision')
    expect(FIELDS.dailyIntention).not.toContain('granVision')
    expect(FIELDS.morningEntry).not.toContain('intentionText')
  })

  it('escribir una no toca la otra', async () => {
    await guardarIntencion(UID, '2026-08-11', 'con calma')
    await guardarManana(UID, '2026-08-11', {
      granVision: 'Que la conversación con mi hermana salga bien',
    })

    const dia = await cargarDia(UID, '2026-08-11')
    expect(dia.intencion.intentionText).toBe('con calma')
    expect(dia.morning.granVision).toBe('Que la conversación con mi hermana salga bien')
  })

  it('el día las trae por separado, sin campo unificado', async () => {
    await guardarIntencion(UID, '2026-08-11', 'sin prisa')
    const dia = await cargarDia(UID, '2026-08-11')
    expect(Object.keys(dia)).toContain('intencion')
    expect(Object.keys(dia)).not.toContain('intencionUnificada')
    expect(dia.morning).toBeNull()
  })
})

describe('de noche se recupera la gran visión, no la intención (criterios 3 y 8)', () => {
  // Desde que el recorrido guiado se retiró, la noche es una sola superficie.
  const NOCTURNAS = [
    'src/components/lumia/DiarioNoche.jsx',
    'src/components/lumia/CierreDelDia.jsx',
  ]

  function codigoDe(ruta) {
    return readFileSync(ruta, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
  }

  it('ninguna superficie nocturna lee la intención', () => {
    NOCTURNAS.forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/intencion|intentionText|dailyIntention/i)
    })
  })

  it('la Vista de Noche sí recupera la gran visión, como contraste', () => {
    const noche = codigoDe('src/components/lumia/DiarioNoche.jsx')
    expect(noche).toMatch(/granVision/)
  })

  it('la pregunta de la noche nunca se hace sobre la intención', () => {
    // "¿Cómo se parece a lo que pasó?" sobre "con calma" sería evaluar si la
    // persona logró estar en calma, que es lo que §5.3 prohíbe.
    expect(copy.lumia.diario.noche.aprendizaje.granVisionPregunta).toMatch(/se parece/i)
    expect(JSON.stringify(copy.lumia.intencion)).not.toMatch(/se parece|lograste|cumpl/i)
  })
})

describe('el copy no comparte formulación con la gran visión (RN-LU-INT-04)', () => {
  it('una pregunta es por el cómo y la otra por el qué', () => {
    expect(copy.lumia.intencion.pregunta).toMatch(/con qué intención/i)
    expect(copy.lumia.diario.manana.granVision.titulo).toMatch(/qué haría/i)
    expect(copy.lumia.intencion.pregunta).not.toBe(copy.lumia.diario.manana.granVision.titulo)
  })

  it('el marcador de posición no invita a escribir de más', () => {
    expect(copy.lumia.intencion.otra.placeholder.length).toBeLessThan(30)
    expect(copy.lumia.intencion.otra.placeholder).not.toMatch(/imagina|describe|cuenta/i)
  })

  it('los chips pasan el mismo listón de voz que el copy (§3.6)', () => {
    // `lint:copy` y la prueba de separación miran `copy.lumia`; los chips viven
    // en `content/` y se quedarían fuera si no se revisaran aquí.
    const prohibido = /fallaste|incumpliste|abandonaste|deber[íi]as?|h[áa]bito|racha|[¡!]/i
    TEXTOS.forEach((texto) => expect(texto).not.toMatch(prohibido))
  })
})
