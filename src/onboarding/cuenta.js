// src/onboarding/cuenta.js
// P7 — crear la cuenta, y llevarse lo escrito con ella.
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

/** Lo que puede salir mal, sin un solo código de error a la vista (RN-EST-04). */
export const MOTIVOS = Object.freeze({
  sinConfigurar: 'sin_configurar',
  correoEnUso: 'correo_en_uso',
  rechazado: 'rechazado',
  falloRed: 'fallo_red',
})

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
 * Entra con Google o con Apple.
 * @returns {Promise<{ok: boolean, uid?: string, email?: ?string, motivo?: string}>}
 */
export async function entrarConProveedor(cual) {
  const instancia = await auth()
  if (!instancia) return { ok: false, motivo: MOTIVOS.sinConfigurar }

  try {
    const [{ appleProvider, googleProvider }, { signInWithPopup }] = await Promise.all([
      import('@lib/firebase'),
      import('firebase/auth'),
    ])
    const proveedor = cual === 'apple' ? appleProvider : googleProvider
    const { user } = await signInWithPopup(instancia, proveedor)
    return { ok: true, uid: user.uid, email: user.email ?? null }
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
 */
export async function crearConCorreo(correo, contrasena) {
  const instancia = await auth()
  if (!instancia) return { ok: false, motivo: MOTIVOS.sinConfigurar }

  const { createUserWithEmailAndPassword, signInWithEmailAndPassword } =
    await import('firebase/auth')

  try {
    const { user } = await createUserWithEmailAndPassword(instancia, correo, contrasena)
    return { ok: true, uid: user.uid, email: user.email ?? null }
  } catch (error) {
    if (comoMotivo(error) !== MOTIVOS.correoEnUso) {
      return { ok: false, motivo: comoMotivo(error) }
    }
    try {
      const { user } = await signInWithEmailAndPassword(instancia, correo, contrasena)
      return { ok: true, uid: user.uid, email: user.email ?? null }
    } catch (segundo) {
      return { ok: false, motivo: comoMotivo(segundo) }
    }
  }
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
