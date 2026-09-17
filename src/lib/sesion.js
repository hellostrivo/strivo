// src/lib/sesion.js
// Qué es una sesión con cuenta, y cómo se prepara su árbol al arrancar
// (SPEC_17A §4.4).
//
// Dos cosas viven aquí y en ningún otro sitio:
//
//   - `esUidDeCuenta`: la única regla que distingue una sesión anónima de una
//     con cuenta. La leen `ArranqueProvisional` y el bloque de sincronización
//     de Tu perfil, y dos copias de la misma regla se separan en cuanto
//     alguien edite una.
//   - `prepararArbol`: el orden en que se restaura y se siembra. Es lógica sin
//     React a propósito: es lo que hay que poder probar sin un navegador
//     —marca huérfana, restaurar antes de sembrar, uid local sin restauración—
//     y el componente que la llama solo decide qué se ve mientras tanto.

import { initUserTree, shared } from './db/index.js'
import {
  MOTIVOS,
  hayMarcaDeRestauracion,
  restaurar,
  retirarMarcaDeRestauracion,
} from './db/restaurar.js'

/** Con el que arranca una sesión anónima; lo acuña `ArranqueProvisional`. */
const PREFIJO_LOCAL = 'local-'

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
 * ¿Es este uid el de una cuenta, y no el que inventa el arranque?
 *
 * ⚠ PROVISIONAL (DP-17.7). Es deuda contraída a sabiendas: hoy no hay
 * `onAuthStateChanged` —eso es SPEC_19— y lo único que dice que hay cuenta es
 * que el uid no sea de los que acuña `ArranqueProvisional`. SPEC_19 sustituye
 * esta pregunta por la sesión real de Firebase, y este helper desaparece con
 * ella. Hasta entonces, es la única fuente de la respuesta.
 */
export function esUidDeCuenta(uid) {
  return typeof uid === 'string' && uid.length > 0 && !uid.startsWith(PREFIJO_LOCAL)
}

/**
 * Deja el árbol de `users/{uid}/` listo para entrar, en este orden:
 *
 *   1. Si es una cuenta y **no hay marca de restauración o no hay árbol**, se
 *      restaura. Un árbol ausente con marca puesta es una marca huérfana
 *      —borrar IndexedDB deja `localStorage` intacto— y se retira antes
 *      (D13a).
 *   2. Solo **después**, si sigue sin haber árbol —cuenta sin nada en la nube,
 *      o restauración fallida—, se siembra. Así lo remoto entra por la regla 1
 *      del §2 y no compite con una siembra que no dice nada de nadie (D13b).
 *
 * Sin cuenta, nada de lo primero ocurre: se siembra como siempre y la app
 * arranca exactamente igual que hoy.
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
 * @param {string} uid
 * @param {object} [opciones]
 * @param {(activa: boolean) => void} [opciones.enRestauracion] - Se llama con
 *   `true` al empezar a restaurar y con `false` al terminar o al vencer el
 *   techo: es lo que pone y quita el velo.
 * @param {boolean} [opciones.restaurarSiHaceFalta=true] - `false` cuando el
 *   uid cambia a mitad de sesión (P7): entonces solo se siembra si hiciera
 *   falta, y no se restaura (D7).
 * @param {number} [opciones.techoMs=TECHO_DE_ESPERA_MS]
 * @returns {Promise<{restauracion: ?object, aTiempo: boolean, sembrado: boolean, quitarOyente: ?(() => void)}>}
 */
export async function prepararArbol(
  uid,
  { enRestauracion, restaurarSiHaceFalta = true, techoMs = TECHO_DE_ESPERA_MS } = {},
) {
  let restauracion = null
  let aTiempo = true
  let quitarOyente = null

  if (restaurarSiHaceFalta && esUidDeCuenta(uid)) {
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
 */
async function conTecho(promesa, ms) {
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
