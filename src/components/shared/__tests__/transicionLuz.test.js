// src/components/shared/__tests__/transicionLuz.test.js
// La transición de entrada (§C7.5).
//
// El riesgo de esta spec es de diseño, no de código: cada cosa que se añada a
// la transición la acerca al wizard del Anexo E. Por eso la mitad de estas
// pruebas no comprueban qué hace la pieza, sino qué **no** hace y qué no se le
// ha añadido.

import { readFileSync } from 'fs'
import { beforeEach, describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FRASES, TEMAS, fraseDeApertura, olvidarUltima } from '@/content/frases-apertura'

const COMPONENTE = 'src/components/shared/TransicionLuz.jsx'
const REPERTORIO = 'src/content/frases-apertura.js'
const APP = 'src/App.jsx'
const HOY = 'src/pages/lumia/Hoy.jsx'

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

beforeEach(() => {
  olvidarUltima()
})

describe('el repertorio (criterio 7)', () => {
  it('vive en content/, no dentro del componente', () => {
    expect(FRASES.length).toBeGreaterThan(90)
    const componente = codigoDe(COMPONENTE)
    expect(componente).toMatch(/from '@\/content\/frases-apertura'/)
    // Ni una frase escrita a mano dentro del componente.
    FRASES.slice(0, 10).forEach((frase) => expect(componente).not.toContain(frase.texto))
  })

  it('son cien de gratitud y amabilidad', () => {
    expect(FRASES).toHaveLength(100)
    FRASES.forEach((frase) => expect(TEMAS).toContain(frase.tema))
    TEMAS.forEach((tema) => {
      expect(FRASES.filter((frase) => frase.tema === tema).length).toBeGreaterThan(30)
    })
  })

  it('no hay dos frases repetidas', () => {
    expect(new Set(FRASES.map((frase) => frase.texto)).size).toBe(FRASES.length)
  })

  it('ninguna repite una frase del día: son dos repertorios distintos', async () => {
    const { FRASES: DEL_DIA } = await import('@/content/frases-del-dia')
    const deApertura = new Set(FRASES.map((frase) => frase.texto))
    DEL_DIA.forEach((frase) => expect(deApertura.has(frase.texto)).toBe(false))
  })
})

describe('la voz del repertorio (§3.6)', () => {
  it('sin exclamaciones', () => {
    FRASES.forEach((frase) => expect(frase.texto).not.toMatch(/[¡!]/))
  })

  it('sin léxico prohibido ni vocabulario de hábitos', () => {
    const prohibido =
      /fallaste|incumpliste|abandonaste|deber[íi]as?|tendr[íi]as?|\btareas?\b|h[áa]bito|racha|constancia|debilidad/i
    FRASES.forEach((frase) => expect(frase.texto).not.toMatch(prohibido))
  })

  it('sin promesas de beneficio ni lenguaje de coach', () => {
    // La transición es un umbral de cinco segundos, no un consejo. Una frase
    // que promete o que da instrucciones convierte el umbral en la primera
    // pantalla de un wizard.
    const prohibido =
      /te vas a sentir|ser[áa]s más|conseguir[áa]s|lograr[áa]s|tu mejor versión|vamos a por/i
    FRASES.forEach((frase) => expect(frase.texto).not.toMatch(prohibido))
  })

  it('son breves: se leen en cinco segundos', () => {
    FRASES.forEach((frase) => expect(frase.texto.length).toBeLessThanOrEqual(72))
  })
})

describe('la elección (criterio 6)', () => {
  it('nunca devuelve la misma dos veces seguidas', () => {
    let anterior = null
    for (let i = 0; i < 300; i += 1) {
      const frase = fraseDeApertura()
      expect(frase.texto).not.toBe(anterior)
      anterior = frase.texto
    }
  })

  it('es al azar: en cien tiradas salen muchas distintas', () => {
    const vistas = new Set()
    for (let i = 0; i < 100; i += 1) vistas.add(fraseDeApertura().texto)
    expect(vistas.size).toBeGreaterThan(30)
  })

  it('con un azar fijo, la segunda no es la primera', () => {
    // El caso que romperia el criterio 6: una fuente de azar que siempre
    // devuelve lo mismo. La frase anterior sale del bombo, así que la segunda
    // tirada cae en otra.
    const primera = fraseDeApertura({ azar: () => 0 })
    const segunda = fraseDeApertura({ azar: () => 0 })
    expect(segunda.texto).not.toBe(primera.texto)
  })

  it('no persiste cuál tocó: no hay modelo de datos (§5)', () => {
    const codigo = codigoDe(REPERTORIO)
    expect(codigo).not.toMatch(/localStorage|indexedDB|lib\/db/)
  })
})

describe('es un umbral, no una secuencia (RN-LU-MAN-02, criterios 2 y 3)', () => {
  const componente = codigoDe(COMPONENTE)

  it('no tiene botón de continuar ni ningún paso', () => {
    expect(componente).not.toMatch(/continuar|siguiente|\bpaso\b/i)
    // Sin la `i`: se busca el componente `<Button>`, no el elemento nativo.
    expect(componente).not.toMatch(/<Button/)
    // Un solo elemento interactivo: la propia superficie, que la salta.
    expect(componente.match(/<button/g) ?? []).toHaveLength(1)
  })

  it('no hace ninguna pregunta ni pide ningún dato', () => {
    expect(componente).not.toMatch(/\?|input|textarea|onChange/i)
  })

  it('se salta con un toque en cualquier sitio', () => {
    expect(componente).toMatch(/onClick=\{terminar\}/)
    expect(componente).toMatch(/fixed inset-0/)
  })

  it('se va sola sin que nadie la toque', () => {
    expect(componente).toMatch(/setTimeout\(terminar, DURACION\)/)
  })

  it('no reconstruye R2: no hay saludo, ni fecha, ni nada dinámico', () => {
    // R2 —la bienvenida dinámica— se suprimió de raíz y no se reubica en
    // ningún producto (Anexo E, E.0). Lo que sobrevive es el encabezado del
    // héroe, que ya estaba desde SPEC_06 y no pasa por aquí.
    expect(componente).not.toMatch(/saludo|nombre|fecha|Buenos d[íi]as/i)
  })
})

describe('no dispara la respiración (RN-LU-MAN-03, criterio 4)', () => {
  it('la transición no sabe que la respiración existe', () => {
    expect(codigoDe(COMPONENTE)).not.toMatch(/respiraci[óo]n|Respiracion/i)
  })

  it('mostrar la mañana no arranca ningún ejercicio', () => {
    // El umbral se cruza al mostrarse la sección, ahora que el Diario se
    // escribe en Hoy y ya no hay botón que lleve a él. Lo que no cambia es que
    // ese camino no toca la respiración: se entra a ella por su enlace.
    const hoy = codigoDe(HOY)
    const efecto =
      hoy.match(/useEffect\(\(\) => \{[\s\S]*?umbralPendiente[\s\S]*?\n {2}\}/)?.[0] ?? ''
    expect(efecto).toMatch(/umbral/i)
    expect(efecto).not.toMatch(/respiracion/i)
  })
})

describe('la misma pieza en los dos sitios (RN-LU-MAN-01, criterio 1)', () => {
  it('la entrada a la app y la entrada a la mañana importan el mismo componente', () => {
    // El alias da igual —`@/components` y `@components` resuelven al mismo
    // sitio—; lo que importa es que los dos importen el mismo módulo.
    const mismoModulo = /import TransicionLuz.*from '@\/?components\/shared\/TransicionLuz'/
    expect(codigoDe(APP)).toMatch(mismoModulo)
    expect(codigoDe(HOY)).toMatch(mismoModulo)
  })

  it('no hay una segunda variante en ningún sitio', () => {
    // Si aparece una copia específica de Mañana, el wizard ha empezado a volver.
    const sospechosos = ['Transicion', 'Umbral', 'Splash'].flatMap((nombre) =>
      [
        `src/components/lumia/${nombre}Manana.jsx`,
        `src/components/lumia/${nombre}.jsx`,
        `src/components/shared/${nombre}Manana.jsx`,
      ].filter((ruta) => {
        try {
          readFileSync(ruta)
          return true
        } catch {
          return false
        }
      }),
    )
    expect(sospechosos).toEqual([])
  })

  it('el componente es compartido de verdad: no conoce ningún espacio', () => {
    const imports = codigoDe(COMPONENTE).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
    imports.forEach((linea) => expect(linea).not.toMatch(/lumia|formia|lib\/db/i))
  })
})

describe('un solo umbral por sesión y por espacio (nota de producto, 19 ago)', () => {
  const UMBRAL = 'src/lib/umbralSesion.js'

  it('el contador vive fuera de las dos pantallas que lo consultan', () => {
    ;[APP, HOY].forEach((ruta) => {
      expect(codigoDe(ruta)).toMatch(/from '@lib\/umbralSesion'/)
      // Ninguna de las dos guarda su propia cuenta: si lo hicieran, entrar por
      // el Home y ver la mañana encadenaría dos umbrales seguidos.
      expect(codigoDe(ruta)).not.toMatch(/let umbralCruzado/)
    })
  })

  it('entrar a Lumia lo consume, y la mañana ya no lo repite', async () => {
    const { cruzarUmbral, olvidarUmbrales, umbralPendiente } = await import('@lib/umbralSesion')
    olvidarUmbrales()
    expect(umbralPendiente('lumia')).toBe(true)
    cruzarUmbral('lumia')
    expect(umbralPendiente('lumia')).toBe(false)
    // El de Formia es suyo: entrar a Lumia no se lo gasta.
    expect(umbralPendiente('formia')).toBe(true)
    olvidarUmbrales()
  })

  it('no se persiste: cerrar la app y volver mañana lo devuelve (§5)', () => {
    expect(codigoDe(UMBRAL)).not.toMatch(/localStorage|indexedDB|lib\/db/)
  })
})

describe('la entrada a Formia es la misma pieza sin frase (placeholder)', () => {
  it('el umbral de Formia no saca ninguna frase del repertorio', () => {
    expect(codigoDe(APP)).toMatch(/conFrase=\{entrando === 'lumia'\}/)
  })

  it('lo único propio de Formia es la paleta, y sale de sus tokens', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    const bloque =
      css.match(/\[data-space='formia'\] \{[^}]*--transicion-velo[\s\S]*?\n\}/)?.[0] ?? ''
    expect(bloque).toMatch(/var\(--formia-am-50\)/)
    expect(bloque).not.toMatch(/#[0-9a-f]{3,8}/i)
  })
})

describe('con reducir movimiento es inmediata (criterio 5)', () => {
  it('los dos usos consultan la preferencia antes de montarla', () => {
    expect(codigoDe(APP)).toMatch(/!prefiereMenosMovimiento\(\)/)
    expect(codigoDe(HOY)).toMatch(/!prefiereMenosMovimiento\(\)/)
  })

  it('el componente expone la consulta en un solo sitio', () => {
    expect(codigoDe(COMPONENTE)).toMatch(/prefers-reduced-motion: reduce/)
  })
})

describe('el copy del umbral (§8)', () => {
  it('vive en el namespace compartido y tiene una sola cadena', () => {
    expect(typeof copy.shared.transicion.saltar).toBe('string')
    expect(Object.keys(copy.shared.transicion)).toEqual(['saltar'])
  })

  it('no promete nada ni manda hacer nada', () => {
    expect(copy.shared.transicion.saltar).not.toMatch(/[¡!]|debes|tienes que/i)
  })
})
