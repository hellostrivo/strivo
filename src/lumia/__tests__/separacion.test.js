// src/lumia/__tests__/separacion.test.js
// Los criterios de SPEC_06 que se comprueban leyendo el código, no ejecutándolo:
// que en Lumia no haya hábitos, ni puente a Formia, ni copy con género fijo.
//
// §C2.6, criterio 2 — "Una búsqueda de `Habit` o `HabitLog` en el árbol de
// componentes del Diario no devuelve ninguna referencia".

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'

const ARBOL_LUMIA = ['src/lumia', 'src/pages/lumia', 'src/components/lumia']

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
    .replace(/^\s*\/\/.*$/gm, '')
}

const ARCHIVOS = ARBOL_LUMIA.flatMap(archivosDe)

/** Recorre todas las cadenas de un namespace de copy. */
function cadenasDe(nodo, ruta = 'copy.lumia') {
  if (typeof nodo === 'string') return [[ruta, nodo]]
  if (Array.isArray(nodo)) return nodo.flatMap((hijo, i) => cadenasDe(hijo, `${ruta}[${i}]`))
  if (nodo && typeof nodo === 'object') {
    return Object.entries(nodo).flatMap(([clave, hijo]) => cadenasDe(hijo, `${ruta}.${clave}`))
  }
  return []
}

const CADENAS = cadenasDe(copy.lumia)

describe('Lumia no sabe nada de hábitos (RN-DB4-01, §C2.6)', () => {
  it('hay archivos que revisar', () => {
    expect(ARCHIVOS.length).toBeGreaterThan(10)
  })

  it('ningún archivo de Lumia importa formia', () => {
    ARCHIVOS.forEach((ruta) => {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => expect(`${ruta}: ${linea}`).not.toMatch(/formia/i))
    })
  })

  it('no aparece Habit ni HabitLog en el árbol del Diario', () => {
    ARCHIVOS.forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\bHabit(Log)?\b/)
    })
  })

  it('la pantalla Hoy no tiene ningún puente a Formia (§C7.7.3)', () => {
    const hoy = codigoDe('src/pages/lumia/Hoy.jsx')
    expect(hoy).not.toMatch(/formia/i)
    expect(hoy).not.toMatch(/ritual de la mañana/i)
  })

  it('el copy de Lumia no usa vocabulario de hábitos', () => {
    const prohibido = /h[áa]bito|constancia|checklist|streak|racha|progreso/i
    CADENAS.forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(prohibido))
  })

  it('ninguna cadena de Lumia le dice "ritual" a nadie', () => {
    // El Ritual de Noche existe y su namespace se llama `ritualNoche`, pero eso
    // es vocabulario interno: en pantalla el módulo se presenta por lo que hace
    // —cerrar el día paso a paso— y no por cómo se llama en el blueprint. Por
    // eso aquí se revisa el texto y no la ruta, que sí lleva el nombre. Se
    // recogen las rutas infractoras en vez de concatenarlas al texto: lo que se
    // comprueba es la cadena, y el fallo tiene que decir dónde está.
    const infractoras = CADENAS.filter(([, texto]) => /ritual/i.test(texto)).map(([ruta]) => ruta)
    expect(infractoras).toEqual([])
  })
})

describe('las superficies de SPEC_07 (§C7.7.1, §C7.7.2)', () => {
  const DE_SPEC_07 = [
    'src/pages/lumia/Journal.jsx',
    'src/pages/lumia/Historial.jsx',
    'src/components/lumia/RitualNoche.jsx',
    'src/components/lumia/BloqueoPin.jsx',
    'src/components/lumia/CuentaParaPin.jsx',
    'src/components/lumia/CalendarioAnimo.jsx',
    'src/components/lumia/VistaDiaCompleto.jsx',
    'src/lumia/journal.js',
    'src/lumia/pin.js',
    'src/lumia/historial.js',
    'src/lumia/ritualNoche.js',
  ]

  it('existen todos los archivos que la spec nombra', () => {
    DE_SPEC_07.forEach((ruta) => expect(ARCHIVOS).toContain(ruta))
  })

  it('ninguno importa formia (SPEC_07, criterio 2)', () => {
    DE_SPEC_07.forEach((ruta) => {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => expect(`${ruta}: ${linea}`).not.toMatch(/formia/i))
    })
  })

  it('la vista de día completo no nombra hábitos (SPEC_07, criterio 3)', () => {
    const vista = codigoDe('src/components/lumia/VistaDiaCompleto.jsx')
    expect(vista).not.toMatch(/h[áa]bito|constancia|progreso/i)
  })

  it('las dos páginas nuevas declaran su superficie (RN-SURF-02)', () => {
    expect(codigoDe('src/pages/lumia/Journal.jsx')).toMatch(/data-surface="light"/)
    expect(codigoDe('src/pages/lumia/Historial.jsx')).toMatch(/data-surface="light"/)
  })
})

describe('la intención en el héroe de Hoy (§C2.4, SPEC_09)', () => {
  const heroe = codigoDe('src/components/lumia/HeroeHoy.jsx')
  const captura = codigoDe('src/components/lumia/IntencionDelDia.jsx')

  it('ninguno de los dos importa formia (criterio 8)', () => {
    ;[heroe, captura].forEach((codigo) => expect(codigo).not.toMatch(/formia/i))
  })

  it('la gran visión no aparece en el héroe (RN-LU-INT-02)', () => {
    // Vive en el bloque 4 del Diario de mañana. Dos superficies, no una lista
    // de preguntas seguidas.
    expect(heroe).not.toMatch(/granVision/)
    expect(codigoDe('src/components/lumia/DiarioManana.jsx')).toMatch(/granVision/)
  })

  it('la captura no abre el teclado sola (RN-LU-INT-01)', () => {
    expect(captura).not.toMatch(/autoFocus/i)
  })

  it('los chips van antes que el campo libre', () => {
    // Contra la etiqueta JSX, no contra el nombre: el import de `CampoLinea`
    // está arriba del todo y haría pasar esta prueba en cualquier caso.
    expect(captura.indexOf('CHIPS.map')).toBeLessThan(captura.indexOf('<CampoLinea'))
  })

  it('la intención se lee del héroe en los dos momentos del día', () => {
    // §C2.4 — Permanece visible toda la jornada. El héroe no está dentro de
    // ninguna rama que dependa del conmutador.
    const hoy = codigoDe('src/pages/lumia/Hoy.jsx')
    expect(hoy).toMatch(/<HeroeHoy/)
    expect(hoy).not.toMatch(/momento === 'manana' && \(?\s*<HeroeHoy/)
  })
})

describe('el tema lo manda el conmutador, no el reloj (RN-HOY-05)', () => {
  const hoy = codigoDe('src/pages/lumia/Hoy.jsx')

  it('la hora solo decide con qué sección se abre la pantalla', () => {
    expect(hoy.match(/getTimeSlot\(/g)).toHaveLength(1)
    expect(hoy).toMatch(/useState\(momentoInicial\)/)
  })

  it('ningún componente del Diario mira el reloj para elegir color', () => {
    ARCHIVOS.filter((ruta) => ruta.startsWith('src/components/lumia')).forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/getTimeSlot|gradientsBySlot/)
    })
  })

  it('las dos secciones están disponibles siempre, sin advertencia', () => {
    expect(hoy).not.toMatch(/todav[íi]a no es/i)
  })
})

describe('contraste por superficie (§5.2.3, §5.4.3, RN-SURF-01)', () => {
  it('ningún componente de Lumia fija un color de texto literal', () => {
    ARCHIVOS.filter((ruta) => ruta.endsWith('.jsx')).forEach((ruta) => {
      const codigo = codigoDe(ruta)
      // Las clases de color del tema claro heredado (text-ink, text-paper) y
      // cualquier hex suelto delatan un componente que decide su propio color.
      expect(`${ruta}: ${codigo}`).not.toMatch(/text-ink|text-paper|text-night|#[0-9a-f]{6}/i)
    })
  })

  it('las dos vistas del Diario declaran su superficie', () => {
    const hoy = codigoDe('src/pages/lumia/Hoy.jsx')
    expect(hoy).toMatch(/data-surface=/)
    expect(hoy).toMatch(/'light'/)
    expect(hoy).toMatch(/'dark'/)
  })
})

describe('copy con género (§3.6.5)', () => {
  it('toda cadena con marca de género trae las tres formas', () => {
    const conMarca = []
    const recorrer = (nodo) => {
      if (Array.isArray(nodo)) return nodo.forEach(recorrer)
      if (nodo && typeof nodo === 'object') {
        if (typeof nodo.m === 'string' || typeof nodo.f === 'string') conMarca.push(nodo)
        return Object.values(nodo).forEach(recorrer)
      }
      return undefined
    }
    recorrer(copy.lumia)

    expect(conMarca.length).toBeGreaterThan(20)
    conMarca.forEach((label) => {
      expect(typeof label.m).toBe('string')
      expect(typeof label.f).toBe('string')
      expect(typeof label.n).toBe('string')
    })
  })

  it('no hay terminaciones de género inclusivo en "-e"', () => {
    const recorrer = (nodo) => {
      if (Array.isArray(nodo)) return nodo.forEach(recorrer)
      if (nodo && typeof nodo === 'object') {
        if (typeof nodo.m === 'string' && nodo.m !== nodo.f) {
          expect(nodo.n).not.toBe(`${nodo.m.slice(0, -1)}e`)
        }
        return Object.values(nodo).forEach(recorrer)
      }
      return undefined
    }
    recorrer(copy.lumia)
  })

  it('ningún componente lee .m ni .f: todo pasa por el helper (RN-GEN-01)', () => {
    ARCHIVOS.forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\.label\.[mf]\b|copy\.[\w.]+\.[mf]\b/)
    })
  })
})

describe('la voz de Lumia (§3.6)', () => {
  it('no hay léxico prohibido ni exclamaciones en el copy', () => {
    const prohibido = /fallaste|incumpliste|abandonaste|deber[íi]as?|tendr[íi]as?|\btareas?\b|[¡!]/i
    CADENAS.forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(prohibido))
  })

  it('ninguna cadena de interfaz está escrita dentro de un componente', () => {
    // Un literal largo en JSX es copy que se saltó `src/copy/index.js`.
    ARCHIVOS.filter((ruta) => ruta.endsWith('.jsx')).forEach((ruta) => {
      const literales = codigoDe(ruta).match(/>[^<>{}\n]{12,}</g) ?? []
      expect(`${ruta}: ${literales.join(' | ')}`).toBe(`${ruta}: `)
    })
  })
})
