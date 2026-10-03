// src/lib/lexico.js
// El léxico que la voz de Strivo no usa, en un solo sitio.
//
// Lo leen dos consumidores y ninguno lo copia:
//
//   `scripts/lint-copy.js`            FORBIDDEN sobre todo `src/`, línea a línea,
//                                     y CLINICO sobre `copy.respiracion`.
//   `src/unaPausa/modelo/validar.js`  las tres listas sobre el texto de una
//                                     cápsula, menos su exención (DP-28.13).
//
// Vivía dentro de `lint-copy.js`, que no exporta nada y que al importarse se
// ejecuta entero —`process.exit` incluido—, así que no había forma de leerlo
// sin copiarlo. Vive en `lib/` porque no es de ninguna sección: no importa nada
// y nadie le pasa nada.
//
// **Este archivo se revisa solo en su prosa** (`SOLO_PROSA`, en `lint-copy.js`):
// sus datos son los propios patrones, y dos de ellos se encontrarían a sí
// mismos en el recorrido línea a línea. Los comentarios de aquí sí se revisan.
//
// **La alineación por columnas es a propósito**, y por eso está en
// `.prettierignore`: es lo que deja leer de un vistazo qué regla dice qué.
//
// Cada regla lleva un `id`. Es lo que devuelve el validador de Una pausa
// (`lexico.<id>`) y lo que nombra su exención; `lint-copy.js` no lo lee. Una
// regla que esté en dos listas lleva el mismo `id` en las dos, para que quien
// las aplique juntas la cuente una vez.
//
// Las reglas de FORBIDDEN y CLINICO usan `\b`, que en JavaScript solo conoce el
// alfabeto inglés —también con la bandera `u`—. Ninguna empieza ni termina en
// vocal con tilde, así que hoy no muerde; **las reglas nuevas no usan `\b`**:
// usan `entera()`, que mira letras y cifras Unicode a los dos lados.

/** Una palabra o expresión entera: ni letra ni cifra pegada por ningún lado. */
function entera(cuerpo) {
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${cuerpo})(?![\\p{L}\\p{N}])`, 'iu')
}

// ─── Léxico prohibido en todo `src/` ──────────────────────────────────────────
export const FORBIDDEN = Object.freeze([
  { id: 'fallaste',      pattern: /\bfallaste\b/gi,      reason: 'Lenguaje de castigo (§3.6.2)' },
  { id: 'incumpliste',   pattern: /\bincumpliste\b/gi,   reason: 'Lenguaje de castigo (§3.6.2)' },
  { id: 'abandonaste',   pattern: /\babandonaste\b/gi,   reason: 'Lenguaje de castigo (§3.6.2)' },
  { id: 'racha',         pattern: /\bracha\b/gi,         reason: 'Usar "Constancia" en su lugar (§3.6.3)' },
  { id: 'streak',        pattern: /\bstreak\b/gi,        reason: 'Usar "Constancia" en su lugar (§3.6.3)' },
  { id: 'deberias',      pattern: /\bdeber[íi]as?\b/gi,  reason: 'Lenguaje prescriptivo prohibido (§3.6.2)' },
  { id: 'tendrias',      pattern: /\btendr[íi]as?\b/gi,  reason: 'Lenguaje prescriptivo prohibido (§3.6.2)' },
  { id: 'felicidades',   pattern: /¡Felicidades!/gi,     reason: 'Exclamación innecesaria (§3.6)' },
  { id: 'muy-bien',      pattern: /¡Muy bien!/gi,        reason: 'Exclamación innecesaria (§3.6)' },
  { id: 'dias-seguidos', pattern: /días\s+seguidos/gi,   reason: 'Usar "días contigo" en su lugar (§5.9)' },
  // SPEC_13 §7.1 — Vocabulario de rendimiento. Nunca es la voz de nadie: no hay
  // emoción que se llame así ni persona que lo escriba de sí misma.
  { id: 'productividad', pattern: /\bproductividad\b/gi, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { id: 'maximizar',     pattern: /\bmaximiz[a-záéíóú]*\b/gi, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { id: 'trastorno',     pattern: /\btrastorno\b/gi,     reason: 'Registro clínico: Strivo no diagnostica (SPEC_13 §7.1)' },
].map(Object.freeze))

// ─── Voz de Respiración (SPEC_13 §7.1) ────────────────────────────────────────
// El resto del léxico clínico **no puede revisarse sobre todo `src/`**, y no es
// una concesión: `copy.diario.journal` ofrece "Con ansiedad" como emoción del
// catálogo de días difíciles (SPEC_07), y `TEMAS_DE_RENDIMIENTO` es maquinaria
// de SPEC_05. Prohibir esas palabras en todo el árbol rompería el build por un
// motivo equivocado. `lint-copy.js` lo aplica al namespace `respiracion`, hoja
// por hoja; el validador de Una pausa, al texto de cada cápsula.
//
// `estres-derivados` llegó con SPEC_28.1: «estresante» o «estresado» no los
// alcanzaba la regla de «estrés», que acaba en la ese. Deja fuera «estreses»,
// que es el plural de la palabra exenta en Una pausa y no un derivado.
export const CLINICO = Object.freeze([
  { id: 'ansiedad',      pattern: /\bansiedad\b/i,        reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'ansioso',       pattern: /\bansios[ao]s?\b/i,    reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'estres',        pattern: /\bestr[ée]s\b/i,       reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'estres-derivados', pattern: entera('estres(?!es(?![\\p{L}\\p{N}]))\\p{L}+'), reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'panico',        pattern: /\bp[áa]nico\b/i,       reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'terapia',       pattern: /\bterap[a-záéíóú]*\b/i, reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'trastorno',     pattern: /\btrastorno\b/i,       reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'cura',          pattern: /\bcura[a-záéíóú]*\b/i, reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'tratamiento',   pattern: /\btratamiento\b/i,     reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'sintoma',       pattern: /\bs[íi]ntoma[a-záéíóú]*\b/i, reason: 'Registro clínico (SPEC_13 §7.1)' },
  { id: 'rendimiento',   pattern: /\brendimiento\b/i,     reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { id: 'optimizar',     pattern: /\boptimiz[a-záéíóú]*\b/i, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { id: 'productividad', pattern: /\bproductividad\b/i,   reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { id: 'maximizar',     pattern: /\bmaximiz[a-záéíóú]*\b/i, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  // Regla heredada de P2A. El neutro se consigue por redacción.
  { id: 'elle',          pattern: /\belle\b/i,            reason: 'Neutro por redacción, no con "elle" (SPEC_13 §7.1)' },
].map(Object.freeze))

// ─── Ampliado: solo para el texto de Una pausa (SPEC_28.1) ────────────────────
// CLAUDE.md §3 y SPEC_00B §3 prohíben más de lo que las dos listas de arriba
// comprueban. Ampliarlas cambiaría lo que `lint-copy.js` dice de todo `src/`,
// así que lo que faltaba para un texto de evidencia —que es donde más fácil se
// cuela— vive en una tercera lista que **solo lee el validador de Una pausa**.
//
// `nivel` dice si bloquea: `falta` detiene la cápsula, `aviso` lo decide la
// editora. Las tres palabras de aviso tienen usos legítimos («la meta de un
// estudio», «el progreso de una investigación»), y por eso no son falta.
export const AMPLIADO = Object.freeze([
  { id: 'depresion',     nivel: 'falta', pattern: entera('depresi[óo]n(?:es)?'), reason: 'Registro clínico (CLAUDE.md §3)' },
  { id: 'salud-mental',  nivel: 'falta', pattern: entera('salud\\s+mental'),     reason: 'Registro clínico (SPEC_00B §3)' },
  { id: 'diagnostico',   nivel: 'falta', pattern: entera('diagn[óo]stic\\p{L}*'), reason: 'Registro clínico (CLAUDE.md §3)' },
  { id: 'tienes-que',    nivel: 'falta', pattern: entera('tienes\\s+que'),       reason: 'Lenguaje prescriptivo (CLAUDE.md §3)' },
  { id: 'debes',         nivel: 'falta', pattern: entera('debes'),               reason: 'Lenguaje prescriptivo (CLAUDE.md §3)' },
  { id: 'meta',          nivel: 'aviso', pattern: entera('metas?'),              reason: 'Vocabulario de logro (CLAUDE.md §3)' },
  { id: 'progreso',      nivel: 'aviso', pattern: entera('progresos?'),          reason: 'Vocabulario de medición (CLAUDE.md §3)' },
  { id: 'pendiente',     nivel: 'aviso', pattern: entera('pendientes?'),         reason: 'Vocabulario de logro (CLAUDE.md §3)' },
].map(Object.freeze))
