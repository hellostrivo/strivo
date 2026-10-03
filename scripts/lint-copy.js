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
// Las listas viven en `src/lib/lexico.js` desde SPEC_28.1: el validador de Una
// pausa las aplica también, y una segunda copia envejecería distinta. Aquí se
// sigue aplicando FORBIDDEN a todo `src/`, línea a línea, y CLINICO solo al
// namespace `respiracion` (SPEC_13 §7.1). Por qué no puede ir más allá está
// escrito junto a la lista.
const LEXICO = 'src/lib/lexico.js'
const { FORBIDDEN, CLINICO } = await import(`../${LEXICO}`)

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

// Los archivos de los que el recorrido línea a línea solo revisa la prosa. Son
// los que se revisan por entrada y el propio léxico, cuyos datos son los
// patrones: `¡Felicidades!` está escrito ahí literal porque es lo que se busca.
const SOLO_PROSA = new Set([...POR_ENTRADA, LEXICO])

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
  const soloProsa = SOLO_PROSA.has(filePath)

  lines.forEach((line, i) => {
    // En los archivos que se revisan por entrada, aquí solo pasa la prosa. Los
    // datos los revisa `checkFrases`, que sabe distinguir una cita de una
    // original; esta pasada no lo sabría sin adivinar a qué entrada pertenece
    // cada línea. En el léxico, los datos son los patrones mismos.
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
