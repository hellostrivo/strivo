// src/copy/gender.js
// Único punto de resolución de género de toda la app (§3.6.5).
//
// El español marca género en adjetivos y participios, y un masculino genérico
// le devuelve a una usuaria una imagen que no es la suya justo en los momentos
// de más carga emocional: el cierre del día, el estado de sueño, la emoción que
// quiere cultivar. Por eso todo string con marca de género deja de ser una
// cadena y pasa a ser un objeto `{ m, f, n }` que se resuelve al pintar.
//
// RN-GEN-01 — Ningún componente lee `.m` ni `.f`. Todos pasan por aquí.
// RN-GEN-04 — Se persisten identificadores estables, nunca etiquetas visibles:
//   un `en_paz` guardado hoy se pinta con el género vigente mañana.
// RN-GEN-05 — El neutro es el comportamiento por defecto, no un caso raro.
// RN-GEN-06 — El texto que escribe la persona nunca pasa por aquí.
//
// La forma `n` no es el masculino reutilizado ni una terminación en "-e": es
// una redacción distinta que evita la marca. La terminación "-e" está prohibida
// en toda la aplicación (§3.6.5).

/** Los tres géneros de `shared/profile.gender`. */
export const GENEROS = Object.freeze(['m', 'f', 'n'])

/** El que se usa cuando el perfil no declara ninguno. */
export const GENERO_POR_DEFECTO = 'n'

/**
 * ¿Es un objeto `{ m, f, n }` y no una cadena?
 * @param {unknown} value
 */
export function tieneMarcaDeGenero(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Resuelve una cadena de copy al género del perfil.
 *
 * Nunca lanza: una cadena vacía siempre es preferible a una pantalla rota.
 *
 * @param {string|{m?: string, f?: string, n?: string}} value
 * @param {'m'|'f'|'n'|null|undefined} genero
 * @returns {string}
 */
export function resolveGender(value, genero) {
  if (typeof value === 'string') return value
  if (!tieneMarcaDeGenero(value)) return ''

  const pedido = GENEROS.includes(genero) ? genero : GENERO_POR_DEFECTO
  return value[pedido] ?? value.n ?? value.m ?? ''
}

/**
 * Atajo para pintar una lista entera con el mismo género.
 *
 * @param {Array<string|object>} valores
 * @param {'m'|'f'|'n'|null|undefined} genero
 */
export function resolveAll(valores, genero) {
  return (valores ?? []).map((valor) => resolveGender(valor, genero))
}

export default resolveGender
