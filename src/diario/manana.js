// src/diario/manana.js
// La mañana, en tres momentos (actualización del 23 ago a §5.3).
//
// El recorrido pregunta, por este orden:
//
//   1. Cómo me siento esta mañana
//   2. Qué agradezco hoy
//   3. Cómo me gustaría sentirme · qué puedo hacer hoy   (dos preguntas)
//   +  Una pausa opcional, algunos días (`mananaPausa.js`)
//   →  La pantalla de consulta: lo respondido, con las preguntas delante
//
// **La intención va con la acción y no con el punto de partida**, y no es un
// detalle de maquetación: "¿Qué puedo hacer hoy para acercarme a *esa
// sensación*?" es un pronombre sin antecedente si la sensación se eligió dos
// pantallas atrás.
//
// **Ninguna pregunta bloquea y todas se pueden dejar en blanco.** No hay
// "incompleto", no hay "te faltó" y no hay nada que se ponga en rojo. Lo que no
// se contestó se anota en `skipped` para que la mañana sepa lo que no preguntó
// dos veces, no para reprochárselo a nadie.
//
// El indicador cuenta **momentos, no campos**: "1 de 3" dice dónde estás, no
// cuánto te falta por rellenar. La pausa opcional no entra en la cuenta, porque
// no está siempre y un total que cambia de un día para otro no orienta.
//
// Las preguntas principales **no cambian nunca de redacción** (§6). Lo único
// que se personaliza son las ideas de apoyo de la acción.

import { copy, interpolate } from '@copy'
import { ANIMO, INTENCION } from './mananaEmociones.js'
import { preguntaPorId } from './mananaPausa.js'

/**
 * Versión del recorrido, guardada con cada mañana.
 *
 * 1 — las tres preguntas de §5.3 (emociones a cultivar, gratitud, gran visión).
 * 2 — los tres momentos de esta actualización.
 *
 * Sirve para leer un día viejo sabiendo qué se le preguntó: las mañanas de la
 * versión 1 no traen el campo y se reconocen por su ausencia.
 */
export const VERSION = 2

/** Ids estables de las preguntas. Es lo que se anota en `skipped` (§9). */
export const PREGUNTAS = Object.freeze({
  animo: 'animo',
  intencion: 'intencion',
  gratitud: 'gratitud',
  accion: 'accion',
  pausa: 'pausa',
})

/** Los momentos que se cuentan en el indicador. La pausa no es uno de ellos. */
export const MOMENTOS = Object.freeze(['animo', 'gratitud', 'intencion-accion'])

/** §4 y §5 — extensiones sugeridas. Ninguna es un error al alcanzarse. */
export const MAX_GRATITUD_LINEA = 120
export const MAX_ACCION = 240
export const MAX_REFLEXION = 180

/**
 * Fecha y hora local, con su desfase horario (§9).
 *
 * Vive en `fechas.js` desde que la noche escribe la suya con la misma regla: es
 * formato de fecha, no algo de la mañana. Se reexporta para que quien ya la
 * importaba de aquí no tenga que enterarse.
 */
export { marcaLocal } from './fechas.js'

// ─── Lectura de una mañana guardada ──────────────────────────────────────────

/**
 * Las emociones del punto de partida de una mañana guardada, en el orden en que
 * se eligieron.
 *
 * **Lee las dos formas** (RN-DB-04). Desde el 30 de agosto de 2026 la pregunta
 * admite hasta tres y se guarda en `feelings`; las mañanas anteriores guardaron
 * un solo id en `feeling` y se siguen leyendo tal cual, sin migrarlas ni
 * reescribirlas. Nadie vuelve a escribir el campo en singular.
 */
export function animosDeManana(entrada) {
  if (Array.isArray(entrada?.feelings)) return entrada.feelings
  return entrada?.feeling ? [entrada.feeling] : []
}

/** Las intenciones de una mañana guardada. Lee las dos formas, como la de arriba. */
export function intencionesDeManana(entrada) {
  if (Array.isArray(entrada?.intentions)) return entrada.intentions
  return entrada?.intention ? [entrada.intention] : []
}

export function hayAnimo(entrada) {
  return animosDeManana(entrada).length > 0
}

export function hayIntencion(entrada) {
  return intencionesDeManana(entrada).length > 0
}

export function hayGratitud(entrada) {
  return (entrada?.gratitude?.length ?? 0) > 0
}

export function hayAccion(entrada) {
  return String(entrada?.action ?? '').trim() !== ''
}

export function hayReflexion(entrada) {
  return String(entrada?.reflection ?? '').trim() !== ''
}

/** ¿Se cerró la mañana? Lo dice la marca de cierre, no cuánto se escribió. */
export function estaCerrada(entrada) {
  return Boolean(entrada?.completedAt)
}

/** ¿Hay algo escrito? Incluye los campos de las mañanas de la versión 1. */
export function hayAlgoEscrito(entrada) {
  if (!entrada) return false
  return (
    hayAnimo(entrada) ||
    hayIntencion(entrada) ||
    hayGratitud(entrada) ||
    hayAccion(entrada) ||
    hayReflexion(entrada) ||
    // Versión 1: emociones a cultivar y gran visión. Ya nadie las escribe, pero
    // los días que las tienen siguen siendo días con algo escrito (§9).
    (entrada.emotions?.length ?? 0) > 0 ||
    String(entrada.granVision ?? '').trim() !== ''
  )
}

/**
 * Qué quedó en blanco (§9, "campos omitidos").
 *
 * `conPausa` dice si la pausa opcional llegó a mostrarse: una pregunta que no
 * se hizo no es una pregunta omitida.
 */
export function camposOmitidos(entrada, { conPausa = false } = {}) {
  const omitidos = []
  if (!hayAnimo(entrada)) omitidos.push(PREGUNTAS.animo)
  if (!hayIntencion(entrada)) omitidos.push(PREGUNTAS.intencion)
  if (!hayGratitud(entrada)) omitidos.push(PREGUNTAS.gratitud)
  if (!hayAccion(entrada)) omitidos.push(PREGUNTAS.accion)
  if (conPausa && !hayReflexion(entrada)) omitidos.push(PREGUNTAS.pausa)
  return omitidos
}

// ─── Cierre (§8) ──────────────────────────────────────────────────────────────

/**
 * Las dos líneas del cierre, o ninguna.
 *
 * Con la mañana entera en blanco devuelve `{ lineas: [] }` y quien lo pinta
 * dice "Tu día puede comenzar desde donde estás." No hay puntuación, no hay
 * porcentaje y no hay felicitación: cerrar sin haber escrito nada es un cierre
 * como cualquier otro.
 */
export function lineasDeCierre(entrada, genero) {
  const textos = copy.diario.manana.cierre
  const lineas = []

  // Con más de una intención se enumeran en la misma línea, con su conjunción
  // y sin numerarlas: son una sola respuesta dicha con tres palabras, no una
  // lista de tres cosas por hacer. Los dos separadores son copy (RN-VOZ-01).
  const intencion = enumerar(
    fichasDeIntencion(entrada, genero).map((ficha) => ficha.texto),
    textos,
  )
  if (intencion !== '') {
    lineas.push(interpolate(textos.intencionTemplate, { intencion }))
  }

  if (hayAccion(entrada)) {
    lineas.push(interpolate(textos.accionTemplate, { accion: String(entrada.action).trim() }))
  }

  return lineas
}

/**
 * Cómo se lee el punto de partida de una mañana guardada: una ficha por
 * emoción, `{ texto, emoji }`, en el orden en que se eligieron.
 *
 * El emoji es `null` en la palabra propia y no es un hueco que rellenar: §3
 * prohíbe asignarle uno.
 */
export function fichasDeAnimo(entrada, genero) {
  return ANIMO.fichasDeRespuesta(animosDeManana(entrada), entrada?.feelingOther, genero)
}

/** Cómo se lee la intención de una mañana guardada. Mismas fichas. */
export function fichasDeIntencion(entrada, genero) {
  return INTENCION.fichasDeRespuesta(intencionesDeManana(entrada), entrada?.intentionOther, genero)
}

/**
 * Varias respuestas en una sola frase: "en calma, con foco y con ligereza".
 *
 * Vive aquí porque la usan el cierre y cualquiera que necesite decirlas
 * seguidas; los dos separadores salen del copy, que es donde vive todo lo que
 * se lee.
 */
function enumerar(textosDeRespuesta, textosDeCierre) {
  const partes = textosDeRespuesta.filter((texto) => texto !== '')
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0]
  return (
    partes.slice(0, -1).join(textosDeCierre.listaSeparador) +
    textosDeCierre.listaUnion +
    partes[partes.length - 1]
  )
}

// ─── La pantalla de consulta ──────────────────────────────────────────────────

/**
 * La mañana ya escrita, en bloques de pregunta y respuesta.
 *
 * **Devuelve las preguntas, no etiquetas resumidas.** Una consulta que dijera
 * "Cómo empezaste · Cansada" sería un inventario con otro vocabulario; con la
 * pregunta delante, volver a leerlo es volver a lo que se preguntó. Es además lo
 * que hace que la pantalla se vea igual que las del recorrido, que es de donde
 * viene lo que muestra.
 *
 * **Las dos respuestas emocionales vuelven en `forma: 'chip'`, en `fichas`.**
 * Se eligieron tocando píldoras y se releen en píldoras —hasta tres, en el
 * orden en que se eligieron—: la respuesta se reconoce porque tiene el aspecto
 * que tenía al elegirla. El emoji de una ficha es `null` cuando la respuesta se
 * escribió a mano —§3 prohíbe asignarle uno—, y la píldora se pinta igual, solo
 * que con la palabra entre comillas.
 *
 * **Lo que quedó en blanco no aparece.** Sin marcador de ausencia, sin hueco
 * gris y sin "sin responder": una mañana a medias se lee entera, no incompleta.
 *
 * El orden es el del recorrido, y la pausa trae la pregunta que salió ese día
 * —son tres y rotan, así que sin `reflectionId` no se sabría cuál se contestó.
 *
 * @returns {Array<{id: string, titulo: string, forma: 'chip'|'texto',
 *                   fichas: Array<{texto: string, emoji: ?string}>,
 *                   lineas: string[]}>}
 */
export function resumenDeManana(entrada, genero) {
  const textos = copy.diario.manana
  const bloques = []

  const animo = fichasDeAnimo(entrada, genero)
  if (animo.length > 0) {
    bloques.push({
      id: PREGUNTAS.animo,
      titulo: textos.animo.titulo,
      forma: 'chip',
      fichas: animo,
      lineas: [],
    })
  }

  const gracias = (entrada?.gratitude ?? [])
    .map((linea) => String(linea ?? '').trim())
    .filter((linea) => linea !== '')
  if (gracias.length > 0) {
    bloques.push({
      id: PREGUNTAS.gratitud,
      titulo: textos.gratitud.titulo,
      forma: 'texto',
      fichas: [],
      lineas: gracias,
    })
  }

  const intencion = fichasDeIntencion(entrada, genero)
  if (intencion.length > 0) {
    bloques.push({
      id: PREGUNTAS.intencion,
      titulo: textos.intencion.titulo,
      forma: 'chip',
      fichas: intencion,
      lineas: [],
    })
  }

  if (hayAccion(entrada)) {
    bloques.push({
      id: PREGUNTAS.accion,
      titulo: textos.accion.titulo,
      forma: 'texto',
      fichas: [],
      lineas: [String(entrada.action).trim()],
    })
  }

  const pregunta = preguntaPorId(entrada?.reflectionId)
  if (pregunta && hayReflexion(entrada)) {
    bloques.push({
      id: PREGUNTAS.pausa,
      titulo: pregunta.titulo,
      forma: 'texto',
      fichas: [],
      lineas: [String(entrada.reflection).trim()],
    })
  }

  return bloques
}
