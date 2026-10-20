// src/breathing/lib/__tests__/pintorVisual.test.js
// Criterios 12, 13 y 24 de SPEC_14: cuántas veces se toca el dibujo.
//
// Es la prueba de la regla que decide si la respiración se siente suave o a
// trompicones (RN-RE-VIS-33). Como el pintor es puro y recuerda lo último que
// entregó, sus escrituras se pueden **contar**, que es la única forma de
// afirmar "no hay sesenta actualizaciones por segundo" sin decirlo de memoria.

import { describe, expect, it } from 'vitest'

import { crearPintorCirculo, crearPintorLinea } from '../pintorVisual.js'
import { OPACIDAD_HALO_QUIETA, calcularRadios } from '../geometriaCirculo.js'
import { limpiarMemoria } from '../geometriaLinea.js'
import { duracionCiclo, fasesDelCiclo, resolverEstado } from '@lib/respiracion/motorRitmo.js'

const PATRON = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
const LARGO = { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 }
const MS_FRAME = 1000 / 60

/** Cuenta cuántos de esos frames traen algo nuevo que escribir. */
function contarEscrituras(pintor, patron, msDesde, msHasta) {
  let escrituras = 0
  for (let ms = msDesde; ms < msHasta; ms += MS_FRAME) {
    if (pintor.calcular(resolverEstado(patron, ms)) !== null) escrituras += 1
  }
  return escrituras
}

describe('el círculo, a ritmo normal', () => {
  it('cada frame trae un radio nuevo: el movimiento es continuo', () => {
    const pintor = crearPintorCirculo({ msFase: 5000 })
    // Dentro de la inhalación, donde la amplitud cambia de verdad.
    const escrituras = contarEscrituras(pintor, PATRON, 100, 4900)
    const frames = Math.ceil(4800 / MS_FRAME)
    expect(escrituras).toBeGreaterThan(frames * 0.95)
  })

  it('un frame repetido no vuelve a escribir', () => {
    const pintor = crearPintorCirculo({ msFase: 5000 })
    const estado = resolverEstado(PATRON, 2000)
    expect(pintor.calcular(estado)).not.toBeNull()
    expect(pintor.calcular(estado)).toBeNull()
    expect(pintor.calcular(estado)).toBeNull()
  })

  it('durante una retención el disco no se mueve, pero el arco sí avanza', () => {
    const pintor = crearPintorCirculo({ msFase: 7000 })
    const radios = new Set()
    const desfases = new Set()
    for (let ms = 4100; ms < 10900; ms += 100) {
      const paso = pintor.calcular(resolverEstado(LARGO, ms))
      if (paso === null) continue
      radios.add(paso.radioDisco)
      desfases.add(paso.desfase)
    }
    // RN-RE-VIS-05 — Quieto. Y aun así se sabe cuánto falta, que es lo que la
    // referencia externa no resuelve.
    expect(radios.size).toBe(1)
    expect(desfases.size).toBeGreaterThan(50)
  })

  it('entrega el radio, el halo y el desfase que dice la geometría', () => {
    const pintor = crearPintorCirculo({ msFase: 5000 })
    const estado = resolverEstado(PATRON, 2500)
    const paso = pintor.calcular(estado)
    const esperado = calcularRadios(estado.amplitud)
    expect(paso.radioDisco).toBe(esperado.radioDisco)
    expect(paso.radioHalo).toBe(esperado.radioHalo)
    expect(paso.opacidadHalo).toBe(esperado.opacidadHalo)
  })

  it('sin estado no escribe nada', () => {
    expect(crearPintorCirculo().calcular(null)).toBeNull()
    expect(crearPintorCirculo().calcular(undefined)).toBeNull()
  })

  it('reiniciar hace que el frame siguiente vuelva a contar', () => {
    const pintor = crearPintorCirculo({ msFase: 5000 })
    const estado = resolverEstado(PATRON, 2000)
    pintor.calcular(estado)
    expect(pintor.calcular(estado)).toBeNull()
    pintor.reiniciar()
    expect(pintor.calcular(estado)).not.toBeNull()
  })
})

describe('el círculo con movimiento reducido (criterio 13, RN-RE-VIS-20)', () => {
  it('cinco segundos de inhalación caben en cuatro escrituras, no en trescientas', () => {
    const pintor = crearPintorCirculo({ movimientoReducido: true, msFase: 5000 })
    const escrituras = contarEscrituras(pintor, PATRON, 0, 5000)
    // Cuatro escalones de amplitud y cinco pasos de arco: como mucho una
    // actualización por segundo, que es lo que pide la regla.
    expect(escrituras).toBeLessThanOrEqual(5)
  })

  it('una retención de siete segundos se actualiza como mucho siete veces', () => {
    const pintor = crearPintorCirculo({ movimientoReducido: true, msFase: 7000 })
    const escrituras = contarEscrituras(pintor, LARGO, 4000, 11000)
    expect(escrituras).toBeLessThanOrEqual(7)
  })

  it('un ciclo entero nunca supera una escritura por segundo', () => {
    const ciclo = duracionCiclo(PATRON)
    let escrituras = 0
    for (const tramo of fasesDelCiclo(PATRON)) {
      const pintor = crearPintorCirculo({ movimientoReducido: true, msFase: tramo.ms })
      escrituras += contarEscrituras(pintor, PATRON, tramo.msInicio, tramo.msFin)
    }
    expect(escrituras).toBeLessThanOrEqual(Math.ceil(ciclo / 1000))
  })

  it('el halo deja de latir y se queda en la opacidad fija de §7', () => {
    const pintor = crearPintorCirculo({ movimientoReducido: true, msFase: 5000 })
    for (let ms = 0; ms < 5000; ms += 200) {
      const paso = pintor.calcular(resolverEstado(PATRON, ms))
      if (paso !== null) expect(paso.opacidadHalo).toBe(OPACIDAD_HALO_QUIETA)
    }
  })

  it('sigue siendo utilizable: los cuatro escalones aparecen de verdad', () => {
    const pintor = crearPintorCirculo({ movimientoReducido: true, msFase: 5000 })
    const radios = new Set()
    for (let ms = 0; ms < 5000; ms += 50) {
      const paso = pintor.calcular(resolverEstado(PATRON, ms))
      if (paso !== null) radios.add(paso.radioDisco)
    }
    // Reducir el movimiento no puede dejar la guía inservible (§7, criterio 4
    // de la validación manual): el disco sigue recorriendo su rango.
    expect(radios.size).toBeGreaterThanOrEqual(3)
  })
})

describe('la línea', () => {
  it('a ritmo normal, cada frame desplaza la onda', () => {
    limpiarMemoria()
    const pintor = crearPintorLinea({ patron: PATRON })
    const escrituras = contarEscrituras(pintor, PATRON, 0, 3000)
    expect(escrituras).toBeGreaterThan(Math.ceil(3000 / MS_FRAME) * 0.95)
  })

  it('lo que entrega es un desplazamiento y una altura, nada más', () => {
    limpiarMemoria()
    const pintor = crearPintorLinea({ patron: PATRON })
    const paso = pintor.calcular(resolverEstado(PATRON, 1500))
    expect(Object.keys(paso).sort()).toEqual(['desplazamiento', 'reducido', 'y'])
    expect(paso.reducido).toBe(false)
  })

  it('con movimiento reducido se actualiza una vez por segundo', () => {
    limpiarMemoria()
    const pintor = crearPintorLinea({ patron: PATRON, movimientoReducido: true })
    const ciclo = duracionCiclo(PATRON)
    const escrituras = contarEscrituras(pintor, PATRON, 0, ciclo)
    expect(escrituras).toBeLessThanOrEqual(Math.ceil(ciclo / 1000))
  })

  it('sin estado no escribe nada', () => {
    expect(crearPintorLinea({ patron: PATRON }).calcular(null)).toBeNull()
  })
})

describe('en pausa el dibujo se congela (criterio 24)', () => {
  it('el pintor no entrega nada nuevo si nadie le pasa frames nuevos', () => {
    const pintor = crearPintorCirculo({ msFase: 5000 })
    const congelado = resolverEstado(PATRON, 2200)
    pintor.calcular(congelado)
    // Un segundo entero de frames repetidos —que es lo que ocurre en pausa,
    // porque el reloj no avanza— no toca el dibujo ni una vez.
    for (let i = 0; i < 60; i += 1) expect(pintor.calcular(congelado)).toBeNull()
  })

  it('al reanudar en el mismo punto tampoco parpadea', () => {
    const pintor = crearPintorCirculo({ msFase: 5000 })
    const congelado = resolverEstado(PATRON, 2200)
    pintor.calcular(congelado)
    expect(pintor.calcular(congelado)).toBeNull()
    expect(pintor.calcular(resolverEstado(PATRON, 2216))).not.toBeNull()
  })
})
