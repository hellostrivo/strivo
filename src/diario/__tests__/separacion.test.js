// src/diario/__tests__/separacion.test.js
// Los criterios de SPEC_06 que se comprueban leyendo el código, no ejecutándolo:
// que en el diario no haya hábitos, ni puente al alcance retirado, ni copy con
// género fijo.
//
// §C2.6, criterio 2 — "Una búsqueda de `Habit` o `HabitLog` en el árbol de
// componentes del Diario no devuelve ninguna referencia".
//
// **Revisión del paso 8 del plan de separación técnica (25 ago 2026).** La
// separación que custodia este archivo **cambia de forma, no de fondo**. Era
// RN-DB4-01: dos productos que no se leen entre sí, comprobado importe a
// importe. Con uno solo, la regla ya no puede decirse así —no hay a quién no
// leer— y pasa a decirse en positivo: el árbol del retirado no existe, y ni una
// referencia suya sobrevive en el que se queda.
//
// Las pruebas que nombraban el producto pausado **se eliminan y no se
// reescriben con su nombre**: la comprobación final del plan (§6) es que ese
// nombre no aparezca en `src/`, y un archivo de pruebas que lo deletrea la
// rompería. Lo que las sustituye vigila lo mismo sin nombrarlo.

import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { COLLECTIONS, FIELDS } from '@/lib/db/schema'

const ARBOL_DIARIO = ['src/diario', 'src/pages/diario', 'src/components/diario']

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

const ARCHIVOS = ARBOL_DIARIO.flatMap(archivosDe)

/** Recorre todas las cadenas de un namespace de copy. */
function cadenasDe(nodo, ruta = 'copy.diario') {
  if (typeof nodo === 'string') return [[ruta, nodo]]
  if (Array.isArray(nodo)) return nodo.flatMap((hijo, i) => cadenasDe(hijo, `${ruta}[${i}]`))
  if (nodo && typeof nodo === 'object') {
    return Object.entries(nodo).flatMap(([clave, hijo]) => cadenasDe(hijo, `${ruta}.${clave}`))
  }
  return []
}

const CADENAS = cadenasDe(copy.diario)

describe('el diario no sabe nada de hábitos (§C2.6, revisión 25 ago)', () => {
  it('hay archivos que revisar', () => {
    expect(ARCHIVOS.length).toBeGreaterThan(10)
  })

  it('hay un solo árbol de producto, y es este', () => {
    // Sustituye a "ningún archivo importa el otro producto", que se comprobaba
    // importe a importe en tres bloques distintos. Se dice en positivo y no
    // nombrando al retirado: la comprobación final del plan es que su nombre no
    // aparezca en `src/`, y una prueba que lo deletrea la rompería. Si el día de
    // mañana aparece un segundo árbol de producto, esta lista se entera y quien
    // lo añada tiene que volver a decidir cómo se separan.
    // Solo carpetas: los `.jsx` sueltos de la raíz y la basura del sistema de
    // archivos no son árboles de producto.
    const carpetasDe = (dir) =>
      readdirSync(dir)
        .filter((n) => statSync(join(dir, n)).isDirectory())
        .sort()

    //
    // **F-1B añade `onboarding`, y esta lista es donde se decidió.** No es un
    // segundo producto: es cómo se entra al único que hay, una vez y antes de
    // todo lo demás. Va fuera de `diario/` porque no es una de sus cuatro
    // secciones —corre antes de la app y todo lo que escribe vive en
    // `shared/`—, y `eslint.config.js` custodia esa frontera igual que las
    // otras: no puede importar ni el diario ni Respiración.
    expect(carpetasDe('src')).toEqual([
      'assets',
      'breathing',
      'components',
      'content',
      'copy',
      'diario',
      'lib',
      'onboarding',
      'pages',
      'perfil',
      'styles',
      'tokens',
    ])
    // El onboarding no añade página: no se enruta, se interpone. `App.jsx`
    // monta uno u otro y no hay URL que lleve a él.
    expect(carpetasDe('src/pages')).toEqual(['diario'])
    // **`perfil` se suma el 26 de agosto de 2026**, con la barra inferior. Es
    // gestión de cuenta, no una quinta sección del refugio: no escribe en
    // `diario/` y lo único que toca es `shared/profile`. Va fuera del árbol del
    // diario por eso, y no porque sea un producto aparte.
    expect(carpetasDe('src/components')).toEqual(['diario', 'onboarding', 'perfil', 'shared', 'ui'])
  })

  it('no aparece Habit ni HabitLog en el árbol del Diario', () => {
    // La regla de §C2.6 sobrevive intacta y es la que más valor tiene ahora:
    // vigila que el vocabulario del alcance pausado no vuelva a entrar aquí.
    ARCHIVOS.forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\bHabit(Log)?\b/)
    })
  })

  it('la pantalla Hoy no tiene ningún puente a otra sección que no exista', () => {
    const hoy = codigoDe('src/pages/diario/Hoy.jsx')
    expect(hoy).not.toMatch(/ritual de la mañana/i)
  })

  it('el copy del diario no usa vocabulario de hábitos', () => {
    const prohibido = /h[áa]bito|constancia|checklist|streak|racha|progreso/i
    CADENAS.forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(prohibido))
  })

  it('ninguna cadena del diario le dice "ritual" a nadie', () => {
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
    'src/pages/diario/Journal.jsx',
    'src/pages/diario/Historial.jsx',
    'src/components/diario/BloqueoPin.jsx',
    'src/components/diario/CuentaParaPin.jsx',
    'src/components/diario/CalendarioAnimo.jsx',
    'src/components/diario/VistaDiaCompleto.jsx',
    'src/diario/journal.js',
    'src/diario/pin.js',
    'src/diario/historial.js',
  ]

  it('existen todos los archivos que la spec nombra', () => {
    DE_SPEC_07.forEach((ruta) => expect(ARCHIVOS).toContain(ruta))
  })

  it('la vista de día completo no nombra hábitos (SPEC_07, criterio 3)', () => {
    const vista = codigoDe('src/components/diario/VistaDiaCompleto.jsx')
    expect(vista).not.toMatch(/h[áa]bito|constancia|progreso/i)
  })

  it('las dos páginas nuevas declaran su superficie (RN-SURF-02)', () => {
    expect(codigoDe('src/pages/diario/Journal.jsx')).toMatch(/data-surface="light"/)
    expect(codigoDe('src/pages/diario/Historial.jsx')).toMatch(/data-surface="light"/)
  })
})

describe('la intención del día se retiró entera (deroga SPEC_09)', () => {
  const heroe = codigoDe('src/components/diario/HeroeHoy.jsx')

  it('no queda ni componente, ni chips, ni copy, ni campo en el modelo', () => {
    expect(existsSync('src/components/diario/IntencionDelDia.jsx')).toBe(false)
    expect(existsSync('src/content/chips-intencion.js')).toBe(false)
    expect(copy.diario.intencion).toBeUndefined()
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
})

describe('el tema lo manda el conmutador, no el reloj (RN-HOY-05)', () => {
  const hoy = codigoDe('src/pages/diario/Hoy.jsx')

  it('la hora solo decide con qué sección se abre la pantalla', () => {
    expect(hoy.match(/getTimeSlot\(/g)).toHaveLength(1)
    expect(hoy).toMatch(/useState\(momentoInicial\)/)
  })

  it('ningún componente del Diario mira el reloj para elegir color', () => {
    ARCHIVOS.filter((ruta) => ruta.startsWith('src/components/diario')).forEach((ruta) => {
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
    const heroe = codigoDe('src/components/diario/HeroeHoy.jsx')
    expect(hoy).toMatch(/conmutador=\{[\s\S]{0,80}<SelectorMomento/)
    expect(heroe.indexOf('fechaLarga')).toBeLessThan(heroe.indexOf('{conmutador}'))
    expect(heroe.indexOf('{conmutador}')).toBeLessThan(heroe.indexOf('<FraseDelDia'))
  })

  it('el conmutador va en contratono, fuera de la escala de las superficies', () => {
    // `strivo-tarjeta` y `strivo-campo` son los dos escalones de luminancia que
    // usan las piezas que acompañan al fondo. El conmutador no acompaña: lo
    // contradice, y por eso no comparte escala con ninguna de ellas.
    const selector = codigoDe('src/components/diario/SelectorMomento.jsx')
    expect(selector).toMatch(/bg-strivo-conmutador/)
    expect(selector).not.toMatch(/bg-strivo-tarjeta|bg-strivo-campo/)
  })

  it('el bloque declara su propia superficie, sin nombrar un color', () => {
    // El texto de dentro se invierte con el bloque: claro sobre el bloque
    // oscuro de la mañana, oscuro sobre el bloque claro de la noche.
    const selector = codigoDe('src/components/diario/SelectorMomento.jsx')
    expect(selector).toMatch(/data-surface=\{momento === 'manana' \? 'dark' : 'light'\}/)
  })

  it('los dos colores del bloque viven en el CSS, no en el componente', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/\[data-momento='manana'\][\s\S]*?--strivo-conmutador:\s*#1D1833/)
    expect(css).toMatch(/\[data-momento='noche'\][\s\S]*?--strivo-conmutador:\s*#F2DDE7/)
  })
})

describe('el Diario se escribe en Hoy, sin paso intermedio', () => {
  const hoy = codigoDe('src/pages/diario/Hoy.jsx')

  it('las dos secciones se montan en la pantalla, no en una vista aparte', () => {
    expect(hoy).toMatch(/<DiarioManana estado=/)
    expect(hoy).toMatch(/<DiarioNoche estado=/)
    expect(hoy).not.toMatch(/vista === 'manana'|vista === 'noche'/)
  })

  it('no queda el botón que llevaba al Diario, ni su copy', () => {
    expect(copy.diario.hoy.tarjeta).toBeUndefined()
    expect(copy.diario.hoy.hecho).toBeUndefined()
    const todo = JSON.stringify(copy.diario)
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
    expect(copy.diario.manana.cierre.cta).toBe('Comenzar mi día')
    expect(codigoDe('src/components/diario/manana/AperturaDelDia.jsx')).toMatch(/textos\.cta/)
    // No está al final de ninguna pantalla de escritura.
    ;['MomentoAnimo', 'MomentoGratitud', 'MomentoIntencionAccion', 'MomentoPausa'].forEach(
      (nombre) =>
        expect(codigoDe(`src/components/diario/manana/${nombre}.jsx`)).not.toMatch(/cierre/),
    )
  })

  it('la ceremonia de cierre no era ese botón y se queda donde estaba', () => {
    // "Cerrar mi día" es el Bloque 7 de §5.4, no un paso de navegación: es la
    // ceremonia, y la ceremonia nunca falla (no-negociable 3). Cambió de
    // archivo con la actualización del 23 ago —`CierreDelDia` pasó a
    // `noche/CierreDeLaNoche`, sin recuento— pero no de sitio ni de trabajo.
    expect(copy.diario.noche.cierre.cta).toBe('Cerrar mi día')
    expect(codigoDe('src/components/diario/DiarioNoche.jsx')).toMatch(/<CierreDeLaNoche/)
    expect(existsSync('src/components/diario/CierreDelDia.jsx')).toBe(false)
  })

  it('las dos vistas empotradas no repiten el héroe ni piden salir', () => {
    const manana = codigoDe('src/components/diario/DiarioManana.jsx')
    const noche = codigoDe('src/components/diario/DiarioNoche.jsx')
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
    expect(css).toMatch(/\[data-momento='noche'\][\s\S]*?--color-breath:/)
  })

  it('la entrada a la respiración es una tarjeta seleccionable entera', () => {
    // Era un enlace en el registro de las ayudas y se pasaba por alto. Ahora es
    // un recuadro, y el recuadro **es** el control: un botón dentro de una caja
    // dejaría zona tocable sin cubrir, que es una invitación que se retira en
    // cuanto la aceptas.
    const tarjeta = codigoDe('src/components/diario/TarjetaRespiracion.jsx')
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
    expect(marcado).toMatch(/bg-strivo-tarjeta/)
    expect(marcado).toMatch(/shadow-elev-2/)
    // El rótulo baja a 16 px, en redonda y peso normal. Estaba en cursiva a
    // 20 px con peso de medio, y con la frase del día metida en su recuadro
    // había dos piezas disputándose el mismo sitio en la jerarquía: lo que la
    // tarjeta necesita es encontrarse, no ser lo más llamativo de Hoy.
    expect(marcado).toMatch(/text-base font-normal/)
    expect(marcado).not.toMatch(/font-display|text-md|text-lg|text-xl/)
    // **La cursiva se retira entera de aquí.** Es ahora la marca de la frase
    // del día, y usarla en dos sitios la dejaría sin significar nada.
    expect(marcado).not.toMatch(/italic/)
    // Sin subtítulo: el rótulo es toda su superficie de texto.
    expect(marcado).not.toMatch(/text-on-surface-soft/)
  })

  it('la tarjeta va entre el conmutador y la frase del día', () => {
    // El orden del héroe es fecha → conmutador → respiración → frase. La frase
    // es el aire previo a la primera pregunta del Diario, así que lo que se
    // ofrece antes de escribir va antes de ese aire y no partiéndolo.
    const heroe = codigoDe('src/components/diario/HeroeHoy.jsx')
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
    expect(codigoDe('src/components/diario/SelectorMomento.jsx')).toMatch(
      /className="self-start inline-flex/,
    )
  })

  it('la cursiva de la frase es real, no la que improvisa el navegador', () => {
    // `@fontsource-variable/inter` solo trae los cortes verticales. Sin la hoja
    // itálica, `font-style: italic` se resuelve inclinando la vertical por
    // software y las curvas salen deformadas — justo lo que el manual §5.1
    // evita al fijar una familia bien servida.
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/@import '@fontsource-variable\/inter\/wght-italic\.css';/)
  })

  it('la frase del día vive en un recuadro propio, teñido y en cursiva', () => {
    // Era una línea suelta entre el conmutador y la primera pregunta del
    // Diario, y como línea suelta se leía igual que todo lo demás. En un
    // recuadro deja de ser una frase más y pasa a ser el único sitio de Hoy
    // donde no hay nada que hacer.
    const frase = codigoDe('src/components/diario/FraseDelDia.jsx')
    const marcado = frase.slice(frase.indexOf('return ('))
    // La superficie es el secundario de la paleta, no un tercer escalón de la
    // escala blanca: si compartiera escala con las tarjetas, competiría con la
    // de respiración por el mismo sitio (RN-HOY-07).
    expect(marcado).toMatch(/bg-strivo-frase/)
    expect(marcado).not.toMatch(/bg-strivo-tarjeta|bg-strivo-campo|bg-raised/)
    expect(marcado).toMatch(/border-strivo-frase/)
    // Aire: relleno generoso e interlineado suelto. Lo que se lee despacio se
    // compone despacio.
    expect(marcado).toMatch(/py-6/)
    expect(marcado).toMatch(/leading-relaxed/)
    // El cuerpo es de 16 px: lo que la distingue son el recuadro, el tinte y la
    // cursiva, no el tamaño. A 20 px, con esos tres encima, se convertía en el
    // titular de la pantalla y el saludo dejaba de serlo.
    expect(marcado).toMatch(/text-base/)
    expect(marcado).not.toMatch(/text-md|text-lg|text-xl/)
    // La cursiva es suya y de nadie más en la pantalla.
    expect(marcado).toMatch(/italic/)
    expect(codigoDe('src/components/diario/TarjetaRespiracion.jsx')).not.toMatch(/italic/)
    // Sigue sin ser un control: no se toca, no lleva acción.
    expect(marcado).not.toMatch(/<button|onClick/)
  })

  it('el recuadro de la frase no nombra un color y tiene sus dos momentos', () => {
    // Como el resto del diario, pide su superficie por el papel que cumple y las
    // dos atmósferas se resuelven en el CSS (RN-SURF-01). De noche el
    // secundario entra como velo: en sólido no llegaría a AAA con ninguna de
    // las dos tintas.
    const frase = codigoDe('src/components/diario/FraseDelDia.jsx')
    expect(frase).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(frase).not.toMatch(/momento|manana|noche|data-momento/)
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/\[data-momento='manana'\][\s\S]*?--strivo-frase:/)
    expect(css).toMatch(/\[data-momento='noche'\][\s\S]*?--strivo-frase:/)
  })

  it('la tarjeta no nombra ni un color ni conoce el momento (RN-SURF-01)', () => {
    // La mañana y la noche se resuelven solas por los tokens de superficie del
    // tema que tenga encima. Una rama por momento serían dos que envejecen
    // distinto.
    const tarjeta = codigoDe('src/components/diario/TarjetaRespiracion.jsx')
    const codigo = tarjeta.slice(tarjeta.indexOf('export default'))
    expect(codigo).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(codigo).not.toMatch(/momento|manana|noche|data-momento/)
  })

  it('no queda rastro de la duración en la entrada de ninguna de las dos secciones', () => {
    // "Poco más de medio minuto" se retiró entero: era el texto que hacía leer
    // la respiración como una ficha informativa. Lo que dura se sigue diciendo
    // en la pantalla del ejercicio, antes del botón que lo arranca.
    expect(copy.diario.respiracion.entrada.ayuda).toBeUndefined()
    expect(JSON.stringify(copy.diario.respiracion.entrada)).not.toMatch(/minuto|segundo/i)
    expect(hoy).not.toMatch(/entrada\.ayuda/)
    expect(codigoDe('src/components/diario/TarjetaRespiracion.jsx')).not.toMatch(/minuto/i)
  })

  it('no hay un recorrido guiado paralelo: cerrar el día es escribir la noche', () => {
    // El módulo de cinco pantallas de SPEC_07 se retiró entero. La ceremonia
    // de cierre se queda donde se escribe, al final de la sección Noche.
    expect(hoy).not.toMatch(/guiado|RitualNoche/)
    expect(copy.diario.ritualNoche).toBeUndefined()
    expect(existsSync('src/components/diario/RitualNoche.jsx')).toBe(false)
    expect(existsSync('src/components/diario/ritual')).toBe(false)
    expect(existsSync('src/diario/ritualNoche.js')).toBe(false)
    expect(codigoDe('src/components/diario/DiarioNoche.jsx')).toMatch(/<CierreDeLaNoche/)
  })
})

describe('contraste por superficie (§5.2.3, §5.4.3, RN-SURF-01)', () => {
  it('ningún componente del diario fija un color de texto literal', () => {
    ARCHIVOS.filter((ruta) => ruta.endsWith('.jsx')).forEach((ruta) => {
      const codigo = codigoDe(ruta)
      // Las clases de color del tema claro heredado (text-ink, text-paper) y
      // cualquier hex suelto delatan un componente que decide su propio color.
      expect(`${ruta}: ${codigo}`).not.toMatch(/text-ink|text-paper|text-night|#[0-9a-f]{6}/i)
    })
  })

  it('las dos vistas del Diario declaran su superficie', () => {
    const hoy = codigoDe('src/pages/diario/Hoy.jsx')
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
    recorrer(copy.diario)

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
    recorrer(copy.diario)
  })

  it('ningún componente lee .m ni .f: todo pasa por el helper (RN-GEN-01)', () => {
    ARCHIVOS.forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\.label\.[mf]\b|copy\.[\w.]+\.[mf]\b/)
    })
  })
})

describe('la voz del diario (§3.6)', () => {
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
    expect(existsSync('src/components/diario/ListaVictorias.jsx')).toBe(false)
    expect(existsSync('src/components/diario/VictoriasHeredadas.jsx')).toBe(false)
    expect(existsSync('src/diario/victorias.js')).toBe(false)
  })

  it('el modelo canónico no tiene dónde guardarlas', () => {
    expect(FIELDS.victory).toBeUndefined()
    expect(COLLECTIONS.victories).toBeUndefined()
    expect(FIELDS.nightRitual).not.toContain('newWins')
    expect(FIELDS.nightRitual).not.toContain('inheritedWins')
  })

  it('nadie las escribe ni las lee, en ningún espacio', () => {
    // Mismo listón que la intención: el árbol entero del diario más la capa de
    // datos. Si reaparecen, esta prueba falla antes que nadie las vea.
    ARCHIVOS.concat(archivosDe('src/lib/db')).forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(
        /victor|newWins|inheritedWins|lograda|soltada/i,
      ),
    )
  })

  it('el copy no ofrece ni un texto de victoria o de logro', () => {
    expect(copy.diario.manana.victorias).toBeUndefined()
    expect(copy.diario.noche.victorias).toBeUndefined()
    expect(copy.diario.noche.logros).toBeUndefined()
    expect(copy.diario.historial.dia.victorias).toBeUndefined()
    expect(copy.diario.historial.dia.logros).toBeUndefined()
    // Y el cierre pierde sus tres templates de recuento de logros.
    const cierre = copy.diario.noche.cierre
    expect(cierre.unLogro).toBeUndefined()
    expect(cierre.logrosTemplate).toBeUndefined()
    expect(cierre.ambosTemplate).toBeUndefined()
    expect(cierre.soloLogrosTemplate).toBeUndefined()
  })

  it('el espacio libre donde queda el concepto es el Journal, y sigue mudo', () => {
    // RN-JR-03 — El Journal no sugiere texto ni pregunta nada. Que las
    // victorias se anoten ahí no le añade un campo ni una pista.
    const journal = codigoDe('src/pages/diario/Journal.jsx')
    expect(journal).toMatch(/CampoTexto/)
    expect(journal).not.toMatch(/victor|logro/i)
  })
})
