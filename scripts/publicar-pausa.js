#!/usr/bin/env node
// scripts/publicar-pausa.js
// El canal de Una pausa: lee las cápsulas del repo, las valida con el modelo y
// escribe `feed.json` con la vigente y el archivo, y las portadas que nombra.
//
//   node scripts/publicar-pausa.js --salida <carpeta> [--vista-previa] [--ahora <ISO 8601>]
//
// **Aquí solo hay E/S**: leer, llamar al modelo, escribir. Ninguna regla
// editorial vive en este archivo; están en `src/unaPausa/modelo/`, y la forma
// del canal en `canal.js`. Lo único propio son los mensajes para la editora,
// que no son copy de la app —la editora no es la persona usuaria— y por eso no
// viven en `src/copy`.
//
// Qué rompe y qué no (SPEC_28.2 §4.4):
//
//   - Una falta en una cápsula `aprobada` o `programada`, cualquier falta de
//     conjunto o de archivo, o una falta de portada en una `aprobada` o
//     `programada`, **rompen**: el script sale con 1 y no escribe nada. En el
//     sitio del canal eso es un build fallido, y Netlify conserva el deploy
//     anterior: la app sigue leyendo el canal de la semana pasada.
//   - Lo demás —borradores, `en_revision`, `prevalidada`— se imprime como
//     aviso. El trabajo editorial a medias no puede tumbar el canal.
//   - **Con `--vista-previa` nunca sale con otro código que 0** (DP-28.21): las
//     faltas se imprimen como avisos y el canal deja fuera lo inválido, como
//     siempre. Ese build corre en los deploys de rama de la app, y tras la
//     fusión también en los de revisión del lanzamiento: el contenido editorial
//     no puede tumbarlos. Lo decide `codigoDeSalida`.
//
// `publicar` es la función entera, y la línea de comandos solo corre si este
// archivo se invoca directamente: así las pruebas la llaman sin lanzar
// procesos. `--ahora` existe para las pruebas y para simular un build a mano;
// ningún `netlify.toml` lo pasa.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { AMPLIADO, CLINICO, FORBIDDEN } from '../src/lib/lexico.js'
import {
  CARPETA_DE_PORTADAS,
  generarCanal,
  portadasPublicadas,
} from '../src/unaPausa/modelo/canal.js'
import { desde } from '../src/unaPausa/modelo/estados.js'
import { PORTADA, revisarPortada } from '../src/unaPausa/modelo/portada.js'
import { LIMITE_VALIDACION_FINAL, esMarca } from '../src/unaPausa/modelo/semana.js'
import {
  FORMA_DE_PORTADA,
  IDS_DE_PROMESA,
  MAX_CARACTERES_DE_PREGUNTA,
  MAX_HALLAZGOS,
  MAX_PALABRAS,
  validar,
  validarConjunto,
} from '../src/unaPausa/modelo/validar.js'

/** La raíz del repo: el script vive en `scripts/`. */
const RAIZ = fileURLToPath(new URL('..', import.meta.url))

export const CAPSULAS = 'contenido/una-pausa/capsulas'
export const PORTADAS = 'contenido/una-pausa/portadas'

/** Lo que el script dice por su cuenta, porque es E/S y no regla. */
export const CODIGOS_DEL_SCRIPT = Object.freeze([
  'archivo.json',
  'archivo.nombre',
  'portada.archivo',
])

/** Los estados cuyas faltas rompen el canal: lo que ya está listo para salir. */
const ESTADOS_QUE_ROMPEN = ['aprobada', 'programada']
const rompe = (capsula) => ESTADOS_QUE_ROMPEN.includes(capsula?.status)

// ─── Mensajes para la editora ────────────────────────────────────────────────
// Uno por código. Cada línea impresa nombra el archivo, el campo y el código, y
// después una de estas frases. El tono es el de siempre, aunque solo lo lea la
// fundadora: sin exclamaciones y sin regaño.

const { diasAntes, hora } = LIMITE_VALIDACION_FINAL
const KB = PORTADA.maxBytes / 1000

const FRASES = Object.freeze({
  'archivo.json': 'el archivo no es JSON válido, o no trae una cápsula.',
  'archivo.nombre': 'el archivo se llama como el id de su cápsula: <id>.json.',
  'portada.archivo': `no hay un archivo con ese nombre en ${PORTADAS}/.`,

  'estado.desconocido': 'ese estado no existe; los nueve están en capsula.js.',
  'estado.derivado-en-fase-a':
    '«publicada» y «archivada» no se escriben en Fase A: salen solas del calendario.',
  'estado.reserva-con-semana': 'una reserva no lleva semana ni se programa.',
  'estado.generado-sin-fecha': 'una cápsula hecha con IA lleva también generatedAt.',
  'estado.editora-desconocida':
    'aquí va un identificador de EDITORAS, como «fundadora»; nunca un correo ni un nombre.',
  'estado.revision-incompleta':
    'a la revisión le falta algo: reviewedAt, prevalidatedAt o alguna de las secciones marcadas.',
  'estado.revision-antes-de-generar': 'la revisión va después de generatedAt.',
  'estado.sin-aprobar': 'una cápsula aprobada lleva approvedAt.',
  'estado.sin-programar': 'una cápsula programada lleva weekStart y scheduledAt.',

  'id.forma': 'el id va en minúsculas, cifras y guiones sueltos, como «hacer-espacio».',
  'campo.desconocido': 'ese campo no está en el modelo; puede ser una errata.',
  'fecha.forma':
    'la fecha no se lee: AAAA-MM-DD para la semana, ISO 8601 con desfase para las marcas.',
  'semana.no-es-lunes': 'la semana empieza en lunes.',
  'semana.falta': 'falta weekStart; solo una reserva o la piloto van sin semana.',

  'lexico.exclamacion': 'sin signos de exclamación.',
  'atenuacion.falta':
    'el resumen de la evidencia no lleva ninguna forma atenuada, como «sugiere», «puede» o «se asocia».',

  'texto.falta': 'este texto está vacío.',
  'hallazgos.cantidad': `van entre uno y ${MAX_HALLAZGOS} hallazgos.`,
  'practica.incompleta':
    'la invitación va entera o no va: destino y rótulo juntos, y practiceText solo con in_capsule.',
  'pregunta.forma': `una sola pregunta, entre «¿» y «?», de ${MAX_CARACTERES_DE_PREGUNTA} caracteres como mucho.`,
  'fuentes.falta': 'hace falta al menos una fuente.',
  'fuentes.incompleta':
    'a esta fuente le falta un dato: título, autoría, año (o null) y un enlace https.',
  'fuentes.doi': 'el DOI tiene la forma 10.xxxx/…',
  'fuentes.sin-revisar': 'esta fuente no está marcada como leída.',
  'lectura.larga': `la lectura pasa de ${MAX_PALABRAS} palabras.`,

  'portada.falta': 'desde prevalidada, la portada lleva su archivo y su texto alternativo.',
  'portada.nombre':
    'el nombre de la portada va en minúsculas, cifras y guiones, y termina en .webp, sin carpetas.',
  'portada.formato': 'el archivo no es un WebP.',
  'portada.ancho': `la portada mide ${PORTADA.ancho} px de ancho.`,
  'portada.proporcion': `la portada va en 4:3, ${PORTADA.ancho} × ${PORTADA.alto}.`,
  'portada.peso': `la portada pesa más de ${KB} KB (${PORTADA.maxBytes} bytes).`,

  'plazo.cuatro-semanas': 'la prevalidación llega más tarde de cuatro semanas antes de su lunes.',
  'plazo.validacion-final': `la validación final llega tarde: cierra ${diasAntes} días antes del lunes, a las ${hora} de Monterrey.`,
  'plazo.programada-tarde':
    'se programó con la semana ya empezada; se programa antes del lunes a las 00:00 de Monterrey.',

  'conjunto.id-repetido': 'hay más de una cápsula con este id.',
  'conjunto.choque': 'hay otra cápsula programada para la misma semana.',
})

/** Cómo se nombra cada regla del léxico, cuando su id no basta. */
const PALABRAS = Object.freeze({
  deberias: '«deberías»',
  tendrias: '«tendrías»',
  felicidades: '«Felicidades» con exclamación',
  'muy-bien': '«Muy bien» con exclamación',
  'dias-seguidos': '«días seguidos»',
  ansioso: '«ansioso» o «ansiosa»',
  estres: '«estrés»',
  'estres-derivados': 'un derivado de «estrés», como «estresante»,',
  panico: '«pánico»',
  terapia: '«terapia»',
  cura: 'una palabra de la familia de «cura»',
  sintoma: '«síntoma»',
  optimizar: 'una palabra de la familia de «optimizar»',
  maximizar: 'una palabra de la familia de «maximizar»',
  depresion: '«depresión»',
  diagnostico: '«diagnóstico»',
  meta: '«meta»',
})

const REGLAS_DEL_LEXICO = new Map(
  [...FORBIDDEN, ...CLINICO, ...AMPLIADO].map((r) => [r.id, { nivel: 'falta', ...r }]),
)

const nombreDe = (id) => PALABRAS[id] ?? `«${id.replaceAll('-', ' ')}»`

/** Qué dice una promesa, con sus tildes. */
const PROMESAS = Object.freeze({
  'te-hara': '«te hará»',
  'esta-probado': '«está probado»',
  'te-sentiras': '«te sentirás»',
})

/**
 * La frase de un código, o `null` si no tiene. Los `lexico.<id>` y los
 * `promesa.<id>` se cubren por familia, con el nombre de su regla.
 * @param {string} codigo
 * @returns {string|null}
 */
export function mensajeDe(codigo) {
  if (Object.hasOwn(FRASES, codigo)) return FRASES[codigo]

  if (codigo.startsWith('lexico.')) {
    const regla = REGLAS_DEL_LEXICO.get(codigo.slice('lexico.'.length))
    if (regla === undefined) return null
    const nombre = nombreDe(regla.id)
    if (regla.nivel === 'aviso') {
      const motivo = regla.reason.replace(/\s*\(.*\)$/, '').toLowerCase()
      return `${nombre} es ${motivo}; mira si aquí hace falta.`
    }
    return `${nombre} no se usa en una cápsula.`
  }

  if (codigo.startsWith('promesa.')) {
    const id = codigo.slice('promesa.'.length)
    if (!IDS_DE_PROMESA.includes(id)) return null
    const dicho = PROMESAS[id] ?? nombreDe(id)
    return `${dicho} suena a promesa de resultado; la evidencia acompaña, no asegura.`
  }

  return null
}

/** Una línea para la editora: archivo · campo · código — frase. */
export function lineaDe({ archivo, campo, codigo }) {
  const donde = [archivo, campo, codigo].filter((v) => v !== null && v !== undefined && v !== '')
  return `${donde.join(' · ')} — ${mensajeDe(codigo) ?? 'este código todavía no tiene frase.'}`
}

// ─── Lectura ─────────────────────────────────────────────────────────────────

/**
 * Las cápsulas de `contenido/`, en orden de nombre de archivo. Un archivo que
 * no es JSON, o que no se llama como su id, es una falta de archivo y no entra
 * al canal.
 * @param {string} raiz
 * @returns {{leidas: {archivo: string, capsula: object}[], descartadas: {archivo: string, capsula: object}[], faltas: object[]}}
 */
export function leerCapsulas(raiz) {
  const dir = join(raiz, CAPSULAS)
  const nombres = existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => n.endsWith('.json'))
        .sort()
    : []
  const leidas = []
  const descartadas = []
  const faltas = []

  for (const nombre of nombres) {
    const archivo = `${CAPSULAS}/${nombre}`
    let capsula
    try {
      capsula = JSON.parse(readFileSync(join(dir, nombre), 'utf8'))
    } catch {
      faltas.push({ archivo, campo: null, codigo: 'archivo.json' })
      continue
    }
    if (capsula === null || typeof capsula !== 'object' || Array.isArray(capsula)) {
      faltas.push({ archivo, campo: null, codigo: 'archivo.json' })
      continue
    }
    if (capsula.id !== nombre.slice(0, -'.json'.length)) {
      faltas.push({ archivo, campo: 'id', codigo: 'archivo.nombre' })
      descartadas.push({ archivo, capsula })
      continue
    }
    leidas.push({ archivo, capsula })
  }

  return { leidas, descartadas, faltas }
}

/**
 * Las faltas de la portada de una cápsula, o `[]`. Sin un nombre válido no se
 * toca el disco: `portada.nombre` ya lo dice el validador.
 */
function revisarPortadaDe(raiz, capsula) {
  const nombre = capsula.coverAsset
  if (typeof nombre !== 'string' || !FORMA_DE_PORTADA.test(nombre)) return null
  const ruta = join(raiz, PORTADAS, nombre)
  if (!existsSync(ruta) || !statSync(ruta).isFile()) {
    return [{ codigo: 'portada.archivo', campo: 'coverAsset' }]
  }
  return revisarPortada(readFileSync(ruta))
}

// ─── El canal ────────────────────────────────────────────────────────────────

/**
 * El código de salida. Con `vistaPrevia`, 0 siempre (DP-28.21); sin ella, 1 si
 * hay alguna falta.
 * @param {{faltas: unknown[]}} resultado
 * @param {{vistaPrevia?: boolean}} [opciones]
 */
export function codigoDeSalida({ faltas }, { vistaPrevia = false } = {}) {
  if (vistaPrevia) return 0
  return faltas.length > 0 ? 1 : 0
}

/**
 * Lee, valida y, si no hay nada que rompa, escribe el canal en
 * `<salida>/una-pausa/`.
 *
 * `faltas` son siempre las que romperían el canal de producción, también en la
 * vista previa: ahí no rompen, pero siguen siendo lo que son. `ok` dice si el
 * canal se escribió.
 *
 * @param {{raiz?: string, salida: string, ahora?: Date|number|string, vistaPrevia?: boolean}} opciones
 * @returns {{ok: boolean, faltas: object[], avisos: object[], canal: object}}
 */
export function publicar({ raiz = RAIZ, salida, ahora = new Date(), vistaPrevia = false }) {
  const { leidas, descartadas, faltas } = leerCapsulas(raiz)
  const avisos = []

  for (const { archivo, capsula } of leidas) {
    const resultado = validar(capsula)
    const destino = rompe(capsula) ? faltas : avisos
    destino.push(...resultado.faltas.map((f) => ({ archivo, ...f })))
    avisos.push(...resultado.avisos.map((a) => ({ archivo, ...a })))
  }

  // El conjunto mira también los archivos mal nombrados: un `x.json` con el id
  // de otro es justo cómo se repite un id.
  const todas = [...leidas, ...descartadas]
  for (const falta of validarConjunto(todas.map((l) => l.capsula)).faltas) {
    for (const { archivo, capsula } of todas) {
      if (capsula.id === falta.campo) faltas.push({ archivo, ...falta })
    }
  }

  // Las portadas: solo se nombran las que están y pasan, y solo se reportan
  // desde `prevalidada`, que es desde cuando el validador las exige.
  const portadas = new Set()
  for (const { archivo, capsula } of leidas) {
    const problemas = revisarPortadaDe(raiz, capsula)
    if (problemas === null) continue
    if (problemas.length === 0) {
      portadas.add(capsula.coverAsset)
      continue
    }
    if (!desde(capsula.status, 'prevalidada')) continue
    const destino = rompe(capsula) ? faltas : avisos
    destino.push(...problemas.map((p) => ({ archivo, ...p })))
  }

  const canal = generarCanal(
    leidas.map((l) => l.capsula),
    ahora,
    { vistaPrevia, portadas },
  )
  const ok = codigoDeSalida({ faltas }, { vistaPrevia }) === 0

  if (ok) {
    const destino = join(resolve(raiz, salida), 'una-pausa')
    rmSync(destino, { recursive: true, force: true })
    mkdirSync(join(destino, CARPETA_DE_PORTADAS), { recursive: true })
    writeFileSync(join(destino, 'feed.json'), `${JSON.stringify(canal, null, 2)}\n`)
    for (const nombre of portadasPublicadas(canal)) {
      copyFileSync(join(raiz, PORTADAS, nombre), join(destino, CARPETA_DE_PORTADAS, nombre))
    }
  }

  return { ok, faltas, avisos, canal }
}

/**
 * Lo que se imprime, línea a línea. En la vista previa las faltas van con los
 * avisos, y se dice por qué.
 */
export function informe({ ok, faltas, avisos, canal }, { vistaPrevia = false, salida = '' } = {}) {
  const lineas = []
  const n = (cantidad, una, varias) => `${cantidad} ${cantidad === 1 ? una : varias}`
  const total = (canal.vigente ? 1 : 0) + canal.archivo.length

  lineas.push(
    `Una pausa · semana del ${canal.semana}${vistaPrevia ? ' · vista previa' : ''} · ${n(total, 'cápsula publicada', 'cápsulas publicadas')}`,
  )

  if (faltas.length > 0 && !vistaPrevia) {
    lineas.push('', 'Faltas. El canal no se escribe hasta que se resuelvan:')
    lineas.push(...faltas.map((f) => `  ${lineaDe(f)}`))
  }
  if (faltas.length > 0 && vistaPrevia) {
    lineas.push('', 'En el canal de producción, esto serían faltas. Aquí solo se avisa:')
    lineas.push(...faltas.map((f) => `  ${lineaDe(f)}`))
  }
  if (avisos.length > 0) {
    lineas.push('', 'Avisos:')
    lineas.push(...avisos.map((a) => `  ${lineaDe(a)}`))
  }

  if (ok) {
    const portadas = portadasPublicadas(canal).length
    lineas.push('', `Escrito en ${salida}: feed.json y ${n(portadas, 'portada', 'portadas')}.`)
  }
  return lineas
}

// ─── Línea de comandos ───────────────────────────────────────────────────────

/** `--salida`, `--vista-previa` y `--ahora`. Lo demás es un error. */
export function leerArgumentos(argv) {
  const args = { salida: null, vistaPrevia: false, ahora: null, error: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--vista-previa') args.vistaPrevia = true
    else if (arg === '--salida') args.salida = argv[++i] ?? null
    else if (arg === '--ahora') args.ahora = argv[++i] ?? null
    else args.error = `No conozco «${arg}».`
  }
  if (args.error === null && !args.salida) args.error = 'Falta --salida <carpeta>.'
  if (args.error === null && args.ahora !== null && !esMarca(args.ahora)) {
    args.error = '--ahora va en ISO 8601 con desfase, como 2026-12-07T00:00:00-06:00.'
  }
  return args
}

const USO =
  'Uso: node scripts/publicar-pausa.js --salida <carpeta> [--vista-previa] [--ahora <ISO 8601>]'

function main(argv) {
  const vistaPrevia = argv.includes('--vista-previa')
  try {
    const args = leerArgumentos(argv)
    if (args.error !== null) {
      console.error(`${args.error}\n${USO}`)
      return codigoDeSalida({ faltas: [args.error] }, { vistaPrevia })
    }
    const resultado = publicar({
      salida: resolve(process.cwd(), args.salida),
      ahora: args.ahora ?? new Date(),
      vistaPrevia,
    })
    const lineas = informe(resultado, { vistaPrevia, salida: `${args.salida}/una-pausa` })
    ;(resultado.ok ? console.log : console.error)(lineas.join('\n'))
    return codigoDeSalida(resultado, { vistaPrevia })
  } catch (error) {
    console.error(`El canal no se pudo generar: ${error?.message ?? error}`)
    return codigoDeSalida({ faltas: [error] }, { vistaPrevia })
  }
}

function invocadoDirectamente() {
  try {
    return pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url
  } catch {
    return false
  }
}

if (invocadoDirectamente()) process.exitCode = main(process.argv.slice(2))
