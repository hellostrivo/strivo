// src/components/shared/__tests__/marca.test.js
// La aplicación de marca (SPEC_12).
//
// El criterio 1 —"ningún hex escrito a mano en un componente"— solo se puede
// sostener revisando el árbol entero, y es lo que hace la primera mitad de este
// archivo. La segunda comprueba que los valores del manual llegaron intactos:
// esta spec **aplica** una fuente única de color; no la reinterpreta.
//
// **Revisión del paso 8 del plan de separación técnica (25 ago 2026).** Este
// archivo vigilaba cuatro paletas, tres símbolos y el cambio de paleta al saltar
// de espacio. Con un solo producto quedan dos paletas y dos símbolos, y el
// criterio 7 —"cambiar de espacio cambia la paleta"— se **deroga**: no hay
// espacio que cambiar. Lo que ocupa su sitio es la regla que sí sigue viva y que
// nadie custodiaba, la que el repliegue rompió sin que ninguna prueba lo dijera:
// **la paleta tiene que llegar de verdad a la pantalla**.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import tokens from '@tokens/design-tokens.json'

const MANUAL = 'docs/blueprint/BRAND_MANUAL_STRIVO.md'
const SIMBOLOS = 'src/assets/marca'

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) {
      return nombre === '__tests__' ? [] : archivosDe(ruta)
    }
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1')
}

/** Lo mismo para CSS, que solo tiene comentarios de bloque. */
function cssDe(ruta) {
  return readFileSync(ruta, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
}

const COMPONENTES = ['src/components', 'src/pages'].flatMap(archivosDe)

describe('ningún hex a mano en un componente (criterio 1)', () => {
  it('hay componentes que revisar', () => {
    expect(COMPONENTES.length).toBeGreaterThan(30)
  })

  it('el color vive en los tokens, no en el JSX', () => {
    const conHex = COMPONENTES.filter((ruta) => /#[0-9a-f]{3,8}\b/i.test(codigoDe(ruta)))
    expect(conHex).toEqual([])
  })

  it('ninguno declara una familia tipográfica por su cuenta', () => {
    COMPONENTES.forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/font-family|Fraunces|Satoshi/i)
    })
  })
})

describe('los valores llegaron intactos del manual (criterios 3 y 4)', () => {
  const manual = readFileSync(MANUAL, 'utf8')

  // **La paleta salió de `design-tokens.json` al cerrar el paso 9.** Aquel bloque
  // era una segunda copia de los mismos ocho hexes, con el nombre viejo, y sin
  // un solo consumidor: quien pinta lee la hoja. Así que la comprobación pasa de
  // la copia al original, que es donde un error tendría consecuencias.
  it('las dos paletas del momento están completas y coinciden con §4.8', () => {
    // Eran cuatro —dos productos por dos momentos— y quedan dos. Los ocho hexes
    // de Mañana y Noche no se han tocado: el repliegue quita un producto, no
    // recalibra el color del que se queda.
    const hoja = cssDe('src/styles/tokens-strivo.css')
    Object.entries({
      'am-50': '#F6F2E9',
      'am-100': '#DCCFF1',
      'am-200': '#E5C2DC',
      'am-300': '#F6DDE8',
      'pm-50': '#F3EFEA',
      'pm-400': '#8D82B6',
      'pm-500': '#6C5AA7',
      'pm-700': '#5A5568',
    }).forEach(([token, hex]) => {
      expect(`${token}: ${hoja}`).toMatch(new RegExp(`--strivo-${token}:\\s*${hex}`))
    })
    expect(tokens.brand.lumia).toBeUndefined()
  })

  // **Costura cerrada en el paso 10** (§4.4 del plan). El paso 9 renombró el
  // token en la hoja y dejó el manual con el nombre viejo, así que esta prueba
  // vivía partida: el nombre nuevo se comprobaba en el CSS y el viejo en el
  // manual. Con el manual reeditado a una marca, las dos mitades dicen lo mismo.
  //
  // El hex es lo que el criterio 4 protege, y ese no se ha movido en ninguno de
  // los dos pasos: el repliegue renombra un token, no recalibra un color.
  it('el secundario de la mañana es #E5C2DC (criterio 4)', () => {
    expect(cssDe('src/styles/tokens-strivo.css')).toMatch(/--strivo-am-200:\s*#E5C2DC/)
    expect(manual).toMatch(/`strivo-am-200`\s*\|\s*`#E5C2DC`/)
  })

  // El criterio 3 vigilaba `#5D4766`, el punto de convergencia cromática entre
  // los dos productos al final del día (manual §4.7). **Se elimina: la regla se
  // deroga con la paleta que la contenía.** Con un solo producto no hay
  // convergencia que proteger, y el hex ya no existe en ningún token.

  it('cada hex de marca aparece literal en el manual', () => {
    // Se mide sobre las dos fuentes, y esa es la parte que no podía perderse al
    // vaciar el JSON: la hoja de paleta es donde de verdad se escriben los hexes
    // de la app, y es la que caza un color inventado a mano —como el `#7E9E86`
    // que SPEC_12 encontró en Constancia90—.
    const hexes = [
      ...(JSON.stringify(tokens.brand).match(/#[0-9A-F]{6}/g) ?? []),
      ...(cssDe('src/styles/tokens-strivo.css').match(/#[0-9A-F]{6}/gi) ?? []),
    ]
    expect(hexes.length).toBeGreaterThan(18)
    hexes.forEach((hex) => expect(manual).toContain(hex.toUpperCase()))
  })
})

// **Deroga "los dos símbolos"** (paso 9, §8: "el símbolo de la app →
// `strivo_simbolo.svg`", en singular). Eran tres, quedaron dos y queda uno.
//
// **Y el que queda cambia de archivo el 25 de agosto de 2026.** Llega
// `Strivo_Logo_Oficial.svg`, el logo del diseñador, y con él se retira la «S»
// suelta. **No es una versión nueva del mismo dibujo: es otra pieza.** Es un
// lockup vertical —símbolo y palabra en el mismo trazado— y eso invalida tres
// cosas que este bloque vigilaba como si fueran del sistema y eran de aquel
// archivo:
//
// - **"Comparten el mismo lienzo" se reescribe.** El lienzo pasa de
//   `0 0 122 130` a `0 0 1016 920`. Lo que la prueba protegía —que el
//   componente calcule el ancho con la proporción del archivo y no con una
//   heredada— sigue vivo, y ahora se comprueba contra el `.svg` en vez de
//   contra una constante escrita a mano en la prueba.
// - **"Son de trazo, con extremos y uniones redondeadas" se RETIRA.** El logo
//   oficial es de relleno: dos `path` con `fill` y sin un solo `stroke`, así que
//   `stroke-linecap`, `stroke-linejoin` y `fill="none"` no describen nada. En su
//   sitio se comprueba lo que sí es cierto del archivo nuevo, que es lo
//   contrario. La regla que la sostenía —§2, "formas circulares y orgánicas"—
//   no la puede leer una prueba ni la podía leer antes.
// - **El tono de firma cambia de valor, no de regla.** `#2B2730` → `#2B282F`, y
//   aparece un segundo color en los puntos terminales. Lo que se vigila sigue
//   siendo que ninguno de los dos sea el primario de la paleta (§3.2).
describe('el logo de la app (criterio 5, revisado 25 ago)', () => {
  const nombres = readdirSync(SIMBOLOS)
    .filter((n) => n.endsWith('.svg'))
    .sort()

  const logo = readFileSync(join(SIMBOLOS, 'Strivo_Logo_Oficial.svg'), 'utf8')

  it('está el suyo, y no hay un segundo', () => {
    expect(nombres).toEqual(['Strivo_Logo_Oficial.svg'])
  })

  it('el mapa de marcas del componente tiene exactamente ese', () => {
    const codigo = codigoDe('src/components/shared/Simbolo.jsx')
    const mapa = codigo.match(/const ARCHIVOS = Object\.freeze\(\{([\s\S]*?)\}\)/)[1]
    const marcas = (mapa.match(/^\s*(\w+):/gm) ?? []).map((l) => l.trim().replace(':', ''))
    expect(marcas).toEqual(['strivo'])
    // Y apunta al archivo que está en disco, no a uno que ya no existe.
    expect(codigo).toMatch(/from '@\/assets\/marca\/Strivo_Logo_Oficial\.svg'/)
  })

  it('el lienzo del componente es el del archivo, no uno heredado', () => {
    // De ahí sale el ancho que `Simbolo` calcula. Copiarlo mal deformaría el
    // logo sin que nada fallara, así que las tres copias —el `.svg`, el
    // componente y el token— se comprueban una contra otra.
    const declarado = codigoDe('src/components/shared/Simbolo.jsx').match(/VIEW_BOX = '([^']+)'/)[1]
    expect(logo).toContain(`viewBox="${declarado}"`)
    expect(declarado).toBe(tokens.brand.simbolos.viewBox)
  })

  it('la proporción con la que se dibuja sale de ese lienzo', () => {
    // Con los números del símbolo anterior —122:130, más alto que ancho— el
    // logo saldría estrecho y aplastado, y ninguna otra prueba lo vería.
    const codigo = codigoDe('src/components/shared/Simbolo.jsx')
    const [, ancho, alto] = tokens.brand.simbolos.viewBox.match(/0 0 (\d+) (\d+)/)
    expect(codigo).toMatch(new RegExp(`ANCHO = ${ancho}`))
    expect(codigo).toMatch(new RegExp(`ALTO = ${alto}`))
    expect(codigo).toMatch(/width=\{ANCHO\}/)
    expect(codigo).toMatch(/height=\{ALTO\}/)
  })

  // **Reescrita el 25 de agosto, después de verlo en el navegador.** Decía que
  // el ancho lo calculaba el componente —`(alto * ANCHO) / ALTO`— y con eso
  // `alto` no podía ser más que un número de píxeles. Un número de píxeles no
  // se ajusta a la pantalla, que es justo lo que hacía falta para el umbral, así
  // que el cálculo se retira y lo hace el navegador a partir de la proporción.
  //
  // Lo que la prueba protegía sigue en pie y es esto: **nunca se fijan el alto y
  // el ancho a la vez**. Fijar los dos es lo que deforma el logo, y es lo único
  // que el manual §3.6 prohíbe explícitamente ("estirar, cambiar proporción").
  it('nunca se le fijan el alto y el ancho a la vez: el logo no se deforma', () => {
    const codigo = codigoDe('src/components/shared/Simbolo.jsx')
    const estilo = codigo.match(/style=\{\{([^}]*)\}\}/)[1]
    expect(estilo).toMatch(/height: alto/)
    expect(estilo).toMatch(/width: 'auto'/)
    // Y si el tope de ancho llega a actuar, encoge en vez de aplastar.
    expect(estilo).toMatch(/maxWidth: '100%'/)
    expect(estilo).toMatch(/objectFit: 'contain'/)
  })

  it('el alto puede medirse contra la pantalla, no solo en píxeles', () => {
    // La cabecera pide un número —ahí manda el mínimo legible de §3.1— y el
    // umbral pide una longitud relativa, porque ocupa la pantalla entera y la
    // pantalla no siempre es la misma.
    expect(codigoDe('src/components/diario/NavStrivo.jsx')).toMatch(/ALTO_LOGO = 56/)
    expect(codigoDe('src/components/shared/TransicionLuz.jsx')).toMatch(
      /ALTO_LOGO = 'min\([^']*v[hw][^']*\)'/,
    )
  })

  it('es de relleno, sin un solo trazo que redondear', () => {
    expect(logo).toMatch(/fill="#[0-9A-F]{6}"/i)
    expect(logo).not.toContain('stroke')
    expect(logo).not.toContain('fill="none"')
    // Y los tokens no describen un trazo que no existe.
    expect(tokens.brand.simbolos.strokeLinecap).toBeUndefined()
    expect(tokens.brand.simbolos.strokeLinejoin).toBeUndefined()
  })

  it('trae el símbolo y la palabra en la misma pieza', () => {
    // Es lo que hace que la cabecera no lleve rótulo al lado: el archivo ya lo
    // dice. Si algún día llega el símbolo suelto, esta prueba es la que avisa
    // de que hay una decisión que volver a tomar (manual §3.5).
    expect(logo).toContain('id="symbol-and-wordmark"')
    expect(logo).toContain('id="terminal-dots"')
  })

  it('lleva sus tonos de firma, distintos del primario de la paleta', () => {
    // Manual §3.2 — No se fuerzan a coincidir: el logo tiene su propio tono.
    expect(logo).toContain(tokens.brand.simbolos.strivo)
    expect(logo).toContain(tokens.brand.simbolos.puntos)
    // Ninguno de los dos es el primario de la paleta, y siguen sin forzarse.
    expect(tokens.brand.simbolos.strivo).not.toBe('#6C5AA7')
    expect(tokens.brand.simbolos.puntos).not.toBe('#6C5AA7')
    expect(tokens.brand.simbolos.lumia).toBeUndefined()
  })

  it('sobre los dos fondos oscuros se pinta en monocromo, o no se vería', () => {
    // **Eran uno y son dos**, y el segundo llega con el video de apertura: el
    // umbral pone el logo quieto cuando el movimiento está reducido, y de noche
    // ese velo es índigo. Su tono de firma da 1,17:1 sobre el contratono de la
    // mañana y 2,09:1 sobre el velo nocturno; el filtro lo lleva a blanco
    // (17,06:1 y 17,92:1). Es la versión monocromática que el manual §9 tiene
    // pendiente de aprobación del diseñador.
    //
    // Donde el fondo es claro va tal cual y no hay regla: la cabecera de la
    // noche (9,84:1) y el velo crema del umbral (13,70:1).
    const css = cssDe('src/styles/globals.css')
    expect(css).toMatch(/\[data-momento='manana'\] \.cabecera-espacio img/)
    expect(css).not.toMatch(/\[data-momento='noche'\] \.cabecera-espacio img/)
    expect(css).toMatch(/\[data-moment='noche'\] \.velo-transicion img/)
    expect(css).not.toMatch(/\[data-moment='manana'\] \.velo-transicion img/)
  })
})

describe('una sola familia tipográfica (criterio 6)', () => {
  const globals = cssDe('src/styles/globals.css')
  const tailwind = codigoDe('tailwind.config.js')

  it('Inter, y solo Inter', () => {
    expect(globals).toContain("@import '@fontsource-variable/inter'")
    expect(tokens.typography.fontFamilies.display).toBe('Inter Variable')
    expect(tokens.typography.fontFamilies.interface).toBe('Inter Variable')
  })

  it('Fraunces y Satoshi ya no están en ningún sitio', () => {
    // Sobre los valores, no sobre los comentarios: el token de tipografía
    // explica en su `comment` a qué sustituye, y esa nota tiene que poder
    // nombrarlas. Es la misma razón por la que `lint-copy` dejó de revisar
    // `__tests__` en SPEC_06.
    const { comment, ...familias } = tokens.typography.fontFamilies
    expect(comment).toBeTruthy()
    Object.values(familias).forEach((familia) => {
      expect(familia).not.toMatch(/Fraunces|Satoshi/i)
    })
    ;[globals, tailwind].forEach((texto) => expect(texto).not.toMatch(/Fraunces|Satoshi/i))
  })

  it('no se carga ninguna fuente desde una CDN', () => {
    // Manual §5.1 — npm sobre CDN: sin dependencia de red y sin mandar la IP de
    // nadie a un tercero al abrir la app.
    expect(globals).not.toMatch(/fonts\.googleapis|fontshare|@import url\(/)
  })

  it('`.font-display` diferencia por peso, no por familia', () => {
    expect(globals).toMatch(/\.font-display\s*\{[^}]*font-weight/)
    expect(globals).not.toMatch(/\.font-display\s*\{[^}]*font-family/)
  })
})

describe('la escala tipográfica escala (deuda heredada de SPEC_11)', () => {
  const tailwind = codigoDe('tailwind.config.js')
  const globals = cssDe('src/styles/globals.css')

  it('todos los tamaños de texto van en rem', () => {
    const escala = tailwind.match(/fontSize:\s*\{[\s\S]*?\n {6}\},/)[0]
    const tamanos = escala.match(/\['([\d.]+)(rem|px)'/g) ?? []
    expect(tamanos.length).toBeGreaterThan(8)
    tamanos.forEach((t) => expect(t).toContain('rem'))
  })

  it('la raíz no fija un tamaño de fuente que pise la preferencia del sistema', () => {
    expect(globals).not.toMatch(/html\s*\{[^}]*font-size/)
    expect(globals).not.toMatch(/clamp\(14px/)
  })

  it('los objetivos táctiles siguen en px: son el tamaño de un dedo', () => {
    expect(tailwind).toMatch(/'touch':\s*'56px'/)
    expect(tailwind).toMatch(/'touch-sm':\s*'48px'/)
  })
})

// El criterio 9 de SPEC_12 decía "Strivo no es un espacio navegable" (§C0.2).
// Se revisó el 19 ago —el vestíbulo era el punto de entrada y sí era un
// destino— y el 25 ago se **deroga entero con el vestíbulo**: sin dos productos
// entre los que elegir, la marca madre no tiene sala de espera que presidir.
//
// Lo que sobrevive de aquel bloque, y por eso se reescribe en vez de borrarse:
// **su paleta neutra sigue existiendo y sigue sin cambiar con la hora** (§4.1).
// Es el valor por defecto del cromo para lo que vive por encima de la sesión.
describe('los neutros de la marca madre siguen siendo el suelo (§4.1)', () => {
  const css = cssDe('src/styles/globals.css')

  it('son el valor por defecto del cromo, en la raíz', () => {
    expect(css).toMatch(/--espacio-base: var\(--strivo-50\)/)
  })

  it('no cambian con el momento: la marca madre no tiene amanecer', () => {
    const raiz = css.slice(css.indexOf('--strivo-50:'))
    expect(raiz.slice(0, raiz.indexOf('}'))).not.toMatch(/data-moment/)
  })

  // **Se invierte, y esa es la decisión del 25 de agosto.** Decía que el símbolo
  // de la marca madre no presidía ninguna pantalla, porque el vestíbulo donde
  // aparecía se retiró. Al quedar un solo producto, preside la única que hay: la
  // cabecera, en las cuatro secciones. Lo que la prueba vigila es que siga
  // habiendo exactamente un sitio — dos serían dos marcas otra vez.
  // **"Y solo ahí" pasa a ser "y en estos dos" (25 ago).** El segundo sitio llega
  // con el video de apertura: el umbral pone el logo quieto cuando el movimiento
  // está reducido, porque un umbral sin nada dentro no es un umbral. Lo que la
  // prueba protegía sigue intacto —que no aparezca una segunda marca, y que el
  // logo no se cuele en pantallas donde no pinta nada— y por eso la lista se
  // amplía en vez de abrirse: crece de uno en uno y con un motivo escrito.
  it('su logo preside la cabecera y el umbral, y no un tercer sitio', () => {
    const conStrivo = COMPONENTES.filter((ruta) => /marca="strivo"/.test(codigoDe(ruta))).sort()
    expect(conStrivo).toEqual([
      'src/components/diario/NavStrivo.jsx',
      'src/components/shared/TransicionLuz.jsx',
    ])
    const conLumia = COMPONENTES.filter((ruta) => /marca="lumia"/.test(codigoDe(ruta)))
    expect(conLumia).toEqual([])
  })
})

// **Deroga el criterio 7 de SPEC_12** ("cambiar de espacio cambia la paleta"):
// no hay espacio que cambiar, y con él se retiró el atributo `data-space` del
// que colgaba toda la paleta.
//
// Lo que ocupa su sitio es la mitad de aquella regla que sigue siendo cierta y
// que nadie custodiaba: **el momento cambia la paleta, y la paleta llega a la
// pantalla**. Se escribe porque el repliegue la rompió en silencio —los ocho
// hexes seguían en su hoja, colgando de un atributo que ya no ponía nadie, y el
// degradado de Hoy, la tarjeta, el recuadro de la frase y las cuatro fases de
// Respiración se quedaron sin color con las 1250 pruebas en verde—.
describe('la paleta llega a la pantalla (revisión del criterio 7)', () => {
  const app = codigoDe('src/App.jsx')
  const paleta = cssDe('src/styles/tokens-strivo.css')

  it('el momento se elige con un atributo, no recargando', () => {
    expect(app).toMatch(/data-moment=\{momentoDe\(\)\}/)
  })

  it('ninguna variable de marca cuelga de un atributo que nadie pone', () => {
    // La comprobación que faltaba: cada selector de la hoja de paleta tiene que
    // ser la raíz o un atributo que la app escriba de verdad.
    const puestos = new Set(app.match(/\bdata-[a-z]+(?==)/g) ?? [])
    const selectores = paleta.match(/^\S[^{]*(?=\{)/gm) ?? []
    expect(selectores.length).toBeGreaterThan(2)
    selectores.forEach((selector) => {
      const atributos = selector.match(/\[(data-[a-z]+)/g) ?? []
      if (atributos.length === 0) return expect(selector.trim()).toBe(':root')
      atributos.forEach((attr) => expect(puestos).toContain(attr.slice(1)))
    })
  })

  it('los dos momentos están definidos, y son dos', () => {
    ;['manana', 'noche'].forEach((momento) =>
      expect(paleta).toContain(`[data-moment='${momento}']`),
    )
    expect(paleta.match(/\[data-moment='/g)).toHaveLength(2)
  })

  it('la hoja de paleta no nombra ningún otro producto', () => {
    // Era "ninguna nombra a la otra", con dos hojas. Con una sola, lo que queda
    // por vigilar es que no reaparezca la que se fue.
    expect(readdirSync('src/styles').filter((n) => n.startsWith('tokens-'))).toEqual([
      'tokens-strivo.css',
    ])
  })
})

describe('los patrones decorativos respetan reducir movimiento (criterio 8)', () => {
  it('ninguna animación queda sin su salvaguarda', () => {
    const css = cssDe('src/styles/globals.css')
    // La regla global de `prefers-reduced-motion` anula toda animación y
    // transición; es lo que hace que ningún patrón decorativo se mueva.
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
    expect(css).toMatch(/animation-duration:\s*0\.01ms\s*!important/)
  })
})
