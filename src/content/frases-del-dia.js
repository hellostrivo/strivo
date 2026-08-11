// src/content/frases-del-dia.js
// Repertorio de frases del día (§5.3, Bloque 1 · RN-HOY-02).
//
// Va en `content/` y no dentro del componente ni dentro de la spec: es material
// editorial, crece con el tiempo y se revisa aparte del código que lo pinta.
//
// **Tamaño del repertorio.** RN-HOY-02 pide que una frase no se repita en 365
// días y §5.3 fija el MVP en 120 propias. Fase 1 arranca con 60 bien escritas y
// el mecanismo entero montado; la biblioteca se amplía en SPEC_12. Mientras
// tenga 60, la no repetición está garantizada durante 60 días. `diasSinRepetir`
// lo dice en voz alta para que nadie tenga que contarlas a mano.
//
// **Ninguna frase lleva marca de género.** Están redactadas para que no haga
// falta el helper de §3.6.5: una frase distinta cada día en tres versiones sería
// mantener tres repertorios.
//
// Temas (§5.3): gratitud · calma · esfuerzo · identidad · aceptacion.

/** Temas con los que se etiqueta cada frase. */
export const TEMAS = Object.freeze(['gratitud', 'calma', 'esfuerzo', 'identidad', 'aceptacion'])

/**
 * Temas que se retiran cuando el ánimo reciente es bajo (§5.3, Bloque 1).
 * A alguien que lleva tres días agotado no se le abre el día pidiéndole
 * constancia: sería la app diciéndole que el problema es que no se esfuerza.
 */
export const TEMAS_DE_RENDIMIENTO = Object.freeze(['esfuerzo'])

export const FRASES = Object.freeze([
  { texto: 'Lo que reconoces, crece.', tema: 'gratitud' },
  { texto: 'No hay prisa. El día es largo.', tema: 'calma' },
  { texto: 'No eres lo que logras. Eres lo que repites.', tema: 'identidad' },
  { texto: 'Un día regular también es un día.', tema: 'aceptacion' },
  { texto: 'Empezar es la mitad.', tema: 'esfuerzo' },
  { texto: 'Hay algo de hoy que ya está bien.', tema: 'gratitud' },
  { texto: 'Respirar también es avanzar.', tema: 'calma' },
  { texto: 'Hoy también decides quién eres.', tema: 'identidad' },
  { texto: 'El cansancio no te quita nada de lo que eres.', tema: 'aceptacion' },
  { texto: 'Lo constante gana a lo intenso.', tema: 'esfuerzo' },
  { texto: 'Agradecer no cambia el día. Cambia los ojos.', tema: 'gratitud' },
  { texto: 'La calma no es ausencia de ruido. Es no seguirlo.', tema: 'calma' },
  { texto: 'Actúa una vez como quien quieres ser.', tema: 'identidad' },
  { texto: 'No todo tiene que resolverse hoy.', tema: 'aceptacion' },
  { texto: 'Un poco hoy vale más que mucho algún día.', tema: 'esfuerzo' },
  { texto: 'Lo pequeño también cuenta cuando lo nombras.', tema: 'gratitud' },
  { texto: 'Puedes ir despacio y llegar igual.', tema: 'calma' },
  { texto: 'Tus días te van escribiendo.', tema: 'identidad' },
  { texto: 'Lo que sientes no necesita permiso.', tema: 'aceptacion' },
  { texto: 'El día se construye por partes.', tema: 'esfuerzo' },
  { texto: 'Alguien, en algún momento, quiso esto que hoy tienes.', tema: 'gratitud' },
  { texto: 'Lo urgente casi nunca lo era.', tema: 'calma' },
  { texto: 'Lo que eliges hoy se parece a ti.', tema: 'identidad' },
  { texto: 'Hay días que solo se atraviesan, y basta.', tema: 'aceptacion' },
  { texto: 'Nadie ve los cimientos. Sostienen igual.', tema: 'esfuerzo' },
  { texto: 'Mira lo que ya llegó.', tema: 'gratitud' },
  { texto: 'Una cosa a la vez ya es suficiente método.', tema: 'calma' },
  { texto: 'Te reconoces en lo que sostienes.', tema: 'identidad' },
  { texto: 'Estar aquí ya es una respuesta.', tema: 'aceptacion' },
  { texto: 'Aparecer es la mayor parte del asunto.', tema: 'esfuerzo' },
  { texto: 'La abundancia empieza por notarla.', tema: 'gratitud' },
  { texto: 'El silencio no está vacío.', tema: 'calma' },
  { texto: 'No hace falta cambiar de vida para cambiar de rumbo.', tema: 'identidad' },
  { texto: 'Puedes soltar algo sin perderlo.', tema: 'aceptacion' },
  { texto: 'Lo difícil se hace pequeño cuando se parte.', tema: 'esfuerzo' },
  { texto: 'Nombrar lo bueno es una forma de quedárselo.', tema: 'gratitud' },
  { texto: 'Descansar es parte del trabajo.', tema: 'calma' },
  { texto: 'Quien quieres ser ya está en algunas de tus horas.', tema: 'identidad' },
  { texto: 'Lo que no salió hoy sigue siendo posible.', tema: 'aceptacion' },
  { texto: 'Sigues aquí, y eso es trabajo hecho.', tema: 'esfuerzo' },
  { texto: 'Casi todo lo que sostiene tu día es silencioso.', tema: 'gratitud' },
  { texto: 'Hoy puedes hacer menos y hacerlo mejor.', tema: 'calma' },
  { texto: 'El carácter es una suma de tardes normales.', tema: 'identidad' },
  { texto: 'Nadie tiene todos los días iguales.', tema: 'aceptacion' },
  { texto: 'Avanzar despacio también es avanzar.', tema: 'esfuerzo' },
  { texto: 'Tu cuerpo lleva todo el día trabajando por ti.', tema: 'gratitud' },
  { texto: 'La quietud tiene su propia inteligencia.', tema: 'calma' },
  { texto: 'Cada día es una prueba de que sigues siendo tú.', tema: 'identidad' },
  { texto: 'Hay valor en admitir que hoy pesa.', tema: 'aceptacion' },
  { texto: 'Lo que haces dos veces empieza a ser tuyo.', tema: 'esfuerzo' },
  { texto: 'Lo ordinario, mirado despacio, deja de serlo.', tema: 'gratitud' },
  { texto: 'Nada de lo importante se decide con prisa.', tema: 'calma' },
  { texto: 'Hoy cabe una versión tuya un poco más cercana.', tema: 'identidad' },
  { texto: 'Empezar de nuevo no borra lo anterior.', tema: 'aceptacion' },
  { texto: 'Se llega lejos repitiendo cosas cortas.', tema: 'esfuerzo' },
  { texto: 'Hoy hay algo aquí que dentro de un año echarás de menos.', tema: 'gratitud' },
  { texto: 'Estar presente ya es estar haciendo algo.', tema: 'calma' },
  { texto: 'Ser alguien nuevo empieza por un gesto de siempre hecho distinto.', tema: 'identidad' },
  { texto: 'Hoy solo tienes que llegar hasta la noche.', tema: 'aceptacion' },
  { texto: 'El esfuerzo de hoy se nota en semanas, no en horas.', tema: 'esfuerzo' },
])

/** Días que el repertorio actual aguanta sin repetir una frase (RN-HOY-02). */
export function diasSinRepetir(frases = FRASES) {
  return frases.length
}

/** Días transcurridos desde el 1 de enero de 1970, a partir de 'YYYY-MM-DD'. */
function diasDesdeEpoca(dateKey) {
  const [year, month, day] = String(dateKey ?? '').split('-').map(Number)
  if (!year || !month || !day) return 0
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000)
}

/**
 * La frase de un día concreto.
 *
 * Determinista: la misma fecha devuelve siempre la misma frase, en el
 * dispositivo y sin red (§5.2, "Persistencia"). No hay azar ni estado guardado
 * que pueda desincronizarse.
 *
 * @param {string} dateKey - 'YYYY-MM-DD'
 * @param {object} [opciones]
 * @param {boolean} [opciones.animoBajoReciente] - Retira los temas de
 *        rendimiento (§5.3, Bloque 1). Por defecto, false.
 * @returns {{texto: string, tema: string}}
 */
export function fraseDelDia(dateKey, { animoBajoReciente = false } = {}) {
  const repertorio = animoBajoReciente
    ? FRASES.filter((frase) => !TEMAS_DE_RENDIMIENTO.includes(frase.tema))
    : FRASES

  const indice = ((diasDesdeEpoca(dateKey) % repertorio.length) + repertorio.length) %
    repertorio.length
  return repertorio[indice]
}

export default FRASES
