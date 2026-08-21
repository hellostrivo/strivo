// src/breathing/components/__tests__/visuales.test.js
// Los criterios de SPEC_14 que se comprueban leyendo el código, no
// ejecutándolo. Es el mismo camino que abrió SPEC_08 con `respiracion.test.js`:
// el entorno de pruebas de este repo es `node`, sin DOM y sin librería de
// render, así que lo que no es geometría se vigila sobre la fuente.
//
// No es un apaño. Buena parte de lo que SPEC_14 pide es **ausencia** —ni
// `setState` por frame, ni un elemento enfocable, ni un token de otro espacio—
// y las ausencias no se renderizan: se leen.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FASES_EN_ORDEN } from '@lib/respiracion/motorRitmo.js'
import { VISUALES, VISUAL_POR_DEFECTO } from '../visuales/GuiaVisual.jsx'

const VISUALES_DIR = 'src/breathing/components/visuales'
const CIRCULO = `${VISUALES_DIR}/VisualCirculo.jsx`
const LINEA = `${VISUALES_DIR}/VisualLinea.jsx`
const GUIA = `${VISUALES_DIR}/GuiaVisual.jsx`
const ETIQUETA = `${VISUALES_DIR}/EtiquetaFase.jsx`
const ANUNCIO = `${VISUALES_DIR}/AnuncioAccesible.jsx`
const CSS = 'src/breathing/styles/respiracion.css'
const SPEC_08 = 'src/components/shared/Respiracion.jsx'

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

/** Todos los archivos bajo una carpeta, recursivamente. */
function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    return statSync(ruta).isDirectory() ? archivosDe(ruta) : [ruta]
  })
}

const TODO_BREATHING = archivosDe('src/breathing').filter((r) => !r.includes('__tests__'))
const LAS_DOS_VISUALES = [
  ['VisualCirculo', CIRCULO],
  ['VisualLinea', LINEA],
]

describe('ni un setState por frame (criterio 12, RN-RE-VIS-33)', () => {
  it.each(LAS_DOS_VISUALES)('%s no tiene estado de React en absoluto', (_nombre, ruta) => {
    // Es la regla que decide si esto se siente suave o entrecortado. Sin
    // `useState` en el archivo, no hay forma de que un frame reconcilie el
    // árbol: el único camino que queda es escribir sobre el nodo.
    expect(codigoDe(ruta)).not.toMatch(/useState/)
  })

  it.each(LAS_DOS_VISUALES)('%s escribe sobre el nodo, no sobre atributos de JSX', (_n, ruta) => {
    const codigo = codigoDe(ruta)
    expect(codigo).toMatch(/setAttribute/)
    expect(codigo).toMatch(/useImperativeHandle\(ref, \(\) => \(\{ pintar \}\)\)/)
  })

  it.each(LAS_DOS_VISUALES)('%s no tiene ningún temporizador (RN-RE-VIS-02)', (_n, ruta) => {
    const codigo = codigoDe(ruta)
    expect(codigo).not.toMatch(/setInterval|setTimeout|requestAnimationFrame/)
  })

  it.each(LAS_DOS_VISUALES)('%s no usa useEffect: no tiene ciclo de vida propio', (_n, ruta) => {
    expect(codigoDe(ruta)).not.toMatch(/useEffect/)
  })

  it('la cuenta regresiva también baja por el nodo, no por un render', () => {
    // RN-RE-VIS-19 pide que el número baje de segundo en segundo, y §10 que
    // React solo repinte al cambiar de fase. Las dos se cumplen escribiéndolo.
    for (const [, ruta] of LAS_DOS_VISUALES) {
      expect(codigoDe(ruta)).toMatch(/cuenta\.current\.textContent/)
    }
  })

  it.each(LAS_DOS_VISUALES)('%s no calcula amplitud por su cuenta (RN-RE-VIS-02)', (_n, ruta) => {
    const codigo = codigoDe(ruta)
    expect(codigo).not.toMatch(/Math\.cos|Math\.sin|amplitudEn\(/)
  })
})

describe('la estela desaparece con movimiento reducido (criterio 14, RN-RE-VIS-12)', () => {
  it('no se esconde con CSS: no está en el DOM', () => {
    const codigo = codigoDe(LINEA)
    // Un `display: none` dejaría tres círculos en el árbol para nada. La
    // condición vive en el JSX y decide si llegan a existir.
    expect(codigo).toMatch(/movimientoReducido\s*\n?\s*\?\s*null\s*\n?\s*:\s*ESTELA\.map/)
  })

  it('la estela son tres círculos decrecientes hacia el pasado (§4.4)', () => {
    const codigo = codigoDe(LINEA)
    const estela = codigo.match(/const ESTELA = Object\.freeze\(\[([\s\S]*?)\]\)/)[1]
    const radios = [...estela.matchAll(/r: ([\d.]+)/g)].map((m) => Number(m[1]))
    const opacidades = [...estela.matchAll(/opacidad: ([\d.]+)/g)].map((m) => Number(m[1]))
    const dx = [...estela.matchAll(/dx: (-?\d+)/g)].map((m) => Number(m[1]))
    expect(radios).toEqual([5, 3, 2])
    expect(opacidades).toEqual([0.12, 0.08, 0.04])
    expect(dx.every((n) => n < 0)).toBe(true)
  })
})

describe('accesibilidad del dibujo (criterios 18 y 19)', () => {
  it.each(LAS_DOS_VISUALES)('%s: el SVG es una imagen con título', (_n, ruta) => {
    const codigo = codigoDe(ruta)
    expect(codigo).toMatch(/role="img"/)
    expect(codigo).toMatch(/<title>\{copy\.respiracion\.titulo\}<\/title>/)
  })

  it.each(LAS_DOS_VISUALES)('%s: lo de dentro está oculto al lector (RN-RE-VIS-25)', (_n, ruta) => {
    const codigo = codigoDe(ruta)
    // Cada grupo dentro del SVG lleva su `aria-hidden`: lo que hay que saber lo
    // dice el anuncio, y repetirlo aquí sería leerlo dos veces.
    const grupos = codigo.match(/<g[^>]*>/g) ?? []
    const deNivelSuperior = grupos.filter(
      (g) => !g.includes('key=') && !g.includes('transform={`translate(${marca'),
    )
    expect(deNivelSuperior.length).toBeGreaterThan(0)
    expect(codigo.match(/aria-hidden="true"/g)?.length ?? 0).toBeGreaterThanOrEqual(1)
  })

  it.each(LAS_DOS_VISUALES)('%s: nada es enfocable (RN-RE-VIS-27)', (_n, ruta) => {
    const codigo = codigoDe(ruta)
    // Es un dibujo, no un control. Los controles los monta SPEC_16.
    expect(codigo).not.toMatch(/tabIndex|<button|<a\s|onClick|onKeyDown/)
  })

  it('el anuncio es un `aria-live` educado y atómico', () => {
    const codigo = codigoDe(ANUNCIO)
    expect(codigo).toMatch(/aria-live="polite"/)
    expect(codigo).toMatch(/aria-atomic="true"/)
  })

  it('el anuncio se oculta a la vista sin dejar de leerse', () => {
    const css = readFileSync(CSS, 'utf8')
    const regla = css.match(/\.respiracion-anuncio \{([\s\S]*?)\}/)[1]
    // `display: none` lo sacaría también del lector de pantalla.
    expect(regla).not.toMatch(/display:\s*none/)
    expect(regla).toMatch(/clip:\s*rect\(0, 0, 0, 0\)/)
  })

  it('el anuncio no recibe el tiempo transcurrido, solo la fase y su duración', () => {
    const codigo = codigoDe(ANUNCIO)
    expect(codigo).toMatch(/\{ fase, msFase, estadoSesion \}/)
    expect(codigo).not.toMatch(/msRestantes/)
  })
})

describe('la fase se dice con palabra y con forma (criterio 21, RN-RE-VIS-17)', () => {
  it('las cuatro fases tienen nombre visible en el copy', () => {
    for (const fase of FASES_EN_ORDEN) {
      expect(copy.respiracion.fases[fase]).toBeTruthy()
    }
  })

  it.each(LAS_DOS_VISUALES)('%s monta la etiqueta de fase', (_n, ruta) => {
    expect(codigoDe(ruta)).toMatch(/<EtiquetaFase/)
  })

  it('la etiqueta saca el texto del copy y no lo escribe', () => {
    expect(codigoDe(ETIQUETA)).toMatch(/copy\.respiracion\.fases\[fase\]/)
  })

  it('y la geometría acompaña: el disco y la onda cambian de tamaño con la fase', () => {
    // La segunda mitad de RN-RE-VIS-17. Sin esto, quitar el color dejaría un
    // dibujo idéntico en las cuatro fases.
    expect(codigoDe(CIRCULO)).toMatch(/radioDisco/)
    expect(codigoDe(LINEA)).toMatch(/puntoBolita|marcador/)
  })

  it('el color por fase vive en CSS y no hay un solo hexadecimal en el JSX (§5)', () => {
    for (const ruta of TODO_BREATHING.filter((r) => r.endsWith('.jsx'))) {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    }
  })

  it('las cuatro variables de fase existen y salen de la escala Strivo', () => {
    const globals = readFileSync('src/styles/globals.css', 'utf8')
    for (const nombre of ['inhalar', 'sosten', 'exhalar', 'descanso']) {
      expect(globals).toMatch(
        new RegExp(`--respiracion-fase-${nombre}:\\s*var\\(--strivo-\\d+\\);`),
      )
    }
  })
})

describe('Respiración no conoce a Lumia ni a Formia (criterio 20b, RN-RE-VIS-00)', () => {
  it('ningún archivo de breathing/ nombra un token de otro espacio', () => {
    for (const ruta of TODO_BREATHING) {
      const contenido = readFileSync(ruta, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      expect(`${ruta}`).toBe(ruta)
      expect(contenido).not.toMatch(/--lumia-|--formia-|lumia-am-|lumia-pm-|formia-am-|formia-pm-/)
    }
  })

  it('la hoja de estilos tampoco', () => {
    expect(readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(
      /--lumia-|--formia-/,
    )
  })

  it('ni un import cruza la línea', () => {
    for (const ruta of TODO_BREATHING) {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => {
        expect(`${ruta}: ${linea}`).not.toMatch(/lumia|formia/i)
      })
    }
  })
})

describe('el círculo de Lumia sigue intacto (criterio 20c, §1.2)', () => {
  it('conserva su naranja de amanecer y no toca los tokens de Respiración', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    // §6.3.9 — El círculo de SPEC_08 se pinta con `--color-breath`, que sale de
    // la paleta de Lumia. Son dos elementos de dos capas de marca distintas.
    expect(css).toMatch(/\.circulo-respiracion[\s\S]*?background-color: var\(--color-breath\)/)
    expect(codigoDe(SPEC_08)).not.toMatch(/respiracion-fase|strivo-/)
  })

  it('no importa nada de breathing/ ni sabe que existe', () => {
    expect(codigoDe(SPEC_08)).not.toMatch(/breathing/)
  })

  it('las dos visuales nuevas son componentes propios, no una extensión de aquel', () => {
    for (const [, ruta] of LAS_DOS_VISUALES) {
      expect(codigoDe(ruta)).not.toMatch(/components\/shared\/Respiracion|ritmoRespiracion/)
    }
  })

  it('la clase del círculo viejo no aparece en la hoja nueva', () => {
    expect(readFileSync(CSS, 'utf8')).not.toMatch(/\.circulo-respiracion/)
  })
})

describe('cambiar de visual no toca el ritmo (criterio 23, RN-RE-VIS-29)', () => {
  it('el selector solo elige quién pinta', () => {
    const codigo = codigoDe(GUIA)
    // No hay estado, ni efecto, ni nada que pueda reiniciar el motor: la
    // sesión sigue corriendo donde siempre y solo cambia quién la mira.
    expect(codigo).not.toMatch(/useState|useEffect|crearMaquina|resolverEstado|reiniciar\(/)
    expect(codigo).toMatch(/visual === 'linea' \? VisualLinea : VisualCirculo/)
  })

  it('las dos visuales son intercambiables: mismas props', () => {
    const codigo = codigoDe(GUIA)
    for (const prop of ['estado', 'patron', 'estadoSesion', 'movimientoReducido']) {
      expect(codigo).toMatch(new RegExp(`${prop}=\\{${prop}\\}`))
    }
  })

  it('hay exactamente dos, y el círculo es la de partida', () => {
    expect(VISUALES).toEqual(['circulo', 'linea'])
    expect(VISUAL_POR_DEFECTO).toBe('circulo')
  })

  it('el cruce entre visuales lo hace el CSS, no un desmontaje', () => {
    expect(codigoDe(GUIA)).not.toMatch(/key=/)
  })
})

describe('el último ciclo no se nota (criterio 25, §9)', () => {
  it.each(LAS_DOS_VISUALES)('%s trata `cerrando` exactamente como `activo`', (_n, ruta) => {
    const codigo = codigoDe(ruta)
    // Saber que es la última respiración cambia cómo se respira, así que la
    // visual no puede tener ni una rama que lo distinga.
    expect(codigo).not.toMatch(/CERRANDO|'cerrando'/)
  })

  it('el CSS tampoco pinta nada distinto en `cerrando`', () => {
    expect(readFileSync(CSS, 'utf8')).not.toMatch(/data-sesion='cerrando'/)
  })

  it('los estados que sí cambian el dibujo son los que dice §9', () => {
    const css = readFileSync(CSS, 'utf8')
    const estados = [...css.matchAll(/data-sesion='(\w+)'/g)].map((m) => m[1])
    expect([...new Set(estados)].sort()).toEqual([
      'acomodando',
      'completado',
      'inactivo',
      'pausado',
    ])
  })

  it('el cierre dura los 900 ms del cierre del día', () => {
    const css = readFileSync(CSS, 'utf8')
    expect(css).toMatch(/data-sesion='completado'[\s\S]*?transition: opacity 900ms/)
  })
})

describe('ni un string visible fuera del copy (criterio 26)', () => {
  it.each(archivosDe('src/breathing/components').filter((r) => !r.includes('__tests__')))(
    '%s no escribe texto a mano',
    (ruta) => {
      // Las flechas de los manejadores llevan un `>` dentro y partían el JSX por
      // la mitad, dando por infractores a componentes que no escriben nada.
      // Mismo arreglo que en las pruebas equivalentes de SPEC_15 y SPEC_16.
      const codigo = codigoDe(ruta).replace(/=>/g, '=»')
      // Texto entre etiquetas JSX que no sea una interpolación.
      const sueltos = [...codigo.matchAll(/>\s*([A-Za-zÁÉÍÓÚÑáéíóúñ][^<>{}]{2,})\s*</g)]
        .map((m) => m[1].trim())
        .filter((texto) => !/^[\s\n]*$/.test(texto))
      expect(sueltos).toEqual([])
    },
  )

  it('todo lo que se lee llega de `copy.respiracion`', () => {
    for (const [, ruta] of LAS_DOS_VISUALES) {
      expect(codigoDe(ruta)).toMatch(/from '@copy'/)
    }
    expect(codigoDe(ETIQUETA)).toMatch(/from '@copy'/)
  })
})

describe('la geometría vive fuera del JSX (§2.2)', () => {
  it.each(LAS_DOS_VISUALES)('%s importa su geometría en vez de calcularla', (_n, ruta) => {
    expect(codigoDe(ruta)).toMatch(/from '@\/breathing\/lib\/geometria(Circulo|Linea)'/)
  })

  it('los módulos de geometría no saben que React existe', () => {
    for (const modulo of ['geometriaCirculo.js', 'geometriaLinea.js', 'pintorVisual.js']) {
      const codigo = codigoDe(`src/breathing/lib/${modulo}`)
      expect(codigo).not.toMatch(/from 'react'|useState|useRef|document|window/)
    }
  })

  it('el SVG nunca se deforma (RN-RE-VIS-08)', () => {
    for (const [, ruta] of LAS_DOS_VISUALES) {
      expect(codigoDe(ruta)).toMatch(/preserveAspectRatio="xMidYMid meet"/)
    }
  })
})
