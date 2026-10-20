// src/diario/__tests__/filas.test.js
// Filas dinámicas (§5.3, Bloque 2 · criterios de aceptación 1 y 2).
//
// `CRECIENTE` era `CRECIENTE`, la gratitud de la noche: tres renglones de
// salida y uno nuevo en cuanto se escribía en el último. Esa lista se retiró el
// 23 ago con la actualización de la noche, y las dos que quedan —gratitud de la
// mañana y reconocimiento— abren con un campo y no crecen solas. La mecánica de
// `crecerSola` sigue en `FilasDinamicas`, así que se sigue probando aquí con un
// límite de prueba en vez de con un preset del producto que ya no existe.

import { describe, expect, it } from 'vitest'

import {
  alSalirDeFila,
  desdeTextos,
  escribirEn,
  filasIniciales,
  pideConfirmacion,
  quitarFila,
  textosDe,
  topeAlcanzado,
} from '../filas.js'

const textos = (filas) => filas.map((fila) => fila.texto)

/** La lista que crece sola. Hoy ninguna del producto tiene esta forma. */
const CRECIENTE = Object.freeze({ min: 3, max: 10, crecerSola: true })

describe('filas dinámicas', () => {
  it('abre con exactamente tres filas de de prueba vacías', () => {
    const filas = filasIniciales([], CRECIENTE)
    expect(filas).toHaveLength(3)
    expect(textos(filas)).toEqual(['', '', ''])
  })

  it('al escribir en la última fila aparece exactamente una nueva', () => {
    const filas = escribirEn(filasIniciales([], CRECIENTE), 2, 'el café', CRECIENTE)
    expect(filas).toHaveLength(4)
    expect(textos(filas)).toEqual(['', '', 'el café', ''])
  })

  it('escribir en una fila que no es la última no crea ninguna', () => {
    const filas = escribirEn(filasIniciales([], CRECIENTE), 0, 'mi madre', CRECIENTE)
    expect(filas).toHaveLength(3)
  })

  it('nunca deja dos filas vacías seguidas al final', () => {
    let filas = filasIniciales([], CRECIENTE)
    filas = escribirEn(filas, 2, 'a', CRECIENTE)
    filas = escribirEn(filas, 3, 'b', CRECIENTE)
    expect(textos(filas).filter((texto) => texto === '')).toHaveLength(3) // las dos primeras y la última
    expect(textos(filas)[filas.length - 1]).toBe('')
  })

  it('una fila creada sobre la marcha desaparece al vaciarla y salir', () => {
    let filas = filasIniciales([], CRECIENTE)
    filas = escribirEn(filas, 2, 'algo', CRECIENTE) // nace la cuarta
    filas = escribirEn(filas, 3, 'otra cosa', CRECIENTE) // nace la quinta
    filas = escribirEn(filas, 3, '', CRECIENTE)
    filas = alSalirDeFila(filas, 3, CRECIENTE)
    expect(filas).toHaveLength(4)
  })

  it('las tres primeras filas nunca desaparecen', () => {
    let filas = filasIniciales(desdeTextos(['uno', 'dos', 'tres']), CRECIENTE)
    filas = escribirEn(filas, 1, '', CRECIENTE)
    filas = alSalirDeFila(filas, 1, CRECIENTE)
    expect(filas.length).toBeGreaterThanOrEqual(3)
    expect(textos(filas)[0]).toBe('uno')
  })

  it('quitar nunca deja menos de tres filas: en el mínimo, vacía', () => {
    const enElMinimo = filasIniciales(desdeTextos(['uno', 'dos']), CRECIENTE)
    expect(enElMinimo).toHaveLength(3)

    const vaciada = quitarFila(enElMinimo, 0, CRECIENTE)
    expect(vaciada).toHaveLength(3)
    expect(textos(vaciada)).toEqual(['', 'dos', ''])
  })

  it('quitar por encima del mínimo sí borra la fila', () => {
    const cuatro = filasIniciales(desdeTextos(['uno', 'dos', 'tres']), CRECIENTE)
    expect(cuatro).toHaveLength(4)
    expect(textos(quitarFila(cuatro, 0, CRECIENTE))).toEqual(['dos', 'tres', ''])
  })

  it('deja de crecer al llegar al tope', () => {
    let filas = filasIniciales(
      desdeTextos(Array.from({ length: 10 }, (_, i) => `cosa ${i}`)),
      CRECIENTE,
    )
    expect(topeAlcanzado(filas, CRECIENTE)).toBe(true)
    filas = escribirEn(filas, 9, 'cosa 9 editada', CRECIENTE)
    expect(filas).toHaveLength(10)
  })

  it('solo pide confirmación si hay texto de sobra', () => {
    expect(pideConfirmacion('gracias')).toBe(false)
    expect(pideConfirmacion('x'.repeat(41))).toBe(true)
  })

  it('guarda el texto limpio y sin filas vacías', () => {
    const filas = filasIniciales(desdeTextos(['  uno  ', '', 'dos']), CRECIENTE)
    expect(textosDe(filas)).toEqual(['uno', 'dos'])
  })

  it('los agradecimientos nacen sin id', () => {
    // `desdeRegistros` y `conIdsDe` se fueron el 23 ago con las victorias, que
    // eran las únicas filas con registro propio. Lo que queda es texto suelto.
    expect(desdeTextos(['gracias'])).toEqual([{ id: null, texto: 'gracias' }])
  })
})
