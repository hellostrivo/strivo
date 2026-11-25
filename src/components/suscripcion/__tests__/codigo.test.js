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
const DESDE = Date.parse('2026-11-25T20:00:00Z')
const con = (productIdentifier, latestPurchaseDateMillis = DESDE + 5000) => ({
  entitlements: {
    active: { completo: { isActive: true, productIdentifier, latestPurchaseDateMillis } },
  },
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
    expect(Object.keys(tomarIntento()).sort()).toEqual(['antes', 'desde'])
  })
})

describe('la vuelta', () => {
  beforeEach(() => tomarIntento())

  const volver = async (infos, { antes = null, sincronizar = async () => {} } = {}) => {
    const esperados = []
    let i = 0
    const resultado = await esperarCanje({
      intento: { antes, desde: DESDE },
      sincronizar,
      info: async () => infos[Math.min(i++, infos.length - 1)],
      esperar: async (ms) => esperados.push(ms),
    })
    return { resultado, esperados, preguntas: i }
  }

  it('sin intento no hay nada que mirar, y cada intento se mira una vez', () => {
    expect(tomarIntento()).toBeNull()
    empezarCanje(SIN)
    expect(tomarIntento()).not.toBeNull()
    expect(tomarIntento()).toBeNull()
  })

  it('derecho a la primera: aplicado, sin esperar', async () => {
    expect(await volver([con('strivo_anual')])).toEqual({
      resultado: 'aplicado',
      esperados: [],
      preguntas: 1,
    })
  })

  it('derecho a los cinco segundos: aplicado', async () => {
    const r = await volver([SIN, SIN, con('strivo_anual')])
    expect(r.resultado).toBe('aplicado')
    expect(r.esperados).toEqual([2000, 3000])
  })

  it('sin derecho en diez segundos: no aplicado', async () => {
    const r = await volver([SIN])
    expect(r.resultado).toBe('nada')
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
    expect((await volver([con('strivo_anual')], { sincronizar: rota })).resultado).toBe('aplicado')
    const colgada = () => new Promise(() => {})
    expect((await volver([con('strivo_anual')], { sincronizar: colgada })).resultado).toBe(
      'aplicado',
    )
  })

  it('H3: una clave inventada con un Fundador que vuelve no es «aplicado»', async () => {
    const viejo = con('strivo_fundador', DESDE - 3600000)
    expect((await volver([SIN, viejo])).resultado).toBe('recuperado')
    expect((await volver([con('strivo_fundador')])).resultado).toBe('recuperado')
  })

  it.each([
    ['un Mensual de antes', null, con('strivo_mensual', DESDE - 60000), 'recuperado'],
    ['un Mensual comprado ahora', null, con('strivo_mensual'), 'recuperado'],
    ['un Anual de antes', null, con('strivo_anual', DESDE - 3600000), 'recuperado'],
    ['el mismo Mensual con el que se fue', 'strivo_mensual', con('strivo_mensual'), 'nada'],
    ['el mismo Fundador', 'strivo_fundador', con('strivo_fundador'), 'nada'],
    ['el Anual que ya tenía, aunque renueve', 'strivo_anual', con('strivo_anual'), 'nada'],
    ['del Mensual al Anual, ahora', 'strivo_mensual', con('strivo_anual'), 'aplicado'],
    ['el Anual, ahora', null, con('strivo_anual'), 'aplicado'],
    [
      'el reloj del teléfono, un minuto adelantado',
      null,
      con('strivo_anual', DESDE - 60000),
      'aplicado',
    ],
    ['un Anual sin fecha legible', null, con('strivo_anual', null), 'recuperado'],
  ])('%s → %s', async (_n, antes, info, esperado) => {
    expect((await volver([info], { antes })).resultado).toBe(esperado)
  })

  it('si vuelve lo viejo y después llega el Anual, es «aplicado»', async () => {
    const r = await volver([con('strivo_fundador', DESDE - 3600000), con('strivo_anual')])
    expect(r.resultado).toBe('aplicado')
  })

  it('sin red al final, vale lo último que se supo', async () => {
    const r = await volver([con('strivo_fundador', DESDE - 1), null])
    expect(r.resultado).toBe('recuperado')
  })

  it('sin la fecha en milisegundos, se lee la de texto', () => {
    const info = con('strivo_anual', undefined)
    info.entitlements.active.completo = {
      isActive: true,
      productIdentifier: 'strivo_anual',
      latestPurchaseDate: '2026-11-25T20:00:09Z',
    }
    expect(canjeAplicado({ antes: null, desde: DESDE }, info)).toBe(true)
  })

  it('solo «aplicado» dice «Listo»; lo recuperado dice que está de vuelta', () => {
    const fuente = readFileSync('src/components/suscripcion/ProveedorDeSuscripcion.jsx', 'utf8')
    expect(fuente.match(/suscripcion\.codigo\.listo/g)).toHaveLength(1)
    const tras = fuente.slice(fuente.indexOf('const resultado = await esperarCanje'))
    const listo = tras.indexOf('codigo.listo')
    expect(tras.indexOf('RESULTADO.recuperado')).toBeLessThan(listo)
    expect(tras.indexOf('RESULTADO.nada')).toBeLessThan(listo)
    expect(tras).toMatch(
      /RESULTADO\.recuperado\)[\s\S]{0,40}copy\.suscripcion\.paywall\.restaurado/,
    )
  })

  it('el producto de antes se toma al irse: un derecho que llega primero por el oyente cuenta', () => {
    empezarCanje(con('strivo_mensual'))
    expect(tomarIntento()).toMatchObject({ antes: 'strivo_mensual' })
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
    const pintar = (notaDeCodigo) =>
      renderToStaticMarkup(
        createElement(
          ContextoSuscripcion.Provider,
          { value: { ...SIN_SUSCRIPCION, estado: 'lectura', notaDeCodigo } },
          createElement(TuSuscripcion),
        ),
      )
    expect(pintar(t.codigo.noAplicado)).toContain(t.codigo.noAplicado)
    expect(pintar(t.codigo.noAplicado)).toContain(t.ajustes.restaurar)
    expect(pintar(null)).not.toContain(t.codigo.noAplicado)
  })
})
