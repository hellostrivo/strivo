// Criterios 2 y 12 de SPEC_28.1: lo que el modelo no puede usar, y que se puede
// cargar desde Node sin Vite.
import { execFileSync } from 'child_process'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

/** Los archivos fuente de una carpeta, sin pruebas. */
function fuentes(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : fuentes(ruta)
    return /\.(js|jsx)$/.test(nombre) ? [ruta] : []
  })
}

describe('criterio 2: nadie en Una pausa lee la hora local', () => {
  it('ningún archivo de src/unaPausa usa los métodos locales de Date', () => {
    const local = /\b(getDay|getHours|getDate|getMonth|getFullYear)\(/
    const culpables = fuentes('src/unaPausa').filter((r) => local.test(readFileSync(r, 'utf8')))
    expect(culpables).toEqual([])
  })

  it('la prueba ve los archivos que tiene que ver', () => {
    expect(fuentes('src/unaPausa').sort()).toEqual([
      'src/unaPausa/modelo/capsula.js',
      'src/unaPausa/modelo/estados.js',
      'src/unaPausa/modelo/semana.js',
      'src/unaPausa/modelo/validar.js',
      'src/unaPausa/modelo/vigente.js',
    ])
  })
})

describe('criterio 12: lógica pura, cargable desde Node', () => {
  const MODELO = fuentes('src/unaPausa/modelo')

  it('ningún archivo del modelo importa con alias ni importa react', () => {
    for (const ruta of MODELO) {
      const codigo = readFileSync(ruta, 'utf8')
      const imports = [...codigo.matchAll(/(?:from|import\()\s*'([^']+)'/g)].map((m) => m[1])
      for (const destino of imports) {
        expect(`${ruta}: ${destino}`).toMatch(/: \.{1,2}\/.+\.js$/)
        expect(destino).not.toMatch(/^@|react/)
      }
    }
  })

  it('un script de Node fuera de Vite lo carga por su ruta relativa', () => {
    const script = `
      const { validar } = await import('./src/unaPausa/modelo/validar.js')
      const { capsulaVigente } = await import('./src/unaPausa/modelo/vigente.js')
      const { lunesDe } = await import('./src/unaPausa/modelo/semana.js')
      const { puedeTransitar } = await import('./src/unaPausa/modelo/estados.js')
      const { URL_CANAL } = await import('./src/unaPausa/modelo/capsula.js')
      console.log(JSON.stringify({
        faltas: validar({ status: 'borrador', title: 'Calma!' }).faltas,
        vigente: capsulaVigente([], '2026-10-12T00:00:00-06:00'),
        lunes: lunesDe('2026-10-11T23:59:59-06:00'),
        ia: puedeTransitar('borrador', 'en_revision', 'ia'),
        canal: URL_CANAL,
      }))
    `
    const salida = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      encoding: 'utf8',
      env: { ...process.env, TZ: 'Asia/Tokyo', NODE_NO_WARNINGS: '1' },
    })
    expect(JSON.parse(salida)).toEqual({
      faltas: [{ codigo: 'lexico.exclamacion', campo: 'title' }],
      vigente: null,
      lunes: '2026-10-05',
      ia: false,
      canal: 'https://contenido.hellostrivo.com/una-pausa/feed.json',
    })
  })
})
