// src/diario/__tests__/vueltaAHoy.test.js
// La vuelta a Hoy después de los dos cierres del día (20 oct 2026).
//
// Lo pidió el propietario del producto: el paso del cierre a Hoy se sentía un
// corte, y Hoy aparecía donde se había quedado el recorrido y no desde arriba.
// Las dos cosas tenían la misma causa —la consulta no estaba montada debajo
// mientras el cierre se desvanecía— y se vigilan aquí, para la mañana y para
// la noche a la vez: el encargo pide exactamente lo mismo en las dos.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { volverAlInicio } from '@lib/volverAlInicio'
import * as Manana from '@components/diario/manana/AperturaDelDia'
import * as Noche from '@components/diario/noche/CierreDeLaNoche'

const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const CSS = readFileSync('src/styles/globals.css', 'utf8')

const RITUALES = [
  {
    nombre: 'mañana',
    cierre: codigoDe('src/components/diario/manana/AperturaDelDia.jsx'),
    contenedor: codigoDe('src/components/diario/DiarioManana.jsx'),
    modulo: Manana,
  },
  {
    nombre: 'noche',
    cierre: codigoDe('src/components/diario/noche/CierreDeLaNoche.jsx'),
    contenedor: codigoDe('src/components/diario/DiarioNoche.jsx'),
    modulo: Noche,
  },
]

describe('el desvanecido: solo opacidad, ~700 ms, la curva de los velos', () => {
  const regla = CSS.match(/\.salida-cierre \{[\s\S]*?\n {2}\}/)[0]
  const fotogramas = CSS.match(/@keyframes salida-cierre \{[\s\S]*?\n\}/)[0]

  it.each(RITUALES)('$nombre: dura lo mismo en el componente y en la hoja', ({ modulo }) => {
    expect(modulo.SALIDA).toBe(700)
    expect(Number(regla.match(/salida-cierre (\d+)ms/)[1])).toBe(modulo.SALIDA)
  })

  it('no mueve, no escala y no vuelve a aparecer', () => {
    expect(fotogramas).not.toMatch(/transform|translate|scale|rotate|filter/)
    expect(regla).toMatch(/forwards/)
  })
})

describe.each(RITUALES)('$nombre: Hoy ya está debajo cuando el cierre empieza a irse', (r) => {
  it('irse avisa primero y después se desvanece, una sola vez', () => {
    const irse = r.cierre.match(/const irse = \(\) => \{[\s\S]*?\n {2}\}/)[0]
    expect(irse).toMatch(/if \(yendose\.current\) return/)
    expect(irse.indexOf('alVolver.current?.()')).toBeLessThan(irse.indexOf('setSaliendo(true)'))
    // Con movimiento reducido no hay desvanecido: se vuelve en el acto.
    expect(irse).toMatch(/if \(prefiereMenosMovimiento\(\)\) return terminar\(\)/)
  })

  it('el desvanecido termina por su cuenta y el reloj se limpia', () => {
    expect(r.cierre).toMatch(/if \(!saliendo\) return undefined/)
    expect(r.cierre).toMatch(/setTimeout\(terminar, SALIDA\)/)
  })

  it('al avisar, la consulta se monta debajo y el cierre sigue montado encima', () => {
    expect(r.contenedor).toMatch(/onVolver=\{\(\) => \{[\s\S]*?setVista\('resumen'\)/)
    expect(r.contenedor).toMatch(/onTerminar=\{\(\) => setConCierre\(false\)\}/)
    // El cierre y la consulta en el mismo árbol: si el cierre fuera la raíz
    // en una vista y un hijo en la otra, React lo remontaría a media salida.
    expect(r.contenedor).toMatch(/if \(vista === 'cierre' \|\| vista === 'resumen'\) \{/)
    expect(r.contenedor).not.toMatch(/if \(vista === 'cierre'\) return/)
    expect(r.contenedor).toMatch(/\{cierre\}\s*<\/>/)
  })

  it('la pantalla vuelve arriba antes de pintar, y no a la tarjeta', () => {
    expect(r.contenedor).toMatch(/useLayoutEffect\(\(\) => \{/)
    const efecto = r.contenedor.match(/useLayoutEffect\(\(\) => \{[\s\S]*?\}, \[paso, vista\]\)/)[0]
    expect(efecto.indexOf('volverAlInicio(marco.current)')).toBeLessThan(
      efecto.indexOf('scrollIntoView'),
    )
    expect(efecto).toMatch(/alInicio\.current = false\s*volverAlInicio\(marco\.current\)\s*return/)
  })

  it('cambiar de día no deja un cierre colgando', () => {
    expect(r.contenedor).toMatch(/setConCierre\(false\)\s*alInicio\.current = false/)
  })
})

describe('volverAlInicio', () => {
  const nodo = (scrollTop, parentElement = null) => ({ scrollTop, parentElement })

  it('devuelve a cero el documento y cualquier contenedor desplazado', () => {
    const raiz = nodo(900)
    const contenedor = nodo(400, nodo(0))
    const elemento = { parentElement: contenedor, ownerDocument: { scrollingElement: raiz } }
    volverAlInicio(elemento)
    expect(raiz.scrollTop).toBe(0)
    expect(contenedor.scrollTop).toBe(0)
  })

  it('sin elemento no lanza', () => {
    expect(() => volverAlInicio(null)).not.toThrow()
  })
})
