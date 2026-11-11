// src/onboarding/__tests__/recordatorios.test.js
// P6 — el permiso de los avisos, y las tres formas de no tenerlo.
//
// Ninguna de las tres es un error: ni el "no" del dispositivo, ni el
// dispositivo que no sabe avisar, ni no haber preguntado todavía. Lo que estas
// pruebas custodian es que ninguna rama lance: una pantalla rota por haber
// preguntado sería lo contrario de lo que este paso es.

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ESTADOS,
  estadoActual,
  haySoporte,
  pedirPermiso,
  quedanActivados,
} from '../recordatorios.js'

function conNotificaciones(permiso, respuesta = permiso) {
  globalThis.window = {
    Notification: Object.assign(function Notification() {}, {
      permission: permiso,
      requestPermission: () => Promise.resolve(respuesta),
    }),
  }
}

afterEach(() => {
  delete globalThis.window
  vi.restoreAllMocks()
})

describe('sin soporte', () => {
  it('un dispositivo que no sabe avisar se reconoce y no se le pide nada', async () => {
    globalThis.window = {}
    expect(haySoporte()).toBe(false)
    expect(estadoActual()).toBe(ESTADOS.sinSoporte)
    expect(await pedirPermiso()).toBe(ESTADOS.sinSoporte)
  })
})

describe('con soporte', () => {
  it('antes de preguntar no hay nada que contar', () => {
    conNotificaciones('default')
    expect(estadoActual()).toBe(ESTADOS.sinPedir)
  })

  it('conceder deja los avisos activados', async () => {
    conNotificaciones('default', 'granted')
    const estado = await pedirPermiso()
    expect(estado).toBe(ESTADOS.concedido)
    expect(quedanActivados(estado)).toBe(true)
  })

  it('negar no activa nada, y tampoco es un fallo', async () => {
    conNotificaciones('default', 'denied')
    const estado = await pedirPermiso()
    expect(estado).toBe(ESTADOS.denegado)
    expect(quedanActivados(estado)).toBe(false)
  })

  it('cerrar el diálogo sin decidir deja el paso donde estaba', async () => {
    conNotificaciones('default', 'default')
    expect(await pedirPermiso()).toBe(ESTADOS.sinPedir)
  })

  it('un permiso ya concedido se reconoce sin volver a preguntar', () => {
    conNotificaciones('granted')
    expect(estadoActual()).toBe(ESTADOS.concedido)
  })

  it('si el navegador rechaza la llamada, no se rompe nada', async () => {
    globalThis.window = {
      Notification: Object.assign(function Notification() {}, {
        permission: 'default',
        requestPermission: () => Promise.reject(new Error('no')),
      }),
    }
    expect(await pedirPermiso()).toBe(ESTADOS.denegado)
  })
})

// ─── SPEC_22: P6 en la app de iPhone (criterio 5) ────────────────────────────

import { telefonoDeMentira } from '@/lib/avisos/__tests__/telefonoDeMentira.js'
import { mensajeDe } from '@components/onboarding/Recordatorios'
import { copy as copia } from '@copy'
import { consultarEstado } from '../recordatorios.js'

const enIPhone = () => true

describe('en la app de iPhone', () => {
  it('siempre sabe avisar, aunque no haya Notification', () => {
    globalThis.window = {}
    expect(haySoporte({ iphone: enIPhone })).toBe(true)
  })

  it('«Activar recordatorios» pide el permiso al teléfono, no al navegador', async () => {
    globalThis.window = {}
    const { puente, estado } = telefonoDeMentira({ permiso: 'prompt', respuesta: 'granted' })
    const resultado = await pedirPermiso({ iphone: enIPhone, nativo: puente })
    expect(resultado).toBe(ESTADOS.concedido)
    expect(estado.llamadas.requestPermissions).toBe(1)
    expect(quedanActivados(resultado)).toBe(true)
  })

  it('un «No permitir» del teléfono es denegado, y no activa nada', async () => {
    const { puente } = telefonoDeMentira({ permiso: 'prompt', respuesta: 'denied' })
    const resultado = await pedirPermiso({ iphone: enIPhone, nativo: puente })
    expect(resultado).toBe(ESTADOS.denegado)
    expect(quedanActivados(resultado)).toBe(false)
  })

  it('nunca contesta sin soporte', async () => {
    const { puente } = telefonoDeMentira({ permiso: 'denied' })
    expect(await pedirPermiso({ iphone: enIPhone, nativo: puente })).not.toBe(ESTADOS.sinSoporte)
    expect(await consultarEstado({ iphone: enIPhone, nativo: puente })).toBe(ESTADOS.denegado)
  })

  it('en la web, consultar es lo de siempre', async () => {
    conNotificaciones('granted')
    expect(await consultarEstado({ iphone: () => false })).toBe(ESTADOS.concedido)
  })
})

describe('la frase de P6 (§9, opción A)', () => {
  it('en el iPhone sin ninguna hora, «Te avisaremos cuando elijas tus horas en Tu perfil.»', () => {
    expect(mensajeDe(ESTADOS.concedido, { iphone: true, conHoras: false })).toBe('grantedSinHoras')
    expect(copia.diario.onboarding.p6.grantedSinHoras).toBe(
      'Listo. Te avisaremos cuando elijas tus horas en Tu perfil.',
    )
  })

  it('con horas, o en la web, la de siempre', () => {
    expect(mensajeDe(ESTADOS.concedido, { iphone: true, conHoras: true })).toBe('granted')
    expect(mensajeDe(ESTADOS.concedido, { iphone: false, conHoras: false })).toBe('granted')
    expect(mensajeDe(ESTADOS.denegado, { iphone: true, conHoras: false })).toBe('denied')
    expect(mensajeDe(null, { iphone: true })).toBeUndefined()
  })

  it('los textos de P6 de siempre no cambian (DP-22.2)', () => {
    const p6 = copia.diario.onboarding.p6
    expect(p6.granted).toBe('Listo. Te avisaremos a esas horas.')
    expect(p6.denied).toBe('Tu dispositivo no dio permiso. Puedes activarlo después desde Ajustes.')
    expect(p6.unsupported).toBe('Este dispositivo no tiene avisos. Strivo funciona igual.')
    expect(copia.notifications).toEqual({
      manana: '¿Cómo quieres sentirte hoy?',
      noche: '¿Cómo cerrar el día?',
    })
  })
})
