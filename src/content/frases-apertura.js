// src/content/frases-apertura.js
// Repertorio de la transición de entrada (§C7.5 · SPEC_10).
//
// Va en `content/` y no dentro del componente: es material editorial, se revisa
// aparte del código que lo pinta y crece sin tocar una línea de React.
//
// **Estas cien frases son nuevas.** §8 de SPEC_10 dice que el repertorio "ya
// existe de Fase 0" y que basta con revisarlo, pero Fase 1 es borrón y cuenta
// nueva (SPEC_00 §2) y en este repositorio no había nada que revisar. Están
// escritas contra §3.6 —sin exclamaciones, sin promesas, sin lenguaje de
// coach— y una prueba lo comprueba, pero el criterio editorial es de quien
// firma el producto.
//
// **Dos temas, gratitud y amabilidad.** Es lo que pide §C7.5 y no es un
// detalle: la transición es un umbral de cinco segundos, no un consejo. Una
// frase que diga qué hacer convierte el umbral en la primera pantalla de un
// wizard, que es exactamente lo que la división vino a eliminar.
//
// Ninguna lleva marca de género: están redactadas para no necesitar el helper
// de §3.6.5, igual que las frases del día.

/** Los dos temas del repertorio. */
export const TEMAS = Object.freeze(['gratitud', 'amabilidad'])

export const FRASES = Object.freeze([
  // ─── Gratitud ───────────────────────────────────────────────────────────────
  { texto: 'Alguien te esperó hoy sin decirlo.', tema: 'gratitud' },
  { texto: 'Tu día empieza con más de lo que crees.', tema: 'gratitud' },
  { texto: 'Lo que sostiene tu día casi nunca hace ruido.', tema: 'gratitud' },
  { texto: 'Hay manos que hicieron lo que hoy usas.', tema: 'gratitud' },
  { texto: 'Alguien te enseñó lo que hoy te sale solo.', tema: 'gratitud' },
  { texto: 'El agua caliente también es un lujo.', tema: 'gratitud' },
  { texto: 'Alguien guarda un recuerdo tuyo bueno.', tema: 'gratitud' },
  { texto: 'Hoy alguien va a alegrarse de verte.', tema: 'gratitud' },
  { texto: 'Lo bueno de ayer sigue contando.', tema: 'gratitud' },
  { texto: 'Tu cama te estuvo esperando.', tema: 'gratitud' },
  { texto: 'Casi nada de lo tuyo lo hiciste a solas.', tema: 'gratitud' },
  { texto: 'Hay una silla en algún sitio que es tuya.', tema: 'gratitud' },
  { texto: 'Lo que se agradece pesa menos.', tema: 'gratitud' },
  { texto: 'Hoy hay una comida esperándote.', tema: 'gratitud' },
  { texto: 'Alguien pronunció tu nombre con cariño este mes.', tema: 'gratitud' },
  { texto: 'Lo que tienes hoy fue una vez un deseo.', tema: 'gratitud' },
  { texto: 'Puedes leer esto. No es poco.', tema: 'gratitud' },
  { texto: 'El sol salió otra vez, sin que se lo pidieras.', tema: 'gratitud' },
  { texto: 'Alguien te escribió sin necesitar nada.', tema: 'gratitud' },
  { texto: 'Tu corazón late desde antes de que supieras contar.', tema: 'gratitud' },
  { texto: 'Hay una canción que te sigue gustando.', tema: 'gratitud' },
  { texto: 'Alguien te hizo reír esta semana.', tema: 'gratitud' },
  { texto: 'Lo que hoy es rutina alguna vez fue una novedad.', tema: 'gratitud' },
  { texto: 'Alguien te sostuvo un día que no recuerdas.', tema: 'gratitud' },
  { texto: 'Tienes gente a la que podrías llamar.', tema: 'gratitud' },
  { texto: 'Hoy hay aire suficiente.', tema: 'gratitud' },
  { texto: 'Alguien plantó el árbol que hoy da sombra.', tema: 'gratitud' },
  { texto: 'Lo que aprendiste de alguien sigue contigo.', tema: 'gratitud' },
  { texto: 'Hay lugares donde te sabrían recibir.', tema: 'gratitud' },
  { texto: 'Tu casa te guarda las cosas mientras no estás.', tema: 'gratitud' },
  { texto: 'Alguien pensó en cómo estarías.', tema: 'gratitud' },
  { texto: 'Lo que te gusta comer existe y está cerca.', tema: 'gratitud' },
  { texto: 'Hoy hay más de lo que cabe en una lista.', tema: 'gratitud' },
  { texto: 'Un día quisiste llegar hasta aquí.', tema: 'gratitud' },
  { texto: 'Alguien cuidó de ti cuando no podías.', tema: 'gratitud' },
  { texto: 'Los días buenos también fueron reales.', tema: 'gratitud' },
  { texto: 'Hay ropa que te abriga sin que lo pienses.', tema: 'gratitud' },
  { texto: 'Alguien te dejó pasar primero esta semana.', tema: 'gratitud' },
  { texto: 'Tienes recuerdos que nadie puede quitarte.', tema: 'gratitud' },
  { texto: 'Lo cotidiano es la mayor parte de una vida buena.', tema: 'gratitud' },
  { texto: 'Alguien confía en ti para algo.', tema: 'gratitud' },
  { texto: 'Hoy tienes agua limpia al alcance.', tema: 'gratitud' },
  { texto: 'Alguien se acordó de tu cumpleaños alguna vez.', tema: 'gratitud' },
  { texto: 'Lo que te salió bien también fue mérito tuyo.', tema: 'gratitud' },
  { texto: 'Hay una voz que reconoces entre mil.', tema: 'gratitud' },
  { texto: 'Alguien te esperó despierto una noche.', tema: 'gratitud' },
  { texto: 'Tu nombre significa algo para alguien.', tema: 'gratitud' },
  { texto: 'Hoy hay luz sin que hayas hecho nada.', tema: 'gratitud' },
  { texto: 'Un lugar de tu ciudad te gusta de verdad.', tema: 'gratitud' },
  { texto: 'Alguien te dio algo sin pedirte nada.', tema: 'gratitud' },

  // ─── Amabilidad ─────────────────────────────────────────────────────────────
  { texto: 'Puedes tratarte como tratarías a alguien que quieres.', tema: 'amabilidad' },
  { texto: 'Nadie mide tu día mejor que tú.', tema: 'amabilidad' },
  { texto: 'Hoy no le debes explicaciones a nadie.', tema: 'amabilidad' },
  { texto: 'Puedes ir a tu ritmo.', tema: 'amabilidad' },
  { texto: 'Lo que sientes hoy tiene su motivo.', tema: 'amabilidad' },
  { texto: 'Puedes cambiar de idea las veces que quieras.', tema: 'amabilidad' },
  { texto: 'No hace falta que hoy salga todo.', tema: 'amabilidad' },
  { texto: 'Alguien agradecería un mensaje corto tuyo.', tema: 'amabilidad' },
  { texto: 'Puedes pedir ayuda sin justificarte.', tema: 'amabilidad' },
  { texto: 'Hoy también vales lo mismo.', tema: 'amabilidad' },
  { texto: 'Puedes decir que no y seguir siendo amable.', tema: 'amabilidad' },
  { texto: 'Nadie te mira tan de cerca como tú.', tema: 'amabilidad' },
  { texto: 'Tu prisa no la puso nadie de fuera.', tema: 'amabilidad' },
  { texto: 'Puedes descansar antes de terminar.', tema: 'amabilidad' },
  { texto: 'Lo que hoy te cuesta, a otros también.', tema: 'amabilidad' },
  { texto: 'Puedes empezar por lo fácil.', tema: 'amabilidad' },
  { texto: 'Alguien cerca de ti también tiene un día raro.', tema: 'amabilidad' },
  { texto: 'Hoy puedes ser paciente contigo.', tema: 'amabilidad' },
  { texto: 'No tienes que estar bien todo el rato.', tema: 'amabilidad' },
  { texto: 'Un gesto pequeño con alguien te cambia el día a ti.', tema: 'amabilidad' },
  { texto: 'Puedes cerrar esto y volver mañana.', tema: 'amabilidad' },
  { texto: 'Lo que no dijiste todavía puedes decirlo.', tema: 'amabilidad' },
  { texto: 'Hoy puedes escuchar más que hablar.', tema: 'amabilidad' },
  { texto: 'Nadie lleva una vida sin días torcidos.', tema: 'amabilidad' },
  { texto: 'Puedes perdonarte algo pequeño.', tema: 'amabilidad' },
  { texto: 'Hay alguien a quien le vendría bien saber de ti.', tema: 'amabilidad' },
  { texto: 'Tu manera de hacer las cosas también sirve.', tema: 'amabilidad' },
  { texto: 'Puedes hacerlo regular y seguir adelante.', tema: 'amabilidad' },
  { texto: 'Hoy puedes dejar algo sin resolver.', tema: 'amabilidad' },
  { texto: 'Ser amable contigo no te quita firmeza.', tema: 'amabilidad' },
  { texto: 'Nadie te pidió que fueras perfecto.', tema: 'amabilidad' },
  { texto: 'Puedes celebrar algo pequeño sin motivo grande.', tema: 'amabilidad' },
  { texto: 'Lo que te dices por dentro también cuenta.', tema: 'amabilidad' },
  { texto: 'Hoy puedes darte el beneficio de la duda.', tema: 'amabilidad' },
  { texto: 'Alguien te querría igual con menos.', tema: 'amabilidad' },
  { texto: 'Puedes ocupar tu sitio sin pedir permiso.', tema: 'amabilidad' },
  { texto: 'Hoy cabe un poco de ternura contigo.', tema: 'amabilidad' },
  { texto: 'No hace falta merecer el descanso.', tema: 'amabilidad' },
  { texto: 'Puedes soltar la conversación que te repites.', tema: 'amabilidad' },
  { texto: 'Alguien agradecería tu paciencia hoy.', tema: 'amabilidad' },
  { texto: 'Tu tiempo también es tuyo.', tema: 'amabilidad' },
  { texto: 'Puedes mirar esto con menos dureza.', tema: 'amabilidad' },
  { texto: 'Hoy puedes hacer las paces con algo.', tema: 'amabilidad' },
  { texto: 'Nadie te va a querer más por sufrir.', tema: 'amabilidad' },
  { texto: 'Puedes quedarte quieto un momento.', tema: 'amabilidad' },
  { texto: 'Lo que dejaste a medias no te define.', tema: 'amabilidad' },
  { texto: 'Hoy puedes ser fácil para ti.', tema: 'amabilidad' },
  { texto: 'Puedes tener un mal rato sin que sea un mal día.', tema: 'amabilidad' },
  { texto: 'Alguien se alegraría de que estés bien.', tema: 'amabilidad' },
  { texto: 'Puedes empezar desde donde estás.', tema: 'amabilidad' },
])

/**
 * La última que tocó, para no repetirla dos veces seguidas (criterio 6).
 *
 * Vive en el módulo y no en el componente a propósito: la transición se monta
 * y se desmonta —una vez al entrar a la app, otra al abrir la mañana— y un
 * estado dentro del componente se iría con él, que es justo cuando hace falta
 * recordarlo.
 *
 * No se persiste nada: SPEC_10 §5 dice que no hay modelo de datos, y cuál tocó
 * ayer no le importa a nadie.
 */
let ultima = null

/**
 * Una frase al azar, nunca la misma dos veces seguidas.
 *
 * @param {object} [opciones]
 * @param {Function} [opciones.azar] - Fuente de aleatoriedad, para las pruebas.
 * @returns {{texto: string, tema: string}}
 */
export function fraseDeApertura({ azar = Math.random } = {}) {
  const disponibles = FRASES.filter((frase) => frase.texto !== ultima)
  const elegida = disponibles[Math.floor(azar() * disponibles.length)] ?? FRASES[0]
  ultima = elegida.texto
  return elegida
}

/** Olvida cuál tocó. Solo lo usan las pruebas. */
export function olvidarUltima() {
  ultima = null
}
