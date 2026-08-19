// src/lumia/sugerenciasGratitud.js
// Cuándo se ofrecen ideas en el bloque de agradecimientos (§5.3, Bloque 2).
//
// La regla vive aquí y no dentro del componente porque es una regla de tiempo y
// de estado, no de pintura: así se comprueba sin montar React ni esperar cinco
// segundos de reloj. Mismo patrón que `constancia.js` o `ritmoRespiracion.js`.
//
// **Las tres condiciones son de UN renglón, no del bloque:**
//   1. el foco está en ese renglón,
//   2. ese renglón está vacío,
//   3. lleva `RETRASO_SUGERENCIAS` sin recibir una tecla.
//
// Que ya se haya escrito en el primer renglón no dice nada del segundo: cada
// uno lleva su propia cuenta y su propia espera. Antes la condición era
// `filas.every(vacía)` con un solo temporizador para los tres, y por eso las
// ideas aparecían sin que nadie estuviera en el bloque y no volvían nunca en
// cuanto había una línea escrita.
//
// Lo único que sigue siendo del bloque entero es el silencio por descartes: dos
// "Ahora no" y no vuelven en toda la sesión, se hayan dado en el renglón que se
// hayan dado.
//
// **La app nunca escribe por ti.** Esta regla decide cuándo se ofrece la idea;
// tocarla abre una pregunta detonante y jamás rellena el campo.

/** Milisegundos de quietud, en ese renglón, antes de ofrecer una idea. */
export const RETRASO_SUGERENCIAS = 5000

/** Descartes tras los que no se vuelven a ofrecer en esta sesión. */
export const DESCARTES_MAXIMOS = 2

/** ¿Se pidió silencio ya suficientes veces? Es del bloque, no del renglón. */
export function silenciadas(descartes) {
  return Number(descartes ?? 0) >= DESCARTES_MAXIMOS
}

/** El texto del renglón enfocado. Cadena vacía si no hay ninguno enfocado. */
export function textoEnfocado(indice, filas) {
  const fila = (Array.isArray(filas) ? filas : [])[indice]
  return String(fila?.texto ?? '')
}

/**
 * ¿Puede este renglón llegar a ofrecer ideas?
 *
 * Es la condición previa a la espera: si es falsa no hay temporizador que valga
 * y no se ofrece nada. `indice` es el renglón enfocado, o `null` si el foco
 * está fuera del bloque —que es como empieza la pantalla y por eso los tres
 * renglones nacen en blanco.
 */
export function puedeOfrecer(indice, filas, descartes = 0) {
  if (indice === null || indice === undefined) return false
  const fila = (Array.isArray(filas) ? filas : [])[indice]
  if (!fila) return false
  if (String(fila.texto ?? '').trim() !== '') return false
  return !silenciadas(descartes)
}
