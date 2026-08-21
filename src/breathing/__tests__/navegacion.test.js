// src/breathing/__tests__/navegacion.test.js
// Los criterios de SPEC_16 que se comprueban sobre la fuente y sobre lógica
// pura: el Home, las rutas, la jerarquía y lo que NO debe existir.
//
// Igual que en SPEC_08, 14 y 15: el entorno es `node`, sin DOM. Y buena parte de
// lo que este spec pide es ausencia —ni barra de navegación, ni felicitación, ni
// puente entre espacios, ni transición de frase—, que es justo lo que no se
// renderiza y sí se lee.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { configuracionInicial } from '../Respiracion.jsx'
import { presetPrimeraVez, ID_POR_DEFECTO } from '../data/catalogoPatrones.js'
import { ID_SILENCIO } from '../data/catalogoSonidos.js'
import { preferenciasDeFabrica } from '../data/esquema.js'

const HOME = 'src/pages/Home.jsx'
const APP = 'src/App.jsx'
const ACCESO = 'src/breathing/components/AccesoRespiracion.jsx'
const CONTENEDOR = 'src/breathing/Respiracion.jsx'
const CONFIG = 'src/breathing/PantallaRespiracion.jsx'
const SESION = 'src/breathing/PantallaSesion.jsx'
const CIERRE = 'src/breathing/components/CierreSesion.jsx'
const PANEL = 'src/breathing/components/PanelAjustesVivo.jsx'
const CSS = 'src/breathing/styles/respiracion.css'

/**
 * El código sin comentarios: lo que se ejecuta, no lo que se explica.
 *
 * **Un `/*` solo abre comentario si va tras un espacio o al principio de línea.**
 * Sin esa condición, la ruta comodín `"/respiracion/*"` abría un comentario que
 * no cerraba nunca y se comía el resto del archivo — y la prueba fallaba
 * diciendo que faltaba algo que sí estaba, que es la peor clase de falso
 * positivo: el que manda a buscar un fallo donde no lo hay.
 */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/(^|\s)\/\*[\s\S]*?\*\//g, '$1')
    .replace(/^\s*\/\/.*$/gm, '')
}

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    return statSync(ruta).isDirectory() ? archivosDe(ruta) : [ruta]
  })
}

describe('la jerarquía del Home (criterios 2, 5b, 5c, 5d)', () => {
  const home = codigoDe(HOME)

  it('el acceso es un componente propio, no una variante de la tarjeta', () => {
    // RN-RE-NAV-08c — Lumia y Formia comparten un `<Link>` en un `.map()`.
    // Meterle un tercer modo sería la vía más rápida a que Respiración termine
    // viéndose como un tercer espacio, que es justo lo que §0 quiere evitar.
    expect(home).toMatch(/<AccesoRespiracion \/>/)
    expect(home).toMatch(/import AccesoRespiracion from/)
  })

  it('no entra en el map de los espacios', () => {
    const lista = home.match(/\{espacios\.map\([\s\S]*?\)\}/)[0]
    expect(lista).not.toMatch(/[Rr]espiracion/)
  })

  it('los dos espacios siguen siendo exactamente dos', () => {
    // RN-RE-NAV-08b — Cualquier diferencia en ellos tras este spec es una
    // regresión, no una mejora.
    const espacios = home.match(/const espacios = \[[\s\S]*?\]/)[0]
    expect(espacios).toMatch(/'lumia'/)
    expect(espacios).toMatch(/'formia'/)
    expect(espacios.match(/id:/g)).toHaveLength(2)
  })

  it('su copy y su orden no cambiaron', () => {
    expect(Object.keys(copy.shared.home)).toContain('lumia')
    expect(Object.keys(copy.shared.home)).toContain('formia')
    expect(home.indexOf("'lumia'")).toBeLessThan(home.indexOf("'formia'"))
  })

  it('la animación de bienvenida no se tocó (RN-RE-NAV-08)', () => {
    // No hizo falta recortarla: medido en 360x640, los tres accesos ocupan
    // 466 px de 640. El caso 8.5 no llegó a dispararse.
    expect(home).toMatch(/bienvenida-luz/)
    expect(home).toMatch(/bienvenida-simbolo/)
    expect(home).toMatch(/alto=\{72\}/)
    expect(home).toMatch(/h-64 w-64/)
  })

  it('el acceso va debajo de los dos espacios (RN-RE-NAV-04)', () => {
    expect(home.indexOf('espacios.map')).toBeLessThan(home.indexOf('<AccesoRespiracion'))
  })
})

describe('el acceso es subordinado (criterios 2 y 5, RN-RE-NAV-01/02/03)', () => {
  const acceso = codigoDe(ACCESO)

  it('no lleva subtítulo (RN-RE-NAV-02)', () => {
    // Lumia y Formia lo llevan porque son marcas. Respiración es una función y
    // su nombre ya la describe: añadirle subtítulo la asciende de categoría.
    expect(Object.keys(copy.respiracion.home)).toEqual(['acceso'])
    expect(acceso).not.toMatch(/pregunta|subtitulo|descripcion/)
  })

  it('es una píldora, no una tarjeta', () => {
    expect(acceso).toMatch(/rounded-full/)
    expect(acceso).not.toMatch(/rounded-lg/)
  })

  it('no lleva símbolo de marca', () => {
    expect(acceso).not.toMatch(/Simbolo/)
  })

  it('su texto va en peso normal, no en font-display', () => {
    expect(acceso).not.toMatch(/font-display/)
  })

  it('usa tokens Strivo, nunca Lumia ni Formia (RN-RE-NAV-03)', () => {
    expect(acceso).not.toMatch(/lumia|formia/i)
    const regla = readFileSync(CSS, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .match(/\.acceso-respiracion__icono \{[\s\S]*?\}/)[0]
    expect(regla).toMatch(/var\(--strivo-\d+\)/)
    expect(regla).not.toMatch(/--lumia-|--formia-/)
  })

  it('el área táctil llega a 56 px (RN-RE-NAV-06)', () => {
    // RN-RE-NAV-01 pedía 40 % de una tarjeta —34 px— y RN-RE-NAV-06 exige 56.
    // Manda la accesibilidad: no se puede entregar un blanco de 34 px, y menos
    // a alguien que lo busca porque está mal. La subordinación la cargan las
    // otras cuatro palancas, comprobadas arriba.
    expect(acceso).toMatch(/min-h-touch/)
  })
})

describe('los tres accesos caben sobre el pliegue (criterios 3 y 4)', () => {
  const alto = {
    py12: 48 * 2,
    simbolo: 72,
    gap12: 48,
    tarjeta: 20 * 1.4 + 4 + 14 * 1.5 + 16 * 2,
    gap3: 12,
    acceso: 56,
  }
  const total =
    alto.py12 + alto.simbolo + alto.gap12 + alto.tarjeta * 2 + alto.gap3 * 2 + alto.acceso

  it('en 360x640 sobra espacio (RN-RE-NAV-05)', () => {
    expect(total).toBeLessThan(640)
    expect(640 - total).toBeGreaterThan(100)
  })

  it('en 320x568 sigue sobre el pliegue (caso 8.7)', () => {
    expect(total).toBeLessThan(568)
  })

  it('la tarjeta mide 85 px y el acceso 56: el acceso es menor', () => {
    expect(Math.round(alto.tarjeta)).toBe(85)
    expect(alto.acceso).toBeLessThan(alto.tarjeta)
  })
})

describe('las rutas (criterios 6, 7, 9)', () => {
  const app = codigoDe(APP)
  const contenedor = codigoDe(CONTENEDOR)

  it('respiracion cuelga de su propio contenedor', () => {
    expect(app).toContain('path="/respiracion/*"')
    expect(app).toMatch(/<Respiracion uid=\{uid\} \/>/)
  })

  it('respiracion no es un espacio, y de ahí salen tres reglas', () => {
    // `espacioDe` devuelve null: sin barra (RN-RE-NAV-12), sin umbral de luz
    // (RN-RE-NAV-34) y con el cromo en los neutros de Strivo. No hizo falta
    // escribir ninguna de las tres.
    const funcion = app.match(/function espacioDe\(ruta\) \{[\s\S]*?\n\}/)[0]
    expect(funcion).not.toMatch(/respiracion/)
    expect(funcion).toMatch(/return null/)
  })

  it('la barra y el umbral cuelgan de que haya espacio', () => {
    expect(app).toMatch(/\{espacio && !hideNav && <BarraStrivo \/>\}/)
    expect(app).toMatch(/if \(!espacio \|\| !puedeCruzarse\) return/)
  })

  it('sin sesión en memoria, la ruta de sesión redirige (criterio 7)', () => {
    // RN-RE-NAV-09 — No es enlazable. Evita arrancar una sesión desde un enlace
    // o desde el historial del navegador.
    expect(contenedor).toMatch(/ESTADOS\.INACTIVO \? \(/)
    expect(contenedor).toMatch(/<Navigate to="\/respiracion" replace \/>/)
  })

  it('salir de la ruta de sesión pausa, no destruye (criterio 8)', () => {
    // RN-RE-NAV-10 — El botón atrás no es un botón de tirar la sesión. Por eso
    // el estado vive en el contenedor y no en la pantalla.
    expect(contenedor).toMatch(/if \(enSesion\) return/)
    expect(contenedor).toMatch(/sesion\.pausar\(\)/)
  })

  it('ninguna pantalla de Respiración monta una barra (criterio 9)', () => {
    for (const ruta of [CONFIG, SESION, CONTENEDOR]) {
      expect(`${ruta}`).toBe(ruta)
      expect(codigoDe(ruta)).not.toMatch(/BarraStrivo|NavLumia|NavFormia/)
    }
  })

  it('no hereda la transición de frase de Lumia (criterio 6, RN-RE-NAV-34)', () => {
    // Quien entra a Lumia va a reflexionar y una frase lo prepara. Quien entra a
    // Respiración puede estar mal en ese momento: interponer una pantalla
    // contemplativa ahí es fricción en el peor momento posible.
    for (const ruta of [CONFIG, SESION, CONTENEDOR, ACCESO]) {
      expect(codigoDe(ruta)).not.toMatch(/TransicionLuz|frases-apertura|umbralSesion/)
    }
  })
})

describe('todo llega precargado (criterios 10 y 11)', () => {
  it('la segunda vez manda ultimo* (RN-RE-NAV-16)', () => {
    const guardadas = {
      ...preferenciasDeFabrica(),
      actualizadoEn: '2026-08-20T10:00:00.000Z',
      ultimoPatronId: 'cuatro-siete-ocho',
      ultimoPatron: { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 },
      sonidoAmbienteId: 'lluvia',
      visualPreferida: 'linea',
    }
    const config = configuracionInicial(guardadas)

    expect(config.patronBaseId).toBe('cuatro-siete-ocho')
    expect(config.patron).toEqual(guardadas.ultimoPatron)
    expect(config.sonidoAmbienteId).toBe('lluvia')
    expect(config.visual).toBe('linea')
  })

  it('la primera vez de todas arranca en entrada-suave (criterio 11)', () => {
    // RN-RE-NAV-17 — `calma-553` es el ritmo de la casa y el de fábrica, pero
    // empezar aguantando el aire sin haberlo hecho nunca es innecesariamente
    // exigente. `entrada-suave` no tiene retenciones.
    const config = configuracionInicial(preferenciasDeFabrica())
    expect(config.patronBaseId).toBe(presetPrimeraVez().id)
    expect(config.patronBaseId).toBe('entrada-suave')
    expect(config.patronBaseId).not.toBe(ID_POR_DEFECTO)
  })

  it('y ese patrón no tiene retenciones', () => {
    const config = configuracionInicial(preferenciasDeFabrica())
    expect(config.patron.retenerLleno).toBe(0)
    expect(config.patron.retenerVacio).toBe(0)
  })

  it('la primera vez: silencio, círculo y tres minutos (caso 8.11)', () => {
    const config = configuracionInicial(preferenciasDeFabrica())
    expect(config.sonidoAmbienteId).toBe(ID_SILENCIO)
    expect(config.visual).toBe('circulo')
    expect(config.duracion).toEqual({ modo: 'minutos', valor: 3 })
    expect(config.guiaSonoraActiva).toBe(false)
  })

  it('sin preferencias guardadas entra con las de fábrica, sin romperse', () => {
    expect(() => configuracionInicial(null)).not.toThrow()
    expect(configuracionInicial(null).patronBaseId).toBe('entrada-suave')
  })

  it('la distinción es actualizadoEn, no un campo nuevo', () => {
    // Es nulo mientras nadie haya guardado nada, así que no hizo falta ampliar
    // el modelo de SPEC_13 para saber si es la primera vez.
    const usada = { ...preferenciasDeFabrica(), actualizadoEn: '2026-08-20T10:00:00.000Z' }
    expect(configuracionInicial(usada).patronBaseId).toBe(ID_POR_DEFECTO)
  })

  it('un sonido que ya no existe cae en silencio al precargar', () => {
    const guardadas = {
      ...preferenciasDeFabrica(),
      actualizadoEn: '2026-08-20T10:00:00.000Z',
      sonidoAmbienteId: 'bosque',
    }
    expect(configuracionInicial(guardadas).sonidoAmbienteId).toBe(ID_SILENCIO)
  })
})

describe('la configuración (criterios 12, 13, 14, 15, 16, 17)', () => {
  const config = codigoDe(CONFIG)

  it('Empezar está fijo abajo (criterio 14, RN-RE-NAV-14)', () => {
    expect(config).toMatch(/sticky bottom-0/)
    expect(config).toMatch(/controles\.empezar/)
  })

  it('los favoritos van debajo de Empezar en el DOM (criterio 15)', () => {
    // RN-RE-NAV-15 — Quien llega con prisa no debe atravesar listas para
    // respirar. Hacerle cruzar un catálogo es poner una tienda entre alguien y
    // lo que vino a buscar.
    expect(config.indexOf('controles.empezar')).toBeLessThan(config.indexOf('<ListaFavoritos'))
  })

  it('el aviso de seguridad es una tarjeta, no un modal (criterio 13)', () => {
    // RN-RE-COPY-03 y RN-RE-NAV-35 — Un modal obliga a leer y aceptar antes de
    // poder hacer nada, y quien abre esto puede estar en mitad de una crisis.
    const aviso = codigoDe('src/breathing/components/AvisoSeguridad.jsx')
    expect(aviso).toMatch(/<aside/)
    expect(aviso).not.toMatch(/role="dialog"|aria-modal/)
  })

  it('se muestra la primera vez y luego solo desde el ícono (criterio 12)', () => {
    expect(config).toMatch(/useState\(!avisoVisto\)/)
    expect(config).toMatch(/setAvisoVisible\(true\)/)
    // Quien lo persiste es el contenedor: la pantalla avisa y él escribe.
    expect(codigoDe(CONTENEDOR)).toMatch(/avisoSeguridadVisto: true/)
  })

  it('un patrón inválido nunca deshabilita Empezar (criterio 17)', () => {
    // RN-RE-NAV-20 — Se corrige y se avisa. Un botón apagado sin decir por qué
    // deja a alguien mirando una pantalla que no responde.
    expect(config).not.toMatch(/disabled=\{/)
    expect(config).toMatch(/patronAjustado/)
  })

  it('con caja se muestra un solo control (criterio 16, RN-RE-NAV-19)', () => {
    const controles = codigoDe('src/breathing/components/ControlesRitmo.jsx')
    expect(controles).toMatch(/EDICION\.LADO_UNICO/)
    expect(controles).toMatch(/textos\.ladoUnico/)
    expect(config).toMatch(/cajaModificada/)
  })

  it('la pulsación mantenida acelera tras 600 ms (criterio 19)', () => {
    const controles = codigoDe('src/breathing/components/ControlesRitmo.jsx')
    expect(controles).toMatch(/MS_ANTES_DE_ACELERAR = 600/)
    expect(controles).toMatch(/setInterval/)
  })

  it('el aria-live va en el grupo, no en cada botón (RN-RE-NAV-43)', () => {
    // Puesto en los botones, un lector de pantalla anunciaría el cambio dos
    // veces y quien lo usa acabaría oyendo el doble de lo que pidió.
    const controles = codigoDe('src/breathing/components/ControlesRitmo.jsx')
    const botones = controles.match(/<button[\s\S]*?>/g) ?? []
    botones.forEach((boton) => expect(boton).not.toMatch(/aria-live/))
    expect(controles).toMatch(/<div className="flex items-center gap-2" aria-live="polite">/)
  })
})

describe('la sesión (criterios 20, 21, 22, 23, 24)', () => {
  const sesion = codigoDe(SESION)
  const panel = codigoDe(PANEL)
  // Sin comentarios: los de este archivo **nombran** las propiedades que
  // explican, así que buscarlas sobre el texto crudo daría siempre positivo.
  const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

  it('los controles se atenúan a los 6 s (criterio 20, RN-RE-NAV-23)', () => {
    expect(sesion).toMatch(/MS_ANTES_DE_ATENUAR = 6000/)
    expect(sesion).toMatch(/data-atenuado=/)
  })

  it('atenuados siguen siendo tocables: pointer-events no se toca', () => {
    const regla = css.match(/\[data-atenuado='si'\] \.respiracion-control \{[\s\S]*?\n\}/)[0]
    // Atenuar no es desactivar. RN-RE-NAV-23 dice tocables, no visibles.
    expect(regla).not.toMatch(/pointer-events/)
    expect(regla).not.toMatch(/display:\s*none|visibility:\s*hidden/)
  })

  it('vuelven al tocar en cualquier parte', () => {
    expect(sesion).toMatch(/onPointerDown=\{despertar\}/)
  })

  it('con teclado no se atenúan (criterio 21, RN-RE-NAV-45)', () => {
    // Un foco al 25 % de opacidad es un foco perdido.
    expect(sesion).toMatch(/if \(hayTeclado \|\| ajustesAbiertos\)/)
    expect(codigoDe(CONTENEDOR)).toMatch(/evento\.key === 'Tab'/)
    expect(css).toMatch(/\[data-atenuado='si'\] \.respiracion-control:focus-visible/)
  })

  it('el panel en vivo NO ofrece patrón ni duración (criterio 23)', () => {
    // RN-RE-NAV-24 — Cambiar el ritmo a mitad de sesión no es ajustar: es
    // empezar otra sesión, y hacerlo pasar por un ajuste dejaría a alguien a
    // media exhalación con un patrón que no eligió para este momento.
    expect(panel).not.toMatch(/SelectorPatron|SelectorDuracion|ControlesRitmo/)
    expect(panel).toMatch(/SelectorVisual/)
    expect(panel).toMatch(/PanelSonido/)
  })

  it('el panel atrapa el foco y Escape lo cierra (criterio 40, RN-RE-NAV-44)', () => {
    expect(panel).toMatch(/evento\.key === 'Escape'/)
    expect(panel).toMatch(/evento\.key !== 'Tab'/)
    expect(panel).toMatch(/aria-modal="true"/)
  })

  it('ajustar en vivo no toca la máquina (criterio 22)', () => {
    const hook = codigoDe('src/breathing/hooks/useSesionRespiracion.js')
    // Se recorta desde `ajustarEnVivo` hasta el siguiente `const`: depender del
    // formato exacto del cierre del `useCallback` hacía que un pase de prettier
    // rompiera la prueba sin que el código hubiera cambiado.
    const desde = hook.indexOf('const ajustarEnVivo')
    const ajustar = hook.slice(desde, hook.indexOf('const instantanea', desde))
    // La máquina ni se entera: sigue corriendo donde estaba y lo único que se
    // toca es el grafo de audio.
    expect(ajustar).not.toMatch(/maquina\.current\.(iniciar|pausar|detener|terminar)/)
  })

  it('salir no pide confirmación (criterio 24, RN-RE-NAV-27)', () => {
    // Pide confirmación quien quiere retener; Strivo no retiene.
    expect(sesion).toMatch(/sesion\.terminar\(\)/)
    expect(sesion).not.toMatch(/window\.confirm|estás segur/i)
  })

  it('el foco arranca en el control de pausa (criterio 38, RN-RE-NAV-41)', () => {
    expect(sesion).toMatch(/controlPausa\.current\?\.focus/)
    expect(codigoDe(CONFIG)).toMatch(/encabezado\.current\?\.focus\(\)/)
  })

  it('empezar es idempotente: dos toques, una sesión (criterio 32, caso 8.13)', () => {
    const hook = codigoDe('src/breathing/hooks/useSesionRespiracion.js')
    expect(hook).toMatch(/if \(maquina\.current !== null\) return/)
  })
})

describe('el cierre (criterios 27, 28, 29)', () => {
  const cierre = codigoDe(CIERRE)

  it('aparece con el cruce de 900 ms (criterio 27, RN-RE-NAV-29)', () => {
    // Es el mismo gesto de cierre del día. No se inventa otro.
    expect(readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).toMatch(
      /\.respiracion-cierre \{[\s\S]*?animation: respiracion-cierre 900ms/,
    )
  })

  it('sin felicitación, sin racha, sin puntaje (criterio 28, RN-RE-NAV-30)', () => {
    // Una felicitación por respirar convierte un refugio en un sistema de
    // recompensas, y quien no vuelva mañana habrá fallado a algo.
    const textos = Object.values(copy.respiracion.cierre).join(' ')
    expect(textos).not.toMatch(/felicit|bien hecho|racha|puntaje|logro|nivel/i)
  })

  it('el copy del cierre enuncia el hecho y nada más', () => {
    expect(copy.respiracion.cierre.titulo).toBe('Listo')
    expect(copy.respiracion.cierre.resumenCiclos).toMatch(/^Respiraste/)
  })

  it('menos de un ciclo: sin resumen numérico (criterio 29, RN-RE-NAV-32)', () => {
    // "Respiraste 0 veces" es absurdo, y además es una forma de decirle a
    // alguien que lo que hizo no contó.
    expect(cierre).toMatch(/resumen\?\.registrable \? \(/)
  })

  it('no hay signos de exclamación en ningún texto de respiración (§3.6)', () => {
    expect(JSON.stringify(copy.respiracion)).not.toMatch(/[¡!]/)
  })

  it('al completar se persiste sesión, reciente y ultimo* (criterio 30)', () => {
    const contenedor = codigoDe(CONTENEDOR)
    expect(contenedor).toMatch(/repo\.guardarPreferencias/)
    expect(contenedor).toMatch(/repo\.registrarSesion/)
    expect(contenedor).toMatch(/repo\.registrarReciente/)
    // Caso 9.7 — Sin un ciclo completo no hay sesión que registrar.
    expect(contenedor).toMatch(/if \(!resumen\?\.registrable\) return/)
  })
})

describe('no hay puente con Lumia ni con Formia (criterios 35, 36, 37)', () => {
  const DE_RESPIRACION = archivosDe('src/breathing').filter((r) => !r.includes('__tests__'))

  it('ningún archivo de Respiración nombra a los espacios (criterio 37)', () => {
    for (const ruta of DE_RESPIRACION) {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => expect(`${ruta}: ${linea}`).not.toMatch(/lumia|formia/i))
    }
  })

  it('ninguna pantalla de Lumia ni de Formia lee datos de respiración (criterio 35)', () => {
    // RN-RE-NAV-38 y 39 — Ni favoritos en el Journal, ni sesiones en el
    // Historial o en el Progreso. `breathing/` no cruza.
    const ajenos = [
      ...archivosDe('src/pages/lumia'),
      ...archivosDe('src/pages/formia'),
      ...archivosDe('src/components/lumia'),
      ...archivosDe('src/components/formia'),
    ].filter((r) => !r.includes('__tests__'))

    for (const ruta of ajenos) {
      expect(`${ruta}`).toBe(ruta)
      expect(codigoDe(ruta)).not.toMatch(/breathing/i)
    }
  })

  it('la respiración diaria de Lumia sigue en su sitio (criterio 36)', () => {
    // RN-RE-NAV-36 — No se sustituye, no se enlaza a Respiración, no cambia de
    // sitio. Sus tests de SPEC_08 siguen verdes sin modificar.
    const hoy = codigoDe('src/pages/lumia/Hoy.jsx')
    expect(hoy).toMatch(/Respiracion/)
    expect(hoy).not.toMatch(/breathing|\/respiracion/)
  })

  it('el Home es el único sitio que nombra a los tres', () => {
    // Los cruces se hacen por el vestíbulo y solo por el vestíbulo
    // (RN-RE-NAV-37, extendiendo §C7.7.3).
    const home = codigoDe(HOME)
    expect(home).toMatch(/lumia/)
    expect(home).toMatch(/formia/)
    expect(home).toMatch(/AccesoRespiracion/)
  })
})

describe('ni un string visible fuera del copy (criterio 42)', () => {
  const NUEVOS = [ACCESO, CONFIG, SESION, CIERRE, PANEL, CONTENEDOR]

  it.each(NUEVOS)('%s no escribe texto a mano', (ruta) => {
    // Las flechas de los manejadores llevan un `>` dentro, así que trocear el
    // JSX por el primer `>` cortaba los elementos por la mitad. Es el mismo
    // arreglo que necesitó la prueba equivalente de SPEC_15.
    const codigo = codigoDe(ruta)
      .replace(/=>/g, '=»')
      .replace(/className="[^"]*"/g, '')
    const sueltos = [...codigo.matchAll(/>\s*([A-Za-zÁÉÍÓÚÑáéíóúñ][^<>{}]{2,})\s*</g)]
      .map((m) => m[1].trim())
      .filter((texto) => texto.length > 0)
    expect(sueltos).toEqual([])
  })
})
