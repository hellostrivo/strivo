// src/components/shared/__tests__/navegacion.test.js
// La navegación de la app (SPEC_11, **revisada el 25 de agosto de 2026**).
//
// Reescritura del paso 8 del plan de separación técnica. Este archivo custodiaba
// tres reglas que el repliegue a un solo producto **deroga**, y cada una tiene su
// nota abajo: el vestíbulo como punto de entrada (Blueprint §D-1), la barra
// inferior que devolvía a él, y la ausencia de enlaces cruzados entre los dos
// espacios —que era la mitad del archivo y ya no tiene entre qué cruzar—.
//
// Lo que sobrevive, y es lo que vigila ahora: la app abre en Hoy, ningún destino
// pasa de tres toques, la navegación no dice ni una palabra del alcance
// retirado, y el momento lo sigue mandando el conmutador de Hoy y nadie más.
//
// **Revisión del 26 de agosto de 2026: la barra inferior vuelve.** No es la que
// se derogó —aquella era navegación de nivel superior y devolvía al vestíbulo—:
// esta reparte cinco destinos en dos barras, arriba lo que se hace ahora y abajo
// lo que ya pasó y tú. Las reglas que cambian con ella están anotadas caso por
// caso, y RN-NAV-01 se reescribe en CLAUDE.md porque el Perfil es un quinto
// destino y la regla pedía revisarla antes de añadirlo.

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'

const APP = 'src/App.jsx'
const NAV = 'src/components/diario/NavStrivo.jsx'
const BARRA = 'src/components/shared/BarraInferior.jsx'
const HOY = 'src/pages/diario/Hoy.jsx'
const CSS = 'src/styles/globals.css'

/**
 * El código sin comentarios: lo que se ejecuta, no lo que se explica.
 *
 * `/*` solo abre comentario tras un espacio o al principio de línea: sin esa
 * condición, la ruta comodín `"/respiracion/*"` se lleva por delante el
 * resto del archivo. Es el mismo quitador que usa `breathing/navegacion.test.js`.
 */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/(^|\s)\/\*[\s\S]*?\*\//g, '$1')
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

describe('la app abre en su primera sección (revisión 25 ago)', () => {
  const app = codigoDe(APP)

  it('cada apertura aterriza en Hoy', () => {
    // **Deroga** "cada apertura aterriza en el Home": el vestíbulo existía para
    // elegir entre dos productos y ya no hay entre qué elegir (§D-1).
    expect(app).toMatch(/const INICIO = '\/hoy'/)
    expect(app).toMatch(/path="\/" element=\{<Navigate to=\{INICIO\} replace/)
  })

  it('cualquier ruta desconocida vuelve ahí, y no a un vestíbulo', () => {
    expect(app).toMatch(/path="\*" element=\{<Navigate to=\{INICIO\} replace/)
  })

  it('los cinco destinos tienen ruta, y no hay un sexto', () => {
    const rutas = (app.match(/<Route\s+path="([^"]+)"/g) ?? []).map((r) => r.match(/"([^"]+)"/)[1])
    expect(rutas).toEqual(['/', '/hoy', '/journal', '/respiracion/*', '/historial', '/perfil', '*'])
  })
})

describe('lo que sostenía el vestíbulo se retiró entero', () => {
  // **Deroga** el bloque de la barra y el del Home. No se reescriben porque no
  // custodiaban una regla, sino dos piezas: la pieza que devolvía al vestíbulo y
  // el vestíbulo mismo. Sin ellas, lo único que queda por vigilar es que no
  // vuelvan sin decirlo.
  it('ni el vestíbulo ni la barra inferior siguen en el árbol', () => {
    expect(existsSync('src/pages/Home.jsx')).toBe(false)
    expect(existsSync('src/components/shared/BarraStrivo.jsx')).toBe(false)
  })

  it('la app no monta ninguna de las dos', () => {
    const app = codigoDe(APP)
    expect(app).not.toMatch(/<Home\b|BarraStrivo/)
  })

  it('tampoco queda su tema en el CSS: era de un componente que ya no existe', () => {
    expect(readFileSync(CSS, 'utf8')).not.toMatch(/barra-strivo/)
  })

  it('hay una sola navegación, porque hay un solo producto', () => {
    // Lo que decía este archivo con veinte pruebas —que ninguna pantalla de un
    // espacio enlazaba al otro— se dice ahora con esta: no hay otro.
    const navegaciones = archivosDe('src/components').filter((ruta) => /\/Nav\w+\.jsx$/.test(ruta))
    expect(navegaciones).toEqual([NAV])
    expect(readdirSync('src/pages')).toEqual(['diario'])
  })
})

describe('la cabecera lleva la marca y lo que se hace ahora', () => {
  const nav = codigoDe(NAV)

  it('la marca va arriba, y es solo el nombre (renombrado del 25 ago)', () => {
    // **Deroga** "el descriptor va arriba": «Marca · Reflexión» distinguía un
    // espacio del otro y ya no hay otro. Lo que sobrevive de aquella regla es
    // que la cabecera es donde se aprende qué es esto, y ahora lo dice entero
    // con una palabra.
    expect(nav).toMatch(/textos\.diario\.cabecera/)
    expect(copy.shared.navegacion.diario.cabecera).toBe('Strivo')
  })

  it('los cinco destinos están, repartidos en dos barras', () => {
    // El reparto es la decisión: arriba lo que se hace ahora —el día, lo que se
    // escribe, el aire—, abajo lo que ya pasó y tú.
    expect(Object.keys(copy.shared.navegacion.diario.secciones)).toEqual([
      'hoy',
      'journal',
      'respiracion',
      'historial',
      'perfil',
    ])
    const arriba = (nav.match(/id: '(\w+)'/g) ?? []).map((r) => r.match(/'(\w+)'/)[1])
    const abajo = (codigoDe(BARRA).match(/id: '(\w+)'/g) ?? []).map((r) => r.match(/'(\w+)'/)[1])
    expect(arriba).toEqual(['hoy', 'journal', 'respiracion'])
    expect(abajo).toEqual(['historial', 'perfil'])
  })

  it('ningún rótulo de la cabecera se trunca: son de una palabra', () => {
    // La regla es de la cabecera, donde los rótulos comparten una fila con el
    // logo. La barra de abajo lleva dos y tiene sitio de sobra: "Tu perfil"
    // cabe entero, y así es como se llama esa sección.
    const secciones = copy.shared.navegacion.diario.secciones
    ;['hoy', 'journal', 'respiracion'].forEach((id) =>
      expect(secciones[id].split(' ')).toHaveLength(1),
    )
  })
})

describe('el vocabulario de la navegación (§8)', () => {
  it('no dice nada de construcción', () => {
    // Sobrevive intacta, y ahora vigila algo distinto: que el vocabulario del
    // alcance retirado no vuelva por la puerta de la navegación.
    const rotulos = Object.values(copy.shared.navegacion.diario.secciones).join(' ')
    expect(rotulos).not.toMatch(/h[áa]bito|identidad|progreso|constancia/i)
  })
})

describe('profundidad máxima de tres toques (§4.3.2, regla 1)', () => {
  // Se contaba desde la raíz del espacio porque el vestíbulo no entraba en la
  // cuenta. Sin vestíbulo se cuenta desde la app abierta, que es lo mismo: la
  // raíz de la app **es** Hoy.
  const CAMINOS = [
    { destino: 'Sección Mañana o Noche', toques: 1 },
    { destino: 'Respiración diaria', toques: 2 },
    { destino: 'Respiración · sesión', toques: 2 },
    { destino: 'Journal · una entrada', toques: 2 },
    { destino: 'Historial · un día', toques: 2 },
  ]

  it('ningún destino pasa de tres', () => {
    CAMINOS.forEach((camino) => expect(camino.toques).toBeLessThanOrEqual(3))
  })

  it('los cinco destinos están a un toque desde cualquier pantalla', () => {
    // Las dos barras acompañan a todas las pantallas. Con la de abajo solo en
    // Hoy, llegar al Historial desde el Journal costaría dos toques.
    expect(codigoDe(NAV).match(/ruta: '\/\w+'/g) ?? []).toHaveLength(3)
    expect(codigoDe(BARRA).match(/ruta: '\/\w+'/g) ?? []).toHaveLength(2)
    const app = codigoDe(APP)
    expect(app).toMatch(/\{!hideNav && <NavStrivo \/>\}/)
    expect(app).toMatch(/\{!hideNav && <BarraInferior \/>\}/)
  })
})

describe('accesibilidad de la navegación (criterio 7)', () => {
  const nav = codigoDe(NAV)

  it('el estado activo no depende solo del color', () => {
    expect(nav).toMatch(/font-semibold/)
    expect(nav).toMatch(/border-espacio-acento/)
  })

  it('los objetivos táctiles llegan al mínimo', () => {
    expect(nav).toMatch(/min-h-touch-sm/)
  })

  it('la navegación se anuncia con su nombre', () => {
    expect(nav).toMatch(/aria-label=\{textos\.seccionesLabel\}/)
  })

  it('no fija un color de texto literal (RN-SURF-01)', () => {
    expect(nav).not.toMatch(/text-ink|text-paper|text-night|#[0-9a-f]{3,8}/i)
  })
})

describe('los andamios provisionales de la navegación se retiraron', () => {
  it('no queda ningún conmutador de espacios', () => {
    expect(readdirSync('src/components')).not.toContain('SesionProvisional.jsx')
    expect(codigoDe(APP)).not.toMatch(/Conmutador|PROVISIONAL_/)
  })

  it('el arranque de sesión sigue, y sigue diciendo que es provisional', () => {
    // No es navegación: resuelve el uid y crea el árbol del usuario. Lo sustituye
    // el onboarding, que sigue sin construirse.
    const arranque = readFileSync('src/components/ArranqueProvisional.jsx', 'utf8')
    expect(arranque).toMatch(/⚠ PROVISIONAL/)
    expect(arranque).toMatch(/initUserTree/)
  })

  it('se monta una sola vez, en la raíz', () => {
    expect(codigoDe(APP).match(/<ArranqueProvisional>/g) ?? []).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// La cabecera va en contratono en la Mañana (21 ago).
//
// Sobrevive entera. Lo que cambia es que ya no tiene una barra abajo con la que
// formar bloque: ahora el contratono es solo suyo, y sigue haciendo falta por el
// mismo motivo —sobre `strivo-am-300` la franja se comía con la mañana clara—.

describe('la cabecera se viste del momento de Hoy (21 ago)', () => {
  const nav = codigoDe(NAV)
  const css = readFileSync(CSS, 'utf8')

  it('la cabecera no nombra ni un color: solo declara su clase', () => {
    expect(nav).toMatch(/cromo-espacio/)
    expect(nav).not.toMatch(/#[0-9a-fA-F]{3,8}/)
    expect(nav).toMatch(/bg-espacio-cabecera/)
  })

  it('toma el mismo token que el conmutador, así que no pueden separarse', () => {
    expect(css).toMatch(
      /\[data-momento='manana'\] \.cromo-espacio \{[^}]*var\(--strivo-conmutador\)/,
    )
    expect(codigoDe('src/components/diario/SelectorMomento.jsx')).toMatch(/bg-strivo-conmutador/)
    // Un color copiado a mano sería otro color el día que el conmutador cambie.
    const regla = css.slice(css.indexOf("[data-momento='manana'] .cromo-espacio"))
    expect(regla.slice(0, regla.indexOf('}'))).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  it('solo en Mañana: de noche la cabecera conserva su rango claro (SPEC_12)', () => {
    expect(css).not.toMatch(/\[data-momento='noche'\] \.cromo-espacio/)
  })

  it('las secciones conservan forma, peso y borde', () => {
    // "Quedan iguales" es sobre su diseño: lo que cambia es la superficie que
    // tienen debajo. Si se quedaran literalmente iguales serían ilegibles.
    expect(nav).toMatch(/rounded-full border px-4 py-2/)
    expect(nav).toMatch(/font-semibold/)
    expect(nav).toMatch(/border-espacio-acento/)
  })

  it('el borde de la sección activa sube a un tono que sí se ve', () => {
    // `strivo-pm-500` sobre el contratono da 2,97:1 — por debajo del 3:1 de
    // WCAG 1.4.11 para un indicador. El lavanda de la misma paleta, 11,57:1.
    const regla = css.slice(css.indexOf("[data-momento='manana'] .cromo-espacio"))
    expect(regla.slice(0, regla.indexOf('}'))).toMatch(/--espacio-acento:\s*var\(--strivo-am-100\)/)
  })

  it('la vela va en monocromo, y solo sobre el contratono', () => {
    expect(css).toMatch(/\[data-momento='manana'\] \.cromo-espacio img/)
    expect(css).not.toMatch(/\[data-momento='noche'\] \.cromo-espacio img/)
  })
})

describe('el conmutador sigue siendo el único origen del tema (RN-HOY-05)', () => {
  const app = codigoDe(APP)
  const hoy = codigoDe(HOY)

  it('el estado del momento no se ha movido de Hoy', () => {
    expect(hoy).toMatch(/useState\(momentoInicial\)/)
    // App recibe el momento; nunca lo decide. El reloj que sí consulta es para
    // `data-moment`, que es la paleta de marca y otra cosa distinta.
    expect(app).toMatch(/onMomento=\{setMomentoHoy\}/)
    expect(app).not.toMatch(/setMomentoHoy\(/)
  })

  it('la raíz refleja el momento, y `data-moment` sigue siendo cosa del reloj', () => {
    expect(app).toMatch(/data-momento=\{momentoHoy \?\? undefined\}/)
    expect(app).toMatch(/data-moment=\{momentoDe\(\)\}/)
  })

  it('al salir de Hoy el atributo se retira', () => {
    // El Journal, Respiración y el Historial no tienen momento: dejarlo puesto
    // teñiría su cromo con la sección de una pantalla que ya no está.
    expect(hoy).toMatch(/return \(\) => onMomento\?\.\(null\)/)
  })
})
