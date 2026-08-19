#!/usr/bin/env node
// scripts/explora-lumia-am.js
// EXPLORACIÓN — no forma parte del sistema de diseño.
//
// Mide las paletas alternas de Lumia·Mañana (tono amanecer) contra exactamente
// los mismos umbrales que `lint-contraste.js` aplica a la paleta vigente. Una
// propuesta que no llegue a AAA en texto de cuerpo se DESCARTA aquí; no se
// advierte y se sigue.
//
// Cómo correr: node scripts/explora-lumia-am.js

// ─── Fórmula de WCAG 2.2 (idéntica a lint-contraste.js) ───────────────────────

function aRGB(hex) {
  const limpio = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16) / 255)
}

function luminancia(rgb) {
  const [r, g, b] = rgb.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const [uno, otro] = [luminancia(aRGB(a)), luminancia(aRGB(b))]
  return (Math.max(uno, otro) + 0.05) / (Math.min(uno, otro) + 0.05)
}

// ─── Lo que no se mueve en esta ronda ─────────────────────────────────────────

const TEXTO = { ink: '#241E33', soft: '#3A3546' }
// Los primarios de Lumia son la firma de la marca y no cambian con el momento
// (tokens-lumia.css:28). El acento y el borde de la mañana salen de aquí, así
// que toda propuesta de Mañana tiene que convivir con ellos sin retocarlos.
const PM = { 400: '#8D82B6', 500: '#6C5AA7' }

const CUERPO = 7 // AAA texto de cuerpo (§6.3.6)
const NO_TEXTO = 3 // WCAG 2.2 · 1.4.11
const SEPARADOR = 1.5 // el listón perceptible del proyecto (SPEC_05)

// ─── Las paletas ──────────────────────────────────────────────────────────────
//
// Misma estructura que el token vigente: cuatro variantes, mismos nombres
// (`lumia-am-50/100/200/300`) y mismo papel para cada una, para que el cambio
// sea un reemplazo literal de cuatro líneas en `tokens-lumia.css`.
//
//   50  → base de la página (`--espacio-base`) y arranque del degradado de Hoy
//   300 → franja de cabecera del espacio y parada del 62 % del degradado
//   100 → parada final del degradado (el horizonte, abajo)
//   200 → el tono de firma de la paleta; hoy declarado y sin pintar

const PALETAS = {
  vigente: {
    nombre: 'Vigente · rosa del manual v1.1',
    50: '#F6F2E9',
    100: '#DCCFF1',
    200: '#E5C2DC',
    300: '#F6DDE8',
  },
  A: {
    nombre: 'A · Amanecer rosado (naranja con memoria del rosa)',
    50: '#FCF3EC',
    100: '#F2C4B5',
    200: '#EDB2A0',
    300: '#FBDCD1',
  },
  B: {
    nombre: 'B · Alba dorada (amarillo/oro, sin rosa)',
    50: '#FDF5E1',
    100: '#F8E09A',
    200: '#F4D386',
    300: '#FCEBB4',
  },
}

/** Los mismos pares que `lint-contraste.js` mide para Lumia·AM, uno a uno. */
function paresDe(p) {
  return [
    ['cuerpo sobre base (am-50)', TEXTO.ink, p[50], CUERPO],
    ['secundario sobre base (am-50)', TEXTO.soft, p[50], CUERPO],
    ['cuerpo sobre cabecera (am-300)', TEXTO.ink, p[300], CUERPO],
    ['secundario sobre cabecera (am-300)', TEXTO.soft, p[300], CUERPO],
    ['acento sobre cabecera (pm-500 / am-300)', PM[500], p[300], NO_TEXTO],
    ['borde sobre cabecera (pm-400 / am-300)', PM[400], p[300], SEPARADOR],
    // Añadidos respecto al lint vigente, y a propósito: el degradado de Hoy
    // termina en `am-100` y el héroe escribe encima. Hoy ese par vive entre los
    // informativos porque el lavanda no llega a AAA; una paleta cálida sí puede,
    // así que aquí se exige en lugar de heredar la excepción.
    ['cuerpo sobre horizonte (am-100)', TEXTO.ink, p[100], CUERPO],
    ['secundario sobre horizonte (am-100)', TEXTO.soft, p[100], CUERPO],
    ['cuerpo sobre firma (am-200)', TEXTO.ink, p[200], CUERPO],
  ]
}

/** Distancia de tono, para saber si la propuesta se confunde con Formia. */
function matiz(hex) {
  const [r, g, b] = aRGB(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  const d = max - min
  const h =
    max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return Math.round((h * 60 + 360) % 360)
}

/** Croma (saturación HSL). Formia·AM es arena apagada; el amanecer puede
 *  distinguirse por ser luminoso, no solo por el tono. */
function croma(hex) {
  const [r, g, b] = aRGB(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return 0
  return Math.round((100 * (max - min)) / (1 - Math.abs(2 * l - 1)))
}

// Lo que Formia pinta de verdad (tokens-formia.css), no lo que declara:
//   AM → base #F7F2E9 · cabecera #E8D9C4 · acento/borde #B45A2B
//   PM → base #F7F2E9 · cabecera #FFC29C · borde #5D4766
const FORMIA_AM = { 50: '#F7F2E9', 200: '#E8D9C4', 400: '#FFC29C', 500: '#E9A387' }

console.log('🌅 exploración: paletas alternas para Lumia·Mañana\n')

const veredictos = {}

Object.entries(PALETAS).forEach(([clave, p]) => {
  console.log(`── ${p.nombre} ─────────────────────────────────`)
  console.log(
    `   50 ${p[50]}   100 ${p[100]}   200 ${p[200]}   300 ${p[300]}\n`,
  )
  let fallos = 0
  paresDe(p).forEach(([nombre, frente, fondo, umbral]) => {
    const medido = ratio(frente, fondo)
    const pasa = medido >= umbral
    if (!pasa) fallos += 1
    console.log(
      `   ${pasa ? '✅' : '❌'} ${nombre.padEnd(42)} ${medido.toFixed(2)}:1  (mín ${umbral}:1)`,
    )
  })
  veredictos[clave] = fallos
  console.log(
    `   ${fallos === 0 ? '✅ APTA' : `❌ DESCARTADA — ${fallos} par(es) bajo umbral`}\n`,
  )
})

// ─── Distancia con Formia·Mañana ──────────────────────────────────────────────
// Formia·AM ya es cálida (#F7F2E9 / #E8D9C4 / #FFC29C / #E9A387). El riesgo real
// de llevar Lumia·AM al naranja no es el contraste: es que los dos espacios
// dejen de distinguirse a las ocho de la mañana, que es justo cuando §6.1 pide
// que se distingan.
console.log('── ¿Se distingue de Formia? ────────────────────────────────────\n')
const ficha = (etiqueta, hex) =>
  `${etiqueta.padEnd(22)} ${hex}  matiz ${String(matiz(hex)).padStart(3)}°  croma ${String(croma(hex)).padStart(3)}%`
console.log(`   ${ficha('Formia·AM cabecera', FORMIA_AM[200])}`)
console.log(`   ${ficha('Formia·PM cabecera', FORMIA_AM[400])}`)
console.log()
Object.entries(PALETAS).forEach(([clave, p]) => {
  console.log(`   ${ficha(`${clave} cabecera (300)`, p[300])}   Δmatiz vs Formia·AM ${Math.abs(matiz(p[300]) - matiz(FORMIA_AM[200]))}°`)
  console.log(`   ${ficha(`${clave} horizonte (100)`, p[100])}   Δmatiz vs Formia·PM ${Math.abs(matiz(p[100]) - matiz(FORMIA_AM[400]))}°`)
})
console.log(
  '\n   Nota: la base (am-50 / formia-am-50) ya es casi la misma hoy —\n' +
    `   Lumia ${PALETAS.vigente[50]} vs Formia ${FORMIA_AM[50]}—, así que la\n` +
    '   diferenciación entre espacios no la sostiene la base sino la cabecera,\n' +
    `   el degradado y el acento (Lumia ${PM[500]} morado / Formia #B45A2B óxido).`,
)

console.log()
const aptas = Object.entries(veredictos).filter(([k, f]) => k !== 'vigente' && f === 0)
if (aptas.length === 0) {
  console.error('❌ ninguna propuesta llega a AAA. No hay nada que enseñar.\n')
  process.exit(1)
}
console.log(`✅ ${aptas.length} propuesta(s) apta(s): ${aptas.map(([k]) => k).join(', ')}\n`)
