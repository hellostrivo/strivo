// src/lib/umbralSesion.js
// El "una vez por sesión" del umbral de entrada (§C7.5, SPEC_10).
//
// Vivía dentro de `Hoy.jsx` y ahora hay dos sitios que lo consultan: la apertura
// de la app y la aparición de la sección Mañana. Con el estado en uno de los
// dos, abrir y ver la mañana enseguida encadenaba dos umbrales seguidos —diez
// segundos de luz antes de escribir una palabra—, que es justo lo que
// RN-LU-MAN-02 no quiere: un umbral que se cruza dos veces deja de ser un
// umbral y empieza a ser un peaje.
//
// Es de sesión y no del modelo: SPEC_10 §5 no tiene datos que guardar, y cerrar
// la app y volver mañana es exactamente cuando el umbral vuelve a tener
// sentido. Un módulo y no un `useRef` porque las pantallas se desmontan al
// navegar: con el estado dentro del componente, ir al Journal y volver haría
// cruzarlo otra vez.
//
// La clave es de quien cruza el umbral, no del módulo: hoy solo hay una,
// `'diario'`, porque hay un solo sitio al que se entra. El parámetro se
// conserva porque es lo que hace idempotente al contador y porque el día que
// otra superficie tenga umbral propio no tendrá que compartir el de nadie.

const cruzados = new Set()

/** ¿Queda por cruzar el umbral de este espacio en esta sesión? */
export function umbralPendiente(espacio) {
  return !cruzados.has(espacio)
}

/** Marca el umbral como cruzado. Idempotente. */
export function cruzarUmbral(espacio) {
  cruzados.add(espacio)
}

/** Solo para las pruebas: devuelve el módulo a como empieza una sesión. */
export function olvidarUmbrales() {
  cruzados.clear()
}
