// src/breathing/audio/__tests__/motorAmbiente.test.js
// Criterios 12, 13, 14 y 18 de SPEC_15, y los casos 6.3, 6.4 y 6.7.
//
// Aquí se comprueba lo que más fácil se rompe sin que nadie lo note: que
// cambiar de sonido no acumule fuentes. Diez fuentes de ruido rosa a volumen
// bajo siguen siendo diez fuentes de ruido rosa, y el síntoma no es un fallo
// —no hay excepción, no hay error en consola— sino que el teléfono se calienta
// y el ambiente suena "raro".

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { crearMotorAmbiente, MS_VISTA_PREVIA } from '../motorAmbiente.js'
import { FUNDIDOS } from '../mezclador.js'
import { ID_SILENCIO } from '../../data/catalogoSonidos.js'
import { crearContextoFalso, nodosVivos } from './dobleAudio.js'

function azarFijo(semilla = 1) {
  let estado = semilla
  return () => {
    estado = (estado * 1103515245 + 12345) % 2147483648
    return estado / 2147483648
  }
}

function montar() {
  const ctx = crearContextoFalso()
  const motor = crearMotorAmbiente(ctx, { azar: azarFijo() })
  return { ctx, motor }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('cambiar de sonido en vivo (criterio 12, RN-RE-SND-14)', () => {
  it('arranca en silencio: nadie recibe sonido que no pidió', () => {
    const { motor } = montar()
    expect(motor.sonidoActual()).toBe(ID_SILENCIO)
    expect(motor.fuentesVivas()).toBe(0)
  })

  it('durante el cruce conviven exactamente dos fuentes, ni una más', () => {
    const { motor } = montar()
    motor.cambiarSonido('lluvia')
    motor.cambiarSonido('olas')
    // La que sale y la que entra. Nunca hay silencio intermedio porque las dos
    // están sonando a la vez mientras dura el cruce.
    expect(motor.fuentesVivas()).toBe(2)
  })

  it('pasado el cruce solo queda la nueva', () => {
    const { motor } = montar()
    motor.cambiarSonido('lluvia')
    motor.cambiarSonido('olas')

    vi.advanceTimersByTime(FUNDIDOS.cruce * 1000 + 100)

    expect(motor.fuentesVivas()).toBe(1)
    expect(motor.sonidoActual()).toBe('olas')
  })

  it('elegir el mismo sonido no monta nada nuevo', () => {
    const { motor } = montar()
    motor.cambiarSonido('lluvia')
    const vivas = motor.fuentesVivas()
    motor.cambiarSonido('lluvia')
    expect(motor.fuentesVivas()).toBe(vivas)
  })
})

describe('cinco cambios en dos segundos (criterio 13, caso 6.3)', () => {
  it('dejan exactamente una fuente viva', () => {
    const { motor } = montar()

    // Alguien probando la lista. Cada cruce cancela el anterior de verdad: se
    // libera la saliente en vez de dejarla desvaneciéndose por su cuenta.
    for (const id of ['lluvia', 'olas', 'viento', 'cristales', 'fuego']) {
      motor.cambiarSonido(id)
      vi.advanceTimersByTime(400)
    }
    vi.advanceTimersByTime(FUNDIDOS.cruce * 1000 + 100)

    expect(motor.fuentesVivas()).toBe(1)
    expect(motor.sonidoActual()).toBe('fuego')
  })

  it('y no acumulan nodos por el camino', () => {
    const { ctx, motor } = montar()

    for (const id of ['lluvia', 'olas', 'viento', 'cristales', 'fuego', 'lluvia']) {
      motor.cambiarSonido(id)
      vi.advanceTimersByTime(300)
    }
    vi.advanceTimersByTime(3000)
    const conSeisCambios = nodosVivos(ctx).length

    motor.liberar()
    expect(nodosVivos(ctx)).toEqual([])
    expect(conSeisCambios).toBeLessThan(40)
  })

  it('volver al silencio libera los nodos (RN-RE-SND-16)', () => {
    const { motor } = montar()
    motor.cambiarSonido('lluvia')
    motor.cambiarSonido(ID_SILENCIO)
    vi.advanceTimersByTime(FUNDIDOS.cruce * 1000 + 100)

    // Elegir silencio es "no quiero esto sonando" y sí libera. Poner el volumen
    // a cero es "ahora no quiero oírlo" y no libera: son dos cosas distintas.
    expect(motor.fuentesVivas()).toBe(0)
    expect(motor.sonidoActual()).toBe(ID_SILENCIO)
  })

  it('el volumen a cero no libera nada (caso 6.7)', () => {
    const { motor } = montar()
    motor.cambiarSonido('cristales')
    motor.ajustarVolumen(0)

    // Los nodos siguen vivos, así que subir el control se oye de inmediato en
    // vez de tener que reconstruir la fuente y esperar a que entre.
    expect(motor.fuentesVivas()).toBe(1)
    expect(motor.sonidoActual()).toBe('cristales')
  })
})

describe('una sesión larga no tiene fugas (criterio 14, caso 6.4)', () => {
  it('el conteo de nodos se mantiene acotado durante sesenta minutos', () => {
    const { ctx, motor } = montar()
    motor.cambiarSonido('lluvia')
    motor.entrar()

    const porMinuto = []
    for (let minuto = 0; minuto < 60; minuto += 1) {
      ctx.avanzar(60)
      vi.advanceTimersByTime(60000)
      porMinuto.push(nodosVivos(ctx).length)
    }

    // **Acotado, no idéntico**, y la diferencia importa. Una gota vive 140 ms,
    // así que en cualquier instante hay unas cuantas en vuelo y el número exacto
    // depende de en qué momento se mire: exigir igualdad exacta sería exigir que
    // el azar se repita. Lo que delata una fuga es que la cifra **crezca**, y
    // eso sí se puede afirmar.
    const primeros = Math.max(...porMinuto.slice(0, 10))
    const ultimos = Math.max(...porMinuto.slice(-10))

    expect(ultimos).toBeLessThanOrEqual(primeros)
    expect(Math.max(...porMinuto)).toBeLessThan(40)
    motor.liberar()
  })

  it('sin la siega, una hora de gotas dejaría cientos de nodos', () => {
    // El contraste que da sentido a la prueba de arriba: antes de sembrar la
    // siega por tiempo, esta misma sesión pasaba de 16 nodos al minuto 1 a 451
    // a los sesenta. Es un fallo que no da error ni excepción: da un teléfono
    // caliente y un ambiente que suena raro.
    const { ctx, motor } = montar()
    motor.cambiarSonido('lluvia')
    motor.entrar()
    for (let minuto = 0; minuto < 60; minuto += 1) {
      ctx.avanzar(60)
      vi.advanceTimersByTime(60000)
    }
    expect(nodosVivos(ctx).length).toBeLessThan(40)
    motor.liberar()
  })

  it('y al soltar no queda ni un nodo (RN-RE-SND-22)', () => {
    const { ctx, motor } = montar()
    motor.cambiarSonido('fuego')
    motor.entrar()
    ctx.avanzar(30)
    vi.advanceTimersByTime(30000)

    motor.liberar()
    expect(nodosVivos(ctx)).toEqual([])
    expect(motor.fuentesVivas()).toBe(0)
  })

  it('liberar dos veces no rompe nada', () => {
    const { motor } = montar()
    motor.cambiarSonido('olas')
    expect(() => {
      motor.liberar()
      motor.liberar()
    }).not.toThrow()
  })
})

describe('la vista previa (RN-RE-SND-27 y 28)', () => {
  it('suena en el momento, sin sesión empezada', () => {
    const { motor } = montar()
    motor.vistaPrevia('viento')
    // Elegir un sonido por su nombre es adivinar, y adivinar aquí significa
    // empezar la sesión con el sonido equivocado.
    expect(motor.sonidoActual()).toBe('viento')
    expect(motor.fuentesVivas()).toBe(1)
  })

  it('se apaga sola a los veinte segundos', () => {
    const { motor } = montar()
    motor.vistaPrevia('lluvia')

    vi.advanceTimersByTime(MS_VISTA_PREVIA + 100)
    vi.advanceTimersByTime(FUNDIDOS.cruce * 1000 + 100)

    expect(motor.sonidoActual()).toBe(ID_SILENCIO)
  })

  it('cambiar de vista previa cancela el temporizador de la anterior', () => {
    const { motor } = montar()
    motor.vistaPrevia('lluvia')
    vi.advanceTimersByTime(15000)
    motor.vistaPrevia('olas')

    // Si el primer temporizador siguiera vivo, apagaría la segunda a los 5 s.
    vi.advanceTimersByTime(6000)
    expect(motor.sonidoActual()).toBe('olas')
  })

  it('la vista previa del silencio no deja un temporizador colgado', () => {
    const { motor } = montar()
    motor.vistaPrevia(ID_SILENCIO)
    expect(motor.sonidoActual()).toBe(ID_SILENCIO)
    expect(() => vi.advanceTimersByTime(MS_VISTA_PREVIA * 2)).not.toThrow()
  })

  it('detenerla la para antes de tiempo', () => {
    const { motor } = montar()
    motor.vistaPrevia('fuego')
    motor.detenerVistaPrevia()
    vi.advanceTimersByTime(FUNDIDOS.cruce * 1000 + 100)
    expect(motor.sonidoActual()).toBe(ID_SILENCIO)
  })

  it('suena al volumen configurado, para que se oiga como se va a oír', () => {
    const { ctx, motor } = montar()
    motor.ajustarVolumen(0.35)
    motor.vistaPrevia('lluvia')

    // RN-RE-SND-28 — Subirla "para que se aprecie" haría que la elección se
    // tomara sobre algo que no es lo que va a sonar.
    const rampas = motor.mezclador.entradaAmbiente.gain.rampas.filter((r) => r.tipo === 'lineal')
    expect(rampas.at(-1).valor).toBeCloseTo(0.35, 10)
    expect(ctx.registro.asignacionesDirectas).toEqual([])
  })
})

describe('un id que ya no existe no rompe nada (criterio 18 parcial, RN-RE-FAV-12)', () => {
  it('cae en silencio en vez de fallar', () => {
    const { motor } = montar()
    motor.cambiarSonido('bosque')
    expect(motor.sonidoActual()).toBe(ID_SILENCIO)
    expect(motor.fuentesVivas()).toBe(0)
  })
})

describe('el estado de la sesión llega al mezclador', () => {
  it('pausar agacha el ambiente y calla la guía', () => {
    const { ctx, motor } = montar()
    motor.cambiarSonido('lluvia')
    motor.aplicarEstado({
      estadoSesion: 'pausado',
      volumenAmbiente: 0.6,
      volumenGuia: 0.5,
      guiaActiva: true,
    })

    const ambiente = motor.mezclador.entradaAmbiente.gain.rampas.at(-1)
    const guia = motor.mezclador.entradaGuia.gain.rampas.at(-1)
    expect(ambiente.valor).toBeCloseTo(0.18, 6)
    expect(guia.valor).toBeCloseTo(0.0001, 6)
    expect(ctx.registro.asignacionesDirectas).toEqual([])
  })

  it('el volumen que se ajusta se recuerda para el siguiente estado', () => {
    const { motor } = montar()
    expect(motor.ajustarVolumen(0.4)).toBeCloseTo(0.4, 10)
    motor.aplicarEstado({ estadoSesion: 'pausado', volumenGuia: 0.5, guiaActiva: false })
    expect(motor.mezclador.entradaAmbiente.gain.rampas.at(-1).valor).toBeCloseTo(0.12, 6)
  })
})
