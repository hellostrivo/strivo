// src/breathing/lib/comparadorConfiguracion.js
// Si dos combinaciones son la misma (SPEC_15 §4.2).
//
// **Por qué existe habiendo ya `mismaConfiguracion` en `data/esquema.js`.** Son
// dos preguntas distintas y conviene que no se confundan:
//
//   · `mismaConfiguracion` (SPEC_13, RN-RE-DAT-04/05) decide si dos **recientes**
//     son la misma. Compara patrón, visual y sonido. Es una lista que escribe la
//     app sola, y su trabajo es no repetir la misma sesión dos veces seguidas.
//   · Esta, RN-RE-FAV-05, decide si una configuración **ya está guardada como
//     favorito**. Compara además la **duración**, porque un favorito guarda la
//     combinación completa y "4-7-8 diez minutos" y "4-7-8 tres minutos" son dos
//     cosas que alguien puede querer tener a la vez.
//
// Los volúmenes quedan fuera de la comparación a propósito: son un ajuste fino
// del momento —los audífonos, la hora, quién duerme al lado— y no una decisión
// que distinga una combinación de otra. Bloquear un guardado porque el volumen
// está al 55 % en vez de al 60 % sería incomprensible.

import { sonIguales } from '@lib/respiracion/motorRitmo'
import { ID_SILENCIO } from '../data/catalogoSonidos.js'

/** Los campos que definen una combinación, para poder nombrarlos en un sitio. */
export const CAMPOS_COMPARADOS = Object.freeze(['patron', 'visual', 'sonidoAmbienteId', 'duracion'])

function sonidoDe(config) {
  return config?.sonidoAmbienteId ?? ID_SILENCIO
}

function duracionIgual(a, b) {
  const uno = a?.duracion ?? {}
  const otro = b?.duracion ?? {}
  if (uno.modo !== otro.modo) return false
  // "Sin final" no lleva cifra: comparar su valor daría falsos negativos entre
  // dos sesiones abiertas que solo se distinguen por un número que no se usa.
  if (uno.modo === 'abierta') return true
  return Number(uno.valor) === Number(otro.valor)
}

/** RN-RE-FAV-05 — La comparación completa. */
export function mismaConfiguracionCompleta(a, b) {
  if (!a || !b) return false
  return (
    sonIguales(a.patron, b.patron) &&
    a.visual === b.visual &&
    sonidoDe(a) === sonidoDe(b) &&
    duracionIgual(a, b)
  )
}

/**
 * El favorito idéntico a esta configuración, o `null`.
 *
 * RN-RE-FAV-05 — Cuando hay uno, el botón de guardar se sustituye por una nota
 * que dice cuál es. Guardar la misma combinación con otro nombre deja una lista
 * en la que dos filas hacen lo mismo y nadie recuerda por qué.
 */
export function favoritoIdentico(configuracion, favoritos = []) {
  return favoritos.find((favorito) => mismaConfiguracionCompleta(favorito, configuracion)) ?? null
}

/**
 * RN-RE-FAV-11 — ¿Se tocó algo desde que se cargó el favorito?
 *
 * Aquí **sí** entran los volúmenes, y no es una contradicción con lo de arriba:
 * son dos preguntas distintas. "¿Es esto otra combinación?" no, un volumen no la
 * cambia. "¿He tocado algo que se perdería al salir?" sí, y quien movió el
 * volumen tiene derecho a que se lo ofrezcan guardar.
 */
export function hayCambios(configuracion, favorito) {
  if (!favorito) return false
  if (!mismaConfiguracionCompleta(configuracion, favorito)) return true
  return (
    Number(configuracion?.volumenAmbiente) !== Number(favorito.volumenAmbiente) ||
    Number(configuracion?.volumenGuia) !== Number(favorito.volumenGuia) ||
    Boolean(configuracion?.guiaSonoraActiva) !== Boolean(favorito.guiaSonoraActiva)
  )
}

/**
 * Los ocho campos que se aplican al cargar un favorito (RN-RE-FAV-09).
 *
 * Se listan aquí y no en el componente para que "toda su configuración" sea algo
 * comprobable y no una intención: si mañana se añade un ajuste, esta función es
 * el sitio donde se nota que falta.
 */
export function configuracionDe(favorito) {
  return {
    patron: { ...favorito.patron },
    patronBaseId: favorito.patronBaseId,
    visual: favorito.visual,
    sonidoAmbienteId: favorito.sonidoAmbienteId,
    volumenAmbiente: favorito.volumenAmbiente,
    guiaSonoraActiva: favorito.guiaSonoraActiva,
    volumenGuia: favorito.volumenGuia,
    duracion: { ...favorito.duracion },
  }
}
