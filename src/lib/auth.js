// src/lib/auth.js
// Cuenta de Strivo (P10). La cuenta solo respalda y sincroniza: la app entera
// funciona sin ella (RN-07), así que todo aquí puede fallar sin consecuencias.
//
// Firebase se carga con import dinámico y no en el arranque. La primera
// pantalla de Strivo es el onboarding, no un formulario de acceso: cargar el
// SDK de autenticación por si acaso duplicaba el peso inicial de la app (173 kB
// → 364 kB) para algo que la mayoría no toca hasta el paso 12, si es que llega.
//
// Las funciones no lanzan: devuelven un resultado que la pantalla sabe leer.
//   { ok: true,  cuenta: { uid, correo, proveedor } }
//   { ok: false, motivo: 'cancelado' | 'correoExistente' | 'generico' }
// 'cancelado' (cerró la ventana del proveedor) no es un error y no se muestra.

import { getUserProfile } from '@lib/db'
import { getCurrentUserId } from '@lib/user'

export function isAuthAvailable() {
  return !!import.meta.env.VITE_FIREBASE_API_KEY
}

async function cargarAuth() {
  const [firebase, sdk] = await Promise.all([
    import('@lib/firebase'),
    import('firebase/auth'),
  ])
  return { ...firebase, ...sdk }
}

export async function signInWithGoogle() {
  return withProvider('google')
}

export async function signInWithApple() {
  return withProvider('apple')
}

async function withProvider(proveedor) {
  try {
    const { auth, googleProvider, appleProvider, signInWithPopup } = await cargarAuth()
    if (!auth) return unavailable()

    const provider = proveedor === 'google' ? googleProvider : appleProvider
    const { user } = await signInWithPopup(auth, provider)
    return { ok: true, cuenta: { uid: user.uid, correo: user.email ?? '', proveedor } }
  } catch (error) {
    return fail(error)
  }
}

// Si el correo ya existe se intenta entrar con él: la persona quiere su cuenta,
// no un aviso de que se equivocó de puerta.
export async function createAccountWithEmail(correo, contrasena) {
  let sdk
  try {
    sdk = await cargarAuth()
  } catch (error) {
    return fail(error)
  }
  const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = sdk
  if (!auth) return unavailable()

  try {
    const { user } = await createUserWithEmailAndPassword(auth, correo, contrasena)
    return { ok: true, cuenta: cuentaDesde(user, correo) }
  } catch (error) {
    if (error?.code !== 'auth/email-already-in-use') return fail(error)

    try {
      const { user } = await signInWithEmailAndPassword(auth, correo, contrasena)
      return { ok: true, cuenta: cuentaDesde(user, correo) }
    } catch {
      // Existe, pero la contraseña no coincide
      return { ok: false, motivo: 'correoExistente' }
    }
  }
}

function cuentaDesde(user, correo) {
  return { uid: user.uid, correo: user.email ?? correo, proveedor: 'correo' }
}

// ─── Volver a entrar con la cuenta (§07.D.5) ─────────────────────────────────
// Lo usa el PIN del Journal cuando alguien lo olvida. No es "hay sesión
// guardada, pasa": es completar el flujo del proveedor AHORA. Si bastara con la
// sesión, cualquiera con el teléfono desbloqueado se saltaría el PIN sin más, y
// entonces el PIN no protegería nada.
//
// Nunca sale de aquí el PIN, ni su huella, ni su sal: esto solo habla con
// Firebase de la cuenta, y de la cuenta nada más.

/** La cuenta que se creó en P10, tal como quedó guardada en el perfil local. */
export async function cuentaVinculada() {
  try {
    const perfil = await getUserProfile(getCurrentUserId())
    const cuenta = perfil?.cuenta
    return cuenta?.uid ? cuenta : null
  } catch {
    return null
  }
}

/**
 * Por dónde puede volver a entrar esta persona, o null si por ningún lado.
 *
 * null significa que no se le puede ofrecer un PIN: sin forma de recuperarlo,
 * ponerlo sería tenderle una trampa (§07.D.5, caso sin cuenta remota).
 *
 * Se lee del perfil y no de `auth.currentUser` a propósito: la sesión de
 * Firebase puede haberse ido —caduca, se limpia el navegador— y eso no puede
 * dejar a nadie sin camino de vuelta. Lo que importa es qué cuenta es suya; que
 * haya sesión o no lo resuelve `reautenticar`.
 */
export async function metodoDeRecuperacion() {
  if (!isAuthAvailable()) return null

  const cuenta = await cuentaVinculada()
  if (!cuenta) return null

  const { uid, correo, proveedor } = cuenta
  if (proveedor === 'correo') {
    return correo ? { via: 'correo', correo, uid } : null
  }
  if (proveedor === 'google' || proveedor === 'apple') {
    return { via: proveedor, correo: correo || null, uid }
  }
  return null
}

/**
 * El enlace de restablecimiento de contraseña de Firebase, para quien también
 * olvidó la contraseña de su cuenta. Es el método nativo del SDK: no hay
 * sistema de códigos propio ni backend nuevo.
 *
 * Por el correo viaja lo que manda Firebase y nada más. El PIN no se envía.
 */
export async function enviarEnlaceDeRestablecimiento(correo) {
  let sdk
  try {
    sdk = await cargarAuth()
  } catch (error) {
    return fail(error)
  }
  const { auth, sendPasswordResetEmail } = sdk
  if (!auth) return unavailable()

  try {
    await sendPasswordResetEmail(auth, correo)
    return { ok: true }
  } catch (error) {
    return fail(error)
  }
}

/**
 * Completar el flujo de la cuenta ahora mismo.
 *
 * Con sesión viva se usa `reauthenticate*`, que es lo que el SDK entiende por
 * "acaba de identificarse". Sin sesión se entra de cero y se comprueba que el
 * uid es el de esta cuenta: entrar con otra no vale para desbloquear este
 * journal.
 *
 *   { ok: true } | { ok: false, motivo: 'cancelado' | 'credenciales' |
 *                                        'otraCuenta' | 'generico' }
 */
export async function reautenticar(metodo, { contrasena } = {}) {
  let sdk
  try {
    sdk = await cargarAuth()
  } catch (error) {
    return fail(error)
  }
  const { auth } = sdk
  if (!auth) return unavailable()

  try {
    const actual = auth.currentUser
    const mismaCuenta = actual?.uid === metodo.uid

    if (metodo.via === 'correo') {
      const {
        EmailAuthProvider,
        reauthenticateWithCredential,
        signInWithEmailAndPassword,
      } = sdk

      if (mismaCuenta) {
        await reauthenticateWithCredential(
          actual,
          EmailAuthProvider.credential(metodo.correo, contrasena)
        )
        return { ok: true }
      }

      const { user } = await signInWithEmailAndPassword(auth, metodo.correo, contrasena)
      return user.uid === metodo.uid ? { ok: true } : { ok: false, motivo: 'otraCuenta' }
    }

    const {
      GoogleAuthProvider,
      OAuthProvider,
      reauthenticateWithPopup,
      signInWithPopup,
    } = sdk

    // Providers nuevos y no los compartidos del módulo: a Google se le pide que
    // enseñe el selector de cuenta en vez de resolver solo con la que ya está
    // abierta. Volver a entrar tiene que ser un acto, no un trámite invisible.
    let provider
    if (metodo.via === 'google') {
      provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
    } else {
      // Apple ignora `prompt`; su pantalla siempre pide confirmación
      provider = new OAuthProvider('apple.com')
    }

    if (mismaCuenta) {
      await reauthenticateWithPopup(actual, provider)
      return { ok: true }
    }

    const { user } = await signInWithPopup(auth, provider)
    return user.uid === metodo.uid ? { ok: true } : { ok: false, motivo: 'otraCuenta' }
  } catch (error) {
    const code = error?.code ?? ''
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { ok: false, motivo: 'cancelado' }
    }
    if (CREDENCIALES_QUE_NO_SON.has(code)) {
      return { ok: false, motivo: 'credenciales' }
    }
    if (code === 'auth/user-mismatch') return { ok: false, motivo: 'otraCuenta' }
    return fail(error)
  }
}

// La contraseña no es la de esa cuenta. Firebase reparte el mismo caso entre
// varios códigos según la versión y según si la protección de enumeración de
// correos está activada.
const CREDENCIALES_QUE_NO_SON = new Set([
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/user-not-found',
])

function unavailable() {
  console.warn('[Strivo] Firebase no configurado: la cuenta no se puede crear ahora')
  return { ok: false, motivo: 'generico' }
}

function fail(error) {
  const code = error?.code ?? ''
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return { ok: false, motivo: 'cancelado' }
  }
  // El código nunca llega a la interfaz (criterio 5): solo a la consola
  console.warn('[Strivo] Auth:', code || error)
  return { ok: false, motivo: 'generico' }
}
