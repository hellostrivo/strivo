// src/presentacion/entrada.js
// Por dónde se entra a Strivo, y qué se marca al haber entrado.
//
// La entrada tiene dos mitades: el onboarding, que pregunta lo que la app
// necesita saber, y la presentación, que cuenta lo que la app tiene dentro. La
// primera la decide `completedAt` (RN-DB-09); la segunda, `tourCompletedAt`.
// Las dos viven en `shared/onboarding`, así que la respuesta sale de una sola
// lectura y llega al dispositivo antes que a la red (RN-01, RN-DB-01).
//
// ─── La migración, que es lo delicado ────────────────────────────────────────
//
// Quien ya entró antes de que esto existiera **no la ve**, y eso no se puede
// decidir mirando `tourCompletedAt`: a esa persona le falta la marca por el
// mismo motivo que a quien acaba de terminar el recorrido. Lo que las distingue
// es la versión con la que lo terminó, que es exactamente para lo que el
// expediente guarda una (`onboarding/pasos.js`). Terminar con la 3 o más es
// haber terminado con la presentación detrás; con menos, o sin versión, es
// haber terminado antes de que la hubiera.
//
// Se marca en el momento en que se resuelve, y no se deja para más tarde: una
// lectura que dijera "hecha" sin escribirlo obliga a deducirlo otra vez en cada
// arranque, y el día que la versión suba de nuevo esa deducción da una
// respuesta distinta. **No es una corrección en silencio** de las que RN-DB-02 prohíbe
// —el registro no estaba mal—: es la respuesta a una pregunta que antes no se
// hacía, escrita una vez y con fecha propia, la del día en que esa persona
// terminó su recorrido.

import { shared } from '@/lib/db'

/**
 * La versión del recorrido a partir de la cual terminarlo lleva a la
 * presentación.
 *
 * **Es el número de esta pieza, no el del onboarding**, y por eso se escribe
 * aquí en vez de importarse: hoy coinciden —hay una prueba que lo comprueba—
 * pero el día que el recorrido suba de versión por un motivo suyo, este se
 * queda donde está. Leerlo de `pasos.js` ataría las dos cosas y haría que
 * cualquier cambio del recorrido reabriera la presentación a quien ya entró.
 */
export const VERSION_CON_PRESENTACION = 3

/**
 * ¿Queda por ver la presentación de las secciones?
 *
 * Solo si el onboarding ya terminó —antes no toca— y se terminó con una versión
 * que la incluye. Si no la incluye, se marca como vista con la fecha en que se
 * terminó el recorrido: quien lleva meses usando la app no se encuentra un
 * carrusel al abrirla.
 *
 * Un tropiezo al leer devuelve `false`, que es la respuesta prudente: entre
 * enseñar de más y enseñar de menos en la puerta de entrada, se enseña de menos.
 */
export async function presentacionPendiente(uid) {
  const expediente = await shared.getOnboarding(uid).catch(() => null)
  if (!expediente?.completedAt) return false
  if (expediente.tourCompletedAt) return false

  if ((expediente.version ?? 0) < VERSION_CON_PRESENTACION) {
    await shared.updateOnboarding(uid, { tourCompletedAt: expediente.completedAt }).catch(() => {})
    return false
  }
  return true
}

/**
 * La presentación se da por vista.
 *
 * Lo escriben por igual "Omitir" y "Entrar a Strivo": las dos son haberla
 * pasado, y ninguna de las dos deja nada a medias que valga la pena volver a
 * ofrecer. Es la misma decisión que RN-DB-09 toma con el recorrido, donde
 * saltarse los siete pasos también es haberlo hecho.
 *
 * Se guarda en el dispositivo al instante y sube después, por la cola de
 * `lib/db/sync`: si la red no está, no se pierde y no se muestra ningún error
 * (RN-EST-05). Un tropiezo tampoco vuelve a abrir la presentación: quien la
 * acaba de cerrar entra igual.
 */
export async function completarPresentacion(uid) {
  return shared
    .updateOnboarding(uid, { tourCompletedAt: new Date().toISOString() })
    .catch(() => null)
}

/**
 * Qué hace la puerta con una lectura de las dos mitades (SPEC_19.1 §4.3).
 *
 * Hay dos clases de lectura, y no valen lo mismo:
 *
 *   - **la del arranque o la de un uid nuevo** (`porSello: false`) se aplica
 *     entera, como siempre: el onboarding si queda, la presentación si toca;
 *   - **la que dispara el sello de restauración** (`porSello: true`) solo puede
 *     sacar del onboarding. Si alguien está dentro y lo que bajó dice que ya lo
 *     terminó, sale, y qué viene después lo decide `presentacionPendiente`
 *     igual que en un arranque (desvío D7). Si no está dentro, nada visible
 *     cambia: una relectura no mete a nadie en el onboarding desde las
 *     secciones ni le reabre una presentación.
 *
 * `presentacionResuelta` protege lo que ya se decidió en esta sesión: una
 * presentación cerrada no la reabre ninguna lectura.
 *
 * @returns {?{pendiente: boolean, presentando?: boolean}} `null` si no cambia
 *   nada; si `presentando` no viene, la presentación se queda como está.
 */
export function aplicarLecturaDePuerta({
  porSello,
  enOnboarding,
  onboarding,
  presentacion,
  presentacionResuelta,
}) {
  if (porSello) {
    if (!enOnboarding || onboarding) return null
    return presentacionResuelta
      ? { pendiente: false }
      : { pendiente: false, presentando: presentacion }
  }
  if (presentacionResuelta) return { pendiente: onboarding }
  return { pendiente: onboarding, presentando: !onboarding && presentacion }
}
