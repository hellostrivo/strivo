// src/breathing/lib/formato.js
// Cómo se escriben los números que se leen (SPEC_16 §3.2).
//
// Puro, para poder comprobar la coma. **Con coma decimal y no con punto**
// (RN-RE-NAV-18): el locale del producto es es-MX y `5.0 s` en una app en
// español se lee como un descuido de quien la programó. No se usa
// `toLocaleString` porque su resultado depende del navegador y de los datos de
// región instalados, y un separador que cambia de un teléfono a otro no es una
// decisión de producto: es una lotería.

/** Los tiempos del motor vienen en décimas de segundo enteras. */
export const MS_POR_DECIMA = 100

/**
 * Décimas → `5,0 s`.
 * Siempre con un decimal, incluso en los enteros: una columna donde unos valores
 * tienen decimal y otros no baila al pulsar `−`/`+`, y lo que se está mirando es
 * justo cómo cambia el número.
 */
export function segundosConDecimal(decimas) {
  const n = Number(decimas)
  if (!Number.isFinite(n)) return '0,0'
  const enteros = Math.trunc(Math.abs(n) / 10)
  const decimal = Math.abs(n) % 10
  const signo = n < 0 ? '-' : ''
  return `${signo}${enteros},${decimal}`
}

/** `5,0 s`, con su unidad. */
export function tiempoDeFase(decimas) {
  return `${segundosConDecimal(decimas)} s`
}

/**
 * Segundos → `1:42`. Para el tiempo transcurrido de la sesión.
 * Los segundos siempre con dos cifras: `1:2` no es una hora, es un error.
 */
export function reloj(segundos) {
  const total = Math.max(0, Math.floor(Number(segundos) || 0))
  const minutos = Math.floor(total / 60)
  const resto = total % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}
