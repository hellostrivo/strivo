// src/diario/diario.js
// El día: lo que la pantalla Hoy y las dos vistas del Diario leen y
// escriben (§5.2, §5.3, §5.4).
//
// RN-DB-10 — Aquí no hay un solo dato ajeno al diario. Ni hábitos, ni constancia, ni
// identidad. Lo único que se comparte con el otro espacio es `shared/profile`,
// que por definición es de los dos (RN-DB4-02).
//
// RN-02 — Todo se escribe en local al instante y la red va detrás. Sin
// conexión, escribir, marcar y cerrar el día funcionan igual.
//
// Un campo del modelo canónico que esta spec **no** escribe, y no es un olvido:
//   · `dayState.mood` — el ánimo de cinco estados es una derivación de solo
//     lectura de cómo se cerró el día y §5.4.1 prohíbe persistirla.
//
// Las victorias de la mañana y los logros de la noche se retiraron el 23 ago,
// y con ellos la colección `diario/victories` y el campo `nightRitual.newWins`.
// Lo que se logró sin haberlo previsto se anota en el Journal (§5.8).
//
// Ese mismo día la noche pasó a tres momentos y se fue con ella la **síntesis
// de cierre**, que contaba los agradecimientos ("Hoy encontraste 2 cosas que
// agradecer"). §10 de la actualización prohíbe los recuentos: el cierre dice
// una frase fija y, si acaso, devuelve una de las cosas que se reconocieron.

import { diario, shared, strivoDateKey } from '@/lib/db'
import { fraseDelDia } from '@/content/frases-del-dia'
import { hayAlgoEscrito } from './manana.js'
import { animoDeNoche, hayAlgoEscrito as hayAlgoDeNoche } from './noche.js'
import { sumarDias } from './fechas.js'
import { diasEditables, editable as sePuedeEscribir } from './ventanaEdicion.js'

/** Días hacia atrás que se miran para saber si el ánimo reciente es bajo. */
const DIAS_DE_ANIMO_RECIENTE = 3

/** Ánimos que retiran las frases de esfuerzo del repertorio (§5.3, B1). */
const ANIMOS_BAJOS = Object.freeze(['agotado', 'inquieto'])

/** La fecha a la que pertenece este momento, según el perfil (RN-DB-01). */
export async function fechaDeHoy(uid) {
  return strivoDateKey(await shared.getDiaTerminaA(uid))
}

/**
 * Los días que todavía se pueden escribir, del de hoy hacia atrás.
 *
 * La regla vive entera en `ventanaEdicion.js`; aquí solo se le dan los dos
 * datos que necesita, que son de esta persona: cuándo termina su día y cuál es
 * su día de hoy.
 */
export async function ventanaAbierta(uid) {
  const diaTerminaA = await shared.getDiaTerminaA(uid)
  return diasEditables(strivoDateKey(diaTerminaA), { diaTerminaA })
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

  const rituales = await Promise.all(fechas.map((dia) => diario.getNightRitual(uid, dia)))
  // `animoDeNoche` lee las dos versiones: la emoción de cierre de hoy y el
  // estado de sueño de las noches viejas. Una noche sin ánimo declarado no
  // cuenta ni a favor ni en contra.
  const animos = rituales.map(animoDeNoche).filter((animo) => animo !== null)

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
 * ¿Hay algo escrito en la noche?
 *
 * La regla vive en `noche.js`, que es donde está el resto de lo que sabe leer
 * una noche, e incluye los campos de la versión 1 —gratitud, aprendizaje y
 * estado de sueño— porque una noche que solo tenga eso sigue siendo una noche
 * con algo escrito.
 */
export function nocheEscrita(night) {
  return hayAlgoDeNoche(night)
}

/**
 * Todo lo que necesitan Hoy y las dos vistas, en una sola lectura.
 *
 * @returns {Promise<object>} estado del día.
 */
export async function cargarDia(uid, fechaPedida = null) {
  // `diaTerminaA` se lee una vez y sirve para tres cosas: elegir la fecha de
  // hoy, decidir si la que se pide todavía se puede escribir y saber qué días
  // ofrece la pantalla. Preguntarlo tres veces daría tres respuestas iguales y
  // una tercera ocasión de que discrepen.
  const diaTerminaA = await shared.getDiaTerminaA(uid)
  const hoy = strivoDateKey(diaTerminaA)
  const fecha = fechaPedida ?? hoy

  const [perfil, morning, night, animoBajo, recientes, noches] = await Promise.all([
    shared.getProfile(uid),
    diario.getMorningEntry(uid, fecha),
    diario.getNightRitual(uid, fecha),
    animoBajoReciente(uid, fecha),
    diario.listMorningEntries(uid),
    diario.listNightRituals(uid),
  ])

  return {
    fecha,
    // El día al que pertenece este momento, que no siempre es el que se está
    // mirando: desde el 3 de septiembre de 2026 se puede abrir un día anterior
    // sin salir de Hoy.
    hoy,
    diaTerminaA,
    // Se calcula al cargar y se vuelve a calcular al escribir (`useDiario`): la
    // ventana es continua y una app abierta toda la noche la cruza sola.
    editable: sePuedeEscribir(fecha, { diaTerminaA }),
    dias: diasEditables(hoy, { diaTerminaA }),
    nombre: perfil?.name ?? null,
    genero: perfil?.gender ?? 'n',
    morning,
    night,
    // Las mañanas ya escritas. Solo sirven para dos cosas, las dos hechas de lo
    // que la propia persona escribió: las ideas de acción que ya eligió para
    // una intención y la rotación de la pausa opcional. Nada de esto sale de
    // `diario/` ni se cruza con nada (RN-DB4-01).
    recientes,
    // Las noches ya escritas, y para una sola cosa: qué preguntas reflexivas
    // salieron, para no repetirlas (§5 y §6). No se lee ni una palabra de lo
    // que se escribió en ellas.
    noches,
    frase: fraseDelDia(fecha, { animoBajoReciente: animoBajo }),
  }
}

// ─── Escritura ────────────────────────────────────────────────────────────────
// Cada bloque guarda lo suyo con un merge parcial. Ninguna escritura depende de
// otra, así que una vista a medias nunca deja el día en un estado imposible.
//
// **La ventana de 72 horas no se comprueba aquí, y es a propósito.** Estas dos
// funciones son escritura de bajo nivel, como las de `lib/db/`: reciben la
// fecha ya decidida y la escriben. Quien decide si esa fecha se puede escribir
// es `useDiario`, que es el único camino por el que la app escribe un día y el
// que tiene el reloj delante en el momento del toque. Poner la comprobación en
// los dos sitios significaría dos respuestas a la misma pregunta.

export async function guardarManana(uid, fecha, patch) {
  await diario.saveMorningEntry(uid, fecha, patch)
  return diario.getMorningEntry(uid, fecha)
}

export async function guardarNoche(uid, fecha, patch) {
  await diario.saveNightRitual(uid, fecha, patch)
  return diario.getNightRitual(uid, fecha)
}

// El estado de sueño dejó de escribirse el 23 ago: "¿Cómo te vas a dormir?" la
// sustituyó "¿Cómo me siento al cerrar el día?", que es selección única y se
// guarda en `closingFeeling`. `guardarEstadoSueno` se fue con la pregunta.
