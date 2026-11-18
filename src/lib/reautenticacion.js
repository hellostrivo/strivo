// src/lib/reautenticacion.js
// Volver a demostrar que la cuenta es tuya, con Google o con Apple
// (SPEC_21.2 §4.6).
//
// **Vive en `lib/` y no en `diario/`** porque tiene dos consumidores: el PIN
// del Journal hoy («Olvidé mi PIN») y el borrado de la cuenta en SPEC_24, que
// no puede pedir solo la contraseña a quien nunca tuvo una.
//
// **El método es el de esta sesión, no el primero de la lista.** Una cuenta
// puede tener más de un método y `providerData` no garantiza el orden: se mira
// con qué se entró, que es lo que dice el token (`signInProvider`).

import { esNativa } from '@lib/plataforma'
import { credencialNativa, esCancelacion } from '@lib/credencialNativa'

/**
 * Con qué se entró en esta sesión: `password`, `google.com`, `apple.com`… o
 * `null` sin usuario. Si el token está vencido lo renueva, y eso pide red: el
 * error se deja pasar, porque quien pregunta va a necesitar la red de todos
 * modos.
 */
export async function metodoDeSesion(usuario) {
  if (!usuario) return null
  const { signInProvider } = await usuario.getIdTokenResult()
  return signInProvider ?? null
}

/**
 * Reautentica con Google o con Apple. En web, por ventana emergente como
 * siempre; en la app de iPhone, con la hoja nativa y la credencial que
 * devuelve. Lanza lo que lance Firebase o el plugin: quien llama lo traduce.
 *
 * Con `conCodigo` y Apple en la app de iPhone (solo el borrado, SPEC_24)
 * devuelve `{ codigo }`: el código de autorización de esa misma hoja, para
 * revocar el token de Apple. Si no, no devuelve nada.
 *
 * @param {object} usuario - `auth.currentUser`.
 * @param {'google.com'|'apple.com'} metodo
 * @param {object} [opciones]
 * @param {{appleProvider: object, googleProvider: object}} [opciones.proveedores] -
 *   los de `lib/firebase`, si quien llama ya los cargó; si no, se cargan aquí.
 * @param {boolean} [opciones.nativa] - Existe para las pruebas.
 * @param {boolean} [opciones.conCodigo]
 */
export async function reautenticarConProveedor(
  usuario,
  metodo,
  { proveedores, nativa = esNativa(), conCodigo = false } = {},
) {
  const firebaseAuth = await import('firebase/auth')
  if (nativa) {
    const apple = metodo === 'apple.com'
    if (apple && conCodigo) {
      const { credencial, codigo } = await credencialNativa('apple', { conCodigo: true })
      await firebaseAuth.reauthenticateWithCredential(usuario, credencial)
      return { codigo }
    }
    const credencial = await credencialNativa(apple ? 'apple' : 'google')
    await firebaseAuth.reauthenticateWithCredential(usuario, credencial)
    return undefined
  }
  const { appleProvider, googleProvider } = proveedores ?? (await import('./firebase.js'))
  await firebaseAuth.reauthenticateWithPopup(
    usuario,
    metodo === 'apple.com' ? appleProvider : googleProvider,
  )
  return undefined
}

// ─── Reautenticar la cuenta, sin el PIN (SPEC_24, DP-24.18) ────────────────
//
// Vivía en `diario/pin.js` como `reautenticar`, que empieza preguntando al PIN
// si hay método de recuperación. El borrado de la cuenta necesita lo mismo sin
// esa pregunta, así que la lógica salió aquí y el PIN la llama después de
// hacer la suya. El PIN no cambió lo que hace.

/** Contraseña que no coincide: los tres códigos con que Firebase lo dice. */
const CODIGOS_DE_CREDENCIALES = new Set([
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
])

/** Cerrar la ventana emergente de Google o de Apple, en web. */
const CODIGOS_DE_CANCELACION = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
])

/** La cuenta ya no existe (SPEC_24, DP-24.13): lo que dice Firebase de un usuario borrado. */
const CODIGOS_DE_CUENTA_INEXISTENTE = new Set(['auth/user-not-found', 'auth/user-token-expired'])

/**
 * Lo que puede salir mal al reautenticar, sin un solo código a la vista
 * (RN-EST-04). Qué es cancelar la hoja nativa lo sabe `credencialNativa`.
 */
export function motivoDeReautenticacion(error) {
  const codigo = String(error?.code ?? '')
  if (CODIGOS_DE_CANCELACION.has(codigo) || esCancelacion(error)) return 'cancelado'
  if (CODIGOS_DE_CREDENCIALES.has(codigo)) return 'credenciales'
  if (codigo === 'auth/network-request-failed') return 'sin-conexion'
  if (CODIGOS_DE_CUENTA_INEXISTENTE.has(codigo)) return 'sin-cuenta'
  return 'no-verificado'
}

/**
 * Vuelve a demostrar que la cuenta de esta sesión es tuya, con el método con
 * el que se entró: la contraseña, o la hoja de Google o de Apple.
 *
 * Con correo y sin contraseña devuelve `pide-contrasena`, y la pantalla pide el
 * campo. **La contraseña no se guarda en ningún sitio**: se usa aquí y se
 * olvida.
 *
 * @param {object} [opciones]
 * @param {string} [opciones.contrasena]
 * @param {boolean} [opciones.conCodigoDeApple] - el borrado: con Apple en el
 *   iPhone, devuelve también el código para revocar.
 * @returns {Promise<{ok: boolean, motivo?: string, metodo?: ?string, codigo?: ?string}>}
 */
export async function reautenticarCuenta({ contrasena, conCodigoDeApple = false } = {}) {
  try {
    const [
      { auth, appleProvider, googleProvider },
      { EmailAuthProvider, reauthenticateWithCredential },
    ] = await Promise.all([import('./firebase.js'), import('firebase/auth')])

    const usuario = auth?.currentUser ?? null
    if (!usuario) return { ok: false, motivo: 'sin-sesion', metodo: null }

    const metodo = await metodoDeSesion(usuario)
    if (metodo === 'password') {
      if (!contrasena) return { ok: false, motivo: 'pide-contrasena', metodo }
      await reauthenticateWithCredential(
        usuario,
        EmailAuthProvider.credential(usuario.email, contrasena),
      )
      return { ok: true, metodo }
    }

    const r = await reautenticarConProveedor(usuario, metodo, {
      proveedores: { appleProvider, googleProvider },
      conCodigo: conCodigoDeApple && metodo === 'apple.com',
    })
    return r?.codigo !== undefined ? { ok: true, metodo, codigo: r.codigo } : { ok: true, metodo }
  } catch (error) {
    return { ok: false, motivo: motivoDeReautenticacion(error) }
  }
}
