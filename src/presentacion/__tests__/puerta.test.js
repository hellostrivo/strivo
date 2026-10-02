// src/presentacion/__tests__/puerta.test.js
// La puerta se relee cuando termina una restauración (SPEC_19.1 §4.3;
// criterio 10). La regla es `aplicarLecturaDePuerta`; de `Entrada` se
// comprueba la fuente, porque no hay DOM en el que montarla.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { aplicarLecturaDePuerta } from '../entrada.js'

const base = { presentacionResuelta: false }

describe('criterio 10: la relectura por el sello solo saca del onboarding', () => {
  it('dentro del onboarding y la puerta ya no está pendiente: sale', () => {
    expect(
      aplicarLecturaDePuerta({
        ...base,
        porSello: true,
        enOnboarding: true,
        onboarding: false,
        presentacion: false,
      }),
    ).toEqual({ pendiente: false, presentando: false })
  })

  it('y qué viene después lo decide presentacionPendiente (D7)', () => {
    expect(
      aplicarLecturaDePuerta({
        ...base,
        porSello: true,
        enOnboarding: true,
        onboarding: false,
        presentacion: true,
      }),
    ).toEqual({ pendiente: false, presentando: true })
  })

  it('dentro del onboarding y sigue pendiente: nada cambia', () => {
    expect(
      aplicarLecturaDePuerta({
        ...base,
        porSello: true,
        enOnboarding: true,
        onboarding: true,
        presentacion: false,
      }),
    ).toBeNull()
  })

  it('fuera del onboarding: nada visible cambia, diga lo que diga la lectura', () => {
    ;[true, false].forEach((onboarding) =>
      expect(
        aplicarLecturaDePuerta({
          ...base,
          porSello: true,
          enOnboarding: false,
          onboarding,
          presentacion: true,
        }),
      ).toBeNull(),
    )
  })

  it('una presentación ya cerrada en esta sesión no se reabre', () => {
    expect(
      aplicarLecturaDePuerta({
        porSello: true,
        enOnboarding: true,
        onboarding: false,
        presentacion: true,
        presentacionResuelta: true,
      }),
    ).toEqual({ pendiente: false })
  })
})

describe('la lectura del arranque o de un uid nuevo se aplica entera, como siempre', () => {
  it('onboarding pendiente: al onboarding, sin presentación', () => {
    expect(
      aplicarLecturaDePuerta({ ...base, porSello: false, onboarding: true, presentacion: true }),
    ).toEqual({ pendiente: true, presentando: false })
  })

  it('onboarding hecho y presentación pendiente: la presentación', () => {
    expect(
      aplicarLecturaDePuerta({ ...base, porSello: false, onboarding: false, presentacion: true }),
    ).toEqual({ pendiente: false, presentando: true })
  })
})

describe('Entrada usa la regla y relee con el sello', () => {
  const app = readFileSync('src/App.jsx', 'utf8')

  it('el efecto de la puerta depende del uid y del sello', () => {
    expect(app).toMatch(/\}, \[uid, selloRestauracion\]\)/)
    expect(app).toMatch(/useSesion\(\)/)
  })

  it('decide con aplicarLecturaDePuerta y no con una copia', () => {
    expect(app).toMatch(/aplicarLecturaDePuerta\(\{/)
  })

  it('presentacionResuelta sigue protegiendo la presentación ya vista', () => {
    expect(app).toMatch(/presentacionResuelta: presentacionResuelta\.current/)
  })
})
