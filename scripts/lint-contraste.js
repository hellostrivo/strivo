#!/usr/bin/env node
// scripts/lint-contraste.js
// Mide el contraste de los pares texto/fondo que la app usa de verdad.
//
// Existe porque el criterio 2 de SPEC_12 pide AAA en las cuatro paletas y eso
// no se puede afirmar a ojo. Cada par se mide con la fórmula de WCAG 2.2 y se
// compara con el umbral que le toca:
//
//   · Texto de cuerpo → AAA (7:1). Es lo que §6.3.6 exige y lo que Fase 1
//     viene cumpliendo desde SPEC_06.
//   · Texto grande (≥ 18,66 px en negrita o ≥ 24 px) → AAA grande (4,5:1).
//   · Elementos no textuales —bordes, indicadores— → 3:1 (WCAG 2.2, 1.4.11).
//
// **Los primarios de marca no llevan texto de cuerpo encima**, y no es un
// descuido: blanco sobre `lumia-pm-500` da 5,3:1 y sobre `formia-pm-600`, 5,2:1.
// Pasan AA y no llegan a AAA. El manual §4.8 ya lo resuelve: la paleta de marca
// dice qué superficie usar y el sistema de contraste decide qué texto va
// encima. Por eso los primarios se usan como acento y como borde —donde el
// umbral es 3:1— y nunca como fondo de un párrafo.
//
// Cómo correr: npm run lint:contraste

// ─── Fórmula de WCAG 2.2 ──────────────────────────────────────────────────────

function aRGB(hex) {
  const limpio = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16) / 255)
}

/** Mezcla un color con alfa sobre un fondo opaco. */
function sobre(hex, alfa, fondo) {
  const frente = aRGB(hex)
  const detras = aRGB(fondo)
  return frente.map((canal, i) => canal * alfa + detras[i] * (1 - alfa))
}

function luminancia(rgb) {
  const [r, g, b] = rgb.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const [uno, otro] = [luminancia(Array.isArray(a) ? a : aRGB(a)), luminancia(Array.isArray(b) ? b : aRGB(b))]
  const claro = Math.max(uno, otro)
  const oscuro = Math.min(uno, otro)
  return (claro + 0.05) / (oscuro + 0.05)
}

// ─── Los colores, tal como están en los tokens ────────────────────────────────

const TEXTO = {
  onLight: '#241E33',
  onLightSoft: '#3A3546',
  onDark: '#F2EEF7',
  onDarkSoft: '#B4ACC6',
  blanco: '#FFFFFF',
}

const MARCA = {
  lumiaAm50: '#F6F2E9',
  lumiaAm100: '#DCCFF1',
  lumiaAm200: '#E5C2DC',
  lumiaAm300: '#F6DDE8',
  lumiaPm50: '#F3EFEA',
  lumiaPm400: '#8D82B6',
  lumiaPm500: '#6C5AA7',
  lumiaPm700: '#5A5568',
  formiaAm50: '#F7F2E9',
  formiaAm200: '#E8D9C4',
  formiaAm400: '#FFC29C',
  formiaAm500: '#E9A387',
  formiaPm600: '#B45A2B',
  formiaPm700: '#8F4A2F',
  formiaPm800: '#5D4766',
  formiaPm900: '#1F1D22',
  strivo50: '#F6F4F1',
  strivo100: '#E9E7E3',
  strivo300: '#D4D1CD',
  strivo600: '#6E6A73',
  strivo900: '#2B2730',
  night: '#191428',
  // El bloque del conmutador de Hoy. Contratono: oscuro sobre la mañana clara,
  // claro sobre la noche. No sale del manual —lo fijó el propietario del
  // producto— y por eso se mide aquí como cualquier otra superficie con texto.
  conmutadorAm: '#1D1833',
  conmutadorPm: '#F2DDE7',
}

const CUERPO = 7
const GRANDE = 4.5
const NO_TEXTO = 3
// Separador decorativo: WCAG no le exige contraste, pero un borde que no se ve
// no separa nada. 1,5:1 es el mismo listón que la cuadrícula de constancia de
// SPEC_05, que se documentó como perceptible.
const SEPARADOR = 1.5

/** Cada par que la app pinta de verdad, con el umbral que le corresponde. */
const PARES = [
  // ── Lumia · Mañana ──────────────────────────────────────────────────────────
  ['Lumia·AM · cuerpo sobre base', TEXTO.onLight, MARCA.lumiaAm50, CUERPO],
  ['Lumia·AM · secundario sobre base', TEXTO.onLightSoft, MARCA.lumiaAm50, CUERPO],
  ['Lumia·AM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.lumiaAm300, CUERPO],
  ['Lumia·AM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.lumiaAm300, CUERPO],
  ['Lumia·AM · acento sobre cabecera', MARCA.lumiaPm500, MARCA.lumiaAm300, NO_TEXTO],
  ['Lumia·AM · borde sobre cabecera', MARCA.lumiaPm400, MARCA.lumiaAm300, SEPARADOR],
  ['Lumia·AM · cuerpo sobre conmutador', TEXTO.onDark, MARCA.conmutadorAm, CUERPO],
  ['Lumia·AM · conmutador sobre base', MARCA.conmutadorAm, MARCA.lumiaAm50, NO_TEXTO],

  // ── Lumia · Noche ───────────────────────────────────────────────────────────
  ['Lumia·PM · cuerpo sobre base', TEXTO.onLight, MARCA.lumiaPm50, CUERPO],
  ['Lumia·PM · secundario sobre base', TEXTO.onLightSoft, MARCA.lumiaPm50, CUERPO],
  ['Lumia·PM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.lumiaAm100, CUERPO],
  ['Lumia·PM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.lumiaAm100, CUERPO],
  ['Lumia·PM · acento sobre cabecera', MARCA.lumiaPm500, MARCA.lumiaAm100, NO_TEXTO],
  ['Lumia·PM · borde sobre cabecera', MARCA.lumiaPm400, MARCA.lumiaAm100, SEPARADOR],
  // El degradado nocturno de Hoy, en sus tres paradas.
  ['Hoy·noche · cuerpo sobre degradado', TEXTO.onDark, MARCA.night, CUERPO],
  ['Hoy·noche · secundario sobre degradado', TEXTO.onDarkSoft, MARCA.night, GRANDE],
  ['Lumia·PM · cuerpo sobre conmutador', TEXTO.onLight, MARCA.conmutadorPm, CUERPO],
  ['Lumia·PM · conmutador sobre degradado', MARCA.conmutadorPm, MARCA.night, NO_TEXTO],

  // ── Formia · Mañana ─────────────────────────────────────────────────────────
  ['Formia·AM · cuerpo sobre base', TEXTO.onLight, MARCA.formiaAm50, CUERPO],
  ['Formia·AM · secundario sobre base', TEXTO.onLightSoft, MARCA.formiaAm50, CUERPO],
  ['Formia·AM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.formiaAm200, CUERPO],
  ['Formia·AM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.formiaAm200, CUERPO],
  ['Formia·AM · acento sobre cabecera', MARCA.formiaPm600, MARCA.formiaAm200, NO_TEXTO],
  ['Formia·AM · borde sobre cabecera', MARCA.formiaPm600, MARCA.formiaAm200, SEPARADOR],

  // ── Formia · Noche ──────────────────────────────────────────────────────────
  ['Formia·PM · cuerpo sobre base', TEXTO.onLight, MARCA.formiaAm50, CUERPO],
  ['Formia·PM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.formiaAm400, CUERPO],
  ['Formia·PM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.formiaAm400, CUERPO],
  ['Formia·PM · acento sobre cabecera', MARCA.formiaPm600, MARCA.formiaAm400, NO_TEXTO],
  // §4.7 — La convergencia con Lumia, usada como borde: umbral de no-texto.
  ['Formia·PM · borde de convergencia', MARCA.formiaPm800, MARCA.formiaAm400, NO_TEXTO],

  // ── Strivo, el cromo de fuera de los espacios ───────────────────────────────
  ['Strivo · cuerpo sobre base', TEXTO.onLight, MARCA.strivo50, CUERPO],
  ['Strivo · secundario sobre base', TEXTO.onLightSoft, MARCA.strivo50, CUERPO],
  ['Strivo · cuerpo sobre cabecera', TEXTO.onLight, MARCA.strivo100, CUERPO],
  ['Strivo · acento sobre cabecera', MARCA.strivo900, MARCA.strivo100, NO_TEXTO],
  ['Strivo · borde sobre cabecera', MARCA.strivo600, MARCA.strivo100, SEPARADOR],
]

/**
 * Lo que **no** se hace, y por qué se mide igual: si alguien pone texto de
 * cuerpo sobre un primario de marca, estos números dicen en cuánto se queda.
 */
const INFORMATIVOS = [
  ['blanco sobre lumia-pm-500', TEXTO.blanco, MARCA.lumiaPm500],
  ['blanco sobre formia-pm-600', TEXTO.blanco, MARCA.formiaPm600],
  ['blanco sobre formia-pm-800 (convergencia)', TEXTO.blanco, MARCA.formiaPm800],
  ['ink sobre lumia-am-100', TEXTO.onLight, MARCA.lumiaAm100],
  ['ink sobre formia-am-400', TEXTO.onLight, MARCA.formiaAm400],
]

console.log('🎨 contraste: midiendo los pares que la app pinta de verdad\n')

let fallos = 0
PARES.forEach(([nombre, frente, fondo, umbral]) => {
  const medido = ratio(frente, fondo)
  const pasa = medido >= umbral
  if (!pasa) fallos += 1
  const marca = pasa ? '✅' : '❌'
  console.log(`${marca} ${nombre.padEnd(42)} ${medido.toFixed(2)}:1  (mín ${umbral}:1)`)
})

console.log('\n— Informativos: pares que la app NO usa, medidos para que conste —')
INFORMATIVOS.forEach(([nombre, frente, fondo]) => {
  console.log(`   ${nombre.padEnd(42)} ${ratio(frente, fondo).toFixed(2)}:1`)
})

// Los bordes translúcidos del sistema de superficies, mezclados sobre su fondo.
const bordeSobreClaro = ratio(sobre('#241E33', 0.12, MARCA.lumiaAm50), MARCA.lumiaAm50)
console.log(`\n   borde del sistema sobre superficie clara     ${bordeSobreClaro.toFixed(2)}:1`)

if (fallos === 0) {
  console.log('\n✅ contraste: las cuatro paletas pasan su umbral.\n')
  process.exit(0)
}
console.error(`\n⚠️  contraste: ${fallos} par(es) por debajo del umbral.\n`)
process.exit(1)
