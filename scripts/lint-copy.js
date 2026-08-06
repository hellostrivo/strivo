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

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const lines   = content.split('\n')

  lines.forEach((line, i) => {
    if (isComment(line)) return
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

console.log('🔍 strivo-voice: verificando léxico prohibido en src/...\n')
walkDir('./src')

if (issues === 0) {
  console.log('✅ strivo-voice: léxico limpio. Todo en orden.\n')
  process.exit(0)
} else {
  console.error(`\n⚠️  strivo-voice: ${issues} problema(s) encontrado(s). Revisa antes de comitear.\n`)
  process.exit(1)
}
