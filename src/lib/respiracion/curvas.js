// src/lib/respiracion/curvas.js
// Funciones de suavizado del ritmo (SPEC_13 §6.4).
//
// Viven aparte del motor por RN-RE-MOT-10: la curva es un **parámetro**, no una
// constante escondida. Quien quiera un movimiento distinto lo pasa; nadie tiene
// que editar el motor para conseguirlo.
//
// **Una sola curva para toda la app.** La respiración diaria de Hoy venía de
// SPEC_08 con `smoothstep` —t²(3−2t)— y este módulo la sustituye por el coseno
// elevado. La diferencia máxima entre ambas es de 0,0100 de amplitud, que sobre
// un círculo de 200 px son 0,36 px: imperceptible. Se unifica porque dos curvas
// para el mismo gesto es la clase de divergencia silenciosa que el propio
// `ritmoRespiracion.js` advertía en su cabecera, y no compensa por un tercio de
// píxel.

/** Recorta a 0..1. Un progreso fuera de rango es un error de quien llama. */
export function recortar(t) {
  const n = Number(t)
  if (!Number.isFinite(n)) return 0
  return n < 0 ? 0 : n > 1 ? 1 : n
}

/**
 * Coseno elevado. Arranque y llegada suaves, tránsito continuo.
 * Es lo que hace que el movimiento se sienta orgánico y no mecánico: la
 * velocidad nace en cero, crece hasta la mitad de la fase y muere en cero otra
 * vez, que es como se mueve de verdad un pecho al respirar.
 */
export const cosenoElevado = (t) => (1 - Math.cos(Math.PI * recortar(t))) / 2

/** Sin suavizado. Se lee como una máquina; está para poder compararla. */
export const lineal = (t) => recortar(t)

export const CURVA_POR_DEFECTO = cosenoElevado
