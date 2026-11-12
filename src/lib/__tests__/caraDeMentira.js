// src/lib/__tests__/caraDeMentira.js
// Un teléfono con Face ID de mentira, hecho como el Proxy de Capacitor
// (`dobleDeCapacitor.js`), para `@capgo/capacitor-native-biometric`.
//
// Se porta como el plugin según su Swift (SPEC_23 §9): una Keychain con una
// clave por nombre; `getSecureData` contesta lo que diga `cara` —'ok', o el
// código con que el plugin rechaza: '16' cancelar, '21' no está, '10' falló,
// '0' otro—; `isAvailable` lo que diga `disponible`. Anota todo lo que se le
// pasa, para poder comprobar que el PIN no llega nunca.

import { pluginDeCapacitor } from './dobleDeCapacitor.js'

export function caraDeMentira() {
  const estado = {
    keychain: new Map(),
    cara: 'ok',
    // Lo que contesta isAvailable.
    disponible: { isAvailable: true, biometryType: 2 },
    llamadas: [],
    lecturas: 0,
  }

  function rechazo(codigo) {
    const error = new Error(`rechazo ${codigo}`)
    error.code = codigo
    return error
  }

  const plugin = pluginDeCapacitor({
    isAvailable: async (opciones) => {
      estado.llamadas.push(['isAvailable', opciones])
      return { ...estado.disponible }
    },
    setData: async (opciones) => {
      estado.llamadas.push(['setData', opciones])
      estado.keychain.set(opciones.key, opciones.value)
    },
    getSecureData: async (opciones) => {
      estado.llamadas.push(['getSecureData', opciones])
      estado.lecturas += 1
      if (estado.cara !== 'ok') throw rechazo(estado.cara)
      if (!estado.keychain.has(opciones.key)) throw rechazo('21')
      return { value: estado.keychain.get(opciones.key) }
    },
    deleteData: async (opciones) => {
      estado.llamadas.push(['deleteData', opciones])
      estado.keychain.delete(opciones.key)
    },
    isDataSaved: async (opciones) => {
      estado.llamadas.push(['isDataSaved', opciones])
      return { isSaved: estado.keychain.has(opciones.key) }
    },
  })

  return { estado, plugin }
}

/**
 * Un teléfono compartido entre el `vi.mock` del plugin y la prueba que lo
 * gobierna: los dos importan este módulo y reciben el mismo.
 */
export const telefono = caraDeMentira()

/** Deja el teléfono compartido como recién encendido. */
export function reiniciarTelefono() {
  telefono.estado.keychain.clear()
  telefono.estado.cara = 'ok'
  telefono.estado.disponible = { isAvailable: true, biometryType: 2 }
  telefono.estado.llamadas.length = 0
  telefono.estado.lecturas = 0
}
