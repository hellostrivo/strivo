// src/lib/compras.js
// El puente con las compras del iPhone, por RevenueCat (SPEC_25).
//
// **El único archivo de `src/` que importa `@revenuecat/purchases-capacitor`,
// bajo demanda y solo en el build nativo** (`--mode ios`). Con el import
// dinámico no bastaba: el service worker de la web precarga todos los trozos
// `.js`. Con la condición, `vite build` de la web ni siquiera emite el trozo
// (D10). Además, `esIPhone()` es la única pregunta por la plataforma.
//
// **El plugin nunca sale suelto de una promesa** (SPEC_21.2): aquí es un Proxy
// sobre el Proxy de Capacitor y contesta también a `then`. Se comprobó en el
// simulador: suelto, se queda colgado; en `{ plugin }`, no.
//
// **Aquí no se decide nada de producto.** Qué estado resulta de lo que
// contesta RevenueCat lo dice `suscripcion/estado.js`; aquí se dice cómo se
// habla con él. Nada lanza: todo contesta un motivo propio.
//
// **La identidad** (DP-25.19). Se configura sin `appUserID` —cliente anónimo,
// porque sin cuenta también se paga— y con cuenta se identifica con el uid de
// Firebase y nada más: ni nombre, ni correo, ni atributos (RN-07).
//
// **Nunca se invalida la caché de RevenueCat**: sin red, dejaría sin derecho a
// quien ya pagó.

import { esIPhone } from './plataforma.js'
import { conTecho } from './sesion.js'
import { anotarPaso, cola } from './suscripcion/diagnostico.js'

/** El derecho que se consulta. `strivo_pro` y Test Store son restos del panel. */
export const DERECHO = 'completo'

/** El offering del Fundador. Nunca se toma de `default`. */
export const OFFERING_FUNDADOR = 'fundador'

/** Cuánto se espera, como mucho, a que el cliente se cierre al salir. */
export const TECHO_DE_CIERRE_MS = 3000

/** Los códigos de error del SDK que aquí significan algo. */
const CANCELADA = '1'
const APLAZADA = '20'

async function cargarPlugin() {
  if (import.meta.env.MODE === 'ios') {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    return { plugin: Purchases }
  }
  return null
}

/** La clave pública de RevenueCat para iOS. Es pública por diseño. */
function clavePublica() {
  return import.meta.env.VITE_REVENUECAT_IOS_KEY ?? ''
}

/** ¿Trae este `customerInfo` el derecho activo? */
export function tieneDerecho(info) {
  return info?.entitlements?.active?.[DERECHO]?.isActive === true
}

function esAnonimoElId(id) {
  return String(id ?? '').startsWith('$RCAnonymousID:')
}

/**
 * Crea el puente. Los argumentos existen para las pruebas.
 *
 * @param {object} [opciones]
 * @param {() => Promise<?{plugin: object}>} [opciones.cargar]
 * @param {() => boolean} [opciones.enTelefono]
 * @param {() => string} [opciones.clave]
 */
export function crearCompras({
  cargar = cargarPlugin,
  enTelefono = esIPhone,
  clave = clavePublica,
  techoDeCierreMs = TECHO_DE_CIERRE_MS,
} = {}) {
  const oyentes = new Set()
  let activacion = null
  // Las operaciones de identidad van de una en una: entrar y salir no se cruzan.
  let fila = Promise.resolve()

  const avisar = (info) => {
    if (!info) return
    for (const fn of [...oyentes]) fn(info)
  }

  /** Configura el cliente una vez. `null` si aquí no hay compras. */
  const activar = () => {
    if (!enTelefono() || !clave()) return Promise.resolve(null)
    activacion ??= (async () => {
      const cargado = await cargar()
      if (!cargado) return null
      const { plugin } = cargado
      await plugin.configure({
        apiKey: clave(),
        // No hay publicidad ni atribución, y no se quiere que la haya (D9).
        automaticDeviceIdentifierCollectionEnabled: false,
      })
      await plugin.addCustomerInfoUpdateListener((info) => avisar(info))
      return { plugin }
    })().catch(() => {
      activacion = null
      return null
    })
    return activacion
  }

  const conPlugin = async (fn, siFalla) => {
    const listo = await activar()
    if (!listo) return siFalla
    try {
      return await fn(listo.plugin)
    } catch {
      return siFalla
    }
  }

  const enFila = (trabajo) => {
    const turno = fila.then(trabajo, trabajo)
    fila = turno.then(
      () => undefined,
      () => undefined,
    )
    return turno
  }

  const infoDe = async (plugin) => (await plugin.getCustomerInfo())?.customerInfo ?? null

  return {
    /** ¿Hay compras en este sitio? */
    disponibles: () => enTelefono() && Boolean(clave()),

    activar: async () => (await activar()) !== null,

    /** Las novedades del cliente: compras, renovaciones, canjes, reembolsos. */
    escuchar: (fn) => {
      oyentes.add(fn)
      return () => oyentes.delete(fn)
    },

    /** Lo último que se sabe del cliente, o `null`. */
    info: () => conPlugin(infoDe, null),

    /** Quién es el cliente, para el diagnóstico. */
    cliente: () =>
      conPlugin(async (plugin) => {
        const { appUserID } = await plugin.getAppUserID()
        return { anonimo: esAnonimoElId(appUserID), final: String(appUserID).slice(-6) }
      }, null),

    /**
     * Liga el cliente a la cuenta. Con el mismo uid no hace nada.
     *
     * **D7.** Si un cliente anónimo con el derecho activo entra a una cuenta
     * que RevenueCat ya conocía, no une nada y el derecho se queda atrás: se
     * restaura **una vez**, en silencio. En cualquier otro caso, no.
     */
    identificar: (uid) =>
      enFila(() =>
        conPlugin(async (plugin) => {
          const { appUserID } = await plugin.getAppUserID()
          if (appUserID === uid) return infoDe(plugin)
          anotarPaso(`tienda: de ${cola(appUserID)} a ${cola(uid)}`)

          const teniaDerecho =
            esAnonimoElId(appUserID) && tieneDerecho(await infoDe(plugin).catch(() => null))
          const entrada = await plugin.logIn({ appUserID: uid })
          let info = entrada?.customerInfo ?? null
          anotarPaso(
            `tienda: antes ${teniaDerecho ? 'con' : 'sin'} derecho · después ${tieneDerecho(info) ? 'con' : 'sin'} · cliente ${entrada?.created ? 'nuevo' : 'conocido'}`,
          )
          if (teniaDerecho && !tieneDerecho(info)) {
            info = (await plugin.restorePurchases().catch(() => null))?.customerInfo ?? info
            anotarPaso(`tienda: restaurado ${tieneDerecho(info) ? 'con' : 'sin'} derecho`)
          }
          avisar(info)
          return info
        }, null),
      ),

    /**
     * Al cerrar sesión y al borrar la cuenta. Nunca con un cliente anónimo —el
     * SDK lo rechaza— y sin frenar nunca a quien sale.
     */
    cerrar: () =>
      conTecho(
        enFila(() =>
          conPlugin(async (plugin) => {
            if ((await plugin.isAnonymous())?.isAnonymous !== false) return false
            await plugin.logOut()
            anotarPaso('tienda: cliente cerrado')
            return true
          }, false),
        ),
        techoDeCierreMs,
      ),

    /**
     * Los planes de la tienda. `null` si no se pudieron traer. Con
     * `forzar`, sin la caché del SDK: solo el diagnóstico lo pide.
     */
    planes: ({ forzar = false } = {}) =>
      conPlugin(async (plugin) => {
        const offerings = forzar
          ? await plugin.syncAttributesAndOfferingsIfNeeded()
          : await plugin.getOfferings()
        const actual = offerings?.current ?? null
        const fundador = offerings?.all?.[OFFERING_FUNDADOR] ?? null
        return {
          anual: actual?.annual ?? null,
          mensual: actual?.monthly ?? null,
          fundador: fundador?.lifetime ?? null,
          metadata: fundador?.metadata ?? null,
        }
      }, null),

    /**
     * Compra un paquete. Cancelar, o dejarla esperando el permiso de un adulto,
     * no es un error: la pantalla se queda como estaba.
     *
     * @returns {Promise<{motivo: 'ok'|'cancelada'|'error', info?: object}>}
     */
    comprar: async (paquete) => {
      const listo = await activar()
      if (!listo) return { motivo: 'error' }
      try {
        const r = await listo.plugin.purchasePackage({ aPackage: paquete })
        avisar(r?.customerInfo)
        return { motivo: 'ok', info: r?.customerInfo ?? null }
      } catch (error) {
        const codigo = String(error?.code ?? '')
        const cancelada = error?.userCancelled === true || codigo === CANCELADA
        return { motivo: cancelada || codigo === APLAZADA ? 'cancelada' : 'error' }
      }
    },

    /**
     * Restaura lo comprado con este Apple ID.
     *
     * @returns {Promise<{motivo: 'restaurado'|'nada'|'error', info?: object}>}
     */
    restaurar: async () => {
      const info = await conPlugin(
        async (plugin) => (await plugin.restorePurchases())?.customerInfo ?? null,
        null,
      )
      if (!info) return { motivo: 'error' }
      avisar(info)
      return { motivo: tieneDerecho(info) ? 'restaurado' : 'nada', info }
    },
  }
}

/** El puente de la app. */
export const compras = crearCompras()
