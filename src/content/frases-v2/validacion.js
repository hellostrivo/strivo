// src/content/frases-v2/validacion.js
// Las reglas editoriales del catálogo v2, como funciones puras (SPEC_28 §8–§10).
//
// Viven aquí, junto a los datos, porque las consumen dos sitios —el script
// `scripts/validar-frases.js` y las pruebas— y dos copias de la misma regla
// envejecen distinto. No leen archivos: quien llama les pasa el texto del
// expediente de fuentes.
//
// Cada función devuelve una lista de problemas (`{ id, regla, detalle }`);
// vacía es que todo está en orden.

import { AUDIENCIAS, perfilesPosibles } from '../../referencias/preferencias.js'
import {
  CATALOGO_VERSION,
  ESTADOS,
  SUBTEMAS,
  TEMAS,
  TEMAS_DE_RENDIMIENTO,
  TIPOS,
} from './construir.js'
import { elegiblesPara } from './index.js'

/** Cuántas frases distintas tiene que poder ver cada perfil antes de repetir. */
export const MINIMO_POR_PERFIL = 500

/** Cuántas por tema, para que el ciclo de cinco temas sostenga esos días. */
export const MINIMO_POR_TEMA = MINIMO_POR_PERFIL / TEMAS.length

/** Largo máximo de una frase, en caracteres. */
export const LARGO_MAXIMO = 150

/** Proporción buscada de citas en cada repertorio (§8.8). Es una meta editorial, no una regla. */
export const PROPORCION_DE_CITAS = Object.freeze({ min: 0.25, max: 0.35 })

const CAMPOS = Object.freeze([
  'id',
  'catalogoVersion',
  'texto',
  'tema',
  'subtema',
  'tipo',
  'audiencias',
  'estado',
  'aptaConAnimoBajo',
  'atribucion',
  'fuenteClave',
])

// ─── Léxico ───────────────────────────────────────────────────────────────────
// El de CLAUDE.md §3 y el de §10 de la SPEC: mandatos, absolutos, rendimiento,
// medición, diagnóstico y exclamaciones. Se aplica a la voz de Strivo —el texto
// de las originales y cualquier atribución—, nunca al texto de una cita.

export const LEXICO_PROHIBIDO = Object.freeze([
  [/[¡!]/, 'exclamación'],
  [/\bs[oó]lo\b/i, '«solo»'],
  [/\bnunca\b/i, '«nunca»'],
  [/\bsiempre\b/i, '«siempre»'],
  [/\bdeber[íi]a(s|n)?\b/i, '«debería»'],
  [/\bdebes\b/i, '«debes»'],
  [/\bti[e]nes? que\b/i, '«tienes que»'],
  [/\bhay que\b/i, '«hay que»'],
  [/\bnecesitas hacer\b/i, '«necesitas hacer»'],
  [/\bfallaste\b|\bincumpliste\b|\babandonaste\b|\bte falt[oó]\b/i, 'léxico de fracaso'],
  [/\bincomplet[oa]s?\b|\bfracas/i, 'léxico de fracaso'],
  [/\bracha\b|\bstreak\b|\bpuntuaci[oó]n\b|\bnivel\b|\bprogreso\b|\bporcentaje\b/i, 'medición'],
  [/\btareas?\b|\bpendientes?\b|\bobjetivos?\b|\bmetas?\b/i, 'productividad'],
  [/\boptimiz|\brendimiento\b|\bproductiv|\bmaximiz/i, 'rendimiento'],
  [/\bansiedad\b|\bdepresi|\btrastorno\b|\bs[ií]ntoma|\bterap|\bcura\b/i, 'registro clínico'],
])

// ─── Marcas de referencia ─────────────────────────────────────────────────────
// Palabras que delatan una tradición o una práctica religiosa o espiritual. Lo
// universal y lo secular no puede llevar ninguna; lo espiritual general no
// puede llevar las de una tradición concreta; y una tradición no puede llevar
// las de otra. Es una red, no un juicio: lo que no atrapa lo atrapa la lectura.

const MARCAS_RELIGIOSAS = [
  /\bdios(es)?\b/i,
  /\bSeñor\b/,
  /\bjes[uú]s\b/i,
  /\bcristo\b|\bcristian/i,
  /\bevangelio\b|\bsalmos?\b|\bbiblia\b|\biglesia\b|\bcruz\b/i,
  /\boraci[oó]n\b|\borar\b|\brezar\b|\bplegaria\b/i,
  /\bgracia\b|\bbendici/i,
  /\bsagrad|\bdivin|\bsanto\b|\bsantuario\b/i,
  /\balma\b|\besp[ií]ritu|\bfe\b|\bdevoci|\bofrenda\b|\breverencia\b|\btrascend/i,
  /\bbuda\b|\bb[uú]dic|\bbudis|\bsangha\b|\bnirvana\b|\bmeditaci|\bmedit[ae]/i,
  /\bhind[uú]|\batman\b|\bdharma\b|\bkarma\b|\byoga\b|\bmantra\b|\bkrishna\b/i,
  /\bestoic|\blo que depende de ti\b|\bvirtud/i,
]

const MARCAS_POR_TRADICION = Object.freeze({
  cristianismo: [
    /\bdios\b/i,
    /\bSeñor\b/,
    /\bjes[uú]s\b/i,
    /\bcristo\b|\bcristian/i,
    /\bevangelio\b|\bsalmos?\b|\bbiblia\b|\biglesia\b|\bcruz\b/i,
  ],
  budismo: [/\bbuda\b|\bb[uú]dic|\bbudis|\bsangha\b|\bnirvana\b|\b[oó]ctuple\b/i],
  hinduismo: [
    /\bhind[uú]|\batman\b|\byoga\b|\bbhakti\b|\bseva\b|\bprasad\b|\bnamast[eé]\b/i,
    /\bgur[uú]\b|\bmantra\b|\bpranayama\b|\bjñana\b|\btapas\b|\bOm\b|\bkarma\b/i,
  ],
  estoicismo: [/\bestoic|\bciudadela\b|\bamor fati\b/i],
})

function marcasDeTradiciones(excepto = null) {
  return Object.entries(MARCAS_POR_TRADICION)
    .filter(([tradicion]) => tradicion !== excepto)
    .flatMap(([, marcas]) => marcas)
}

/** Texto en minúsculas, sin acentos, sin puntuación y con espacios simples. */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const VACIAS = new Set(
  (
    'a al algo ante aun con como cada de del desde el en es esa ese eso esta este esto ' +
    'hay la las le lo los mas me mi muy no o otra otro para pero poco por que se ser si ' +
    'sin su sus tambien te ti tu tus un una uno unos y ya puede puedes hoy'
  ).split(' '),
)

function palabrasDe(texto) {
  return new Set(
    normalizarTexto(texto)
      .split(' ')
      .filter((p) => p && !VACIAS.has(p)),
  )
}

function parecido(a, b) {
  if (a.size === 0 || b.size === 0) return 0
  let comunes = 0
  for (const p of a) if (b.has(p)) comunes += 1
  return comunes / (a.size + b.size - comunes)
}

/** Umbral de casi duplicado: proporción de palabras con contenido compartidas. */
export const UMBRAL_CASI_DUPLICADO = 0.75

// ─── Reglas por entrada ───────────────────────────────────────────────────────

/** Forma, metadatos y voz de cada entrada. */
export function problemasDeEntradas(catalogo) {
  const problemas = []
  const ids = new Set()
  const avisar = (id, regla, detalle = '') => problemas.push({ id, regla, detalle })

  for (const frase of catalogo) {
    const id = frase?.id ?? '(sin id)'

    for (const campo of CAMPOS) {
      if (!(campo in (frase ?? {}))) avisar(id, 'campo-faltante', campo)
    }
    if (ids.has(id)) avisar(id, 'id-repetido')
    ids.add(id)

    if (frase.catalogoVersion !== CATALOGO_VERSION) avisar(id, 'version-catalogo')
    if (!TEMAS.includes(frase.tema)) avisar(id, 'tema', frase.tema)
    if (frase.subtema !== null && !SUBTEMAS.includes(frase.subtema)) {
      avisar(id, 'subtema', frase.subtema)
    }
    if (!TIPOS.includes(frase.tipo)) avisar(id, 'tipo', frase.tipo)
    if (!ESTADOS.includes(frase.estado)) avisar(id, 'estado', frase.estado)
    if (!Array.isArray(frase.audiencias) || frase.audiencias.length === 0) {
      avisar(id, 'audiencias-vacias')
    } else {
      frase.audiencias
        .filter((a) => !AUDIENCIAS.includes(a))
        .forEach((a) => avisar(id, 'audiencia-desconocida', a))
    }
    if (typeof frase.aptaConAnimoBajo !== 'boolean') avisar(id, 'apta-con-animo-bajo')
    if (TEMAS_DE_RENDIMIENTO.includes(frase.tema) && frase.aptaConAnimoBajo) {
      avisar(id, 'esfuerzo-apto-con-animo-bajo')
    }

    const texto = typeof frase.texto === 'string' ? frase.texto.trim() : ''
    if (!texto) avisar(id, 'texto-vacio')
    if (texto.length > LARGO_MAXIMO) avisar(id, 'texto-largo', `${texto.length} caracteres`)
    if (/\n/.test(texto)) avisar(id, 'texto-en-verso', 'una frase es una línea')

    if (frase.tipo === 'original') {
      if (frase.atribucion !== null) avisar(id, 'original-con-atribucion')
      if (frase.fuenteClave !== null) avisar(id, 'original-con-fuente')
      if (/[«»“”"]/.test(texto)) avisar(id, 'original-con-comillas')
      if (!/^[A-ZÁÉÍÓÚÑ]/.test(texto)) avisar(id, 'original-sin-mayuscula-inicial')
      if (!/[.?]$/.test(texto)) avisar(id, 'original-sin-punto-final')
    }

    if (frase.tipo === 'cita') {
      if (typeof frase.atribucion !== 'string' || !frase.atribucion.includes(' · ')) {
        avisar(id, 'cita-sin-atribucion', 'se espera «Autor u obra · Edición o ubicación»')
      }
      if (typeof frase.fuenteClave !== 'string' || frase.fuenteClave.trim() === '') {
        avisar(id, 'cita-sin-fuente')
      }
    }

    const voz = [frase.tipo === 'cita' ? '' : texto, frase.atribucion ?? ''].filter(Boolean)
    for (const cadena of voz) {
      for (const [patron, regla] of LEXICO_PROHIBIDO) {
        if (patron.test(cadena)) avisar(id, 'lexico', regla)
      }
    }

    if (frase.tipo === 'original') {
      const audiencias = frase.audiencias ?? []
      if (audiencias.some((a) => a === 'universal' || a === 'secular')) {
        MARCAS_RELIGIOSAS.filter((m) => m.test(texto)).forEach((m) =>
          avisar(id, 'referencia-en-neutral', String(m)),
        )
      }
      if (audiencias.includes('espiritual_general')) {
        marcasDeTradiciones()
          .filter((m) => m.test(texto))
          .forEach((m) => avisar(id, 'tradicion-en-espiritual-general', String(m)))
      }
      for (const tradicion of Object.keys(MARCAS_POR_TRADICION)) {
        if (!audiencias.includes(tradicion)) continue
        marcasDeTradiciones(tradicion)
          .filter((m) => m.test(texto))
          .forEach((m) => avisar(id, 'otra-tradicion', String(m)))
      }
    }
  }
  return problemas
}

/** Duplicados exactos y casi duplicados, después de normalizar. */
export function problemasDeDuplicados(catalogo) {
  const problemas = []
  const vistos = new Map()
  const conPalabras = catalogo.map((frase) => ({ frase, palabras: palabrasDe(frase.texto) }))

  for (const { frase } of conPalabras) {
    const clave = normalizarTexto(frase.texto)
    if (vistos.has(clave)) {
      problemas.push({ id: frase.id, regla: 'duplicado', detalle: vistos.get(clave) })
    } else {
      vistos.set(clave, frase.id)
    }
  }

  for (let i = 0; i < conPalabras.length; i += 1) {
    for (let j = i + 1; j < conPalabras.length; j += 1) {
      const a = conPalabras[i]
      const b = conPalabras[j]
      if (a.palabras.size < 3 || b.palabras.size < 3) continue
      const p = parecido(a.palabras, b.palabras)
      if (
        p >= UMBRAL_CASI_DUPLICADO &&
        normalizarTexto(a.frase.texto) !== normalizarTexto(b.frase.texto)
      ) {
        problemas.push({
          id: b.frase.id,
          regla: 'casi-duplicado',
          detalle: `${a.frase.id} (${Math.round(p * 100)} %)`,
        })
      }
    }
  }
  return problemas
}

// ─── Fuentes ──────────────────────────────────────────────────────────────────

/**
 * El expediente de una clave dentro de `docs/frases-v2-fuentes.md`: la sección
 * que empieza en su encabezado `### <clave>` y termina en el siguiente.
 */
export function expedienteDe(clave, documento) {
  const lineas = String(documento ?? '').split('\n')
  const inicio = lineas.findIndex((l) => l.trim() === `### ${clave}`)
  if (inicio === -1) return null
  const fin = lineas.findIndex((l, i) => i > inicio && /^#{1,3} /.test(l))
  return lineas.slice(inicio + 1, fin === -1 ? undefined : fin).join('\n')
}

/** Los campos que todo expediente tiene que traer, aprobada o no. */
export const CAMPOS_DE_EXPEDIENTE = Object.freeze([
  'Autor u obra',
  'Ubicación',
  'Idioma original',
  'Edición de referencia',
  'Fuente consultada',
  'Derechos',
  'Texto verificado',
  'Aprobación editorial',
  'Aprobación jurídica',
])

function valorDe(campo, expediente) {
  const linea = expediente
    .split('\n')
    .find((l) => l.trim().toLowerCase().startsWith(`- **${campo.toLowerCase()}:**`))
  if (!linea) return null
  return linea.slice(linea.indexOf(':**') + 3).trim()
}

/**
 * Toda cita tiene expediente completo; toda cita **aprobada** tiene además las
 * dos firmas. Una firma es un nombre y una fecha, no «pendiente».
 */
export function problemasDeFuentes(catalogo, documento) {
  const problemas = []
  for (const frase of catalogo.filter((f) => f.tipo === 'cita')) {
    const expediente = expedienteDe(frase.fuenteClave, documento)
    if (!expediente) {
      problemas.push({ id: frase.id, regla: 'cita-sin-expediente', detalle: frase.fuenteClave })
      continue
    }
    for (const campo of CAMPOS_DE_EXPEDIENTE) {
      const valor = valorDe(campo, expediente)
      if (!valor) problemas.push({ id: frase.id, regla: 'expediente-incompleto', detalle: campo })
    }
    if (frase.estado === 'aprobada') {
      for (const firma of ['Aprobación editorial', 'Aprobación jurídica']) {
        const valor = valorDe(firma, expediente) ?? ''
        const firmada = valor && !/pendiente/i.test(valor) && /\d{4}-\d{2}-\d{2}/.test(valor)
        if (!firmada)
          problemas.push({ id: frase.id, regla: 'cita-aprobada-sin-firma', detalle: firma })
      }
    }
  }
  return problemas
}

// ─── Cobertura ────────────────────────────────────────────────────────────────

/**
 * Cuántas frases elegibles —aprobadas— ve cada perfil posible, en total y por tema, y qué
 * proporción son citas. `ok` dice si alcanza el mínimo; la proporción de citas
 * se informa pero no decide: es una meta editorial.
 */
export function coberturaPorPerfil(catalogo) {
  const aprobadas = catalogo.filter((f) => f.estado === 'aprobada')
  return perfilesPosibles().map((perfil) => {
    const elegibles = elegiblesPara(perfil.audiencias, aprobadas)
    const porTema = Object.fromEntries(
      TEMAS.map((tema) => [tema, elegibles.filter((f) => f.tema === tema).length]),
    )
    const citas = elegibles.filter((f) => f.tipo === 'cita').length
    return {
      clave: perfil.clave,
      total: elegibles.length,
      porTema,
      citas,
      proporcionCitas: elegibles.length ? citas / elegibles.length : 0,
      ok:
        elegibles.length >= MINIMO_POR_PERFIL &&
        TEMAS.every((tema) => porTema[tema] >= MINIMO_POR_TEMA),
    }
  })
}

export function problemasDeCobertura(catalogo) {
  return coberturaPorPerfil(catalogo)
    .filter((perfil) => !perfil.ok)
    .map((perfil) => ({
      id: perfil.clave,
      regla: 'cobertura',
      detalle: `${perfil.total} elegibles · ${JSON.stringify(perfil.porTema)}`,
    }))
}
