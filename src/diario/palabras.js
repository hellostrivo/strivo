// src/diario/palabras.js
// Contar y recortar palabras vive en `lib/palabras.js` desde SPEC_28.1, porque
// Una pausa cuenta con la misma regla y no puede importar del diario. Esto es
// solo la puerta de siempre, para que ningún import del diario cambie.
export { contarPalabras, recortarAPalabras } from '../lib/palabras.js'
