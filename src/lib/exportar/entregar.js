// src/lib/exportar/entregar.js
// Hacer llegar el archivo a la persona (SPEC_24, DP-24.9).
//
// **En la web, una descarga directa.** En la app de iPhone, la hoja de
// compartir del sistema, que vive en `entregarNativo.js` y se carga solo ahí:
// la web no descarga ni una línea de esos plugins.
//
// Contesta qué pasó, nunca lanza por una cancelación: cerrar la hoja sin
// elegir nada no es un error y no se dice nada (volver a tocar regenera).

import { esNativa } from '@lib/plataforma'

/** Lo que puede pasar al entregar. */
export const ENTREGA = Object.freeze({
  descargado: 'descargado',
  compartido: 'compartido',
  cancelado: 'cancelado',
})

/** La descarga de la web: un enlace con `download` sobre un `Blob`. */
export function descargar(bytes, nombre, { documento = globalThis.document } = {}) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }))
  try {
    const enlace = documento.createElement('a')
    enlace.href = url
    enlace.download = nombre
    enlace.rel = 'noopener'
    documento.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
  } finally {
    // Después de que el navegador haya tomado el enlace.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return ENTREGA.descargado
}

/**
 * @param {Uint8Array} bytes
 * @param {string} nombre
 * @param {object} [opciones]
 * @param {boolean} [opciones.nativa] - Existe para las pruebas.
 * @returns {Promise<'descargado'|'compartido'|'cancelado'>}
 */
export async function entregar(bytes, nombre, { nativa = esNativa() } = {}) {
  if (!nativa) return descargar(bytes, nombre)
  const { entregarNativo } = await import('./entregarNativo.js')
  return entregarNativo(bytes, nombre)
}
