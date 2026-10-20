#!/usr/bin/env node
// scripts/validar-frases.js
// Valida el catálogo de frases del día v2 (SPEC_29 §14).
//
// Cómo correr: node scripts/validar-frases.js  (o `npm run validar:frases`)
//
// Falla —sale con 1— si encuentra:
//   · metadatos faltantes o fuera de catálogo, ids repetidos;
//   · frases de más de 150 caracteres, en verso, con léxico prohibido o con
//     exclamaciones; originales con comillas o con atribución;
//   · referencias religiosas o espirituales en lo universal o lo secular, o de
//     una tradición concreta en lo espiritual general o en otra tradición;
//   · duplicados o casi duplicados después de normalizar;
//   · citas sin atribución, sin expediente en `docs/frases-v2-fuentes.md`, o
//     aprobadas sin las dos firmas;
//   · cualquier perfil posible con menos de 500 frases elegibles, o con menos
//     de 100 en alguno de los cinco temas.
//
// Informa, sin fallar, de la proporción de citas de cada perfil: la meta
// editorial es 25–35 % y depende de que haya citas aprobadas.
//
// Las reglas viven en `src/content/frases-v2/validacion.js`; las pruebas las
// usan igual. Aquí solo se leen los archivos y se imprime.

import { readFileSync } from 'fs'

const { FRASES_V2 } = await import('../src/content/frases-v2/index.js')
const {
  PROPORCION_DE_CITAS,
  coberturaPorPerfil,
  problemasDeCobertura,
  problemasDeDuplicados,
  problemasDeEntradas,
  problemasDeFuentes,
} = await import('../src/content/frases-v2/validacion.js')

const documento = readFileSync('./docs/frases-v2-fuentes.md', 'utf8')

const problemas = [
  ...problemasDeEntradas(FRASES_V2),
  ...problemasDeDuplicados(FRASES_V2),
  ...problemasDeFuentes(FRASES_V2, documento),
  ...problemasDeCobertura(FRASES_V2),
]

console.log('🔍 frases v2: validando el catálogo...\n')

const porEstado = FRASES_V2.reduce((cuenta, f) => {
  cuenta[f.estado] = (cuenta[f.estado] ?? 0) + 1
  return cuenta
}, {})
console.log(
  `   ${FRASES_V2.length} entradas · ` +
    Object.entries(porEstado)
      .map(([estado, n]) => `${n} ${estado}`)
      .join(' · '),
)
console.log()
console.log('   Perfil                                         Elegibles   Citas')
for (const perfil of coberturaPorPerfil(FRASES_V2)) {
  const marca = perfil.ok ? '✓' : '✗'
  const proporcion = `${Math.round(perfil.proporcionCitas * 100)} %`
  console.log(
    `   ${marca} ${perfil.clave.padEnd(44)} ${String(perfil.total).padStart(9)}   ${proporcion.padStart(5)}`,
  )
}
const fueraDeMeta = coberturaPorPerfil(FRASES_V2).filter(
  (p) => p.proporcionCitas < PROPORCION_DE_CITAS.min || p.proporcionCitas > PROPORCION_DE_CITAS.max,
)
if (fueraDeMeta.length > 0) {
  console.log(
    `\n   ℹ️  ${fueraDeMeta.length} perfil(es) fuera de la meta de citas ` +
      `(${PROPORCION_DE_CITAS.min * 100}–${PROPORCION_DE_CITAS.max * 100} %). ` +
      'No bloquea: depende de aprobar citas (docs/frases-v2-fuentes.md).',
  )
}
console.log()

if (problemas.length === 0) {
  console.log('✅ frases v2: catálogo en orden.\n')
  process.exit(0)
}

for (const p of problemas) {
  console.error(`❌ ${p.id} · ${p.regla}${p.detalle ? ` · ${p.detalle}` : ''}`)
}
console.error(`\n⚠️  frases v2: ${problemas.length} problema(s). Revisa antes de integrar.\n`)
process.exit(1)
