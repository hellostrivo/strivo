// src/lumia/__tests__/filas.test.js
// Filas dinámicas (§5.3, Bloque 2 · criterios de aceptación 1 y 2).

import { describe, expect, it } from 'vitest'

import {
  LIMITES,
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

describe('filas dinámicas', () => {
  it('abre con exactamente tres filas de agradecimiento vacías', () => {
    const filas = filasIniciales([], LIMITES.gratitud)
    expect(filas).toHaveLength(3)
    expect(textos(filas)).toEqual(['', '', ''])
  })

  it('al escribir en la última fila aparece exactamente una nueva', () => {
    const filas = escribirEn(filasIniciales([], LIMITES.gratitud), 2, 'el café', LIMITES.gratitud)
    expect(filas).toHaveLength(4)
    expect(textos(filas)).toEqual(['', '', 'el café', ''])
  })

  it('escribir en una fila que no es la última no crea ninguna', () => {
    const filas = escribirEn(filasIniciales([], LIMITES.gratitud), 0, 'mi madre', LIMITES.gratitud)
    expect(filas).toHaveLength(3)
  })

  it('nunca deja dos filas vacías seguidas al final', () => {
    let filas = filasIniciales([], LIMITES.gratitud)
    filas = escribirEn(filas, 2, 'a', LIMITES.gratitud)
    filas = escribirEn(filas, 3, 'b', LIMITES.gratitud)
    expect(textos(filas).filter((texto) => texto === '')).toHaveLength(3) // las dos primeras y la última
    expect(textos(filas)[filas.length - 1]).toBe('')
  })

  it('una fila creada sobre la marcha desaparece al vaciarla y salir', () => {
    let filas = filasIniciales([], LIMITES.gratitud)
    filas = escribirEn(filas, 2, 'algo', LIMITES.gratitud) // nace la cuarta
    filas = escribirEn(filas, 3, 'otra cosa', LIMITES.gratitud) // nace la quinta
    filas = escribirEn(filas, 3, '', LIMITES.gratitud)
    filas = alSalirDeFila(filas, 3, LIMITES.gratitud)
    expect(filas).toHaveLength(4)
  })

  it('las tres primeras filas nunca desaparecen', () => {
    let filas = filasIniciales(desdeTextos(['uno', 'dos', 'tres']), LIMITES.gratitud)
    filas = escribirEn(filas, 1, '', LIMITES.gratitud)
    filas = alSalirDeFila(filas, 1, LIMITES.gratitud)
    expect(filas.length).toBeGreaterThanOrEqual(3)
    expect(textos(filas)[0]).toBe('uno')
  })

  it('quitar nunca deja menos de tres filas: en el mínimo, vacía', () => {
    const enElMinimo = filasIniciales(desdeTextos(['uno', 'dos']), LIMITES.gratitud)
    expect(enElMinimo).toHaveLength(3)

    const vaciada = quitarFila(enElMinimo, 0, LIMITES.gratitud)
    expect(vaciada).toHaveLength(3)
    expect(textos(vaciada)).toEqual(['', 'dos', ''])
  })

  it('quitar por encima del mínimo sí borra la fila', () => {
    const cuatro = filasIniciales(desdeTextos(['uno', 'dos', 'tres']), LIMITES.gratitud)
    expect(cuatro).toHaveLength(4)
    expect(textos(quitarFila(cuatro, 0, LIMITES.gratitud))).toEqual(['dos', 'tres', ''])
  })

  it('deja de crecer al llegar al tope', () => {
    let filas = filasIniciales(
      desdeTextos(Array.from({ length: 10 }, (_, i) => `cosa ${i}`)),
      LIMITES.gratitud,
    )
    expect(topeAlcanzado(filas, LIMITES.gratitud)).toBe(true)
    filas = escribirEn(filas, 9, 'cosa 9 editada', LIMITES.gratitud)
    expect(filas).toHaveLength(10)
  })

  it('solo pide confirmación si hay texto de sobra', () => {
    expect(pideConfirmacion('gracias')).toBe(false)
    expect(pideConfirmacion('x'.repeat(41))).toBe(true)
  })

  it('guarda el texto limpio y sin filas vacías', () => {
    const filas = filasIniciales(desdeTextos(['  uno  ', '', 'dos']), LIMITES.gratitud)
    expect(textosDe(filas)).toEqual(['uno', 'dos'])
  })

  it('los agradecimientos nacen sin id', () => {
    // `desdeRegistros` y `conIdsDe` se fueron el 23 ago con las victorias, que
    // eran las únicas filas con registro propio. Lo que queda es texto suelto.
    expect(desdeTextos(['gracias'])).toEqual([{ id: null, texto: 'gracias' }])
  })
})
