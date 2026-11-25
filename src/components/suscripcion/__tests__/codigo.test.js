// SPEC_25B — «Tengo un código»: el enlace, la hoja y la vuelta (criterios 19–21).

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { copy } from '@copy'
import {
  ESPERAS_MS,
  canjeAplicado,
  empezarCanje,
  esperarCanje,
  tomarIntento,
  urlDeCanje,
} from '@lib/suscripcion/canje'
import { ContextoSuscripcion, SIN_SUSCRIPCION } from '@lib/suscripcion/useSuscripcion'
import TuSuscripcion, { controlesDe } from '@components/perfil/TuSuscripcion'
import HojaDeCodigo, { continuarCon } from '../HojaDeCodigo.jsx'
import { MuroVista } from '../Muro.jsx'

const t = copy.suscripcion
const con = (productIdentifier) => ({
  entitlements: { active: { completo: { isActive: true, productIdentifier } } },
})
const SIN = { entitlements: { active: {} } }

describe('urlDeCanje', () => {
  it('el id de la app y la clave', () => {
    expect(urlDeCanje('ALEJANDRA10')).toBe(
      'https://apps.apple.com/redeem?ctx=offercodes&id=6836996054&code=ALEJANDRA10',
    )
  })
  it('espacios y minúsculas dan lo mismo', () => {
    expect(urlDeCanje('  alejandra10 ')).toBe(urlDeCanje('ALEJANDRA10'))
  })
  it('lo raro va codificado y no puede añadir parámetros', () => {
    const url = new URL(urlDeCanje('a&id=1#x y'))
    expect(url.searchParams.get('id')).toBe('6836996054')
    expect(url.searchParams.get('code')).toBe('A&ID=1#X Y')
    expect(url.hash).toBe('')
  })
  it.each(['', '   ', null, undefined])('vacía (%o): no hay enlace', (clave) => {
    expect(urlDeCanje(clave)).toBeNull()
  })
})

describe('la hoja', () => {
  const html = renderToStaticMarkup(createElement(HojaDeCodigo))

  it('dice lo suyo, con etiqueta y sin apagar nada', () => {
    for (const texto of ['titulo', 'campo', 'aviso', 'continuar', 'cancelar']) {
      expect(html).toContain(t.codigo[texto])
    }
    expect(html).toMatch(/<label[^>]*><span[^>]*>Escríbelo aquí<\/span><input/)
    expect(html).not.toMatch(/ disabled=""| required|aria-invalid/)
  })

  it('el teclado: mayúsculas, sin corrector y sin ortografía', () => {
    expect(html).toMatch(/autoCapitalize="characters"/i)
    expect(html).toMatch(/autoCorrect="off"/i)
    expect(html).toMatch(/spellCheck="false"/i)
  })

  it('con el campo vacío, «Continuar» devuelve el foco y no abre nada', () => {
    const fns = { enfocar: vi.fn(), abrir: vi.fn(), onAbierto: vi.fn() }
    expect(continuarCon('   ', fns)).toBe(false)
    expect(fns.enfocar).toHaveBeenCalledTimes(1)
    expect(fns.abrir).not.toHaveBeenCalled()
    expect(fns.onAbierto).not.toHaveBeenCalled()
  })

  it('con clave, anota el intento antes de abrir', () => {
    const orden = []
    continuarCon('x1', {
      enfocar: () => orden.push('foco'),
      onAbierto: () => orden.push('intento'),
      abrir: (url) => orden.push(url),
    })
    expect(orden).toEqual(['intento', urlDeCanje('X1')])
  })

  it('cancelar no anota ningún intento', () => {
    tomarIntento()
    const fuente = readFileSync('src/components/suscripcion/ProveedorDeSuscripcion.jsx', 'utf8')
    expect(fuente).toContain('onCancelar={() => setHoja(false)}')
    expect(tomarIntento()).toBeNull()
  })

  it('la clave no se guarda ni se manda a nadie', () => {
    for (const ruta of [
      'src/lib/suscripcion/canje.js',
      'src/components/suscripcion/HojaDeCodigo.jsx',
    ]) {
      expect(readFileSync(ruta, 'utf8')).not.toMatch(
        /localStorage|guardarClave|writePath|fetch\(|anotarEvento/,
      )
    }
    empezarCanje(SIN)
    expect(tomarIntento()).toEqual({ antes: null })
  })
})

describe('la vuelta', () => {
  beforeEach(() => tomarIntento())

  const volver = async (infos, { antes = null, sincronizar = async () => {} } = {}) => {
    const esperados = []
    let i = 0
    const aplicado = await esperarCanje({
      intento: { antes },
      sincronizar,
      info: async () => infos[Math.min(i++, infos.length - 1)],
      esperar: async (ms) => esperados.push(ms),
    })
    return { aplicado, esperados, preguntas: i }
  }

  it('sin intento no hay nada que mirar, y cada intento se mira una vez', () => {
    expect(tomarIntento()).toBeNull()
    empezarCanje(SIN)
    expect(tomarIntento()).not.toBeNull()
    expect(tomarIntento()).toBeNull()
  })

  it('derecho a la primera: aplicado, sin esperar', async () => {
    expect(await volver([con('strivo_anual')])).toEqual({
      aplicado: true,
      esperados: [],
      preguntas: 1,
    })
  })

  it('derecho a los cinco segundos: aplicado', async () => {
    const r = await volver([SIN, SIN, con('strivo_anual')])
    expect(r.aplicado).toBe(true)
    expect(r.esperados).toEqual([2000, 3000])
  })

  it('sin derecho en diez segundos: no aplicado', async () => {
    const r = await volver([SIN])
    expect(r.aplicado).toBe(false)
    expect(r.esperados.reduce((a, b) => a + b, 0)).toBe(10000)
    expect(r.preguntas).toBe(ESPERAS_MS.length)
  })

  it('sincroniza una vez; si falla o se cuelga, se sigue preguntando', async () => {
    const sincronizar = vi.fn(async () => {})
    await volver([SIN], { sincronizar })
    expect(sincronizar).toHaveBeenCalledTimes(1)
    const rota = async () => {
      throw new Error('no')
    }
    expect((await volver([con('strivo_anual')], { sincronizar: rota })).aplicado).toBe(true)
    const colgada = () => new Promise(() => {})
    expect((await volver([con('strivo_anual')], { sincronizar: colgada })).aplicado).toBe(true)
  })

  it('quien ya tenía el Mensual solo lo nota si pasa al Anual', () => {
    expect(canjeAplicado('strivo_mensual', con('strivo_mensual'))).toBe(false)
    expect(canjeAplicado('strivo_mensual', con('strivo_anual'))).toBe(true)
    expect(canjeAplicado(null, SIN)).toBe(false)
    expect(canjeAplicado('strivo_mensual', null)).toBe(false)
  })

  it('el producto de antes se toma al irse: un derecho que llega primero por el oyente cuenta', () => {
    empezarCanje(con('strivo_mensual'))
    expect(tomarIntento()).toEqual({ antes: 'strivo_mensual' })
  })
})

describe('dónde se ofrece', () => {
  it('en el muro, entre «Restaurar compras» y «Términos»', () => {
    const html = renderToStaticMarkup(
      createElement(MuroVista, { estado: 'prueba', carga: 'sinPlanes', tarjetas: [] }),
    )
    const orden = [t.paywall.restaurar, t.paywall.tengoCodigo, t.paywall.terminos].map((x) =>
      html.indexOf(`>${x}<`),
    )
    expect(orden.every((i) => i > 0)).toBe(true)
    expect([...orden].sort((a, b) => a - b)).toEqual(orden)
  })

  it.each([
    ['prueba', null, true],
    ['lectura', null, true],
    ['activa', 'mensual', true],
    ['activa', 'anual', false],
    ['fundador', 'fundador', false],
  ])('en Tu perfil: %s %s → %s', (estado, plan, esperado) => {
    expect(controlesDe(estado, plan).codigo).toBe(esperado)
  })

  it('«no aplicado» sale con «Restaurar compras» y solo si hubo un intento', () => {
    const pintar = (codigoSinAplicar) =>
      renderToStaticMarkup(
        createElement(
          ContextoSuscripcion.Provider,
          { value: { ...SIN_SUSCRIPCION, estado: 'lectura', codigoSinAplicar } },
          createElement(TuSuscripcion),
        ),
      )
    expect(pintar(true)).toContain(t.codigo.noAplicado)
    expect(pintar(true)).toContain(t.ajustes.restaurar)
    expect(pintar(false)).not.toContain(t.codigo.noAplicado)
  })
})
