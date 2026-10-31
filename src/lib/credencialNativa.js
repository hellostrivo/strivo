// src/lib/credencialNativa.js
// Google y Apple dentro de la app de iPhone (SPEC_21.2, DP-21.2.1).
//
// **El plugin solo consigue la credencial; la sesión es la de JavaScript.**
// `@capacitor-firebase/authentication` abre la hoja nativa de Google o de
// Apple y, con `skipNativeAuth: true`, devuelve el token sin abrir sesión en el
// SDK nativo de Firebase. Con ese token se construye aquí la credencial que
// `cuenta.js` y la reautenticación pasan a `signInWithCredential` o a
// `reauthenticateWithCredential`. Así hay una sola sesión —la que leen la cola,
// la restauración, las reglas de Firestore y el PIN—, y no dos que se separen.
//
// **El plugin se carga bajo demanda y solo desde aquí.** En web y en las
// pruebas no se importa nunca: su parte web es la única que toca `firebase`, y
// la del plugin pide la 12 mientras la app usa la 10 (ver el `overrides` de
// `package.json`). Que nadie más lo importe lo vigila una prueba.
//
// **El nombre no sale de aquí** (DP-21.2.5). En iOS el plugin pide siempre
// nombre y correo a Apple, y no hay forma de pedir solo el correo. Lo que Apple
// devuelva como nombre se queda en este módulo: el nombre lo da cada quien en
// P2, si quiere, y nunca lo decide la cuenta con la que entró.

/** Los dos proveedores nativos, por el nombre que usa la app y el de Firebase. */
export const PROVEEDOR_DE_FIREBASE = Object.freeze({ apple: 'apple.com', google: 'google.com' })

async function cargarPlugin() {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
  return FirebaseAuthentication
}

/**
 * ¿La persona cerró la hoja? Cancelar no es un error y no se dice nada.
 *
 * **Ninguna de las dos cancelaciones trae código**: el plugin solo traduce los
 * códigos de Firebase, y estas vienen de Apple y de Google. Lo único estable es
 * el mensaje, y por eso se miran dos patrones y nada más:
 *   - Apple: `ASAuthorizationError.canceled`, cuyo mensaje va traducido al
 *     idioma del teléfono pero conserva «AuthorizationError error 1001»;
 *   - Google: `GIDSignInError.canceled`, con un texto fijo en inglés.
 * Un rechazo con código nunca es una cancelación: ese lo explica su código.
 */
export function esCancelacion(error) {
  if (error?.code) return false
  const mensaje = String(error?.message ?? error ?? '')
  return /error 1001\b/.test(mensaje) || mensaje.includes('The user canceled the sign-in flow.')
}

/**
 * Lo único que se toma de la respuesta del plugin: el token y, con Apple, el
 * nonce en claro con el que se pidió. Ni el nombre, ni el correo, ni nada más.
 *
 * @param {'apple'|'google'} cual
 * @param {object} respuesta - lo que resuelve `signInWithApple` o `signInWithGoogle`.
 * @returns {{idToken: string, rawNonce?: string}}
 */
export function datosDeCredencial(cual, respuesta) {
  const idToken = respuesta?.credential?.idToken ?? null
  if (!idToken) throw new Error('El proveedor no devolvió un token.')
  if (cual === 'apple') {
    const rawNonce = respuesta.credential.nonce ?? null
    if (!rawNonce) throw new Error('Apple no devolvió el nonce.')
    return { idToken, rawNonce }
  }
  return { idToken }
}

/**
 * Abre la hoja de Google o de Apple y devuelve la credencial de Firebase.
 * Lanza lo que lance el plugin: quien llama decide si fue una cancelación
 * (`esCancelacion`) o un tropiezo.
 *
 * @param {'apple'|'google'} cual
 * @param {object} [dobles] - Existen para las pruebas.
 */
export async function credencialNativa(
  cual,
  { plugin = cargarPlugin, firebaseAuth = () => import('firebase/auth') } = {},
) {
  const [nativo, { GoogleAuthProvider, OAuthProvider }] = await Promise.all([
    plugin(),
    firebaseAuth(),
  ])
  if (cual === 'apple') {
    const datos = datosDeCredencial('apple', await nativo.signInWithApple({ skipNativeAuth: true }))
    return new OAuthProvider(PROVEEDOR_DE_FIREBASE.apple).credential(datos)
  }
  const { idToken } = datosDeCredencial(
    'google',
    await nativo.signInWithGoogle({ skipNativeAuth: true }),
  )
  return GoogleAuthProvider.credential(idToken)
}

/**
 * Cierra la sesión del SDK de Google en el teléfono (DP-21.2.8), para que la
 * próxima vez la hoja vuelva a preguntar con qué cuenta. **No borra la sesión
 * de Google del navegador del sistema**: esa cuenta puede seguir en la lista.
 * Con Apple no hay nada que cerrar: la hoja usa siempre el Apple ID del
 * teléfono.
 *
 * Nunca lanza: si falla, la salida sigue.
 */
export async function cerrarSesionNativa({ plugin = cargarPlugin } = {}) {
  try {
    await (await plugin()).signOut()
    return true
  } catch {
    return false
  }
}
