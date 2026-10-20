// src/onboarding/horarios.js
// P5 — a qué hora empieza y termina el día de quien escribe.
//
// Se guardan en `shared/profile` como `wakeTime` y `sleepTime`, en formato
// "HH:MM", que es el que da un `<input type="time">` y el que ya entiende
// `lib/db/dates.js`.
//
// **`diaTerminaA` no se toca aquí, y es deliberado.** Dormirse a las dos de la
// mañana no es lo mismo que querer que el día cambie de fecha a las dos: uno es
// cuándo te acuestas y el otro a qué día pertenece lo que escribes (RN-DB-08).
// Atarlos movería la clave de fecha de todo el Historial por una respuesta que
// nadie dio con eso en mente.
//
// Aquí sí se corrige lo que llega, al revés que en `lib/db/`: el valor lo
// escribe una persona moviendo un control, no el código, y frenarla con un
// error sería castigarla por explorar. Lo que no es una hora no se guarda.

/** Lo que proponen los dos campos si nadie los toca. */
export const DESPERTAR_SUGERIDO = '07:00'
export const DORMIR_SUGERIDO = '23:00'

const HORA = /^(\d{1,2}):(\d{2})$/

/**
 * Devuelve la hora en "HH:MM" o `null` si lo recibido no es una hora.
 * `null` no es un error: es que ese campo se queda como estaba (RN-02).
 */
export function normalizarHora(valor) {
  const encaje = HORA.exec(String(valor ?? '').trim())
  if (!encaje) return null
  const horas = Number(encaje[1])
  const minutos = Number(encaje[2])
  if (horas > 23 || minutos > 59) return null
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
}

/** ¿Es una hora que se puede guardar? */
export function esHora(valor) {
  return normalizarHora(valor) !== null
}
