// src/unaPausa/canal/leer.js
// La lectura del canal: **el único sitio que sabe leerlo** (SPEC_28.3 §4.2).
//
// Vive fuera de `modelo/` porque usa red y navegador; el modelo lo cargan
// scripts de Node y tiene que seguir siendo lógica pura. La forma del canal la
// decide `modelo/canal.js` —lo escribe el script del lunes y lo escribirá igual
// el servidor de Fase B—; aquí solo se comprueba que lo que llegó la tiene.
//
// **Nunca lanza.** Devuelve `{ ok: true, canal }` o `{ ok: false, motivo }`, y
// el motivo es un código, nunca una frase: quien decide qué se le dice a la
// persona es la sección, y con un fallo de red no se le dice nada si hay caché
// (RN-EST-05). Un error aquí no puede sacar a nadie de Hoy, ni de ningún sitio.
//
// **Un 200 no basta.** En el sitio de la app, una ruta que no existe bajo
// `/una-pausa/` devuelve `index.html` con 200 —la regla de la SPA—, así que el
// tipo de la respuesta se comprueba antes de parsear (adenda de 28.2, §7).

import { URL_CANAL } from '../modelo/capsula.js'
import { FORMATO_CANAL } from '../modelo/canal.js'

/** Lo que se espera al canal antes de darlo por perdido. */
export const ESPERA_MS = 10_000

/** Lo que puede devolver una lectura fallida. */
export const MOTIVOS = Object.freeze(['red', 'estado', 'tipo', 'json', 'formato', 'espera'])

const fallo = (motivo) => ({ ok: false, motivo })

const esObjeto = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Contra qué se resuelve una URL relativa: la página, si hay página. */
function paginaActual() {
  return typeof window === 'undefined' ? undefined : window.location?.href
}

/**
 * La URL del canal (DP-28.16): la de la variable de build si la hay —en los
 * deploys de rama vale `/una-pausa/feed.json`—, la de producción si no. Una URL
 * relativa se resuelve contra la página.
 *
 * @param {{ env?: object, pagina?: string }} [opciones] Para las pruebas.
 */
export function urlDelCanal({ env = import.meta.env, pagina = paginaActual() } = {}) {
  const url = env?.VITE_URL_CANAL || URL_CANAL
  try {
    return new URL(url, pagina).href
  } catch {
    return url
  }
}

/**
 * ¿Tiene esto la forma del canal? `formato` el de hoy, `vigente` objeto o
 * `null`, `archivo` una lista de objetos. Lo usa también la caché: lo que no
 * pase aquí no pisa nunca un canal bueno.
 */
export function esCanal(canal) {
  return (
    esObjeto(canal) &&
    canal.formato === FORMATO_CANAL &&
    (canal.vigente === null || esObjeto(canal.vigente)) &&
    Array.isArray(canal.archivo) &&
    canal.archivo.every(esObjeto)
  )
}

/**
 * La portada se resuelve **contra la URL del canal**, no contra la página: en
 * producción el canal vive en otro origen. Una que no se pueda resolver no se
 * nombra, igual que el canal no nombra una que no copió.
 */
function conPortadaResuelta(entrada, url) {
  if (typeof entrada.portada?.src !== 'string') return entrada
  try {
    return {
      ...entrada,
      portada: { ...entrada.portada, src: new URL(entrada.portada.src, url).href },
    }
  } catch {
    const { portada: _fuera, ...resto } = entrada
    return resto
  }
}

const esTipo = (respuesta, prefijo) =>
  String(respuesta.headers?.get?.('content-type') ?? '')
    .trim()
    .toLowerCase()
    .startsWith(prefijo)

/** Pide algo con un tope de espera. Nunca lanza: lo que no llega es `espera`. */
async function conTope(espera, trabajo) {
  const control = typeof AbortController === 'function' ? new AbortController() : null
  let temporizador
  const tope = new Promise((resolve) => {
    temporizador = setTimeout(() => {
      control?.abort()
      resolve(fallo('espera'))
    }, espera)
  })
  try {
    return await Promise.race([trabajo(control?.signal).catch(() => fallo('red')), tope])
  } finally {
    clearTimeout(temporizador)
  }
}

/**
 * Lee el canal.
 *
 * La petición no lleva credenciales ni referente: el canal es el mismo para
 * todos y la app no envía nada al leerlo.
 *
 * @param {{ fetch?: Function, url?: string, espera?: number }} [opciones]
 * @returns {Promise<{ok: true, canal: object} | {ok: false, motivo: string}>}
 */
export async function leerCanal({ fetch: traer, url, espera = ESPERA_MS } = {}) {
  const pedir = traer ?? globalThis.fetch
  const destino = url ?? urlDelCanal()
  return conTope(espera, async (signal) => {
    let respuesta
    try {
      respuesta = await pedir(destino, {
        signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
    } catch {
      return fallo('red')
    }
    if (!respuesta?.ok) return fallo('estado')
    if (!esTipo(respuesta, 'application/json')) return fallo('tipo')

    let texto
    try {
      texto = await respuesta.text()
    } catch {
      return fallo('red')
    }
    let canal
    try {
      canal = JSON.parse(texto)
    } catch {
      return fallo('json')
    }
    if (!esCanal(canal)) return fallo('formato')

    return {
      ok: true,
      canal: {
        ...canal,
        vigente: canal.vigente === null ? null : conPortadaResuelta(canal.vigente, destino),
        archivo: canal.archivo.map((e) => conPortadaResuelta(e, destino)),
      },
    }
  })
}

/**
 * Trae la portada de la vigente para guardarla, como blob. Con lo mismo que el
 * canal —sin credenciales, con tope— y sin decir nada si falla: sin portada
 * guardada, la sección sin conexión se lee igual, solo sin foto.
 *
 * @returns {Promise<Blob|null>}
 */
export async function traerPortada(src, { fetch: traer, espera = ESPERA_MS } = {}) {
  const pedir = traer ?? globalThis.fetch
  const resultado = await conTope(espera, async (signal) => {
    const respuesta = await pedir(src, {
      signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    })
    if (!respuesta?.ok || !esTipo(respuesta, 'image/')) return fallo('estado')
    return { ok: true, blob: await respuesta.blob() }
  })
  return resultado.ok ? resultado.blob : null
}
