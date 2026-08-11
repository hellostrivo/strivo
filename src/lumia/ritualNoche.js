// src/lumia/ritualNoche.js
// El recorrido del Ritual de Noche (§5.6).
//
// **Cinco pantallas, no seis.** N2 —"Revisión de hábitos"— se retiró en v4.1
// (§C7.7.1): era la única superficie de Lumia que leía y escribía datos de
// hábitos, la misma mezcla que motivó disolver el Ritual de Mañana.
//
// **Los identificadores no se renumeran.** Las pantallas se llaman N1, N3, N4,
// N5 y N6. El hueco es intencional y es historia de la decisión (§C0.7): si
// alguien ve un N2 en el repositorio, algo se implementó de más.
//
// Consecuencias que este módulo sostiene:
//   · RN-HR-01 y RN-HR-02 no aplican de noche. Marcar un hábito no tiene
//     ninguna superficie nocturna que actualizar.
//   · RN-RN-03 —completable en menos de 90 s— se cumple con holgura: ninguna
//     pantalla tiene campos obligatorios y todas se pueden saltar.
//
// El ritual y la Vista de Noche escriben en el mismo sitio (D-4.5, §5.6.1): el
// ritual es el modo guiado y el Diario la vista libre del mismo dato. Rellenar
// uno rellena el otro, y por eso aquí no hay ni una función de guardado: las
// pantallas usan las mismas acciones de `useDiario` que usa `DiarioNoche`.

/** El orden real. `N2` no está y su número no se reasigna (§C7.7.1). */
export const PANTALLAS = Object.freeze(['N1', 'N3', 'N4', 'N5', 'N6'])

// Las dos duraciones del ritual —los 6 s del círculo de N1 (§5.6) y los 900 ms
// del cierre de N6 (§3.3, etapa 4)— viven en `globals.css` con el resto del
// motion, no aquí: son tokens de diseño, y tenerlas también en JavaScript daría
// dos respuestas a la misma pregunta la primera vez que alguien ajuste una.

export function esPantalla(id) {
  return PANTALLAS.includes(id)
}

/** Posición humana: N3 es la 2 de 5, no la 3. El identificador no es el orden. */
export function posicionDe(id) {
  return PANTALLAS.indexOf(id) + 1
}

export const TOTAL = PANTALLAS.length

export function primera() {
  return PANTALLAS[0]
}

export function esUltima(id) {
  return id === PANTALLAS[PANTALLAS.length - 1]
}

/**
 * La siguiente pantalla, o `null` si ya es la última.
 * Saltar y seguir llevan al mismo sitio: ningún paso es obligatorio (RN-VN-01).
 */
export function siguiente(id) {
  const indice = PANTALLAS.indexOf(id)
  if (indice === -1 || indice === PANTALLAS.length - 1) return null
  return PANTALLAS[indice + 1]
}

/** La anterior, o `null` si es la primera. Volver nunca pierde lo escrito. */
export function anterior(id) {
  const indice = PANTALLAS.indexOf(id)
  if (indice <= 0) return null
  return PANTALLAS[indice - 1]
}
