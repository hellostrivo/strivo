// src/lib/sesion.js
// Qué sesión hay, y cómo se prepara su árbol al arrancar (SPEC_17A §4.4,
// SPEC_19.1 §4.1).
//
// Tres cosas viven aquí y en ningún otro sitio:
//
//   - `resolverSesion`: la tabla de precedencia de SPEC_19 §3.1. Es la única
//     regla que dice si hay cuenta, y la dice **Firebase**, no el uid. Hasta
//     SPEC_19 la respuesta era `esUidDeCuenta` —que el uid no empezara por
//     `local-`— y eso fallaba justo cuando importaba: con la sesión de Firebase
//     perdida y un uid de cuenta en `localStorage`, la cola y la restauración
//     se intentaban sin usuario y las reglas las rechazaban en silencio. Ese
//     helper se retiró (DP-17.7).
//   - `leerSesionGuardada` y `escucharUsuario`: la sesión de Firebase, leída al
//     arrancar y escuchada después. Cargan el SDK bajo demanda, como la cola.
//   - `prepararArbol`: el orden en que se restaura y se siembra. Es lógica sin
//     React a propósito: es lo que hay que poder probar sin un navegador
//     —marca huérfana, restaurar antes de sembrar, uid local sin restauración,
//     dos llamadas a la vez— y el componente que la llama solo decide qué se
//     ve mientras tanto.

import { initUserTree, shared } from './db/index.js'
import {
  MOTIVOS,
  hayMarcaDeRestauracion,
  restaurar,
  retirarMarcaDeRestauracion,
} from './db/restaurar.js'

/** Con el que arranca una sesión anónima; lo acuña `ArranqueProvisional`. */
const PREFIJO_LOCAL = 'local-'

/** Los cuatro estados de sesión (SPEC_19 §3.1). */
export const ESTADOS_SESION = Object.freeze({
  sinConfigurar: 'sinConfigurar',
  sinCuenta: 'sinCuenta',
  conCuenta: 'conCuenta',
  vencida: 'vencida',
})

/**
 * Cuánto se espera a la restauración con el velo puesto, como máximo (D16).
 *
 * `sin_red` no cubre el caso frecuente en móvil: una conexión colgada, no
 * caída. `navigator.onLine` dice `true`, la lectura se queda esperando y la
 * persona se quedaría detrás del velo indefinidamente. Pasado el techo, el
 * velo baja y se entra; la restauración **no se cancela** —sigue por detrás y
 * marca si termina— y lo que baje aparecerá al montarse la siguiente sección.
 * No es un umbral de fallo: una restauración lenta no pierde nada por cruzarlo.
 */
export const TECHO_DE_ESPERA_MS = 15000

/**
 * ¿Este uid lo inventó el teléfono?
 *
 * **No responde a "¿hay cuenta?"**: eso lo dice Firebase, en `resolverSesion`.
 * Responde a otra pregunta, que la tabla de §3.1 necesita para separar sus
 * dos últimas filas: sin usuario de Firebase, un uid acuñado aquí es una
 * sesión anónima y uno que no lo es fue de una cuenta cuya sesión se perdió.
 */
function inventadoPorElTelefono(uid) {
  return typeof uid === 'string' && uid.startsWith(PREFIJO_LOCAL)
}

/**
 * Qué sesión hay, con la tabla de precedencia de SPEC_19 §3.1 delante:
 *
 * | Firebase      | `strivo.uid.local` | Estado          | uid vigente            |
 * |---------------|--------------------|-----------------|------------------------|
 * | sin configurar| cualquiera         | `sinConfigurar` | el guardado            |
 * | usuario U     | U                  | `conCuenta`     | U                      |
 * | usuario U     | `local-…` u otro   | `conCuenta`     | U, tras entrar (§3.4)  |
 * | sin usuario   | `local-…`          | `sinCuenta`     | el guardado            |
 * | sin usuario   | uid de cuenta      | `vencida`       | el guardado            |
 *
 * `requiereEntrada` es el uid de origen de la tercera fila —desde el que hay
 * que entrar a la cuenta con `entrarACuenta`— y `null` en las demás. Función
 * pura: no lee nada, no escribe nada y no sabe de React.
 *
 * @param {object} datos
 * @param {boolean} datos.configurado - ¿hay Firebase en esta instalación?
 * @param {?{uid: string}} datos.usuario - el usuario de Firebase, o `null`.
 * @param {?string} datos.uidGuardado - lo que dice `strivo.uid.local`.
 * @returns {{estado: string, uid: ?string, requiereEntrada: ?string}}
 */
export function resolverSesion({ configurado, usuario, uidGuardado }) {
  if (!configurado) {
    return { estado: ESTADOS_SESION.sinConfigurar, uid: uidGuardado, requiereEntrada: null }
  }
  if (usuario) {
    const requiereEntrada = uidGuardado && uidGuardado !== usuario.uid ? uidGuardado : null
    return { estado: ESTADOS_SESION.conCuenta, uid: usuario.uid, requiereEntrada }
  }
  const estado = inventadoPorElTelefono(uidGuardado)
    ? ESTADOS_SESION.sinCuenta
    : ESTADOS_SESION.vencida
  return { estado, uid: uidGuardado, requiereEntrada: null }
}

/** Lo que la app necesita del usuario de Firebase, y nada más. */
function comoUsuario(usuario) {
  return usuario ? { uid: usuario.uid, email: usuario.email ?? null } : null
}

async function instanciaDeAuth() {
  try {
    const { auth } = await import('./firebase.js')
    return auth ?? null
  } catch {
    // Si el SDK no carga, la app sigue como sin configurar: lo local funciona
    // entero y no hay nada que la nube pueda hacer sin él.
    return null
  }
}

/**
 * La sesión que Firebase tenía guardada, esperando a que la resuelva.
 *
 * Es una lectura local —IndexedDB, `firebaseLocalStorageDb`— y funciona sin
 * red. Se espera con `authStateReady()` (Firebase 10.14.1 la trae) y, si no
 * existiera, con la primera emisión de `onAuthStateChanged`. **No se fija
 * persistencia** (SPEC_19 §0, punto 2): la de fábrica en web ya es IndexedDB.
 *
 * @returns {Promise<{configurado: boolean, usuario: ?{uid: string, email: ?string}}>}
 */
export async function leerSesionGuardada() {
  const auth = await instanciaDeAuth()
  if (!auth) return { configurado: false, usuario: null }

  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady()
  } else {
    const { onAuthStateChanged } = await import('firebase/auth')
    await new Promise((resolve) => {
      let quitar = null
      let resuelto = false
      quitar = onAuthStateChanged(auth, () => {
        resuelto = true
        quitar?.()
        resolve()
      })
      if (resuelto) quitar()
    })
  }
  return { configurado: true, usuario: comoUsuario(auth.currentUser) }
}

/**
 * Escucha la sesión de Firebase mientras la app está abierta.
 *
 * `fn` recibe el usuario —o `null`— cada vez que cambia. Sin configuración no
 * hay nada que escuchar y se devuelve una desuscripción vacía.
 *
 * @returns {Promise<() => void>}
 */
export async function escucharUsuario(fn) {
  const auth = await instanciaDeAuth()
  if (!auth) return () => {}
  const { onAuthStateChanged } = await import('firebase/auth')
  return onAuthStateChanged(auth, (usuario) => fn(comoUsuario(usuario)))
}

/** Las evaluaciones de `prepararArbol` en curso, por uid (DP-17.11). */
const EN_VUELO = new Map()

/**
 * Deja el árbol de `users/{uid}/` listo para entrar, en este orden:
 *
 *   1. Si la sesión es `conCuenta` —lo dice quien llama, con `conCuenta`; esta
 *      función no lo adivina por el uid— y **no hay marca de restauración o no
 *      hay árbol**, se restaura. Un árbol ausente con marca puesta es una marca huérfana
 *      —borrar IndexedDB deja `localStorage` intacto— y se retira antes
 *      (D13a).
 *   2. Solo **después**, si sigue sin haber árbol —cuenta sin nada en la nube,
 *      o restauración fallida—, se siembra. Así lo remoto entra por la regla 1
 *      del §2 y no compite con una siembra que no dice nada de nadie (D13b).
 *
 * Sin cuenta —o con la sesión vencida—, nada de lo primero ocurre: se siembra
 * si hace falta y la app arranca exactamente igual que sin nube.
 *
 * Si la restauración falla, se entra igual: no hay bloqueo y el reintento
 * explícito vive en Tu perfil. Y si falló **por falta de red**, se devuelve
 * además un oyente para reintentar una sola vez cuando vuelva
 * (`reintentarAlVolverLaRed`); con cualquier otro motivo no, porque volver la
 * red no arreglaría nada.
 *
 * Y la espera tiene techo (`TECHO_DE_ESPERA_MS`): si la restauración no ha
 * contestado a tiempo, se entra igual y ella sigue por detrás. En ese caso
 * `restauracion` vuelve `null` y `aTiempo` en `false`. La siembra que viene
 * después no puede pisar lo que la bajada escriba mientras tanto: `initShared`
 * escribe solo donde no hay nada.
 *
 * **Dos llamadas a la vez con el mismo uid son una** (DP-17.11). Cada llamada
 * evaluaba por su cuenta si restaurar y si sembrar, y dos concurrentes se
 * pisaban: la segunda veía `getProfile(uid) === null` porque la primera seguía
 * bajando, sembraba, y `Entrada` leía el expediente sembrado —`completedAt:
 * null`— y mandaba al onboarding a quien ya lo había hecho. Pasa siempre en
 * desarrollo, porque `React.StrictMode` monta dos veces, y pasaría con
 * cualquier re-montaje. Ahora la promesa en vuelo se guarda por uid y una
 * segunda llamada la recibe tal cual, en vez de arrancar otra evaluación. No
 * es una caché: la entrada se retira al resolverse, gane o falle, y una
 * llamada posterior vuelve a evaluar con normalidad.
 *
 * **Se apoya en una suposición que hoy se cumple y conviene no romper:** la
 * llamada en vuelo es siempre la que hace más. En `ArranqueProvisional` la
 * primera va con `restaurarSiHaceFalta: true` y la segunda —la del doble
 * montaje— con `false`, así que devolverle a la segunda la promesa de la
 * primera nunca le da menos de lo que pidió. Si algún día un llamador
 * invierte ese orden —una primera llamada que solo siembra y una segunda que
 * quiere restaurar—, la coalescencia deja de ser correcta y hay que decidir
 * qué gana. El guard `arranqueEvaluado` del componente responde a otra
 * pregunta —una restauración por sesión, aunque cambie el uid— y sigue
 * haciendo falta.
 *
 * @param {string} uid
 * @param {object} [opciones]
 * @param {(activa: boolean) => void} [opciones.enRestauracion] - Se llama con
 *   `true` al empezar a restaurar y con `false` al terminar o al vencer el
 *   techo: es lo que pone y quita el velo.
 * @param {boolean} [opciones.conCuenta=false] - ¿la sesión es `conCuenta`?
 *   Sin esto no se restaura nunca: ni sin cuenta, ni con la sesión vencida,
 *   porque las reglas de Firestore rechazarían la lectura.
 * @param {boolean} [opciones.restaurarSiHaceFalta=true] - `false` cuando el
 *   uid cambia a mitad de sesión (P7, o al entrar desde Perfil, que ya
 *   restauró): entonces solo se siembra si hiciera falta, y no se restaura.
 * @param {number} [opciones.techoMs=TECHO_DE_ESPERA_MS]
 * @returns {Promise<{restauracion: ?object, aTiempo: boolean, sembrado: boolean, quitarOyente: ?(() => void)}>}
 */
export function prepararArbol(uid, opciones = {}) {
  const enVuelo = EN_VUELO.get(uid)
  if (enVuelo) return enVuelo

  const promesa = evaluarArbol(uid, opciones).finally(() => {
    // Se retira solo si la entrada sigue siendo esta: es lo que hace que una
    // llamada posterior vuelva a evaluar en vez de recibir un resultado viejo.
    if (EN_VUELO.get(uid) === promesa) EN_VUELO.delete(uid)
  })
  EN_VUELO.set(uid, promesa)
  return promesa
}

async function evaluarArbol(
  uid,
  {
    enRestauracion,
    conCuenta = false,
    restaurarSiHaceFalta = true,
    techoMs = TECHO_DE_ESPERA_MS,
  } = {},
) {
  let restauracion = null
  let aTiempo = true
  let quitarOyente = null

  if (restaurarSiHaceFalta && conCuenta) {
    const sinArbol = (await shared.getProfile(uid)) === null
    if (sinArbol && hayMarcaDeRestauracion(uid)) retirarMarcaDeRestauracion(uid)

    if (sinArbol || !hayMarcaDeRestauracion(uid)) {
      enRestauracion?.(true)
      try {
        restauracion = await conTecho(restaurar(uid), techoMs)
      } finally {
        enRestauracion?.(false)
      }
      aTiempo = restauracion !== null
      if (aTiempo && !restauracion.ok && restauracion.motivo === MOTIVOS.sinRed) {
        quitarOyente = reintentarAlVolverLaRed(uid)
      }
    }
  }

  const sembrado = (await shared.getProfile(uid)) === null
  if (sembrado) await initUserTree(uid)

  return { restauracion, aTiempo, sembrado, quitarOyente }
}

/**
 * La promesa, o `null` si no contestó a tiempo. La promesa no se cancela —no
 * hay forma de cancelar una lectura de Firestore, y tampoco se quiere: lo que
 * baje tarde también vale— y el temporizador se limpia siempre.
 *
 * Se exporta para `entrarACuenta` (`lib/entradaCuenta.js`), que espera a la
 * restauración con el mismo techo: dos techos escritos en dos sitios se
 * separan en cuanto alguien toque uno.
 */
export async function conTecho(promesa, ms) {
  let temporizador = null
  const techo = new Promise((resolve) => {
    temporizador = setTimeout(() => resolve(null), ms)
  })
  try {
    return await Promise.race([promesa, techo])
  } finally {
    clearTimeout(temporizador)
  }
}

/**
 * Un reintento silencioso al volver la red, y solo uno.
 *
 * Sin velo, sin aviso y sin tocar la pantalla: lo que baje aparecerá la
 * próxima vez que se monte una sección, que es lo que quiere decir "sin
 * avisar" en SPEC_17 v2.0 §3. **No es un bucle ni un temporizador**: un solo
 * evento, un solo intento, y el oyente se retira al dispararse o cuando quien
 * lo puso llama a la función que devuelve.
 *
 * @returns {() => void} quita el oyente sin disparar el intento.
 */
export function reintentarAlVolverLaRed(uid, correr = restaurar) {
  if (typeof window === 'undefined') return () => {}

  const quitar = () => window.removeEventListener('online', alVolver)
  const alVolver = () => {
    quitar()
    correr(uid)
  }
  window.addEventListener('online', alVolver)
  return quitar
}
