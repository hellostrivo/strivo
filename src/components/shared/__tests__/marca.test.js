// src/components/shared/__tests__/marca.test.js
// La aplicación de marca (SPEC_12).
//
// El criterio 1 —"ningún hex escrito a mano en un componente"— solo se puede
// sostener revisando el árbol entero, y es lo que hace la primera mitad de este
// archivo. La segunda comprueba que los valores del manual llegaron intactos:
// esta spec **aplica** una fuente única de color; no la reinterpreta.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import tokens from '@tokens/design-tokens.json'

const MANUAL = 'docs/blueprint/BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md'
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

  it('las cuatro paletas están completas y coinciden con §4.8', () => {
    expect(tokens.brand.lumia.am).toEqual(
      expect.objectContaining({ 50: '#F6F2E9', 100: '#DCCFF1', 200: '#E5C2DC', 300: '#F6DDE8' }),
    )
    expect(tokens.brand.lumia.pm).toEqual(
      expect.objectContaining({ 50: '#F3EFEA', 400: '#8D82B6', 500: '#6C5AA7', 700: '#5A5568' }),
    )
    expect(tokens.brand.formia.am).toEqual(
      expect.objectContaining({ 50: '#F7F2E9', 200: '#E8D9C4', 400: '#FFC29C', 500: '#E9A387' }),
    )
    expect(tokens.brand.formia.pm).toEqual(
      expect.objectContaining({ 600: '#B45A2B', 700: '#8F4A2F', 800: '#5D4766', 900: '#1F1D22' }),
    )
  })

  it('`lumia-am-200` es #E5C2DC (criterio 4)', () => {
    expect(tokens.brand.lumia.am[200]).toBe('#E5C2DC')
    expect(manual).toMatch(/`lumia-am-200`\s*\|\s*`#E5C2DC`/)
  })

  it('`#5D4766` está en Formia·Noche y no se ha "corregido" (criterio 3)', () => {
    // Manual §4.7 — Es el punto de convergencia cromática con Lumia al final del
    // día. Alejarlo del morado sería deshacer una decisión de marca.
    expect(tokens.brand.formia.pm[800]).toBe('#5D4766')
    expect(readFileSync('src/styles/tokens-formia.css', 'utf8')).toContain('#5D4766')
  })

  it('cada hex de los tokens de marca aparece literal en el manual', () => {
    const hexes = JSON.stringify(tokens.brand).match(/#[0-9A-F]{6}/g) ?? []
    expect(hexes.length).toBeGreaterThan(20)
    hexes.forEach((hex) => expect(manual).toContain(hex))
  })
})

describe('los tres símbolos (criterio 5)', () => {
  const nombres = readdirSync(SIMBOLOS)
    .filter((n) => n.endsWith('.svg'))
    .sort()

  it('están los tres', () => {
    expect(nombres).toEqual(['formia_simbolo.svg', 'lumia_simbolo.svg', 'strivo_simbolo.svg'])
  })

  it('comparten el mismo lienzo, que es lo que los hace comparables', () => {
    nombres.forEach((nombre) => {
      const svg = readFileSync(join(SIMBOLOS, nombre), 'utf8')
      expect(`${nombre}: ${svg}`).toContain('viewBox="0 0 122 130"')
    })
  })

  it('son de trazo, con extremos y uniones redondeadas', () => {
    nombres.forEach((nombre) => {
      const svg = readFileSync(join(SIMBOLOS, nombre), 'utf8')
      expect(`${nombre}`).toBe(nombre)
      expect(svg).toContain('stroke-linecap="round"')
      expect(svg).toContain('stroke-linejoin="round"')
      expect(svg).toContain('fill="none"')
    })
  })

  it('cada uno lleva su tono de firma, distinto del primario de su paleta', () => {
    // Manual §3.2 — No se fuerzan a coincidir: el símbolo tiene su propio tono.
    expect(readFileSync(join(SIMBOLOS, 'lumia_simbolo.svg'), 'utf8')).toContain('#7563A7')
    expect(readFileSync(join(SIMBOLOS, 'formia_simbolo.svg'), 'utf8')).toContain('#D56732')
    expect(readFileSync(join(SIMBOLOS, 'strivo_simbolo.svg'), 'utf8')).toContain('#2B2730')
    expect(tokens.brand.simbolos.lumia).not.toBe(tokens.brand.lumia.pm[500])
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

describe('Strivo no es un espacio navegable (criterio 9)', () => {
  it('no aparece como destino en la barra ni en ninguna ruta', () => {
    const app = codigoDe('src/App.jsx')
    expect(app).not.toMatch(/\/strivo|'strivo'/)
    expect(codigoDe('src/components/shared/BarraEspacios.jsx')).not.toMatch(/strivo/i)
  })

  it('su símbolo solo se usa por encima de los dos espacios', () => {
    const conStrivo = COMPONENTES.filter((ruta) => /marca="strivo"/.test(codigoDe(ruta)))
    expect(conStrivo).toEqual(['src/components/ArranqueProvisional.jsx'])
  })
})

describe('cambiar de espacio cambia la paleta (criterio 7)', () => {
  it('la paleta se elige con un atributo, no recargando', () => {
    const app = codigoDe('src/App.jsx')
    expect(app).toMatch(/data-space=\{espacio\}/)
    expect(app).toMatch(/data-moment=\{momentoDe\(\)\}/)
  })

  it('cada espacio tiene su hoja de tokens y ninguna nombra a la otra', () => {
    const lumia = readFileSync('src/styles/tokens-lumia.css', 'utf8')
    const formia = readFileSync('src/styles/tokens-formia.css', 'utf8')
    expect(lumia).toMatch(/\[data-space='lumia'\]/)
    expect(formia).toMatch(/\[data-space='formia'\]/)
    expect(lumia).not.toMatch(/formia/i)
    expect(formia.replace(/^\s*\*.*$/gm, '')).not.toMatch(/data-space='lumia'/)
  })

  it('los cuatro momentos están definidos', () => {
    const css = [
      readFileSync('src/styles/tokens-lumia.css', 'utf8'),
      readFileSync('src/styles/tokens-formia.css', 'utf8'),
    ].join('\n')
    ;['lumia', 'formia'].forEach((espacio) => {
      ;['manana', 'noche'].forEach((momento) => {
        expect(css).toContain(`[data-space='${espacio}'][data-moment='${momento}']`)
      })
    })
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
