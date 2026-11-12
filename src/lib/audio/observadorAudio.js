// src/lib/audio/observadorAudio.js
// Por dónde el diagnóstico del audio se entera de lo que pasa (SPEC_23C,
// DP-23.16). **Sin la bandera no existe.**
//
// Quien tiene algo que contar —el contexto al crearse, cerrarse o reanudarse,
// el planificador en cada tic, la sesión al empezar— llama a `avisar()` **solo
// dentro de** `if (import.meta.env.VITE_DIAG_AUDIO === '1')`. Sin la bandera
// esa condición es una constante falsa: Vite la sustituye, Rollup quita la
// rama entera y, con ella, este módulo, que no tiene efectos al cargarse. El
// `dist/` sin bandera sale idéntico byte a byte al de antes, y se comprobó.
//
// Un solo oyente: el diagnóstico (`diagnosticoAudio.js`). No es un bus de
// eventos para la app y no debe convertirse en uno.

let oyente = null

/** Lo instala el diagnóstico al cargarse. */
export function observar(fn) {
  oyente = typeof fn === 'function' ? fn : null
}

/** Cuenta algo al diagnóstico, si lo hay. Nunca lanza. */
export function avisar(tipo, datos) {
  try {
    oyente?.(tipo, datos)
  } catch {
    // El diagnóstico mide; si se rompe, la app sigue igual.
  }
}
