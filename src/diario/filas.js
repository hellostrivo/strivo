// src/diario/filas.js
// Filas dinámicas: la gratitud de la mañana (§5.3, B2) y el reconocimiento de
// la noche (§3 de la actualización del 23 ago).
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

/**
 * Mínimos y máximos por lista.
 *
 * Las dos listas del producto abren con **un** campo: la gratitud de la mañana
 * (§5.3, B2) y el reconocimiento de la noche (§3 de la actualización del 23
 * ago). Varios campos vacíos a la vez se leen como huecos por rellenar, y esto
 * no es un formulario: el segundo lo pide quien escribe, tocando "Añadir otro".
 *
 * **La gratitud llega hasta diez desde el 30 de agosto de 2026** y el
 * reconocimiento **hasta cinco desde el 10 de septiembre de 2026**. Ninguno de
 * los dos números es una meta ni algo que haya que alcanzar —abrir sigue
 * costando un campo, y cerrar con ese campo vacío sigue siendo cerrar—: es
 * sitio para quien una noche tiene más de tres cosas que nombrar y a la tercera
 * se quedaba sin dónde ponerlas. El tope se dice una sola vez al llegar en la
 * gratitud, con la frase que ya estaba escrita para una lista de diez, y no se
 * anuncia por adelantado en ninguna de las dos: contar lo que queda sería
 * convertirlo en un objetivo.
 *
 * `crecerSola` era lo que separaba a la gratitud de la noche —tres renglones de
 * salida, uno nuevo en cuanto se escribía en el último— y esa lista se retiró
 * con la actualización de la noche. La mecánica se queda porque es de
 * `FilasDinamicas` y no de ninguna lista en concreto; hoy no la usa nadie.
 */
export const LIMITES = Object.freeze({
  gratitudManana: Object.freeze({ min: 1, max: 10, crecerSola: false }),
  reconocimiento: Object.freeze({ min: 1, max: 5, crecerSola: false }),
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
export function filasIniciales(filas, { min, max, crecerSola = true }) {
  const iniciales = [...(Array.isArray(filas) ? filas : [])]
  while (iniciales.length < min) iniciales.push(filaVacia())
  const ultima = iniciales[iniciales.length - 1]
  if (crecerSola && iniciales.length < max && ultima && ultima.texto.trim() !== '') {
    iniciales.push(filaVacia())
  }
  return iniciales
}

/**
 * Escribe en una fila. Si era la última y ahora tiene contenido, nace otra
 * debajo — una sola, y solo si no se ha llegado al tope.
 */
export function escribirEn(filas, indice, texto, { max, crecerSola = true }) {
  const actuales = Array.isArray(filas) ? filas : []
  if (indice < 0 || indice >= actuales.length) return actuales

  const siguientes = [...actuales]
  siguientes[indice] = { ...siguientes[indice], texto: String(texto ?? '') }

  const esUltima = indice === siguientes.length - 1
  if (crecerSola && esUltima && siguientes[indice].texto.trim() !== '' && siguientes.length < max) {
    siguientes.push(filaVacia())
  }
  return siguientes
}

/**
 * Al salir de una fila vacía, la fila se va — salvo que sea una de las
 * primeras, que siempre se mantienen, o la última, que es la invitación a
 * seguir escribiendo.
 *
 * Sin `crecerSola` esa última excepción no aplica: ahí la invitación es el
 * botón "Añadir otro", así que una fila vacía al final no invita a nada y
 * además impide que el botón vuelva a ofrecerse.
 */
export function alSalirDeFila(filas, indice, { min, crecerSola = true }) {
  const actuales = Array.isArray(filas) ? filas : []
  if (indice < min || indice >= actuales.length) return actuales
  if (actuales[indice].texto.trim() !== '') return actuales
  if (crecerSola && indice === actuales.length - 1) return actuales
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

/**
 * ¿Se puede ofrecer una fila más?
 *
 * Con `crecerSola` la fila vacía ya está ahí y el botón solo adelanta trabajo.
 * Sin ella, ofrecer otra mientras hay una en blanco sería invitar a rellenar
 * dos huecos a la vez, que es justo lo que abrir con un campo evita.
 */
export function puedeAnadir(filas, limites) {
  const actuales = Array.isArray(filas) ? filas : []
  if (topeAlcanzado(actuales, limites)) return false
  if (limites.crecerSola !== false) return true
  return actuales.every((fila) => String(fila.texto ?? '').trim() !== '')
}
