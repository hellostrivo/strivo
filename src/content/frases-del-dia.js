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

  // ─── Ampliación de SPEC_12: de 60 a 120 ─────────────────────────────────────
  // El mecanismo ya estaba entero desde SPEC_06; esto es repertorio. Con 120,
  // `diasSinRepetir()` sube a 120 días y RN-HOY-02 (365 sin repetir) se cumple
  // hasta donde llega, que es el doble que antes.
  //
  // **Pendientes de revisión editorial.** Pasan §3.6 con prueba automática, pero
  // qué se le dice a alguien cada mañana es criterio de producto.
  { texto: 'Lo que agradeces se queda más tiempo.', tema: 'gratitud' },
  { texto: 'La calma se entrena como todo lo demás.', tema: 'calma' },
  { texto: 'Eres el único que estuvo en todos tus días.', tema: 'identidad' },
  { texto: 'Hoy no tiene que parecerse a ayer.', tema: 'aceptacion' },
  { texto: 'Lo pequeño repetido termina siendo grande.', tema: 'esfuerzo' },
  { texto: 'Alguien te sostiene sin que lo notes.', tema: 'gratitud' },
  { texto: 'Bajar el ritmo también es una decisión.', tema: 'calma' },
  { texto: 'Tus manías también te construyen.', tema: 'identidad' },
  { texto: 'No todo lo que pesa hay que cargarlo hoy.', tema: 'aceptacion' },
  { texto: 'Lo que empiezas hoy ya cuenta como empezado.', tema: 'esfuerzo' },
  { texto: 'Mirar lo que hay es más raro de lo que parece.', tema: 'gratitud' },
  { texto: 'El apuro casi nunca mejora el resultado.', tema: 'calma' },
  { texto: 'Nadie más lleva tu manera de hacer las cosas.', tema: 'identidad' },
  { texto: 'Un día torcido no tuerce una vida.', tema: 'aceptacion' },
  { texto: 'La disciplina también se toma descansos.', tema: 'esfuerzo' },
  { texto: 'Hoy alguien contará contigo para algo.', tema: 'gratitud' },
  { texto: 'El ruido pasa. Tú sigues.', tema: 'calma' },
  { texto: 'Lo que defiendes dice más que lo que dices.', tema: 'identidad' },
  { texto: 'Está bien no tener respuesta todavía.', tema: 'aceptacion' },
  { texto: 'Media hora bien puesta rinde más que un día disperso.', tema: 'esfuerzo' },
  { texto: 'Casi todo lo bueno de hoy ya estaba antes de que llegaras.', tema: 'gratitud' },
  { texto: 'Respirar hondo cambia más de lo que parece.', tema: 'calma' },
  { texto: 'Ser el mismo en privado es la parte difícil.', tema: 'identidad' },
  { texto: 'Puedes estar en proceso y estar bien.', tema: 'aceptacion' },
  { texto: 'Lo que se hace sin ganas también cuenta.', tema: 'esfuerzo' },
  { texto: 'Hay gente que te desea cosas buenas hoy.', tema: 'gratitud' },
  { texto: 'No hace falta llenar todos los huecos del día.', tema: 'calma' },
  { texto: 'Tus decisiones pequeñas te van dibujando.', tema: 'identidad' },
  { texto: 'Lo imperfecto también sirve.', tema: 'aceptacion' },
  { texto: 'Terminar algo pequeño despeja la cabeza.', tema: 'esfuerzo' },
  { texto: 'Tienes más de lo que recuerdas al levantarte.', tema: 'gratitud' },
  { texto: 'La quietud no es tiempo perdido.', tema: 'calma' },
  { texto: 'Nadie te va a parecer más tú que tú.', tema: 'identidad' },
  { texto: 'Hoy también sirve el día que apenas alcanza.', tema: 'aceptacion' },
  { texto: 'Lo que cuesta al principio deja de costar.', tema: 'esfuerzo' },
  { texto: 'Alguien hizo algo por ti sin contártelo.', tema: 'gratitud' },
  { texto: 'Ir despacio no es ir perdiendo.', tema: 'calma' },
  { texto: 'Te pareces a lo que haces cuando nadie mira.', tema: 'identidad' },
  { texto: 'Aceptar un día flojo lo hace más corto.', tema: 'aceptacion' },
  { texto: 'Nadie construye nada de una sentada.', tema: 'esfuerzo' },
  { texto: 'Lo de siempre también se puede agradecer.', tema: 'gratitud' },
  { texto: 'Puedes parar antes de estar agotado.', tema: 'calma' },
  { texto: 'Lo que perdonas también te define.', tema: 'identidad' },
  { texto: 'No hay que estar en paz con todo a la vez.', tema: 'aceptacion' },
  { texto: 'Volver después de parar es la parte que cuenta.', tema: 'esfuerzo' },
  { texto: 'Hoy hay cosas funcionando sin que las mires.', tema: 'gratitud' },
  { texto: 'El silencio de la mañana también es tuyo.', tema: 'calma' },
  { texto: 'Cambiar de opinión es señal de que piensas.', tema: 'identidad' },
  { texto: 'Un día raro sigue siendo un día vivido.', tema: 'aceptacion' },
  { texto: 'Lo constante no se nota hasta que se acumula.', tema: 'esfuerzo' },
  { texto: 'Alguien te dio tiempo esta semana.', tema: 'gratitud' },
  { texto: 'No todo lo que se puede hacer hoy hay que hacerlo.', tema: 'calma' },
  { texto: 'Lo que te importa se nota en dónde pones las horas.', tema: 'identidad' },
  { texto: 'Puedes empezar otra vez las veces que haga falta.', tema: 'aceptacion' },
  { texto: 'Lo difícil se vuelve normal antes de lo que crees.', tema: 'esfuerzo' },
  { texto: 'Hoy alguien te agradecería algo que ni recuerdas.', tema: 'gratitud' },
  { texto: 'La prisa se te pega de fuera. Se puede soltar.', tema: 'calma' },
  { texto: 'No eres tu peor día ni tu mejor tarde.', tema: 'identidad' },
  { texto: 'Estar cansado no significa estar fallando.', tema: 'aceptacion' },
  { texto: 'Un paso corto sigue siendo un paso.', tema: 'esfuerzo' },
])

/** Días que el repertorio actual aguanta sin repetir una frase (RN-HOY-02). */
export function diasSinRepetir(frases = FRASES) {
  return frases.length
}

/** Días transcurridos desde el 1 de enero de 1970, a partir de 'YYYY-MM-DD'. */
function diasDesdeEpoca(dateKey) {
  const [year, month, day] = String(dateKey ?? '')
    .split('-')
    .map(Number)
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

  const indice =
    ((diasDesdeEpoca(dateKey) % repertorio.length) + repertorio.length) % repertorio.length
  return repertorio[indice]
}

export default FRASES
