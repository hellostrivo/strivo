// src/lumia/nocheReflexion.js
// La pregunta reflexiva del segundo momento de la noche (§4, §5 y §6 de la
// actualización del 23 ago).
//
// Es **una sola pregunta por noche**, nunca dos, y es lo único del recorrido
// que cambia de una noche a otra. La larga de antes —"¿Qué aprendí hoy de mí,
// de los demás o de la vida?"— dejaba de leerse a la tercera noche, que es lo
// que pasa con toda pregunta que llega siempre igual.
//
// Dos orígenes, y el segundo sustituye al primero cuando toca:
//
//   1. **Rotativa.** Cinco preguntas del banco, en orden. Ninguna se repite
//      hasta que hayan pasado las otras cuatro (§5). La primera noche de todas
//      sale "¿Qué me dejó el día de hoy?", que es la más ancha.
//   2. **Ligada a la mañana.** Nombra la intención que se eligió esa mañana y
//      pregunta qué se notó. Como mucho dos veces en siete días, nunca en
//      noches seguidas, y **nunca se pregunta si se cumplió** (§6).
//
// Lo que aquí no ocurre, y es la mitad del diseño:
//   · No se interpreta nada de lo escrito. La rotación mira ids, no texto.
//   · No se saca ningún fragmento de otra respuesta de la mañana (§6): de la
//     mañana entra la intención, y solo la intención.
//   · No se recuerda que alguien lleva días triste ni se le dice (§9). El
//     historial que se lee sirve para no repetir una pregunta, y para nada más.
//
// **La elección se congela al mostrarse.** `reflectionId` se escribe en cuanto
// la pregunta aparece, así que salir y volver la misma noche devuelve la misma
// pregunta (§5). Aparecer cuenta aunque no se conteste: si solo contáramos las
// respondidas, quien nunca responde vería siempre la misma.

import { copy, interpolate } from '@copy'
import { sumarDias } from './fechas.js'
// De la mañana entra **una** cosa: cómo se lee la intención que se eligió. §6
// lo pide expresamente y no abre la puerta a nada más.
import { ID_OTRA, INTENCION, recortarPropia } from './mananaEmociones.js'

const textos = copy.lumia.diario.noche.reflexion

/** Las cinco preguntas del banco, en su orden de rotación (§4). */
export const BANCO = Object.freeze(textos.banco)

export const IDS = Object.freeze(BANCO.map((pregunta) => pregunta.id))

/** El id de la pregunta ligada a la intención de la mañana. No está en BANCO. */
export const ID_MANANA = 'manana-intencion'

/** La de liberación. Convive con la descarga de §8 y por eso tiene nombre. */
export const ID_SOLTAR = 'soltar'

/** Los dos orígenes que se guardan en `reflectionSource` (§11). */
export const FUENTES = Object.freeze({ rotativa: 'rotativa', manana: 'manana' })

/** §5 — "No repetir la misma pregunta en las siguientes cuatro noches". */
export const NOCHES_SIN_REPETIR = 4

/** §6 — "como máximo dos veces por semana". */
export const MAXIMO_MANANA_EN_VENTANA = 2

/** Días de la ventana, contando el de hoy. */
export const DIAS_VENTANA = 7

export function preguntaPorId(id) {
  return BANCO.find((pregunta) => pregunta.id === id) ?? null
}

/**
 * La intención de la mañana, tal como entra en la pregunta de §6.
 *
 * Si se escribió a mano se inserta **exactamente el texto**, sin comillas y sin
 * reinterpretarlo: la frase ya lo enmarca, y adornarlo sería la app opinando
 * sobre una palabra que no es suya.
 */
export function intencionDeLaManana(morning, genero) {
  if (morning?.intention === ID_OTRA) return recortarPropia(morning.intentionOther).trim()
  return INTENCION.etiquetaDe(morning?.intention, genero)
}

/**
 * ¿La mañana de hoy puede prestar su intención?
 *
 * §6 pide las dos cosas: que el ritual de mañana se haya completado y que la
 * intención no se haya omitido. Una mañana a medias no presta nada.
 */
export function mananaOfreceIntencion(morning) {
  return Boolean(morning?.completedAt) && Boolean(morning?.intention)
}

/** Las noches ya escritas que traen pregunta, de la más reciente hacia atrás. */
function nochesPrevias(recientes, hoy) {
  return (Array.isArray(recientes) ? recientes : [])
    .filter((noche) => noche?.id && noche.id < hoy && noche.reflectionId)
    .sort((a, b) => String(b.id).localeCompare(String(a.id)))
}

/**
 * §6 — ¿Toca esta noche la pregunta ligada a la mañana?
 *
 * Dos topes, y los dos se leen de lo ya guardado: como mucho dos en siete días
 * y nunca dos noches seguidas. No hay contador aparte que pueda quedar
 * desincronizado con la historia real.
 */
export function debeVincularseConManana(recientes, hoy, morning) {
  if (!mananaOfreceIntencion(morning)) return false

  const previas = nochesPrevias(recientes, hoy).filter(
    (noche) => noche.reflectionSource === FUENTES.manana,
  )

  const ayer = sumarDias(hoy, -1)
  if (previas.some((noche) => noche.id === ayer)) return false

  const desde = sumarDias(hoy, -(DIAS_VENTANA - 1))
  return previas.filter((noche) => noche.id >= desde).length < MAXIMO_MANANA_EN_VENTANA
}

/**
 * §5 — Cuál toca del banco. La que lleve más tiempo sin salir.
 *
 * Se descartan las cuatro últimas usadas, así que con un banco de cinco queda
 * exactamente una candidata: la rotación es completa y predecible, no aleatoria.
 * Las noches que se llevó la pregunta de la mañana no consumen turno — esa
 * pregunta sustituye a la rotativa, no avanza por ella.
 */
export function siguienteDelBanco(recientes, hoy) {
  const usadas = nochesPrevias(recientes, hoy)
    .filter((noche) => noche.reflectionSource !== FUENTES.manana)
    .map((noche) => noche.reflectionId)
    .slice(0, NOCHES_SIN_REPETIR)

  return BANCO.find((pregunta) => !usadas.includes(pregunta.id)) ?? BANCO[0]
}

/** La pregunta de §6, ya redactada con la intención de esa mañana. */
function preguntaDeManana(morning, genero) {
  return {
    id: ID_MANANA,
    fuente: FUENTES.manana,
    titulo: interpolate(textos.manana.tituloTemplate, {
      emocion: intencionDeLaManana(morning, genero),
    }),
    lead: textos.manana.lead,
  }
}

/**
 * La pregunta de esta noche: `{ id, fuente, titulo, lead }`.
 *
 * Si la noche de hoy ya la trae guardada, se devuelve esa y no se vuelve a
 * decidir: la selección es estable para esa fecha local (§5). Sin eso, terminar
 * la mañana a media noche podría cambiar la pregunta debajo de quien la está
 * contestando.
 */
export function reflexionDeLaNoche(recientes, hoy, morning, genero, entradaDeHoy = null) {
  const guardada = preguntaGuardada(entradaDeHoy, morning, genero)
  if (guardada) return guardada

  if (debeVincularseConManana(recientes, hoy, morning)) return preguntaDeManana(morning, genero)

  const pregunta = siguienteDelBanco(recientes, hoy)
  return { ...pregunta, fuente: FUENTES.rotativa }
}

/**
 * La pregunta que salió una noche ya guardada, para releerla.
 *
 * La ligada a la mañana se reconstruye con la intención de **ese** día, que es
 * lo que la titula. Si esa mañana ya no tiene intención se devuelve `null`
 * antes que inventar una frase a medias: manda el dato, no lo que se esperaba.
 */
export function preguntaGuardada(night, morning, genero) {
  const id = night?.reflectionId
  if (!id) return null

  if (id === ID_MANANA || night.reflectionSource === FUENTES.manana) {
    if (intencionDeLaManana(morning, genero) === '') return null
    return preguntaDeManana(morning, genero)
  }

  const pregunta = preguntaPorId(id)
  return pregunta ? { ...pregunta, fuente: FUENTES.rotativa } : null
}

/**
 * §8 y criterio 9 — ¿Puede ofrecerse la tarjeta de descarga esta noche?
 *
 * No, si la reflexión de esta misma noche ya fue "¿Qué necesito soltar por
 * hoy?". Preguntar dos veces lo mismo en la misma sesión es lo que la regla
 * existe para evitar, y afecta igual a la tarjeta automática y al enlace
 * voluntario: si el enlace siguiera ahí, la pregunta seguiría estando dos veces.
 */
export function puedeOfrecerDescarga(night) {
  return night?.reflectionId !== ID_SOLTAR
}
