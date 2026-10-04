// SPEC_28.3 §4.5 y §4.7 — las pantallas de Una pausa, pintadas a HTML.
// Criterios 6, 7, 8 y 10 (desvío 3), más el copy de la sección.
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { AMPLIADO, CLINICO, FORBIDDEN } from '@/lib/lexico'
import Archivo from '../Archivo.jsx'
import Capsula from '../Capsula.jsx'
import Estado from '../Estado.jsx'
import LimiteDeErrores from '../LimiteDeErrores.jsx'
import { VistaUnaPausa, entradaPorId } from '../UnaPausa.jsx'
import { fechaDePausa } from '../fecha.js'

const textos = copy.unaPausa

/** Una entrada del canal tal como la deja `leerCanal`. */
const entrada = (cambios = {}) => ({
  id: 'respirar-cuando-se-acelera',
  version: 1,
  theme: 'TEMA-DEL-CALENDARIO',
  title: 'Respirar cuando el día se acelera',
  opening: 'Hay días que van más rápido que tú.',
  evidenceSummary: 'Lo que dicen los estudios, en breve.',
  keyFindings: ['Hallazgo uno.', 'Hallazgo dos.'],
  practiceDestination: 'in_capsule',
  practiceLabel: 'Tres respiraciones largas',
  practiceText: 'Inhala despacio y suelta el aire más despacio todavía.',
  journalPrompt: '¿Qué noto en mí cuando el día se acelera?',
  generatedWithAi: true,
  publicadaEl: '2026-12-07',
  fuentes: [
    {
      title: 'Un estudio sobre la respiración lenta',
      authorsOrInstitution: 'Instituto de Ejemplo',
      year: 2021,
      originalUrl: 'https://ejemplo.org/estudio',
      doi: '10.1000/ejemplo',
    },
    {
      title: 'Una guía sin año',
      authorsOrInstitution: 'Otra institución',
      year: null,
      originalUrl: 'https://ejemplo.org/guia',
    },
  ],
  portada: { src: 'https://contenido.hellostrivo.com/una-pausa/portadas/a.webp', alt: 'Luz' },
  ...cambios,
})

const enRouter = (elemento, ruta = '/una-pausa') =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [ruta] }, elemento))

const capsula = (props = {}) =>
  enRouter(
    createElement(Capsula, {
      entrada: entrada(),
      rutaRespiracion: '/respiracion',
      ...props,
    }),
  )

/** Dónde aparece cada texto, para comprobar el orden. */
const posiciones = (html, piezas) => piezas.map((p) => html.indexOf(p))
const enOrden = (lista) => lista.every((p, i) => p >= 0 && (i === 0 || p > lista[i - 1]))

describe('criterio 6: la cápsula, en el orden de §4.5', () => {
  it('etiqueta, título, apertura, portada, lo que sabemos, práctica, pregunta, fuentes, archivo', () => {
    const html = capsula({ vigente: true, rutaArchivo: '/una-pausa/archivo' })
    expect(
      enOrden(
        posiciones(html, [
          textos.etiqueta,
          '<h1',
          entrada().title,
          entrada().opening,
          '<img',
          textos.loQueSabemos,
          entrada().evidenceSummary,
          'Hallazgo uno.',
          textos.llevaloATuDia,
          textos.preguntaParaTi,
          textos.fuentes.titulo,
          textos.explorar,
        ]),
      ),
    ).toBe(true)
  })

  it('theme no se pinta (DP-28.24)', () => {
    expect(capsula({ vigente: true })).not.toContain('TEMA-DEL-CALENDARIO')
  })

  it('en el detalle, la fecha en vez de la etiqueta, y sin «Explorar»', () => {
    const html = capsula({ rutaArchivo: '/una-pausa/archivo' })
    expect(html).not.toContain(textos.etiqueta)
    expect(html).toContain('<time dateTime="2026-12-07">7 de diciembre de 2026</time>')
    expect(html).not.toContain(textos.explorar)
  })

  it('el título es el h1, y los encabezados van en orden y sin saltos', () => {
    const html = capsula({ vigente: true, rutaArchivo: '/una-pausa/archivo' })
    const niveles = [...html.matchAll(/<h([1-6])/g)].map((m) => Number(m[1]))
    expect(niveles[0]).toBe(1)
    expect(niveles.filter((n) => n === 1)).toHaveLength(1)
    niveles.forEach((n, i) => i > 0 && expect(n - niveles[i - 1]).toBeLessThanOrEqual(1))
  })

  it('sin journalPrompt no hay «Una pregunta para ti»', () => {
    expect(capsula({ entrada: entrada({ journalPrompt: undefined }) })).not.toContain(
      textos.preguntaParaTi,
    )
  })

  it('sin práctica no hay «Llévalo a tu día»', () => {
    const sin = entrada({ practiceDestination: undefined, practiceLabel: undefined })
    expect(capsula({ entrada: sin })).not.toContain(textos.llevaloATuDia)
  })

  it('la práctica in_capsule: el rótulo como subtítulo y el texto debajo', () => {
    const html = capsula()
    expect(html).toMatch(/<h3[^>]*>Tres respiraciones largas<\/h3>/)
    expect(html.indexOf('Inhala despacio')).toBeGreaterThan(html.indexOf('Tres respiraciones'))
  })

  it('la práctica breathing: un enlace a la ruta que llega por props', () => {
    const html = capsula({ entrada: entrada({ practiceDestination: 'breathing' }) })
    expect(html).toMatch(/<a[^>]*href="\/respiracion"[^>]*>Tres respiraciones largas<\/a>/)
  })

  it('la práctica journal y la pregunta no llevan botón ni enlace (desvío 4)', () => {
    const html = capsula({ entrada: entrada({ practiceDestination: 'journal' }) })
    const rotulo = html.slice(
      html.indexOf(textos.llevaloATuDia),
      html.indexOf(textos.preguntaParaTi),
    )
    // Hasta el `h2` de las fuentes, que sí lleva su botón.
    const pregunta = html.slice(
      html.indexOf(textos.preguntaParaTi),
      html.lastIndexOf('<h2', html.indexOf('aria-expanded')),
    )
    for (const trozo of [rotulo, pregunta]) {
      expect(trozo).not.toMatch(/<a |<button/)
    }
    expect(rotulo).toContain('Tres respiraciones largas')
    expect(pregunta).toContain(entrada().journalPrompt)
  })

  it('la portada: ancho y alto reservados, su alt, y alt="" cuando no lo trae', () => {
    const html = capsula()
    expect(html).toMatch(/<img[^>]*width="1600"[^>]*height="1200"/)
    expect(html).toMatch(/<img[^>]*alt="Luz"/)
    expect(html).not.toMatch(/object-cover/)
    const sinAlt = capsula({ entrada: entrada({ portada: { src: 'https://x/a.webp' } }) })
    expect(sinAlt).toMatch(/<img[^>]*alt=""/)
  })

  it('sin portada no hay img, ni hueco', () => {
    expect(capsula({ entrada: entrada({ portada: undefined }) })).not.toContain('<img')
  })

  it('pinta la portada guardada si se la dan', () => {
    expect(capsula({ srcPortada: 'blob:una-pausa/1' })).toMatch(/<img[^>]*src="blob:una-pausa\/1"/)
  })

  it('la línea de transparencia, solo con generatedWithAi: true', () => {
    expect(capsula()).toContain(textos.fuentes.transparencia)
    for (const generatedWithAi of [false, undefined, 'true']) {
      expect(capsula({ entrada: entrada({ generatedWithAi }) })).not.toContain(
        textos.fuentes.transparencia,
      )
    }
  })

  it('el aviso educativo va dentro de las fuentes', () => {
    const html = capsula()
    expect(html.indexOf(textos.fuentes.aviso)).toBeGreaterThan(html.indexOf('aria-controls'))
  })

  it('el botón de fuentes lleva aria-expanded y aria-controls, y controla la lista', () => {
    const html = capsula()
    const boton = html.match(/<button[^>]*>/)[0]
    expect(boton).toMatch(/type="button"/)
    expect(boton).toMatch(/aria-expanded="false"/)
    const controla = boton.match(/aria-controls="([^"]+)"/)[1]
    expect(html).toMatch(new RegExp(`id="${controla}" hidden=""`))
  })

  it('el contenedor que se esconde no lleva clases: flex le ganaría a hidden', () => {
    const html = capsula()
    const controla = html.match(/aria-controls="([^"]+)"/)[1]
    expect(html).toMatch(new RegExp(`<div id="${controla}" hidden="">`))
  })

  it('el botón de fuentes va dentro de un h2', () => {
    expect(capsula()).toMatch(/<h2[^>]*><button[^>]*aria-expanded/)
  })

  it('cada enlace de fuente: fuera, sin referente, y lo dice', () => {
    const html = capsula()
    const enlaces = [...html.matchAll(/<a [^>]*target="_blank"[^>]*>[\s\S]*?<\/a>/g)].map(
      (m) => m[0],
    )
    expect(enlaces).toHaveLength(3)
    for (const a of enlaces) {
      expect(a).toMatch(/rel="noopener noreferrer"/)
      expect(a).toContain(textos.fuentes.seAbreFuera)
    }
    expect(html).toContain('href="https://doi.org/10.1000/ejemplo"')
    expect(html).toContain('DOI 10.1000/ejemplo')
  })

  it('el año, solo si no es null', () => {
    const html = capsula()
    expect(html).toContain('<span>2021</span>')
    expect(html).not.toMatch(/<span>null<\/span>/)
  })

  it('sin tiempo de lectura ni número de pausa', () => {
    expect(capsula({ vigente: true })).not.toMatch(/minuto|min de lectura|leída/i)
  })
})

describe('criterio 7: el archivo', () => {
  const entradas = [
    entrada({ id: 'b', title: 'Hacer espacio en días llenos', publicadaEl: '2026-12-14' }),
    entrada({ id: 'a', title: 'Respirar cuando el día se acelera', publicadaEl: '2026-12-07' }),
  ]
  const html = enRouter(createElement(Archivo, { entradas, base: '/una-pausa' }))

  it('sin img', () => {
    expect(html).not.toContain('<img')
  })

  it('en el orden del canal, con su título y su fecha, enlazando al detalle', () => {
    expect(html.indexOf('Hacer espacio')).toBeLessThan(html.indexOf('Respirar cuando'))
    expect(html).toContain('href="/una-pausa/b"')
    expect(html).toContain('14 de diciembre de 2026')
  })

  it('sin cifras que cuenten entradas: fuera de las fechas no hay un número', () => {
    const sinFechas = html.replace(/<time[^>]*>[^<]*<\/time>/g, '').replace(/<[^>]+>/g, ' ')
    expect(sinFechas).not.toMatch(/\d/)
  })

  it('sin «me gusta», sin «leída» y sin otro orden', () => {
    expect(html).not.toMatch(/gusta|leída|ordenar|popular/i)
  })

  it('la lista tiene nombre, y el archivo su h1', () => {
    expect(html).toContain(`aria-label="${textos.archivo.listaLabel}"`)
    expect(html).toMatch(new RegExp(`<h1[^>]*>${textos.archivo.titulo}</h1>`))
  })

  it('sin entradas en el archivo, la vigente no ofrece «Explorar pausas anteriores»', () => {
    const canal = { formato: 1, semana: '2026-12-14', vigente: entrada(), archivo: [] }
    const vista = enRouter(
      createElement(
        Routes,
        null,
        createElement(Route, {
          path: '/una-pausa/*',
          element: createElement(VistaUnaPausa, { estado: 'listo', canal, base: '/una-pausa' }),
        }),
      ),
    )
    expect(vista).toContain(entrada().title)
    expect(vista).not.toContain(textos.explorar)
  })

  it('con entradas, sí', () => {
    const canal = { formato: 1, semana: '2026-12-14', vigente: entrada(), archivo: entradas }
    const vista = enRouter(
      createElement(
        Routes,
        null,
        createElement(Route, {
          path: '/una-pausa/*',
          element: createElement(VistaUnaPausa, { estado: 'listo', canal, base: '/una-pausa' }),
        }),
      ),
    )
    expect(vista).toContain('href="/una-pausa/archivo"')
  })
})

describe('criterio 8: el detalle', () => {
  const canal = {
    vigente: entrada({ id: 'piloto', publicadaEl: '2026-12-14' }),
    archivo: [entrada({ id: 'piloto', publicadaEl: '2026-12-07' }), entrada({ id: 'otra' })],
  }

  it('un id desconocido no da entrada, y entonces se redirige a la vigente', () => {
    expect(entradaPorId(canal, 'no-existe')).toBeNull()
    expect(entradaPorId(null, 'otra')).toBeNull()
    const fuente = readFileSync('src/unaPausa/UnaPausa.jsx', 'utf8')
    expect(fuente).toMatch(/if \(!entrada\) return <Navigate to=\{base\} replace \/>/)
  })

  it('el archivo antes que la vigente (resolución D de la §0)', () => {
    expect(entradaPorId(canal, 'piloto').publicadaEl).toBe('2026-12-07')
    expect(entradaPorId({ ...canal, archivo: [] }, 'piloto').publicadaEl).toBe('2026-12-14')
    expect(entradaPorId(canal, 'otra').id).toBe('otra')
  })

  it('una entrada del archivo se pinta en su ruta', () => {
    const vista = enRouter(
      createElement(
        Routes,
        null,
        createElement(Route, {
          path: '/una-pausa/*',
          element: createElement(VistaUnaPausa, { estado: 'listo', canal, base: '/una-pausa' }),
        }),
      ),
      '/una-pausa/otra',
    )
    expect(vista).toContain('7 de diciembre de 2026')
    expect(vista).not.toContain(textos.etiqueta)
  })
})

describe('los estados sin cápsula', () => {
  const pintar = (estado) =>
    renderToStaticMarkup(createElement(Estado, { estado, onReintentar: () => {} }))

  it('cargando: la forma final, vacía, sin rueda ni texto que cuente', () => {
    const html = pintar('cargando')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('aspect-[4/3]')
    expect(html).not.toMatch(/spin|animate-|%/)
  })

  it('vacío: el texto sereno y ningún botón', () => {
    const html = pintar('vacio')
    expect(html).toContain(textos.vacio)
    expect(html).not.toContain('<button')
  })

  it('error: qué pasó y reintentar, sin código', () => {
    const html = pintar('error')
    expect(html).toContain(textos.error.texto)
    expect(html).toMatch(new RegExp(`<button[^>]*>${textos.error.reintentar}</button>`))
    // Lo que se lee, sin las clases: ni un motivo del lector ni un código HTTP.
    const visible = html.replace(/<[^>]+>/g, ' ')
    expect(visible).not.toMatch(/\b(red|estado|tipo|json|formato|espera)\b|\d/)
  })

  it('los tres tienen un h1 para el foco, con el nombre de la sección', () => {
    for (const estado of ['cargando', 'vacio', 'error']) {
      expect(pintar(estado)).toMatch(
        new RegExp(`<h1 tabindex="-1" class="una-pausa-encabezado sr-only">${textos.nombre}</h1>`),
      )
    }
  })
})

describe('criterio 10 (desvío 3): un error en Una pausa se queda en Una pausa', () => {
  it('el límite convierte un error de render en el estado error de la sección', () => {
    const estado = LimiteDeErrores.getDerivedStateFromError(new Error('render roto'))
    const limite = new LimiteDeErrores({ children: null })
    limite.state = { ...limite.state, ...estado }
    const html = renderToStaticMarkup(limite.render())
    expect(html).toContain(textos.error.texto)
    expect(html).toContain(textos.error.reintentar)
    expect(html).not.toContain('render roto')
  })

  it('sin error, pinta lo que envuelve', () => {
    const html = renderToStaticMarkup(
      createElement(LimiteDeErrores, null, createElement('p', null, 'dentro')),
    )
    expect(html).toContain('<p>dentro</p>')
  })

  it('reintentar vuelve a montar la sección', () => {
    const limite = new LimiteDeErrores({ children: null })
    const cambios = []
    limite.setState = (f) => cambios.push(f({ fallo: true, vuelta: 0 }))
    limite.reintentar()
    expect(cambios).toEqual([{ fallo: false, vuelta: 1 }])
  })

  /** El código de App.jsx sin comentarios. */
  const app = readFileSync('src/App.jsx', 'utf8')
    .replace(/(^|\s)\/\*[\s\S]*?\*\//g, '$1')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  it('la ruta de Una pausa es la única dentro del límite, y la cabecera y la barra van fuera de las rutas', () => {
    expect(app).toMatch(
      /<Route\s+path="\/una-pausa\/\*"\s+element=\{\s*<LimiteDeErrores>\s*<UnaPausa base="\/una-pausa" rutaRespiracion=\{RUTA_RESPIRACION\} \/>\s*<\/LimiteDeErrores>/,
    )
    expect(app.match(/<LimiteDeErrores>/g)).toHaveLength(1)
    const rutas = app.slice(app.indexOf('<Routes>'), app.indexOf('</Routes>'))
    expect(rutas).not.toMatch(/NavStrivo|BarraInferior/)
    expect(app).toMatch(/\{!hideNav && <NavStrivo \/>\}/)
    expect(app).toMatch(/\{!hideNav && <BarraInferior \/>\}/)
  })

  it('nadie fuera de App.jsx importa Una pausa: ninguna otra pantalla pide el canal', () => {
    const todos = (dir) =>
      readdirSync(dir).flatMap((n) => {
        const r = join(dir, n)
        if (statSync(r).isDirectory()) return n === '__tests__' ? [] : todos(r)
        return /\.jsx?$/.test(n) ? [r] : []
      })
    const fuera = todos('src')
      .filter((r) => !r.startsWith('src/unaPausa/') && r !== 'src/App.jsx')
      .filter((r) => /from\s+['"](@\/unaPausa|[./]+unaPausa)/.test(readFileSync(r, 'utf8')))
    expect(fuera).toEqual([])
  })
})

describe('el copy de Una pausa (§4.7)', () => {
  const hojas = (nodo) =>
    typeof nodo === 'string' ? [nodo] : Object.values(nodo).flatMap((v) => hojas(v))
  const todas = hojas(textos)

  it('los rótulos del brief, literales', () => {
    expect(textos.etiqueta).toBe('Tema de la semana')
    expect(textos.loQueSabemos).toBe('Lo que sabemos')
    expect(textos.llevaloATuDia).toBe('Llévalo a tu día')
    expect(textos.preguntaParaTi).toBe('Una pregunta para ti')
    expect(textos.fuentes.titulo).toBe('Fuentes')
    expect(textos.explorar).toBe('Explorar pausas anteriores')
    expect(textos.fuentes.transparencia).toBe(
      'Contenido elaborado con apoyo de IA y revisado por Strivo.',
    )
  })

  it('sin exclamaciones', () => {
    for (const t of todas) expect(t).not.toMatch(/[¡!]/)
  })

  it('sin léxico prohibido, ni el clínico ni el ampliado', () => {
    const reglas = [...FORBIDDEN, ...CLINICO, ...AMPLIADO]
    for (const t of todas) {
      for (const { id, pattern } of reglas) {
        pattern.lastIndex = 0
        expect(pattern.test(t.normalize('NFC')), `${id}: ${t}`).toBe(false)
      }
    }
  })

  it('va al final del objeto, en su propio bloque', () => {
    expect(Object.keys(copy).at(-1)).toBe('unaPausa')
  })
})

describe('las fechas', () => {
  it('«7 de diciembre de 2026», el día de la clave', () => {
    expect(fechaDePausa('2026-12-07')).toBe('7 de diciembre de 2026')
    expect(fechaDePausa('2027-01-01')).toBe('1 de enero de 2027')
    expect(fechaDePausa('no')).toBeNull()
  })
})
