// src/diario/palabras.js
// Contar palabras, y recortar a un número de ellas. Es lógica de texto y nada
// más: no sabe de filas, de listas ni de qué pregunta está contestando nadie.
//
// **Una palabra es un trozo entre espacios que lleva al menos una letra o un
// dígito.** Con eso «café,» y «niño» cuentan una cada una, con su acento y con
// su coma, y una raya suelta —«—»— no cuenta ninguna: los signos van pegados a
// las palabras o no son palabras. Se usan las clases Unicode (`\p{L}`, `\p{N}`)
// y no `\w`, que en JavaScript solo conoce el alfabeto inglés y dejaría fuera
// «ñ», «á» y media lengua.
//
// El recorte corta **al final de la última palabra que cabe** y conserva todo
// lo anterior tal cual —saltos de línea incluidos—: es lo que permite que el
// tope no permita añadir palabras y sí deje editar o borrar las que ya están.

/** Lo que hace que un trozo entre espacios sea una palabra. */
const CON_LETRA_O_CIFRA = /[\p{L}\p{N}]/u

/** Los trozos entre espacios, con su posición. */
const TROZOS = /\S+/gu

export function contarPalabras(texto) {
  const cadena = String(texto ?? '')
  let palabras = 0
  for (const trozo of cadena.match(TROZOS) ?? []) {
    if (CON_LETRA_O_CIFRA.test(trozo)) palabras += 1
  }
  return palabras
}

/**
 * El texto con como mucho `max` palabras. Si ya cabe, se devuelve idéntico
 * —misma referencia—, así que llamarlo en cada tecla no cuesta nada.
 */
export function recortarAPalabras(texto, max) {
  const cadena = String(texto ?? '')
  if (!Number.isFinite(max) || max < 0) return cadena
  if (contarPalabras(cadena) <= max) return cadena

  let palabras = 0
  let corte = 0
  for (const encontrado of cadena.matchAll(TROZOS)) {
    if (!CON_LETRA_O_CIFRA.test(encontrado[0])) continue
    palabras += 1
    if (palabras === max) {
      corte = encontrado.index + encontrado[0].length
      break
    }
  }
  return cadena.slice(0, corte)
}
