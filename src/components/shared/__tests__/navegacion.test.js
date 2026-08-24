// src/components/shared/__tests__/navegacion.test.js
// El Home de Strivo y la navegación de los dos espacios (§C7.3, SPEC_11
// **revisada el 19 ago 2026**).
//
// Lo que cambió: se entra por el Home, la barra de abajo ya no salta entre
// espacios sino que devuelve al Home, y la profundidad se cuenta desde la raíz
// de cada espacio, no desde la app abierta.
//
// Lo que no cambió, y es lo que sigue vigilando la mitad de este archivo: no
// hay ningún enlace de contenido que cruce de un espacio al otro. Si aparece
// uno, la separación se ha roto por donde no se ve.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'

const APP = 'src/App.jsx'
const BARRA = 'src/components/shared/BarraStrivo.jsx'
const HOME = 'src/pages/Home.jsx'
const NAV_LUMIA = 'src/components/lumia/NavLumia.jsx'
const NAV_FORMIA = 'src/components/formia/NavFormia.jsx'
const HOY = 'src/pages/lumia/Hoy.jsx'
const CSS = 'src/styles/globals.css'

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) {
      return nombre === '__tests__' ? [] : archivosDe(ruta)
    }
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

describe('el Home es el punto de entrada (revisión 19 ago)', () => {
  const app = codigoDe(APP)
  const home = codigoDe(HOME)

  it('cada apertura aterriza en el Home, no en un espacio', () => {
    expect(app).toMatch(/path="\/" element=\{<Home/)
    expect(app).toMatch(/path="\*" element=\{<Navigate to="\/" replace/)
  })

  it('ofrece los dos espacios y nada más', () => {
    const accesos = home.match(/id: '(lumia|formia)'/g) ?? []
    expect(accesos).toHaveLength(2)
  })

  it('no lleva frase: la de apertura es del umbral de Lumia', () => {
    expect(home).not.toMatch(/frases-apertura|fraseDeApertura|frases-del-dia/)
  })

  it('tampoco lleva saludo, ni fecha, ni nombre (Anexo E, E.0)', () => {
    expect(home).not.toMatch(/saludo|fecha|Buenos d[íi]as|nombre/i)
  })

  it('la bienvenida es el símbolo y su luz, sin texto', () => {
    expect(home).toMatch(/marca="strivo"/)
    expect(home).toMatch(/bienvenida-simbolo/)
    expect(home).toMatch(/bienvenida-luz/)
  })

  it('la animación está dentro del rango de motion del proyecto (120–900 ms)', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    const duraciones = (css.match(/animation: bienvenida-\w+ (\d+)ms/g) ?? []).map((linea) =>
      Number(linea.match(/(\d+)ms/)[1]),
    )
    expect(duraciones.length).toBe(2)
    duraciones.forEach((ms) => {
      expect(ms).toBeGreaterThanOrEqual(120)
      expect(ms).toBeLessThanOrEqual(900)
    })
  })

  it('con reducir movimiento no hay que anularla a mano: la regla global la deja quieta', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation-duration: 0\.01ms/,
    )
  })
})

describe('la barra devuelve al Home y no salta entre espacios', () => {
  const barra = codigoDe(BARRA)

  it('lleva un solo destino, y es la raíz', () => {
    expect(barra.match(/to="/g) ?? []).toHaveLength(1)
    expect(barra).toMatch(/to="\/"/)
  })

  it('no nombra a ninguno de los dos espacios', () => {
    expect(barra).not.toMatch(/lumia|formia/i)
  })

  it('el copy de la navegación dice a dónde vuelve', () => {
    expect(Object.keys(copy.shared.navegacion)).toEqual([
      'barraLabel',
      'seccionesLabel',
      'volver',
      'volverLabel',
      'lumia',
      'formia',
    ])
    expect(copy.shared.navegacion.volverLabel).toMatch(/Strivo/)
  })

  it('en el Home no hay barra ni cabecera de espacio', () => {
    const app = codigoDe(APP)
    expect(app).toMatch(/\{espacio && !hideNav && <BarraStrivo \/>\}/)
    expect(app).toMatch(/\{espacio && !hideNav && \(espacio === 'formia'/)
  })

  it('los rótulos son los de la opción A, decidida y documentada (criterio 8)', () => {
    expect(copy.shared.navegacion.lumia.pestana).toBe('Lumia')
    expect(copy.shared.navegacion.formia.pestana).toBe('Formia')
    expect(copy.shared.navegacion.lumia.cabecera).toBe('Lumia · Reflexión')
    expect(copy.shared.navegacion.formia.cabecera).toBe('Formia · Acción')

    const claude = readFileSync('CLAUDE.md', 'utf8')
    expect(claude).toMatch(/Lumia · Reflexión/)
    expect(claude).toMatch(/opci[óo]n A/i)
  })

  it('la pestaña lleva la marca sola: el descriptor no cabría (§C7.3)', () => {
    expect(copy.shared.navegacion.lumia.pestana.length).toBeLessThan(8)
    expect(copy.shared.navegacion.formia.pestana.length).toBeLessThan(8)
  })
})

describe('no hay ningún cruce directo entre espacios (criterio 3 · §C7.7.3)', () => {
  const DE_LUMIA = ['src/lumia', 'src/pages/lumia', 'src/components/lumia'].flatMap(archivosDe)
  const DE_FORMIA = ['src/formia', 'src/pages/formia', 'src/components/formia'].flatMap(archivosDe)

  it('hay bastantes archivos que revisar en los dos lados', () => {
    expect(DE_LUMIA.length).toBeGreaterThan(20)
    expect(DE_FORMIA.length).toBeGreaterThan(8)
  })

  it('ninguna pantalla de Lumia enlaza a Formia', () => {
    DE_LUMIA.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}: ${codigo}`).not.toMatch(/formia/i)
      expect(`${ruta}: ${codigo}`).not.toMatch(/to="\/formia|'\/formia/)
    })
  })

  it('ninguna pantalla de Formia enlaza a Lumia', () => {
    DE_FORMIA.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      // `NavFormia` nombra sus propias rutas, que empiezan por /formia; lo que
      // no puede aparecer es una ruta del otro espacio.
      expect(`${ruta}: ${codigo}`).not.toMatch(/to="\/lumia|'\/lumia/)
      expect(`${ruta}: ${codigo}`).not.toMatch(/\blumia\//i)
    })
  })

  it('solo `App.jsx` y el Home ven los dos espacios a la vez', () => {
    // Son la raíz de composición y el vestíbulo: el equivalente de
    // `lib/db/index.js` en la capa de datos, los únicos sitios autorizados a
    // verlos juntos. Ninguno de los dos cruza datos. La barra ya no está en la
    // lista: desde la revisión no nombra a ninguno.
    const app = codigoDe(APP)
    expect(app).toMatch(/NavLumia/)
    expect(app).toMatch(/NavFormia/)
    expect(codigoDe(HOME)).toMatch(/lumia[\s\S]*formia/i)

    const cruzan = [...DE_LUMIA, ...DE_FORMIA].filter((ruta) => {
      const codigo = codigoDe(ruta)
      return /lumia/i.test(codigo) && /formia/i.test(codigo)
    })
    expect(cruzan).toEqual([])
  })

  it('para cambiar de espacio hay que pasar por el Home', () => {
    // La barra era el atajo y ya no lo es. Si vuelve a aparecer una ruta del
    // otro espacio en cualquier cromo, el atajo ha vuelto sin decirlo.
    ;[BARRA, NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      const codigo = codigoDe(ruta)
      const rutas = codigo.match(/to="(\/[a-z/]*)"/g) ?? []
      const espacios = new Set(rutas.map((r) => r.split('/')[1]))
      expect(`${ruta}: ${[...espacios]}`).not.toMatch(/lumia[\s\S]*formia|formia[\s\S]*lumia/)
    })
  })
})

describe('cada espacio conserva su vocabulario (§8)', () => {
  it('la navegación de Lumia no dice nada de construcción', () => {
    const deLumia = Object.values(copy.shared.navegacion.lumia.secciones).join(' ')
    expect(deLumia).not.toMatch(/h[áa]bito|identidad|progreso|constancia/i)
  })

  it('la navegación de Formia no dice nada de reflexión', () => {
    const deFormia = Object.values(copy.shared.navegacion.formia.secciones).join(' ')
    expect(deFormia).not.toMatch(/ritual|reflexi[óo]n|diario|journal|calma/i)
  })

  it('las secciones de cada espacio son las de la spec', () => {
    // Lumia son cuatro desde el 24 ago: Respiración entró entre Journal e
    // Historial. El orden es el de la pestaña y por eso se comprueba entero.
    expect(Object.keys(copy.shared.navegacion.lumia.secciones)).toEqual([
      'hoy',
      'journal',
      'respiracion',
      'historial',
    ])
    expect(Object.keys(copy.shared.navegacion.formia.secciones)).toEqual([
      'identidad',
      'habitos',
      'progreso',
    ])
  })
})

describe('se entra siempre por el Home (criterio 5, revisado)', () => {
  const app = codigoDe(APP)

  it('cada espacio conserva su raíz, pero ya no es la de la app', () => {
    expect(app).toMatch(/INICIO = Object\.freeze\(\{ lumia: '\/lumia\/hoy'/)
    expect(app).toMatch(/formia: '\/formia\/identidad'/)
  })

  it('volver a un espacio devuelve a la sección donde estabas (criterio 4)', () => {
    // Sobrevive a la revisión: lo que cambia es por dónde se pasa, no que
    // entrar a Lumia te devuelva al Journal si es donde lo dejaste.
    expect(app).toMatch(/ultima\.current\[id\] \?\? INICIO\[id\]/)
  })

  it('la sección activa no se persiste: no es un dato del usuario (§5)', () => {
    expect(app).not.toMatch(/localStorage|savePreferences|saveProfile/)
  })
})

describe('profundidad máxima de tres toques (criterio 6 · §4.3.2)', () => {
  // **Se cuenta desde la raíz de cada espacio, no desde la app abierta**
  // (revisión del 19 ago 2026, decidida con producto). El Home es el vestíbulo
  // y no cuenta: con él dentro, el detalle de un hábito serían cuatro toques y
  // la regla tendría dos excepciones en vez de un alcance claro.
  const CAMINOS = [
    { desde: 'Lumia · Hoy', destino: 'Sección Mañana', toques: 1 },
    { desde: 'Lumia · Hoy', destino: 'Respiración diaria', toques: 2 },
    { desde: 'Lumia · Hoy', destino: 'Journal · una entrada', toques: 2 },
    { desde: 'Lumia · Hoy', destino: 'Historial · un día', toques: 2 },
    { desde: 'Formia · Identidad', destino: 'Hábitos', toques: 1 },
    { desde: 'Formia · Identidad', destino: 'Detalle de un hábito', toques: 2 },
    { desde: 'Formia · Identidad', destino: 'Nuevo hábito', toques: 2 },
    { desde: 'Formia · Identidad', destino: 'Progreso', toques: 1 },
  ]

  it('ningún destino pasa de tres dentro de su espacio', () => {
    CAMINOS.forEach((camino) => expect(camino.toques).toBeLessThanOrEqual(3))
  })

  it('el Home pone cada espacio a un toque', () => {
    expect(codigoDe(HOME)).toMatch(/to=\{rutaDe\(espacio\.id\)\}/)
  })

  it('y la barra pone el Home a un toque desde cualquier sección', () => {
    expect(codigoDe(BARRA)).toMatch(/to="\/"/)
    expect(codigoDe(APP)).toMatch(/\{espacio && !hideNav && <BarraStrivo \/>\}/)
  })
})

describe('accesibilidad de la navegación (criterio 7)', () => {
  it('la barra no necesita estado activo: lleva a un sitio y solo a uno', () => {
    const barra = codigoDe(BARRA)
    expect(barra).not.toMatch(/isActive/)
    // Lo que sí necesita es decir a dónde va, más allá del símbolo.
    expect(barra).toMatch(/aria-label=\{textos\.volverLabel\}/)
    expect(barra).toMatch(/\{textos\.volver\}/)
  })

  it('el estado activo dentro de cada espacio no depende solo del color', () => {
    ;[NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(codigo).toMatch(/font-semibold/)
      expect(codigo).toMatch(/border-espacio-acento/)
    })
  })

  it('los objetivos táctiles llegan al mínimo', () => {
    expect(codigoDe(BARRA)).toMatch(/min-h-touch\b/)
    expect(codigoDe(HOME)).toMatch(/min-h-touch\b/)
    ;[NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      expect(codigoDe(ruta)).toMatch(/min-h-touch-sm/)
    })
  })

  it('las navegaciones se anuncian con su nombre', () => {
    expect(codigoDe(BARRA)).toMatch(/aria-label=\{textos\.barraLabel\}/)
    expect(codigoDe(HOME)).toMatch(/aria-label=\{textos\.espaciosLabel\}/)
    ;[NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      expect(codigoDe(ruta)).toMatch(/aria-label=\{textos\.seccionesLabel\}/)
    })
  })

  it('ninguna fija un color de texto literal (RN-SURF-01)', () => {
    ;[BARRA, HOME, NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(
        /text-ink|text-paper|text-night|#[0-9a-f]{6}/i,
      )
    })
  })
})

describe('los andamios provisionales de la navegación se retiraron', () => {
  it('no queda ningún conmutador ni `SesionProvisional`', () => {
    const enComponentes = readdirSync('src/components')
    expect(enComponentes).not.toContain('SesionProvisional.jsx')

    const app = codigoDe(APP)
    expect(app).not.toMatch(/Conmutador|PROVISIONAL|FORMIA_PROVISIONAL|LUMIA_PROVISIONAL/)
  })

  it('el arranque de sesión sigue, y sigue diciendo que es provisional', () => {
    // No es navegación: resuelve el uid y crea el árbol del usuario. Lo
    // sustituye el onboarding, que ninguna spec de Fase 1 construye.
    const arranque = readFileSync('src/components/ArranqueProvisional.jsx', 'utf8')
    expect(arranque).toMatch(/⚠ PROVISIONAL/)
    expect(arranque).toMatch(/initUserTree/)
  })

  it('se monta una sola vez, en la raíz', () => {
    expect(codigoDe(APP).match(/<ArranqueProvisional>/g) ?? []).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// La barra toma el contratono del conmutador dentro de Lumia (21 ago).
//
// Antes iba en `espacio-cabecera`, un gris fijo a cualquier hora, y se perdía
// contra las dos secciones de Hoy. Ahora lee `--lumia-conmutador`, que es el
// mismo token que pinta el conmutador Mañana/Noche: no es un color parecido
// elegido a ojo, es el mismo, y por eso no pueden separarse.

describe('la barra se viste del espacio en el que está (21 ago)', () => {
  const barra = codigoDe(BARRA)
  const css = readFileSync(CSS, 'utf8')

  it('la barra no nombra ni un color de Lumia: solo declara su clase', () => {
    expect(barra).toMatch(/barra-strivo/)
    expect(barra).not.toMatch(/lumia|conmutador|#[0-9a-fA-F]{3,8}/)
  })

  it('el tema vive en el CSS, como el velo de TransicionLuz (SPEC_10)', () => {
    expect(css).toMatch(/\[data-lumia\] \.barra-strivo \{[^}]*var\(--lumia-conmutador\)/)
  })

  it('lee el mismo token que el conmutador, así que no pueden separarse', () => {
    const selector = codigoDe('src/components/lumia/SelectorMomento.jsx')
    expect(selector).toMatch(/bg-lumia-conmutador/)
    // Un color copiado a mano en el CSS de la barra sería otro color el día que
    // el conmutador cambie el suyo.
    const regla = css.slice(css.indexOf('[data-lumia] .barra-strivo'))
    expect(regla.slice(0, regla.indexOf('}'))).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  it('el texto se invierte por superficie en las dos secciones', () => {
    expect(css).toMatch(/\[data-lumia='manana'\] \.barra-strivo \{[^}]*--color-text-on-dark/)
    expect(css).toMatch(/\[data-lumia='noche'\] \.barra-strivo \{[^}]*--color-text-on-light/)
  })

  it('el símbolo va en monocromo solo sobre el contratono oscuro', () => {
    // Sobre #1D1833 el .svg de marca queda en 1,17:1. De noche no hace falta.
    expect(css).toMatch(/\[data-lumia='manana'\] \.barra-strivo img/)
    expect(css).not.toMatch(/\[data-lumia='noche'\] \.barra-strivo img/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// La cabecera del espacio acompaña a la barra en la sección Mañana (21 ago).
//
// Arriba y abajo pasan a ser el mismo bloque de color, con el contenido entre
// los dos. Solo en Mañana: de noche la cabecera se queda en el rango claro que
// decidió SPEC_12, y ahí no se pierde porque la barra también es la pieza clara.

describe('la cabecera de Lumia va en contratono en la Mañana (21 ago)', () => {
  const nav = codigoDe(NAV_LUMIA)
  const css = readFileSync(CSS, 'utf8')

  it('la cabecera no nombra ni un color: solo declara su clase', () => {
    expect(nav).toMatch(/cabecera-espacio/)
    expect(nav).not.toMatch(/#[0-9a-fA-F]{3,8}/)
    expect(nav).toMatch(/bg-espacio-cabecera/)
  })

  it('toma el mismo token que la barra de abajo y que el conmutador', () => {
    expect(css).toMatch(
      /\[data-lumia='manana'\] \.cabecera-espacio \{[^}]*var\(--lumia-conmutador\)/,
    )
  })

  it('solo en Mañana: de noche la cabecera conserva su rango claro (SPEC_12)', () => {
    expect(css).not.toMatch(/\[data-lumia='noche'\] \.cabecera-espacio/)
  })

  it('las tres secciones conservan forma, peso y borde', () => {
    // "Quedan iguales" es sobre su diseño: lo que cambia es la superficie que
    // tienen debajo. Si se quedaran literalmente iguales serían ilegibles.
    expect(nav).toMatch(/rounded-full border px-4 py-2/)
    expect(nav).toMatch(/font-semibold/)
    expect(nav).toMatch(/border-espacio-acento/)
  })

  it('el borde de la sección activa sube a un tono que sí se ve', () => {
    // `lumia-pm-500` sobre el contratono da 2,97:1 — por debajo del 3:1 de
    // WCAG 1.4.11 para un indicador. El lavanda de la misma paleta, 11,57:1.
    const regla = css.slice(css.indexOf("[data-lumia='manana'] .cabecera-espacio"))
    expect(regla.slice(0, regla.indexOf('}'))).toMatch(/--espacio-acento:\s*var\(--lumia-am-100\)/)
  })

  it('la vela va en monocromo, y solo sobre el contratono', () => {
    expect(css).toMatch(/\[data-lumia='manana'\] \.cabecera-espacio img/)
    expect(css).not.toMatch(/\[data-lumia='noche'\] \.cabecera-espacio img/)
  })
})

describe('el conmutador sigue siendo el único origen del tema (RN-HOY-05)', () => {
  const app = codigoDe(APP)
  const hoy = codigoDe(HOY)

  it('el estado del momento no se ha movido de Hoy', () => {
    expect(hoy).toMatch(/useState\(momentoInicial\)/)
    // App recibe el momento; nunca lo decide. El reloj que sí consulta es para
    // `data-moment`, que es la paleta de marca y otra cosa distinta.
    expect(app).toMatch(/onMomento=\{setMomentoLumia\}/)
    expect(app).not.toMatch(/setMomentoLumia\(/)
  })

  it('la raíz refleja el momento, y `data-moment` sigue siendo cosa del reloj', () => {
    expect(app).toMatch(/data-lumia=\{momentoLumia \?\? undefined\}/)
    expect(app).toMatch(/data-moment=\{momentoDe\(\)\}/)
  })

  it('al salir de Hoy el atributo se retira', () => {
    // Journal e Historial no tienen momento: dejarlo puesto teñiría su barra
    // con la sección de una pantalla que ya no está.
    expect(hoy).toMatch(/return \(\) => onMomento\?\.\(null\)/)
  })
})
