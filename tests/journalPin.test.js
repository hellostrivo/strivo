// tests/journalPin.test.js
// El PIN del Journal (bloque 07): lo que se guarda, lo que no, y qué pasa con
// las entradas cuando se quita.

import { describe, it, expect, beforeEach } from 'vitest'
import {
  PIN_MIN,
  PIN_MAX,
  soloDigitos,
  pinCompleto,
  hayPin,
  hayPinConocido,
  estaDesbloqueado,
  estadoDeAcceso,
  guardarPin,
  verificarPin,
  desbloquearCon,
  cambiarPin,
  quitarPin,
  restablecerPin,
  olvidarEnMemoria,
} from '@lib/journalPin'
import { entradaNueva, guardarEntrada, loadEntradas } from '@lib/journal'
import { getFlag } from '@lib/db'
import { filasDe } from './helpers/db.js'

const CLAVE = 'journal.pin'

beforeEach(() => olvidarEnMemoria())

describe('el campo', () => {
  it('se queda solo con los dígitos, se teclee o se pegue', () => {
    expect(soloDigitos('12 34')).toBe('1234')
    expect(soloDigitos('a1b2c3d4')).toBe('1234')
    expect(soloDigitos('1-2-3-4')).toBe('1234')
  })

  it('no pasa de seis dígitos', () => {
    expect(soloDigitos('123456789')).toBe('123456')
    expect(soloDigitos('123456789').length).toBe(PIN_MAX)
  })

  it('acepta cualquier longitud entre 4 y 6', () => {
    expect(pinCompleto('123')).toBe(false)
    expect(pinCompleto('1234')).toBe(true)
    expect(pinCompleto('12345')).toBe(true)
    expect(pinCompleto('123456')).toBe(true)
    expect(PIN_MIN).toBe(4)
  })

  it('no rechaza un PIN por ser una secuencia: la app no regaña', () => {
    expect(pinCompleto('1234')).toBe(true)
    expect(pinCompleto('0000')).toBe(true)
  })
})

describe('lo que se guarda', () => {
  it('nunca guarda el PIN en claro, ni entero ni por partes', async () => {
    await guardarPin('4821')

    const fila = await getFlag(CLAVE)
    const serializado = JSON.stringify(fila)

    expect(serializado).not.toContain('4821')
    expect(fila.pin).toBeUndefined()
    // Ni el hash ni la sal pueden coincidir con lo tecleado
    expect(fila.hash).not.toBe('4821')
    expect(fila.salt).not.toBe('4821')
  })

  it('guarda sal, huella, iteraciones y algoritmo', async () => {
    await guardarPin('4821')
    const fila = await getFlag(CLAVE)

    expect(fila.algorithm).toBe('PBKDF2-SHA-256')
    expect(fila.iterations).toBeGreaterThanOrEqual(150_000)
    // 16 bytes de sal y 32 de huella, en base64
    expect(atob(fila.salt).length).toBe(16)
    expect(atob(fila.hash).length).toBe(32)
  })

  it('dos veces el mismo PIN dejan huellas distintas: la sal es nueva cada vez', async () => {
    await guardarPin('4821')
    const primera = await getFlag(CLAVE)

    olvidarEnMemoria()
    await guardarPin('4821')
    const segunda = await getFlag(CLAVE)

    expect(segunda.salt).not.toBe(primera.salt)
    expect(segunda.hash).not.toBe(primera.hash)
  })

  it('vive en appFlags, que no se sincroniza', async () => {
    await guardarPin('4821')

    const banderas = await filasDe('appFlags')
    expect(banderas.map(f => f.key)).toContain(CLAVE)

    const cola = await filasDe('syncQueue')
    expect(cola.some(item => JSON.stringify(item).includes(CLAVE))).toBe(false)
  })
})

describe('entrar', () => {
  it('el PIN correcto abre y el incorrecto no', async () => {
    await guardarPin('4821')

    expect(await verificarPin('4821')).toBe(true)
    expect(await verificarPin('4822')).toBe(false)
    expect(await verificarPin('482')).toBe(false)
    expect(await verificarPin('48210')).toBe(false)
    expect(await verificarPin('')).toBe(false)
  })

  it('fallar no bloquea nada: se puede intentar otra vez y acertar', async () => {
    await guardarPin('4821')
    olvidarEnMemoria()

    expect(await desbloquearCon('0000')).toBe(false)
    expect(await desbloquearCon('1111')).toBe(false)
    expect(await desbloquearCon('2222')).toBe(false)
    expect(await desbloquearCon('4821')).toBe(true)
  })

  it('el desbloqueo dura la sesión y se pierde al recargar', async () => {
    await guardarPin('4821')
    olvidarEnMemoria()   // como recargar la app

    expect(estaDesbloqueado()).toBe(false)
    expect(await estadoDeAcceso()).toBe('bloqueado')

    await desbloquearCon('4821')
    expect(estaDesbloqueado()).toBe(true)
    expect(await estadoDeAcceso()).toBe('abierto')

    olvidarEnMemoria()   // otra recarga
    expect(await estadoDeAcceso()).toBe('bloqueado')
  })

  it('sin PIN el journal se abre directamente', async () => {
    expect(await hayPin()).toBe(false)
    expect(await estadoDeAcceso()).toBe('abierto')
  })

  it('antes de leer el almacén no se sabe si hay PIN, y eso se distingue de "no hay"', async () => {
    expect(hayPinConocido()).toBe(null)
    await hayPin()
    expect(hayPinConocido()).toBe(false)

    await guardarPin('4821')
    expect(hayPinConocido()).toBe(true)
  })
})

describe('cambiar, quitar y recuperar', () => {
  it('cambiar pide el PIN de ahora', async () => {
    await guardarPin('4821')

    expect(await cambiarPin('0000', '9876')).toBe(false)
    expect(await verificarPin('4821')).toBe(true)

    expect(await cambiarPin('4821', '9876')).toBe(true)
    expect(await verificarPin('9876')).toBe(true)
    expect(await verificarPin('4821')).toBe(false)
  })

  it('quitar pide el PIN de ahora y borra su fila', async () => {
    await guardarPin('4821')

    expect(await quitarPin('0000')).toBe(false)
    expect(await hayPin()).toBe(true)

    expect(await quitarPin('4821')).toBe(true)
    expect(await hayPin()).toBe(false)
    expect(await getFlag(CLAVE)).toBe(null)
    expect(await estadoDeAcceso()).toBe('abierto')
  })

  it('quitar el PIN no toca ninguna entrada del journal', async () => {
    const userId = 'u1'
    await guardarEntrada({ ...entradaNueva(userId), texto: 'lo que escribí ayer' })
    await guardarEntrada({ ...entradaNueva(userId), texto: 'y lo de hoy' })
    await guardarPin('4821')

    await quitarPin('4821')

    const entradas = await loadEntradas(userId)
    expect(entradas).toHaveLength(2)
    expect(entradas.map(e => e.texto).sort()).toEqual(['lo que escribí ayer', 'y lo de hoy'])
  })

  it('restablecer tras recuperar la cuenta invalida el PIN viejo y no borra nada', async () => {
    const userId = 'u1'
    await guardarEntrada({ ...entradaNueva(userId), texto: 'lo que escribí ayer' })
    await guardarPin('4821')
    const anterior = await getFlag(CLAVE)

    await restablecerPin('9876')

    expect(await verificarPin('9876')).toBe(true)
    expect(await verificarPin('4821')).toBe(false)

    const ahora = await getFlag(CLAVE)
    expect(ahora.hash).not.toBe(anterior.hash)
    expect(ahora.salt).not.toBe(anterior.salt)

    expect(await loadEntradas(userId)).toHaveLength(1)
  })

  it('cambiar y restablecer dejan la protección puesta, no la retiran', async () => {
    await guardarPin('4821')
    await cambiarPin('4821', '9876')
    expect(await hayPin()).toBe(true)

    await restablecerPin('1111')
    expect(await hayPin()).toBe(true)
  })
})
