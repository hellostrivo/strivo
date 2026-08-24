// src/lumia/__tests__/separacion.test.js
// Los criterios de SPEC_06 que se comprueban leyendo el código, no ejecutándolo:
// que en Lumia no haya hábitos, ni puente a Formia, ni copy con género fijo.
//
// §C2.6, criterio 2 — "Una búsqueda de `Habit` o `HabitLog` en el árbol de
// componentes del Diario no devuelve ninguna referencia".

import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { COLLECTIONS, FIELDS } from '@/lib/db/schema'

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
    // Ya no queda ni el vocabulario interno: cerrar el día es escribir la
    // sección Noche, y no hay ningún módulo aparte que presentar. Se recogen
    // las rutas infractoras en vez de concatenarlas al texto: lo que se
    // comprueba es la cadena, y el fallo tiene que decir dónde está.
    const infractoras = CADENAS.filter(([, texto]) => /ritual/i.test(texto)).map(([ruta]) => ruta)
    expect(infractoras).toEqual([])
  })
})

describe('las superficies de SPEC_07 (§C7.7.1, §C7.7.2)', () => {
  const DE_SPEC_07 = [
    'src/pages/lumia/Journal.jsx',
    'src/pages/lumia/Historial.jsx',
    'src/components/lumia/BloqueoPin.jsx',
    'src/components/lumia/CuentaParaPin.jsx',
    'src/components/lumia/CalendarioAnimo.jsx',
    'src/components/lumia/VistaDiaCompleto.jsx',
    'src/lumia/journal.js',
    'src/lumia/pin.js',
    'src/lumia/historial.js',
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

describe('la intención del día se retiró entera (deroga SPEC_09)', () => {
  const heroe = codigoDe('src/components/lumia/HeroeHoy.jsx')

  it('no queda ni componente, ni chips, ni copy, ni campo en el modelo', () => {
    expect(existsSync('src/components/lumia/IntencionDelDia.jsx')).toBe(false)
    expect(existsSync('src/content/chips-intencion.js')).toBe(false)
    expect(copy.lumia.intencion).toBeUndefined()
    expect(FIELDS.dailyIntention).toBeUndefined()
    expect(COLLECTIONS.dailyIntention).toBeUndefined()
  })

  it('nadie escribe ni lee la colección, en ningún espacio', () => {
    ARCHIVOS.concat(archivosDe('src/lib/db')).forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/dailyIntention|intentionText/i),
    )
  })

  it('la intención emocional de la mañana no es aquella intención', () => {
    // La actualización del 23 ago trae una "intención" que es una **emoción**
    // elegida de un catálogo, no el texto libre de SPEC_09. Se guarda en
    // `intention`, dentro de `morningEntry`, y no resucita ni la colección
    // `dailyIntention` ni el campo `intentionText`, que es lo que comprueban
    // las dos pruebas de arriba.
    expect(FIELDS.morningEntry).toContain('intention')
    expect(FIELDS.morningEntry).not.toContain('intentionText')
  })

  it('el héroe no pregunta nada: las preguntas son del recorrido', () => {
    expect(heroe).not.toMatch(/granVision|intencion|intention/i)
  })

  it('el héroe no importa formia', () => {
    expect(heroe).not.toMatch(/formia/i)
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

  it('el conmutador es el primer elemento interactivo de la pantalla', () => {
    // Va dentro del héroe, justo debajo de la fecha: por delante de la frase
    // del día y por delante de la captura de intención, que es la primera
    // pregunta. Elegir el momento decide de qué habla el resto de la pantalla.
    const heroe = codigoDe('src/components/lumia/HeroeHoy.jsx')
    expect(hoy).toMatch(/conmutador=\{[\s\S]{0,80}<SelectorMomento/)
    expect(heroe.indexOf('fechaLarga')).toBeLessThan(heroe.indexOf('{conmutador}'))
    expect(heroe.indexOf('{conmutador}')).toBeLessThan(heroe.indexOf('<FraseDelDia'))
  })

  it('el conmutador va en contratono, fuera de la escala de las superficies', () => {
    // `lumia-tarjeta` y `lumia-campo` son los dos escalones de luminancia que
    // usan las piezas que acompañan al fondo. El conmutador no acompaña: lo
    // contradice, y por eso no comparte escala con ninguna de ellas.
    const selector = codigoDe('src/components/lumia/SelectorMomento.jsx')
    expect(selector).toMatch(/bg-lumia-conmutador/)
    expect(selector).not.toMatch(/bg-lumia-tarjeta|bg-lumia-campo/)
  })

  it('el bloque declara su propia superficie, sin nombrar un color', () => {
    // El texto de dentro se invierte con el bloque: claro sobre el bloque
    // oscuro de la mañana, oscuro sobre el bloque claro de la noche.
    const selector = codigoDe('src/components/lumia/SelectorMomento.jsx')
    expect(selector).toMatch(/data-surface=\{momento === 'manana' \? 'dark' : 'light'\}/)
  })

  it('los dos colores del bloque viven en el CSS, no en el componente', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/\[data-lumia='manana'\][\s\S]*?--lumia-conmutador:\s*#1D1833/)
    expect(css).toMatch(/\[data-lumia='noche'\][\s\S]*?--lumia-conmutador:\s*#F2DDE7/)
  })
})

describe('el Diario se escribe en Hoy, sin paso intermedio', () => {
  const hoy = codigoDe('src/pages/lumia/Hoy.jsx')

  it('las dos secciones se montan en la pantalla, no en una vista aparte', () => {
    expect(hoy).toMatch(/<DiarioManana estado=/)
    expect(hoy).toMatch(/<DiarioNoche estado=/)
    expect(hoy).not.toMatch(/vista === 'manana'|vista === 'noche'/)
  })

  it('no queda el botón que llevaba al Diario, ni su copy', () => {
    expect(copy.lumia.hoy.tarjeta).toBeUndefined()
    expect(copy.lumia.hoy.hecho).toBeUndefined()
    const todo = JSON.stringify(copy.lumia)
    ;['Empieza tu día', 'Cerrar tu día', 'Volver a Hoy'].forEach((cadena) =>
      expect(todo).not.toContain(cadena),
    )
  })

  it('"Comenzar mi día" vuelve, y no es aquel botón', () => {
    // Se retiró el 19 ago porque era un botón de guardar disfrazado al final
    // de una pantalla que ya guardaba sola: sugería que sin tocarlo no se había
    // guardado. Vuelve en otro sitio y con otro trabajo — es el único control
    // del cierre de la mañana (§8), la ceremonia que cierra el recorrido, y su
    // hermano es "Cerrar mi día", no un botón de navegación.
    expect(copy.lumia.diario.manana.cierre.cta).toBe('Comenzar mi día')
    expect(codigoDe('src/components/lumia/manana/AperturaDelDia.jsx')).toMatch(/textos\.cta/)
    // No está al final de ninguna pantalla de escritura.
    ;['MomentoAnimo', 'MomentoGratitud', 'MomentoIntencionAccion', 'MomentoPausa'].forEach(
      (nombre) =>
        expect(codigoDe(`src/components/lumia/manana/${nombre}.jsx`)).not.toMatch(/cierre/),
    )
  })

  it('la ceremonia de cierre no era ese botón y se queda donde estaba', () => {
    // "Cerrar mi día" es el Bloque 7 de §5.4, no un paso de navegación: es la
    // ceremonia, y la ceremonia nunca falla (no-negociable 3). Cambió de
    // archivo con la actualización del 23 ago —`CierreDelDia` pasó a
    // `noche/CierreDeLaNoche`, sin recuento— pero no de sitio ni de trabajo.
    expect(copy.lumia.diario.noche.cierre.cta).toBe('Cerrar mi día')
    expect(codigoDe('src/components/lumia/DiarioNoche.jsx')).toMatch(/<CierreDeLaNoche/)
    expect(existsSync('src/components/lumia/CierreDelDia.jsx')).toBe(false)
  })

  it('las dos vistas empotradas no repiten el héroe ni piden salir', () => {
    const manana = codigoDe('src/components/lumia/DiarioManana.jsx')
    const noche = codigoDe('src/components/lumia/DiarioNoche.jsx')
    ;[manana, noche].forEach((codigo) => expect(codigo).not.toMatch(/onSalir|<h1/))
    // El saludo, la fecha y la frase del día se pintan una vez, en el héroe.
    expect(manana).not.toMatch(/FraseDelDia|fechaLarga|saludo/i)
  })

  it('la respiración es la entrada de las dos secciones, sin ramas', () => {
    // La misma tarjeta de día y de noche: lo que cambia es la paleta, no el
    // destino. La versión nocturna del acento vive en el CSS.
    expect(hoy.match(/abrir\('respiracion'\)/g) ?? []).toHaveLength(1)
    expect(hoy.match(/<TarjetaRespiracion/g) ?? []).toHaveLength(1)
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/\[data-lumia='noche'\][\s\S]*?--color-breath:/)
  })

  it('la entrada a la respiración es una tarjeta seleccionable entera', () => {
    // Era un enlace en el registro de las ayudas y se pasaba por alto. Ahora es
    // un recuadro, y el recuadro **es** el control: un botón dentro de una caja
    // dejaría zona tocable sin cubrir, que es una invitación que se retira en
    // cuanto la aceptas.
    const tarjeta = codigoDe('src/components/lumia/TarjetaRespiracion.jsx')
    const marcado = tarjeta.slice(tarjeta.indexOf('return ('))
    expect(marcado).toMatch(/<button/)
    expect(marcado).not.toMatch(/<a\b|role="button"/)
    expect(marcado).toMatch(/min-h-touch\b/)
    // Mide lo que mide su texto: no se estira al ancho de la columna, que es
    // el de los bloques del Diario. Conserva los 56 px de alto, así que
    // ceñirla no la deja sin blanco cómodo.
    expect(marcado).not.toMatch(/w-full/)
    expect(marcado).toMatch(/self-start/)
    // Destaca por luminancia sobre el fondo (RN-HOY-07), no solo por borde, y
    // se lee como invitación principal: peso de display y cuerpo grande.
    expect(marcado).toMatch(/bg-lumia-tarjeta/)
    expect(marcado).toMatch(/shadow-elev-2/)
    // El rótulo va en cursiva y un escalón por encima del conmutador: 20 px
    // frente a los 16 px de "Mañana"/"Noche". `text-lg` (25 px) se probó y era
    // demasiado para una pieza que se ciñe a su texto.
    const conmutador = codigoDe('src/components/lumia/SelectorMomento.jsx')
    expect(conmutador).toMatch(/text-base font-medium/)
    expect(marcado).toMatch(/italic/)
    expect(marcado).toMatch(/text-md font-medium/)
    expect(marcado).not.toMatch(/font-display|text-lg|text-xl/)
    // Sin subtítulo: el rótulo es toda su superficie de texto.
    expect(marcado).not.toMatch(/text-on-surface-soft/)
  })

  it('la tarjeta va entre el conmutador y la frase del día', () => {
    // El orden del héroe es fecha → conmutador → respiración → frase. La frase
    // es el aire previo a la primera pregunta del Diario, así que lo que se
    // ofrece antes de escribir va antes de ese aire y no partiéndolo.
    const heroe = codigoDe('src/components/lumia/HeroeHoy.jsx')
    const marcado = heroe.slice(heroe.indexOf('<header'))
    const orden = ['{conmutador}', '{respiracion}', '<FraseDelDia']
    const posiciones = orden.map((pieza) => marcado.indexOf(pieza))
    posiciones.forEach((p) => expect(p).toBeGreaterThan(-1))
    expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b))
    // Es un hueco propio: `conmutador` sigue siendo el conmutador y nada más.
    expect(hoy).toMatch(/respiracion=\{\s*<TarjetaRespiracion/)
    expect(hoy).toMatch(
      /conmutador=\{<SelectorMomento momento=\{momento\} onCambiar=\{setMomento\} \/>\}/,
    )
  })

  it('el conmutador se ciñe a sus dos botones dentro de la columna del héroe', () => {
    // El héroe es una columna flex y estira a sus hijos: sin `self-start`, un
    // `inline-flex` se va al ancho completo y el contratono queda como una
    // franja de borde a borde.
    expect(codigoDe('src/components/lumia/SelectorMomento.jsx')).toMatch(
      /className="self-start inline-flex/,
    )
  })

  it('la cursiva de la tarjeta es real, no la que improvisa el navegador', () => {
    // `@fontsource-variable/inter` solo trae los cortes verticales. Sin la hoja
    // itálica, `font-style: italic` se resuelve inclinando la vertical por
    // software y las curvas salen deformadas — justo lo que el manual §5.1
    // evita al fijar una familia bien servida.
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/@import '@fontsource-variable\/inter\/wght-italic\.css';/)
  })

  it('la tarjeta no nombra ni un color ni conoce el momento (RN-SURF-01)', () => {
    // La mañana y la noche se resuelven solas por los tokens de superficie del
    // tema que tenga encima. Una rama por momento serían dos que envejecen
    // distinto.
    const tarjeta = codigoDe('src/components/lumia/TarjetaRespiracion.jsx')
    const codigo = tarjeta.slice(tarjeta.indexOf('export default'))
    expect(codigo).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(codigo).not.toMatch(/momento|manana|noche|data-lumia/)
  })

  it('no queda rastro de la duración en la entrada de ninguna de las dos secciones', () => {
    // "Poco más de medio minuto" se retiró entero: era el texto que hacía leer
    // la respiración como una ficha informativa. Lo que dura se sigue diciendo
    // en la pantalla del ejercicio, antes del botón que lo arranca.
    expect(copy.lumia.respiracion.entrada.ayuda).toBeUndefined()
    expect(JSON.stringify(copy.lumia.respiracion.entrada)).not.toMatch(/minuto|segundo/i)
    expect(hoy).not.toMatch(/entrada\.ayuda/)
    expect(codigoDe('src/components/lumia/TarjetaRespiracion.jsx')).not.toMatch(/minuto/i)
  })

  it('no hay un recorrido guiado paralelo: cerrar el día es escribir la noche', () => {
    // El módulo de cinco pantallas de SPEC_07 se retiró entero. La ceremonia
    // de cierre se queda donde se escribe, al final de la sección Noche.
    expect(hoy).not.toMatch(/guiado|RitualNoche/)
    expect(copy.lumia.ritualNoche).toBeUndefined()
    expect(existsSync('src/components/lumia/RitualNoche.jsx')).toBe(false)
    expect(existsSync('src/components/lumia/ritual')).toBe(false)
    expect(existsSync('src/lumia/ritualNoche.js')).toBe(false)
    expect(codigoDe('src/components/lumia/DiarioNoche.jsx')).toMatch(/<CierreDeLaNoche/)
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

describe('las victorias y el checklist de logros se retiraron (23 ago)', () => {
  // La mañana dejó de pedir "Tres victorias que quisiera conseguir hoy", y sin
  // victorias de origen la noche no tiene nada que heredar: se fueron con ella
  // el checklist de victorias heredadas y el bloque de logros no planeados.
  //
  // El concepto no desaparece de la experiencia: lo que se logró sin haberlo
  // previsto se anota libremente en el Journal (§5.8), que no es un campo
  // estructurado y ya existía.

  it('no quedan ni los dos componentes ni el módulo de dominio', () => {
    expect(existsSync('src/components/lumia/ListaVictorias.jsx')).toBe(false)
    expect(existsSync('src/components/lumia/VictoriasHeredadas.jsx')).toBe(false)
    expect(existsSync('src/lumia/victorias.js')).toBe(false)
  })

  it('el modelo canónico no tiene dónde guardarlas', () => {
    expect(FIELDS.victory).toBeUndefined()
    expect(COLLECTIONS.victories).toBeUndefined()
    expect(FIELDS.nightRitual).not.toContain('newWins')
    expect(FIELDS.nightRitual).not.toContain('inheritedWins')
  })

  it('nadie las escribe ni las lee, en ningún espacio', () => {
    // Mismo listón que la intención: el árbol entero de Lumia más la capa de
    // datos. Si reaparecen, esta prueba falla antes que nadie las vea.
    ARCHIVOS.concat(archivosDe('src/lib/db')).forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(
        /victor|newWins|inheritedWins|lograda|soltada/i,
      ),
    )
  })

  it('el copy no ofrece ni un texto de victoria o de logro', () => {
    expect(copy.lumia.diario.manana.victorias).toBeUndefined()
    expect(copy.lumia.diario.noche.victorias).toBeUndefined()
    expect(copy.lumia.diario.noche.logros).toBeUndefined()
    expect(copy.lumia.historial.dia.victorias).toBeUndefined()
    expect(copy.lumia.historial.dia.logros).toBeUndefined()
    // Y el cierre pierde sus tres templates de recuento de logros.
    const cierre = copy.lumia.diario.noche.cierre
    expect(cierre.unLogro).toBeUndefined()
    expect(cierre.logrosTemplate).toBeUndefined()
    expect(cierre.ambosTemplate).toBeUndefined()
    expect(cierre.soloLogrosTemplate).toBeUndefined()
  })

  it('el espacio libre donde queda el concepto es el Journal, y sigue mudo', () => {
    // RN-JR-03 — El Journal no sugiere texto ni pregunta nada. Que las
    // victorias se anoten ahí no le añade un campo ni una pista.
    const journal = codigoDe('src/pages/lumia/Journal.jsx')
    expect(journal).toMatch(/CampoTexto/)
    expect(journal).not.toMatch(/victor|logro/i)
  })
})
