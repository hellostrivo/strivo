// src/lib/__tests__/haptica.test.js
// SPEC_23B — El puente de la háptica y dónde se pide el toque.
//
// Las pruebas corren sin navegador, así que los tres puntos se comprueban de
// dos formas: la decisión de cuándo vibrar vive en funciones puras que se
// prueban aquí y en sus módulos (`entroEnLaSeleccion`, `vibraEnFase`,
// `claveDeFase`), y la llamada se comprueba leyendo el código —que está detrás
// de esa decisión y en ningún otro sitio—.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it, vi } from 'vitest'

import { aTiempo, pluginDeCapacitor } from './dobleDeCapacitor.js'
import { crearToque } from '../haptica.js'

/** Deja correr las promesas pendientes. */
const vaciar = () => new Promise((resolver) => setTimeout(resolver, 0))

function telefono({ impacto = async () => {} } = {}) {
  const llamadas = []
  const plugin = pluginDeCapacitor({
    impact: async (opciones) => {
      llamadas.push(opciones)
      return impacto(opciones)
    },
  })
  const cargar = vi.fn(async () => ({ plugin, estilo: 'LIGHT' }))
  return { llamadas, cargar }
}

describe('el puente (lib/haptica.js)', () => {
  it('en la web no carga el plugin ni pide nada', async () => {
    const { llamadas, cargar } = telefono()
    const toque = crearToque({ cargar, enTelefono: () => false })
    toque()
    await vaciar()
    expect(cargar).not.toHaveBeenCalled()
    expect(llamadas).toEqual([])
  })

  it('en el iPhone pide un impacto ligero, con el plugin como Proxy de Capacitor', async () => {
    const { llamadas, cargar } = telefono()
    const toque = crearToque({ cargar, enTelefono: () => true })
    toque()
    await aTiempo(vaciar())
    expect(llamadas).toEqual([{ style: 'LIGHT' }])
  })

  it('el estilo es el ligero del plugin, nunca el de fábrica (que es el pesado)', () => {
    const fuente = readFileSync('src/lib/haptica.js', 'utf8')
    expect(fuente).toMatch(/ImpactStyle\.Light/)
    expect(fuente).not.toMatch(/ImpactStyle\.(Heavy|Medium)/)
  })

  it('carga el plugin una sola vez para muchos toques', async () => {
    const { llamadas, cargar } = telefono()
    const toque = crearToque({ cargar, enTelefono: () => true })
    toque()
    toque()
    toque()
    await vaciar()
    expect(cargar).toHaveBeenCalledTimes(1)
    expect(llamadas).toHaveLength(3)
  })

  it('no devuelve nada que haya que esperar', () => {
    const { cargar } = telefono()
    expect(crearToque({ cargar, enTelefono: () => true })()).toBeUndefined()
  })

  it('si el plugin no carga, no lanza, y el siguiente toque lo vuelve a intentar', async () => {
    let intentos = 0
    const cargar = async () => {
      intentos += 1
      throw new Error('sin plugin')
    }
    const toque = crearToque({ cargar, enTelefono: () => true })
    expect(() => toque()).not.toThrow()
    await vaciar()
    toque()
    await vaciar()
    expect(intentos).toBe(2)
  })

  it('si el impacto falla, no lanza ni deja un rechazo sin atender', async () => {
    const { cargar } = telefono({
      impacto: async () => {
        throw new Error('el teléfono dijo que no')
      },
    })
    const toque = crearToque({ cargar, enTelefono: () => true })
    expect(() => toque()).not.toThrow()
    await vaciar()
  })

  it('si preguntar la plataforma lanza, tampoco pasa nada', () => {
    const toque = crearToque({
      cargar: async () => ({}),
      enTelefono: () => {
        throw new Error('raro')
      },
    })
    expect(() => toque()).not.toThrow()
  })
})

// ─── Un solo archivo importa el plugin ────────────────────────────────────────

function fuentes(dir = 'src') {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : fuentes(ruta)
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('un solo archivo importa @capacitor/haptics, y bajo demanda', () => {
  it('solo lib/haptica.js lo nombra', () => {
    const quienes = fuentes().filter((ruta) =>
      readFileSync(ruta, 'utf8').includes('@capacitor/haptics'),
    )
    expect(quienes).toEqual([join('src', 'lib', 'haptica.js')])
  })

  it('y solo con import() dinámico, detrás de esIPhone()', () => {
    const puente = readFileSync('src/lib/haptica.js', 'utf8')
    expect(puente).toMatch(/await import\('@capacitor\/haptics'\)/)
    expect(puente).not.toMatch(/^import .*@capacitor\/haptics/m)
    expect(puente).toMatch(/enTelefono = esIPhone/)
  })

  it('nadie llama a navigator.vibrate', () => {
    const quienes = fuentes().filter((ruta) => /navigator\.vibrate/.test(codigoDe(ruta)))
    expect(quienes).toEqual([])
  })
})

// ─── Dónde se pide el toque ───────────────────────────────────────────────────

const PUNTOS = [
  'src/components/diario/DiarioManana.jsx',
  'src/components/diario/DiarioNoche.jsx',
  'src/components/diario/ChipsCatalogo.jsx',
  'src/components/diario/ChipsEmociones.jsx',
  'src/breathing/hooks/useSesionRespiracion.js',
  'src/components/shared/Respiracion.jsx',
]

describe('el toque se pide en los tres puntos y en ningún otro sitio', () => {
  it('solo los seis archivos de los tres puntos llaman a toqueSuave()', () => {
    const quienes = fuentes()
      .filter((ruta) => /toqueSuave\(\)/.test(codigoDe(ruta)))
      .filter((ruta) => ruta !== join('src', 'lib', 'haptica.js'))
      .sort()
    expect(quienes).toEqual(PUNTOS.map((ruta) => join(...ruta.split('/'))).sort())
  })

  it('cada uno lo pide una sola vez', () => {
    PUNTOS.forEach((ruta) => {
      expect(`${ruta}: ${(codigoDe(ruta).match(/toqueSuave\(\)/g) ?? []).length}`).toBe(
        `${ruta}: 1`,
      )
    })
  })

  it('al cerrar el día: dentro de terminar(), después de la guarda de cerrando', () => {
    ;['src/components/diario/DiarioManana.jsx', 'src/components/diario/DiarioNoche.jsx'].forEach(
      (ruta) => {
        const terminar = codigoDe(ruta).match(/const terminar = \(\) => \{[\s\S]*?\n {2}\}/)?.[0]
        expect(terminar, ruta).toBeTruthy()
        expect(terminar).toMatch(
          /if \(cerrando\.current\) return\s+cerrando\.current = true\s+toqueSuave\(\)/,
        )
      },
    )
  })

  it('nunca al guardar ni al reintentar: persistir() no vibra', () => {
    ;['src/components/diario/DiarioManana.jsx', 'src/components/diario/DiarioNoche.jsx'].forEach(
      (ruta) => {
        const persistir = codigoDe(ruta).match(/const persistir = async[\s\S]*?\n {2}\}/)?.[0]
        expect(persistir, ruta).toBeTruthy()
        expect(persistir).not.toMatch(/toqueSuave/)
      },
    )
  })

  it('al elegir una emoción: solo detrás de entroEnLaSeleccion', () => {
    ;[
      'src/components/diario/ChipsCatalogo.jsx',
      'src/components/diario/ChipsEmociones.jsx',
    ].forEach((ruta) => {
      expect(codigoDe(ruta)).toMatch(/if \(entroEnLaSeleccion\([^)]*\)\) toqueSuave\(\)/)
    })
  })

  it('en Respiración: solo detrás de vibraEnFase, dentro de alCambiarFase', () => {
    const hook = codigoDe('src/breathing/hooks/useSesionRespiracion.js')
    const alCambiarFase = hook.match(/alCambiarFase\(ritmo\) \{[\s\S]*?\n {6}\}/)?.[0]
    expect(alCambiarFase).toMatch(/if \(vibraEnFase\(.*\)\) toqueSuave\(\)/)
  })

  it('en «Respira un momento»: con su propia memoria, que pausar y volver no borran', () => {
    const componente = codigoDe('src/components/shared/Respiracion.jsx')
    expect(componente).toMatch(
      /if \(clave !== ultimoToque\.current\) \{\s+ultimoToque\.current = clave\s+toqueSuave\(\)/,
    )
    expect(componente).not.toMatch(/ultimoToque\.current = null/)
  })

  it('«Empezar» de «Respira un momento» pasa de uno en uno', () => {
    const componente = codigoDe('src/components/shared/Respiracion.jsx')
    expect(componente).toMatch(/const arrancar = \(\) =>\s+unaVez\(async \(\) => \{/)
    expect(componente).toMatch(/if \(cuadro\.current\) return/)
  })
})
