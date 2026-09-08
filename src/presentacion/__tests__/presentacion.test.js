// src/presentacion/__tests__/presentacion.test.js
// Las cuatro tarjetas: qué dicen, en qué orden llegan, cómo se dibujan y qué
// no hacen.
//
// Como el resto de la casa, casi todo lo que se comprueba aquí es lo que **no**
// hay: ni un texto escrito en el componente, ni un color a mano, ni un control
// que bloquee, ni una sección importada desde una pieza que solo viene a
// contarla. Un carrusel es de las piezas que se llenan solas si nadie las
// vigila.

import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { TARJETAS, TOTAL, enPosicion, es, esUltima, posicionDe } from '../tarjetas.js'

const ARBOL = ['src/presentacion', 'src/components/presentacion']

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : archivosDe(ruta)
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const ARCHIVOS = ARBOL.flatMap(archivosDe)
const PANTALLAS = ARCHIVOS.filter((ruta) => ruta.endsWith('.jsx'))
const textos = copy.diario.presentacion
const carrusel = codigoDe('src/components/presentacion/Presentacion.jsx')
const visuales = codigoDe('src/components/presentacion/Visuales.jsx')
const app = codigoDe('src/App.jsx')

describe('son cuatro, en su orden, y una sola vez', () => {
  it('las cuatro secciones y ninguna más', () => {
    expect(TARJETAS).toEqual(['hoy', 'journal', 'respiracion', 'historial'])
    expect(TOTAL).toBe(4)
  })

  it('el orden es el de la app: primero lo que se hace ahora', () => {
    // El mismo reparto de la cabecera y la barra de abajo (RN-NAV-02), así que
    // quien salga de aquí encuentra las secciones donde acaba de verlas.
    const secciones = copy.shared.navegacion.diario.secciones
    expect(TARJETAS.map((id) => textos[id].titulo)).toEqual([
      secciones.hoy,
      secciones.journal,
      secciones.respiracion,
      secciones.historial,
    ])
  })

  it('no da la vuelta: en los extremos se queda donde está', () => {
    // Detrás de la cuarta no hay una quinta, está la app. Dar la vuelta
    // convertiría la última tarjeta en una que sigue.
    expect(enPosicion(-3)).toBe('hoy')
    expect(enPosicion(0)).toBe('hoy')
    expect(enPosicion(TOTAL - 1)).toBe('historial')
    expect(enPosicion(TOTAL + 9)).toBe('historial')
  })

  it('sabe cuál es la última, que es lo único que cambia el botón', () => {
    expect(esUltima(0)).toBe(false)
    expect(esUltima(2)).toBe(false)
    expect(esUltima(3)).toBe(true)
    expect(esUltima(40)).toBe(true)
  })

  it('reconoce las suyas y no se inventa posiciones', () => {
    expect(es('journal')).toBe(true)
    expect(es('perfil')).toBe(false)
    expect(posicionDe('respiracion')).toBe(2)
    expect(posicionDe('lo-que-sea')).toBe(0)
  })

  it('el total sale de la lista y no de un número escrito aparte', () => {
    expect(TOTAL).toBe(TARJETAS.length)
    expect(codigoDe('src/presentacion/tarjetas.js')).not.toMatch(/= 4\b/)
  })
})

describe('el copy es el que es, y vive en el copy', () => {
  it('las cuatro frases están escritas tal cual', () => {
    expect(textos.hoy.frase).toBe(
      'Tu punto de partida. Por la mañana y al cerrar el día, un momento para ti.',
    )
    expect(textos.journal.frase).toBe(
      'Tu espacio privado para anotar pensamientos, soltar emociones y ordenar ideas.',
    )
    expect(textos.respiracion.frase).toBe(
      'Ejercicios guiados para conectar contigo. Para cuando necesites hacer una pausa.',
    )
    expect(textos.historial.frase).toBe(
      'Mira tu camino recorrido. Cada día en que estuviste para ti queda aquí.',
    )
  })

  it('los tres controles dicen lo que tienen que decir', () => {
    expect(textos.nav.skip).toBe('Omitir')
    expect(textos.nav.next).toBe('Siguiente')
    expect(textos.nav.enter).toBe('Entrar a Strivo')
  })

  it('cada tarjeta trae su título y su frase, y nada más', () => {
    // Ni párrafo de apoyo, ni lista de funciones, ni un segundo mensaje que
    // compita con el primero.
    TARJETAS.forEach((id) => expect(Object.keys(textos[id]).sort()).toEqual(['frase', 'titulo']))
  })

  it('ninguna frase explica cómo se usa la pantalla', () => {
    const instrucciones = /desliza|toca aqu|pulsa|arrastra|siguiente para|continuar para/i
    TARJETAS.forEach((id) => expect(textos[id].frase).not.toMatch(instrucciones))
  })

  it('no hay léxico prohibido ni una sola exclamación (§3.3)', () => {
    const prohibido =
      /fallaste|incumpliste|abandonaste|deber[íi]as?|tendr[íi]as?|\bracha\b|\bstreak\b|\btareas?\b|\bmeta\b|\bprogreso\b|productividad|[¡!]/i
    const cadenas = (nodo, ruta = 'copy.diario.presentacion') => {
      if (typeof nodo === 'string') return [[ruta, nodo]]
      if (nodo && typeof nodo === 'object') {
        return Object.entries(nodo).flatMap(([clave, hijo]) => cadenas(hijo, `${ruta}.${clave}`))
      }
      return []
    }
    cadenas(textos).forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(prohibido))
  })

  it('ningún texto vive en el componente (RN-VOZ-01)', () => {
    PANTALLAS.forEach((ruta) => {
      const literales = codigoDe(ruta).match(/>[^<>{}\n]{12,}</g) ?? []
      expect(`${ruta}: ${literales.join(' | ')}`).toBe(`${ruta}: `)
    })
  })

  it('solo el carrusel lee el namespace; los demás lo reciben', () => {
    expect(carrusel).toMatch(/const textos = copy\.diario\.presentacion/)
    PANTALLAS.filter((ruta) => !ruta.endsWith('Presentacion.jsx')).forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/copy\.diario\.presentacion/),
    )
  })
})

describe('cada tarjeta tiene su dibujo, y no es el de al lado con otro tono', () => {
  it('hay un visual por tarjeta y ninguno suelto', () => {
    const declarados = visuales.match(/export function Visual(\w+)/g) ?? []
    expect(declarados).toHaveLength(TOTAL)
    TARJETAS.forEach((id) => expect(visuales).toMatch(new RegExp(`\\b${id}: Visual`, 'i')))
  })

  it('los cuatro trazados son distintos entre sí', () => {
    // Es la prueba de que no son una plantilla recoloreada: se comparan las
    // geometrías de cada composición y ninguna pareja puede coincidir.
    const bloques = visuales.split(/export function Visual/).slice(1)
    const geometrias = bloques.map((bloque) =>
      (bloque.match(/d="[^"]+"|<circle|<rect|<path/g) ?? []).join('|'),
    )
    expect(geometrias).toHaveLength(TOTAL)
    geometrias.forEach((una, i) =>
      geometrias.slice(i + 1).forEach((otra) => expect(una).not.toBe(otra)),
    )
  })

  it('ni sol, ni luna, ni emoji, ni una imagen que cargar', () => {
    PANTALLAS.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}: ${codigo}`).not.toMatch(/\bsol\b|\bluna\b|<img|url\(|https?:/i)
      expect(`${ruta}: ${codigo}`).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
    })
  })

  it('son decorativos: lo que hay que leer lo dice el texto', () => {
    expect(visuales).toMatch(/aria-hidden="true"/)
  })

  it('se encajan enteros y no se miden en píxeles fijos (RN-VIS-06)', () => {
    expect(visuales).toMatch(/viewBox=\{LIENZO\}/)
    expect(visuales).toMatch(/className="h-full w-full"/)
    expect(visuales).not.toMatch(/width="\d+px|height="\d+px/)
  })
})

describe('criterio 8 — ninguna tonalidad literal (RN-VIS-02)', () => {
  it('no hay hexadecimales ni colores de Tailwind escritos a mano', () => {
    PANTALLAS.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}: ${codigo}`).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(`${ruta}: ${codigo}`).not.toMatch(
        /\b(?:bg|text|border|fill|stroke)-(?:white|black|gray-\d+)\b/,
      )
      expect(`${ruta}: ${codigo}`).not.toMatch(/\b(?:fill|stroke)="(?!none")[^"]*"/)
    })
  })

  it('los tres papeles del dibujo los resuelve el tema, no el componente', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    ;['--presentacion-trazo', '--presentacion-profundo', '--presentacion-calido'].forEach(
      (token) => {
        expect(css).toMatch(new RegExp(`\\[data-momento='manana'\\][\\s\\S]*?${token}:`))
        expect(css).toMatch(new RegExp(`\\[data-momento='noche'\\][\\s\\S]*?${token}:`))
      },
    )
  })

  it('el marco declara su momento y su superficie, y pide el texto por su papel', () => {
    expect(carrusel).toMatch(/data-momento=\{momento\}/)
    expect(carrusel).toMatch(/data-surface=\{superficie\}/)
    expect(carrusel).toMatch(/text-on-surface/)
  })
})

describe('cabe en una pantalla y no se desborda', () => {
  it('el marco mide la ventana que de verdad se ve, no el documento', () => {
    expect(carrusel).toMatch(/alto-pantalla/)
    expect(carrusel).not.toMatch(/min-h-screen/)
  })

  it('nada se desplaza: lo que cede es el dibujo', () => {
    // `min-h-0` sobre la franja del dibujo es lo que le permite encoger en vez
    // de estirar la columna y empujar el botón por debajo del borde.
    expect(carrusel).toMatch(/flex min-h-0 flex-1 items-center justify-center/)
    expect(carrusel).not.toMatch(/overflow-y-auto|overflow-y-scroll/)
    expect(carrusel).toMatch(/overflow-hidden/)
  })

  it('los controles van por dentro del área segura, arriba y abajo', () => {
    expect(carrusel).toMatch(/pt-safe/)
    expect(carrusel).toMatch(/pb-safe/)
  })

  it('la franja de abajo no cede su alto', () => {
    expect(carrusel).toMatch(/flex shrink-0 flex-col gap-4 pt-10 pb-safe/)
  })
})

describe('accesibilidad', () => {
  it('los puntos son botones, se anuncian y dicen cuál está activo', () => {
    const puntos = codigoDe('src/components/presentacion/Puntos.jsx')
    expect(puntos).toMatch(/type="button"/)
    expect(puntos).toMatch(/aria-current=/)
    expect(puntos).toMatch(/aria-label=/)
    expect(puntos).toMatch(/aria-label=\{textos\.puntosLabel\}/)
  })

  it('el punto activo no se distingue solo por color (§10)', () => {
    // Va más ancho además de más opaco: quien no separe bien los tonos lee la
    // forma.
    expect(codigoDe('src/components/presentacion/Puntos.jsx')).toMatch(
      /esActiva \? 'w-6 opacity-85' : 'w-1\.5 opacity-35'/,
    )
  })

  it('el área de toque es la del dedo, no la del punto', () => {
    expect(codigoDe('src/components/presentacion/Puntos.jsx')).toMatch(/min-h-touch-sm min-w-touch/)
  })

  it('se dice en qué tarjeta se está, aunque no se pinte el número', () => {
    expect(textos.nav.posicionTemplate).toBe('Tarjeta {n} de {total}')
    expect(carrusel).toMatch(/role="status"/)
    expect(carrusel).toMatch(/className="sr-only"/)
  })

  it('todo control tiene foco visible', () => {
    ;[carrusel, codigoDe('src/components/presentacion/Puntos.jsx')].forEach((codigo) =>
      expect(codigo).toMatch(/focus-visible:ring-2/),
    )
  })

  it('la animación del visual respeta la preferencia de movimiento (RN-VIS-05)', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.aliento-presentacion \{ animation: none; \}/,
    )
    expect(carrusel).toMatch(/motion-reduce:animate-none/)
  })
})

describe('nada bloquea, y salir no cuesta nada', () => {
  it('ningún control lleva disabled, required ni aria-invalid', () => {
    PANTALLAS.forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\b(disabled|required|aria-invalid)\b/),
    )
  })

  it('"Omitir" y "Entrar a Strivo" marcan lo mismo, y sin preguntar nada', () => {
    // Las dos son haberla pasado (RN-EST-07 y RN-EST-08: salir nunca pide
    // confirmación, y aquí no hay contenido que perder). Lo único que no
    // comparten es cómo se van.
    expect(carrusel).toMatch(/onClick=\{salir\}/)
    expect(carrusel).toMatch(/ultima \? entrar :/)
    expect(carrusel).not.toMatch(/confirm|¿Seguro|window\.confirm/i)
  })

  it('las dos escriben la marca antes de abrir la puerta', () => {
    expect(carrusel.match(/await completarPresentacion\(uid\)/g)).toHaveLength(2)
    // Omitir sale en el acto: quien pide paso no espera.
    expect(carrusel).toMatch(/await completarPresentacion\(uid\)\s*\n\s*onTerminado\(\)/)
  })

  it('no hay forma de salir dos veces', () => {
    // El botón no lleva `disabled` —nada bloquea— así que quien lo evita es la
    // propia acción: durante el desvanecido ya no hay puerta que abrir.
    expect(carrusel.match(/if \(saliendo\) return/g)).toHaveLength(2)
    expect(carrusel).toMatch(/saliendo && 'pointer-events-none'/)
  })

  it('no hay rueda que gire mientras se guarda (RN-EST-02)', () => {
    expect(carrusel).not.toMatch(/animate-spin|Spinner|loading/)
  })
})

describe('la salida por la puerta grande', () => {
  const css = readFileSync('src/styles/globals.css', 'utf8')
  const regla = css.match(/\.salida-presentacion \{[\s\S]*?\n {2}\}/)[0]

  it('dura lo mismo en el componente y en la hoja', () => {
    // Una duración escrita en dos sitios se separa en cuanto alguien cambia
    // una, y lo que queda es un desvanecido que termina antes o después de que
    // la pieza se desmonte. Es la misma guarda que tiene el umbral de entrada.
    const [, enElComponente] = carrusel.match(/const SALIDA = (\d+)/)
    const [, enLaHoja] = regla.match(/salida-presentacion (\d+)ms/)
    expect(enLaHoja).toBe(enElComponente)
    expect(Number(enElComponente)).toBe(2000)
  })

  it('es solo opacidad: ni escala, ni desplazamiento, ni un color por encima', () => {
    const fotogramas = css.match(/@keyframes salida-presentacion \{[\s\S]*?\n\}/)[0]
    expect(fotogramas).toMatch(/from \{ opacity: 1; \}/)
    expect(fotogramas).toMatch(/to {3}\{ opacity: 0; \}/)
    expect(fotogramas).not.toMatch(/transform|background|color|filter/)
  })

  it('lo que se va no vuelve', () => {
    // Sin `forwards`, el último fotograma reaparecería entero justo antes de
    // desmontarse: un parpadeo en el sitio donde menos se puede tener.
    expect(regla).toMatch(/forwards/)
  })

  it('la app se monta debajo antes de que empiece, no después', () => {
    // Es lo que hace que al terminar no aparezca nada: ya estaba ahí
    // (RN-LU-MAN-02). El aviso sale antes de esperar a la marca, para que los
    // dos segundos descubran la app y no un hueco.
    expect(app).toMatch(/\{saliendo && <Secciones uid=\{uid\} \/>\}/)
    expect(app).toMatch(/onSaliendo=\{\(\) => setSaliendo\(true\)\}/)
    expect(carrusel).toMatch(/setSaliendo\(true\)\s*\n\s*onSaliendo\?\.\(\)/)
  })

  it('mientras se va queda por encima, sin empujar a la app de sitio', () => {
    // Fija y en su capa: si se quedara en el flujo, las dos pantallas se
    // apilarían una debajo de la otra durante dos segundos.
    expect(carrusel).toMatch(/saliendo \? 'fixed inset-0 z-50 salida-presentacion' : 'relative'/)
  })

  it('con "reducir movimiento" no hay espera (RN-VIS-05)', () => {
    expect(carrusel).toMatch(/if \(prefiereMenosMovimiento\(\)\) return onTerminado\(\)/)
    expect(carrusel).toMatch(
      /import \{ prefiereMenosMovimiento \} from '@components\/shared\/TransicionLuz'/,
    )
  })

  it('el reloj de la salida no sobrevive a la pieza', () => {
    // Un temporizador que abre una puerta que ya no está es de los errores que
    // solo se ven en un teléfono, y tarde.
    expect(carrusel).toMatch(/clearTimeout\(relojDeSalida\.current\)/)
  })

  it('y no es el umbral de entrada disfrazado', () => {
    // El umbral es otra pieza, con su video y su contador de sesión. Esto es un
    // desvanecido y nada más: dos velos seguidos serían un peaje.
    // De `TransicionLuz` solo toma la preferencia de movimiento, que es una
    // lectura del sistema y no el umbral: ni lo monta, ni gasta su contador.
    expect(carrusel).not.toMatch(/<TransicionLuz|umbralPendiente|cruzarUmbral|velo-transicion/)
  })
})

describe('es la puerta, no una sección', () => {
  it('no tiene ruta ni la conoce nadie que enrute', () => {
    expect(carrusel).not.toMatch(/Route|Navigate|useNavigate|react-router/)
    expect(app).not.toMatch(/path="\/presentacion"/)
  })

  it('se interpone entre el onboarding y Hoy, en un solo punto', () => {
    expect(app).toMatch(/if \(presentando\) \{[\s\S]{0,260}<Presentacion/)
    expect(app).toMatch(/setPresentando\(true\)/)
    expect(app.match(/<Presentacion/g)).toHaveLength(1)
  })

  it('lo que ya se decidió en la sesión no lo reabre una lectura tardía', () => {
    // Al crear una cuenta en P7 el uid cambia y la lectura de arranque se
    // repite: sin la guarda, cerrar la presentación en ese hueco la volvería a
    // abrir.
    expect(app).toMatch(/presentacionResuelta/)
    expect(app).toMatch(/if \(!presentacionResuelta\.current\) setPresentando\(/)
  })

  it('no monta ninguna sección ni la importa', () => {
    // Lo mismo que vigila `eslint.config.js`, escrito también aquí: esta pieza
    // cuenta lo que hay dentro, no lo abre.
    ARCHIVOS.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}: ${codigo}`).not.toMatch(/from '[^']*\/diario[/']/)
      expect(`${ruta}: ${codigo}`).not.toMatch(/from '[^']*breathing/)
    })
  })

  it('los cuatro archivos están donde se dijo', () => {
    ;[
      'src/presentacion/tarjetas.js',
      'src/presentacion/entrada.js',
      'src/components/presentacion/Presentacion.jsx',
      'src/components/presentacion/Puntos.jsx',
      'src/components/presentacion/Visuales.jsx',
    ].forEach((ruta) => expect(existsSync(ruta)).toBe(true))
  })

  it('no mide nada de lo que hace nadie (no-negociable 2)', () => {
    ARCHIVOS.forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\bracha\b|\bstreak\b|porcentaje|puntuaci/i),
    )
  })
})

describe('el onboarding no se enteró', () => {
  it('ni un archivo del recorrido nombra la presentación', () => {
    // Se interpone por detrás, no la monta el recorrido: quien decide por dónde
    // se entra es `App.jsx`, y es la única línea que hay que mover el día que
    // el onboarding se sustituya.
    const recorrido = ['src/onboarding', 'src/components/onboarding'].flatMap(archivosDe)
    recorrido.forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/presentacion|Presentacion/),
    )
  })
})
