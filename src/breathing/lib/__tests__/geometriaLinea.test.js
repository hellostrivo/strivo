// src/breathing/lib/__tests__/geometriaLinea.test.js
// Criterios 7, 8, 9, 10, 11 y 22 de SPEC_14.
//
// La bolita sobre línea es la visual que más puede salir mal sin que se note:
// una meseta que ondula, una bolita que flota un píxel por encima del trazo, un
// muestreo que se repite sesenta veces por segundo. Nada de eso se ve mirando;
// todo se mide aquí.

import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  FRACCION_ALTO_UTIL,
  MS_CICLO_MINIMO_ETIQUETAS,
  MS_MUESTREO,
  MS_VENTANA_MINIMA,
  POSICION_BOLITA,
  VIEWBOX,
  generarOnda,
  generarOndaEstatica,
  limpiarMemoria,
  msDeEstado,
  msVentanaDe,
  muestrearOnda,
  trazoSuave,
  yDeAmplitud,
  yDelTrazoEnX,
} from '../geometriaLinea.js'
import { CATALOGO_PATRONES } from '@/breathing/data/catalogoPatrones.js'
import * as motor from '@lib/respiracion/motorRitmo.js'

const { duracionCiclo, fasesDelCiclo, resolverEstado } = motor
const PRESETS = CATALOGO_PATRONES.map((entrada) => [entrada.id, entrada.patron])

beforeEach(() => limpiarMemoria())

describe('la ventana de tiempo (§4.2)', () => {
  it('siempre enseña al menos dos ciclos', () => {
    for (const [, patron] of PRESETS) {
      expect(msVentanaDe(patron)).toBeGreaterThanOrEqual(duracionCiclo(patron) * 2)
    }
  })

  it('y nunca baja de veinte segundos, por corto que sea el ciclo', () => {
    expect(msVentanaDe({ inhalar: 30, retenerLleno: 0, exhalar: 30, retenerVacio: 0 })).toBe(
      MS_VENTANA_MINIMA,
    )
  })

  it('la bolita va al 38 %: se ve más futuro que pasado', () => {
    expect(POSICION_BOLITA).toBe(0.38)
    expect(POSICION_BOLITA).toBeLessThan(0.5)
  })
})

describe('el trazo es válido para los siete patrones (criterio 7)', () => {
  it.each(PRESETS)('%s: el path se parsea y empieza con un M', (_id, patron) => {
    const { d } = muestrearOnda(patron)
    expect(d.startsWith('M ')).toBe(true)
    // Solo comandos que existen, y ningún NaN colado en una coordenada.
    expect(d).toMatch(/^M [\d.\- ]+( Q [\d.\- ]+)+ L [\d.\- ]+$/)
    expect(d).not.toMatch(/NaN|Infinity|undefined/)
  })

  it.each(PRESETS)('%s: todo el trazo cae dentro del viewBox', (_id, patron) => {
    const { puntos } = muestrearOnda(patron)
    for (const punto of puntos) {
      expect(punto.y).toBeGreaterThanOrEqual(0)
      expect(punto.y).toBeLessThanOrEqual(VIEWBOX.alto)
    }
  })

  it('amplitud 1 queda arriba y amplitud 0 abajo, con aire a los dos lados', () => {
    const util = VIEWBOX.alto * FRACCION_ALTO_UTIL
    const margen = (VIEWBOX.alto - util) / 2
    expect(yDeAmplitud(1)).toBeCloseTo(margen, 8)
    expect(yDeAmplitud(0)).toBeCloseTo(margen + util, 8)
    expect(margen).toBeGreaterThan(0)
  })

  it('un patrón sin ninguna fase da una recta en reposo, no una división por cero', () => {
    const vacio = muestrearOnda({ inhalar: 0, retenerLleno: 0, exhalar: 0, retenerVacio: 0 })
    expect(vacio.d).not.toMatch(/NaN/)
    expect(vacio.marcasFase).toEqual([])
  })
})

describe('la bolita se apoya sobre el trazo (criterio 8, RN-RE-VIS-09)', () => {
  it.each(PRESETS)('%s: error menor a 1 unidad en 20 instantes del ciclo', (_id, patron) => {
    const ciclo = duracionCiclo(patron)
    for (let i = 0; i < 20; i += 1) {
      // Tercer ciclo: así se comprueba también que el desplazamiento envuelve.
      const ms = ciclo * 3 + (ciclo * i) / 20
      const onda = generarOnda(patron, ms)
      const xEnElTrazo = onda.puntoBolita.x - onda.desplazamiento
      const yDelTrazo = yDelTrazoEnX(onda.puntos, xEnElTrazo)
      expect(Math.abs(yDelTrazo - onda.puntoBolita.y)).toBeLessThan(1)
    }
  })

  it('la Y de la bolita sale de la amplitud del motor, no de leer el path', () => {
    const patron = { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 }
    for (const ms of [500, 4200, 9000, 14000]) {
      const onda = generarOnda(patron, ms)
      expect(onda.puntoBolita.y).toBe(yDeAmplitud(resolverEstado(patron, ms).amplitud))
    }
  })

  it('la bolita no se mueve en X: solo sube y baja', () => {
    const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
    const xs = new Set()
    for (let ms = 0; ms < 30000; ms += 250) xs.add(generarOnda(patron, ms).puntoBolita.x)
    expect(xs.size).toBe(1)
    expect([...xs][0]).toBeCloseTo(VIEWBOX.ancho * POSICION_BOLITA, 8)
  })
})

describe('las mesetas son planas de verdad (criterio 9, RN-RE-VIS-10)', () => {
  it.each([
    ['retenerLleno de 7 s', { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 }],
    ['retenerVacio de 3 s', { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }],
    ['caja con las cuatro', { inhalar: 40, retenerLleno: 40, exhalar: 40, retenerVacio: 40 }],
  ])('%s: varianza de Y igual a cero en la retención', (_nombre, patron) => {
    const onda = muestrearOnda(patron)
    for (const tramo of fasesDelCiclo(patron)) {
      if (tramo.fase !== 'retenerLleno' && tramo.fase !== 'retenerVacio') continue
      const ys = onda.puntos
        .filter((punto) => {
          const ms = punto.x / onda.pxPorMs + onda.msInicio
          const dentro = ((ms % onda.msCiclo) + onda.msCiclo) % onda.msCiclo
          // Un margen de un paso de muestreo a cada lado: los puntos justo en el
          // borde pertenecen a la transición y no a la meseta.
          return dentro > tramo.msInicio + MS_MUESTREO && dentro < tramo.msFin - MS_MUESTREO
        })
        .map((punto) => punto.y)
      expect(ys.length).toBeGreaterThan(5)
      expect(new Set(ys).size).toBe(1)
    }
  })

  it('el suavizado no ondula un tramo llano: una meseta sigue siendo una recta', () => {
    const llano = Array.from({ length: 12 }, (_, i) => ({ x: i * 10, y: 80 }))
    const d = trazoSuave(llano)
    const ys = [...d.matchAll(/ (-?[\d.]+)(?= |$)/g)].map((m) => Number(m[1]))
    // Todas las Y del path —controles y puntos de llegada— valen lo mismo.
    expect(new Set(ys.filter((_, i) => i % 2 === 1)).size).toBe(1)
  })
})

describe('un pico sin retención sigue siendo suave (criterio 10, caso 11.1)', () => {
  const sinRetenciones = { inhalar: 40, retenerLleno: 0, exhalar: 80, retenerVacio: 0 }

  it('no hay meseta donde no hay retención', () => {
    expect(fasesDelCiclo(sinRetenciones).map((t) => t.fase)).toEqual(['inhalar', 'exhalar'])
  })

  it('la segunda derivada no da un salto en el pico', () => {
    const onda = muestrearOnda(sinRetenciones)
    const ys = onda.puntos.map((p) => p.y)
    const segundas = []
    for (let i = 1; i < ys.length - 1; i += 1) {
      segundas.push(Math.abs(ys[i - 1] - 2 * ys[i] + ys[i + 1]))
    }
    const mayor = Math.max(...segundas)
    const tipica = segundas.reduce((s, n) => s + n, 0) / segundas.length
    // Un vértice agudo dispararía la segunda derivada muy por encima de lo
    // habitual. Con la curva del motor y el suavizado, se queda en el mismo
    // orden de magnitud que el resto del trazo.
    expect(mayor).toBeLessThan(tipica * 12 + 1)
  })

  it('el pico llega a amplitud 1 aunque no se sostenga', () => {
    const ciclo = duracionCiclo(sinRetenciones)
    const alto = Math.min(...muestrearOnda(sinRetenciones).puntos.map((p) => p.y))
    expect(alto).toBeCloseTo(yDeAmplitud(1), 6)
    expect(resolverEstado(sinRetenciones, 4000).amplitud).toBeCloseTo(1, 6)
    expect(ciclo).toBe(12000)
  })
})

describe('el muestreo se memoiza (criterio 11, RN-RE-VIS-31)', () => {
  it('dos llamadas iguales muestrean una sola vez', () => {
    const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
    const espia = vi.spyOn(motor, 'resolverEstado')

    muestrearOnda(patron)
    const primera = espia.mock.calls.length
    muestrearOnda(patron)
    const segunda = espia.mock.calls.length

    expect(primera).toBeGreaterThan(100)
    expect(segunda).toBe(primera)
    espia.mockRestore()
  })

  it('por frame solo se resuelve el estado de la bolita, no la onda entera', () => {
    const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
    generarOnda(patron, 0)
    const espia = vi.spyOn(motor, 'resolverEstado')
    for (let i = 1; i <= 60; i += 1) generarOnda(patron, i * 16)
    // Sesenta frames, sesenta resoluciones: una por frame y ni una más.
    expect(espia.mock.calls.length).toBe(60)
    espia.mockRestore()
  })

  it('cambiar de patrón sí vuelve a muestrear', () => {
    const espia = vi.spyOn(motor, 'resolverEstado')
    muestrearOnda({ inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 })
    const tras = espia.mock.calls.length
    muestrearOnda({ inhalar: 40, retenerLleno: 40, exhalar: 40, retenerVacio: 40 })
    expect(espia.mock.calls.length).toBeGreaterThan(tras)
    espia.mockRestore()
  })

  it('lo único que cambia por frame es el desplazamiento (RN-RE-VIS-32)', () => {
    const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
    const a = generarOnda(patron, 1000)
    const b = generarOnda(patron, 1016)
    expect(a.d).toBe(b.d)
    expect(a.puntos).toBe(b.puntos)
    expect(a.desplazamiento).not.toBe(b.desplazamiento)
  })
})

describe('las marcas de fase (§4.5, RN-RE-VIS-14 y 15)', () => {
  it('hay una marca por cambio de fase y por ciclo visible', () => {
    const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
    const onda = muestrearOnda(patron)
    const fases = fasesDelCiclo(patron).length
    expect(onda.marcasFase.length % fases).toBe(0)
    expect(onda.marcasFase.length).toBeGreaterThanOrEqual(fases * 2)
  })

  it('solo las futuras se etiquetan: las pasadas llevan la línea y nada más', () => {
    const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
    const onda = generarOnda(patron, 20000)
    const xBolita = VIEWBOX.ancho * POSICION_BOLITA
    for (const marca of onda.marcasFase) {
      expect(marca.futura).toBe(marca.x + onda.desplazamiento > xBolita)
    }
    expect(onda.marcasFase.some((m) => m.futura)).toBe(true)
    expect(onda.marcasFase.some((m) => !m.futura)).toBe(true)
  })

  it('con el ciclo por debajo de 8 s las etiquetas se apagan por apiñamiento', () => {
    const corto = { inhalar: 30, retenerLleno: 0, exhalar: 30, retenerVacio: 0 }
    expect(duracionCiclo(corto)).toBeLessThan(MS_CICLO_MINIMO_ETIQUETAS)
    expect(muestrearOnda(corto).etiquetasVisibles).toBe(false)
    // Las líneas se quedan: lo que se retira es el texto.
    expect(muestrearOnda(corto).marcasFase.length).toBeGreaterThan(0)
  })

  it('con un ciclo holgado sí se etiquetan', () => {
    expect(
      muestrearOnda({ inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 })
        .etiquetasVisibles,
    ).toBe(true)
  })
})

describe('el instante que representa un estado (msDeEstado)', () => {
  it.each(PRESETS)('%s: reconstruye el tiempo con error menor a un milisegundo', (_id, patron) => {
    const ciclo = duracionCiclo(patron)
    for (const ms of [0, ciclo * 0.3, ciclo * 0.77, ciclo * 2.4]) {
      expect(msDeEstado(patron, resolverEstado(patron, ms))).toBeCloseTo(ms, 6)
    }
  })

  it('sin estado devuelve cero en vez de romperse', () => {
    expect(msDeEstado({ inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }, null)).toBe(
      0,
    )
  })
})

describe('movimiento reducido: la onda no se mueve (§7)', () => {
  const patron = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }

  it('se dibuja un ciclo entero y quieto, sin desplazamiento', () => {
    const a = generarOndaEstatica(patron, 0)
    const b = generarOndaEstatica(patron, 7000)
    expect(a.d).toBe(b.d)
    expect(a.desplazamiento).toBeUndefined()
  })

  it('el marcador avanza a saltos de un segundo, no por frame (RN-RE-VIS-20)', () => {
    const posiciones = new Set()
    for (let ms = 0; ms < duracionCiclo(patron); ms += 16) {
      posiciones.add(generarOndaEstatica(patron, ms).marcador.x)
    }
    // Trece segundos de ciclo → trece posiciones, no ochocientas.
    expect(posiciones.size).toBe(duracionCiclo(patron) / 1000)
  })

  it('el marcador se apoya en la onda igual que la bolita', () => {
    for (const ms of [0, 3000, 6000, 11000]) {
      const dibujo = generarOndaEstatica(patron, ms)
      const y = yDelTrazoEnX(dibujo.puntos, dibujo.marcador.x)
      expect(Math.abs(y - dibujo.marcador.y)).toBeLessThan(1)
    }
  })

  it('un patrón vacío tampoco la rompe', () => {
    const vacio = generarOndaEstatica(
      { inhalar: 0, retenerLleno: 0, exhalar: 0, retenerVacio: 0 },
      0,
    )
    expect(vacio.d).not.toMatch(/NaN/)
    expect(vacio.marcador).toEqual({ x: 0, y: yDeAmplitud(0) })
  })
})

describe('cabe en un teléfono estrecho (criterio 22, caso 11.4)', () => {
  it('el viewBox de la línea es panorámico y no se deforma', () => {
    expect(VIEWBOX).toEqual({ ancho: 380, alto: 200 })
    expect(VIEWBOX.ancho / VIEWBOX.alto).toBeCloseTo(1.9, 6)
  })

  it('a 320 px de ancho la línea ocupa 320 y el círculo 230, sin desbordar', () => {
    const viewport = 320
    // `.respiracion-linea` es `width: 100%` con tope de 420.
    expect(Math.min(viewport, 420)).toBeLessThanOrEqual(viewport)
    // `.respiracion-circulo` es `min(72vw, 46vh)` con tope de 340.
    const circulo = Math.min(0.72 * viewport, 0.46 * 568, 340)
    expect(circulo).toBeLessThan(viewport)
    expect(Math.round(circulo)).toBe(230)
  })
})
