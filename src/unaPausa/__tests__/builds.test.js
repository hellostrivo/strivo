// SPEC_28.2 §4.6 y criterio 13 (5.8) — lo que cada build deja, sin correr
// ningún build: se lee la configuración que lo decide. Los dos builds de verdad
// se corren a mano al cerrar la entrega.
//
// Lo que se protege: el build de producción de la app no genera nada del canal
// y no arrastra `scripts/` ni `contenido/`; el canal lo construye el sitio de
// `canal/`, y la vista previa solo el contexto `branch-deploy`.
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

/** Lo justo de TOML para estos dos archivos: tablas, arreglos de tablas y cadenas. */
function toml(texto) {
  const raiz = {}
  let actual = raiz
  for (const cruda of texto.split('\n')) {
    const linea = cruda.replace(/\s+#.*$/, '').trim()
    if (linea === '' || linea.startsWith('#')) continue
    let m = /^\[\[(.+)\]\]$/.exec(linea)
    if (m) {
      ;(raiz[m[1]] ??= []).push((actual = {}))
      continue
    }
    m = /^\[(.+)\]$/.exec(linea)
    if (m) {
      actual = m[1].split('.').reduce((nodo, p) => {
        if (Array.isArray(nodo[p])) return nodo[p].at(-1)
        return (nodo[p] ??= {})
      }, raiz)
      continue
    }
    m = /^([\w-]+)\s*=\s*"(.*)"$/.exec(linea)
    if (m) actual[m[1]] = m[2]
  }
  return raiz
}

const leer = (ruta) => readFileSync(ruta, 'utf8')
const { scripts } = JSON.parse(leer('package.json'))
const app = toml(leer('netlify.toml'))
const canal = toml(leer('canal/netlify.toml'))
const cabeceras = (config, ruta) => config.headers.find((h) => h.for === ruta)?.values

describe('el build de producción de la app no cambia', () => {
  it('package.json: build sigue siendo vite build, sin el script del canal', () => {
    expect(scripts.build).toBe('vite build')
  })

  it('netlify.toml: el [build] de producción es el de siempre', () => {
    expect(app.build).toEqual({ command: 'npm run build', publish: 'dist' })
  })

  it('la regla de /* sigue intacta, y la de /una-pausa/* va después', () => {
    expect(cabeceras(app, '/*')['Cache-Control']).toBe('public, max-age=31536000, immutable')
    const orden = app.headers.map((h) => h.for)
    expect(orden.indexOf('/una-pausa/*')).toBeGreaterThan(orden.indexOf('/*'))
    expect(cabeceras(app, '/una-pausa/*')).toEqual({ 'Cache-Control': 'public, max-age=300' })
  })

  it('nada de scripts/ ni de contenido/ puede acabar en dist/', () => {
    // Vite copia `public/` tal cual y empaqueta lo que `src/` importa.
    expect(leer('vite.config.js')).not.toMatch(/publicDir/)
    const publico = existsSync('public') ? readdirSync('public') : []
    for (const nombre of ['una-pausa', 'contenido', 'scripts']) {
      expect(publico).not.toContain(nombre)
    }
    const fuentes = (dir) =>
      readdirSync(dir).flatMap((n) => {
        const ruta = join(dir, n)
        if (statSync(ruta).isDirectory()) return n === '__tests__' ? [] : fuentes(ruta)
        return /\.(js|jsx)$/.test(n) ? [ruta] : []
      })
    const culpables = fuentes('src').filter((r) =>
      /from\s+'[./]*(scripts|contenido)\//.test(leer(r)),
    )
    expect(culpables).toEqual([])
  })
})

describe('la vista previa, solo en los deploys de rama (DP-28.16)', () => {
  it('build:vista-previa corre el script después de vite build, que vacía dist/', () => {
    expect(scripts['build:vista-previa']).toBe(
      'vite build && node scripts/publicar-pausa.js --vista-previa --salida dist',
    )
  })

  it('el contexto branch-deploy la usa, con la URL del canal en el mismo origen', () => {
    expect(app.context['branch-deploy']).toEqual({
      command: 'npm run build:vista-previa',
      environment: { VITE_URL_CANAL: '/una-pausa/feed.json' },
    })
  })

  it('ningún otro contexto la usa', () => {
    expect(Object.keys(app.context)).toEqual(['branch-deploy'])
    expect(leer('netlify.toml').match(/--vista-previa|build:vista-previa/g)).toHaveLength(1)
  })

  it('npm run canal es el script, sin argumentos', () => {
    expect(scripts.canal).toBe('node scripts/publicar-pausa.js')
  })
})

describe('el sitio del canal (DP-28.3)', () => {
  it('construye solo el canal, en canal/dist, con Node 20', () => {
    expect(canal.build).toEqual({
      command: 'node scripts/publicar-pausa.js --salida canal/dist',
      publish: 'canal/dist',
      environment: { NODE_VERSION: '20' },
    })
  })

  it('nunca la vista previa ni --ahora', () => {
    expect(leer('canal/netlify.toml')).not.toMatch(/--vista-previa|--ahora/)
  })

  it('caché corta y CORS abierto en /una-pausa/*', () => {
    expect(cabeceras(canal, '/una-pausa/*')).toEqual({
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    })
  })

  it('canal/dist no se versiona', () => {
    expect(leer('.gitignore').split('\n')).toContain('canal/dist/')
  })
})
