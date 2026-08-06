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
