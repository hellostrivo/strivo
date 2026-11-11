// src/lib/avisos/__tests__/telefonoDeMentira.js
// Un iPhone de mentira para los avisos: el plugin de `@capacitor/local-notifications`
// hecho con el mismo Proxy que el de verdad (`dobleDeCapacitor.js`), y una
// lista de pendientes que se porta como la de iOS.

import { pluginDeCapacitor } from '../../__tests__/dobleDeCapacitor.js'
import { crearPuente } from '../../avisosNativos.js'

const copia = (valor) => JSON.parse(JSON.stringify(valor))

/**
 * @param {object} [inicio]
 * @param {'granted'|'denied'|'prompt'} [inicio.permiso]
 * @param {'granted'|'denied'} [inicio.respuesta] - lo que contesta al pedir.
 * @param {object[]} [inicio.pendientes]
 * @param {object[]} [inicio.retenidos] - toques que llegaron antes de escuchar.
 */
export function telefonoDeMentira({
  permiso = 'granted',
  respuesta = 'granted',
  pendientes = [],
  retenidos = [],
} = {}) {
  const estado = {
    permiso,
    respuesta,
    pendientes: copia(pendientes),
    entregadosRetirados: [],
    llamadas: { schedule: 0, requestPermissions: 0, cancel: 0, getPending: 0 },
    oyentes: [],
  }

  const plugin = pluginDeCapacitor({
    checkPermissions: async () => ({ display: estado.permiso }),
    requestPermissions: async () => {
      estado.llamadas.requestPermissions += 1
      // Como iOS: solo pregunta la primera vez. Ya decidido, devuelve lo que hay.
      if (estado.permiso === 'prompt') estado.permiso = estado.respuesta
      return { display: estado.permiso }
    },
    getPending: async () => {
      estado.llamadas.getPending += 1
      return { notifications: copia(estado.pendientes) }
    },
    schedule: async ({ notifications }) => {
      estado.llamadas.schedule += 1
      for (const aviso of notifications) {
        estado.pendientes = estado.pendientes.filter((p) => p.id !== aviso.id)
        estado.pendientes.push(copia(aviso))
      }
      return { notifications: notifications.map(({ id }) => ({ id })) }
    },
    cancel: async ({ notifications }) => {
      estado.llamadas.cancel += 1
      const ids = new Set(notifications.map(({ id }) => id))
      estado.pendientes = estado.pendientes.filter((p) => !ids.has(p.id))
    },
    removeDeliveredNotificationsById: async ({ ids }) => {
      estado.entregadosRetirados.push(...ids)
    },
    addListener: async (evento, fn) => {
      estado.oyentes.push({ evento, fn })
      // Como `retainUntilConsumed`: lo que llegó antes se entrega al escuchar.
      if (evento === 'localNotificationActionPerformed') retenidos.forEach((e) => fn(e))
      return { remove: async () => {} }
    },
  })

  const puente = crearPuente({ cargar: async () => ({ plugin }) })

  /** Simula un toque en un aviso. */
  const tocar = (evento) =>
    estado.oyentes
      .filter((o) => o.evento === 'localNotificationActionPerformed')
      .forEach((o) => o.fn(evento))

  return { estado, plugin, puente, tocar }
}

/** Un aviso que no es de Strivo (otro código de la app, o uno sin marca). */
export const AJENO = Object.freeze({
  id: 7,
  title: 'Otro',
  body: 'No es de Strivo',
  schedule: { on: { year: 2026, month: 11, day: 12, hour: 9, minute: 0 } },
})
