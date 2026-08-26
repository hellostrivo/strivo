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
      'Apertura',
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

describe('la apertura es un umbral, no una pantalla', () => {
  it('no tiene botón de avanzar: toda su superficie la salta', () => {
    const apertura = codigoDe('src/components/onboarding/Apertura.jsx')
    expect(apertura).toMatch(/aria-label=\{textos\.entrar\}/)
    expect(apertura).toMatch(/onClick=\{terminar\}/)
    // Ni pasos, ni preguntas, ni una segunda cosa que decidir.
    expect(apertura).not.toMatch(/useState|<input|<form/)
  })

  it('no es `TransicionLuz` ni le añade contenido', () => {
    // Aquel umbral tiene prohibido crecer: cada contenido nuevo lo acerca al
    // wizard derogado. Esto comparte el aspecto por CSS, no por componente.
    const apertura = codigoDe('src/components/onboarding/Apertura.jsx')
    expect(apertura).not.toMatch(/TransicionLuz/)
    expect(apertura).toMatch(/velo-transicion/)
    expect(codigoDe('src/components/shared/TransicionLuz.jsx')).not.toMatch(/onboarding/i)
  })

  it('con movimiento reducido no se monta, y quien retoma tampoco la ve', () => {
    const contenedor = codigoDe('src/components/onboarding/Onboarding.jsx')
    expect(contenedor).toMatch(/prefiereMenosMovimiento\(\)/)
    expect(contenedor).toMatch(/paso === PASOS\.bienvenida && !prefiereMenosMovimiento\(\)/)
  })
})

describe('los chips son los de la casa', () => {
  it('la forma sale del sitio compartido, no de una copia', () => {
    const chips = codigoDe('src/components/onboarding/Chips.jsx')
    expect(chips).toMatch(/from '@components\/shared\/pildora'/)
    expect(chips).toMatch(/PILDORA_ELEGIDA/)
  })

  it('se sueltan tocándolos, así que se anuncian como tal y no como radios', () => {
    const chips = codigoDe('src/components/onboarding/Chips.jsx')
    expect(chips).toMatch(/aria-pressed=/)
    expect(chips).not.toMatch(/type="radio"|role="radio"/)
  })

  it('lo elegido no se distingue solo por color (§10)', () => {
    expect(codigoDe('src/components/onboarding/Chips.jsx')).toMatch(/MARCA/)
    expect(codigoDe('src/components/shared/pildora.js')).toMatch(/border-current/)
  })
})

describe('el onboarding se interpone una sola vez', () => {
  const app = codigoDe('src/App.jsx')

  it('lo decide el árbol de datos, no una marca del navegador', () => {
    expect(app).toMatch(/onboardingPendiente\(uid\)/)
    expect(app).not.toMatch(/localStorage/)
  })

  it('al terminar, el umbral de esta sesión se da por cruzado', () => {
    // La apertura del onboarding **fue** el umbral: encadenar detrás el video
    // de marca serían diez segundos de velo antes de la primera pantalla.
    expect(app).toMatch(/onTerminado=\{[\s\S]{0,200}cruzarUmbral\('diario'\)/)
  })

  it('mientras se averigua no gira ninguna rueda (RN-EST-02)', () => {
    expect(app).toMatch(/pendiente === null/)
    expect(app).not.toMatch(/animate-spin|Spinner/)
  })
})
