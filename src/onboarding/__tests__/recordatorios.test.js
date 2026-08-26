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
