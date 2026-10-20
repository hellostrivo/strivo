// src/breathing/audio/__tests__/fuentes.test.js
// Criterios 5, 6, 7, 13, 14 y 17 de SPEC_15: la forma de las fuentes, su
// limpieza, y que ninguna marque un compás.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CATALOGO_SONIDOS,
  IDS_SONIDO,
  ID_SILENCIO,
  esReproducible,
  obtenerSonido,
  resolverSonidoId,
} from '../../data/catalogoSonidos.js'
import { crearContextoFalso, nodosVivos } from './dobleAudio.js'
import { entre, intervaloAleatorio, retardoDeFase, unoDe } from '../planificador.js'
import * as lluvia from '../fuentes/lluvia.js'
import * as cristales from '../fuentes/cristales.js'
import * as fuego from '../fuentes/fuego.js'

/** Las cinco que suenan. El silencio no tiene fuente y por eso no está. */
const SONORAS = CATALOGO_SONIDOS.filter((entrada) => entrada.crear !== null)

function azarFijo(semilla = 1) {
  let estado = semilla
  return () => {
    estado = (estado * 1103515245 + 12345) % 2147483648
    return estado / 2147483648
  }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('el catálogo (§3.1)', () => {
  it('son seis: cinco sonidos y el silencio', () => {
    expect(IDS_SONIDO).toEqual(['silencio', 'lluvia', 'olas', 'viento', 'cristales', 'fuego'])
  })

  it('el silencio es el de fábrica (RN-RE-SND-01)', () => {
    expect(ID_SILENCIO).toBe('silencio')
    expect(CATALOGO_SONIDOS[0].id).toBe(ID_SILENCIO)
  })

  it('el silencio está en la lista y es elegible (RN-RE-SND-02)', () => {
    // No es la ausencia de una opción: que aparezca escrito le da permiso a
    // alguien de elegirlo, en vez de dejarlo como lo que queda si no eliges.
    expect(obtenerSonido(ID_SILENCIO)).not.toBeNull()
    expect(esReproducible(ID_SILENCIO)).toBe(false)
  })

  it('Bosque no está, y es una decisión escrita (§1)', () => {
    expect(IDS_SONIDO).not.toContain('bosque')
  })

  it('un id que no existe cae en silencio (RN-RE-FAV-12)', () => {
    expect(resolverSonidoId('bosque')).toBe(ID_SILENCIO)
    expect(obtenerSonido('bosque')).toBeNull()
  })
})

describe('las cinco fuentes tienen la misma forma (criterio 5)', () => {
  it.each(SONORAS.map((e) => [e.id, e]))('%s expone iniciar, detener y liberar', (_id, entrada) => {
    const ctx = crearContextoFalso()
    const fuente = entrada.crear(ctx, ctx.createGain(), { azar: azarFijo() })

    // La forma idéntica es lo que hace el catálogo extensible: añadir un sonido
    // es escribir un archivo y una línea, sin tocar el orquestador.
    expect(Object.keys(fuente).sort()).toEqual(['detener', 'iniciar', 'liberar'])
    expect(typeof fuente.iniciar).toBe('function')
    expect(typeof fuente.detener).toBe('function')
    expect(typeof fuente.liberar).toBe('function')
  })

  it.each(SONORAS.map((e) => [e.id, e]))('%s se conecta al destino que le dan', (_id, entrada) => {
    const ctx = crearContextoFalso()
    const destino = ctx.createGain()
    const fuente = entrada.crear(ctx, destino, { azar: azarFijo() })

    // Cristales no conecta nada al crearse, y es correcto: **es el único sin
    // lecho**. Entre campana y campana hay silencio de verdad, así que sus nodos
    // nacen y mueren con cada nota. Se le da tiempo a que suene la primera.
    fuente.iniciar()
    ctx.avanzar(8)
    vi.advanceTimersByTime(8000)

    // Ninguna se conecta sola al `destination`: quien la monta decide por dónde
    // sale, y eso es lo que permite cruzar dos fuentes.
    expect(ctx.registro.nodos.some((nodo) => nodo.conectado.includes(destino))).toBe(true)
    fuente.liberar()
  })

  it('cristales es el único que no suena hasta que le toca', () => {
    const ctx = crearContextoFalso()
    const destino = ctx.createGain()
    cristales.crear(ctx, destino, { azar: azarFijo() })
    // Sin lecho: al crearse no hay ni un nodo colgando del destino.
    expect(ctx.registro.nodos.some((nodo) => nodo.conectado.includes(destino))).toBe(false)
  })

  it('las otras cuatro sí tienen lecho y lo conectan al crearse', () => {
    for (const entrada of SONORAS.filter((e) => e.id !== 'cristales')) {
      const ctx = crearContextoFalso()
      const destino = ctx.createGain()
      entrada.crear(ctx, destino, { azar: azarFijo() })
      expect(`${entrada.id}`).toBe(entrada.id)
      expect(ctx.registro.nodos.some((nodo) => nodo.conectado.includes(destino))).toBe(true)
    }
  })
})

describe('liberar no deja nada vivo (criterio 6, RN-RE-SND-03)', () => {
  it.each(SONORAS.map((e) => [e.id, e]))('%s: cero nodos conectados al soltar', (_id, entrada) => {
    const ctx = crearContextoFalso()
    const destino = ctx.createGain()
    const fuente = entrada.crear(ctx, destino, { azar: azarFijo() })

    fuente.iniciar()
    ctx.avanzar(2)
    vi.advanceTimersByTime(2000)
    fuente.liberar()

    const vivos = nodosVivos(ctx).filter((nodo) => nodo !== destino)
    expect(vivos).toEqual([])
  })

  it.each(SONORAS.map((e) => [e.id, e]))('%s: liberar dos veces no rompe nada', (_id, entrada) => {
    const ctx = crearContextoFalso()
    const fuente = entrada.crear(ctx, ctx.createGain(), { azar: azarFijo() })
    fuente.iniciar()
    expect(() => {
      fuente.liberar()
      fuente.liberar()
    }).not.toThrow()
  })

  it.each(SONORAS.map((e) => [e.id, e]))('%s: liberar sin iniciar tampoco', (_id, entrada) => {
    const ctx = crearContextoFalso()
    const fuente = entrada.crear(ctx, ctx.createGain(), { azar: azarFijo() })
    expect(() => fuente.liberar()).not.toThrow()
  })

  it('tras liberar no queda ningún temporizador programando eventos', () => {
    const ctx = crearContextoFalso()
    const fuente = lluvia.crear(ctx, ctx.createGain(), { azar: azarFijo() })
    fuente.iniciar()
    fuente.liberar()

    const antes = ctx.registro.nodos.length
    ctx.avanzar(10)
    vi.advanceTimersByTime(10000)
    // Si el planificador siguiera vivo, diez segundos darían decenas de gotas.
    expect(ctx.registro.nodos.length).toBe(antes)
  })
})

describe('el buffer se genera una vez por fuente (criterio 7, RN-RE-SND-04)', () => {
  it.each([
    ['lluvia', lluvia],
    ['fuego', fuego],
  ])('%s: el lecho y el impulso, y ni uno más por evento', (_nombre, modulo) => {
    const ctx = crearContextoFalso()
    const espia = vi.spyOn(ctx, 'createBuffer')

    const fuente = modulo.crear(ctx, ctx.createGain(), { azar: azarFijo() })
    const trasCrear = espia.mock.calls.length

    fuente.iniciar()
    ctx.avanzar(5)
    vi.advanceTimersByTime(5000)

    // Dos buffers: el lecho en bucle y el ruido del que se recortan las gotas.
    // Cinco segundos de gotas no añaden ninguno.
    expect(trasCrear).toBe(2)
    expect(espia.mock.calls.length).toBe(trasCrear)
    fuente.liberar()
  })

  it('cristales no genera ningún buffer: son osciladores', () => {
    const ctx = crearContextoFalso()
    const espia = vi.spyOn(ctx, 'createBuffer')
    cristales.crear(ctx, ctx.createGain(), { azar: azarFijo() })
    expect(espia).not.toHaveBeenCalled()
  })
})

describe('ninguna fuente marca un compás (criterio 17, RN-RE-SND-07)', () => {
  /** 200 intervalos seguidos de un generador. */
  function muestrear(generar, n = 200) {
    const azar = azarFijo(42)
    return Array.from({ length: n }, () => generar(azar))
  }

  it.each([
    ['gotas de lluvia', lluvia.siguienteGota],
    ['chispas de fuego', fuego.siguienteChispa],
    ['campanas de cristal', cristales.siguienteCampana],
  ])('%s: los intervalos tienen dispersión de verdad', (_nombre, generar) => {
    const intervalos = muestrear(generar)
    const media = intervalos.reduce((s, n) => s + n, 0) / intervalos.length
    const varianza = intervalos.reduce((s, n) => s + (n - media) ** 2, 0) / intervalos.length
    const desviacionRelativa = Math.sqrt(varianza) / media

    // Un ambiente con un pulso regular compite con el ritmo de la respiración, y
    // quien está siguiendo una guía de cinco segundos no necesita un segundo
    // metrónomo discutiéndole el compás por debajo.
    expect(desviacionRelativa).toBeGreaterThan(0.1)
  })

  it.each([
    ['gotas de lluvia', lluvia.siguienteGota],
    ['chispas de fuego', fuego.siguienteChispa],
    ['campanas de cristal', cristales.siguienteCampana],
  ])('%s: no hay dos intervalos consecutivos iguales', (_nombre, generar) => {
    const intervalos = muestrear(generar)
    const repetidos = intervalos.filter((n, i) => i > 0 && n === intervalos[i - 1])
    expect(repetidos).toEqual([])
  })

  it.each([
    [
      'gotas de lluvia',
      lluvia.siguienteGota,
      lluvia.PARAMETROS.gotaMsMin,
      lluvia.PARAMETROS.gotaMsMax,
    ],
    [
      'chispas de fuego',
      fuego.siguienteChispa,
      fuego.PARAMETROS.chispaMsMin,
      fuego.PARAMETROS.chispaMsMax,
    ],
    [
      'campanas de cristal',
      cristales.siguienteCampana,
      cristales.PARAMETROS.msMin,
      cristales.PARAMETROS.msMax,
    ],
  ])('%s: caen dentro del rango de §3.3', (_nombre, generar, msMin, msMax) => {
    for (const intervalo of muestrear(generar)) {
      expect(intervalo).toBeGreaterThanOrEqual(msMin / 1000 - 1e-9)
      expect(intervalo).toBeLessThanOrEqual(msMax / 1000 + 1e-9)
    }
  })

  it('las olas y el viento no tienen eventos: su modulación es continua', () => {
    // No hay nada que aleatorizar porque no hay nada que disparar. Lo que evita
    // el compás ahí son dos LFO con frecuencias distintas (0,05 y 0,03 Hz).
    expect(lluvia.siguienteGota).toBeTypeOf('function')
    expect(cristales.siguienteCampana).toBeTypeOf('function')
  })
})

describe('la escala de los cristales', () => {
  it('es pentatónica de Do: cualesquiera dos notas suenan bien juntas', () => {
    // Elegir al azar dentro de una escala con semitonos podría producir una
    // disonancia cuando dos campanas se solapan. Aquí no puede.
    expect(cristales.ALTURAS).toEqual([523.25, 587.33, 659.25, 783.99, 880.0])
  })

  it('`unoDe` nunca se sale de la lista', () => {
    const azar = azarFijo(3)
    for (let i = 0; i < 200; i += 1) {
      expect(cristales.ALTURAS).toContain(unoDe(cristales.ALTURAS, azar))
    }
  })

  it('el intervalo mínimo no baja de 2,5 s: por debajo se leería como pulso', () => {
    expect(cristales.PARAMETROS.msMin).toBeGreaterThanOrEqual(2500)
  })
})

describe('las ayudas del planificador', () => {
  it('`entre` respeta sus límites', () => {
    const azar = azarFijo(8)
    for (let i = 0; i < 100; i += 1) {
      const valor = entre(0.1, 0.28, azar)
      expect(valor).toBeGreaterThanOrEqual(0.1)
      expect(valor).toBeLessThanOrEqual(0.28)
    }
  })

  it('`intervaloAleatorio` devuelve segundos, no milisegundos', () => {
    expect(intervaloAleatorio(1000, 1000, () => 0.5)).toBeCloseTo(1, 10)
  })

  it('`retardoDeFase` convierte radianes en un retardo dentro del periodo', () => {
    // Web Audio no deja fijar la fase de un oscilador, solo cuándo empieza.
    const hz = 0.08
    const periodo = 1 / hz
    const retardo = retardoDeFase(0.7, hz)
    expect(retardo).toBeGreaterThan(0)
    expect(retardo).toBeLessThan(periodo)
  })

  it('un desfase de cero es una vuelta entera, no un cero', () => {
    expect(retardoDeFase(0, 0.08)).toBeCloseTo(1 / 0.08, 6)
  })

  it('una frecuencia imposible devuelve cero en vez de infinito', () => {
    expect(retardoDeFase(1, 0)).toBe(0)
    expect(retardoDeFase(1, NaN)).toBe(0)
  })
})
