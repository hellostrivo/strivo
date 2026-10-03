// SPEC_28.1 §4.3 — estados, transiciones y coherencia.
import { describe, expect, it } from 'vitest'
import { ESTADOS } from '../capsula.js'
import { ACTORES, REVISION_POR_SECCION, coherente, puedeTransitar } from '../estados.js'
import { enEstado, programada, reserva } from './capsulas.js'

// SPEC_28 §4.1, escrita aquí a mano y no leída de `TRANSICIONES`: si las dos se
// separan, esta prueba es la que lo dice. La fila de la IA desde nada es de la
// instrucción de 28.1 (§4.3).
const TABLA = [
  [null, 'tema_calendarizado', 'editora'],
  [null, 'borrador', 'ia'],
  ['tema_calendarizado', 'borrador', 'editora'],
  ['tema_calendarizado', 'borrador', 'ia'],
  ['borrador', 'en_revision', 'editora'],
  ['en_revision', 'borrador', 'editora'],
  ['en_revision', 'prevalidada', 'editora'],
  ['en_revision', 'rechazada', 'editora'],
  ['prevalidada', 'aprobada', 'editora'],
  ['prevalidada', 'en_revision', 'editora'],
  ['prevalidada', 'rechazada', 'editora'],
  ['aprobada', 'programada', 'editora'],
  ['aprobada', 'en_revision', 'editora'],
  ['programada', 'aprobada', 'editora'],
  ['programada', 'publicada', 'sistema'],
  ['publicada', 'archivada', 'sistema'],
  ['aprobada', 'publicada', 'sistema'], // solo con reserva: true
]
const enTabla = (de, a, actor) => TABLA.some(([d, h, x]) => d === de && h === a && x === actor)

describe('puedeTransitar (criterio 3)', () => {
  const casos = [null, ...ESTADOS].flatMap((de) =>
    ESTADOS.flatMap((a) => ACTORES.map((actor) => [de, a, actor])),
  )

  it('recorre todas las parejas de estados por los tres actores', () => {
    expect(casos).toHaveLength(10 * 9 * 3)
  })

  it.each(casos)('%s → %s por %s: solo si la tabla lo lista', (de, a, actor) => {
    expect(puedeTransitar(de, a, actor, { reserva: true })).toBe(enTabla(de, a, actor))
  })

  it('una aprobada solo se publica sola si es reserva', () => {
    expect(puedeTransitar('aprobada', 'publicada', 'sistema')).toBe(false)
    expect(puedeTransitar('aprobada', 'publicada', 'sistema', { reserva: false })).toBe(false)
    expect(puedeTransitar('aprobada', 'publicada', 'sistema', { reserva: true })).toBe(true)
  })

  it('la IA solo llega a borrador, y solo desde un tema o desde nada', () => {
    for (const a of ['en_revision', 'prevalidada', 'aprobada', 'programada', 'publicada']) {
      for (const de of [null, ...ESTADOS]) {
        expect(puedeTransitar(de, a, 'ia', { reserva: true })).toBe(false)
      }
    }
    const desdeDonde = [null, ...ESTADOS].filter((de) => puedeTransitar(de, 'borrador', 'ia'))
    expect(desdeDonde).toEqual([null, 'tema_calendarizado'])
  })

  it('undefined cuenta como «desde nada»', () => {
    expect(puedeTransitar(undefined, 'tema_calendarizado', 'editora')).toBe(true)
  })

  it('un actor que no existe no mueve nada', () => {
    expect(puedeTransitar('borrador', 'en_revision', 'fundadora')).toBe(false)
  })
})

describe('coherente', () => {
  const codigos = (c) => coherente(c).map((f) => `${f.codigo} ${f.campo}`)

  it('las cápsulas de ejemplo son coherentes', () => {
    expect(coherente(programada())).toEqual([])
    expect(coherente(reserva('r1', '2026-11-01'))).toEqual([])
  })

  it('un estado que no existe', () => {
    expect(codigos({ status: 'lista' })).toEqual(['estado.desconocido status'])
    expect(codigos({})).toEqual(['estado.desconocido status'])
  })

  it('publicada y archivada no se escriben en Fase A (desvío 4)', () => {
    expect(codigos(enEstado(programada(), 'publicada'))).toEqual([
      'estado.derivado-en-fase-a status',
    ])
    expect(codigos(enEstado(programada(), 'archivada'))).toEqual([
      'estado.derivado-en-fase-a status',
    ])
  })

  it('de en_revision en adelante, lo generado con IA lleva su fecha', () => {
    const c = { ...enEstado(programada(), 'en_revision'), generatedAt: null }
    expect(codigos(c)).toEqual(['estado.generado-sin-fecha generatedAt'])
    expect(codigos({ ...c, status: 'borrador' })).toEqual([])
  })

  it('de prevalidada en adelante, revisión completa y de una editora conocida', () => {
    const c = enEstado(programada(), 'prevalidada')
    expect(codigos({ ...c, reviewedBy: 'team@hellostrivo.com' })).toEqual([
      'estado.editora-desconocida reviewedBy',
    ])
    expect(codigos({ ...c, reviewedAt: null, prevalidatedAt: '' })).toEqual([
      'estado.revision-incompleta reviewedAt',
      'estado.revision-incompleta prevalidatedAt',
    ])
    expect(codigos({ ...c, reviewedSections: ['opening', 'evidence'] })).toEqual([
      'estado.revision-incompleta reviewedSections',
    ])
    expect(codigos({ ...c, reviewedAt: c.generatedAt })).toEqual([
      'estado.revision-antes-de-generar reviewedAt',
    ])
    expect(codigos({ ...c, generatedWithAi: false, reviewedAt: c.generatedAt })).toEqual([])
  })

  it('la marca por sección es un interruptor, y hoy está encendido', () => {
    expect(REVISION_POR_SECCION).toBe(true)
  })

  it('de aprobada en adelante, quién aprobó y cuándo', () => {
    const c = enEstado(programada(), 'aprobada')
    expect(codigos({ ...c, approvedBy: 'Alejandra' })).toEqual([
      'estado.editora-desconocida approvedBy',
    ])
    expect(codigos({ ...c, approvedAt: undefined })).toEqual(['estado.sin-aprobar approvedAt'])
  })

  it('programada lleva semana y fecha de programación', () => {
    expect(codigos({ ...programada(), weekStart: null, scheduledAt: null })).toEqual([
      'estado.sin-programar weekStart',
      'estado.sin-programar scheduledAt',
    ])
  })

  it('una reserva no tiene semana ni se programa', () => {
    expect(codigos({ ...reserva('r', '2026-11-01'), weekStart: '2026-12-14' })).toEqual([
      'estado.reserva-con-semana weekStart',
    ])
    expect(codigos({ ...programada(), reserva: true })).toEqual([
      'estado.reserva-con-semana weekStart',
      'estado.reserva-con-semana reserva',
    ])
  })

  it('a una rechazada no se le pide nada de lo que pide el recorrido', () => {
    expect(codigos({ status: 'rechazada' })).toEqual([])
  })
})
