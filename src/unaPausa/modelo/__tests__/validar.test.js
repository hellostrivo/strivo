// SPEC_28.1 §4.6 — el validador.
import { describe, expect, it } from 'vitest'
import { contarPalabras } from '../../../lib/palabras.js'
import { EXENCION_UNA_PAUSA, esValida, validar } from '../validar.js'
import { enEstado, programada, reserva } from './capsulas.js'

const faltas = (c) => validar(c).faltas.map((f) => f.codigo)
const avisos = (c) => validar(c).avisos.map((f) => f.codigo)
const conCampo = (lista) => lista.map((f) => `${f.codigo} ${f.campo}`)

const revision = (cambios = {}) => ({ ...enEstado(programada(), 'en_revision'), ...cambios })

describe('las cápsulas de ejemplo pasan', () => {
  it.each(['en_revision', 'prevalidada', 'aprobada', 'programada'])(
    'en %s, sin faltas ni avisos',
    (estado) => {
      expect(validar(enEstado(programada(), estado))).toEqual({ faltas: [], avisos: [] })
    },
  )

  it('la reserva también', () => {
    expect(validar(reserva('r1', '2026-11-01'))).toEqual({ faltas: [], avisos: [] })
  })
})

describe('criterio 7: una falta por caso en en_revision', () => {
  it('cuatro hallazgos', () => {
    expect(faltas(revision({ keyFindings: ['Uno.', 'Dos.', 'Tres.', 'Cuatro.'] }))).toEqual([
      'hallazgos.cantidad',
    ])
  })

  it('sin fuentes', () => {
    expect(faltas(revision({ sources: [] }))).toEqual(['fuentes.falta'])
  })

  it('«terapia» en la apertura', () => {
    expect(faltas(revision({ opening: 'Esto no es terapia.' }))).toEqual(['lexico.terapia'])
  })

  it('«!» en el título', () => {
    expect(faltas(revision({ title: 'Hacer espacio!' }))).toEqual(['lexico.exclamacion'])
  })

  it('321 palabras visibles', () => {
    const base = revision({ opening: '' })
    const resto = contarPalabras(
      [
        base.title,
        base.evidenceSummary,
        ...base.keyFindings,
        base.practiceLabel,
        base.journalPrompt,
      ].join(' '),
    )
    const opening = Array.from({ length: 321 - resto }, () => 'calma').join(' ')
    expect(faltas({ ...base, opening })).toEqual(['lectura.larga'])
    const justa = Array.from({ length: 320 - resto }, () => 'calma').join(' ')
    expect(faltas({ ...base, opening: justa })).toEqual([])
  })

  it('las fuentes, el tema y el texto de la portada no cuentan como lectura', () => {
    const largo = Array.from({ length: 400 }, () => 'luz').join(' ')
    expect(faltas(revision({ theme: largo, coverAltText: largo }))).toEqual([])
  })
})

describe('criterio 8: la exención léxica (DP-28.13, provisional)', () => {
  it('nombra estrés y ansiedad, y nada más', () => {
    expect(EXENCION_UNA_PAUSA).toEqual(['ansiedad', 'estres'])
  })

  it('«estrés» y «ansiedad» en evidenceSummary no dan falta, tampoco en plural', () => {
    const texto =
      'Algunos estudios sugieren que el estrés y la ansiedad pueden bajar. Estreses y ansiedades.'
    expect(faltas(revision({ evidenceSummary: texto }))).toEqual([])
  })

  it('«estrés.» al final de frase tampoco', () => {
    expect(faltas(revision({ opening: 'A veces llega el estrés.' }))).toEqual([])
  })

  it('«ansioso» y «estresante» sí', () => {
    expect(faltas(revision({ opening: 'Un día ansioso.' }))).toEqual(['lexico.ansioso'])
    expect(faltas(revision({ opening: 'Un día estresante.' }))).toEqual(['lexico.estres-derivados'])
  })

  it('el título de una fuente se cita como es', () => {
    const fuente = { ...programada().sources[0], title: 'Anxiety and stress: terapia, estrés!' }
    expect(faltas(revision({ sources: [fuente] }))).toEqual([])
  })

  it('el resto de CLINICO y FORBIDDEN sigue fuera, en cualquier campo de lectura', () => {
    expect(conCampo(validar(revision({ keyFindings: ['Sin síntomas.'] })).faltas)).toEqual([
      'lexico.sintoma keyFindings[0]',
    ])
    expect(faltas(revision({ practiceLabel: 'Una racha de calma' }))).toEqual(['lexico.racha'])
    expect(faltas(revision({ theme: 'El pánico' }))).toEqual(['lexico.panico'])
    expect(faltas(revision({ coverAltText: 'Una persona en tratamiento.' }))).toEqual([
      'lexico.tratamiento',
    ])
  })

  it('una regla que está en FORBIDDEN y en CLINICO da una sola falta', () => {
    expect(faltas(revision({ opening: 'Un trastorno.' }))).toEqual(['lexico.trastorno'])
  })

  it('una expresión global de la lista no arrastra estado entre llamadas', () => {
    const c = revision({ opening: 'Una racha.' })
    expect(faltas(c)).toEqual(['lexico.racha'])
    expect(faltas(c)).toEqual(['lexico.racha'])
  })

  it('el texto en NFD se lee igual', () => {
    expect(faltas(revision({ opening: 'Sin pánico.' }))).toEqual(['lexico.panico'])
  })
})

describe('el léxico ampliado de Una pausa', () => {
  it.each([
    ['La depresión.', 'lexico.depresion'],
    ['La salud mental.', 'lexico.salud-mental'],
    ['Sin diagnóstico.', 'lexico.diagnostico'],
    ['Tienes que parar.', 'lexico.tienes-que'],
    ['Debes descansar.', 'lexico.debes'],
  ])('«%s» da falta', (texto, codigo) => {
    expect(faltas(revision({ opening: texto }))).toEqual([codigo])
  })

  it.each([
    ['Sin metas.', 'lexico.meta'],
    ['Un progreso.', 'lexico.progreso'],
    ['Nada pendiente.', 'lexico.pendiente'],
  ])('«%s» da aviso y no falta', (texto, codigo) => {
    const c = revision({ opening: texto })
    expect(faltas(c)).toEqual([])
    expect(avisos(c)).toEqual([codigo])
  })
})

describe('avisos: promesas y atenuación', () => {
  it('«te hará mañana» es una promesa, con su tilde y su espacio detrás', () => {
    const c = revision({ opening: 'Esto te hará mañana otra persona.' })
    expect(faltas(c)).toEqual([])
    expect(avisos(c)).toEqual(['promesa.te-hara'])
  })

  it.each([
    ['Garantiza calma.', 'promesa.garantiza'],
    ['Elimina el ruido.', 'promesa.elimina'],
    ['Está comprobado que sirve.', 'promesa.comprobado-que'],
    ['Está demostrado que sirve.', 'promesa.demostrado-que'],
    ['Está probado.', 'promesa.esta-probado'],
    ['Te vas a sentir ligera.', 'promesa.te-vas-a-sentir'],
    ['Te sentirás mejor.', 'promesa.te-sentiras'],
  ])('«%s»', (texto, codigo) => {
    expect(avisos(revision({ opening: texto }))).toEqual([codigo])
  })

  it('un resumen sin ninguna forma atenuada avisa', () => {
    const c = revision({ evidenceSummary: 'Una pausa breve ayuda a notar el cuerpo.' })
    expect(faltas(c)).toEqual([])
    expect(avisos(c)).toEqual(['atenuacion.falta'])
  })

  it.each([
    'Sugiere que ayuda.',
    'Se asocia con calma.',
    'Pueden ayudar.',
    'Podría ayudar.',
    'Parece ayudar.',
    'Tiende a ayudar.',
    'Se relaciona con la calma.',
  ])('«%s» cuenta como atenuada', (resumen) => {
    expect(avisos(revision({ evidenceSummary: resumen }))).toEqual([])
  })

  it('los avisos no bloquean', () => {
    expect(esValida(revision({ opening: 'Garantiza calma.' }))).toBe(true)
  })
})

describe('el resto de las reglas desde en_revision', () => {
  it('texto que falta', () => {
    expect(conCampo(validar(revision({ title: ' ', theme: undefined })).faltas)).toEqual([
      'texto.falta title',
      'texto.falta theme',
    ])
  })

  it('una sola invitación', () => {
    expect(faltas(revision({ practiceLabel: undefined }))).toEqual(['practica.incompleta'])
    expect(faltas(revision({ practiceDestination: undefined }))).toEqual(['practica.incompleta'])
    expect(faltas(revision({ practiceDestination: 'podcast' }))).toEqual(['practica.incompleta'])
    expect(faltas(revision({ practiceDestination: 'in_capsule' }))).toEqual(['practica.incompleta'])
    expect(
      faltas(revision({ practiceDestination: 'in_capsule', practiceText: 'Mira tus manos.' })),
    ).toEqual([])
    expect(faltas(revision({ practiceText: 'Mira tus manos.' }))).toEqual(['practica.incompleta'])
    expect(faltas(revision({ practiceDestination: undefined, practiceLabel: undefined }))).toEqual(
      [],
    )
  })

  it('una sola pregunta, que abre con «¿», termina en «?» y cabe en 140 caracteres', () => {
    expect(faltas(revision({ journalPrompt: '¿Qué noté? ¿Y qué más?' }))).toEqual([
      'pregunta.forma',
    ])
    expect(faltas(revision({ journalPrompt: 'Qué noté hoy.' }))).toEqual(['pregunta.forma'])
    expect(faltas(revision({ journalPrompt: 'Qué me ocupa hoy?' }))).toEqual(['pregunta.forma'])
    expect(faltas(revision({ journalPrompt: 'Y hoy, ¿qué me ocupa?' }))).toEqual([])
    expect(faltas(revision({ journalPrompt: `¿${'a'.repeat(139)}?` }))).toEqual(['pregunta.forma'])
    expect(faltas(revision({ journalPrompt: `¿${'á'.repeat(138)}?` }))).toEqual([])
    expect(faltas(revision({ journalPrompt: undefined }))).toEqual([])
  })

  it('fuentes completas', () => {
    const f = programada().sources[0]
    expect(
      conCampo(
        validar(
          revision({
            sources: [{ ...f, year: undefined, originalUrl: 'http://example.org', doi: 'doi:1' }],
          }),
        ).faltas,
      ),
    ).toEqual([
      'fuentes.incompleta sources[0].year',
      'fuentes.incompleta sources[0].originalUrl',
      'fuentes.doi sources[0].doi',
    ])
    expect(faltas(revision({ sources: [{ ...f, year: null, doi: undefined }] }))).toEqual([])
    expect(faltas(revision({ sources: [{ ...f, authorsOrInstitution: '' }] }))).toEqual([
      'fuentes.incompleta',
    ])
  })

  it('una cápsula que no es reserva lleva semana', () => {
    expect(faltas(revision({ weekStart: null }))).toEqual(['semana.falta'])
  })
})

describe('desde prevalidada', () => {
  const pre = (cambios = {}) => ({ ...enEstado(programada(), 'prevalidada'), ...cambios })

  it('todas las fuentes revisadas', () => {
    const f = programada().sources[0]
    expect(conCampo(validar(pre({ sources: [f, { ...f, reviewed: false }] })).faltas)).toEqual([
      'fuentes.sin-revisar sources[1].reviewed',
    ])
    expect(faltas(revision({ sources: [{ ...f, reviewed: false }] }))).toEqual([])
  })

  it('portada y su texto', () => {
    expect(conCampo(validar(pre({ coverAsset: '', coverAltText: null })).faltas)).toEqual([
      'portada.falta coverAsset',
      'portada.falta coverAltText',
    ])
  })

  it('criterio 9: prevalidada 27 días antes da falta; 28, no', () => {
    expect(faltas(pre({ prevalidatedAt: '2026-11-10T08:00:00-06:00' }))).toEqual([
      'plazo.cuatro-semanas',
    ])
    expect(faltas(pre({ prevalidatedAt: '2026-11-09T23:59:59-06:00' }))).toEqual([])
    // El día es el de Monterrey: las 05:00 UTC del 10 son todavía el 9.
    expect(faltas(pre({ prevalidatedAt: '2026-11-10T05:00:00Z' }))).toEqual([])
  })

  it('criterio 11: un correo no es una editora', () => {
    expect(faltas(pre({ reviewedBy: 'team@hellostrivo.com' }))).toEqual([
      'estado.editora-desconocida',
    ])
  })
})

describe('desde aprobada', () => {
  const apr = (cambios = {}) => ({ ...enEstado(programada('2026-12-07'), 'aprobada'), ...cambios })

  it('criterio 10: a más tardar el miércoles previo, 23:59:59 en Monterrey', () => {
    expect(faltas(apr({ approvedAt: '2026-12-02T23:59:59-06:00' }))).toEqual([])
    expect(faltas(apr({ approvedAt: '2026-12-03T00:00:00-06:00' }))).toEqual([
      'plazo.validacion-final',
    ])
    expect(faltas(apr({ approvedAt: '2026-12-02T10:00:00-06:00' }))).toEqual([])
  })

  it('el plazo también rige para una programada', () => {
    expect(
      faltas({ ...programada('2026-12-07'), approvedAt: '2026-12-04T10:00:00-06:00' }),
    ).toEqual(['plazo.validacion-final'])
  })

  it('una reserva no tiene plazos: no tiene semana', () => {
    expect(faltas(reserva('r', '2026-12-06'))).toEqual([])
  })
})

describe('la forma del archivo, en cualquier estado', () => {
  it('un campo que no existe', () => {
    expect(conCampo(validar({ ...programada(), keyFinding: 'Uno.' }).faltas)).toEqual([
      'campo.desconocido keyFinding',
    ])
    const f = { ...programada().sources[0], url: 'https://x.org' }
    expect(conCampo(validar({ status: 'borrador', sources: [f] }).faltas)).toEqual([
      'campo.desconocido sources[0].url',
    ])
    expect(
      conCampo(validar({ ...programada(), reviewedSections: ['opening', 'portada'] }).faltas),
    ).toEqual([
      'campo.desconocido reviewedSections[1]',
      'estado.revision-incompleta reviewedSections',
    ])
  })

  it('fechas mal escritas y semanas que no empiezan en lunes', () => {
    expect(conCampo(validar({ status: 'borrador', weekStart: '2026-12-8' }).faltas)).toEqual([
      'fecha.forma weekStart',
    ])
    expect(conCampo(validar({ status: 'borrador', weekStart: '2026-12-08' }).faltas)).toEqual([
      'semana.no-es-lunes weekStart',
    ])
    expect(
      conCampo(validar({ status: 'borrador', generatedAt: '2026-10-20 10:00' }).faltas),
    ).toEqual(['fecha.forma generatedAt'])
  })
})

describe('borrador y rechazada: solo el léxico', () => {
  it.each(['borrador', 'rechazada'])('%s incompleta no da faltas de contenido', (status) => {
    expect(validar({ status, title: 'A medias' })).toEqual({ faltas: [], avisos: [] })
  })

  it.each(['borrador', 'rechazada'])('%s sí da faltas de léxico', (status) => {
    expect(faltas({ status, title: 'Calma!', opening: 'Una terapia.' })).toEqual([
      'lexico.exclamacion',
      'lexico.terapia',
    ])
  })

  it('un tema calendarizado no pasa por el léxico todavía', () => {
    expect(validar({ status: 'tema_calendarizado', theme: 'Calma!' })).toEqual({
      faltas: [],
      avisos: [],
    })
  })
})

describe('códigos, no frases (RN-TEC-02)', () => {
  it('todo lo que devuelve el validador es un código', () => {
    const peor = {
      ...programada(),
      title: '¡Calma!',
      opening: 'Terapia garantiza todo.',
      keyFinding: 'x',
      sources: [],
      reviewedBy: 'alguien',
    }
    const { faltas: f, avisos: a } = validar(peor)
    expect(f.length).toBeGreaterThan(3)
    for (const { codigo } of [...f, ...a]) expect(codigo).toMatch(/^[a-z]+(\.[a-z-]+)+$/)
  })

  it('aguanta una entrada que no es una cápsula', () => {
    expect(faltas(null)).toEqual(['estado.desconocido'])
    expect(faltas('hola')).toEqual(['estado.desconocido'])
  })
})
