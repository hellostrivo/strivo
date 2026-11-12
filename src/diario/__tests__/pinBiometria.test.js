// src/diario/__tests__/pinBiometria.test.js
// SPEC_23A — Face ID para el Journal: la máquina de estados (criterios 3 a 7).
//
// El teléfono es de mentira pero se porta como el plugin de verdad, Proxy de
// Capacitor incluido (`caraDeMentira.js`). Lo que se comprueba es lo que abre
// la puerta y lo que la deja como estaba: que solo abre la cara con el
// interruptor activo y la huella correcta, que cancelar no apaga nada, que una
// clave invalidada se dice, que el PIN nunca llega a la Keychain y que nada de
// esto sale del teléfono.

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { diario, shared } from '@/lib/db'
import { listQueue, mudarUid } from '@/lib/db/local.js'
import { reiniciarTelefono, telefono } from '@/lib/__tests__/caraDeMentira.js'
import { NOMBRE_DE_LA_CLAVE } from '@/lib/biometria.js'

const plataforma = vi.hoisted(() => ({ iphone: true }))
vi.mock('@/lib/plataforma', () => ({
  esNativa: () => plataforma.iphone,
  esIPhone: () => plataforma.iphone,
}))
vi.mock('@capgo/capacitor-native-biometric', async () => ({
  NativeBiometric: (await import('@/lib/__tests__/caraDeMentira.js')).telefono.plugin,
}))

const {
  BIOMETRIA,
  ITERACIONES,
  abrirConBiometria,
  activarBiometria,
  apagarBiometria,
  configDe,
  crearPin,
  desactivarPin,
  estadoPin,
  huellaDe,
  olvidarRevisionDeHuerfana,
  reestablecerPin,
  verificarPin,
} = await import('../pin.js')

const PIN = '1234'
const MOTIVO = 'Para abrir tu journal.'

async function conPin() {
  await shared.saveAuthRecord(UID, { uid: UID, email: 'alguien@ejemplo.com', phone: null })
  expect(await crearPin(UID, PIN)).toEqual({ ok: true })
}

async function conCara() {
  await conPin()
  expect(await activarBiometria(UID, PIN, { motivo: MOTIVO })).toEqual({ ok: true })
}

const claveGuardada = () => telefono.estado.keychain.get(NOMBRE_DE_LA_CLAVE)

beforeEach(async () => {
  plataforma.iphone = true
  reiniciarTelefono()
  olvidarRevisionDeHuerfana()
  await resetLocalDB()
})

describe('activar (DP-23.10)', () => {
  it('con el PIN correcto y la cara aceptada queda activa', async () => {
    await conCara()
    const estado = await estadoPin(UID)
    expect(estado.biometria).toEqual({ estado: BIOMETRIA.activa, disponible: true, tipo: 'faceId' })
  })

  it('guarda el SHA-256 de la clave, nunca la clave', async () => {
    await conCara()
    const config = await diario.getPinConfig(UID)
    expect(config.biometria.verificador).toBe(await huellaDe(claveGuardada()))
    expect(config.biometria.verificador).not.toBe(claveGuardada())
    expect(typeof config.biometria.activadaEn).toBe('string')
  })

  it('la clave es aleatoria, de 32 bytes, con .biometryCurrentSet', async () => {
    await conCara()
    expect(claveGuardada()).toMatch(/^[0-9a-f]{64}$/)
    const guardado = telefono.estado.llamadas.find(([metodo]) => metodo === 'setData')[1]
    expect(guardado.accessControl).toBe(1)
    expect(guardado.key).toBe(NOMBRE_DE_LA_CLAVE)
  })

  it('pide la cara una vez al activar, con el motivo y sin el código del teléfono', async () => {
    await conCara()
    const lectura = telefono.estado.llamadas.find(([metodo]) => metodo === 'getSecureData')[1]
    expect(telefono.estado.lecturas).toBe(1)
    expect(lectura).toMatchObject({ reason: MOTIVO, fallbackTitle: '' })
  })

  it('con el PIN equivocado: incorrecto, y nada guardado', async () => {
    await conPin()
    expect(await activarBiometria(UID, '9999', { motivo: MOTIVO })).toEqual({
      ok: false,
      motivo: 'incorrecto',
    })
    expect(claveGuardada()).toBeUndefined()
    expect((await diario.getPinConfig(UID)).biometria).toBeUndefined()
  })

  for (const [nombre, codigo] of [
    ['cancelar', '16'],
    ['fallar', '10'],
    ['negar el permiso', '0'],
  ]) {
    it(`${nombre} la cara al activar: nada guardado y la clave borrada`, async () => {
      await conPin()
      telefono.estado.cara = codigo
      expect((await activarBiometria(UID, PIN, { motivo: MOTIVO })).ok).toBe(false)
      expect(claveGuardada()).toBeUndefined()
      expect((await diario.getPinConfig(UID)).biometria).toBeUndefined()
      expect((await estadoPin(UID)).biometria.estado).toBe(BIOMETRIA.apagada)
    })
  }

  it('el PIN nunca llega a la Keychain', async () => {
    await conCara()
    await abrirConBiometria(UID, { motivo: MOTIVO })
    const todo = JSON.stringify(telefono.estado.llamadas)
    expect(todo).not.toContain(PIN)
    const config = await diario.getPinConfig(UID)
    expect(todo).not.toContain(config.hash)
  })
})

describe('abrir (DP-23.11)', () => {
  it('con Face ID activo, la cara abre', async () => {
    await conCara()
    expect(await abrirConBiometria(UID, { motivo: MOTIVO })).toEqual({ ok: true })
  })

  it('sin interruptor activo no abre, aunque haya una clave en la Keychain', async () => {
    await conPin()
    telefono.estado.keychain.set(NOMBRE_DE_LA_CLAVE, 'a'.repeat(64))
    expect(await abrirConBiometria(UID, { motivo: MOTIVO })).toEqual({
      ok: false,
      motivo: 'apagada',
    })
    expect(telefono.estado.lecturas).toBe(0)
  })

  it('una clave cuya huella no coincide no abre', async () => {
    await conCara()
    telefono.estado.keychain.set(NOMBRE_DE_LA_CLAVE, 'b'.repeat(64))
    expect((await abrirConBiometria(UID, { motivo: MOTIVO })).ok).toBe(false)
  })

  it('cancelar vuelve al PIN sin apagar nada', async () => {
    await conCara()
    telefono.estado.cara = '16'
    expect(await abrirConBiometria(UID, { motivo: MOTIVO })).toEqual({
      ok: false,
      motivo: 'cancelado',
    })
    expect((await estadoPin(UID)).biometria.estado).toBe(BIOMETRIA.activa)
    expect(claveGuardada()).toBeDefined()
  })

  it('una cara que no coincide, igual: el PIN, y Face ID sigue activo', async () => {
    await conCara()
    telefono.estado.cara = '10'
    expect((await abrirConBiometria(UID, { motivo: MOTIVO })).motivo).toBe('cancelado')
    expect((await estadoPin(UID)).biometria.estado).toBe(BIOMETRIA.activa)
  })

  it('con el bloqueo por intentos, como cancelado: no se apaga', async () => {
    await conCara()
    telefono.estado.disponible = { isAvailable: false, biometryType: 2, errorCode: 2 }
    expect((await abrirConBiometria(UID, { motivo: MOTIVO })).motivo).toBe('cancelado')
    expect((await estadoPin(UID)).biometria.estado).toBe(BIOMETRIA.activa)
  })

  it('el PIN sigue abriendo con Face ID activo', async () => {
    await conCara()
    expect(await verificarPin(UID, PIN)).toBe(true)
  })
})

describe('cuando Face ID deja de abrir (DP-23.13)', () => {
  it('iOS quitó la clave: cambiada, la clave borrada y el PIN', async () => {
    await conCara()
    telefono.estado.keychain.delete(NOMBRE_DE_LA_CLAVE)
    expect(await abrirConBiometria(UID, { motivo: MOTIVO })).toEqual({
      ok: false,
      motivo: 'cambiada',
    })
    const config = await diario.getPinConfig(UID)
    expect(config.biometria).toEqual({ cambiada: true })
    expect(config.enabled).toBe(true)
    expect((await estadoPin(UID)).biometria.estado).toBe(BIOMETRIA.cambiada)
  })

  for (const [nombre, errorCode] of [
    ['se le quitó el permiso a Strivo', 1],
    ['no quedan caras registradas', 3],
    ['se quitó el código del teléfono', 14],
  ]) {
    it(`${nombre}: cambiada sin pedir la cara`, async () => {
      await conCara()
      telefono.estado.lecturas = 0
      telefono.estado.disponible = { isAvailable: false, biometryType: 2, errorCode }
      expect((await abrirConBiometria(UID, { motivo: MOTIVO })).motivo).toBe('cambiada')
      expect(telefono.estado.lecturas).toBe(0)
      expect(claveGuardada()).toBeUndefined()
    })
  }

  it('con cambiada, el interruptor está apagado y se puede volver a activar', async () => {
    await conCara()
    telefono.estado.keychain.delete(NOMBRE_DE_LA_CLAVE)
    await abrirConBiometria(UID, { motivo: MOTIVO })
    expect(await activarBiometria(UID, PIN, { motivo: MOTIVO })).toEqual({ ok: true })
    expect((await estadoPin(UID)).biometria.estado).toBe(BIOMETRIA.activa)
  })
})

describe('lo que apaga Face ID (DP-23.12)', () => {
  it('apagar el interruptor, sin pedir el PIN', async () => {
    await conCara()
    expect(await apagarBiometria(UID)).toEqual({ ok: true })
    expect(claveGuardada()).toBeUndefined()
    expect((await diario.getPinConfig(UID)).biometria).toBeUndefined()
    expect((await diario.getPinConfig(UID)).enabled).toBe(true)
  })

  it('«Dejar de pedirlo» borra la clave y el campo', async () => {
    await conCara()
    expect(await desactivarPin(UID, PIN)).toEqual({ ok: true })
    expect(claveGuardada()).toBeUndefined()
    expect(await diario.getPinConfig(UID)).toBeNull()
  })

  it('el PIN nuevo de «Olvidé mi PIN» la apaga', async () => {
    await conCara()
    expect(await reestablecerPin(UID, '5678')).toEqual({ ok: true })
    expect(claveGuardada()).toBeUndefined()
    expect((await diario.getPinConfig(UID)).biometria).toBeUndefined()
  })

  it('crear un PIN la apaga', async () => {
    await conCara()
    expect(await crearPin(UID, '4321')).toEqual({ ok: true })
    expect(claveGuardada()).toBeUndefined()
    expect((await estadoPin(UID)).biometria.estado).toBe(BIOMETRIA.apagada)
  })

  it('la rederivación de verificarPin conserva biometria', async () => {
    await conCara()
    const antes = await diario.getPinConfig(UID)
    // Un PIN guardado con menos iteraciones: verificarPin lo rederiva.
    const viejo = await configDe(PIN, 1000)
    await diario.savePinConfig(UID, { ...viejo, biometria: antes.biometria })
    expect(await verificarPin(UID, PIN)).toBe(true)
    const despues = await diario.getPinConfig(UID)
    expect(despues.iterations).toBe(ITERACIONES)
    expect(despues.biometria).toEqual(antes.biometria)
    expect(await abrirConBiometria(UID, { motivo: MOTIVO })).toEqual({ ok: true })
  })
})

describe('al reinstalar: la clave huérfana (DP-23.15, criterio 7)', () => {
  it('con clave y sin verificador, se borra sin pedir la cara', async () => {
    await conPin()
    telefono.estado.keychain.set(NOMBRE_DE_LA_CLAVE, 'c'.repeat(64))
    const estado = await estadoPin(UID)
    expect(claveGuardada()).toBeUndefined()
    expect(telefono.estado.lecturas).toBe(0)
    expect(estado.biometria.estado).toBe(BIOMETRIA.apagada)
  })

  it('también sin PIN: el journal se porta como sin biometría', async () => {
    telefono.estado.keychain.set(NOMBRE_DE_LA_CLAVE, 'c'.repeat(64))
    const estado = await estadoPin(UID)
    expect(claveGuardada()).toBeUndefined()
    expect(estado.activo).toBe(false)
    expect(estado.biometria).toEqual({ estado: BIOMETRIA.apagada, disponible: false, tipo: null })
  })

  it('con Face ID activo, la clave no es huérfana y no se toca', async () => {
    await conCara()
    olvidarRevisionDeHuerfana()
    await estadoPin(UID)
    expect(claveGuardada()).toBeDefined()
  })
})

describe('el estado que ve la pantalla', () => {
  it('con Touch ID, el tipo es touchId', async () => {
    telefono.estado.disponible = { isAvailable: true, biometryType: 1 }
    await conPin()
    expect((await estadoPin(UID)).biometria.tipo).toBe('touchId')
  })

  it('sin biometría disponible, el interruptor no existe (disponible: false)', async () => {
    telefono.estado.disponible = { isAvailable: false, biometryType: 0, errorCode: 3 }
    await conPin()
    expect((await estadoPin(UID)).biometria.disponible).toBe(false)
  })
})

describe('en la web (criterio 8)', () => {
  it('no se carga el plugin y Face ID no existe', async () => {
    plataforma.iphone = false
    await conPin()
    const estado = await estadoPin(UID)
    expect(estado.biometria).toEqual({ estado: BIOMETRIA.apagada, disponible: false, tipo: null })
    expect(await activarBiometria(UID, PIN, { motivo: MOTIVO })).toEqual({
      ok: false,
      motivo: 'no-disponible',
    })
    expect(await abrirConBiometria(UID, { motivo: MOTIVO })).toEqual({
      ok: false,
      motivo: 'apagada',
    })
    expect(telefono.estado.llamadas).toEqual([])
  })
})

describe('nada sale del teléfono (criterio 6, RN-DB-04)', () => {
  it('pinConfig con biometria no se encola', async () => {
    await conCara()
    const cola = await listQueue(UID)
    expect(cola.some((entrada) => entrada.path.includes('pinConfig'))).toBe(false)
  })

  it('tampoco al mudar el árbol', async () => {
    await conCara()
    await mudarUid(UID, 'cuenta-nueva')
    const cola = await listQueue('cuenta-nueva')
    expect(cola.some((entrada) => entrada.path.includes('pinConfig'))).toBe(false)
  })
})
