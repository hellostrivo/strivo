// src/onboarding/__tests__/horarios.test.js
// P5 — las dos horas, y lo que pasa con lo que no es una hora.
//
// Aquí se corrige lo que llega, al revés que en `lib/db/`: el valor lo escribe
// una persona moviendo un control. Lo que no es una hora no se guarda, y no
// guardar no es fallar.

import { describe, expect, it } from 'vitest'

import { DESPERTAR_SUGERIDO, DORMIR_SUGERIDO, esHora, normalizarHora } from '../horarios.js'

describe('normalizar una hora', () => {
  it('deja en "HH:MM" lo que ya lo es', () => {
    expect(normalizarHora('07:00')).toBe('07:00')
    expect(normalizarHora('23:45')).toBe('23:45')
    expect(normalizarHora('00:00')).toBe('00:00')
  })

  it('rellena la hora de un dígito', () => {
    expect(normalizarHora('7:05')).toBe('07:05')
  })

  it('lo que no es una hora se queda en nada, sin lanzar', () => {
    ;['', '  ', null, undefined, 'mañana', '25:00', '12:61', '1200'].forEach((valor) =>
      expect(normalizarHora(valor)).toBeNull(),
    )
  })

  it('`esHora` responde lo mismo, en una palabra', () => {
    expect(esHora('06:30')).toBe(true)
    expect(esHora('99:99')).toBe(false)
  })
})

describe('lo que proponen los campos', () => {
  it('llegan con una hora puesta y no en blanco', () => {
    // Un campo de hora vacío es una casilla por rellenar, y en este recorrido
    // no hay ninguna: dejar la propuesta también es contestar.
    expect(esHora(DESPERTAR_SUGERIDO)).toBe(true)
    expect(esHora(DORMIR_SUGERIDO)).toBe(true)
  })
})
