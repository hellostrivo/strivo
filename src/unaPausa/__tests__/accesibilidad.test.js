// SPEC_28.3 §4.8 — accesibilidad y contraste de Una pausa.
//
// Lo que se puede comprobar sin navegador: el orden de encabezados de cada
// vista, que todo lo que se toca tiene foco visible y su objetivo táctil, que
// nada fija un color, y que el contraste se apoya en pares ya medidos. El
// escalado al 200 % y el recorrido con teclado se comprobaron en Chromium y
// quedan para la validación manual (M1, M4).
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Archivo from '../Archivo.jsx'
import Capsula from '../Capsula.jsx'
import Estado from '../Estado.jsx'

const entrada = {
  id: 'calma',
  title: 'Calma',
  opening: 'Apertura.',
  evidenceSummary: 'Resumen.',
  keyFindings: ['Uno.'],
  practiceDestination: 'breathing',
  practiceLabel: 'Respira un momento',
  journalPrompt: '¿Qué noto?',
  generatedWithAi: true,
  publicadaEl: '2026-12-07',
  fuentes: [
    { title: 'F', authorsOrInstitution: 'I', year: 2020, originalUrl: 'https://x', doi: '10.1/x' },
  ],
}

const enRouter = (el) => renderToStaticMarkup(createElement(MemoryRouter, null, el))

const VISTAS = {
  vigente: enRouter(
    createElement(Capsula, {
      entrada,
      vigente: true,
      rutaRespiracion: '/respiracion',
      rutaArchivo: '/una-pausa/archivo',
    }),
  ),
  detalle: enRouter(createElement(Capsula, { entrada, rutaRespiracion: '/respiracion' })),
  archivo: enRouter(createElement(Archivo, { entradas: [entrada], base: '/una-pausa' })),
  cargando: renderToStaticMarkup(createElement(Estado, { estado: 'cargando' })),
  vacio: renderToStaticMarkup(createElement(Estado, { estado: 'vacio' })),
  error: renderToStaticMarkup(createElement(Estado, { estado: 'error', onReintentar: () => {} })),
}

const FUENTES = readdirSync('src/unaPausa')
  .filter((n) => n.endsWith('.jsx'))
  .map((n) => join('src/unaPausa', n))

describe('encabezados en orden, sin saltos', () => {
  for (const [vista, html] of Object.entries(VISTAS)) {
    it(`${vista}: un h1 al principio, y cada nivel baja de uno en uno`, () => {
      const niveles = [...html.matchAll(/<h([1-6])/g)].map((m) => Number(m[1]))
      expect(niveles[0]).toBe(1)
      expect(niveles.filter((n) => n === 1)).toHaveLength(1)
      niveles.forEach((n, i) => {
        if (i > 0) expect(n - niveles[i - 1]).toBeLessThanOrEqual(1)
      })
    })
  }

  it('el h1 de cada vista es el que recibe el foco, y no dibuja anillo', () => {
    for (const html of Object.values(VISTAS)) {
      expect(html).toMatch(/<h1[^>]*tabindex="-1"[^>]*class="una-pausa-encabezado/)
    }
    expect(readFileSync('src/styles/globals.css', 'utf8')).toMatch(
      /\.una-pausa-encabezado:focus \{\s*outline: none;/,
    )
  })
})

describe('todo se alcanza con teclado, con foco visible', () => {
  it('cada enlace y cada botón dibuja su foco', () => {
    for (const html of [VISTAS.vigente, VISTAS.archivo]) {
      const controles = [...html.matchAll(/<(a|button)\b[^>]*>/g)].map((m) => m[0])
      expect(controles.length).toBeGreaterThan(0)
      for (const c of controles) expect(c).toMatch(/focus-visible:ring-2/)
    }
  })

  it('el desplegable es un botón de verdad: Intro y Espacio sin código propio', () => {
    expect(VISTAS.vigente).toMatch(/<button type="button" aria-expanded="false"/)
    const fuente = readFileSync('src/unaPausa/Fuentes.jsx', 'utf8')
    expect(fuente).not.toMatch(/onKeyDown|onKeyUp|role="button"/)
  })

  it('ningún control tiene tabindex positivo, y nada se desactiva', () => {
    for (const html of Object.values(VISTAS)) {
      expect(html).not.toMatch(/tabindex="[1-9]/)
      // Como atributo: la clase `disabled:opacity-40` del botón de la casa no
      // desactiva nada.
      expect(html).not.toMatch(/ disabled=""| aria-invalid=| required=""/)
    }
  })

  it('los objetivos táctiles llegan a 44 px', () => {
    const controles = [...VISTAS.vigente.matchAll(/<a\b[^>]*>/g)].map((m) => m[0])
    for (const c of controles) expect(c).toMatch(/min-h-\[44px\]/)
    expect(VISTAS.archivo).toMatch(/<a[^>]*min-h-\[56px\]/)
  })
})

describe('el color lo decide la superficie (RN-VIS-02)', () => {
  it('ninguna pantalla de Una pausa fija un color de texto ni escribe un tono', () => {
    for (const ruta of FUENTES) {
      const codigo = readFileSync(ruta, 'utf8')
      expect(codigo, ruta).not.toMatch(/text-ink|text-paper|text-night|text-black|text-white/)
      expect(codigo, ruta).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
    }
  })

  it('el texto pide su superficie por su papel', () => {
    const todo = FUENTES.map((r) => readFileSync(r, 'utf8')).join('\n')
    expect(todo).toMatch(/text-on-surface\b/)
    expect(todo).toMatch(/text-on-surface-soft/)
    expect(todo).not.toMatch(/\btext-surface\b/)
  })
})

describe('el contraste se apoya en pares ya medidos', () => {
  const lint = readFileSync('scripts/lint-contraste.js', 'utf8')

  it('lint-contraste dice cuáles, y siguen ahí', () => {
    expect(lint).toMatch(/── Una pausa \(SPEC_28\.3/)
    for (const par of [
      'Mañana · cuerpo sobre base',
      'Mañana · secundario sobre base',
      'Noche · cuerpo sobre base',
      'Noche · secundario sobre base',
      'Secciones · sección activa sobre el cromo',
    ]) {
      expect(lint).toContain(`['${par}'`)
    }
  })

  it('las fuentes no van en tarjeta: bg-raised sobre la noche sería un par sin medir', () => {
    expect(readFileSync('src/unaPausa/Fuentes.jsx', 'utf8')).not.toMatch(/bg-raised/)
  })
})
