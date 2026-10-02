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

/**
 * Lo que puede salir mal, sin un solo código de error a la vista (RN-EST-04).
 *
 * Los cuatro primeros son los de P7 y no cambian. Los tres últimos son los de
 * entrar y recuperar desde Tu perfil (SPEC_19 §4): ahí sí importa distinguir
 * unas credenciales que no coinciden de una conexión caída, porque cada una
 * tiene su frase.
 */
export const MOTIVOS = Object.freeze({
  sinConfigurar: 'sin_configurar',
  correoEnUso: 'correo_en_uso',
  rechazado: 'rechazado',
  falloRed: 'fallo_red',
  credenciales: 'credenciales',
  sinConexion: 'sin_conexion',
  generico: 'generico',
})

/**
 * Los proveedores que se ofrecen en web (DP-19.4). Apple sale de la lista hasta
 * SPEC_21: en web pide un Service ID y una cuenta de desarrollador que todavía
 * no existen, y un botón que no puede funcionar es peor que su ausencia. P7 y
 * Tu perfil pintan sus botones desde aquí, así que volver a ofrecerlo es una
 * línea.
 */
export const PROVEEDORES_WEB = Object.freeze(['google'])

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
 * @returns {Promise<{ok: boolean, uid?: string, email?: ?string, nueva?: boolean, motivo?: string}>}
 */
export async function entrarConProveedor(cual) {
  const instancia = await auth()
  if (!instancia) return { ok: false, motivo: MOTIVOS.sinConfigurar }

  try {
    const [{ appleProvider, googleProvider }, { getAdditionalUserInfo, signInWithPopup }] =
      await Promise.all([import('@lib/firebase'), import('firebase/auth')])
    const proveedor = cual === 'apple' ? appleProvider : googleProvider
    const resultado = await signInWithPopup(instancia, proveedor)
    const { user } = resultado
    return {
      ok: true,
      uid: user.uid,
      email: user.email ?? null,
      nueva: getAdditionalUserInfo(resultado)?.isNewUser === true,
    }
  } catch (error) {
    return { ok: false, motivo: comoMotivo(error) }
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

/** Cierra la sesión de Firebase. Sin configuración no hay nada que cerrar. */
export async function cerrarSesion() {
  const instancia = await auth()
  if (!instancia) return
  const { signOut } = await import('firebase/auth')
  await signOut(instancia)
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
