// src/lib/__tests__/barraEstado.test.js
// SPEC_21.1 §4.8 — el color de la hora y la batería, fila por fila de la tabla
// aprobada en el reporte previo, y su traducción al plugin.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Style } from '@capacitor/status-bar'

const nativo = vi.hoisted(() => ({ es: false, setStyle: vi.fn(() => Promise.resolve()) }))
vi.mock('../plataforma.js', () => ({ esNativa: () => nativo.es }))
vi.mock('@capacitor/status-bar', async (original) => ({
  ...(await original()),
  StatusBar: { setStyle: nativo.setStyle },
}))

const { TEXTO, estiloDeCapacitor, fijarBase, olvidarBarra, textoDeBarra, textoVigente } =
  await import('../barraEstado.js')

describe('textoDeBarra: la tabla, fila por fila', () => {
  const filas = [
    // [situación, entrada, texto]
    [
      'arranque y umbral de apertura de mañana: velo papel',
      { capa: 'pantalla', momento: 'manana' },
      'oscuro',
    ],
    [
      'arranque y umbral de apertura de noche: velo índigo',
      { capa: 'pantalla', momento: 'noche' },
      'claro',
    ],
    [
      'onboarding y presentación de mañana: degradado claro',
      { capa: 'pantalla', momento: 'manana' },
      'oscuro',
    ],
    ['onboarding y presentación de noche: índigo', { capa: 'pantalla', momento: 'noche' }, 'claro'],
    [
      'Hoy · Mañana, con su recorrido: contratono',
      { capa: 'secciones', cromo: true, momentoHoy: 'manana' },
      'claro',
    ],
    [
      'Hoy · Noche, con su recorrido: el cromo claro de la noche',
      { capa: 'secciones', cromo: true, momentoHoy: 'noche' },
      'oscuro',
    ],
    [
      'Hoy · «Respira un momento» de mañana, sin cromo: degradado claro',
      { capa: 'secciones', cromo: false, momentoHoy: 'manana' },
      'oscuro',
    ],
    [
      'Hoy · «Respira un momento» de noche, sin cromo: índigo',
      { capa: 'secciones', cromo: false, momentoHoy: 'noche' },
      'claro',
    ],
    [
      'el buen deseo de la mañana, encima de todo: papel de la mañana',
      { capa: 'pantalla', momento: 'manana' },
      'oscuro',
    ],
    ['«Buenas noches», encima de todo: noche', { capa: 'pantalla', momento: 'noche' }, 'claro'],
    [
      'Journal con candado: contratono',
      { capa: 'secciones', cromo: true, momentoHoy: null },
      'claro',
    ],
    [
      'Journal, lista de entradas: contratono',
      { capa: 'secciones', cromo: true, momentoHoy: null },
      'claro',
    ],
    [
      'Journal escribiendo: papel del espacio',
      { capa: 'secciones', cromo: false, momentoHoy: null },
      'oscuro',
    ],
    [
      'Respiración, configuración y su hoja «Guardar» en línea: contratono',
      { capa: 'secciones', cromo: true, momentoHoy: null },
      'claro',
    ],
    [
      'Respiración, sesión, su cierre y su panel de ajustes: papel del espacio',
      { capa: 'secciones', cromo: false, momentoHoy: null },
      'oscuro',
    ],
    ['Historial: contratono', { capa: 'secciones', cromo: true, momentoHoy: null }, 'claro'],
    ['Tu perfil: contratono', { capa: 'secciones', cromo: true, momentoHoy: null }, 'claro'],
    ['Confirmación a pantalla completa: papel del espacio', { capa: 'modal' }, 'oscuro'],
  ]

  it.each(filas)('%s → texto %s', (_situacion, entrada, texto) => {
    expect(textoDeBarra(entrada)).toBe(texto)
  })

  it('fuera de Hoy el reloj no cuenta: a medianoche el cromo sigue siendo oscuro', () => {
    expect(textoDeBarra({ capa: 'secciones', cromo: true })).toBe('claro')
    expect(textoDeBarra({ capa: 'secciones', cromo: false })).toBe('oscuro')
  })

  it('una pantalla sin momento conocido se trata como de día', () => {
    expect(textoDeBarra({ capa: 'pantalla' })).toBe('oscuro')
  })
})

describe('estiloDeCapacitor: el plugin nombra el fondo, no el texto', () => {
  it('texto claro es Style.Dark, «para fondos oscuros»', () => {
    expect(estiloDeCapacitor(TEXTO.claro)).toBe(Style.Dark)
    expect(Style.Dark).toBe('DARK')
  })

  it('texto oscuro es Style.Light, «para fondos claros»', () => {
    expect(estiloDeCapacitor(TEXTO.oscuro)).toBe(Style.Light)
    expect(Style.Light).toBe('LIGHT')
  })

  it('nunca se pide Style.Default: depende del modo del sistema, no de lo que hay debajo', () => {
    expect([estiloDeCapacitor('claro'), estiloDeCapacitor('oscuro')]).not.toContain(Style.Default)
  })
})

describe('la base del arranque', () => {
  beforeEach(() => {
    olvidarBarra()
    nativo.setStyle.mockClear()
  })

  it('sin nada montado manda la base', () => {
    fijarBase('claro')
    expect(textoVigente()).toBe('claro')
  })

  it('en web no se llama al plugin', () => {
    nativo.es = false
    fijarBase('claro')
    expect(nativo.setStyle).not.toHaveBeenCalled()
  })

  it('en nativo se aplica una vez, traducida, y no se repite si no cambia', () => {
    nativo.es = true
    fijarBase('claro')
    fijarBase('claro')
    expect(nativo.setStyle).toHaveBeenCalledTimes(1)
    expect(nativo.setStyle).toHaveBeenCalledWith({ style: Style.Dark })
    fijarBase('oscuro')
    expect(nativo.setStyle).toHaveBeenLastCalledWith({ style: Style.Light })
    nativo.es = false
  })
})
