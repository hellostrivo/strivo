// SPEC_28.3 §4.2, criterio 2 — la lectura del canal. Nunca lanza, y cualquier
// cosa que no sea el canal es un fallo con su código.
import { describe, expect, it } from 'vitest'
import { URL_CANAL } from '../../modelo/capsula.js'
import { ESPERA_MS, MOTIVOS, esCanal, leerCanal, traerPortada, urlDelCanal } from '../leer.js'

const CANAL = 'https://contenido.hellostrivo.com/una-pausa/feed.json'

const bueno = (cambios = {}) => ({
  formato: 1,
  semana: '2026-12-07',
  vigente: { id: 'calma', title: 'Calma', portada: { src: 'portadas/calma.webp', alt: 'Luz' } },
  archivo: [{ id: 'antes', title: 'Antes', portada: { src: 'portadas/antes.webp' } }],
  ...cambios,
})

/** Una respuesta de `fetch` hecha a mano: lo justo que lee el lector. */
function respuesta({ status = 200, tipo = 'application/json', cuerpo = '' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (h) => (h.toLowerCase() === 'content-type' ? tipo : null) },
    text: async () => cuerpo,
    blob: async () => new Blob([cuerpo], { type: tipo }),
  }
}

const con = (r) => async () => r
const leer = (r, opciones = {}) => leerCanal({ fetch: con(r), url: CANAL, ...opciones })

describe('criterio 2: cada fallo con su código', () => {
  it('un 200 con text/html es tipo: la regla de la SPA no se cuela', async () => {
    const r = respuesta({ tipo: 'text/html; charset=utf-8', cuerpo: '<!doctype html>' })
    expect(await leer(r)).toEqual({ ok: false, motivo: 'tipo' })
  })

  it('un 500 es estado', async () => {
    expect(await leer(respuesta({ status: 500 }))).toEqual({ ok: false, motivo: 'estado' })
  })

  it('un 404 también', async () => {
    expect(await leer(respuesta({ status: 404 }))).toEqual({ ok: false, motivo: 'estado' })
  })

  it('un JSON con formato 2 es formato', async () => {
    const r = respuesta({ cuerpo: JSON.stringify(bueno({ formato: 2 })) })
    expect(await leer(r)).toEqual({ ok: false, motivo: 'formato' })
  })

  it('un cuerpo roto es json', async () => {
    expect(await leer(respuesta({ cuerpo: '{"formato": 1,' }))).toEqual({
      ok: false,
      motivo: 'json',
    })
  })

  it('un fetch que no vuelve es espera', async () => {
    const nunca = () => new Promise(() => {})
    expect(await leerCanal({ fetch: nunca, url: CANAL, espera: 20 })).toEqual({
      ok: false,
      motivo: 'espera',
    })
  })

  it('un fetch que rechaza, o que lanza antes de devolver nada, es red', async () => {
    const rechaza = async () => {
      throw new TypeError('Failed to fetch')
    }
    const lanza = () => {
      throw new Error('sin red')
    }
    expect(await leerCanal({ fetch: rechaza, url: CANAL })).toEqual({ ok: false, motivo: 'red' })
    expect(await leerCanal({ fetch: lanza, url: CANAL })).toEqual({ ok: false, motivo: 'red' })
  })

  it('un cuerpo que se corta a medio leer es red', async () => {
    const r = {
      ...respuesta(),
      text: async () => {
        throw new Error('cortado')
      },
    }
    expect(await leer(r)).toEqual({ ok: false, motivo: 'red' })
  })

  it('los motivos son códigos, y son estos', () => {
    expect(MOTIVOS).toEqual(['red', 'estado', 'tipo', 'json', 'formato', 'espera'])
    expect(ESPERA_MS).toBe(10_000)
  })
})

describe('criterio 2: un canal bueno', () => {
  it('es ok, y con application/json con su charset también', async () => {
    const r = respuesta({
      tipo: 'Application/JSON; charset=utf-8',
      cuerpo: JSON.stringify(bueno()),
    })
    const lectura = await leer(r)
    expect(lectura.ok).toBe(true)
    expect(lectura.canal.vigente.id).toBe('calma')
  })

  it('un canal sin vigente también es un canal', async () => {
    const lectura = await leer(respuesta({ cuerpo: JSON.stringify(bueno({ vigente: null })) }))
    expect(lectura).toEqual({
      ok: true,
      canal: bueno({ vigente: null, archivo: lectura.canal.archivo }),
    })
  })

  it('la portada se resuelve contra la URL del canal, no contra la página', async () => {
    const lectura = await leer(respuesta({ cuerpo: JSON.stringify(bueno()) }))
    expect(lectura.canal.vigente.portada).toEqual({
      src: 'https://contenido.hellostrivo.com/una-pausa/portadas/calma.webp',
      alt: 'Luz',
    })
    expect(lectura.canal.archivo[0].portada.src).toBe(
      'https://contenido.hellostrivo.com/una-pausa/portadas/antes.webp',
    )
  })

  it('en la vista previa, contra el canal del mismo origen', async () => {
    const url = 'https://revision-28-3--sitio.netlify.app/una-pausa/feed.json'
    const lectura = await leerCanal({
      fetch: con(respuesta({ cuerpo: JSON.stringify(bueno()) })),
      url,
    })
    expect(lectura.canal.vigente.portada.src).toBe(
      'https://revision-28-3--sitio.netlify.app/una-pausa/portadas/calma.webp',
    )
  })

  it('no envía credenciales ni referente', async () => {
    let opciones
    const espia = async (_url, o) => {
      opciones = o
      return respuesta({ cuerpo: JSON.stringify(bueno()) })
    }
    await leerCanal({ fetch: espia, url: CANAL })
    expect(opciones).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' })
  })
})

describe('esCanal', () => {
  it('pide formato, vigente objeto o null y archivo lista de objetos', () => {
    expect(esCanal(bueno())).toBe(true)
    expect(esCanal(bueno({ vigente: null }))).toBe(true)
    expect(esCanal(bueno({ vigente: 'calma' }))).toBe(false)
    expect(esCanal(bueno({ vigente: [] }))).toBe(false)
    expect(esCanal(bueno({ archivo: null }))).toBe(false)
    expect(esCanal(bueno({ archivo: ['calma'] }))).toBe(false)
    expect(esCanal(null)).toBe(false)
    expect(esCanal([])).toBe(false)
  })
})

describe('urlDelCanal (DP-28.16)', () => {
  const pagina = 'https://revision-28-3--sitio.netlify.app/#/una-pausa'

  it('sin variable de build, la de producción', () => {
    expect(urlDelCanal({ env: {}, pagina })).toBe(URL_CANAL)
  })

  it('con ella, la suya; relativa, contra el origen de la página', () => {
    expect(urlDelCanal({ env: { VITE_URL_CANAL: '/una-pausa/feed.json' }, pagina })).toBe(
      'https://revision-28-3--sitio.netlify.app/una-pausa/feed.json',
    )
  })

  it('una variable vacía cuenta como ausente', () => {
    expect(urlDelCanal({ env: { VITE_URL_CANAL: '' }, pagina })).toBe(URL_CANAL)
  })
})

describe('traerPortada', () => {
  it('una imagen vuelve como blob; lo demás, null y sin lanzar', async () => {
    const imagen = respuesta({ tipo: 'image/webp', cuerpo: 'RIFF' })
    const blob = await traerPortada('https://x/p.webp', { fetch: con(imagen) })
    expect(blob.type).toBe('image/webp')

    const html = respuesta({ tipo: 'text/html', cuerpo: '<html>' })
    expect(await traerPortada('https://x/p.webp', { fetch: con(html) })).toBeNull()
    expect(
      await traerPortada('https://x/p.webp', { fetch: con(respuesta({ status: 404 })) }),
    ).toBeNull()
    const rechaza = async () => {
      throw new TypeError('Failed to fetch')
    }
    expect(await traerPortada('https://x/p.webp', { fetch: rechaza })).toBeNull()
    const nunca = () => new Promise(() => {})
    expect(await traerPortada('https://x/p.webp', { fetch: nunca, espera: 20 })).toBeNull()
  })
})
