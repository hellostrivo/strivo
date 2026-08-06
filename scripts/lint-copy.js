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
]

// ─── Lenguaje adaptativo por género (§2.5 del documento de cambios) ──────────
// Solo se aplican a la biblioteca de copy: fuera de ahí la "@" es un alias de
// importación (@copy, @lib) y la "x" es una variable cualquiera.
const COPY_FILE = 'src/copy/index.js'

const FORBIDDEN_IN_COPY = [
  {
    pattern: /\belles?\b/gi,
    reason: 'El pronombre "elle" no se usa en ninguna variante (§2.5.1)',
  },
  {
    pattern: /[a-záéíóúñ]+@s?\b/gi,
    reason: 'La "@" no se usa como marca de género (§2.5.2)',
  },
  {
    pattern: /\b(?:nosotr|vosotr|ell|amig|chic|niñ|tod)[xs]s?\b/gi,
    reason: 'La "x" no se usa como marca de género (§2.5.2)',
  },
  {
    pattern: /\b(?:todes|nosotres|vosotres|amigues|chiques|niñes|bienvenides|listes)\b/gi,
    reason: 'La "e" inclusiva no se usa como marca de género (§2.5.2)',
  },
]

// Extensiones a revisar (excluye assets, binarios, etc.)
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md']

// Carpetas a excluir
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'scripts']

let issues = 0

// Los comentarios se saltan: lo que se valida es lo que la persona lee en
// pantalla, y varias notas del código nombran el léxico prohibido justamente
// para recordar que no se usa ("NUNCA: días seguidos"). Marcarlas convertía el
// linter en ruido y lo dejaba siempre en rojo.
const isComment = line => /^\s*(\/\/|\/\*|\*|#)/.test(line)

function report(filePath, lineNumber, line, reason) {
  console.error(`❌ [strivo-voice] ${filePath}:${lineNumber}`)
  console.error(`   Línea: ${line.trim()}`)
  console.error(`   Razón: ${reason}`)
  console.error()
  issues++
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const lines   = content.split('\n')
  const reglas  = filePath.endsWith(COPY_FILE)
    ? [...FORBIDDEN, ...FORBIDDEN_IN_COPY]
    : FORBIDDEN

  lines.forEach((line, i) => {
    if (isComment(line)) return
    reglas.forEach(({ pattern, reason }) => {
      if (pattern.test(line)) {
        report(filePath, i + 1, line, reason)
        pattern.lastIndex = 0  // reset regex global
      }
    })
  })
}

// ─── Forma de las variantes de género (§2.3) ─────────────────────────────────
// Una entrada con variantes declara las tres: sin `n` no habría qué mostrarle a
// quien no contestó, y sin `m` o `f` la mitad de la gente leería la neutra.
async function checkVariantes() {
  const { copy } = await import('../src/copy/index.js')

  const recorrer = (node, path) => {
    if (!node || typeof node !== 'object') return

    const claves = Object.keys(node)
    const tieneAlguna = ['m', 'f', 'n'].some(k => claves.includes(k))
    const tieneTodas  = ['m', 'f', 'n'].every(k => typeof node[k] === 'string')

    if (tieneAlguna && !tieneTodas) {
      console.error(`❌ [strivo-voice] copy.${path}`)
      console.error('   Razón: una entrada con variantes de género declara m, f y n (§2.3)')
      console.error()
      issues++
      return
    }
    if (tieneTodas) return

    for (const clave of claves) {
      recorrer(node[clave], path ? `${path}.${clave}` : clave)
    }
  }

  recorrer(copy, '')
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

console.log('🔍 strivo-voice: verificando léxico prohibido en src/...\n')
walkDir('./src')
await checkVariantes()

if (issues === 0) {
  console.log('✅ strivo-voice: léxico limpio. Todo en orden.\n')
  process.exit(0)
} else {
  console.error(`\n⚠️  strivo-voice: ${issues} problema(s) encontrado(s). Revisa antes de comitear.\n`)
  process.exit(1)
}
