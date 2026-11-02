// src/components/shared/__tests__/botonProveedor.test.js
// SPEC_21.2 §4.4 — el botón de Google o de Apple, compartido por P7, la vista
// de entrar y Tu perfil, y la excepción de marca del botón de Apple.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

import BotonProveedor from '@components/shared/BotonProveedor'
import FormularioEntrar from '@components/shared/FormularioEntrar'
import { copy } from '@copy'

const COMPONENTE = 'src/components/shared/BotonProveedor.jsx'
const P7 = copy.diario.onboarding.p7

const pintar = (proveedor) =>
  renderToStaticMarkup(
    createElement(BotonProveedor, { proveedor, texto: P7[proveedor], onClick: () => {} }),
  )

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1')

describe('BotonProveedor', () => {
  it.each(['apple', 'google'])('%s: un botón con su texto y su clase', (proveedor) => {
    const html = pintar(proveedor)
    expect(html).toMatch(/^<button type="button"/)
    expect(html).toContain(P7[proveedor])
    expect(html).toContain(`boton-proveedor boton-proveedor--${proveedor}`)
    expect(html).toContain(`data-proveedor="${proveedor}"`)
  })

  it('el logo es decorativo: el nombre ya lo dice el texto', () => {
    for (const proveedor of ['apple', 'google']) {
      expect(pintar(proveedor)).toMatch(/<img[^>]*alt=""[^>]*aria-hidden="true"/)
    }
  })

  it('los dos tienen el mismo tamaño: solo cambia el proveedor', () => {
    const clases = (html) => html.match(/class="([^"]+)"/)[1].replace(/--\w+/, '')
    expect(clases(pintar('apple'))).toBe(clases(pintar('google')))
    expect(clases(pintar('apple'))).toMatch(/w-full/)
    expect(clases(pintar('apple'))).toMatch(/min-h-touch/)
  })

  it('nada bloquea: sin disabled, required ni aria-invalid', () => {
    for (const proveedor of ['apple', 'google']) {
      expect(pintar(proveedor)).not.toMatch(/disabled|required|aria-invalid/)
    }
    expect(codigoDe(COMPONENTE)).not.toMatch(/disabled|required|aria-invalid/)
  })

  it('todo por props: no lee la sesión, ni lib/cuenta, ni el copy (RN-TEC-05)', () => {
    const codigo = codigoDe(COMPONENTE)
    expect(codigo).not.toMatch(/useSesion|@lib\/cuenta|@copy|@\/diario|@\/onboarding/)
  })

  it('ningún texto vive en el componente', () => {
    const codigo = codigoDe(COMPONENTE)
    expect(codigo).not.toMatch(/Continuar|Apple'|Google'/)
  })

  it('lo usan P7 y el formulario compartido, sin copias', () => {
    expect(codigoDe('src/components/onboarding/Cuenta.jsx')).toMatch(/<BotonProveedor/)
    expect(codigoDe('src/components/shared/FormularioEntrar.jsx')).toMatch(/<BotonProveedor/)
    for (const ruta of [
      'src/components/onboarding/Cuenta.jsx',
      'src/components/shared/FormularioEntrar.jsx',
    ]) {
      expect(codigoDe(ruta)).not.toMatch(/boton-proveedor/)
    }
  })
})

describe('el formulario pinta los proveedores en el orden en que llegan', () => {
  const props = {
    textos: copy.cuenta,
    botones: { crear: P7.create, proveedores: P7 },
    errorDe: () => null,
    onEnviar: async () => ({ ok: true }),
    onVolver: () => {},
  }

  it('en la app de iPhone: Apple primero, luego Google (DP-21.2.4)', () => {
    const html = renderToStaticMarkup(
      createElement(FormularioEntrar, { ...props, proveedores: ['apple', 'google'] }),
    )
    const orden = [...html.matchAll(/data-proveedor="(\w+)"/g)].map((m) => m[1])
    expect(orden).toEqual(['apple', 'google'])
  })

  it('en web: solo Google, y Apple no aparece', () => {
    const html = renderToStaticMarkup(
      createElement(FormularioEntrar, { ...props, proveedores: ['google'] }),
    )
    expect(html).toContain(P7.google)
    expect(html).not.toContain(P7.apple)
  })
})

describe('la excepción de marca a RN-VIS-03 es solo del botón de Apple', () => {
  const css = readFileSync('src/styles/globals.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

  it('el negro puro solo aparece en los dos tokens del botón de Apple', () => {
    const lineas = css.split('\n').filter((linea) => /#000000\b|#000\b/i.test(linea))
    expect(lineas.map((l) => l.trim())).toEqual([
      '--proveedor-tinta-apple:  #000000;',
      '--proveedor-borde-apple:  #000000;',
    ])
  })

  it('fondo blanco en los dos momentos; el borde, solo sobre superficie clara', () => {
    expect(css).toMatch(/\.boton-proveedor \{\s*background-color: var\(--proveedor-fondo\);/)
    expect(css).toMatch(/border: 1px solid transparent;/)
    expect(css).toMatch(
      /\[data-surface='light'\] \.boton-proveedor--apple\s+\{ border-color: var\(--proveedor-borde-apple\); \}/,
    )
    expect(css).toMatch(
      /\[data-surface='light'\] \.boton-proveedor--google \{ border-color: var\(--proveedor-borde-google\); \}/,
    )
    expect(css).not.toMatch(/\[data-surface='dark'\] \.boton-proveedor/)
  })

  it('lint:contraste mide los mismos colores que pinta la hoja', () => {
    const script = readFileSync('scripts/lint-contraste.js', 'utf8')
    const token = (nombre) =>
      css.match(new RegExp(`--proveedor-${nombre}:\\s*(#[0-9A-F]{6})`, 'i'))[1]
    const medido = (nombre) => script.match(new RegExp(`${nombre}: '(#[0-9A-F]{6})'`, 'i'))[1]
    expect(medido('fondo')).toBe(token('fondo'))
    expect(medido('tintaApple')).toBe(token('tinta-apple'))
    expect(medido('bordeApple')).toBe(token('borde-apple'))
    expect(medido('tintaGoogle')).toBe(token('tinta-google'))
    expect(medido('bordeGoogle')).toBe(token('borde-google'))
  })

  it('en lint:contraste va como excepción con nombre, no entre los pares generales', () => {
    const script = readFileSync('scripts/lint-contraste.js', 'utf8')
    const pares = script.slice(
      script.indexOf('const PARES'),
      script.indexOf('const EXCEPCIONES_DE_MARCA'),
    )
    const excepciones = script.slice(
      script.indexOf('const EXCEPCIONES_DE_MARCA'),
      script.indexOf('const INFORMATIVOS'),
    )
    expect(pares).not.toMatch(/tintaApple|bordeApple/)
    expect(excepciones).toMatch(/'Apple · texto y logo sobre su botón', PROVEEDOR\.tintaApple/)
  })

  it('el logo de Apple es negro; el de Google, sus cuatro colores', () => {
    const apple = readFileSync('src/assets/proveedores/apple.svg', 'utf8')
    const google = readFileSync('src/assets/proveedores/google.svg', 'utf8')
    expect([...apple.matchAll(/fill="(#[0-9A-F]+)"/gi)].map((m) => m[1])).toEqual(['#000000'])
    expect([...google.matchAll(/fill="(#[0-9A-F]+)"/gi)].map((m) => m[1].toUpperCase())).toEqual([
      '#EA4335',
      '#4285F4',
      '#FBBC05',
      '#34A853',
    ])
  })
})
