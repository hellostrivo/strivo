// SPEC_28.2 §4.4–4.5 — el script del canal, probado sobre lo que escribe.
//
// Cada prueba monta un repo de mentira en una carpeta temporal —cápsulas y
// portadas— y llama a `publicar` sin lanzar procesos. Solo el último bloque
// lanza el script de verdad, sobre el `contenido/` real del repo, que está
// vacío (§4.5).
import { execFileSync } from 'child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import { AMPLIADO, CLINICO, FORBIDDEN } from '../../lib/lexico.js'
import { CAMPOS_PUBLICOS, CAMPOS_PUBLICOS_DE_FUENTE } from '../modelo/canal.js'
import { CODIGOS, IDS_DE_PROMESA, PREFIJOS } from '../modelo/validar.js'
import { enEstado, programada, reserva } from '../modelo/__tests__/capsulas.js'
import { webp } from '../modelo/__tests__/webp.js'
import {
  CAPSULAS,
  CODIGOS_DEL_SCRIPT,
  PORTADAS,
  codigoDeSalida,
  informe,
  leerArgumentos,
  lineaDe,
  mensajeDe,
  publicar,
} from '../../../scripts/publicar-pausa.js'

const lunes = (clave, hora = '00:00:00') => `${clave}T${hora}-06:00`
const BUENA = webp('VP8 ', 1600, 1200)

const carpetas = []
afterAll(() => {
  for (const carpeta of carpetas) rmSync(carpeta, { recursive: true, force: true })
})

/**
 * Un repo de mentira con esas cápsulas y esas portadas. `capsulas` es una lista
 * de cápsulas (se guardan como `<id>.json`) o de pares `[nombre, contenido]`
 * para escribir un archivo a mano. Por defecto trae `espacio.webp`, la portada
 * de las cápsulas de ejemplo.
 */
function repo(capsulas = [], portadas = { 'espacio.webp': BUENA }) {
  const raiz = mkdtempSync(join(tmpdir(), 'una-pausa-'))
  carpetas.push(raiz)
  mkdirSync(join(raiz, CAPSULAS), { recursive: true })
  mkdirSync(join(raiz, PORTADAS), { recursive: true })
  for (const c of capsulas) {
    const [nombre, contenido] = Array.isArray(c) ? c : [`${c.id}.json`, JSON.stringify(c, null, 2)]
    writeFileSync(join(raiz, CAPSULAS, nombre), contenido)
  }
  for (const [nombre, bytes] of Object.entries(portadas)) {
    writeFileSync(join(raiz, PORTADAS, nombre), bytes)
  }
  return raiz
}

const correr = (raiz, ahora, opciones = {}) =>
  publicar({ raiz, salida: 'dist', ahora, ...opciones })
const feed = (raiz) => readFileSync(join(raiz, 'dist/una-pausa/feed.json'), 'utf8')
const portadasEscritas = (raiz) => readdirSync(join(raiz, 'dist/una-pausa/portadas')).sort()
const codigos = (lista) => lista.map((f) => f.codigo)

describe('criterio 9: con contenido/ vacío', () => {
  it('el canal vacío, y ok', () => {
    const raiz = repo([], {})
    const r = correr(raiz, lunes('2026-12-09', '12:00:00'))
    expect(r.ok).toBe(true)
    expect(r.faltas).toEqual([])
    expect(JSON.parse(feed(raiz))).toEqual({
      formato: 1,
      semana: '2026-12-07',
      vigente: null,
      archivo: [],
    })
    expect(portadasEscritas(raiz)).toEqual([])
  })

  it('JSON con dos espacios y salto de línea final', () => {
    const raiz = repo([], {})
    correr(raiz, lunes('2026-12-07'))
    expect(feed(raiz)).toBe(
      '{\n  "formato": 1,\n  "semana": "2026-12-07",\n  "vigente": null,\n  "archivo": []\n}\n',
    )
  })

  it('solo lee *.json: el .gitkeep y lo demás no cuentan', () => {
    const raiz = repo(
      [
        ['.gitkeep', ''],
        ['notas.txt', 'hola'],
      ],
      {},
    )
    expect(correr(raiz, lunes('2026-12-07')).ok).toBe(true)
  })
})

describe('criterio 1: el lunes a las 00:00 de Monterrey', () => {
  const raiz = repo([programada('2026-10-12')])

  it('el domingo 23:59:59 no está; el lunes 00:00:00, sí', () => {
    expect(correr(raiz, '2026-10-11T23:59:59-06:00').canal.vigente).toBeNull()
    expect(JSON.parse(feed(raiz)).vigente).toBeNull()
    expect(correr(raiz, '2026-10-12T00:00:00-06:00').canal.vigente.id).toBe('c-2026-10-12')
    expect(JSON.parse(feed(raiz)).vigente.id).toBe('c-2026-10-12')
  })
})

describe('criterio 2: la lista blanca, sobre la salida', () => {
  /** Un centinela único por cápsula y por campo, en todo lo que es texto. */
  function conCentinela(c, marca) {
    const t = (campo) => `zq${marca}${campo.replace(/\W/g, '')}`
    return {
      ...c,
      theme: `${c.theme} ${t('theme')}`,
      title: `${c.title} ${t('title')}`,
      opening: `${c.opening} ${t('opening')}`,
      evidenceSummary: `${c.evidenceSummary} ${t('evidenceSummary')}`,
      keyFindings: c.keyFindings.map((k, i) => `${k} ${t(`keyFindings${i}`)}`),
      practiceLabel: `${c.practiceLabel} ${t('practiceLabel')}`,
      journalPrompt: `¿Qué espacio encontré ${t('journalPrompt')}?`,
      coverAltText: `${c.coverAltText} ${t('coverAltText')}`,
      coverAsset: `${marca}.webp`,
      sources: c.sources.map((f, i) => ({
        ...f,
        title: `${f.title} ${t(`sourceTitle${i}`)}`,
        authorsOrInstitution: `${f.authorsOrInstitution} ${t(`sourceAuthor${i}`)}`,
        originalUrl: `${f.originalUrl}/${t(`sourceUrl${i}`)}`,
      })),
    }
  }

  const ahora = lunes('2026-12-14', '09:00:00')
  const publicadas = [
    conCentinela(programada('2026-12-07', { id: 'pub-a' }), 'puba'),
    conCentinela(programada('2026-12-14', { id: 'pub-b' }), 'pubb'),
  ]
  const ocultas = [
    conCentinela(enEstado(programada('2026-12-21', { id: 'borr' }), 'borrador'), 'borr'),
    conCentinela(enEstado(programada('2026-12-21', { id: 'revi' }), 'en_revision'), 'revi'),
    conCentinela(enEstado(programada('2026-12-21', { id: 'prev' }), 'prevalidada'), 'prev'),
    conCentinela(enEstado(programada('2026-12-21', { id: 'apro' }), 'aprobada'), 'apro'),
    conCentinela(enEstado(programada('2026-12-21', { id: 'rech' }), 'rechazada'), 'rech'),
    conCentinela(programada('2026-12-21', { id: 'futu' }), 'futu'),
    conCentinela(programada('2026-12-28', { id: 'pilo', piloto: true }), 'pilo'),
  ]
  const todas = [...publicadas, ...ocultas]
  const portadas = Object.fromEntries(todas.map((c) => [c.coverAsset, BUENA]))
  const raiz = repo(todas, portadas)
  const r = correr(raiz, ahora)
  const escrito = feed(raiz)

  it('las publicadas salen, y sus centinelas con ellas', () => {
    expect(r.ok).toBe(true)
    expect(escrito).toContain('zqpubatitle')
    expect(escrito).toContain('zqpubbtitle')
  })

  it.each(['borr', 'revi', 'prev', 'apro', 'rech', 'futu', 'pilo'])(
    'ni un centinela de «%s»',
    (marca) => {
      expect(escrito).not.toContain(`zq${marca}`)
      expect(escrito).not.toContain(`${marca}.webp`)
    },
  )

  it('ningún campo fuera de la lista blanca, ni reviewed', () => {
    const canal = JSON.parse(escrito)
    const DERIVADOS = ['publicadaEl', 'fuentes', 'portada']
    for (const e of [canal.vigente, ...canal.archivo]) {
      for (const k of Object.keys(e)) expect([...CAMPOS_PUBLICOS, ...DERIVADOS]).toContain(k)
      for (const f of e.fuentes) {
        for (const k of Object.keys(f)) expect(CAMPOS_PUBLICOS_DE_FUENTE).toContain(k)
      }
      expect(Object.keys(e.portada).sort()).toEqual(['alt', 'src'])
    }
    expect(escrito).not.toContain('"reviewed')
    expect(escrito).not.toContain('fundadora')
  })

  it('en portadas/ solo están las de las publicadas', () => {
    expect(portadasEscritas(raiz)).toEqual(['puba.webp', 'pubb.webp'])
  })
})

describe('criterio 3: reserva y repetida, sobre feed.json', () => {
  const raiz = repo([programada('2026-12-07'), reserva('r', '2026-11-01')])

  it('la semana sin programada sirve la reserva', () => {
    correr(raiz, lunes('2026-12-14', '09:00:00'))
    const canal = JSON.parse(feed(raiz))
    expect(canal.vigente.id).toBe('r')
    expect(canal.vigente.publicadaEl).toBe('2026-12-14')
    expect(canal.archivo.map((e) => e.id)).toEqual(['c-2026-12-07'])
  })

  it('la siguiente, sin reserva libre, repite la anterior', () => {
    correr(raiz, lunes('2026-12-21', '09:00:00'))
    const canal = JSON.parse(feed(raiz))
    expect(canal.semana).toBe('2026-12-21')
    expect(canal.vigente.id).toBe('r')
    expect(canal.vigente.publicadaEl).toBe('2026-12-14')
    expect(canal.archivo.map((e) => e.id)).toEqual(['c-2026-12-07'])
  })
})

describe('criterio 4: una aprobada con «terapia» rompe; un borrador avisa', () => {
  const conTerapia = (status) =>
    enEstado(
      programada('2026-12-21', {
        id: 'hacer-espacio',
        keyFindings: ['Una pausa breve se asocia con calma.', 'Esto no sustituye una terapia.'],
      }),
      status,
    )
  const LINEA =
    'contenido/una-pausa/capsulas/hacer-espacio.json · keyFindings[1] · lexico.terapia — «terapia» no se usa en una cápsula.'

  it('aprobada: ok false, salida distinta de 0, y la línea nombra archivo, campo y código', () => {
    const raiz = repo([conTerapia('aprobada')])
    const r = correr(raiz, lunes('2026-12-07'))
    expect(r.ok).toBe(false)
    expect(codigoDeSalida(r)).not.toBe(0)
    expect(r.faltas.map(lineaDe)).toEqual([LINEA])
    expect(informe(r).join('\n')).toContain(LINEA)
    expect(existsSync(join(raiz, 'dist/una-pausa'))).toBe(false)
  })

  it('borrador: ok, con el aviso impreso', () => {
    const raiz = repo([conTerapia('borrador')])
    const r = correr(raiz, lunes('2026-12-07'))
    expect(r.ok).toBe(true)
    expect(codigoDeSalida(r)).toBe(0)
    expect(r.faltas).toEqual([])
    const impreso = informe(r).join('\n')
    expect(impreso).toContain('Avisos:')
    expect(impreso).toContain(LINEA)
  })
})

describe('criterio 5: el conjunto y los archivos', () => {
  it('dos programadas en la misma semana: conjunto.choque, nombrando las dos', () => {
    const raiz = repo([
      programada('2026-12-07', { id: 'a' }),
      programada('2026-12-07', { id: 'b' }),
    ])
    const r = correr(raiz, lunes('2026-12-07'))
    expect(r.ok).toBe(false)
    expect(r.faltas.map(lineaDe)).toEqual([
      'contenido/una-pausa/capsulas/a.json · a · conjunto.choque — hay otra cápsula programada para la misma semana.',
      'contenido/una-pausa/capsulas/b.json · b · conjunto.choque — hay otra cápsula programada para la misma semana.',
    ])
  })

  it('dos con el mismo id: conjunto.id-repetido, y el mal nombrado da archivo.nombre', () => {
    const y = { id: 'y', status: 'borrador', title: 'Uno' }
    const raiz = repo([y, ['x.json', JSON.stringify({ ...y, title: 'Otro' })]])
    const r = correr(raiz, lunes('2026-12-07'))
    expect(r.ok).toBe(false)
    expect(r.faltas.map((f) => `${f.archivo} ${f.codigo}`)).toEqual([
      'contenido/una-pausa/capsulas/x.json archivo.nombre',
      'contenido/una-pausa/capsulas/y.json conjunto.id-repetido',
      'contenido/una-pausa/capsulas/x.json conjunto.id-repetido',
    ])
  })

  it('x.json con id «y»: archivo.nombre, y no entra al canal', () => {
    const raiz = repo([['x.json', JSON.stringify(programada('2026-12-07', { id: 'y' }))]])
    const r = correr(raiz, lunes('2026-12-07'))
    expect(codigos(r.faltas)).toEqual(['archivo.nombre'])
    expect(r.canal.vigente).toBeNull()
  })

  it('un archivo que no es JSON, o que no trae un objeto: archivo.json', () => {
    const raiz = repo([
      ['roto.json', '{ "id": "roto", '],
      ['lista.json', '[]'],
    ])
    const r = correr(raiz, lunes('2026-12-07'))
    expect(r.faltas.map((f) => `${f.archivo} ${f.codigo}`)).toEqual([
      'contenido/una-pausa/capsulas/lista.json archivo.json',
      'contenido/una-pausa/capsulas/roto.json archivo.json',
    ])
  })
})

describe('criterio 6: la portada, sobre el archivo', () => {
  const MALAS = {
    'png.webp': new Uint8Array(64).fill(7),
    'estrecha.webp': webp('VP8L', 1599, 1200),
    'baja.webp': webp('VP8X', 1600, 1000),
    'pesada.webp': webp('VP8 ', 1600, 1200, 250_001),
  }
  const ESPERADO = {
    'png.webp': ['portada.formato'],
    'estrecha.webp': ['portada.ancho', 'portada.proporcion'],
    'baja.webp': ['portada.proporcion'],
    'pesada.webp': ['portada.peso'],
    'falta.webp': ['portada.archivo'],
  }

  it.each(Object.keys(ESPERADO))('%s: en una aprobada rompe', (nombre) => {
    const c = enEstado(programada('2026-12-21', { id: 'c', coverAsset: nombre }), 'aprobada')
    const r = correr(repo([c], MALAS), lunes('2026-12-07'))
    expect(r.ok).toBe(false)
    expect(codigos(r.faltas)).toEqual(ESPERADO[nombre])
    expect(r.faltas[0]).toMatchObject({
      archivo: 'contenido/una-pausa/capsulas/c.json',
      campo: 'coverAsset',
    })
  })

  it.each(Object.keys(ESPERADO))('%s: en una prevalidada solo avisa', (nombre) => {
    const c = enEstado(programada('2026-12-21', { id: 'c', coverAsset: nombre }), 'prevalidada')
    const r = correr(repo([c], MALAS), lunes('2026-12-07'))
    expect(r.ok).toBe(true)
    expect(codigos(r.avisos)).toEqual(ESPERADO[nombre])
  })

  it('en un borrador no se revisa todavía', () => {
    const c = enEstado(programada('2026-12-21', { id: 'c', coverAsset: 'falta.webp' }), 'borrador')
    expect(correr(repo([c], {}), lunes('2026-12-07')).avisos).toEqual([])
  })

  it('una portada que no pasa no se nombra ni se copia', () => {
    const c = programada('2026-12-07', { id: 'c', coverAsset: 'pesada.webp' })
    const r = correr(repo([c], MALAS), lunes('2026-12-07'), { vistaPrevia: true })
    expect(r.canal.vigente).not.toHaveProperty('portada')
  })

  it('las portadas que nadie publica no se copian', () => {
    const raiz = repo([programada('2026-12-07')], { 'espacio.webp': BUENA, 'suelta.webp': BUENA })
    correr(raiz, lunes('2026-12-07'))
    expect(portadasEscritas(raiz)).toEqual(['espacio.webp'])
  })
})

describe('criterio 8 y DP-28.21: la vista previa', () => {
  const pilotoEn = (status, cambios = {}) => ({
    ...enEstado(programada('2026-12-07', { id: 'piloto', ...cambios }), status),
    piloto: true,
    weekStart: null,
    scheduledAt: null,
    title: 'CENTINELA-PILOTO',
  })
  const ahora = lunes('2026-12-14', '09:00:00')

  it('una piloto aprobada y válida es la vigente', () => {
    const raiz = repo([programada('2026-12-14'), pilotoEn('aprobada')])
    const r = correr(raiz, ahora, { vistaPrevia: true })
    const canal = JSON.parse(feed(raiz))
    expect(r.ok).toBe(true)
    expect(canal.vigente.id).toBe('piloto')
    expect(canal.vigente.portada.src).toBe('portadas/espacio.webp')
    expect(canal.archivo.map((e) => e.id)).toEqual(['c-2026-12-14'])
  })

  it('una piloto en borrador, no', () => {
    const raiz = repo([programada('2026-12-14'), pilotoEn('borrador')])
    correr(raiz, ahora, { vistaPrevia: true })
    expect(JSON.parse(feed(raiz)).vigente.id).toBe('c-2026-12-14')
  })

  it('sin vistaPrevia, el centinela de la piloto no aparece', () => {
    const raiz = repo([programada('2026-12-14'), pilotoEn('aprobada')])
    correr(raiz, ahora)
    expect(feed(raiz)).not.toContain('CENTINELA-PILOTO')
  })

  it('5.7: piloto en revisión sin archivo de portada → vigente sin portada, y portadas/ vacía', () => {
    const raiz = repo([pilotoEn('en_revision', { coverAsset: 'piloto.webp' })], {})
    const r = correr(raiz, ahora, { vistaPrevia: true })
    const canal = JSON.parse(feed(raiz))
    expect(r.avisos).toEqual([])
    expect(canal.vigente.id).toBe('piloto')
    expect(canal.vigente).not.toHaveProperty('portada')
    expect(portadasEscritas(raiz)).toEqual([])
  })

  it('DP-28.21: con faltas, sale con 0, las imprime como avisos y deja fuera lo inválido', () => {
    const raiz = repo([
      programada('2026-12-07'),
      programada('2026-12-14', { title: 'Calma!' }),
      ['roto.json', 'no es json'],
    ])
    const r = correr(raiz, ahora, { vistaPrevia: true })
    expect(codigos(r.faltas)).toEqual(['archivo.json', 'lexico.exclamacion'])
    expect(r.ok).toBe(true)
    expect(codigoDeSalida(r, { vistaPrevia: true })).toBe(0)
    const canal = JSON.parse(feed(raiz))
    expect(canal.vigente.id).toBe('c-2026-12-07')
    const impreso = informe(r, { vistaPrevia: true }).join('\n')
    expect(impreso).toContain('En el canal de producción, esto serían faltas. Aquí solo se avisa:')
    expect(impreso).not.toContain('El canal no se escribe')
  })

  it('el mismo contenido sin vista previa rompe', () => {
    const raiz = repo([programada('2026-12-14', { title: 'Calma!' })])
    const r = correr(raiz, ahora)
    expect(r.ok).toBe(false)
    expect(codigoDeSalida(r)).toBe(1)
  })
})

describe('codigoDeSalida (DP-28.21)', () => {
  it.each([
    [[], false, 0],
    [[{ codigo: 'archivo.json' }], false, 1],
    [[], true, 0],
    [[{ codigo: 'archivo.json' }], true, 0],
  ])('faltas %j, vistaPrevia %s → %i', (faltas, vistaPrevia, codigo) => {
    expect(codigoDeSalida({ faltas }, { vistaPrevia })).toBe(codigo)
  })
})

describe('criterio 10: determinista', () => {
  it('mismo contenido y mismo ahora, dos veces: feed.json idéntico byte a byte', () => {
    const capsulas = [
      programada('2026-12-07'),
      reserva('r', '2026-11-01'),
      programada('2026-12-21'),
    ]
    const a = repo(capsulas)
    const b = repo([...capsulas].reverse())
    const ahora = lunes('2026-12-28', '09:00:00')
    correr(a, ahora)
    const primera = feed(a)
    correr(a, ahora)
    correr(b, ahora)
    expect(feed(a)).toBe(primera)
    expect(feed(b)).toBe(primera)
  })

  it('una segunda corrida no deja portadas de la primera', () => {
    const raiz = repo([programada('2026-12-07')])
    correr(raiz, lunes('2026-12-07'))
    expect(portadasEscritas(raiz)).toEqual(['espacio.webp'])
    correr(raiz, lunes('2026-12-01'))
    expect(portadasEscritas(raiz)).toEqual([])
  })
})

describe('criterio 11: un mensaje para todo código', () => {
  const LEXICO = [...FORBIDDEN, ...CLINICO, ...AMPLIADO].map((r) => `lexico.${r.id}`)
  const PROMESAS = IDS_DE_PROMESA.map((id) => `promesa.${id}`)
  const TODOS = [...CODIGOS, ...CODIGOS_DEL_SCRIPT, ...LEXICO, ...PROMESAS]

  it('las familias son las que el modelo declara', () => {
    expect([...PREFIJOS].sort()).toEqual(['lexico.', 'promesa.'])
  })

  it.each(TODOS)('%s', (codigo) => {
    const frase = mensajeDe(codigo)
    expect(frase).toEqual(expect.any(String))
    expect(frase).not.toMatch(/[¡!]/)
  })

  it('un código que no existe no tiene frase, y la línea lo dice', () => {
    expect(mensajeDe('lexico.no-existe')).toBeNull()
    expect(mensajeDe('promesa.no-existe')).toBeNull()
    expect(mensajeDe('otra.cosa')).toBeNull()
    expect(lineaDe({ archivo: 'a.json', campo: null, codigo: 'otra.cosa' })).toBe(
      'a.json · otra.cosa — este código todavía no tiene frase.',
    )
  })

  it('el léxico de aviso no se dice como prohibido', () => {
    expect(mensajeDe('lexico.meta')).toBe(
      '«meta» es vocabulario de logro; mira si aquí hace falta.',
    )
  })
})

describe('los argumentos', () => {
  it('--salida es obligatorio; --ahora va con desfase; lo demás no se conoce', () => {
    expect(leerArgumentos(['--salida', 'd'])).toMatchObject({ salida: 'd', error: null })
    expect(leerArgumentos(['--vista-previa', '--salida', 'd']).vistaPrevia).toBe(true)
    expect(leerArgumentos([]).error).toMatch(/--salida/)
    expect(leerArgumentos(['--salida', 'd', '--ahora', '2026-12-07']).error).toMatch(/--ahora/)
    expect(leerArgumentos(['--salida', 'd', '--ahora', lunes('2026-12-07')]).error).toBeNull()
    expect(leerArgumentos(['--salida', 'd', '--rapido']).error).toMatch(/--rapido/)
  })
})

describe('la línea de comandos, sobre el contenido/ real del repo', () => {
  const script = 'scripts/publicar-pausa.js'
  const node = (args) =>
    execFileSync(process.execPath, [script, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
    })

  it('§4.5: contenido/ está vacío y el canal sale vacío, con 0', () => {
    const salida = mkdtempSync(join(tmpdir(), 'una-pausa-cli-'))
    carpetas.push(salida)
    node(['--salida', salida, '--ahora', lunes('2026-12-09', '12:00:00')])
    expect(JSON.parse(readFileSync(join(salida, 'una-pausa/feed.json'), 'utf8'))).toEqual({
      formato: 1,
      semana: '2026-12-07',
      vigente: null,
      archivo: [],
    })
  })

  it('un argumento mal dado sale con 1, y con --vista-previa con 0', () => {
    expect(() => node(['--salida', 'x', '--ahora', 'ayer'])).toThrow()
    expect(() => node(['--vista-previa', '--salida', 'x', '--ahora', 'ayer'])).not.toThrow()
  })
})
