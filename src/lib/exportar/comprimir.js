// src/lib/exportar/comprimir.js
// El `.zip` de «Llevarme lo que escribí» (SPEC_24, D2).
//
// **El único archivo de `src/` que importa `fflate`, y bajo demanda**: la web
// no lo descarga hasta que alguien toca «Preparar mi archivo». Hay una prueba
// que recorre `src/` para comprobarlo.
//
// **`zipSync` y no `zip`.** La versión asíncrona crea workers desde una URL
// `blob:`, que es una pieza más que puede fallar dentro del WebView para
// ganar nada con unos pocos megas. La síncrona tarda menos de un segundo con
// dos mil días.

/**
 * Comprime archivos de texto en un zip, en memoria.
 *
 * @param {Record<string, string>} archivos - nombre → contenido.
 * @param {object} [opciones]
 * @param {Date} [opciones.fecha] - la fecha que llevan dentro; existe para que
 *   las pruebas den siempre los mismos bytes.
 * @returns {Promise<Uint8Array>}
 */
export async function comprimir(archivos, { fecha = new Date() } = {}) {
  const { zipSync, strToU8 } = await import('fflate')
  const entradas = {}
  for (const [nombre, contenido] of Object.entries(archivos)) {
    entradas[nombre] = [strToU8(contenido), { mtime: fecha }]
  }
  return zipSync(entradas, { level: 6 })
}
