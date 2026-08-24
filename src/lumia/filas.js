// src/lumia/filas.js
// Filas dinámicas: hoy solo los agradecimientos (§5.3, B2).
//
// La regla vive en un solo sitio: al escribir en la última fila nace otra
// debajo, al vaciar una fila creada sobre la marcha desaparece, y nunca hay dos
// filas vacías a la vez.
//
// Una fila es `{ id, texto }`. Los agradecimientos se guardan como texto suelto
// dentro del registro de su día y nacen con `id: null`. El campo `id` es lo que
// queda de las victorias y los logros, que eran registros propios y se
// retiraron el 23 ago: se conserva porque la forma de una fila es contrato con
// `FilasDinamicas` y `CampoGratitud`.
//
// Nada de esto es obligatorio. Una lista entera vacía es un estado válido: la
// vista se puede recorrer y cerrar sin escribir una palabra (RN-VM-01).

/** Mínimos y máximos por lista (§5.3, B2 · RN-VM-03). */
export const LIMITES = Object.freeze({
  gratitud: Object.freeze({ min: 3, max: 10 }),
})

export function filaVacia() {
  return { id: null, texto: '' }
}

/** Filas a partir de texto suelto guardado. */
export function desdeTextos(textos) {
  return (Array.isArray(textos) ? textos : [])
    .map((texto) => ({ id: null, texto: String(texto ?? '') }))
    .filter((fila) => fila.texto.trim() !== '')
}

/**
 * Las filas con las que se abre la vista: lo ya escrito, completado hasta el
 * mínimo con filas vacías, y una vacía al final si aún cabe.
 */
export function filasIniciales(filas, { min, max }) {
  const iniciales = [...(Array.isArray(filas) ? filas : [])]
  while (iniciales.length < min) iniciales.push(filaVacia())
  const ultima = iniciales[iniciales.length - 1]
  if (iniciales.length < max && ultima && ultima.texto.trim() !== '') {
    iniciales.push(filaVacia())
  }
  return iniciales
}

/**
 * Escribe en una fila. Si era la última y ahora tiene contenido, nace otra
 * debajo — una sola, y solo si no se ha llegado al tope.
 */
export function escribirEn(filas, indice, texto, { max }) {
  const actuales = Array.isArray(filas) ? filas : []
  if (indice < 0 || indice >= actuales.length) return actuales

  const siguientes = [...actuales]
  siguientes[indice] = { ...siguientes[indice], texto: String(texto ?? '') }

  const esUltima = indice === siguientes.length - 1
  if (esUltima && siguientes[indice].texto.trim() !== '' && siguientes.length < max) {
    siguientes.push(filaVacia())
  }
  return siguientes
}

/**
 * Al salir de una fila vacía, la fila se va — salvo que sea una de las
 * primeras, que siempre se mantienen, o la última, que es la invitación a
 * seguir escribiendo.
 */
export function alSalirDeFila(filas, indice, { min }) {
  const actuales = Array.isArray(filas) ? filas : []
  if (indice < min || indice >= actuales.length) return actuales
  if (actuales[indice].texto.trim() !== '') return actuales
  if (indice === actuales.length - 1) return actuales
  return actuales.filter((_, posicion) => posicion !== indice)
}

/** Quitar a mano. Las primeras filas no se quitan, se vacían. */
export function quitarFila(filas, indice, { min }) {
  const actuales = Array.isArray(filas) ? filas : []
  if (indice < 0 || indice >= actuales.length) return actuales
  if (actuales.length <= min) {
    const siguientes = [...actuales]
    siguientes[indice] = { ...siguientes[indice], texto: '' }
    return siguientes
  }
  return actuales.filter((_, posicion) => posicion !== indice)
}

/** ¿Hace falta confirmar antes de quitar? Solo si hay texto de sobra (§5.3). */
export function pideConfirmacion(texto) {
  return String(texto ?? '').trim().length > 40
}

/** Lo que se guarda como texto suelto: sin espacios de más y sin filas vacías. */
export function textosDe(filas) {
  return (Array.isArray(filas) ? filas : [])
    .map((fila) => fila.texto.trim())
    .filter((texto) => texto !== '')
}

export function topeAlcanzado(filas, { max }) {
  return (Array.isArray(filas) ? filas : []).length >= max
}
