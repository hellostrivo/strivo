// src/lib/cuenta.js
// La cuenta: crearla, entrar, salir y recuperar el acceso, y llevarse lo
// escrito con ella.
//
// **Vive en `lib/` desde SPEC_19.1** (1 oct 2026). Nació en `onboarding/` porque
// P7 era el único sitio donde se creaba una cuenta; ahora la usan también el
// arranque —que escucha la sesión y la cierra— y Tu perfil, que deja entrar y
// salir. Tres consumidores fuera de un recorrido piden un sitio neutral.
//
// **La cuenta respalda; no es la puerta.** Se puede saltar, y saltarla no
// recorta nada: la app entera funciona sobre el almacén local (RN-01). Lo que
// la cuenta añade es que lo escrito sobreviva al teléfono.
//
// ─── Por qué esto muda el árbol ──────────────────────────────────────────────
//
// Hasta aquí se ha escrito bajo un uid local —`local-<uuid>`, el que inventa el
// arranque—, y el nombre, el género y los horarios de los pasos anteriores
// están guardados en `users/{uidLocal}/`. Las reglas de Firestore exigen que
// ese segmento sea el uid autenticado, así que sin mudar el árbol pasarían dos
// cosas a la vez: la sesión nueva no encontraría nada de lo recién escrito y
// nada de lo recién escrito podría subir jamás. Por eso, en cuanto hay cuenta,
// `mudarUid` renombra el árbol entero antes de devolver el control.
//
// La mudanza **no sobrescribe** lo que ya hubiera bajo la cuenta: quien vuelve
// a entrar en una cuenta que ya usó no pierde su historial por haber escrito
// tres cosas en una sesión anónima (RN-DB-04).
//
// ─── Sin configuración, esto no existe ───────────────────────────────────────
//
// Firebase solo se inicializa si hay credenciales (`src/lib/firebase.js`), y el
// SDK se carga bajo demanda, igual que hace la cola de sincronización: sin
// `.env.local`, la app funciona entera sin haber tocado el SDK y este paso se
// ofrece únicamente con lo que sí puede cumplir.

import { mudarUid, shared } from '@/lib/db'
import { esNativa } from '@lib/plataforma'
import { cerrarSesionNativa, credencialNativa, esCancelacion } from '@lib/credencialNativa'

/**
 * Lo que puede salir mal, sin un solo código de error a la vista (RN-EST-04).
 *
 * Los cuatro primeros son los de P7 y no cambian. Los tres siguientes son los
 * de entrar y recuperar desde Tu perfil (SPEC_19 §4): ahí sí importa distinguir
 * unas credenciales que no coinciden de una conexión caída, porque cada una
 * tiene su frase. `otroMetodo` es de Google y Apple (SPEC_21.2, DP-21.2.7): el
 * correo ya tiene cuenta con otra forma de entrar, y decirle a alguien que
 * falló la red sería mandarle a reintentar algo que no va a salir.
 */
export const MOTIVOS = Object.freeze({
  sinConfigurar: 'sin_configurar',
  correoEnUso: 'correo_en_uso',
  rechazado: 'rechazado',
  falloRed: 'fallo_red',
  credenciales: 'credenciales',
  sinConexion: 'sin_conexion',
  generico: 'generico',
  otroMetodo: 'otro_metodo',
})

/**
 * Qué frase de `copy.cuenta.error` toca para cada motivo al entrar, crear o
 * recuperar. `null` es no decir nada: cerrar la ventana de Google no es un
 * error. Vive aquí y no en una pantalla porque la leen Tu perfil y el
 * onboarding (SPEC_30), y `FormularioEntrar` la recibe por props.
 *
 * Las credenciales tienen dos frases (D-N8, SPEC_31): la pista nombra los
 * botones que hay en pantalla, y en web no hay botón de Apple
 * (`proveedoresDisponibles`).
 *
 * @param {string} motivo
 * @param {boolean} [nativa] - Existe para las pruebas.
 */
export function claveDeError(motivo, nativa = esNativa()) {
  if (motivo === MOTIVOS.rechazado) return null
  if (motivo === MOTIVOS.credenciales || motivo === MOTIVOS.correoEnUso) {
    return nativa ? 'credencialesNativa' : 'credenciales'
  }
  if (motivo === MOTIVOS.sinConexion) return 'sinConexion'
  if (motivo === MOTIVOS.otroMetodo) return 'otroMetodo'
  return 'generico'
}

/**
 * Los proveedores que se ofrecen en web (DP-19.4). Apple sale de la lista hasta
 * SPEC_21.2: en web pide un Service ID y una cuenta de desarrollador que todavía
 * no existen, y un botón que no puede funcionar es peor que su ausencia. P7 y
 * Tu perfil pintan sus botones desde aquí, así que volver a ofrecerlo es una
 * línea.
 */
export const PROVEEDORES_WEB = Object.freeze(['google'])

/**
 * Los de la app de iPhone (SPEC_21.2, DP-21.2.4): **Apple primero**, luego
 * Google, y el correo después de los dos. Entran por la hoja nativa
 * (`credencialNativa`), no por ventana emergente.
 */
export const PROVEEDORES_NATIVOS = Object.freeze(['apple', 'google'])

/**
 * Los proveedores que se ofrecen aquí, según dónde corre la app. En web, solo
 * Google (DP-21.2.2: Apple en web pide un Service ID y verificar el dominio);
 * en la app de iPhone, Apple y Google. P7, la vista de entrar y Tu perfil
 * pintan sus botones desde aquí.
 *
 * @param {boolean} [nativa] - Existe para las pruebas.
 */
export function proveedoresDisponibles(nativa = esNativa()) {
  return nativa ? PROVEEDORES_NATIVOS : PROVEEDORES_WEB
}

/**
 * ¿Es el correo que inventa Apple cuando alguien elige ocultar el suyo?
 * Tu cuenta no lo enseña (DP-21.2.6): dice que se entra con Apple.
 */
export function esCorreoOculto(correo) {
  return /@privaterelay\.appleid\.com$/i.test(String(correo ?? '').trim())
}

async function auth() {
  const { auth: instancia } = await import('@lib/firebase')
  return instancia ?? null
}

/** ¿Hay con qué crear una cuenta en esta instalación? */
export async function hayCuenta() {
  return (await auth()) !== null
}

function comoMotivo(error) {
  const codigo = String(error?.code ?? '')
  if (codigo === 'auth/email-already-in-use') return MOTIVOS.correoEnUso
  if (codigo === 'auth/wrong-password' || codigo === 'auth/invalid-credential') {
    return MOTIVOS.correoEnUso
  }
  if (codigo.includes('popup') || codigo.includes('cancelled')) return MOTIVOS.rechazado
  return MOTIVOS.falloRed
}

/**
 * Para entrar y recuperar: el mapeo de P7 (`comoMotivo`) no sirve aquí, porque
 * allí una contraseña que no coincide se cuenta como "ese correo ya existe" —es
 * lo que P7 puede ofrecer— y aquí es justo lo contrario: el correo existe, lo
 * que no coincide es la contraseña. `user-not-found` cae en lo mismo a
 * propósito, para no decir si un correo tiene cuenta.
 */
const CODIGOS_DE_CREDENCIALES = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-email',
])

/**
 * Para Google y Apple, con su propio mapeo (SPEC_21.2). El de P7 no sirve: allí
 * `invalid-credential` es una contraseña que no coincide, y aquí es un token
 * que Firebase no aceptó. Decirle a alguien que entró con Google «prueba con
 * tu contraseña de siempre» no tiene sentido. Lo que no se reconoce es
 * `generico`, nunca `falloRed`.
 */
const CANCELACIONES_WEB = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
])

function comoMotivoDeProveedor(error) {
  const codigo = String(error?.code ?? '')
  if (esCancelacion(error) || CANCELACIONES_WEB.has(codigo)) return MOTIVOS.rechazado
  if (codigo === 'auth/account-exists-with-different-credential') return MOTIVOS.otroMetodo
  if (codigo === 'auth/network-request-failed') return MOTIVOS.sinConexion
  return MOTIVOS.generico
}

function comoMotivoDeEntrada(error) {
  const codigo = String(error?.code ?? '')
  if (CODIGOS_DE_CREDENCIALES.has(codigo)) return MOTIVOS.credenciales
  if (codigo === 'auth/network-request-failed') return MOTIVOS.sinConexion
  return MOTIVOS.generico
}

/**
 * Entra con Google o con Apple.
 *
 * `nueva` dice si la cuenta se acaba de crear con este inicio de sesión. P7 lo
 * ignora; Tu perfil lo usa para decidir si hay algo que bajar antes de mudar
 * el árbol (`adoptarArbol` si es nueva, `entrarACuenta` si ya existía).
 *
 * **Solo cambia cómo se consigue la credencial** (SPEC_21.2 §4.2): en web, por
 * ventana emergente; en la app de iPhone, por la hoja nativa y
 * `signInWithCredential`. La sesión es en los dos casos la del SDK de
 * JavaScript, y la respuesta tiene la misma forma.
 *
 * @param {'apple'|'google'} cual
 * @param {object} [opciones]
 * @param {boolean} [opciones.nativa] - Existe para las pruebas.
 * @returns {Promise<{ok: boolean, uid?: string, email?: ?string, nueva?: boolean, motivo?: string}>}
 */
export async function entrarConProveedor(cual, { nativa = esNativa() } = {}) {
  const instancia = await auth()
  if (!instancia) return { ok: false, motivo: MOTIVOS.sinConfigurar }

  try {
    const { getAdditionalUserInfo, signInWithCredential, signInWithPopup } =
      await import('firebase/auth')
    let resultado
    if (nativa) {
      resultado = await signInWithCredential(instancia, await credencialNativa(cual))
    } else {
      const { appleProvider, googleProvider } = await import('@lib/firebase')
      resultado = await signInWithPopup(
        instancia,
        cual === 'apple' ? appleProvider : googleProvider,
      )
    }
    const { user } = resultado
    return {
      ok: true,
      uid: user.uid,
      email: user.email ?? null,
      nueva: getAdditionalUserInfo(resultado)?.isNewUser === true,
    }
  } catch (error) {
    return { ok: false, motivo: comoMotivoDeProveedor(error) }
  }
}

/**
 * Crea la cuenta con correo y contraseña.
 *
 * Si el correo ya existe, **se prueba a entrar con esa misma contraseña** antes
 * de decir nada: es literalmente lo que el copy propone ("prueba con tu
 * contraseña de siempre"), y hacerlo aquí ahorra escribirlo dos veces. Solo si
 * tampoco así se entra, el paso lo cuenta.
 *
 * `nueva` es `true` solo si la cuenta se creó aquí; si se entró a una que ya
 * existía, `false`. Mismo uso que en `entrarConProveedor`.
 */
export async function crearConCorreo(correo, contrasena) {
  const instancia = await auth()
  if (!instancia) return { ok: false, motivo: MOTIVOS.sinConfigurar }

  const { createUserWithEmailAndPassword, signInWithEmailAndPassword } =
    await import('firebase/auth')

  try {
    const { user } = await createUserWithEmailAndPassword(instancia, correo, contrasena)
    return { ok: true, uid: user.uid, email: user.email ?? null, nueva: true }
  } catch (error) {
    if (comoMotivo(error) !== MOTIVOS.correoEnUso) {
      return { ok: false, motivo: comoMotivo(error) }
    }
    try {
      const { user } = await signInWithEmailAndPassword(instancia, correo, contrasena)
      return { ok: true, uid: user.uid, email: user.email ?? null, nueva: false }
    } catch (segundo) {
      return { ok: false, motivo: comoMotivo(segundo) }
    }
  }
}

/**
 * Entra a una cuenta que ya existe, con correo y contraseña.
 *
 * **No crea nada** (SPEC_19 §0, punto 6): `crearConCorreo` crea la cuenta si el
 * correo no existe, y "entrar" con un correo mal escrito acabaría abriendo una
 * cuenta vacía a nombre de nadie.
 *
 * @returns {Promise<{ok: boolean, uid?: string, email?: ?string, motivo?: string}>}
 */
export async function entrarConCorreo(correo, contrasena) {
  const instancia = await auth()
  if (!instancia) return { ok: false, motivo: MOTIVOS.sinConfigurar }

  const { signInWithEmailAndPassword } = await import('firebase/auth')
  try {
    const { user } = await signInWithEmailAndPassword(instancia, correo, contrasena)
    return { ok: true, uid: user.uid, email: user.email ?? null }
  } catch (error) {
    return { ok: false, motivo: comoMotivoDeEntrada(error) }
  }
}

/**
 * Pide el enlace para elegir una contraseña nueva.
 *
 * **La respuesta es la misma exista o no la cuenta** (SPEC_19 §3.6): decir "ese
 * correo no tiene cuenta" es contarle a cualquiera qué correos la tienen. Por
 * eso `user-not-found`, `invalid-email` y cualquier otro tropiezo devuelven
 * `ok`; solo la falta de red y la de configuración se dicen, porque en esos
 * dos casos no salió nada y quien lo pidió tiene que saberlo.
 *
 * @returns {Promise<{ok: boolean, motivo?: string}>}
 */
export async function recuperarContrasena(correo) {
  const instancia = await auth()
  if (!instancia) return { ok: false, motivo: MOTIVOS.sinConfigurar }

  const { sendPasswordResetEmail } = await import('firebase/auth')
  try {
    // El correo sale en español si la plantilla de la consola lo tiene (§6).
    instancia.languageCode = 'es'
    await sendPasswordResetEmail(instancia, correo)
  } catch (error) {
    if (String(error?.code ?? '') === 'auth/network-request-failed') {
      return { ok: false, motivo: MOTIVOS.sinConexion }
    }
  }
  return { ok: true }
}

/** ¿Esta sesión entró con Google o con Apple? Sin poder saberlo, no. */
async function entroConProveedor(usuario) {
  try {
    const { metodoDeSesion } = await import('@lib/reautenticacion')
    const metodo = await metodoDeSesion(usuario)
    return metodo === 'google.com' || metodo === 'apple.com'
  } catch {
    return false
  }
}

/**
 * Cierra la sesión de Firebase. Sin configuración no hay nada que cerrar.
 *
 * **En la app de iPhone cierra también la del plugin** (DP-21.2.8), pero solo
 * si se entró con Google o con Apple: sin `GoogleService-Info.plist` el plugin
 * no configura Firebase, y su `signOut` cerraría la app; entrar con un
 * proveedor es la prueba de que el archivo estaba. Lo que dice si se entró así
 * se pregunta antes de cerrar, porque después ya no hay usuario. Si el cierre
 * del plugin falla, la salida sigue.
 *
 * @param {object} [opciones]
 * @param {boolean} [opciones.nativa] - Existe para las pruebas.
 */
export async function cerrarSesion({ nativa = esNativa() } = {}) {
  const instancia = await auth()
  if (!instancia) return
  const conProveedor = nativa && (await entroConProveedor(instancia.currentUser))
  const { signOut } = await import('firebase/auth')
  await signOut(instancia)
  if (conProveedor) await cerrarSesionNativa()
}

/**
 * Renombra el árbol al uid de la cuenta y anota el correo.
 *
 * Devuelve el uid con el que sigue la sesión. Si la mudanza falla —lo que
 * dejaría el árbol a medias— se devuelve el uid local: lo escrito sigue donde
 * estaba y la app continúa, que es lo que RN-EST-05 pide de un tropiezo de este
 * lado.
 */
export async function adoptarArbol(uidLocal, cuenta) {
  try {
    await mudarUid(uidLocal, cuenta.uid)
    await shared.saveAuthRecord(cuenta.uid, {
      uid: cuenta.uid,
      email: cuenta.email ?? null,
      phone: null,
    })
    return cuenta.uid
  } catch {
    return uidLocal
  }
}
