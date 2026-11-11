// src/pages/diario/__tests__/hoyDesdeAviso.test.js
// SPEC_22, DP-22.10 — Tocar un aviso abre Hoy con su momento (criterio 6).
//
// No hay DOM en la suite: el parámetro se lee con una función pura, y de la
// pantalla se comprueba la fuente —qué hace con él y cuándo—.

import { readFileSync } from 'fs'
import { URLSearchParams } from 'url'
import { describe, expect, it } from 'vitest'
import { momentoPedido } from '../Hoy.jsx'

const parametros = (cadena) => new URLSearchParams(cadena)

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const hoy = codigoDe('src/pages/diario/Hoy.jsx')

describe('el momento que pide la ruta', () => {
  it('?momento=manana y ?momento=noche', () => {
    expect(momentoPedido(parametros('momento=manana'))).toBe('manana')
    expect(momentoPedido(parametros('momento=noche'))).toBe('noche')
  })

  it('un valor desconocido se ignora, sin mensaje (RN-NAV-06)', () => {
    expect(momentoPedido(parametros('momento=tarde'))).toBeNull()
    expect(momentoPedido(parametros('momento=NOCHE'))).toBeNull()
    expect(momentoPedido(parametros('momento='))).toBeNull()
  })

  it('sin parámetro, nada: Hoy se abre como siempre', () => {
    expect(momentoPedido(parametros(''))).toBeNull()
    expect(momentoPedido(undefined)).toBeNull()
  })
})

describe('lo que Hoy hace con él', () => {
  it('el estado del momento sigue naciendo de la franja del día', () => {
    expect(hoy).toMatch(/useState\(momentoInicial\)/)
  })

  it('lo aplica antes de pintar, y también con Hoy ya montada', () => {
    // Un efecto que depende del parámetro: un toque con Hoy montada cambia la
    // ruta sin remontar, y el efecto vuelve a correr.
    expect(hoy).toMatch(/useLayoutEffect\(\(\) => \{\s*if \(!hayParametro\) return/)
    expect(hoy).toMatch(/\}, \[pedido, hayParametro, setParametros, onHideNav, fueraDeHoy\]\)/)
  })

  it('elige el momento del aviso, en el día de hoy', () => {
    expect(hoy).toMatch(/setMomento\(pedido\)\s*setFechaPedida\(null\)/)
  })

  it('saca de «Respira un momento» si estaba dentro (§9)', () => {
    expect(hoy).toMatch(/if \(fueraDeHoy\) \{\s*setVista\('hoy'\)\s*onHideNav\?\.\(false\)/)
  })

  it('y retira el parámetro con replace, también si no valía', () => {
    expect(hoy).toMatch(/setParametros\(\{\}, \{ replace: true \}\)/)
    // La retirada va fuera del `if (pedido)`: un valor desconocido también se va.
    const efecto = hoy.match(/useLayoutEffect\(\(\) => \{[\s\S]*?\n {2}\}, \[/)[0]
    expect(efecto.indexOf('setParametros')).toBeGreaterThan(efecto.lastIndexOf('}\n    }'))
  })
})
