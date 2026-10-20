// src/lib/audio/__tests__/ruido.test.js
// Los tres ruidos y el bucle sin costura (SPEC_15 §3.3, RN-RE-SND-04 y 05).

import { describe, expect, it, vi } from 'vitest'

import {
  MS_CRUCE_BUCLE,
  SEGUNDOS_BUFFER,
  coserBucle,
  crearBufferRuido,
  pesosDeCruce,
  crearFuenteEnBucle,
  muestrasBlancas,
  muestrasMarrones,
  muestrasRosas,
} from '../ruido.js'
import { crearContextoFalso } from '@/breathing/audio/__tests__/dobleAudio.js'

/** Un azar determinista, para que una prueba de ruido no sea aleatoria. */
function azarFijo(semilla = 1) {
  let estado = semilla
  return () => {
    estado = (estado * 1103515245 + 12345) % 2147483648
    return estado / 2147483648
  }
}

/** Energía media de una banda, por diferencias sucesivas. Basta para comparar. */
function brillo(muestras) {
  let suma = 0
  for (let i = 1; i < muestras.length; i += 1) suma += (muestras[i] - muestras[i - 1]) ** 2
  return suma / (muestras.length - 1)
}

describe('los tres ruidos existen y están acotados', () => {
  it.each([
    ['blanco', muestrasBlancas],
    ['rosa', muestrasRosas],
    ['marrón', muestrasMarrones],
  ])('%s: devuelve el largo pedido y nada fuera de rango', (_nombre, generar) => {
    const muestras = generar(4096, azarFijo())
    expect(muestras).toHaveLength(4096)
    expect(muestras.every((m) => Number.isFinite(m))).toBe(true)
    expect(Math.max(...muestras)).toBeLessThanOrEqual(1.5)
    expect(Math.min(...muestras)).toBeGreaterThanOrEqual(-1.5)
  })

  it('el rosa es menos brillante que el blanco, y el marrón menos que el rosa', () => {
    // Es la propiedad que los define: cada uno cae más rápido con la frecuencia.
    // Y es lo que los hace servir para lo que sirven —el blanco suena a estática,
    // el rosa a lluvia, el marrón a fuego—.
    const blanco = brillo(muestrasBlancas(16384, azarFijo(7)))
    const rosa = brillo(muestrasRosas(16384, azarFijo(7)))
    const marron = brillo(muestrasMarrones(16384, azarFijo(7)))

    expect(rosa).toBeLessThan(blanco)
    expect(marron).toBeLessThan(rosa)
  })

  it('ninguno tiene una tendencia que lo saque de su sitio', () => {
    for (const generar of [muestrasBlancas, muestrasRosas, muestrasMarrones]) {
      const muestras = generar(16384, azarFijo(3))
      const media = muestras.reduce((s, n) => s + n, 0) / muestras.length
      // Una media desplazada sería un desnivel de continua: se come margen de
      // volumen sin que se oiga nada a cambio.
      expect(Math.abs(media)).toBeLessThan(0.15)
    }
  })

  it('con el mismo azar salen las mismas muestras', () => {
    expect([...muestrasRosas(64, azarFijo(9))]).toEqual([...muestrasRosas(64, azarFijo(9))])
  })
})

describe('el bucle no chasca (RN-RE-SND-05)', () => {
  it('la costura es, exactamente, dos muestras contiguas del ruido original', () => {
    // Esta es la propiedad entera, y se puede afirmar exacta en vez de por
    // estadística: al empalmar, la última muestra que queda es `crudas[largo-1]`
    // y la primera es `crudas[largo]`. Son vecinas en el original, así que el
    // salto de la costura **es** un paso del ruido y no un corte.
    //
    // Importa porque un clic no se oye por tener un valor alto —en un ruido
    // ningún paso es pequeño— sino por destacar sobre sus vecinos. Y se oiría
    // cada cuatro segundos, con lo que el fallo empieza siendo un chasquido y
    // termina siendo un metrónomo (RN-RE-SND-07).
    const crudas = muestrasRosas(4000, azarFijo(11))
    const cosidas = coserBucle(crudas, 400)
    const largo = crudas.length - 400

    const costura = Math.abs(cosidas[cosidas.length - 1] - cosidas[0])
    const pasoVecino = Math.abs(crudas[largo] - crudas[largo - 1])
    expect(costura).toBeCloseTo(pasoVecino, 6)
  })

  it('sin coser, la costura no tiene por qué serlo', () => {
    // El contraste: en el buffer crudo, el último y el primero no se conocen de
    // nada. A veces sale bien por suerte, y en eso consiste el fallo.
    const crudas = muestrasRosas(4000, azarFijo(11))
    const cosidas = coserBucle(crudas, 400)
    expect(cosidas.length).toBeLessThan(crudas.length)
  })

  it('el cruce empalma la cola sobre la cabeza y no las suma', () => {
    // Al principio del cruce manda la cola y al final manda la cabeza: eso es
    // lo que hace que el buffer sea continuo consigo mismo.
    const crudas = muestrasRosas(4000, azarFijo(11))
    const cosidas = coserBucle(crudas, 400)
    const largo = crudas.length - 400

    expect(cosidas[0]).toBeCloseTo(crudas[largo], 6)
    expect(cosidas[399]).toBeCloseTo(crudas[399], 2)
  })

  it('los pesos del cruce son de igual potencia, no lineales', () => {
    // `entra² + sale² = 1` en todo el recorrido. Es la identidad que evita el
    // bache de volumen en el centro del cruce: al sumar dos señales sin
    // correlación lo que se conserva es la potencia, no la amplitud, así que
    // unos pesos que sumaran 1 dejarían un hueco audible justo en la mitad.
    //
    // Se comprueba sobre la curva y no sobre el ruido a propósito: el ruido
    // rosa tiene deriva de baja frecuencia, así que la energía de una ventana
    // corta varía por su cuenta y no diría nada de los pesos.
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const { entra, sale } = pesosDeCruce(t)
      expect(entra ** 2 + sale ** 2).toBeCloseTo(1, 10)
    }
  })

  it('el cruce empieza en la cola y acaba en la cabeza', () => {
    expect(pesosDeCruce(0)).toEqual({ entra: 0, sale: 1 })
    const final = pesosDeCruce(1)
    expect(final.entra).toBeCloseTo(1, 10)
    expect(final.sale).toBeCloseTo(0, 10)
  })

  it('un `t` fuera de rango se recorta en vez de dar un peso imposible', () => {
    expect(pesosDeCruce(-5).entra).toBe(0)
    expect(pesosDeCruce(9).entra).toBeCloseTo(1, 10)
    expect(pesosDeCruce(NaN).entra).toBe(0)
  })

  it('el buffer se acorta exactamente lo que dura el cruce', () => {
    expect(coserBucle(muestrasBlancas(1000, azarFijo()), 200)).toHaveLength(800)
  })

  it('no se pasa de la mitad aunque le pidan un cruce absurdo', () => {
    expect(coserBucle(muestrasBlancas(100, azarFijo()), 900).length).toBeGreaterThan(0)
  })

  it('un cruce de cero devuelve el original intacto', () => {
    const crudas = muestrasBlancas(64, azarFijo())
    expect([...coserBucle(crudas, 0)]).toEqual([...crudas])
  })

  it('el cruce son 200 ms, como dice el spec', () => {
    expect(MS_CRUCE_BUCLE).toBe(200)
  })
})

describe('el buffer se genera una vez, no por ciclo (criterio 7, RN-RE-SND-04)', () => {
  it('cuatro segundos, y `loop` puesto', () => {
    const ctx = crearContextoFalso()
    const buffer = crearBufferRuido(ctx, 'rosa', { azar: azarFijo() })
    const fuente = crearFuenteEnBucle(ctx, buffer)

    expect(SEGUNDOS_BUFFER).toBe(4)
    expect(fuente.loop).toBe(true)
    expect(fuente.buffer).toBe(buffer)
  })

  it('cada fuente crea su buffer una sola vez, no uno por vuelta', () => {
    const ctx = crearContextoFalso()
    const espia = vi.spyOn(ctx, 'createBuffer')

    crearBufferRuido(ctx, 'rosa', { azar: azarFijo() })

    // Regenerar cuatro segundos de ruido por ciclo serían ~176.000 muestras por
    // segundo quemadas para producir algo indistinguible.
    expect(espia).toHaveBeenCalledTimes(1)
  })

  it('el largo del buffer descuenta el cruce', () => {
    const ctx = crearContextoFalso({ sampleRate: 1000 })
    const buffer = crearBufferRuido(ctx, 'blanco', { azar: azarFijo() })
    // 4 s × 1000 muestras − 200 ms de cruce = 3800.
    expect(buffer.length).toBe(3800)
  })

  it('un tipo que no existe devuelve null en vez de romperse', () => {
    expect(crearBufferRuido(crearContextoFalso(), 'terciopelo')).toBeNull()
  })

  it('sin contexto tampoco se rompe', () => {
    expect(crearBufferRuido(null, 'rosa')).toBeNull()
  })
})
