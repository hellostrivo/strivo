// src/lib/__tests__/comprobarIos.test.js
// SPEC_21.2 §4.7 (DP-21.2.3) — lo que `npm run ios:build` comprueba antes de
// construir: el `GoogleService-Info.plist` que git no guarda, y que lo que
// Google necesita esté en él y en `Info.plist`.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'

import {
  IDENTIFICADOR,
  RUTA_PLIST,
  cadenaDe,
  esquemasDe,
  problemas,
} from '../../../scripts/comprobar-ios.mjs'

const INVERTIDO = 'com.googleusercontent.apps.123-abc'

const plist = (campos) =>
  `<?xml version="1.0"?><plist version="1.0"><dict>${Object.entries(campos)
    .map(([k, v]) => `<key>${k}</key>\n\t<string>${v}</string>`)
    .join('\n')}</dict></plist>`

const COMPLETO = plist({
  CLIENT_ID: '123-abc.apps.googleusercontent.com',
  REVERSED_CLIENT_ID: INVERTIDO,
  BUNDLE_ID: IDENTIFICADOR,
})

const info = (esquemas) =>
  `<dict><key>CFBundleURLTypes</key><array><dict><key>CFBundleURLSchemes</key><array>${esquemas
    .map((e) => `<string>${e}</string>`)
    .join('')}</array></dict></array></dict>`

describe('problemas: qué falta para construir', () => {
  it('con todo en su sitio, nada', () => {
    expect(problemas(COMPLETO, info([INVERTIDO]))).toEqual([])
  })

  it('sin el plist dice qué archivo falta y dónde va, en español', () => {
    const fallos = problemas(null, info([INVERTIDO]))
    expect(fallos[0]).toBe(`Falta ${RUTA_PLIST}.`)
    expect(fallos.join(' ')).toMatch(/consola de Firebase/)
    expect(fallos.join(' ')).toMatch(/No se sube a git/)
  })

  it('un plist de otra app', () => {
    const otro = COMPLETO.replace(IDENTIFICADOR, 'com.otra.app')
    expect(problemas(otro, info([INVERTIDO])).join(' ')).toMatch(
      /es de otra app \(com\.otra\.app\)/,
    )
  })

  it('sin CLIENT_ID: la hoja de Google no se abriría nunca', () => {
    const sin = plist({ REVERSED_CLIENT_ID: INVERTIDO, BUNDLE_ID: IDENTIFICADOR })
    expect(problemas(sin, info([INVERTIDO])).join(' ')).toMatch(/no trae CLIENT_ID/)
  })

  it('sin el esquema en Info.plist: Google cerraría la app', () => {
    expect(problemas(COMPLETO, info(['otro.esquema'])).join(' ')).toMatch(
      new RegExp(`no declara el esquema ${INVERTIDO.replace(/\./g, '\\.')}`),
    )
  })
})

describe('el repo, tal como está', () => {
  it('Info.plist declara un esquema de Google con la forma del REVERSED_CLIENT_ID', () => {
    const esquemas = esquemasDe(readFileSync('ios/App/App/Info.plist', 'utf8'))
    expect(esquemas.some((e) => /^com\.googleusercontent\.apps\.[\w-]+$/.test(e))).toBe(true)
  })

  it('cadenaDe lee una clave de un plist XML', () => {
    expect(cadenaDe(COMPLETO, 'BUNDLE_ID')).toBe(IDENTIFICADOR)
    expect(cadenaDe(COMPLETO, 'NO_EXISTE')).toBeNull()
  })
})
