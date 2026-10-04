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
      'src/unaPausa/canal/cache.js',
      'src/unaPausa/canal/leer.js',
      'src/unaPausa/modelo/canal.js',
      'src/unaPausa/modelo/capsula.js',
      'src/unaPausa/modelo/estados.js',
      'src/unaPausa/modelo/portada.js',
      'src/unaPausa/modelo/semana.js',
      'src/unaPausa/modelo/validar.js',
      'src/unaPausa/modelo/vigente.js',
      'src/unaPausa/useUnaPausa.js',
    ])
  })
})

// SPEC_28.3 §4.3, criterio 5 — Una pausa no toca el árbol del usuario. Su caché
// es una base aparte, `strivo-contenido`, con contenido público: no entra en la
// cola, no se exporta, no se restaura y no se borra al salir. La forma de
// garantizarlo es que ningún archivo de la sección pueda alcanzar la capa que
// hace esas cuatro cosas, ni Firebase, ni las otras dos secciones.
describe('criterio 5 de 28.3: Una pausa no alcanza el árbol del usuario', () => {
  const PROHIBIDOS = [
    /(^|\/)lib\/db(\/|$)/,
    /^@\/lib\/db|^@lib\/db/,
    /firebase/i,
    /firestore/i,
    /(^|\/)diario(\/|\.js$|$)/,
    /(^|\/)breathing(\/|\.js$|$)/,
  ]

  /** Los destinos de todos los import, estáticos y dinámicos. */
  const destinos = (codigo) =>
    [...codigo.matchAll(/(?:from|import\()\s*['"]([^'"]+)['"]/g)].map((m) => m[1])

  it('ningún archivo de src/unaPausa importa lib/db, firebase, firestore, diario/ ni breathing/', () => {
    const culpables = fuentes('src/unaPausa').flatMap((ruta) =>
      destinos(readFileSync(ruta, 'utf8'))
        .filter((d) => PROHIBIDOS.some((p) => p.test(d)))
        .map((d) => `${ruta}: ${d}`),
    )
    expect(culpables).toEqual([])
  })

  it('la prueba muerde: los patrones atrapan las formas que se escriben', () => {
    for (const d of [
      '@/lib/db',
      '@lib/db/local',
      '../../lib/db/sync.js',
      'firebase/firestore',
      '@/lib/firebase',
      '@/diario/noche',
      '../diario.js',
      '@/breathing/Respiracion',
    ]) {
      expect(
        PROHIBIDOS.some((p) => p.test(d)),
        d,
      ).toBe(true)
    }
    expect(PROHIBIDOS.some((p) => p.test('idb'))).toBe(false)
  })

  it('el nombre strivo-contenido solo aparece en la caché', () => {
    const todos = fuentes('src').filter((r) => readFileSync(r, 'utf8').includes('strivo-contenido'))
    expect(todos).toEqual(['src/unaPausa/canal/cache.js'])
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
      const { generarCanal } = await import('./src/unaPausa/modelo/canal.js')
      const { revisarPortada } = await import('./src/unaPausa/modelo/portada.js')
      console.log(JSON.stringify({
        faltas: validar({ id: 'calma', status: 'borrador', title: 'Calma!' }).faltas,
        vigente: capsulaVigente([], '2026-10-12T00:00:00-06:00'),
        lunes: lunesDe('2026-10-11T23:59:59-06:00'),
        ia: puedeTransitar('borrador', 'en_revision', 'ia'),
        canal: URL_CANAL,
        feed: generarCanal([], '2026-10-11T23:59:59-06:00'),
        portada: revisarPortada(new Uint8Array(4)),
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
      feed: { formato: 1, semana: '2026-10-05', vigente: null, archivo: [] },
      portada: [{ codigo: 'portada.formato', campo: 'coverAsset' }],
    })
  })
})
