// src/breathing/__tests__/navegacion.test.js
// Los criterios de SPEC_16 que se comprueban sobre la fuente y sobre lógica
// pura: las rutas, la pantalla y lo que NO debe existir.
//
// **Revisado el 24 ago, cuando Respiración se mudó al espacio Lumia.** Lo que
// se fue con el acceso del Home —criterios 2, 3, 4, 5 y toda la familia
// RN-RE-NAV-01..08c— está abajo, en su propio bloque, comprobado en negativo:
// una prueba que falla si el tercer acceso reaparece sin que nadie lo decida.
//
// **Revisión del paso 8 del plan de separación técnica (25 ago 2026).** Aquel
// bloque leía `Home.jsx` para comprobar que el vestíbulo había vuelto a tener
// dos accesos, y el vestíbulo entero se retiró en la tanda 1 de este mismo
// paso: el archivo ya no existe y este no llegaba ni a cargar. Se quedan las
// cuatro comprobaciones que no dependían de él. Cae con el vestíbulo el bloque
// de "el Home es el único sitio que ve los dos espacios", y con la barra
// inferior, las dos aserciones que colgaban de ella.
//
// Igual que en SPEC_08, 14 y 15: el entorno es `node`, sin DOM. Y buena parte de
// lo que este spec pide es ausencia —ni barra de navegación, ni felicitación, ni
// puente entre espacios, ni transición de frase—, que es justo lo que no se
// renderiza y sí se lee.

import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { configuracionInicial } from '../Respiracion.jsx'
import { presetPrimeraVez, ID_POR_DEFECTO } from '../data/catalogoPatrones.js'
import { ID_SILENCIO } from '../data/catalogoSonidos.js'
import { preferenciasDeFabrica } from '../data/esquema.js'

const APP = 'src/App.jsx'
const CONTENEDOR = 'src/breathing/Respiracion.jsx'
const CONFIG = 'src/breathing/PantallaRespiracion.jsx'
const SESION = 'src/breathing/PantallaSesion.jsx'
const CIERRE = 'src/breathing/components/CierreSesion.jsx'
const PANEL = 'src/breathing/components/PanelAjustesVivo.jsx'
const CSS = 'src/breathing/styles/respiracion.css'
const NAV_SECCIONES = 'src/components/diario/NavStrivo.jsx'
const BLOQUE = 'src/breathing/components/Bloque.jsx'

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

describe('el acceso del vestíbulo se retiró entero (24 ago)', () => {
  const app = codigoDe(APP)

  // **Se eliminan las tres pruebas que leían `Home.jsx`** —dos accesos y solo
  // dos, las dos tarjetas intactas, la animación de bienvenida sin tocar—.
  // Custodiaban que el tercer acceso no volviera a colarse **en el vestíbulo**,
  // y el vestíbulo se fue entero al quedar un solo producto: sin dos espacios
  // entre los que elegir no hay sala de espera que vigilar. RN-RE-NAV-08 y 08b
  // se derogan con él, como ya lo estaban 01 a 08c desde el 24 ago.
  //
  // Lo que sigue vigente es todo lo que no dependía de aquella pantalla: que la
  // pieza no exista, que no tenga copy, que no tenga ruta suelta y que su regla
  // de CSS se fuera con ella.

  it('el componente del acceso ya no existe', () => {
    expect(existsSync('src/breathing/components/AccesoRespiracion.jsx')).toBe(false)
  })

  it('y tampoco existe su copy', () => {
    expect(copy.respiracion.home).toBeUndefined()
  })

  // **Se elimina la mitad que comprobaba que no tuviera "ruta suelta"**
  // (`path="/respiracion/*"`). Decía que Respiración no colgaba de la raíz junto
  // a los dos espacios, y con el renombrado del paso 9 las cuatro secciones
  // cuelgan de la raíz: la ruta de Respiración y la que aquella prueba prohibía
  // son ahora la misma cadena, así que ya no distingue nada.
  //
  // Lo que aquella regla protegía —que es una sección y no una categoría propia—
  // sobrevive con esta: entra por la misma puerta que las otras tres, y su sitio
  // en la lista lo custodia el bloque de la cabecera, más abajo.
  it('entra por la cabecera, como las otras tres secciones', () => {
    expect(codigoDe(NAV_SECCIONES)).toContain("ruta: '/respiracion'")
    expect(app).toContain('path="/respiracion/*"')
  })

  it('el anillo del acceso se fue del CSS con él', () => {
    // Sin comentarios: la cabecera de esa sección **nombra** la clase para
    // contar que se retiró, y buscarla sobre el texto crudo daría positivo
    // siempre. Es el mismo recorte que usa el bloque de la sesión más abajo.
    const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(/acceso-respiracion__icono/)
  })
})

describe('la pestaña de Lumia (24 ago)', () => {
  const nav = codigoDe(NAV_SECCIONES)

  it('Respiración va entre Journal e Historial', () => {
    const secciones = nav.match(/const SECCIONES = \[[\s\S]*?\]/)[0]
    expect(secciones.indexOf("'journal'")).toBeLessThan(secciones.indexOf("'respiracion'"))
    expect(secciones.indexOf("'respiracion'")).toBeLessThan(secciones.indexOf("'historial'"))
  })

  it('apunta a la ruta que monta App', () => {
    expect(nav).toContain("ruta: '/respiracion'")
    expect(codigoDe(APP)).toContain('path="/respiracion/*"')
  })

  it('las cuatro secciones tienen rótulo', () => {
    const secciones = copy.shared.navegacion.diario.secciones
    expect(Object.keys(secciones)).toEqual(['hoy', 'journal', 'respiracion', 'historial'])
    Object.values(secciones).forEach((rotulo) => expect(rotulo.length).toBeGreaterThan(0))
  })
})

describe('las rutas (criterios 6, 7, 9)', () => {
  const app = codigoDe(APP)
  const contenedor = codigoDe(CONTENEDOR)

  it('respiracion cuelga de su propio contenedor, dentro de Lumia', () => {
    expect(app).toContain('path="/respiracion/*"')
    expect(app).toMatch(/<Respiracion\b/)
  })

  it('el contenedor no escribe su propia ruta: la recibe', () => {
    // Es lo que le permitió mudarse de espacio sin nombrar a ninguno. `base` y
    // `salida` los pone quien enruta, que es el único que sabe dónde vive.
    expect(app).toMatch(/base=\{RUTA_RESPIRACION\}/)
    expect(app).toMatch(/salida=\{INICIO\}/)
    expect(contenedor).toMatch(/\$\{base\}\/sesion/)
  })

  it('su ruta cuelga de la misma raíz que el resto, y de ahí sale su cromo', () => {
    // Antes `espacioDe` devolvía null para la ruta de Respiración y eso daba
    // gratis tres reglas de SPEC_16: sin barra, sin umbral y con los neutros de
    // Strivo. Al colgarla de la misma raíz que las demás secciones las tres se
    // invirtieron, **que es lo que se pidió**: la herramienta tiene que sentirse
    // nativa de su sección.
    //
    // **Revisión del paso 8 (25 ago):** `espacioDe()` se retiró con el vestíbulo
    // —no queda entre qué decidir— y la comprobación pasa de la función a la
    // ruta, que es de donde salía la respuesta. Su cromo es ahora el de la app.
    expect(app).not.toMatch(/espacioDe/)
    expect(app).toContain('path="/respiracion/*"')
    expect(app).toMatch(/const RUTA_RESPIRACION = '\/respiracion'/)
  })

  it('el umbral lo cruza la app al abrirse, y esta sección no lo repite', () => {
    // **Se elimina la mitad de este caso que hablaba de la barra inferior**: la
    // barra se retiró con el vestíbulo y RN-RE-NAV-12 —dentro de Respiración no
    // hay barra— se cumple ahora porque no la hay en ninguna parte.
    //
    // La otra mitad sobrevive y es la que importa (RN-RE-NAV-34): el umbral se
    // cruza una vez por sesión al abrir la app, así que entrar aquí no interpone
    // nada que no interpusiera ya el Journal.
    expect(app).toMatch(/umbralPendiente\('diario'\)/)
    expect(app).toMatch(/cruzarUmbral\('diario'\)/)
    expect(codigoDe(CONTENEDOR)).not.toMatch(/umbral/i)
  })

  it('la sesión oculta el cromo, como el Journal al escribir (RN-RE-NAV-21)', () => {
    // Con la pestaña dentro de un espacio hay cabecera arriba y barra abajo. En
    // la pantalla de configuración están bien; durante la sesión no, porque lo
    // único que hay que hacer ahí es seguir un ritmo.
    expect(contenedor).toMatch(/onHideNav\?\.\(enSesion\)/)
    expect(app).toMatch(/onHideNav=\{setHideNav\}/)
  })

  it('sin sesión en memoria, la ruta de sesión redirige (criterio 7)', () => {
    // RN-RE-NAV-09 — No es enlazable. Evita arrancar una sesión desde un enlace
    // o desde el historial del navegador.
    expect(contenedor).toMatch(/ESTADOS\.INACTIVO \? \(/)
    expect(contenedor).toMatch(/<Navigate to=\{base\} replace \/>/)
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
      expect(codigoDe(ruta)).not.toMatch(/BarraStrivo|NavStrivo/)
    }
  })

  it('no monta la transición de frase de Lumia (criterio 6, RN-RE-NAV-34)', () => {
    // Quien entra a Lumia va a reflexionar y una frase lo prepara. Quien abre
    // Respiración puede estar mal en ese momento: interponer una pantalla
    // contemplativa ahí es fricción en el peor momento posible.
    //
    // Sigue en pie con la pestaña dentro del espacio. El umbral lo cruza `App`
    // al **entrar al espacio**, una vez por sesión (`umbralSesion`), así que
    // abrir esta sección no encadena nada que no encadenara ya el Journal.
    for (const ruta of [CONFIG, SESION, CONTENEDOR]) {
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
    expect(config).toMatch(/respiracion-accion sticky/)
    expect(config).toMatch(/controles\.empezar/)
  })

  it('y no a bottom-0, que lo dejaba debajo de la barra del espacio', () => {
    // Dentro de Lumia hay una barra fija al pie. El desplazamiento vive en el
    // CSS y no en una clase suelta porque es exactamente el alto de esa barra.
    const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const regla = css.match(/\.respiracion-accion \{[\s\S]*?\n\}/)[0]
    expect(regla).toMatch(/bottom: calc\(56px \+ env\(safe-area-inset-bottom/)
    expect(config).not.toMatch(/sticky bottom-0/)
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

describe('no hay puente con el diario (criterios 35, 36, 37)', () => {
  const DE_RESPIRACION = archivosDe('src/breathing').filter((r) => !r.includes('__tests__'))

  it('ningún archivo de Respiración nombra a la sección que lo monta (criterio 37)', () => {
    // La lista de "no puede importar" pierde una entrada por el mismo recorte
    // que hizo `eslint.config.js`: queda un solo producto al que no alcanzar.
    for (const ruta of DE_RESPIRACION) {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => expect(`${ruta}: ${linea}`).not.toMatch(/diario/i))
    }
  })

  it('ninguna pantalla del diario lee datos de respiración (criterio 35)', () => {
    // RN-RE-NAV-38 y 39 — Ni favoritos en el Journal, ni sesiones en el
    // Historial. `breathing/` no cruza.
    const ajenos = [
      ...archivosDe('src/pages/diario'),
      ...archivosDe('src/components/diario'),
    ].filter((r) => !r.includes('__tests__'))

    for (const ruta of ajenos) {
      expect(`${ruta}`).toBe(ruta)
      expect(codigoDe(ruta)).not.toMatch(/breathing/i)
    }
  })

  it('la respiración diaria de Lumia sigue en su sitio (criterio 36)', () => {
    // RN-RE-NAV-36 — No se sustituye, no se enlaza a Respiración, no cambia de
    // sitio. Sus tests de SPEC_08 siguen verdes sin modificar.
    const hoy = codigoDe('src/pages/diario/Hoy.jsx')
    expect(hoy).toMatch(/Respiracion/)
    expect(hoy).not.toMatch(/breathing|\/respiracion/)
  })

  // **Se elimina "el Home sigue siendo el único sitio que ve los dos
  // espacios".** RN-RE-NAV-37 decía que los cruces se hacen por el vestíbulo y
  // solo por el vestíbulo; sin dos espacios no hay cruce que encauzar, y sin
  // vestíbulo no hay por dónde. Lo único que quedaba vivo de ese caso —que a
  // Respiración la nombra la navegación de su sección— ya lo comprueba
  // "apunta a la ruta que monta App", arriba.
})

describe('la elección se ve (24 ago)', () => {
  const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const SELECTORES = {
    patron: 'src/breathing/components/SelectorPatron.jsx',
    visual: 'src/breathing/components/SelectorVisual.jsx',
    duracion: 'src/breathing/components/SelectorDuracion.jsx',
    sonido: 'src/breathing/components/PanelSonido.jsx',
  }

  it('los cuatro selectores llevan la clase que el CSS pinta', () => {
    // **`data-elegido` estaba puesto desde SPEC_16 y no había una sola regla que
    // lo pintara.** La elección existía en el `aria-pressed`, es decir para
    // quien escucha la pantalla y no para quien la mira: tocar un sonido o una
    // duración no cambiaba absolutamente nada. Esto es lo que faltaba.
    Object.entries(SELECTORES).forEach(([, ruta]) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}`).toBe(ruta)
      expect(codigo).toMatch(/respiracion-opcion/)
      expect(codigo).toMatch(/data-elegido=\{/)
    })
  })

  it('la regla existe y lleva tres señales, nunca solo el color', () => {
    // Criterio 7 de SPEC_11 y RN-RE-VIS-17: superficie, borde de acento y peso.
    const regla = css.match(/\.respiracion-opcion\[data-elegido='si'\] \{[\s\S]*?\n\}/)[0]
    expect(regla).toMatch(/background-color:/)
    expect(regla).toMatch(/border-color: var\(--espacio-acento\)/)
    expect(regla).toMatch(/font-weight:/)
  })

  it('pesa más que la utilidad de Tailwind que le pone el borde', () => {
    // Las utilidades se generan después de esta hoja, así que `[data-elegido]`
    // a secas perdía contra el `border-on-surface` del propio botón y el borde
    // de acento no llegaba a verse. Con clase propia pesa dos y gana.
    expect(css).toMatch(/\.respiracion-opcion\[data-elegido='si'\]/)
    expect(css).not.toMatch(/^\[data-elegido='si'\] \{/m)
  })

  it('el sonido elegido además lleva palomita', () => {
    const panel = codigoDe(SELECTORES.sonido)
    expect(panel).toMatch(/respiracion-palomita/)
    // Va `aria-hidden`: `aria-pressed` ya lo dice, y anunciarlo dos veces es
    // ruido para quien escucha.
    expect(panel).toMatch(/aria-hidden="true" className="respiracion-palomita"/)
    // Se dibuja, no se escribe: así no hay un carácter suelto fuera de copy/.
    const palomita = css.match(/\.respiracion-palomita::after \{[\s\S]*?\n\}/)[0]
    expect(palomita).toMatch(/content: ''/)
    expect(palomita).toMatch(/border-right|border-bottom/)
  })

  it('solo puede haber un sonido y una duración elegidos a la vez', () => {
    // No es una regla del CSS sino del modelo: `sonidoAmbienteId` y
    // `duracion.modo` son un valor, no una lista, así que la exclusividad no se
    // puede romper desde la interfaz.
    const panel = codigoDe(SELECTORES.sonido)
    expect(panel).toMatch(/const elegido = entrada\.id === sonidoId/)
    expect(codigoDe(SELECTORES.duracion)).toMatch(/duracion\.modo === modo/)
  })

  it('con movimiento reducido no hay transición, y con contraste alto hay contorno', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.respiracion-opcion,/)
    expect(css).toMatch(
      /@media \(prefers-contrast: more\) \{\s*\.respiracion-opcion\[data-elegido='si'\]/,
    )
  })
})

describe('el sonido suena de verdad (24 ago)', () => {
  const hook = codigoDe('src/breathing/hooks/useSesionRespiracion.js')
  const motor = codigoDe('src/breathing/audio/motorAmbiente.js')
  const contenedor = codigoDe(CONTENEDOR)
  const config = codigoDe(CONFIG)

  it('la vista previa está cableada de punta a punta (RN-RE-SND-27)', () => {
    // **Estaba construida entera y no la llamaba nadie.** La pantalla declaraba
    // `vistaPreviaSonido` desde SPEC_16 y el contenedor nunca se la pasaba, así
    // que elegir un sonido antes de empezar era mudo: lo único que se oía era
    // ya dentro de la sesión.
    expect(hook).toMatch(/const vistaPreviaSonido = useCallback/)
    expect(hook).toMatch(/vistaPreviaSonido,/)
    expect(contenedor).toMatch(/vistaPreviaSonido=\{sesion\.vistaPreviaSonido\}/)
    expect(config).toMatch(/vistaPreviaSonido\?\.\(sonidoAmbienteId\)/)
  })

  it('el contexto se reanuda al pedirlo, no solo se adquiere', () => {
    // `adquirir()` puede devolver un contexto **que ya existía** —lo creó la
    // respiración diaria de Lumia, o esta pantalla antes de que el teléfono se
    // bloqueara— y uno reutilizado llega suspendido: sin error y sin sonido.
    // Era la mitad del "a veces suena y a veces no".
    const asegurar = hook.slice(
      hook.indexOf('const asegurarAudio'),
      hook.indexOf('const soltarTodo'),
    )
    expect(asegurar).toMatch(/adquirir\(\)/)
    expect(asegurar).toMatch(/reanudar\(\)/)
  })

  it('un solo motor de ambiente para la vista previa y la sesión', () => {
    // Dos motores sobre el mismo contexto son dos grafos sonando a la vez, que
    // es exactamente cómo se superponen los sonidos. `empezar()` reutiliza el
    // que montó la vista previa en vez de crear otro.
    expect(hook).toMatch(/const motor = asegurarAudio\(\)/)
    const empezar = hook.slice(
      hook.indexOf('const empezar = useCallback'),
      hook.indexOf('const pausar'),
    )
    expect(empezar).not.toMatch(/crearMotorAmbiente/)
  })

  it('empezar tras escuchar un sonido no lo deja enmudecer a los 20 s', () => {
    // La fuente que suena es la de la vista previa y su temporizador sigue
    // vivo. `confirmarSonido` lo cancela sin cortar lo que ya suena.
    expect(motor).toMatch(/confirmarSonido\(id\) \{\s*cancelarPrevia\(\)/)
    expect(hook).toMatch(/motor\.confirmarSonido\(sonido\)/)
  })

  it('cambiar de sonido suelta el anterior antes de montar el nuevo (caso 6.3)', () => {
    // Cinco toques seguidos dejan exactamente una fuente viva. El cruce anterior
    // no se deja a medias.
    const cambiar = motor.slice(motor.indexOf('cambiarSonido(id'), motor.indexOf('entrar() {'))
    expect(cambiar).toMatch(/soltar\(saliente\)/)
    expect(cambiar).toMatch(/saliente = null/)
  })

  it('con la sesión en marcha no hay vista previa: se ajusta en vivo', () => {
    // Dos caminos de audio a la vez es la otra forma de superponer sonidos.
    expect(hook).toMatch(
      /if \(maquina\.current !== null\) return\s*\n\s*const motor = asegurarAudio/,
    )
  })

  it('"Otra vez" vuelve a arrancar de verdad', () => {
    // `maquina.current` sigue en pie tras `completado`, así que la guarda de
    // idempotencia a secas dejaba el botón del cierre sin hacer nada. Se tira la
    // máquina agotada y se monta otra; el audio no se toca, que es lo que deja
    // el ambiente sonando entre una sesión y la siguiente.
    expect(hook).toMatch(/instantanea\(\)\?\.estado !== ESTADOS\.COMPLETADO/)
  })

  it('el préstamo del contexto se devuelve al desmontar, no solo al salir', () => {
    // Antes solo lo devolvía `salir()`, así que irse por el botón atrás del
    // navegador dejaba el contexto abierto para siempre (RN-AUD-04).
    expect(hook).toMatch(/const prestado = useRef\(false\)/)
    expect(hook).toMatch(/soltarTodo\(\)\s*\n\s*if \(prestado\.current\)/)
  })

  it('mover el volumen mientras se escucha se oye', () => {
    expect(contenedor).toMatch(/if \(parcial\.volumenAmbiente !== undefined\)/)
    expect(contenedor).toMatch(/sesion\.ajustarEnVivo\(\{ volumenAmbiente/)
  })
})

describe('ni un string visible fuera del copy (criterio 42)', () => {
  const NUEVOS = [CONFIG, SESION, CIERRE, PANEL, CONTENEDOR, BLOQUE]

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
