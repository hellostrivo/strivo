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
import { credencialNativa } from '@lib/credencialNativa'

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
 * @param {object} usuario - `auth.currentUser`.
 * @param {'google.com'|'apple.com'} metodo
 * @param {object} [opciones]
 * @param {{appleProvider: object, googleProvider: object}} [opciones.proveedores] -
 *   los de `lib/firebase`, si quien llama ya los cargó; si no, se cargan aquí.
 * @param {boolean} [opciones.nativa] - Existe para las pruebas.
 */
export async function reautenticarConProveedor(
  usuario,
  metodo,
  { proveedores, nativa = esNativa() } = {},
) {
  const firebaseAuth = await import('firebase/auth')
  if (nativa) {
    const credencial = await credencialNativa(metodo === 'apple.com' ? 'apple' : 'google')
    await firebaseAuth.reauthenticateWithCredential(usuario, credencial)
    return
  }
  const { appleProvider, googleProvider } = proveedores ?? (await import('./firebase.js'))
  await firebaseAuth.reauthenticateWithPopup(
    usuario,
    metodo === 'apple.com' ? appleProvider : googleProvider,
  )
}
