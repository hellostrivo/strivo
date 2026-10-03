// src/unaPausa/modelo/portada.js
// Si el archivo de una portada es lo que DP-28.4 pide: WebP, 1600 px de ancho,
// 4:3 y no más de 250 KB.
//
// Recibe los bytes y no la ruta: leer el archivo es del script del canal, que
// hace la E/S. Aquí no hay `fs` ni dependencias; la cabecera RIFF/WebP se lee a
// mano, en sus tres formas —`VP8 ` (con pérdida), `VP8L` (sin pérdida) y `VP8X`
// (extendida)—. Ninguna imagen entra al repo para probarlo: las pruebas
// construyen cabeceras mínimas en memoria.

/**
 * 250 KB son 250 000 bytes, en decimal: es lo que muestra el Finder de macOS,
 * que es donde la fundadora mira el peso de la foto.
 */
export const PORTADA = Object.freeze({ ancho: 1600, alto: 1200, maxBytes: 250_000 })

export const CODIGOS_DE_PORTADA = Object.freeze([
  'portada.formato',
  'portada.ancho',
  'portada.proporcion',
  'portada.peso',
])

const ascii = (bytes, desde, largo) => String.fromCharCode(...bytes.subarray(desde, desde + largo))
const u16 = (b, i) => b[i] | (b[i + 1] << 8)
const u24 = (b, i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16)
const u32 = (b, i) => (u24(b, i) | (b[i + 3] << 24)) >>> 0

/**
 * Ancho y alto de un WebP, o `null` si no lo es.
 * @param {Uint8Array} b
 * @returns {{ancho: number, alto: number}|null}
 */
function medidas(b) {
  if (b.length < 30 || ascii(b, 0, 4) !== 'RIFF' || ascii(b, 8, 4) !== 'WEBP') return null
  const trozo = ascii(b, 12, 4)

  // Con pérdida: marco clave con su código de inicio, y 14 bits por medida.
  if (trozo === 'VP8 ') {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null
    return { ancho: u16(b, 26) & 0x3fff, alto: u16(b, 28) & 0x3fff }
  }

  // Sin pérdida: la firma 0x2f y dos medidas de 14 bits, menos uno cada una.
  if (trozo === 'VP8L') {
    if (b[20] !== 0x2f) return null
    const bits = u32(b, 21)
    return { ancho: (bits & 0x3fff) + 1, alto: ((bits >>> 14) & 0x3fff) + 1 }
  }

  // Extendida: el lienzo, 24 bits por medida, menos uno cada una.
  if (trozo === 'VP8X') {
    return { ancho: u24(b, 24) + 1, alto: u24(b, 27) + 1 }
  }

  return null
}

/**
 * Las faltas de una portada. `campo` es siempre `coverAsset`: lo que falla es
 * el archivo que ese campo nombra.
 * @param {Uint8Array} bytes
 * @returns {{codigo: string, campo: string}[]}
 */
export function revisarPortada(bytes) {
  const falta = (codigo) => ({ codigo, campo: 'coverAsset' })
  if (!(bytes instanceof Uint8Array)) return [falta('portada.formato')]

  const faltas = []
  const m = medidas(bytes)
  if (m === null) {
    faltas.push(falta('portada.formato'))
  } else {
    if (m.ancho !== PORTADA.ancho) faltas.push(falta('portada.ancho'))
    if (m.ancho * PORTADA.alto !== m.alto * PORTADA.ancho) faltas.push(falta('portada.proporcion'))
  }
  if (bytes.length > PORTADA.maxBytes) faltas.push(falta('portada.peso'))
  return faltas
}
