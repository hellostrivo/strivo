// src/components/perfil/__tests__/perfil.test.js
// La pantalla de Tu perfil y la barra que lleva a ella.
//
// Dos cosas se vigilan aquí por encima del resto. La primera es que la lista de
// bloques sea de verdad la costura: un identificador declarado sin componente
// tiene que fallar en voz alta, no dejar un hueco en pantalla. La segunda es
// que esta pantalla siga sin medir nada — un perfil que devuelve cifras sobre
// quien lo abre es un panel de control, y este producto no tiene uno.

import { readFileSync, existsSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { BLOQUES } from '@/perfil/bloques'

const PANTALLA = 'src/components/perfil/Perfil.jsx'
const BLOQUE = 'src/components/perfil/Bloque.jsx'
const BARRA = 'src/components/shared/BarraInferior.jsx'
const NAV = 'src/components/diario/NavStrivo.jsx'
const APP = 'src/App.jsx'

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const pantalla = codigoDe(PANTALLA)
const barra = codigoDe(BARRA)
const textos = copy.diario.perfil

describe('la pantalla es una pila de bloques', () => {
  it('existe, con su marco de bloque aparte', () => {
    expect(existsSync(PANTALLA)).toBe(true)
    expect(existsSync(BLOQUE)).toBe(true)
  })

  it('no decide cuáles hay: los pide y los recorre', () => {
    expect(pantalla).toMatch(/from '@\/perfil\/bloques'/)
    expect(pantalla).toMatch(/BLOQUES\.map/)
  })

  it('cada bloque declarado tiene con qué pintarse', () => {
    // Es la prueba que va a avisar cuando el plan de pago entre a medias.
    BLOQUES.forEach((id) =>
      expect(pantalla, `falta el contenido del bloque "${id}"`).toMatch(
        new RegExp(`${id}: \\(\\) =>`),
      ),
    )
  })

  it('el marco decide la forma una vez, para que el próximo no la adivine', () => {
    const marco = codigoDe(BLOQUE)
    expect(marco).toMatch(/<h2/)
    expect(marco).toMatch(/\{children\}/)
    expect(marco).toMatch(/bg-raised/)
  })
})

describe('los catálogos no se repiten', () => {
  it('el género se lee de donde se pregunta la primera vez', () => {
    // Dos copias del mismo catálogo se separan en cuanto alguien edite una.
    expect(pantalla).toMatch(/copy\.diario\.onboarding\.p2a\.options/)
    expect(pantalla).toMatch(/from '@\/onboarding\/genero'/)
  })

  it('el bloque de la identidad central no quedó colgando', () => {
    expect(pantalla).not.toMatch(/identidad/i)
  })

  it('los chips son los de la casa, no una copia', () => {
    expect(pantalla).toMatch(/from '@components\/shared\/Chips'/)
    expect(pantalla).toMatch(/from '@components\/shared\/Campo'/)
  })
})

describe('nada bloquea y nada mide', () => {
  it('ningún control lleva disabled, required ni aria-invalid', () => {
    ;[pantalla, codigoDe(BLOQUE), barra].forEach((codigo) =>
      expect(codigo).not.toMatch(/\b(disabled|required|aria-invalid)\b/),
    )
  })

  it('no hay botón de guardar: se guarda solo', () => {
    // El copy sí dice que no hay nada que guardar —lo dice en el `lead`—, que
    // es distinto de ofrecer un control para hacerlo. Lo que se comprueba es
    // que no exista el control ni el bloque que lo alojaría.
    expect(pantalla).not.toMatch(/Guardar/)
    expect(Object.keys(textos)).not.toContain('guardar')
    expect(textos.lead).toMatch(/no hay nada que guardar/)
  })

  it('el copy no cuenta, no compara y no evalúa', () => {
    const prohibido =
      /racha|progreso|nivel|puntuaci[óo]n|porcentaje|d[íi]as seguidos|llevas \d|has completado/i
    expect(JSON.stringify(textos)).not.toMatch(prohibido)
  })

  it('ningún texto vive en el componente (RN-VOZ-01)', () => {
    ;[PANTALLA, BLOQUE, BARRA].forEach((ruta) => {
      const literales = codigoDe(ruta).match(/>[^<>{}\n]{12,}</g) ?? []
      expect(`${ruta}: ${literales.join(' | ')}`).toBe(`${ruta}: `)
    })
  })

  it('ninguna tonalidad literal (RN-VIS-02)', () => {
    ;[pantalla, codigoDe(BLOQUE), barra].forEach((codigo) => {
      expect(codigo).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(codigo).not.toMatch(/\b(?:bg|text|border)-(?:white|black|gray-\d+)\b/)
    })
  })

  it('la pantalla declara su superficie (RN-SURF-02)', () => {
    expect(pantalla).toMatch(/data-surface="light"/)
  })
})

describe('la barra de abajo', () => {
  it('lleva dos destinos: lo que ya pasó y tú', () => {
    const ids = (barra.match(/id: '(\w+)'/g) ?? []).map((r) => r.match(/'(\w+)'/)[1])
    expect(ids).toEqual(['historial', 'perfil'])
  })

  it('el Historial ya no está arriba', () => {
    expect(codigoDe(NAV)).not.toMatch(/historial/)
  })

  it('se anuncia con su nombre, y no con el de la marca', () => {
    // La barra derogada se llamaba "Strivo" porque devolvía al vestíbulo. Esta
    // lleva a dos sitios de dentro y los nombra.
    expect(barra).toMatch(/aria-label=\{textos\.barraLabel\}/)
    expect(copy.shared.navegacion.barraLabel).not.toBe('Strivo')
  })

  it('el destino activo no se distingue solo por color (criterio 7)', () => {
    expect(barra).toMatch(/font-semibold/)
    expect(barra).toMatch(/border-espacio-acento/)
  })

  it('los objetivos táctiles llegan al mínimo y esquivan el gesto del sistema', () => {
    expect(barra).toMatch(/min-h-touch-sm/)
    expect(barra).toMatch(/pb-safe/)
  })

  it('no crece hacia los lados en pantalla grande (RN-EST-12)', () => {
    expect(barra).toMatch(/max-w-lg/)
  })

  it('comparte el asidero del cromo con la cabecera', () => {
    // Las dos se visten de contratono en la Mañana desde el mismo sitio. Dos
    // reglas separadas para la misma decisión envejecerían por separado.
    expect(barra).toMatch(/cromo-espacio/)
    expect(codigoDe(NAV)).toMatch(/cromo-espacio/)
  })

  it('se va con la cabecera cuando la pantalla pide flujo (RN-NAV-04)', () => {
    const app = codigoDe(APP)
    expect(app).toMatch(/\{!hideNav && <BarraInferior \/>\}/)
    // Y con ella el hueco que reserva: si no, quedaría un vacío al pie.
    expect(app).toMatch(/!hideNav && 'pb-24'/)
  })

  it('no conoce ninguna sección: recibe sus destinos y su texto', () => {
    expect(barra).not.toMatch(/from '[^']*\/diario[/']/)
    expect(barra).not.toMatch(/from '[^']*breathing/)
    expect(barra).not.toMatch(/from '[^']*\/perfil/)
  })
})
