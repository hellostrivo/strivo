// src/lib/exportar/archivo.js
// El contenido del archivo de «Llevarme lo que escribí» (SPEC_24A, DP-24.8).
//
// **Territorio neutral**: no conoce el diario ni Respiración. Recibe las
// secciones ya resueltas —cada bloque con su pregunta delante y sus respuestas—
// y las escribe como `entradas.md` y `entradas.json`. Qué bloques hay y con qué
// título lo decide quien los construye (`diario/exportar.js`,
// `breathing/data/exportar.js`, `perfil/exportar.js`).
//
// **El `.md` es para leerse, el `.json` es el registro exacto.** En el `.md`
// los textos de la persona van tal cual, con dos cuidados para que no cambien
// de aspecto al abrirse con un visor de Markdown (§4.1 del reporte previo):
//
//   - se escapan con `\` los caracteres que convertirían una línea en
//     estructura (`#`, `>`, una lista, una regla) y los que darían formato en
//     cualquier sitio (`\`, `*`, `_`, `` ` ``, `<`, `[`, `]`);
//   - cada salto de línea se conserva: uno simple termina con dos espacios
//     (salto duro, invisible al leerlo como texto plano) y los párrafos siguen
//     separados por una línea en blanco.
//
// El texto exacto, sin escapar, está siempre en el `.json`.

/** El identificador del formato y su versión. Cambiar la forma del `.json` sube la versión. */
export const FORMATO = 'strivo.exportacion'
export const VERSION = 1

/** Los dos archivos que lleva el zip. */
export const ARCHIVOS = Object.freeze({ md: 'entradas.md', json: 'entradas.json' })

// ─── Nombre y fecha ──────────────────────────────────────────────────────────

/** `YYYY-MM-DD` en la zona de quien exporta. */
export function claveDeFechaLocal(fecha = new Date()) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** ISO con el desfase local, no UTC: a qué hora era para quien exportó. */
export function marcaLocalIso(fecha = new Date()) {
  const desfase = -fecha.getTimezoneOffset()
  const signo = desfase >= 0 ? '+' : '-'
  const h = String(Math.floor(Math.abs(desfase) / 60)).padStart(2, '0')
  const min = String(Math.abs(desfase) % 60).padStart(2, '0')
  const local = new Date(fecha.getTime() + desfase * 60000).toISOString().slice(0, 23)
  return `${local}${signo}${h}:${min}`
}

/**
 * `strivo-{nombre}-{fecha}.zip`: el nombre sin acentos, en minúsculas, con
 * guiones y solo `[a-z0-9-]`. Sin nombre —o con uno que no deja nada—,
 * `strivo-{fecha}.zip`.
 */
export function nombreDeArchivo(nombre, fechaClave) {
  const limpio = String(nombre ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return limpio === '' ? `strivo-${fechaClave}.zip` : `strivo-${limpio}-${fechaClave}.zip`
}

// ─── Escapar ─────────────────────────────────────────────────────────────────

const EN_CUALQUIER_SITIO = /[\\*_`<[\]]/g

/** Una línea, escapada para que no se convierta en estructura. */
function escaparLinea(linea) {
  let resultado = linea.replace(EN_CUALQUIER_SITIO, (c) => `\\${c}`)
  // Una regla horizontal o un subrayado de encabezado.
  if (/^\s*([-=])\1{2,}\s*$/.test(resultado)) return `\\${resultado.trimStart()}`
  // Al principio de la línea: encabezado, cita, lista o lista numerada.
  resultado = resultado.replace(/^(\s*)([#>+-])/, '$1\\$2')
  resultado = resultado.replace(/^(\s*\d+)([.)])(?=\s|$)/, '$1\\$2')
  return resultado
}

/**
 * Un texto de la persona, listo para el `.md`. Conserva cada salto de línea y
 * cada párrafo. `sangria` va delante de cada línea a partir de la segunda (la
 * continuación de un punto de una lista numerada).
 */
export function escaparMd(texto, { sangria = '' } = {}) {
  const lineas = String(texto ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
  return lineas
    .map((linea, i) => {
      const escapada = escaparLinea(linea)
      const siguienteVacia = i + 1 < lineas.length && lineas[i + 1].trim() === ''
      const final = i === lineas.length - 1 || linea.trim() === '' || siguienteVacia ? '' : '  '
      const prefijo = i === 0 || linea.trim() === '' ? '' : sangria
      return `${prefijo}${escapada}${final}`
    })
    .join('\n')
}

// ─── Markdown ────────────────────────────────────────────────────────────────

/** El título de un bloque: la pregunta, con las citas en cursiva como en la app. */
function tituloDe(bloque) {
  if (Array.isArray(bloque.tituloPartes) && bloque.tituloPartes.length > 0) {
    return bloque.tituloPartes
      .map((parte) => (parte.cita ? `*${escaparMd(parte.texto)}*` : escaparMd(parte.texto)))
      .join('')
  }
  return escaparMd(bloque.titulo)
}

/** Un bloque con su pregunta delante y su respuesta debajo. */
export function mdDeBloque(bloque) {
  if (bloque.forma === 'frase') return bloque.lineas.map((l) => escaparMd(l)).join('\n\n')
  const cabeza = bloque.titulo ? `**${tituloDe(bloque)}**\n` : ''
  if (bloque.forma === 'chip') {
    return `${cabeza}${escaparMd(bloque.fichas.map((f) => f.texto).join(' · '))}`
  }
  if (bloque.numerado) {
    const puntos = bloque.lineas
      .map((linea) => String(linea ?? '').trim())
      .filter((linea) => linea !== '')
      .map((linea, i) => {
        const marca = `${i + 1}. `
        return `${marca}${escaparMd(linea, { sangria: ' '.repeat(marca.length) })}`
      })
    return `${cabeza}${puntos.join('\n')}`
  }
  return `${cabeza}${bloque.lineas.map((l) => escaparMd(String(l ?? '').trim())).join('\n\n')}`
}

function mdDeEntrada(entrada) {
  const encabezado = [
    entrada.encabezado ? `**${escaparMd(entrada.encabezado)}**` : '',
    entrada.detalle ? escaparMd(entrada.detalle) : '',
  ]
    .filter(Boolean)
    .join(' · ')
  return [encabezado, escaparMd(entrada.texto)].filter((x) => x !== '').join('\n')
}

function mdDeParte(parte) {
  const cuerpo = parte.entradas ? parte.entradas.map(mdDeEntrada) : parte.bloques.map(mdDeBloque)
  return [`### ${escaparMd(parte.titulo)}`, ...cuerpo].join('\n\n')
}

/**
 * `entradas.md`.
 *
 * @param {object} doc
 * @param {string} doc.titulo
 * @param {string} doc.subtitulo
 * @param {{titulo: string, bloques: object[]}} doc.tu
 * @param {Array<{titulo: string, partes: object[]}>} doc.dias
 * @param {?{titulo: string, intro: string, combinaciones: Array<{nombre: string, detalle: string}>}} doc.respiracion
 */
export function construirMd({ titulo, subtitulo, tu, dias, respiracion }) {
  const secciones = [`# ${escaparMd(titulo)}\n\n${escaparMd(subtitulo)}`]
  if (tu?.bloques?.length) {
    secciones.push([`## ${escaparMd(tu.titulo)}`, ...tu.bloques.map(mdDeBloque)].join('\n\n'))
  }
  for (const dia of dias) {
    secciones.push([`## ${escaparMd(dia.titulo)}`, ...dia.partes.map(mdDeParte)].join('\n\n'))
  }
  if (respiracion?.combinaciones?.length) {
    const lineas = respiracion.combinaciones.map(
      (c) => `- **${escaparMd(c.nombre)}** · ${escaparMd(c.detalle)}`,
    )
    secciones.push(
      [`## ${escaparMd(respiracion.titulo)}`, escaparMd(respiracion.intro), lineas.join('\n')].join(
        '\n\n',
      ),
    )
  }
  return `${secciones.join('\n\n---\n\n')}\n`
}

/** `entradas.json`, con el formato y la versión delante. */
export function construirJson(contenido) {
  return `${JSON.stringify({ formato: FORMATO, version: VERSION, ...contenido }, null, 2)}\n`
}
