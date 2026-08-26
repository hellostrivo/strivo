// src/components/onboarding/__tests__/onboarding.test.js
// El recorrido de entrada, comprobado leyendo el código.
//
// Estas pruebas no ejecutan las pantallas: comprueban lo que un render no
// atrapa y una revisión a mano se salta cuando hay prisa. Casi todas dicen qué
// **no** hay —ni un color escrito a mano, ni un texto fuera del copy, ni un
// control que bloquee, ni una sola referencia a áreas— porque es exactamente lo
// que este spec vino a garantizar.
//
// La más importante del archivo es la de las áreas. La implementación anterior
// no falló por escribir mal la identidad central: falló porque el acoplamiento
// se filtró fuera del onboarding y nadie lo vio hasta que estaba en las vistas
// del día.

import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'

import { copy } from '@copy'
import { CONTADOS, ORDEN, TOTAL } from '@/onboarding/pasos'

const ARBOL = ['src/onboarding', 'src/components/onboarding']

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
const textos = copy.diario.onboarding

describe('el árbol del onboarding', () => {
  it('existe, y las nueve pantallas están', () => {
    expect(ARCHIVOS.length).toBeGreaterThan(10)
    ;[
      'Onboarding',
      'Progreso',
      'Bienvenida',
      'Nombre',
      'Genero',
      'Motivo',
      'Identidad',
      'Horarios',
      'Recordatorios',
      'Cuenta',
      'Cierre',
    ].forEach((nombre) => expect(existsSync(`src/components/onboarding/${nombre}.jsx`)).toBe(true))
  })

  it('no conoce ninguna sección de la app', () => {
    // Lo mismo que vigila `eslint.config.js`, dicho aquí para que quede escrito
    // en una prueba y no solo en una configuración: el onboarding corre antes
    // de la app y solo escribe en `shared/`.
    ARCHIVOS.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}: ${codigo}`).not.toMatch(/from '[^']*\/diario[/']/)
      expect(`${ruta}: ${codigo}`).not.toMatch(/from '[^']*breathing/)
    })
  })
})

describe('§2 — la identidad central no depende de áreas, en ningún punto', () => {
  it('ni un archivo del onboarding nombra un área', () => {
    ARCHIVOS.forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\b[áa]reas?\b|identidadPorArea/i),
    )
  })

  it('ni una cadena del copy del onboarding la nombra', () => {
    expect(JSON.stringify(textos)).not.toMatch(/[áa]rea/i)
  })

  it('la pantalla de identidad no importa ningún catálogo que no sea el suyo', () => {
    const identidad = codigoDe('src/components/onboarding/Identidad.jsx')
    expect(identidad).toMatch(/from '@\/onboarding\/identidad'/)
    expect(identidad).not.toMatch(/catalogo|AREAS|areas/i)
  })
})

describe('criterio 7 — ningún texto vive en el componente (RN-VOZ-01)', () => {
  it('no hay una sola cadena de interfaz escrita en JSX', () => {
    PANTALLAS.forEach((ruta) => {
      const literales = codigoDe(ruta).match(/>[^<>{}\n]{12,}</g) ?? []
      expect(`${ruta}: ${literales.join(' | ')}`).toBe(`${ruta}: `)
    })
  })

  it('todas las pantallas reciben su copy, y ninguna lo alcanza por su cuenta', () => {
    // Solo el contenedor lee `copy.diario.onboarding`: las pantallas lo reciben
    // en `textos`, que es lo que las deja probar y reordenar sin tocarlas.
    const contenedor = codigoDe('src/components/onboarding/Onboarding.jsx')
    expect(contenedor).toMatch(/const textos = copy\.diario\.onboarding/)
    PANTALLAS.filter((ruta) => !ruta.endsWith('Onboarding.jsx')).forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/copy\.diario\.onboarding/),
    )
  })

  it('ninguna pantalla lee `.m` ni `.f` del copy (RN-GEN-01)', () => {
    ARCHIVOS.forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\.label\.[mf]\b|copy\.[\w.]+\.[mf]\b/),
    )
  })
})

describe('criterio 8 — ninguna tonalidad literal (RN-VIS-02)', () => {
  it('no hay hexadecimales ni colores de Tailwind escritos a mano', () => {
    PANTALLAS.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}: ${codigo}`).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(`${ruta}: ${codigo}`).not.toMatch(/\b(?:bg|text|border)-(?:white|black|gray-\d+)\b/)
    })
  })

  it('el marco pide superficies por su papel y declara la suya', () => {
    const contenedor = codigoDe('src/components/onboarding/Onboarding.jsx')
    expect(contenedor).toMatch(/data-surface=\{superficie\}/)
    expect(contenedor).toMatch(/data-momento=\{momento\}/)
    expect(contenedor).toMatch(/text-on-surface/)
  })
})

describe('nada bloquea (RN-02, no-negociable 1)', () => {
  it('ningún control lleva disabled, required ni aria-invalid', () => {
    PANTALLAS.forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/\b(disabled|required|aria-invalid)\b/),
    )
  })

  it('el copy no llama incompleto a nada', () => {
    const prohibido = /incompleto|te falt|obligatorio|sin responder|no v[áa]lido|error/i
    JSON.stringify(textos)
      .split('","')
      .forEach((cadena) => expect(cadena).not.toMatch(prohibido))
  })

  it('los tres pasos que se pueden saltar tienen con qué saltarse', () => {
    expect(textos.p6.skip).toBeTruthy()
    expect(textos.p7.skip).toBeTruthy()
    // El género no lleva enlace: se salta con "Continuar", como todo lo demás.
    expect(codigoDe('src/components/onboarding/Onboarding.jsx')).toMatch(/nav\.continue/)
  })

  it('el copy no tiene ni una exclamación ni léxico prohibido (§3.3)', () => {
    const prohibido = /fallaste|incumpliste|abandonaste|deber[íi]as?|tendr[íi]as?|\btareas?\b|[¡!]/i
    const cadenas = (nodo, ruta = 'copy.diario.onboarding') => {
      if (typeof nodo === 'string') return [[ruta, nodo]]
      if (nodo && typeof nodo === 'object') {
        return Object.entries(nodo).flatMap(([clave, hijo]) => cadenas(hijo, `${ruta}.${clave}`))
      }
      return []
    }
    cadenas(textos).forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(prohibido))
  })
})

describe('el indicador cuenta ocho y el sub-paso no se pinta', () => {
  it('el copy dice "Paso {n} de {total}" y el total son ocho', () => {
    expect(textos.nav.progressTemplate).toBe('Paso {n} de {total}')
    expect(TOTAL).toBe(8)
    expect(CONTADOS).toHaveLength(8)
    expect(ORDEN).toHaveLength(9)
  })

  it('el componente no calcula el número: lo pide, y no dibuja si no hay', () => {
    const progreso = codigoDe('src/components/onboarding/Progreso.jsx')
    expect(progreso).toMatch(/indicadorDe\(paso\)/)
    expect(progreso).toMatch(/if \(!indicador\) return null/)
  })
})

describe('el umbral de entrada es el de siempre, con el video de marca', () => {
  const contenedor = codigoDe('src/components/onboarding/Onboarding.jsx')

  it('monta la misma pieza que la app, y con el mismo contenido dentro', () => {
    // Abrir la app es abrir la app, también la primera vez. No hay una
    // apertura propia del onboarding, así que no hay una segunda variante del
    // umbral que mantener (RN-LU-MAN-01).
    expect(contenedor).toMatch(/import TransicionLuz.*from '@components\/shared\/TransicionLuz'/)
    expect(contenedor).toMatch(/<TransicionLuz conVideo/)
  })

  it('no queda ni el componente propio ni su copy', () => {
    expect(existsSync('src/components/onboarding/Apertura.jsx')).toBe(false)
    expect(copy.diario.onboarding.apertura).toBeUndefined()
    // Y el umbral sigue sin saber que el onboarding existe: quien lo monta lo
    // conoce a él, no al revés.
    expect(codigoDe('src/components/shared/TransicionLuz.jsx')).not.toMatch(/onboarding/i)
  })

  it('comparte el contador de sesión, y por eso no se encadena con el de después', () => {
    // Si el video se ve al empezar el recorrido, al terminarlo el contador ya
    // está gastado y las secciones no lo repiten. Sin regla nueva: es el mismo
    // contador (RN-LU-MAN-02).
    expect(contenedor).toMatch(/umbralPendiente\('diario'\)/)
    expect(contenedor).toMatch(/cruzarUmbral\('diario'\)/)
    expect(codigoDe('src/App.jsx')).not.toMatch(/onTerminado=\{[\s\S]{0,200}cruzarUmbral/)
  })

  it('con movimiento reducido no se monta (RN-VIS-05)', () => {
    expect(contenedor).toMatch(/function hayUmbral\(\)[\s\S]*?prefiereMenosMovimiento\(\)/)
    expect(contenedor).toMatch(/useState\(hayUmbral\)/)
  })

  it('nace decidido, no un fotograma después', () => {
    // Puesto en un efecto, el umbral llegaba después del primer pintado y ese
    // fotograma era el primer paso asomando antes de que empezara el video.
    expect(contenedor).not.toMatch(/setEntrando\(true\)/)
    expect(contenedor).toMatch(/useState\(hayUmbral\)/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Que quepa en una pantalla (26 de agosto de 2026).
//
// El defecto era de teléfono y no se veía en un portátil: el marco decía medir
// `min-h-screen` —el alto de la ventana **sin** la barra del navegador— y crecía
// además con el contenido, así que "Atrás" y "Continuar" quedaban por debajo del
// borde y había que ir a buscarlos con el dedo antes de poder seguir. Nueve
// pantallas breves en las que hay que rebuscar el botón de seguir dejan de ser
// breves.
describe('el recorrido cabe en una pantalla', () => {
  const contenedor = codigoDe('src/components/onboarding/Onboarding.jsx')
  const css = readFileSync('src/styles/globals.css', 'utf8')

  it('el marco mide la ventana que de verdad se ve, no el documento', () => {
    expect(contenedor).toMatch(/alto-pantalla/)
    expect(contenedor).not.toMatch(/min-h-screen/)
    // `100vh` con `100dvh` detrás: lo segundo lo aplica quien lo entiende y lo
    // ignora quien no, que es el respaldo sin `@supports`.
    const regla = css.match(/\.alto-pantalla \{[\s\S]*?\n {2}\}/)[0]
    expect(regla).toMatch(/height: 100vh/)
    expect(regla).toMatch(/height: 100dvh/)
  })

  it('los dos controles de navegación no se van de la vista ni del área segura', () => {
    // `shrink-0` para que la franja no ceda su alto cuando el paso es largo, y
    // `pb-safe` para que en un teléfono sin marco "Continuar" no comparta sitio
    // con la franja del gesto de inicio.
    expect(contenedor).toMatch(/flex shrink-0 flex-wrap items-center gap-3 pt-5 pb-safe/)
    expect(contenedor).toMatch(/<header className="shrink-0 pt-safe/)
  })

  it('lo único que se desplaza es el paso, y lo hace por dentro', () => {
    // `min-h-0` es lo que se lo permite: sin él, un paso alto estira la columna
    // en vez de desplazarse por dentro, y lo que se sale por abajo son los dos
    // controles. Hoy solo lo necesita la identidad central, que es el más largo.
    expect(contenedor).toMatch(/<main className="flex min-h-0 flex-1 flex-col overflow-y-auto">/)
  })

  it('y nada se sale a lo ancho', () => {
    expect(contenedor).toMatch(/overflow-hidden/)
  })

  it('la bienvenida y el cierre se centran; los pasos con preguntas no', () => {
    // Las dos pantallas que no piden nada. Un paso con preguntas centrado se
    // movería de sitio al aparecer o desaparecer un campo, que es justo lo que
    // no debe pasar mientras alguien contesta.
    ;['Bienvenida', 'Cierre'].forEach((pantalla) =>
      expect(codigoDe(`src/components/onboarding/${pantalla}.jsx`)).toMatch(
        /flex flex-1 flex-col justify-center/,
      ),
    )
    ;['Nombre', 'Genero', 'Motivo', 'Identidad', 'Horarios', 'Recordatorios', 'Cuenta'].forEach(
      (pantalla) =>
        expect(codigoDe(`src/components/onboarding/${pantalla}.jsx`)).not.toMatch(
          /flex-1 flex-col justify-center/,
        ),
    )
  })

  it('el campo de hora puede encoger, así que el bloque de P5 no se va de lado', () => {
    // Un `input[type="time"]` trae un ancho propio del navegador que en un
    // teléfono es mayor que el hueco, y al ser un elemento flexible su
    // `min-width: auto` le impide encoger: empujaba a su contenedor hacia fuera
    // y con él el bloque entero hacia la derecha.
    const horarios = codigoDe('src/components/onboarding/Horarios.jsx')
    expect(horarios.match(/className="campo-hora"/g)).toHaveLength(2)
    expect(horarios.match(/flex min-w-0 flex-col/g)).toHaveLength(2)

    const regla = css.match(/\.campo-hora \{[\s\S]*?\n {2}\}/)[0]
    expect(regla).toMatch(/min-width: 0/)
    expect(regla).toMatch(/appearance: none/)
  })
})

describe('los chips son los de la casa', () => {
  // Subieron a `components/shared/` el 26 de agosto, cuando el Perfil pasó a
  // preguntar el género y a ofrecer las mismas sugerencias de identidad: un
  // componente que sirve a dos secciones no es de ninguna de las dos.
  it('la forma sale del sitio compartido, no de una copia', () => {
    const chips = codigoDe('src/components/shared/Chips.jsx')
    expect(chips).toMatch(/from '@components\/shared\/pildora'/)
    expect(chips).toMatch(/PILDORA_ELEGIDA/)
  })

  it('se sueltan tocándolos, así que se anuncian como tal y no como radios', () => {
    const chips = codigoDe('src/components/shared/Chips.jsx')
    expect(chips).toMatch(/aria-pressed=/)
    expect(chips).not.toMatch(/type="radio"|role="radio"/)
  })

  it('lo elegido no se distingue solo por color (§10)', () => {
    expect(codigoDe('src/components/shared/Chips.jsx')).toMatch(/MARCA/)
    expect(codigoDe('src/components/shared/pildora.js')).toMatch(/border-current/)
  })
})

describe('el onboarding se interpone una sola vez', () => {
  const app = codigoDe('src/App.jsx')
  const contenedorDelRecorrido = codigoDe('src/components/onboarding/Onboarding.jsx')

  it('lo decide el árbol de datos, no una marca del navegador', () => {
    expect(app).toMatch(/onboardingPendiente\(uid\)/)
    expect(app).not.toMatch(/localStorage/)
  })

  it('al terminar entrega el uid definitivo, que puede no ser con el que empezó', () => {
    // Si en P7 se creó una cuenta, el árbol se mudó y la sesión sigue con el
    // uid nuevo: el que llega aquí es ese.
    expect(app).toMatch(/onTerminado=\{\(uidFinal\) => \{[\s\S]{0,120}onUid\(uidFinal\)/)
  })

  it('mientras se averigua no gira ninguna rueda (RN-EST-02)', () => {
    expect(app).toMatch(/pendiente === null/)
    expect(app).not.toMatch(/animate-spin|Spinner/)
  })

  it('lo que se ve antes del umbral es el tono del velo, no el papel de la app', () => {
    // Los dos instantes de arranque —resolver el uid y preguntar si queda
    // onboarding— tienen detrás el umbral, así que pintar crema metía un
    // fotograma claro delante de un velo nocturno: un fogonazo a las once.
    // RN-EST-02 pide la forma final o nada, y la forma final de ese instante
    // es el velo.
    const arranque = codigoDe('src/components/ArranqueProvisional.jsx')
    ;[app, arranque].forEach((codigo) => {
      expect(codigo).toMatch(/velo-transicion/)
      expect(codigo).not.toMatch(/bg-paper/)
    })
  })

  it('la regla del momento por reloj vive en un solo sitio', () => {
    // La escribían `App` y el onboarding por su cuenta. Dos copias de la misma
    // regla envejecen distinto, así que se mudó a `lib/timeSlot`.
    expect(contenedorDelRecorrido).toMatch(/import \{ momentoDe \} from '@lib\/timeSlot'/)
    expect(contenedorDelRecorrido).not.toMatch(/function momentoDe/)
    expect(app).not.toMatch(/function momentoDe/)
  })
})
