// src/breathing/hooks/__tests__/wakeLock.test.js
// Criterios 25 y 26 de SPEC_16 (RN-RE-NAV-28, caso 8.12).

import { afterEach, describe, expect, it } from 'vitest'

import { pidePantallaEncendida, soportaWakeLock } from '../useWakeLock.js'

afterEach(() => {
  delete globalThis.navigator
})

describe('cuándo se mantiene la pantalla encendida (criterio 25)', () => {
  it('en activo y en cerrando, sí', () => {
    expect(pidePantallaEncendida('activo')).toBe(true)
    // `cerrando` es la última respiración y sigue siendo respirar: apagar la
    // pantalla ahí sería cortar el ejercicio en su último tramo.
    expect(pidePantallaEncendida('cerrando')).toBe(true)
  })

  it('al pausar se suelta', () => {
    // Un bloqueo que sobrevive a la sesión se come la batería de alguien sin
    // que sirva para nada.
    expect(pidePantallaEncendida('pausado')).toBe(false)
  })

  it('en inactivo, acomodando y completado tampoco', () => {
    expect(pidePantallaEncendida('inactivo')).toBe(false)
    expect(pidePantallaEncendida('acomodando')).toBe(false)
    expect(pidePantallaEncendida('completado')).toBe(false)
  })

  it('la preferencia manda por encima del estado', () => {
    expect(pidePantallaEncendida('activo', false)).toBe(false)
  })

  it('un estado que no existe no lo activa', () => {
    expect(pidePantallaEncendida('flotando')).toBe(false)
    expect(pidePantallaEncendida(null)).toBe(false)
  })
})

describe('sin la API no pasa nada (criterio 26, caso 8.12)', () => {
  it('se detecta antes de pedirla', () => {
    globalThis.navigator = {}
    expect(soportaWakeLock()).toBe(false)
    globalThis.navigator = { wakeLock: {} }
    expect(soportaWakeLock()).toBe(true)
  })

  it('sin `navigator` en absoluto devuelve que no', () => {
    delete globalThis.navigator
    expect(soportaWakeLock()).toBe(false)
  })

  it('no hay copy de error para esto, y es a propósito', async () => {
    // Decírselo a quien está a punto de respirar sería convertir una limitación
    // del teléfono en un problema suyo. La pantalla se apagará y el audio
    // seguirá sonando (RN-RE-SND-23), que es una degradación aceptable.
    const { copy } = await import('@copy')
    const textos = JSON.stringify(copy.respiracion)
    expect(textos).not.toMatch(/wake ?lock/i)
    expect(textos).not.toMatch(/pantalla se apag/i)
  })
})
