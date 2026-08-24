// src/lumia/noche.js
// La noche, en tres momentos (actualización del 23 ago a §5.4).
//
// El recorrido pregunta, por este orden:
//
//   1. ¿Qué quiero reconocer de hoy?          (lista de 1 a 3, uno al abrir)
//   2. Una reflexión breve                    (`nocheReflexion.js`)
//   3. ¿Cómo me siento al cerrar el día?      (`nocheEmociones.js`)
//   +  Si quieres, deja algo aquí             (por la emoción, o a mano)
//   →  El cierre: "Tu día puede terminar aquí."
//   →  La pantalla de consulta: lo respondido, con las preguntas delante
//
// **La noche no evalúa el día.** No pide que nada haya salido bien —"reconocer"
// admite lo que costó y lo que se atravesó, que es justo lo que "agradecer" no
// admitía—, no exige una lección, no compara la mañana con la noche y no cuenta
// nada de lo escrito. Se fue con esta actualización la síntesis que decía "Hoy
// encontraste 2 cosas que agradecer": un recuento es un balance, y §10 los
// prohíbe expresamente.
//
// **Ninguna pregunta bloquea y todas se pueden dejar en blanco.** No hay
// "incompleto", no hay "te faltó" y no hay nada en rojo. Lo que no se contestó
// se anota en `skipped` para saber qué se preguntó, no para reprochárselo a
// nadie, y solo se anota lo que llegó a preguntarse.
//
// El indicador cuenta **momentos, no campos**. La descarga opcional no entra en
// la cuenta: no está todas las noches, y un total que cambia de una noche a
// otra deja de orientar. Es la misma decisión que la pausa de la mañana.

import { copy } from '@copy'
import { CIERRE, animoDeEmocion } from './nocheEmociones.js'
import { animoDerivado } from './estadoSueno.js'
import { preguntaGuardada } from './nocheReflexion.js'

export { marcaLocal } from './fechas.js'

/**
 * Versión del recorrido, guardada con cada noche.
 *
 * 1 — los cinco bloques de §5.4 (gratitud, aprendizaje, estado de sueño).
 * 2 — los tres momentos de esta actualización.
 *
 * Sirve para leer una noche vieja sabiendo qué se le preguntó: las de la
 * versión 1 no traen el campo y se reconocen por su ausencia.
 */
export const VERSION = 2

/** Ids estables de las preguntas. Es lo que se anota en `skipped` (§11). */
export const PREGUNTAS = Object.freeze({
  reconocimiento: 'reconocimiento',
  reflexion: 'reflexion',
  emocion: 'emocion',
  descarga: 'descarga',
})

/** Los momentos que se cuentan en el indicador. La descarga no es uno. */
export const MOMENTOS = Object.freeze(['reconocimiento', 'reflexion', 'emocion'])

/** §3, §4 y §8 — extensiones sugeridas. Ninguna es un error al alcanzarse. */
export const MAX_RECONOCIMIENTO_LINEA = 160
export const MAX_REFLEXION = 400
export const MAX_DESCARGA = 400

// ─── Lectura de una noche guardada ────────────────────────────────────────────

export function hayReconocimiento(entrada) {
  return (entrada?.recognized?.length ?? 0) > 0
}

export function hayReflexion(entrada) {
  return String(entrada?.reflection ?? '').trim() !== ''
}

export function hayEmocion(entrada) {
  return Boolean(entrada?.closingFeeling)
}

export function hayDescarga(entrada) {
  return String(entrada?.release ?? '').trim() !== ''
}

/** ¿Se cerró la noche? Lo dice la marca de cierre, no cuánto se escribió. */
export function estaCerrada(entrada) {
  return Boolean(entrada?.completedAt)
}

/** ¿Hay algo escrito? Incluye los campos de las noches de la versión 1. */
export function hayAlgoEscrito(entrada) {
  if (!entrada) return false
  return (
    hayReconocimiento(entrada) ||
    hayReflexion(entrada) ||
    hayEmocion(entrada) ||
    hayDescarga(entrada) ||
    // Versión 1: gratitud, aprendizaje y estado de sueño. Ya nadie los escribe,
    // pero las noches que los tienen siguen siendo noches con algo escrito.
    (entrada.gratitude?.length ?? 0) > 0 ||
    String(entrada.learning ?? '').trim() !== '' ||
    (entrada.sleepState?.length ?? 0) > 0
  )
}

/**
 * Qué quedó en blanco (§11, "campos omitidos").
 *
 * `conDescarga` dice si la tarjeta llegó a mostrarse: una pregunta que no se
 * hizo no es una pregunta omitida.
 */
export function camposOmitidos(entrada, { conDescarga = false } = {}) {
  const omitidos = []
  if (!hayReconocimiento(entrada)) omitidos.push(PREGUNTAS.reconocimiento)
  if (!hayReflexion(entrada)) omitidos.push(PREGUNTAS.reflexion)
  if (!hayEmocion(entrada)) omitidos.push(PREGUNTAS.emocion)
  if (conDescarga && !hayDescarga(entrada)) omitidos.push(PREGUNTAS.descarga)
  return omitidos
}

/** Cómo se lee la emoción de cierre de una noche guardada. */
export function etiquetaDeEmocion(entrada, genero) {
  return CIERRE.etiquetaDeRespuesta(entrada?.closingFeeling, entrada?.closingFeelingOther, genero)
}

/**
 * El ánimo de cinco estados de una noche, o `null` si no declaró ninguno.
 *
 * Lee las dos versiones: la emoción de cierre de esta actualización y, en las
 * noches viejas, el estado de sueño. Es una **vista** y no se persiste nunca
 * (§5.4.1): lo consumen el punto del calendario y el repertorio de frases.
 */
export function animoDeNoche(night) {
  if (hayEmocion(night)) return animoDeEmocion(night.closingFeeling)
  if ((night?.sleepState?.length ?? 0) > 0) return animoDerivado(night.sleepState)
  return null
}

// ─── Cierre (§10) ─────────────────────────────────────────────────────────────

/**
 * Lo que se muestra en el cierre, o `null`.
 *
 * §10 permite enseñar **uno** de los elementos reconocidos, no todos: la
 * pantalla final es un descanso, no un repaso. Se elige el primero porque es el
 * que se escribió primero, no porque sea el mejor — la app no ordena por
 * importancia lo que alguien nombró.
 */
export function algoQueReconoces(entrada) {
  const primero = (entrada?.recognized ?? [])
    .map((linea) => String(linea ?? '').trim())
    .find((linea) => linea !== '')
  return primero ?? null
}

// ─── La pantalla de consulta ──────────────────────────────────────────────────

/**
 * La noche ya escrita, en bloques de pregunta y respuesta.
 *
 * **Devuelve las preguntas, no etiquetas resumidas**, igual que la mañana: con
 * la pregunta delante, volver a leerlo es volver a lo que se preguntó, y la
 * pantalla se ve igual que las del recorrido.
 *
 * La reflexión trae **la pregunta que salió esa noche** —rota, así que sin
 * `reflectionId` no se sabría cuál se contestó— y la reconstruye con la
 * intención de esa misma mañana cuando fue la ligada a ella.
 *
 * **Lo que quedó en blanco no aparece.** Sin marcador de ausencia y sin "sin
 * responder": una noche a medias se lee entera, no incompleta.
 *
 * @returns {Array<{id: string, titulo: string, forma: 'chip'|'texto',
 *                   emoji: ?string, lineas: string[]}>}
 */
export function resumenDeNoche(entrada, morning, genero) {
  const textos = copy.lumia.diario.noche
  const bloques = []

  if (hayReconocimiento(entrada)) {
    bloques.push({
      id: PREGUNTAS.reconocimiento,
      titulo: textos.reconocimiento.titulo,
      forma: 'texto',
      emoji: null,
      lineas: entrada.recognized
        .map((linea) => String(linea ?? '').trim())
        .filter((linea) => linea !== ''),
    })
  }

  const pregunta = preguntaGuardada(entrada, morning, genero)
  if (pregunta && hayReflexion(entrada)) {
    bloques.push({
      id: PREGUNTAS.reflexion,
      titulo: pregunta.titulo,
      forma: 'texto',
      emoji: null,
      lineas: [String(entrada.reflection).trim()],
    })
  }

  const emocion = etiquetaDeEmocion(entrada, genero)
  if (emocion !== '') {
    bloques.push({
      id: PREGUNTAS.emocion,
      titulo: textos.emocion.titulo,
      forma: 'chip',
      emoji: CIERRE.emojiDe(entrada.closingFeeling),
      lineas: [emocion],
    })
  }

  if (hayDescarga(entrada)) {
    bloques.push({
      id: PREGUNTAS.descarga,
      titulo: textos.descarga.titulo,
      forma: 'texto',
      emoji: null,
      lineas: [String(entrada.release).trim()],
    })
  }

  return bloques
}
