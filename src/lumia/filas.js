// src/lumia/filas.js
// Filas dinámicas: agradecimientos, logros no planeados y victorias (§5.3, B2).
//
// Las tres listas se comportan igual y por eso la regla vive en un solo sitio:
// al escribir en la última fila nace otra debajo, al vaciar una fila creada
// sobre la marcha desaparece, y nunca hay dos filas vacías a la vez.
//
// Una fila es `{ id, texto }`. Los agradecimientos y los logros se guardan como
// texto suelto dentro de su registro del día y nacen con `id: null`; las
// victorias son registros propios y arrastran el suyo. Es la misma mecánica
// para las tres, con un campo de más que solo usa quien lo necesita.
//
// Nada de esto es obligatorio. Una lista entera vacía es un estado válido: la
// vista se puede recorrer y cerrar sin escribir una palabra (RN-VM-01).

/** Mínimos y máximos por lista (§5.3, B2 y B5 · §5.4, B3 · RN-VM-03). */
export const LIMITES = Object.freeze({
  gratitud: Object.freeze({ min: 3, max: 10 }),
  victorias: Object.freeze({ min: 3, max: 6 }),
  logros: Object.freeze({ min: 1, max: 6 }),
})

export function filaVacia() {
  return { id: null, texto: '' }
}

/** Filas a partir de texto suelto guardado (agradecimientos, logros). */
export function desdeTextos(textos) {
  return (Array.isArray(textos) ? textos : [])
    .map((texto) => ({ id: null, texto: String(texto ?? '') }))
    .filter((fila) => fila.texto.trim() !== '')
}

/** Filas a partir de registros con id (victorias). */
export function desdeRegistros(registros, campo = 'text') {
  return (Array.isArray(registros) ? registros : []).map((registro) => ({
    id: registro.id,
    texto: String(registro[campo] ?? ''),
  }))
}

/**
 * Devuelve las filas con el id que les corresponde de los registros guardados.
 *
 * Se usa al volver de un guardado, y **no** se sustituyen las filas por lo que
 * devolvió la base: mientras la escritura iba y venía, la persona ha seguido
 * tecleando. Rehacer la lista desde el registro borraría esas teclas. Lo único
 * que falta en pantalla es el id de lo que acaba de nacer, así que es lo único
 * que se trae.
 */
export function conIdsDe(filas, registros, campo = 'text') {
  const actuales = Array.isArray(filas) ? filas : []
  const usados = new Set(actuales.map((fila) => fila.id).filter(Boolean))
  const libres = (Array.isArray(registros) ? registros : []).filter(
    (registro) => !usados.has(registro.id),
  )

  return actuales.map((fila) => {
    if (fila.id || fila.texto.trim() === '') return fila
    const posicion = libres.findIndex(
      (registro) => String(registro[campo] ?? '').trim() === fila.texto.trim(),
    )
    if (posicion === -1) return fila
    const [registro] = libres.splice(posicion, 1)
    return { ...fila, id: registro.id }
  })
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
