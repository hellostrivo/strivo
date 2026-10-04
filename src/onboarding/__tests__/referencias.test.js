// src/onboarding/__tests__/referencias.test.js
// Las referencias de las frases en el onboarding y en Tu perfil (SPEC_29 §5–§7):
// el copy es el del encargo, las dos superficies hacen la misma pregunta con
// las mismas piezas, la elección se guarda y se relee, y no bloquea nada.

import { readFileSync } from 'fs'
import { beforeEach, describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { copy } from '@copy'
import { initUserTree, shared } from '@/lib/db'
import { listQueue } from '@/lib/db/local'
import { UID, resetLocalDB } from '../../lib/db/__tests__/helpers.js'
import * as escritura from '../escritura.js'
import { RESPUESTAS_INICIALES } from '../estado.js'
import { PreguntaAfinidades, PreguntaModo } from '@components/shared/PreguntasReferencias'
import { textoDeEleccion } from '@components/perfil/TusFrases'
import {
  AFINIDADES,
  MODOS,
  alternarAfinidad,
  alternarModo,
  normalizar,
  paraGuardar,
} from '@/referencias/preferencias'

const textos = copy.diario.onboarding

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('el copy es el del encargo, literal', () => {
  it('pregunta 1', () => {
    expect(textos.p5r).toEqual({
      titulo: 'Haz tuyas tus frases',
      apoyo:
        'Si te hace sentido, podemos considerar referencias espirituales, religiosas o filosóficas. Es opcional y puedes cambiarlo cuando quieras.',
      pregunta: '¿Qué tipo de referencias te gustaría encontrar?',
      opciones: {
        guiadas: 'Quiero elegir referencias',
        espirituales_generales: 'Espirituales, sin una tradición específica',
        seculares: 'Prefiero frases seculares',
        sin_definir: 'Prefiero decidir después',
      },
    })
  })

  it('pregunta 2', () => {
    expect(textos.p5ra.titulo).toBe('Elige tus referencias')
    expect(textos.p5ra.apoyo).toBe(
      'Puedes elegir más de una. Esto solo orienta las referencias que pueden aparecer en tus frases.',
    )
    expect(textos.p5ra.pregunta).toBe('¿Qué referencias te gustaría considerar?')
    expect(textos.p5ra.opciones).toEqual({
      cristianismo: 'Cristianismo',
      budismo: 'Budismo',
      hinduismo: 'Hinduismo',
      estoicismo: 'Estoicismo',
    })
    expect(textos.p5ra.omitir).toBe('Omitir por ahora')
  })

  it('Tu perfil hace las mismas preguntas con el mismo objeto, no con una copia', () => {
    const frases = copy.diario.perfil.frases
    expect(frases.preguntas.modo).toBe(textos.p5r)
    expect(frases.preguntas.afinidades).toBe(textos.p5ra)
    expect(frases.titulo).toBe('Personaliza tus frases')
    expect(frases.hint).toBe(
      'Elige qué referencias, si alguna, te gustaría encontrar en tus frases diarias.',
    )
    expect(frases.elegir).toBe('Elegir mis referencias')
    expect(frases.nota).toBe(
      'Usamos esta elección solo para seleccionar tus frases. Puedes cambiarla o borrarla cuando quieras.',
    )
  })

  it('nadie pregunta en qué crees', () => {
    const todo = JSON.stringify([textos.p5r, textos.p5ra, copy.diario.perfil.frases])
    expect(todo).not.toMatch(/en qué crees|creyente|ateo|religios[oa] eres|tu religión|tu fe/i)
  })

  it('cada opción del catálogo tiene su texto, y ninguna sobra', () => {
    expect(Object.keys(textos.p5r.opciones).sort()).toEqual([...MODOS].sort())
    expect(Object.keys(textos.p5ra.opciones).sort()).toEqual([...AFINIDADES].sort())
  })
})

describe('las piezas de las preguntas', () => {
  const pintar = (componente, props) => renderToStaticMarkup(createElement(componente, props))

  it('son chips con aria-pressed, agrupados y con etiqueta, y lo elegido lleva marca', () => {
    const html = pintar(PreguntaModo, { textos: textos.p5r, valor: 'seculares', onTocar: () => {} })
    expect(html).toContain('role="group"')
    expect(html).toContain(`aria-label="${textos.p5r.pregunta}"`)
    expect((html.match(/aria-pressed="true"/g) ?? []).length).toBe(1)
    expect((html.match(/aria-pressed="false"/g) ?? []).length).toBe(3)
    expect(html).toContain('✓')
    expect(html).toContain('<h1')
  })

  it('la segunda admite varias y siempre ofrece seguir sin elegir', () => {
    const html = pintar(PreguntaAfinidades, {
      textos: textos.p5ra,
      valor: ['budismo', 'estoicismo'],
      onTocar: () => {},
      onOmitir: () => {},
      nivel: 'h3',
    })
    expect((html.match(/aria-pressed="true"/g) ?? []).length).toBe(2)
    expect(html).toContain(textos.p5ra.omitir)
    expect(html).toContain('<h3')
  })

  it('nada bloquea: ni disabled, ni required, ni aria-invalid', () => {
    for (const ruta of [
      'src/components/shared/PreguntasReferencias.jsx',
      'src/components/perfil/TusFrases.jsx',
    ]) {
      expect(codigoDe(ruta)).not.toMatch(/disabled|required|aria-invalid/)
    }
  })

  it('el onboarding y Tu perfil montan las mismas piezas', () => {
    for (const ruta of [
      'src/components/onboarding/Onboarding.jsx',
      'src/components/perfil/TusFrases.jsx',
    ]) {
      expect(codigoDe(ruta)).toMatch(/from '@components\/shared\/PreguntasReferencias'/)
    }
  })

  it('la tarjeta de Hoy no enlaza a la configuración', () => {
    const tarjeta = codigoDe('src/components/diario/FraseDelDia.jsx')
    expect(tarjeta).not.toMatch(/referencias|perfil|onClick|<a |<button/i)
  })
})

describe('la elección', () => {
  it('un toque elige y otro suelta; las afinidades se suman sin orden', () => {
    expect(alternarModo(null, 'guiadas')).toBe('guiadas')
    expect(alternarModo('guiadas', 'guiadas')).toBeNull()
    expect(alternarModo('guiadas', 'seculares')).toBe('seculares')
    expect(alternarAfinidad(['budismo'], 'estoicismo')).toEqual(['budismo', 'estoicismo'])
    expect(alternarAfinidad(['budismo'], 'budismo')).toEqual([])
    expect(alternarAfinidad([], 'otra')).toEqual([])
  })

  it('se guarda normalizada: orden alfabético, sin repetidos y sin afinidades fuera de «guiadas»', () => {
    expect(
      paraGuardar({ modo: 'guiadas', afinidades: ['hinduismo', 'budismo', 'budismo', 'x'] }),
    ).toEqual({ modo: 'guiadas', afinidades: ['budismo', 'hinduismo'], version: 1 })
    expect(normalizar({ modo: 'seculares', afinidades: ['budismo'] })).toEqual({
      modo: 'seculares',
      afinidades: [],
    })
    expect(normalizar({ modo: 'inventado' }).modo).toBe('sin_definir')
  })

  it('Tu perfil la cuenta con palabras', () => {
    const frases = copy.diario.perfil.frases
    expect(textoDeEleccion(null)).toBe(frases.actual.ninguna)
    expect(
      textoDeEleccion({ modo: 'guiadas', afinidades: ['budismo', 'estoicismo', 'hinduismo'] }),
    ).toBe('Referencias de Budismo, Estoicismo y Hinduismo.')
    expect(textoDeEleccion({ modo: 'guiadas', afinidades: ['cristianismo'] })).toBe(
      'Referencias de Cristianismo.',
    )
    expect(textoDeEleccion({ modo: 'guiadas', afinidades: [] })).toBe(
      frases.actual.guiadasSinElegir,
    )
    expect(textoDeEleccion({ modo: 'seculares', afinidades: [] })).toBe(frases.actual.seculares)
  })
})

describe('el onboarding guarda y relee la elección, solo en el dispositivo', () => {
  beforeEach(resetLocalDB)

  it('se escribe al tocar y se relee al retomar', async () => {
    await initUserTree(UID)
    const { carga } = await escritura.leerRecorrido(UID)
    await escritura.escribirReferencias(UID, carga, {
      ...RESPUESTAS_INICIALES,
      referenciasModo: 'guiadas',
      afinidades: ['estoicismo', 'budismo'],
    })
    const relectura = await escritura.leerRecorrido(UID)
    const respuestas = escritura.respuestasDe(
      relectura.perfil,
      relectura.expediente,
      RESPUESTAS_INICIALES,
      relectura.referencias,
    )
    expect(respuestas.referenciasModo).toBe('guiadas')
    expect(respuestas.afinidades).toEqual(['budismo', 'estoicismo'])
  })

  it('soltar el modo deja la pregunta sin contestar y borra la elección', async () => {
    await initUserTree(UID)
    const { carga } = await escritura.leerRecorrido(UID)
    await escritura.escribirReferencias(UID, carga, {
      referenciasModo: 'seculares',
      afinidades: [],
    })
    await escritura.escribirReferencias(UID, carga, { referenciasModo: null, afinidades: [] })
    expect(await shared.getFrasesPreferencias(UID)).toBeNull()
  })

  it('no sube nada a la cola de Firestore', async () => {
    await initUserTree(UID)
    const antes = (await listQueue(UID)).map((e) => e.path)
    const { carga } = await escritura.leerRecorrido(UID)
    await escritura.escribirReferencias(UID, carga, {
      referenciasModo: 'guiadas',
      afinidades: ['cristianismo'],
    })
    expect((await listQueue(UID)).map((e) => e.path)).toEqual(antes)
  })
})
