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

// **Revisión del paso 8 (25 ago):** RN-RE-VIS-00 no cambia de fondo —nada de
// `breathing/` puede nombrar un token de la sección que lo monta— y las tres
// listas pierden la mitad que apuntaba al alcance retirado. Es el mismo recorte
// que hizo `eslint.config.js` al pasar de tres partes a dos.
describe('Respiración no conoce al diario (criterio 20b, RN-RE-VIS-00)', () => {
  it('ningún archivo de breathing/ nombra un token de la sección que lo monta', () => {
    for (const ruta of TODO_BREATHING) {
      const contenido = readFileSync(ruta, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      expect(`${ruta}`).toBe(ruta)
      expect(contenido).not.toMatch(/--strivo-(am|pm|base|fondo|tarjeta|campo|conmutador|frase)/)
    }
  })

  it('la hoja de estilos tampoco', () => {
    expect(readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(
      /--strivo-(am|pm|base|fondo|tarjeta|campo|conmutador|frase)/,
    )
  })

  it('ni un import cruza la línea', () => {
    for (const ruta of TODO_BREATHING) {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => {
        expect(`${ruta}: ${linea}`).not.toMatch(/diario/i)
      })
    }
  })
})

describe('el recorrido de la bolita va punteado (24 ago)', () => {
  const linea = codigoDe(LINEA)
  const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

  it('el trazo del recorrido es punteado, no continuo', () => {
    // Lo que hay delante de la bolita todavía no ha pasado: se anuncia, no se
    // afirma. Y anticipar el punto alto es lo que permite dosificar el aire en
    // vez de perseguir el dibujo.
    const regla = css.match(/\.respiracion-linea__onda \{[\s\S]*?\n\}/)[0]
    expect(regla).toMatch(/stroke-dasharray: 2 7/)
    expect(regla).toMatch(/stroke-linecap: round/)
  })

  it('es una sola línea y la bolita se apoya en ella (RN-RE-VIS-09)', () => {
    // Dibujar el recorrido aparte, como un zigzag de rectas, sería un segundo
    // trazo que la bolita no pisa: su altura sale del suavizado del motor, no
    // de una recta entre dos vértices. Dos trazos donde solo hay un camino.
    expect(linea).not.toMatch(/respiracion-linea__guia|__recorrido|zigzag/)
    expect(css).not.toMatch(/respiracion-linea__guia/)
    expect(linea).toMatch(/paso\.y/)
  })

  it('con contraste alto deja de estar punteado', () => {
    // Quien pide contraste alto necesita el trazo entero; la anticipación la
    // sigue dando la posición de la bolita sobre él.
    const alto = css.slice(css.indexOf('@media (prefers-contrast: more)'))
    expect(alto).toMatch(/\.respiracion-linea__onda \{\s*stroke-dasharray: none/)
  })

  it('la máscara ya no borra el dibujo entero', () => {
    // **Era un fallo real y de los que no se ven en una prueba:** una `<mask>`
    // de SVG es de luminancia y el valor inicial de `stop-color` es negro, así
    // que los cuatro topes —que solo declaraban opacidad— dejaban la máscara a
    // cero en todo su ancho. El grupo enmascarado no se pintaba: ni recorrido,
    // ni marcas de fase, ni marcador. Solo la bolita, que va fuera.
    expect(linea).toMatch(/className="respiracion-linea__velo"/)
    const velo = css.match(/\.respiracion-linea__velo \{[\s\S]*?\n\}/)[0]
    expect(velo).toMatch(/stop-color: white/)
    // Cuatro topes, los cuatro con la clase: si uno se queda sin ella vuelve a
    // ser negro y abre un agujero en la máscara.
    expect(linea.match(/<stop className="respiracion-linea__velo"/g)).toHaveLength(4)
  })

  it('el círculo no lleva recorrido, y no es un olvido', () => {
    // El círculo no tiene eje que recorrer: crece y decrece desde el centro, y
    // un camino dibujado ahí no marcaría ningún trayecto. Su `strokeDasharray`
    // es otra cosa —recorta el arco de la fase (§3.2)— y por eso la ausencia se
    // comprueba sobre la palabra y no sobre la propiedad.
    expect(codigoDe(CIRCULO)).not.toMatch(/recorrido|__onda/i)
  })
})

describe('el color sale del espacio, no de Strivo (24 ago)', () => {
  const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const globals = readFileSync('src/styles/globals.css', 'utf8')

  it('la hoja de Respiración ya no escribe un solo --strivo-*', () => {
    // RN-RE-VIS-00 se cumple igual —aquí no entra un token de espacio— pero
    // ahora tampoco entra uno de la marca madre: los siete colores se piden por
    // su papel y quien decide cuáles son es el espacio que la monta.
    expect(css).not.toMatch(/--strivo-/)
    expect(css).toMatch(/--respiracion-trazo\b/)
    expect(css).toMatch(/--respiracion-trazo-suave/)
    expect(css).toMatch(/--respiracion-tinta/)
  })

  it('globals define el valor por defecto y la variante del momento', () => {
    // **Revisión del paso 8 (25 ago):** la regla de fondo no cambia —Respiración
    // toma su paleta por defecto de la marca madre y la sobrescribe la sección
    // que la monta—, pero el selector sí. Colgaba de un `data-space` que ya nadie
    // atributo que se retiró al quedar un solo producto, y ahora cuelga de
    // `[data-moment]`, que es el que la app escribe de verdad.
    expect(globals).toMatch(/--respiracion-trazo: var\(--strivo-700\)/)
    const delMomento = globals.match(
      /\[data-moment\] \{\s*--respiracion-fase-inhalar[\s\S]*?\n\}/,
    )[0]
    expect(delMomento).toMatch(/--respiracion-fase-inhalar/)
    expect(delMomento).toMatch(/--respiracion-fase-sosten/)
    expect(delMomento).toMatch(/--respiracion-fase-exhalar/)
    expect(delMomento).toMatch(/--respiracion-fase-descanso/)
    expect(delMomento).not.toMatch(/#[0-9a-fA-F]{6}/)
  })

  it('conserva el orden de luminancia de SPEC_14', () => {
    // Inhalar la más oscura, descanso la más clara. Esa rampa es lo que hace
    // que el cambio de fase se lea de reojo, y cambiar de paleta no la toca.
    const delMomento = globals.match(
      /\[data-moment\] \{\s*--respiracion-fase-inhalar[\s\S]*?\n\}/,
    )[0]
    expect(delMomento).toMatch(/--respiracion-fase-inhalar: var\(--color-ink\)/)
    expect(delMomento).toMatch(/--respiracion-fase-descanso: var\(--strivo-pm-400\)/)
  })
})

describe('el círculo de la respiración diaria sigue intacto (criterio 20c, §1.2)', () => {
  it('conserva su naranja de amanecer y no toca los tokens de Respiración', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    // §6.3.9 — El círculo de SPEC_08 se pinta con `--color-breath`, que sale de
    // la paleta del momento. Son dos elementos de dos capas distintas.
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
