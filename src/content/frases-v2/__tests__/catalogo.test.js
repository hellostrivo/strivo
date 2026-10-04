// src/content/frases-v2/__tests__/catalogo.test.js
// El catálogo v2 cumple sus reglas editoriales y de cobertura (SPEC_29 §8–§10, §14).
// Son las mismas reglas que `scripts/validar-frases.js`: viven en `validacion.js`.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { APROBADAS, FRASES_V2, TEMAS } from '@/content/frases-v2'
import { cita, originales } from '@/content/frases-v2/construir'
import {
  MINIMO_POR_PERFIL,
  MINIMO_POR_TEMA,
  coberturaPorPerfil,
  problemasDeCobertura,
  problemasDeDuplicados,
  problemasDeEntradas,
  problemasDeFuentes,
} from '@/content/frases-v2/validacion'
import { perfilesPosibles } from '@/referencias/preferencias'

const DOCUMENTO = readFileSync('docs/frases-v2-fuentes.md', 'utf8')

describe('catálogo v2', () => {
  it('cada entrada trae sus metadatos, su voz y su forma en regla', () => {
    expect(problemasDeEntradas(FRASES_V2)).toEqual([])
  })

  it('no hay duplicados ni casi duplicados después de normalizar', () => {
    expect(problemasDeDuplicados(FRASES_V2)).toEqual([])
  })

  it('cada perfil posible ve al menos 500 frases aprobadas y 100 por tema', () => {
    expect(problemasDeCobertura(FRASES_V2)).toEqual([])
    const cobertura = coberturaPorPerfil(FRASES_V2)
    expect(cobertura).toHaveLength(perfilesPosibles().length)
    for (const perfil of cobertura) {
      expect(perfil.total).toBeGreaterThanOrEqual(MINIMO_POR_PERFIL)
      TEMAS.forEach((tema) => expect(perfil.porTema[tema]).toBeGreaterThanOrEqual(MINIMO_POR_TEMA))
    }
  })

  it('toda cita tiene expediente completo, y ninguna está aprobada sin las dos firmas', () => {
    expect(problemasDeFuentes(FRASES_V2, DOCUMENTO)).toEqual([])
  })

  it('solo lo aprobado llega a la app, y no hay borradores aprobados a medias', () => {
    expect(APROBADAS.every((f) => f.estado === 'aprobada')).toBe(true)
    expect(FRASES_V2.filter((f) => f.estado !== 'aprobada').every((f) => f.tipo === 'cita')).toBe(
      true,
    )
  })

  it('las originales no llevan comillas ni atribución; las citas sí la llevan', () => {
    for (const frase of FRASES_V2) {
      if (frase.tipo === 'original') {
        expect(frase.atribucion).toBeNull()
        expect(frase.texto).not.toMatch(/[«»“”"]/)
      } else {
        expect(frase.atribucion).toMatch(/ · /)
        expect(frase.fuenteClave).toBeTruthy()
      }
    }
  })

  it('el esfuerzo nunca es apto con ánimo bajo', () => {
    FRASES_V2.filter((f) => f.tema === 'esfuerzo').forEach((f) =>
      expect(f.aptaConAnimoBajo).toBe(false),
    )
  })
})

describe('las validaciones muerden', () => {
  const una = (texto, audiencia = 'universal', tema = 'calma') =>
    originales(audiencia, { [tema]: [texto] })

  it('detectan léxico prohibido, exclamaciones y frases largas', () => {
    const casos = [
      'Siempre puedes respirar.',
      'Tienes que descansar.',
      'Solo hoy importa.',
      'Respira hondo.!',
      'Cumple tu meta del día.',
      `${'Una frase demasiado larga '.repeat(7)}.`,
    ]
    for (const texto of casos)
      expect(problemasDeEntradas(una(texto)).length, texto).toBeGreaterThan(0)
  })

  it('detectan una referencia religiosa en lo universal o lo secular', () => {
    expect(problemasDeEntradas(una('Dios acompaña tu calma.')).map((p) => p.regla)).toContain(
      'referencia-en-neutral',
    )
    expect(problemasDeEntradas(una('Medita un momento.', 'secular')).length).toBeGreaterThan(0)
  })

  it('detectan una tradición concreta en lo espiritual general y en otra tradición', () => {
    expect(
      problemasDeEntradas(una('El Buda enseñó la calma.', 'espiritual_general')).length,
    ).toBeGreaterThan(0)
    expect(problemasDeEntradas(una('Jesús también meditaba.', 'budismo')).length).toBeGreaterThan(0)
  })

  it('detectan duplicados normalizados', () => {
    const a = una('Un paso pequeño también cuenta.')
    const b = originales('secular', { calma: ['un paso pequeño, también cuenta'] })
    expect(problemasDeDuplicados([...a, ...b]).map((p) => p.regla)).toContain('duplicado')
  })

  it('detectan una cita sin expediente y una aprobada sin firmas', () => {
    const base = {
      texto: 'Texto de prueba.',
      tema: 'calma',
      audiencias: ['universal'],
      atribucion: 'Alguien · Obra, 1',
    }
    const sinExpediente = cita({
      ...base,
      id: 'C-1',
      estado: 'pendiente_revision',
      fuenteClave: 'NO-EXISTE',
    })
    expect(problemasDeFuentes([sinExpediente], DOCUMENTO).map((p) => p.regla)).toContain(
      'cita-sin-expediente',
    )
    const aprobadaSinFirma = cita({
      ...base,
      id: 'C-2',
      estado: 'aprobada',
      fuenteClave: 'MARTI-EDAD-ORO-TRES-HEROES',
    })
    expect(problemasDeFuentes([aprobadaSinFirma], DOCUMENTO).map((p) => p.regla)).toContain(
      'cita-aprobada-sin-firma',
    )
  })

  it('detectan un perfil por debajo de 500', () => {
    expect(problemasDeCobertura(APROBADAS.slice(0, 300)).length).toBeGreaterThan(0)
  })
})
