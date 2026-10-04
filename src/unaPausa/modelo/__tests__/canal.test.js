// SPEC_28.2 §4.1 — la forma del canal. Lo que llega al teléfono se prueba sobre
// la salida: la lista blanca, la vista previa y que nada se nombra sin archivo.
import { describe, expect, it } from 'vitest'
import {
  CAMPOS_PUBLICOS,
  CAMPOS_PUBLICOS_DE_FUENTE,
  FORMATO_CANAL,
  generarCanal,
  portadasPublicadas,
} from '../canal.js'
import { enEstado, programada, reserva } from './capsulas.js'

const lunes = (clave, hora = '00:00:00') => `${clave}T${hora}-06:00`
const ids = (lista) => lista.map((e) => e.id)

/** Una piloto completa, sin semana (5.2). */
const piloto = (id = 'piloto', status = 'aprobada') => ({
  ...enEstado(programada('2026-12-07', { id }), status),
  piloto: true,
  weekStart: null,
  scheduledAt: null,
})

describe('el canal vacío', () => {
  it('sin cápsulas: formato, semana y nada más', () => {
    expect(generarCanal([], lunes('2026-12-09', '12:00:00'))).toEqual({
      formato: 1,
      semana: '2026-12-07',
      vigente: null,
      archivo: [],
    })
    expect(FORMATO_CANAL).toBe(1)
  })

  it('aguanta lo que no es una lista', () => {
    expect(generarCanal(null, lunes('2026-12-07')).vigente).toBeNull()
  })
})

describe('una entrada', () => {
  const ahora = lunes('2026-12-14', '09:00:00')
  const c = programada('2026-12-07')
  const canal = generarCanal([c], ahora, { portadas: ['espacio.webp'] })

  it('lleva los campos públicos, su primera semana, sus fuentes y su portada, en ese orden', () => {
    expect(Object.keys(canal.vigente)).toEqual([
      ...CAMPOS_PUBLICOS.filter((k) => k in c),
      'publicadaEl',
      'fuentes',
      'portada',
    ])
    expect(canal.vigente.publicadaEl).toBe('2026-12-07')
    expect(canal.vigente.portada).toEqual({
      src: 'portadas/espacio.webp',
      alt: c.coverAltText,
    })
  })

  it('las fuentes, solo con su lista blanca: reviewed no sale', () => {
    expect(canal.vigente.fuentes).toEqual([
      {
        title: 'Anxiety and stress in everyday pauses',
        authorsOrInstitution: 'Grupo de ejemplo',
        year: 2020,
        originalUrl: 'https://example.org/pausas',
        doi: '10.1234/pausas.2020',
      },
    ])
    expect(CAMPOS_PUBLICOS_DE_FUENTE).not.toContain('reviewed')
  })

  it('nada editorial sale', () => {
    const json = JSON.stringify(canal)
    for (const campo of [
      'status',
      'weekStart',
      'reviewedBy',
      'approvedBy',
      'approvedAt',
      'scheduledAt',
      'prevalidatedAt',
      'reviewedSections',
      'reserva',
      'piloto',
      'reviewed',
      'coverAsset',
      'fundadora',
    ]) {
      expect(json).not.toContain(`"${campo}"`)
    }
    expect(json).not.toContain('fundadora')
  })

  it('un opcional vacío no se escribe; generatedWithAi en false sí', () => {
    const vacia = {
      ...c,
      practiceDestination: undefined,
      practiceLabel: null,
      journalPrompt: '',
      generatedWithAi: false,
      sources: [{ ...c.sources[0], doi: undefined, year: null }],
    }
    const { vigente } = generarCanal([vacia], ahora)
    expect(vigente).not.toHaveProperty('practiceDestination')
    expect(vigente).not.toHaveProperty('practiceLabel')
    expect(vigente).not.toHaveProperty('journalPrompt')
    expect(vigente.generatedWithAi).toBe(false)
    expect(vigente.fuentes[0]).not.toHaveProperty('doi')
    expect(vigente.fuentes[0]).not.toHaveProperty('year')
  })

  it('sin la portada en la lista, la entrada no la nombra', () => {
    expect(generarCanal([c], ahora).vigente).not.toHaveProperty('portada')
    expect(generarCanal([c], ahora, { portadas: ['otra.webp'] }).vigente).not.toHaveProperty(
      'portada',
    )
  })
})

describe('vigente y archivo salen de vigente.js, sin reordenar', () => {
  const capsulas = [
    reserva('r-nueva', '2026-11-15'),
    programada('2026-12-07'),
    reserva('r-vieja', '2026-11-01'),
  ]

  it('cada entrada lleva el lunes en que apareció por primera vez', () => {
    const canal = generarCanal(capsulas, lunes('2026-12-28', '09:00:00'))
    expect(canal.semana).toBe('2026-12-28')
    expect(canal.vigente.id).toBe('r-nueva')
    expect(canal.vigente.publicadaEl).toBe('2026-12-21')
    expect(canal.archivo.map((e) => [e.id, e.publicadaEl])).toEqual([
      ['r-vieja', '2026-12-14'],
      ['c-2026-12-07', '2026-12-07'],
    ])
  })
})

describe('criterio 8: la vista previa (DP-28.16)', () => {
  const ahora = lunes('2026-12-14', '09:00:00')
  const capsulas = [programada('2026-12-07'), programada('2026-12-14'), piloto()]

  it('una piloto aprobada y válida es la vigente, con la semana del canal', () => {
    const canal = generarCanal(capsulas, ahora, { vistaPrevia: true })
    expect(canal.vigente.id).toBe('piloto')
    expect(canal.vigente.publicadaEl).toBe('2026-12-14')
    // DP-28.19: la piloto también en el archivo, con la semana anterior. Comparte
    // fecha con `c-2026-12-07` y va detrás: no desplaza una publicada.
    expect(ids(canal.archivo)).toEqual(['c-2026-12-14', 'c-2026-12-07', 'piloto'])
  })

  it('en revisión también, si pasa validar', () => {
    const canal = generarCanal([piloto('piloto', 'en_revision')], ahora, { vistaPrevia: true })
    expect(canal.vigente.id).toBe('piloto')
    expect(ids(canal.archivo)).toEqual(['piloto'])
  })

  it('una piloto en borrador, inválida o rechazada, no', () => {
    for (const p of [
      piloto('piloto', 'borrador'),
      piloto('piloto', 'rechazada'),
      { ...piloto(), keyFindings: [] },
    ]) {
      const canal = generarCanal([programada('2026-12-14'), p], ahora, { vistaPrevia: true })
      expect(canal.vigente.id).toBe('c-2026-12-14')
    }
  })

  it('con dos, gana el id menor', () => {
    const canal = generarCanal([piloto('pb'), piloto('pa')], ahora, { vistaPrevia: true })
    expect(canal.vigente.id).toBe('pa')
  })

  it('DP-28.19: en el archivo, la misma cápsula con la semana del canal menos 7 días', () => {
    const canal = generarCanal([piloto('piloto', 'en_revision')], ahora, {
      vistaPrevia: true,
      portadas: ['espacio.webp'],
    })
    const [enArchivo] = canal.archivo
    expect(enArchivo.publicadaEl).toBe('2026-12-07')
    // Sin inventar nada: lo único que cambia es la fecha.
    expect({ ...enArchivo, publicadaEl: null }).toEqual({ ...canal.vigente, publicadaEl: null })
  })

  it('DP-28.19: en su sitio, de la más reciente a la más antigua', () => {
    const capsulas = [programada('2026-11-30'), programada('2026-12-14'), piloto()]
    const canal = generarCanal(capsulas, lunes('2026-12-21', '09:00:00'), { vistaPrevia: true })
    expect(canal.archivo.map((e) => [e.id, e.publicadaEl])).toEqual([
      ['c-2026-12-14', '2026-12-14'],
      ['piloto', '2026-12-14'],
      ['c-2026-11-30', '2026-11-30'],
    ])
    const otra = generarCanal(capsulas, lunes('2026-12-28', '09:00:00'), { vistaPrevia: true })
    // Una semana después la piloto es la más reciente, y va delante.
    expect(otra.archivo.map((e) => [e.id, e.publicadaEl])).toEqual([
      ['piloto', '2026-12-21'],
      ['c-2026-12-14', '2026-12-14'],
      ['c-2026-11-30', '2026-11-30'],
    ])
  })

  it('sin vistaPrevia, la piloto no aparece en ningún sitio', () => {
    const conCentinela = { ...piloto(), title: 'CENTINELA-PILOTO' }
    const canal = generarCanal([...capsulas.slice(0, 2), conCentinela], ahora)
    expect(JSON.stringify(canal)).not.toContain('CENTINELA-PILOTO')
    expect(canal.vigente.id).toBe('c-2026-12-14')
  })
})

describe('portadasPublicadas', () => {
  it('las que el canal nombra, una vez cada una y ordenadas', () => {
    const ahora = lunes('2026-12-21', '09:00:00')
    const capsulas = [
      programada('2026-12-07', { coverAsset: 'una.webp' }),
      programada('2026-12-14', { coverAsset: 'otra.webp' }),
      programada('2026-12-21', { coverAsset: 'una.webp' }),
    ]
    const canal = generarCanal(capsulas, ahora, { portadas: new Set(['una.webp', 'otra.webp']) })
    expect(portadasPublicadas(canal)).toEqual(['otra.webp', 'una.webp'])
    expect(portadasPublicadas(generarCanal(capsulas, ahora))).toEqual([])
    expect(portadasPublicadas(null)).toEqual([])
  })
})

describe('criterio 10: determinista', () => {
  it('el mismo contenido y el mismo instante dan el mismo JSON', () => {
    const capsulas = [programada('2026-12-07'), reserva('r', '2026-11-01'), piloto()]
    const ahora = lunes('2026-12-21', '09:00:00')
    const opciones = { vistaPrevia: true, portadas: ['espacio.webp'] }
    expect(JSON.stringify(generarCanal(capsulas, ahora, opciones))).toBe(
      JSON.stringify(generarCanal([...capsulas].reverse(), ahora, opciones)),
    )
  })
})
