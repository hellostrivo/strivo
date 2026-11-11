// src/components/perfil/__tests__/recordatorios.test.js
// SPEC_22 — El bloque «Recordatorios» de Tu perfil (criterio 9, DP-22.8 y §9).

import { readFileSync } from 'fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { BLOQUES, SOLO_EN_IPHONE, visibles } from '@/perfil/bloques'
import TusRecordatorios, {
  AJUSTES_DEL_TELEFONO,
  avisoDelBloque,
} from '@components/perfil/TusRecordatorios'

const textos = copy.diario.perfil.recordatorios

describe('el copy del bloque, tal como se aprobó (§6 y §9)', () => {
  it('clave por clave', () => {
    expect(textos).toEqual({
      titulo: 'Recordatorios',
      hint: 'Un aviso por la mañana y otro por la noche, a las horas de «Cómo son tus días». Si ya pasaste por ese momento, ese día no llega.',
      interruptor: 'Recibir recordatorios',
      sinPermiso: 'Para avisarte, Strivo necesita permiso del teléfono.',
      permitir: 'Permitir avisos',
      abrirAjustes: 'Abrir Ajustes del teléfono',
      sinHoras: 'Elige tus horas en «Cómo son tus días» para recibirlos.',
    })
  })
})

describe('solo en la app de iPhone (DP-22.2)', () => {
  it('va detrás de «Cómo son tus días»', () => {
    expect(BLOQUES.indexOf('recordatorios')).toBe(BLOQUES.indexOf('horarios') + 1)
    expect(SOLO_EN_IPHONE).toEqual(['recordatorios'])
  })

  it('en la web el bloque no existe', () => {
    expect(visibles({ iphone: false })).not.toContain('recordatorios')
    expect(visibles()).toEqual(BLOQUES.filter((id) => id !== 'recordatorios'))
  })

  it('en el iPhone están todos, en su orden', () => {
    expect(visibles({ iphone: true })).toEqual(BLOQUES)
  })
})

describe('lo que se ve, fila a fila (la tabla de DP-22.8)', () => {
  it('apagado: el interruptor y nada más, sea cual sea el permiso', () => {
    for (const permiso of ['concedido', 'denegado', 'sin_pedir']) {
      expect(avisoDelBloque({ encendido: false, permiso, conHoras: true })).toBeNull()
    }
  })

  it('encendido, concedido y con horas: nada más, los avisos llegan', () => {
    expect(avisoDelBloque({ encendido: true, permiso: 'concedido', conHoras: true })).toBeNull()
  })

  it('encendido, concedido y sin horas: sinHoras', () => {
    expect(avisoDelBloque({ encendido: true, permiso: 'concedido', conHoras: false })).toEqual({
      frase: 'sinHoras',
    })
  })

  it('encendido y sin pedir: sinPermiso con «Permitir avisos»', () => {
    expect(avisoDelBloque({ encendido: true, permiso: 'sin_pedir', conHoras: true })).toEqual({
      frase: 'sinPermiso',
      boton: 'permitir',
    })
  })

  it('encendido y denegado: sinPermiso con «Abrir Ajustes del teléfono»', () => {
    expect(avisoDelBloque({ encendido: true, permiso: 'denegado', conHoras: true })).toEqual({
      frase: 'sinPermiso',
      boton: 'abrirAjustes',
    })
  })

  it('el permiso va por delante: sin permiso y sin horas, solo la frase del permiso', () => {
    expect(avisoDelBloque({ encendido: true, permiso: 'denegado', conHoras: false })).toEqual({
      frase: 'sinPermiso',
      boton: 'abrirAjustes',
    })
  })

  it('tras negar al encender: apagado, con la frase y «Abrir Ajustes del teléfono»', () => {
    expect(
      avisoDelBloque({ encendido: false, permiso: 'denegado', conHoras: true, recienNegado: true }),
    ).toEqual({ frase: 'sinPermiso', boton: 'abrirAjustes' })
  })
})

describe('el interruptor', () => {
  const html = renderToStaticMarkup(
    createElement(TusRecordatorios, { uid: 'uid-1', textos, conHoras: true }),
  )
  const fuente = readFileSync('src/components/perfil/TusRecordatorios.jsx', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  it('es un switch con su nombre, y arranca apagado hasta leer la preferencia', () => {
    expect(html).toMatch(/role="switch"/)
    expect(html).toMatch(/aria-checked="false"/)
    expect(html).toContain('Recibir recordatorios')
  })

  it('el cambio se anuncia y nada se apaga ni se marca como error', () => {
    expect(fuente).toMatch(/aria-live="polite"/)
    expect(fuente).not.toMatch(/disabled|aria-invalid|vibrate/)
  })

  it('el objetivo táctil es de un dedo', () => {
    expect(fuente).toMatch(/min-h-touch-sm/)
  })

  it('no fija colores: pide superficies', () => {
    expect(fuente).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
  })

  it('el permiso solo se pide con un toque, nunca al abrir', () => {
    const efecto = fuente.match(/useEffect\(\(\) => \{[\s\S]*?\n {2}\}, \[uid\]\)/)[0]
    expect(efecto).toMatch(/puente\.permiso\(\)/)
    expect(efecto).not.toMatch(/pedirPermiso/)
  })

  it('«Abrir Ajustes del teléfono» navega a app-settings:, sin código nativo', () => {
    expect(AJUSTES_DEL_TELEFONO).toBe('app-settings:')
    expect(fuente).toMatch(/window\.location\.href = AJUSTES_DEL_TELEFONO/)
  })

  it('tras cada cambio pide poner los avisos al día', () => {
    expect(fuente.match(/pedirReconciliacion\(\)/g).length).toBeGreaterThanOrEqual(2)
  })
})
