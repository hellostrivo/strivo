// src/components/shared/__tests__/respiracion.test.js
// Los criterios de SPEC_08 que se comprueban leyendo el código, no
// ejecutándolo: que la respiración no se abre sola, que no guarda nada y que el
// componente compartido lo es de verdad.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { COLLECTIONS, FIELDS } from '@/lib/db/schema.js'

const COMPONENTE = 'src/components/shared/Respiracion.jsx'
const RITMO = 'src/lib/ritmoRespiracion.js'
const AUDIO = 'src/lib/audioRespiracion.js'
const HOY = 'src/pages/lumia/Hoy.jsx'

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('un solo componente para los dos sitios (RN-LU-RESP-02)', () => {
  it('no conoce Lumia, ni Formia, ni la capa de datos', () => {
    ;[COMPONENTE, RITMO, AUDIO].forEach((ruta) => {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => {
        expect(`${ruta}: ${linea}`).not.toMatch(/lumia|formia|lib\/db/i)
      })
    })
  })

  it('todo lo que necesita llega por props, incluido el copy', () => {
    const codigo = codigoDe(COMPONENTE)
    expect(codigo).not.toMatch(/from '@copy'/)
    expect(codigo).toMatch(/\btextos\b/)
  })

  it('el ritmo por defecto son tres ciclos, los mismos que usará P1', () => {
    expect(codigoDe(COMPONENTE)).toMatch(/ciclos = CICLOS/)
  })
})

describe('no se abre sola (RN-LU-RESP-01, criterio 2)', () => {
  const componente = codigoDe(COMPONENTE)
  const hoy = codigoDe(HOY)

  it('el ejercicio no arranca al montarse: hace falta un gesto', () => {
    // `arrancar` es lo que crea el contexto de audio y pone el reloj en marcha.
    // Si apareciera dentro de un efecto, la respiración se dispararía sola y
    // los 39 segundos pasarían a ser un peaje diario.
    const efectos = componente.match(/useEffect\([\s\S]*?\n {2}\}/g) ?? []
    efectos.forEach((efecto) => expect(efecto).not.toMatch(/arrancar/))
    expect(componente).toMatch(/onClick=\{corriendo \? pausar : arrancar\}/)
  })

  it('entrar en la sección Mañana no la dispara: se abre desde un toque', () => {
    expect(hoy).toMatch(/onClick=\{\(\) => abrir\('respiracion'\)\}/)
    // La vista solo cambia a 'respiracion' por ese toque, nunca por un efecto.
    const efectos = hoy.match(/useEffect\([\s\S]*?\n {2}\}/g) ?? []
    efectos.forEach((efecto) => expect(efecto).not.toMatch(/respiracion/))
  })

  it('la salida está desde el primer fotograma, sin confirmación', () => {
    expect(componente).toMatch(/onClick=\{terminar\}/)
    expect(componente).not.toMatch(/confirm/i)
  })
})

describe('no se registra en ninguna parte (criterio 9)', () => {
  it('el modelo canónico no tiene dónde guardar una respiración', () => {
    const todo = JSON.stringify({ COLLECTIONS, FIELDS })
    expect(todo).not.toMatch(/breath|respiracion/i)
  })

  it('ninguno de los tres archivos guarda nada en ningún sitio', () => {
    // Sin la capa de datos —que la prueba de arriba ya prohíbe importar— la
    // única vía que quedaría para persistir algo es un almacén global.
    ;[COMPONENTE, RITMO, AUDIO].forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(
        /localStorage|indexedDB|sessionStorage|fetch\(/,
      )
    })
  })
})

describe('el copy invita, no vende (SPEC_08 §8)', () => {
  const textos = copy.lumia.respiracion

  function cadenasDe(nodo, ruta) {
    if (typeof nodo === 'string') return [[ruta, nodo]]
    if (nodo && typeof nodo === 'object') {
      return Object.entries(nodo).flatMap(([clave, hijo]) => cadenasDe(hijo, `${ruta}.${clave}`))
    }
    return []
  }

  const CADENAS = cadenasDe(textos, 'copy.lumia.respiracion')

  it('no promete ningún beneficio ni usa lenguaje de meditación guiada', () => {
    const prohibido =
      /te vas a sentir|te sentir[áa]s|te ayudar[áa]|paz interior|energ[íi]a|medita|mindful|conecta con/i
    CADENAS.forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(prohibido))
  })

  it('no queda rastro del copy de Fase 0, que presuponía un ritual detrás', () => {
    CADENAS.forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(/antes de empezar/i))
  })

  it('dice lo que dura y que se puede salir, antes de empezar', () => {
    expect(textos.entrada.ayuda).toMatch(/medio minuto/i)
    expect(textos.lead).toMatch(/salir/i)
  })

  it('el copy de fase es la única señal textual: sin números ni cuenta atrás', () => {
    expect(Object.keys(textos.fases).sort()).toEqual(['exhalar', 'inhalar', 'pausa'])
    CADENAS.forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(/\d\s*(s|seg)\b/i))
  })
})

describe('silencio por defecto (§6.12, A-03)', () => {
  it('el componente arranca silenciado si nadie dice lo contrario', () => {
    expect(codigoDe(COMPONENTE)).toMatch(/sonido = false/)
  })

  it('un usuario nuevo nace con el sonido apagado', () => {
    expect(codigoDe('src/lib/db/shared.js')).toMatch(/soundEnabled: false/)
  })
})
