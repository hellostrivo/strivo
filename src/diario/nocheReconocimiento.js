// src/diario/nocheReconocimiento.js
// Qué pregunta abre la noche, según cómo se cerró el día (30 ago 2026).
//
// El primer momento de la noche preguntaba siempre "¿Qué quiero reconocer de
// hoy?". Sigue preguntando eso mismo cuando no sabe nada, pero cuando la
// persona ya dijo cómo cierra el día, la pregunta se dice en su tono: a quien
// llega cansado, triste o con demasiado encima **no se le pide que encuentre
// algo bueno**. Se le pregunta qué quiere reconocer, que admite haber
// atravesado el día y no exige nada más (RN-NOC-03, ahora en la redacción).
//
// **Tres grupos, y la regla de a cuál se cae es una lista cerrada** (RN-06). No
// se lee ni una palabra de lo que nadie escribió: se mira el id del catálogo de
// cierre y nada más. Un id que no esté en la lista —la palabra propia, un id de
// una versión anterior— cae en el neutro, porque colocar en una escala una
// palabra que alguien acaba de inventar es exactamente el diagnóstico que §9
// prohíbe.
//
// **Si hay una difícil entre varias, manda la difícil.** Hoy la noche guarda
// una sola emoción, así que la regla no llega a usarse; se escribe igual porque
// la mañana ya admite tres y la pregunta que hay que contestar antes de que la
// noche también las admita no es "¿qué hacemos?", sino "¿dónde está escrito?".
// Nunca se muestra una pregunta de gratitud sobre un día que alguien acaba de
// nombrar difícil.
//
// **La rotación no se guarda: se deriva de la fecha.** Y es a propósito. La
// pregunta tiene que poder cambiar en el momento en que alguien cambia su
// emoción de cierre —eso es lo que se pidió—, así que congelarla al mostrarse,
// como hace la reflexión de `nocheReflexion.js`, la dejaría clavada en el grupo
// equivocado. Derivarla de la fecha da las tres cosas a la vez: dentro de una
// misma noche no se mueve sola, de una noche a otra rota sin repetirse hasta
// haber pasado por todas las de su grupo, y al cambiar la emoción se actualiza
// en el mismo instante. Y no hace falta un campo nuevo en el modelo.
//
// **Lo escrito no se toca al cambiar la pregunta.** Aquí no se borra nada: este
// módulo devuelve texto, y las filas del reconocimiento viven en su propio
// estado. Cambiar de emoción de cierre cambia la pregunta y las ideas; lo que
// ya se escribió se queda donde estaba.

import { copy } from '@copy'
import { fechaDeClave } from './fechas.js'

const textos = copy.diario.noche.reconocimiento

/** Los tres tonos en que se puede hacer la pregunta. */
export const GRUPOS = Object.freeze({
  sereno: 'sereno',
  neutro: 'neutro',
  cuidado: 'cuidado',
})

/**
 * El grupo por defecto, y el de todo lo que no se puede clasificar con
 * certeza. La noche empieza por esta pregunta y la emoción se elige en el
 * tercer momento, así que **así es como se entra al recorrido**: sin saber
 * nada del día, se pregunta sin dar por hecho que fue bueno ni que fue malo.
 */
export const GRUPO_POR_DEFECTO = GRUPOS.neutro

/**
 * Qué grupo le toca a cada emoción de cierre. Lista cerrada y explícita
 * (RN-06): son los trece ids de `nocheEmociones.js`, ni uno más.
 *
 * Los cinco de `cuidado` son los cuatro que ya abren la tarjeta de descarga
 * —inquieto, frustrado, triste, abrumado— más `cansado`. El cansancio no pide
 * soltar nada, pero tampoco está para buscarle el lado bueno al día.
 */
const GRUPO_POR_EMOCION = Object.freeze({
  en_paz: GRUPOS.sereno,
  feliz: GRUPOS.sereno,
  tranquilo: GRUPOS.sereno,
  agradecido: GRUPOS.sereno,
  orgulloso: GRUPOS.sereno,
  aliviado: GRUPOS.sereno,
  pensativo: GRUPOS.neutro,
  neutral: GRUPOS.neutro,
  cansado: GRUPOS.cuidado,
  inquieto: GRUPOS.cuidado,
  frustrado: GRUPOS.cuidado,
  triste: GRUPOS.cuidado,
  abrumado: GRUPOS.cuidado,
})

/**
 * El grupo de una emoción suelta. Lo que no esté en la lista —la palabra
 * propia, un id retirado, nada— cae en el neutro.
 */
export function grupoDeEmocion(id) {
  return GRUPO_POR_EMOCION[id] ?? GRUPO_POR_DEFECTO
}

/**
 * El grupo de cómo se cerró el día. Admite una emoción o una lista.
 *
 * **Cualquier emoción difícil manda sobre las demás**, y una que no se pueda
 * clasificar baja el conjunto al neutro: entre decir de más y decir de menos
 * sobre el estado de alguien, este producto dice de menos. Solo se pregunta por
 * algo bueno cuando **todas** las elegidas son serenas.
 *
 * @param {?string|string[]} emocion
 * @returns {'sereno'|'neutro'|'cuidado'}
 */
export function grupoDeCierre(emocion) {
  const elegidas = (Array.isArray(emocion) ? emocion : [emocion]).filter(Boolean)
  if (elegidas.length === 0) return GRUPO_POR_DEFECTO

  const grupos = elegidas.map(grupoDeEmocion)
  if (grupos.includes(GRUPOS.cuidado)) return GRUPOS.cuidado
  if (grupos.every((grupo) => grupo === GRUPOS.sereno)) return GRUPOS.sereno
  return GRUPOS.neutro
}

/** Las preguntas de un grupo, en su orden de rotación. */
export function preguntasDe(grupo) {
  return textos.grupos[grupo]?.preguntas ?? textos.grupos[GRUPO_POR_DEFECTO].preguntas
}

/**
 * Cuál de ellas toca esa fecha.
 *
 * Los días desde el 1 de enero de 1970, en cuentas locales, módulo cuántas
 * preguntas tenga el grupo. Recorre la lista entera antes de repetir ninguna y
 * es la misma toda la noche, sin guardar nada. Sin fecha —o con una que no se
 * entiende— sale la primera, que es la más ancha de cada grupo.
 */
export function indiceDelDia(fecha, total) {
  if (total <= 0) return 0
  const dia = fechaDeClave(fecha)
  if (!dia) return 0
  const dias = Math.floor(dia.getTime() / 86400000)
  return ((dias % total) + total) % total
}

/**
 * La pregunta del reconocimiento de una noche: `{ grupo, titulo, lead,
 * sugerencias }`.
 *
 * La monta el recorrido con la emoción que hay en pantalla y la pantalla de
 * consulta con la que quedó guardada, así que releer una noche devuelve la
 * pregunta que se contestó y no una genérica (RN-MAN-21).
 *
 * @param {?string|string[]} emocion - La emoción de cierre, o nada aún.
 * @param {string} fecha - Clave de fecha del día, 'YYYY-MM-DD'.
 */
export function reconocimientoDeLaNoche(emocion, fecha) {
  const grupo = grupoDeCierre(emocion)
  const contenido = textos.grupos[grupo]
  const preguntas = contenido.preguntas

  return {
    grupo,
    titulo: preguntas[indiceDelDia(fecha, preguntas.length)],
    lead: contenido.lead,
    sugerencias: contenido.sugerencias,
  }
}
