// src/lib/exportar/entregarNativo.js
// El archivo, en la hoja de compartir del iPhone (SPEC_24, DP-24.9 y D1).
//
// **El único archivo de `src/` que importa `@capacitor/share`, y bajo
// demanda**, y el segundo que importa nuestro `strivo-almacen` (el primero es
// la base, `lib/db/adaptadorSQLite.js`). En la web no se carga nunca.
//
// Por qué no `navigator.share` ni la descarga de la web: el zip se arma de
// forma asíncrona y WebKit pide que el toque siga «activo» al compartir, y
// Capacitor no sabe qué hacer con un enlace `blob:` con `download`. La hoja
// nativa no tiene ninguna de las dos limitaciones.
//
// El orden: el plugin escribe el zip en `Library/Caches/Strivo/exportar/`
// —vaciando antes la carpeta, por si quedó uno de una vez que la app se cerró
// con la hoja abierta—, la hoja lo comparte y, pase lo que pase, se borra.
//
// **Los plugins nunca salen sueltos de una promesa** (SPEC_21.2): son Proxies
// de Capacitor que contestan a `then`. Se devuelven envueltos.

/** El mensaje exacto con el que `@capacitor/share` 8.0.3 dice que se cerró la hoja. */
const CANCELADO = 'Share canceled'

async function cargarPlugins() {
  const { Share } = await import('@capacitor/share')
  const { StrivoAlmacen } = await import('strivo-almacen')
  return { compartir: Share, almacen: StrivoAlmacen }
}

/** ¿Cerró la persona la hoja sin elegir nada? No es un error y no se dice nada. */
export function esCancelacionDeHoja(error) {
  return String(error?.message ?? error ?? '').includes(CANCELADO)
}

/** Bytes a base64, sin desbordar la pila con archivos grandes. */
export function aBase64(bytes) {
  let binario = ''
  const trozo = 0x8000
  for (let i = 0; i < bytes.length; i += trozo) {
    binario += String.fromCharCode.apply(null, bytes.subarray(i, i + trozo))
  }
  return btoa(binario)
}

/**
 * Comparte el zip con la hoja del sistema.
 *
 * @param {Uint8Array} bytes
 * @param {string} nombre
 * @param {object} [dobles] - Existen para las pruebas.
 * @returns {Promise<'compartido'|'cancelado'>} Lanza si algo falla de verdad.
 */
export async function entregarNativo(bytes, nombre, { cargar = cargarPlugins } = {}) {
  const { compartir, almacen } = await cargar()
  const { url } = await almacen.escribirTemporal({ nombre, base64: aBase64(bytes) })
  try {
    await compartir.share({ files: [url], title: nombre })
    return 'compartido'
  } catch (error) {
    if (esCancelacionDeHoja(error)) return 'cancelado'
    throw error
  } finally {
    await almacen.borrarTemporal({ url }).catch(() => {})
  }
}
