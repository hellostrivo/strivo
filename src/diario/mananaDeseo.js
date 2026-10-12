// src/diario/mananaDeseo.js
// Qué buen deseo despide a la mañana (12 oct 2026).
//
// Al tocar "Comenzar mi día" se lee una frase de veinte —"Que tengas un día
// sereno."— y la que toca sigue tres reglas:
//
//   1. **Dentro de un mismo día no cambia.** Volver a abrir la mañana, cambiar
//      algo y cerrarla otra vez devuelve la misma frase: es la de ese día.
//   2. **Cada mañana cerrada en un día nuevo lleva la siguiente de la lista**,
//      en el orden del copy. Lo que avanza la rotación es haber cerrado una
//      mañana, no el calendario: quien pasa una semana sin abrir la app
//      retoma donde se quedó, no siete frases más allá.
//   3. **Ninguna se repite hasta haber pasado las veinte.**
//
// **Se guarda en la propia mañana** (`wishId`), como la pausa guarda su
// pregunta en `reflectionId`, y por el mismo motivo: la decisión se toma
// leyendo lo ya escrito, sin un contador aparte que pueda desincronizarse de
// la historia real. Y como viaja con la mañana, sube a la nube con ella: otro
// teléfono sigue la misma rotación.
//
// Lo que no hace, a propósito: no mira qué se escribió ni cómo empezó nadie el
// día (RN-06). La frase depende solo de cuál salió antes.

import { copy } from '@copy'

/** Las veinte, en su orden de rotación. */
export const DESEOS = Object.freeze(copy.diario.manana.cierre.deseos)

export const IDS = Object.freeze(DESEOS.map((deseo) => deseo.id))

export function deseoPorId(id) {
  return DESEOS.find((deseo) => deseo.id === id) ?? null
}

/**
 * Las otras mañanas que ya llevan frase, de la fecha más reciente hacia atrás.
 *
 * Se miran todas menos la de hoy, **también las posteriores**: con la ventana
 * de 72 horas se puede cerrar el martes después de haber cerrado el miércoles,
 * y si solo contaran las anteriores el martes recibiría la misma frase que el
 * miércoles.
 */
function otrasConDeseo(recientes, hoy) {
  return (Array.isArray(recientes) ? recientes : [])
    .filter((dia) => dia?.id && dia.id !== hoy && deseoPorId(dia.wishId))
    .sort((a, b) => String(b.id).localeCompare(String(a.id)))
}

/**
 * La frase de este día.
 *
 * Si la mañana ya trae la suya, es esa. Si no, la siguiente a la última que
 * salió, saltando cualquiera de las diecinueve más recientes: en el orden de
 * siempre es simplemente la siguiente, y en un orden revuelto —un día anterior
 * cerrado tarde— sigue sin repetir ninguna antes de tiempo.
 */
export function deseoDelDia(recientes, hoy, entradaDeHoy = null) {
  const yaElegido = deseoPorId(entradaDeHoy?.wishId)
  if (yaElegido) return yaElegido

  const otras = otrasConDeseo(recientes, hoy)
  if (otras.length === 0) return DESEOS[0]

  const usadas = otras.map((dia) => dia.wishId).slice(0, DESEOS.length - 1)
  const ultima = IDS.indexOf(otras[0].wishId)

  for (let salto = 1; salto <= DESEOS.length; salto += 1) {
    const candidata = DESEOS[(ultima + salto) % DESEOS.length]
    if (!usadas.includes(candidata.id)) return candidata
  }
  // No se llega: diecinueve usadas siempre dejan libre al menos una de veinte.
  return DESEOS[(ultima + 1) % DESEOS.length]
}
