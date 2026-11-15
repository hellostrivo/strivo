// src/lib/revocarApple.js
// Revocar el token de Iniciar sesión con Apple al borrar la cuenta
// (SPEC_24B, DP-24.11 camino (c); Apple, Guideline 5.1.1(v)).
//
// **La misma llamada que hace el SDK de Firebase para iOS**, hecha desde
// JavaScript: así hay una sola hoja de Apple y una sola sesión, la de
// JavaScript. Leído en `RevokeTokenRequest.swift` y `AuthBackend.swift` del
// SDK 12.19.3 (el que fija `Package.resolved`):
//
//   POST https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key=…
//   { providerId: "apple.com", tokenType: "3", token: <código>, idToken: <de la sesión> }
//
// `tokenType` va como la cadena `"3"` (`authorizationCode` en su enum), no
// como «CODE». La cabecera `X-Ios-Bundle-Identifier` es la que manda el SDK
// nativo, para que el servidor canjee el código con el identificador de la
// app. La preflight CORS desde `capacitor://localhost` contesta 200 y la
// acepta (comprobado el 15 nov 2026). Se usa la clave web, la que ya usa el
// WebView para entrar.
//
// **Por qué no el camino (a)**: el `revokeAccessToken` del plugin llama a
// `Auth.auth().revokeToken(withAuthorizationCode:)`, que sin un usuario en el
// SDK nativo —y con `skipNativeAuth: true` nunca lo hay— no contesta nunca. Y
// `revokeAccessToken` del SDK de JavaScript manda `ACCESS_TOKEN`, que no es lo
// que da la hoja nativa.
//
// El código caduca a los cinco minutos y sirve una vez: sale de la
// reautenticación de ese mismo borrado y no se guarda. Nada de esto va a
// ningún otro sitio que Firebase.

import { LIMITE_DE_RED_MS, conLimite } from './db/limite.js'

export const URL_DE_REVOCACION = 'https://identitytoolkit.googleapis.com/v2/accounts:revokeToken'

/** El identificador de la app (DP-21.3, no se toca nunca). */
export const BUNDLE_ID = 'com.hellostrivo.strivo'

/** El cuerpo exacto de la petición, como lo arma el SDK de iOS. */
export function cuerpoDeRevocacion(codigo, idToken) {
  return { providerId: 'apple.com', tokenType: '3', token: codigo, idToken }
}

/**
 * Revoca. Lanza si no se pudo: el borrado se detiene antes de tocar la nube
 * (D4, «No se borró nada»).
 *
 * @param {object} datos
 * @param {string} datos.codigo - el código de autorización de la hoja de Apple.
 * @param {string} datos.idToken - el de la sesión de JavaScript.
 * @param {string} datos.apiKey - la clave web de Firebase.
 * @param {object} [dobles] - Existen para las pruebas.
 */
export async function revocarApple(
  { codigo, idToken, apiKey },
  { pedir = (...args) => fetch(...args), limiteMs = LIMITE_DE_RED_MS } = {},
) {
  if (!codigo) throw new Error('Apple no devolvió el código de autorización.')
  if (!idToken || !apiKey) throw new Error('Falta la sesión para revocar.')
  const respuesta = await conLimite(
    pedir(`${URL_DE_REVOCACION}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ios-Bundle-Identifier': BUNDLE_ID,
      },
      body: JSON.stringify(cuerpoDeRevocacion(codigo, idToken)),
    }),
    limiteMs,
  )
  if (!respuesta?.ok) throw new Error(`La revocación no se aceptó (${respuesta?.status ?? '?'}).`)
  return true
}
