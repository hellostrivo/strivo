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
// Un campo del modelo canónico que esta spec **no** escribe, y no es un olvido:
//   · `dayState.mood` — el ánimo de cinco estados es una derivación de solo
//     lectura del estado de sueño y §5.4.1 prohíbe persistirla.
//
// Las victorias de la mañana y los logros de la noche se retiraron el 23 ago,
// y con ellos la colección `lumia/victories` y el campo `nightRitual.newWins`.
// Lo que se logró sin haberlo previsto se anota en el Journal (§5.8).

import { lumia, shared, strivoDateKey } from '@/lib/db'
import { copy, interpolate } from '@copy'
import { fraseDelDia } from '@/content/frases-del-dia'
import { animoDerivado, paraGuardar as suenoParaGuardar } from './estadoSueno.js'
import { hayAlgoEscrito } from './manana.js'
import { sumarDias } from './fechas.js'

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

/**
 * ¿Hay algo escrito en la mañana?
 *
 * La regla vive en `manana.js`, que es donde está el resto de lo que sabe leer
 * una mañana, e incluye los campos de la versión 1 —emociones a cultivar y gran
 * visión— porque un día que solo tenga eso sigue siendo un día con algo escrito.
 */
export function mananaEscrita(morning) {
  return hayAlgoEscrito(morning)
}

/**
 * ¿El día está cerrado? Se deduce de lo escrito.
 *
 * El modelo canónico no guarda un estado `cerrado` y no se inventa uno: §4.8 lo
 * describía en v3.1, §C5 no lo recoge. Que haya algo escrito por la noche es
 * evidencia suficiente, y no hay ninguna decisión que dependa de la diferencia.
 */
export function nocheEscrita(night) {
  if (!night) return false
  return (
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

  const [perfil, morning, night, animoBajo, recientes] = await Promise.all([
    shared.getProfile(uid),
    lumia.getMorningEntry(uid, fecha),
    lumia.getNightRitual(uid, fecha),
    animoBajoReciente(uid, fecha),
    lumia.listMorningEntries(uid),
  ])

  return {
    fecha,
    nombre: perfil?.name ?? null,
    genero: perfil?.gender ?? 'n',
    morning,
    night,
    // Las mañanas ya escritas. Solo sirven para dos cosas, las dos hechas de lo
    // que la propia persona escribió: las ideas de acción que ya eligió para
    // una intención y la rotación de la pausa opcional. Nada de esto sale de
    // `lumia/` ni se cruza con nada (RN-DB4-01).
    recientes,
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
 * Lo que resume el cierre: los agradecimientos del día.
 *
 * Hasta el 23 ago contaba también las victorias logradas y los logros no
 * planeados. Con esos dos bloques retirados, la gratitud es la única evidencia
 * propia que la noche recoge, y sigue siendo evidencia: el cierre nombra lo que
 * la persona escribió, no lo que dejó de escribir.
 */
export function recuentoDelDia(night) {
  return { gracias: night?.gratitude?.length ?? 0 }
}

/**
 * La frase de síntesis del cierre, construida con datos reales (§5.4).
 *
 * Con el día en blanco dice "Hoy solo viniste. También cuenta.", que es uno de
 * los mensajes más importantes del producto: cerrar sin haber escrito nada no
 * es un cierre fallido.
 */
export function sintesisDelDia(night) {
  const textos = copy.lumia.diario.noche.cierre
  const { gracias } = recuentoDelDia(night)

  if (gracias === 0) return textos.nada

  const enGracias =
    gracias === 1 ? textos.unaGracia : interpolate(textos.graciasTemplate, { m: gracias })
  return interpolate(textos.soloGraciasTemplate, { gracias: enGracias })
}
