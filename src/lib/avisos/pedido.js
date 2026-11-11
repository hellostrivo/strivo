// src/lib/avisos/pedido.js
// Pedir que los avisos se pongan al día, sin saber cómo se hace (SPEC_22, DP-22.9).
//
// **Quien cierra un momento o cambia una hora pide la reconciliación; no la
// contiene.** El diario y Tu perfil importan este módulo, que no importa nada:
// ni el plugin, ni la base de datos, ni la reconciliación. Así ninguno de los
// dos arrastra lo que no es suyo, y la dirección de dependencias sigue igual
// (RN-TEC-04 a 08).
//
// **Quien escucha es la app de iPhone con las secciones montadas**
// (`avisos/useAvisos.js`). En la web, en Android antes de SPEC_27, durante el
// onboarding o después de cerrar sesión no escucha nadie, y pedir no hace
// nada: no hay a quién avisar.
//
// Y al revés: cuando una reconciliación termina, lo cuenta aquí
// (`alReconciliar`), para que el bloque de Tu perfil y el diagnóstico se
// pinten solos sin preguntarle nada al teléfono.

const pedidos = new Set()
const resultados = new Set()
let ultimo = null

/**
 * Pide reconciliar.
 * @param {{cerrado?: {fecha: string, momento: 'manana'|'noche'}}} [detalle]
 *   Con `cerrado`, además se retira del Centro de notificaciones el aviso de
 *   ese momento y ese día, si sigue ahí.
 */
export function pedirReconciliacion(detalle = {}) {
  for (const fn of pedidos) {
    try {
      fn(detalle)
    } catch {
      // Pedir nunca rompe a quien pide.
    }
  }
}

/** Se cerró un momento: ese día, ese aviso ya no toca. */
export function alCerrarMomento(fecha, momento) {
  pedirReconciliacion({ cerrado: { fecha, momento } })
}

/** Escucha los pedidos. Devuelve la forma de dejar de escuchar. */
export function escucharPedidos(fn) {
  pedidos.add(fn)
  return () => pedidos.delete(fn)
}

/** Cuenta el resultado de una reconciliación a quien quiera pintarlo. */
export function contarResultado(resultado) {
  ultimo = resultado
  for (const fn of resultados) {
    try {
      fn(resultado)
    } catch {
      // Pintar nunca rompe la reconciliación.
    }
  }
}

/**
 * Escucha los resultados. Si ya hubo uno, se entrega en el acto: quien abre Tu
 * perfil después de la última reconciliación no tiene que esperar a la
 * siguiente para saber en qué quedó.
 */
export function alReconciliar(fn) {
  resultados.add(fn)
  if (ultimo) fn(ultimo)
  return () => resultados.delete(fn)
}

/** Olvida el último resultado. Al cerrar sesión, ya no es de nadie. */
export function olvidarResultado() {
  ultimo = null
}
