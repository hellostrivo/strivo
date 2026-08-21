// src/breathing/audio/__tests__/mezclador.test.js
// Criterios 8, 9, 10, 11 y 12 de SPEC_15: las ganancias y los fundidos.
//
// Es donde se comprueba lo que distingue esta capa de audio de una que
// simplemente suena: que nada entra ni sale de golpe, que pausar agacha el
// ambiente en vez de cortarlo, y que un cambio de sonido no deja un hueco.

import { describe, expect, it } from 'vitest'

import {
  FACTOR_PAUSA,
  FUNDIDOS,
  VOLUMEN,
  crearMezclador,
  duracionSalida,
  gananciaAmbiente,
  gananciaGuia,
  normalizarVolumen,
  planDeCruce,
  rampa,
  sumaEnCruce,
} from '../mezclador.js'
import { crearContextoFalso, rampasDeGanancia } from './dobleAudio.js'

describe('ningún cambio de ganancia es un salto (criterio 8, RN-RE-SND-08)', () => {
  it('el mezclador no asigna `.value` ni una sola vez', () => {
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)

    mezclador.entrar(0.6)
    mezclador.aplicarEstado({
      estadoSesion: 'pausado',
      volumenAmbiente: 0.6,
      volumenGuia: 0.5,
      guiaActiva: true,
    })
    mezclador.ajustarVolumenAmbiente(0.35, 'activo')
    mezclador.ajustarVolumenGuia(0.4, 'activo', true)
    mezclador.restablecer(0.6, 'activo')
    mezclador.salir('completado')

    // Un salto de ganancia se oye como un chasquido, y en una app cuyo trabajo
    // es bajarle las pulsaciones a alguien, eso es un fallo de producto.
    expect(ctx.registro.asignacionesDirectas).toEqual([])
  })

  it('cada cambio deja una rampa, no un valor puesto a secas', () => {
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)
    mezclador.entrar(0.6)

    const rampas = rampasDeGanancia(ctx).filter((r) => r.tipo === 'lineal')
    expect(rampas.length).toBeGreaterThan(0)
  })

  it('`rampa` ancla el valor que suena antes de moverlo', () => {
    const ctx = crearContextoFalso()
    const ganancia = ctx.createGain()
    rampa(ganancia.gain, 0.5, 1, 2)

    // Cancelar, anclar y rampar: sin el anclaje, un cambio a mitad de otro
    // fundido daría un salto al valor que hubiera programado el anterior.
    expect(ganancia.gain.rampas.map((r) => r.tipo)).toEqual(['cancelar', 'set', 'lineal'])
    expect(ganancia.gain.rampas[2].t).toBe(3)
  })

  it('una duración de cero sigue siendo una rampa corta, no una asignación', () => {
    const ctx = crearContextoFalso()
    const ganancia = ctx.createGain()
    rampa(ganancia.gain, 0.2, 0, 0)
    expect(ganancia.gain.rampas.at(-1).tipo).toBe('lineal')
    expect(ganancia.gain.asignacionesDirectas).toBe(0)
  })
})

describe('los tiempos de los fundidos (criterio 9)', () => {
  it('entrada 2,0 s · cierre 3,0 s · terminar 0,8 s', () => {
    expect(FUNDIDOS.entrada).toBe(2.0)
    expect(FUNDIDOS.salidaCompletado).toBe(3.0)
    expect(FUNDIDOS.salidaTerminar).toBe(0.8)
  })

  it('terminar va más rápido que completar, porque la persona decidió irse', () => {
    expect(duracionSalida('terminar')).toBeLessThan(duracionSalida('completado'))
  })

  it('la entrada se programa con sus dos segundos', () => {
    const ctx = crearContextoFalso()
    crearMezclador(ctx).entrar(0.6)
    const lineal = rampasDeGanancia(ctx).find((r) => r.tipo === 'lineal')
    expect(lineal.t).toBeCloseTo(FUNDIDOS.entrada, 6)
  })

  it('el cierre programa sus tres segundos sobre ambiente y guía', () => {
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)
    mezclador.entrar(0.6)
    ctx.avanzar(10)

    expect(mezclador.salir('completado')).toBe(3.0)
    const finales = rampasDeGanancia(ctx).filter((r) => r.tipo === 'lineal' && r.t === 13)
    expect(finales).toHaveLength(2)
  })

  it('terminar programa 800 ms', () => {
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)
    ctx.avanzar(5)
    expect(mezclador.salir('terminar')).toBe(0.8)
    expect(rampasDeGanancia(ctx).some((r) => r.t === 5.8)).toBe(true)
  })
})

describe('al pausar (criterios 10 y 11)', () => {
  it('el ambiente baja al 30 %, no a cero (RN-RE-SND-12)', () => {
    expect(FACTOR_PAUSA).toBe(0.3)
    expect(gananciaAmbiente(0.6, 'pausado')).toBeCloseTo(0.18, 10)
    // Cortar el fondo en seco sobresalta, que es lo contrario del propósito; y
    // un silencio repentino llama más la atención que el propio sonido.
    expect(gananciaAmbiente(0.6, 'pausado')).toBeGreaterThan(0)
  })

  it('la guía sí se calla del todo (RN-RE-SND-13)', () => {
    // La diferencia es deliberada: la guía marca el ritmo, y sin ritmo que
    // marcar no tiene nada que decir. El ambiente es paisaje y sigue ahí.
    expect(gananciaGuia(0.5, 'pausado', true)).toBe(0)
  })

  it('al reanudar, las dos vuelven a su volumen', () => {
    expect(gananciaAmbiente(0.6, 'activo')).toBeCloseTo(0.6, 10)
    expect(gananciaGuia(0.5, 'activo', true)).toBeCloseTo(0.5, 10)
  })

  it('la guía apagada es cero en cualquier estado', () => {
    expect(gananciaGuia(0.5, 'activo', false)).toBe(0)
    expect(gananciaGuia(0.5, 'pausado', false)).toBe(0)
  })

  it('la bajada y la subida tardan 500 ms', () => {
    expect(FUNDIDOS.pausa).toBe(0.5)
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)
    mezclador.aplicarEstado({
      estadoSesion: 'pausado',
      volumenAmbiente: 0.6,
      volumenGuia: 0.5,
      guiaActiva: true,
    })
    expect(rampasDeGanancia(ctx).some((r) => r.tipo === 'lineal' && r.t === 0.5)).toBe(true)
  })
})

describe('el cruce nunca deja silencio (criterio 12, RN-RE-SND-14)', () => {
  it('en ningún instante la suma de las dos ganancias es cero', () => {
    const plan = planDeCruce(0, 0.6)
    for (let t = 0; t <= FUNDIDOS.cruce; t += 0.05) {
      expect(sumaEnCruce(plan, t, 0.6)).toBeGreaterThan(0)
    }
  })

  it('la suma se mantiene cerca del volumen destino durante todo el cruce', () => {
    const plan = planDeCruce(0, 0.6)
    for (let t = 0; t <= FUNDIDOS.cruce; t += 0.05) {
      const suma = sumaEnCruce(plan, t, 0.6)
      // Un hueco de volumen en mitad de un cambio se lee como un fallo, no como
      // una transición. Con igual potencia la suma se mueve entre 1 y √2.
      expect(suma).toBeGreaterThanOrEqual(0.6 * 0.99)
      expect(suma).toBeLessThanOrEqual(0.6 * Math.SQRT2 + 0.001)
    }
  })

  it('las dos rampas empiezan en el mismo instante: se solapan', () => {
    const plan = planDeCruce(4, 0.6)
    expect(plan.sale.desde).toBe(plan.entra.desde)
    expect(plan.sale.hasta).toBe(plan.entra.hasta)
  })

  it('el cruce dura 1,2 s', () => {
    expect(FUNDIDOS.cruce).toBe(1.2)
  })
})

describe('los volúmenes (§3.5)', () => {
  it('de fábrica: ambiente 60 %, guía 50 %', () => {
    expect(VOLUMEN.ambientePorDefecto).toBe(0.6)
    expect(VOLUMEN.guiaPorDefecto).toBe(0.5)
  })

  it('el paso es del 5 %', () => {
    expect(VOLUMEN.paso).toBe(0.05)
    expect(normalizarVolumen(0.63)).toBeCloseTo(0.65, 10)
    expect(normalizarVolumen(0.62)).toBeCloseTo(0.6, 10)
  })

  it('se recorta a 0..1 en vez de amplificar', () => {
    expect(normalizarVolumen(4)).toBe(1)
    expect(normalizarVolumen(-2)).toBe(0)
  })

  it('un valor que no es número cae en el de fábrica', () => {
    expect(normalizarVolumen('alto')).toBe(VOLUMEN.ambientePorDefecto)
    expect(normalizarVolumen(undefined)).toBe(VOLUMEN.ambientePorDefecto)
  })

  it('mover el control es una rampa de 120 ms (RN-RE-SND-17)', () => {
    expect(FUNDIDOS.volumen).toBe(0.12)
  })

  it('la maestra se queda en 1: el volumen del sistema es de quien lo tiene', () => {
    // RN-RE-SND-15 — Una app que pelea el volumen del teléfono es una app que
    // se desinstala.
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)
    mezclador.entrar(0.6)
    mezclador.aplicarEstado({
      estadoSesion: 'activo',
      volumenAmbiente: 0.6,
      volumenGuia: 0.5,
      guiaActiva: true,
    })
    expect(mezclador.maestra.gain.value).toBe(1)
  })
})

describe('el grafo de §3.4', () => {
  it('ambiente y guía entran por su ganancia y salen por la maestra', () => {
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)

    expect(mezclador.entradaAmbiente.conectado).toContain(mezclador.maestra)
    expect(mezclador.entradaGuia.conectado).toContain(mezclador.maestra)
    expect(mezclador.maestra.conectado).toContain(ctx.destination)
  })

  it('las dos entradas arrancan en silencio', () => {
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)
    expect(mezclador.entradaAmbiente.gain.value).toBe(0)
    expect(mezclador.entradaGuia.gain.value).toBe(0)
  })

  it('liberar desconecta los tres nodos', () => {
    const ctx = crearContextoFalso()
    const mezclador = crearMezclador(ctx)
    mezclador.liberar()
    expect(mezclador.entradaAmbiente.desconectado).toBe(true)
    expect(mezclador.entradaGuia.desconectado).toBe(true)
    expect(mezclador.maestra.desconectado).toBe(true)
  })
})
