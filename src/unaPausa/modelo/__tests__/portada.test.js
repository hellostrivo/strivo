// SPEC_28.2 §4.3 y criterio 6: la portada, leída de sus bytes. Ninguna imagen
// entra al repo: las cabeceras se construyen en memoria (`webp.js`).
import { describe, expect, it } from 'vitest'
import { PORTADA, revisarPortada } from '../portada.js'
import { webp } from './webp.js'

const codigos = (bytes) => revisarPortada(bytes).map((f) => f.codigo)

describe('las constantes de DP-28.4', () => {
  it('1600 × 1200 y 250 000 bytes, en decimal', () => {
    expect(PORTADA).toEqual({ ancho: 1600, alto: 1200, maxBytes: 250_000 })
  })
})

describe.each(['VP8 ', 'VP8L', 'VP8X'])('un WebP %j', (trozo) => {
  it('de 1600 × 1200 pasa', () => {
    expect(revisarPortada(webp(trozo, 1600, 1200))).toEqual([])
  })

  it('de 1599 px de ancho da portada.ancho, y deja de ser 4:3', () => {
    expect(codigos(webp(trozo, 1599, 1200))).toEqual(['portada.ancho', 'portada.proporcion'])
  })

  it('de 1600 × 1000 da portada.proporcion', () => {
    expect(codigos(webp(trozo, 1600, 1000))).toEqual(['portada.proporcion'])
  })

  it('de 1200 × 900 es 4:3 y da solo portada.ancho', () => {
    expect(codigos(webp(trozo, 1200, 900))).toEqual(['portada.ancho'])
  })

  it('de 250 001 bytes da portada.peso; de 250 000, no', () => {
    expect(codigos(webp(trozo, 1600, 1200, 250_001))).toEqual(['portada.peso'])
    expect(codigos(webp(trozo, 1600, 1200, 250_000))).toEqual([])
  })
})

describe('lo que no es un WebP', () => {
  it('un PNG', () => {
    const png = new Uint8Array(64)
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(codigos(png)).toEqual(['portada.formato'])
  })

  it('un WebP cortado, un trozo desconocido o una firma rota', () => {
    expect(codigos(webp('VP8 ', 1600, 1200).subarray(0, 20))).toEqual(['portada.formato'])
    expect(codigos(webp('ALPH', 1600, 1200))).toEqual(['portada.formato'])
    const roto = webp('VP8 ', 1600, 1200)
    roto[23] = 0
    expect(codigos(roto)).toEqual(['portada.formato'])
    const sinFirma = webp('VP8L', 1600, 1200)
    sinFirma[20] = 0
    expect(codigos(sinFirma)).toEqual(['portada.formato'])
  })

  it('un no-WebP pesado da las dos faltas', () => {
    expect(codigos(new Uint8Array(250_001))).toEqual(['portada.formato', 'portada.peso'])
  })

  it('lo que no son bytes', () => {
    expect(codigos(null)).toEqual(['portada.formato'])
    expect(codigos('RIFF')).toEqual(['portada.formato'])
  })

  it('los bits de escala de VP8 no cuentan como ancho', () => {
    const b = webp('VP8 ', 1600, 1200)
    b[27] |= 0x40
    expect(codigos(b)).toEqual([])
  })

  it('cada falta nombra el campo coverAsset', () => {
    expect(revisarPortada(null)).toEqual([{ codigo: 'portada.formato', campo: 'coverAsset' }])
  })
})
