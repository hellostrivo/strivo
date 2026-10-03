// Cabeceras WebP mínimas para las pruebas de la portada: lo justo que
// `revisarPortada` lee, y ceros en el resto. Ninguna imagen entra al repo.

/** Una cabecera WebP mínima de ese trozo y esas medidas, en `largo` bytes. */
export function webp(trozo, ancho, alto, largo = 64) {
  const b = new Uint8Array(largo)
  const escribir = (texto, i) => [...texto].forEach((ch, j) => (b[i + j] = ch.charCodeAt(0)))
  const u16 = (v, i) => ((b[i] = v & 0xff), (b[i + 1] = (v >>> 8) & 0xff))
  const u24 = (v, i) => (u16(v, i), (b[i + 2] = (v >>> 16) & 0xff))
  const u32 = (v, i) => (u24(v, i), (b[i + 3] = (v >>> 24) & 0xff))
  escribir('RIFF', 0)
  u32(largo - 8, 4)
  escribir('WEBP', 8)
  escribir(trozo, 12)
  if (trozo === 'VP8 ') {
    b.set([0x9d, 0x01, 0x2a], 23)
    u16(ancho, 26)
    u16(alto, 28)
  } else if (trozo === 'VP8L') {
    b[20] = 0x2f
    u32(((ancho - 1) | ((alto - 1) << 14)) >>> 0, 21)
  } else if (trozo === 'VP8X') {
    u24(ancho - 1, 24)
    u24(alto - 1, 27)
  }
  return b
}
