#!/usr/bin/env node
// scripts/lint-copy.js
// Valida que no haya léxico prohibido en archivos src/
// Skill: strivo-voice (§3.6.2–3.6.3, Blueprint v3)
//
// Cómo correr: node scripts/lint-copy.js
// O: npm run lint:copy

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// ─── Léxico prohibido ─────────────────────────────────────────────────────────
const FORBIDDEN = [
  { pattern: /\bfallaste\b/gi,      reason: 'Lenguaje de castigo (§3.6.2)' },
  { pattern: /\bincumpliste\b/gi,   reason: 'Lenguaje de castigo (§3.6.2)' },
  { pattern: /\babandonaste\b/gi,   reason: 'Lenguaje de castigo (§3.6.2)' },
  { pattern: /\bracha\b/gi,         reason: 'Usar "Constancia" en su lugar (§3.6.3)' },
  { pattern: /\bstreak\b/gi,        reason: 'Usar "Constancia" en su lugar (§3.6.3)' },
  { pattern: /\bdeber[íi]as?\b/gi,  reason: 'Lenguaje prescriptivo prohibido (§3.6.2)' },
  { pattern: /\btendr[íi]as?\b/gi,  reason: 'Lenguaje prescriptivo prohibido (§3.6.2)' },
  { pattern: /\bfallaste\b/gi,      reason: 'Lenguaje de castigo (§3.6.2)' },
  { pattern: /¡Felicidades!/gi,     reason: 'Exclamación innecesaria (§3.6)' },
  { pattern: /¡Muy bien!/gi,        reason: 'Exclamación innecesaria (§3.6)' },
  { pattern: /días\s+seguidos/gi,   reason: 'Usar "días contigo" en su lugar (§5.9)' },
  // SPEC_13 §7.1 — Vocabulario de rendimiento. Nunca es la voz de nadie: no hay
  // emoción que se llame así ni persona que lo escriba de sí misma.
  { pattern: /\bproductividad\b/gi, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { pattern: /\bmaximiz[a-záéíóú]*\b/gi, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { pattern: /\btrastorno\b/gi,     reason: 'Registro clínico: Strivo no diagnostica (SPEC_13 §7.1)' },
]

// ─── Voz de Respiración (SPEC_13 §7.1) ────────────────────────────────────────
// El resto del léxico clínico **no puede revisarse sobre todo `src/`**, y no es
// una concesión: `copy.diario.journal` ofrece "Con ansiedad" como emoción del
// catálogo de días difíciles (SPEC_07), y `TEMAS_DE_RENDIMIENTO` es maquinaria
// de SPEC_05. Prohibir esas palabras en todo el árbol rompería el build por un
// motivo equivocado — el mismo caso que "Seguro/Segura" con el PIN, que SPEC_07
// resolvió con una prueba en vez de con este script.
//
// §7.1 es una sección sobre la voz **del namespace `respiracion`**, así que ahí
// es donde se aplica: se recorre el objeto ya construido, hoja por hoja. Sin
// comentarios de por medio y sin tocar los otros namespaces, la comprobación es
// exacta en vez de aproximada.
const CLINICO = [
  { pattern: /\bansiedad\b/i,        reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\bansios[ao]s?\b/i,    reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\bestr[ée]s\b/i,       reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\bp[áa]nico\b/i,       reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\bterap[a-záéíóú]*\b/i, reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\btrastorno\b/i,       reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\bcura[a-záéíóú]*\b/i, reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\btratamiento\b/i,     reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\bs[íi]ntoma[a-záéíóú]*\b/i, reason: 'Registro clínico (SPEC_13 §7.1)' },
  { pattern: /\brendimiento\b/i,     reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { pattern: /\boptimiz[a-záéíóú]*\b/i, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { pattern: /\bproductividad\b/i,   reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  { pattern: /\bmaximiz[a-záéíóú]*\b/i, reason: 'Vocabulario de rendimiento (SPEC_13 §7.1)' },
  // Regla heredada de P2A. El neutro se consigue por redacción.
  { pattern: /\belle\b/i,            reason: 'Neutro por redacción, no con "elle" (SPEC_13 §7.1)' },
]

// ─── Archivos que se revisan por entrada, no por línea ────────────────────────
// El repertorio de frases del día son datos, no prosa: la mitad de sus entradas
// son citas textuales en dominio público. Reescribir a Bécquer para que pase el
// léxico lo dejaría de ser una cita, así que su texto se exime **por tipo** —lo
// decide `revisablesDe`, que vive junto a los datos— y no relajando ninguna
// regla para el resto de `src/`.
//
// Es el mismo movimiento que `checkRespiracion` hace unas líneas más abajo:
// donde una comprobación por línea sería aproximada, se recorre el módulo ya
// construido y se revisa lo que toca. La prosa del archivo —sus comentarios—
// sigue revisándose línea a línea: lo que escribimos nosotros no se exime.
const POR_ENTRADA = new Set(['src/content/frases-del-dia.js'])

// Extensiones a revisar (excluye assets, binarios, etc.)
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md']

// Carpetas a excluir.
// `__tests__` queda fuera desde SPEC_06: las pruebas que comprueban que el
// léxico prohibido NO aparece tienen que poder nombrarlo. Lo que se revisa aquí
// es el copy que alguien va a leer en pantalla.
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'scripts', '__tests__']

let issues = 0

function esComentario(linea) {
  const limpia = linea.trimStart()
  return limpia.startsWith('//') || limpia.startsWith('/*') || limpia.startsWith('*')
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const lines   = content.split('\n')
  const soloProsa = POR_ENTRADA.has(filePath)

  lines.forEach((line, i) => {
    // En los archivos que se revisan por entrada, aquí solo pasa la prosa. Los
    // datos los revisa `checkFrases`, que sabe distinguir una cita de una
    // original; esta pasada no lo sabría sin adivinar a qué entrada pertenece
    // cada línea.
    if (soloProsa && !esComentario(line)) return
    FORBIDDEN.forEach(({ pattern, reason }) => {
      if (pattern.test(line)) {
        console.error(`❌ [strivo-voice] ${filePath}:${i + 1}`)
        console.error(`   Línea: ${line.trim()}`)
        console.error(`   Razón: ${reason}`)
        console.error()
        issues++
        pattern.lastIndex = 0  // reset regex global
      }
    })
  })
}

function walkDir(dir) {
  readdirSync(dir).forEach(file => {
    const full = join(dir, file)
    if (EXCLUDE_DIRS.includes(file)) return
    if (statSync(full).isDirectory()) {
      walkDir(full)
    } else if (EXTENSIONS.includes(extname(file))) {
      checkFile(full)
    }
  })
}

function checkRespiracion(nodo, ruta) {
  if (typeof nodo === 'string') {
    CLINICO.forEach(({ pattern, reason }) => {
      if (pattern.test(nodo)) {
        console.error(`❌ [strivo-voice] copy.${ruta}`)
        console.error(`   Cadena: ${nodo}`)
        console.error(`   Razón: ${reason}`)
        console.error()
        issues++
      }
    })
    return
  }
  if (nodo === null || typeof nodo !== 'object') return
  Object.entries(nodo).forEach(([clave, valor]) => checkRespiracion(valor, `${ruta}.${clave}`))
}

/**
 * El repertorio del día, entrada por entrada. Qué se revisa de cada una lo
 * decide `revisablesDe` en `src/content/frases-del-dia.js`, que es el único
 * sitio donde vive esa regla.
 */
function checkFrases(frases, revisablesDe) {
  frases.forEach((frase) => {
    revisablesDe(frase).forEach((cadena) => {
      FORBIDDEN.forEach(({ pattern, reason }) => {
        if (pattern.test(cadena)) {
          console.error(`❌ [strivo-voice] frases-del-dia · ${frase.id} (${frase.tipo})`)
          console.error(`   Cadena: ${cadena.replace(/\n/g, ' / ')}`)
          console.error(`   Razón: ${reason}`)
          console.error()
          issues++
          pattern.lastIndex = 0  // reset regex global
        }
      })
    })
  })
}

console.log('🔍 strivo-voice: verificando léxico prohibido en src/...\n')
walkDir('./src')

const { copy } = await import('../src/copy/index.js')
if (copy.respiracion === undefined) {
  console.error('❌ [strivo-voice] Falta el namespace `respiracion` en copy/index.js.\n')
  issues++
} else {
  checkRespiracion(copy.respiracion, 'respiracion')
}

const { FRASES, revisablesDe } = await import('../src/content/frases-del-dia.js')
checkFrases(FRASES, revisablesDe)

if (issues === 0) {
  console.log('✅ strivo-voice: léxico limpio. Todo en orden.\n')
  process.exit(0)
} else {
  console.error(`\n⚠️  strivo-voice: ${issues} problema(s) encontrado(s). Revisa antes de comitear.\n`)
  process.exit(1)
}
