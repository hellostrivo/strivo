// src/lib/__tests__/biometria.test.js
// SPEC_23A — El puente con Face ID: cómo se leen las respuestas del plugin.
//
// Los códigos son los que da el Swift de `@capgo/capacitor-native-biometric`
// 8.9.3, leído el 12 nov 2026 (SPEC_23 §9).

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { aTiempo } from './dobleDeCapacitor.js'
import { caraDeMentira } from './caraDeMentira.js'
import { AL_LEER, NOMBRE_DE_LA_CLAVE, SIN_BIOMETRIA, crearPuente } from '../biometria.js'

function puenteCon(telefono = caraDeMentira()) {
  return { telefono, puente: crearPuente({ cargar: async () => ({ plugin: telefono.plugin }) }) }
}

describe('el plugin nunca sale suelto de una promesa (SPEC_21.2)', () => {
  it('cada llamada contesta, con el plugin como Proxy de Capacitor', async () => {
    const { puente } = puenteCon()
    await aTiempo(puente.disponibilidad())
    await aTiempo(puente.guardar('abc'))
    await aTiempo(puente.leer('motivo'))
    await aTiempo(puente.existe())
    await aTiempo(puente.borrar())
  })
})

describe('disponibilidad', () => {
  it('Face ID y Touch ID, por el número que da el teléfono', async () => {
    const { telefono, puente } = puenteCon()
    expect(await puente.disponibilidad()).toEqual({
      disponible: true,
      tipo: 'faceId',
      motivo: null,
    })
    telefono.estado.disponible = { isAvailable: true, biometryType: 1 }
    expect((await puente.disponibilidad()).tipo).toBe('touchId')
  })

  it('los motivos de no tenerla', async () => {
    const { telefono, puente } = puenteCon()
    for (const [errorCode, motivo] of [
      [1, SIN_BIOMETRIA.negado],
      [2, SIN_BIOMETRIA.bloqueo],
      [3, SIN_BIOMETRIA.sinCaras],
      [14, SIN_BIOMETRIA.sinCodigo],
      [99, SIN_BIOMETRIA.otro],
    ]) {
      telefono.estado.disponible = { isAvailable: false, biometryType: 2, errorCode }
      expect((await puente.disponibilidad()).motivo).toBe(motivo)
    }
  })

  it('no pide la biometría del código: useFallback en false', async () => {
    const { telefono, puente } = puenteCon()
    await puente.disponibilidad()
    expect(telefono.estado.llamadas[0]).toEqual(['isAvailable', { useFallback: false }])
  })
})

describe('leer la clave', () => {
  it('los cuatro desenlaces', async () => {
    const { telefono, puente } = puenteCon()
    await puente.guardar('clave')
    expect(await puente.leer('m')).toEqual({ ok: true, clave: 'clave' })
    for (const [codigo, motivo] of [
      ['16', AL_LEER.cancelado],
      ['21', AL_LEER.noEsta],
      ['10', AL_LEER.fallo],
      ['0', AL_LEER.otro],
    ]) {
      telefono.estado.cara = codigo
      expect(await puente.leer('m')).toEqual({ ok: false, motivo })
    }
  })

  it('sin clave guardada: no está', async () => {
    const { puente } = puenteCon()
    expect(await puente.leer('m')).toEqual({ ok: false, motivo: AL_LEER.noEsta })
  })
})

describe('guardar, existe y borrar', () => {
  it('guardan y borran bajo un nombre fijo, sin pedir la cara', async () => {
    const { telefono, puente } = puenteCon()
    expect(await puente.guardar('x')).toBe(true)
    expect(await puente.existe()).toBe(true)
    expect(await puente.borrar()).toBe(true)
    expect(await puente.existe()).toBe(false)
    expect(telefono.estado.lecturas).toBe(0)
    expect(
      telefono.estado.llamadas.every(([, op]) => !op?.key || op.key === NOMBRE_DE_LA_CLAVE),
    ).toBe(true)
  })
})

describe('un plugin que falla no rompe nada: nunca lanza', () => {
  it('cada respuesta es la prudente', async () => {
    const roto = crearPuente({
      cargar: async () => {
        throw new Error('sin plugin')
      },
    })
    expect(await roto.disponibilidad()).toEqual({
      disponible: false,
      tipo: null,
      motivo: SIN_BIOMETRIA.otro,
    })
    expect(await roto.guardar('x')).toBe(false)
    expect(await roto.leer('m')).toEqual({ ok: false, motivo: AL_LEER.otro })
    expect(await roto.borrar()).toBe(false)
    // Si no se puede saber si hay clave, no se borra nada.
    expect(await roto.existe()).toBeNull()
  })
})

describe('el puente no sabe nada del PIN', () => {
  it('no nombra el PIN ni la capa de datos', () => {
    const codigo = readFileSync('src/lib/biometria.js', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(codigo).not.toMatch(/\bpin\b/i)
    expect(codigo).not.toMatch(/lib\/db|diario/)
  })
})
