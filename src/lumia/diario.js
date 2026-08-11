// src/lumia/diario.js
// El día de Lumia: lo que la pantalla Hoy y las dos vistas del Diario leen y
// escriben (§5.2, §5.3, §5.4).
//
// RN-DB4-01 — Aquí no hay un solo dato de Formia. Ni hábitos, ni constancia, ni
// identidad. Lo único que se comparte con el otro espacio es `shared/profile`,
// que por definición es de los dos (RN-DB4-02).
//
// RN-02 — Todo se escribe en local al instante y la red va detrás. Sin
// conexión, escribir, marcar y cerrar el día funcionan igual.
//
// Dos campos del modelo canónico que esta spec **no** escribe, y no es un
// olvido:
//   · `nightRitual.inheritedWins` — las victorias heredadas ya son registros
//     propios con su estado. Copiar aquí sus ids o sus estados daría dos
//     respuestas a la misma pregunta.
//   · `dayState.mood` — el ánimo de cinco estados es una derivación de solo
//     lectura del estado de sueño y §5.4.1 prohíbe persistirla.

import { lumia, shared, strivoDateKey } from '@/lib/db'
import { copy, interpolate } from '@copy'
import { fraseDelDia } from '@/content/frases-del-dia'
import { animoDerivado, paraGuardar as suenoParaGuardar } from './estadoSueno.js'
import { sumarDias } from './fechas.js'
import { cargar as cargarVictorias, contarLogradas } from './victorias.js'

/** Días hacia atrás que se miran para saber si el ánimo reciente es bajo. */
const DIAS_DE_ANIMO_RECIENTE = 3

/** Ánimos que retiran las frases de esfuerzo del repertorio (§5.3, B1). */
const ANIMOS_BAJOS = Object.freeze(['agotado', 'inquieto'])

/** La fecha a la que pertenece este momento, según el perfil (RN-DB-01). */
export async function fechaDeHoy(uid) {
  return strivoDateKey(await shared.getDiaTerminaA(uid))
}

/**
 * ¿El ánimo de los últimos días es bajo? Solo sirve para retirar las frases de
 * esfuerzo: no se muestra, no se guarda y nunca se le dice a nadie.
 */
export async function animoBajoReciente(uid, fecha) {
  const fechas = []
  for (let i = 1; i <= DIAS_DE_ANIMO_RECIENTE; i += 1) {
    fechas.push(sumarDias(fecha, -i))
  }

  const rituales = await Promise.all(fechas.map((dia) => lumia.getNightRitual(uid, dia)))
  const animos = rituales
    .filter((ritual) => ritual?.sleepState?.length > 0)
    .map((ritual) => animoDerivado(ritual.sleepState))

  if (animos.length === 0) return false
  return animos.every((animo) => ANIMOS_BAJOS.includes(animo))
}

/** ¿Hay algo escrito en la mañana? Decide el copy de la tarjeta de Hoy. */
export function mananaEscrita(morning) {
  if (!morning) return false
  return (
    (morning.gratitude?.length ?? 0) > 0 ||
    (morning.emotions?.length ?? 0) > 0 ||
    String(morning.granVision ?? '').trim() !== ''
  )
}

/**
 * ¿El día está cerrado? Se deduce de lo escrito.
 *
 * El modelo canónico no guarda un estado `cerrado` y no se inventa uno: §4.8 lo
 * describía en v3.1, §C5 no lo recoge. Que haya algo escrito por la noche es
 * evidencia suficiente, y no hay ninguna decisión que dependa de la diferencia.
 */
export function nocheEscrita(night, victorias) {
  if (contarLogradas(victorias) > 0) return true
  if (!night) return false
  return (
    (night.newWins?.length ?? 0) > 0 ||
    (night.gratitude?.length ?? 0) > 0 ||
    (night.sleepState?.length ?? 0) > 0 ||
    String(night.learning ?? '').trim() !== ''
  )
}

/**
 * Todo lo que necesitan Hoy y las dos vistas, en una sola lectura.
 *
 * @returns {Promise<object>} estado del día.
 */
export async function cargarDia(uid, fechaPedida = null) {
  const fecha = fechaPedida ?? (await fechaDeHoy(uid))

  const [perfil, morning, night, victorias, animoBajo] = await Promise.all([
    shared.getProfile(uid),
    lumia.getMorningEntry(uid, fecha),
    lumia.getNightRitual(uid, fecha),
    cargarVictorias(uid, fecha),
    animoBajoReciente(uid, fecha),
  ])

  return {
    fecha,
    nombre: perfil?.name ?? null,
    genero: perfil?.gender ?? 'n',
    morning,
    night,
    victorias,
    frase: fraseDelDia(fecha, { animoBajoReciente: animoBajo }),
  }
}

// ─── Escritura ────────────────────────────────────────────────────────────────
// Cada bloque guarda lo suyo con un merge parcial. Ninguna escritura depende de
// otra, así que una vista a medias nunca deja el día en un estado imposible.

export async function guardarManana(uid, fecha, patch) {
  await lumia.saveMorningEntry(uid, fecha, patch)
  return lumia.getMorningEntry(uid, fecha)
}

export async function guardarNoche(uid, fecha, patch) {
  await lumia.saveNightRitual(uid, fecha, patch)
  return lumia.getNightRitual(uid, fecha)
}

/** El estado de sueño se limpia antes de guardarse (§5.4.1, "Algo más"). */
export async function guardarEstadoSueno(uid, fecha, seleccion, otro) {
  return guardarNoche(uid, fecha, suenoParaGuardar(seleccion, otro))
}

// ─── Síntesis de cierre (§5.4) ────────────────────────────────────────────────

/**
 * Los dos números que resume el cierre: logros reconocidos y agradecimientos.
 * Cuenta las victorias logradas más los logros que no estaban planeados.
 */
export function recuentoDelDia(night, victorias) {
  return {
    logros: contarLogradas(victorias) + (night?.newWins?.length ?? 0),
    gracias: night?.gratitude?.length ?? 0,
  }
}

/**
 * La frase de síntesis del cierre, construida con datos reales (§5.4).
 *
 * Con el día en blanco dice "Hoy solo viniste. También cuenta.", que es uno de
 * los mensajes más importantes del producto: cerrar sin haber escrito nada no
 * es un cierre fallido.
 */
export function sintesisDelDia(night, victorias) {
  const textos = copy.lumia.diario.noche.cierre
  const { logros, gracias } = recuentoDelDia(night, victorias)

  const enLogros = logros === 1 ? textos.unLogro : interpolate(textos.logrosTemplate, { n: logros })
  const enGracias =
    gracias === 1 ? textos.unaGracia : interpolate(textos.graciasTemplate, { m: gracias })

  if (logros > 0 && gracias > 0) {
    return interpolate(textos.ambosTemplate, { logros: enLogros, gracias: enGracias })
  }
  if (gracias > 0) return interpolate(textos.soloGraciasTemplate, { gracias: enGracias })
  if (logros > 0) return interpolate(textos.soloLogrosTemplate, { logros: enLogros })
  return textos.nada
}
