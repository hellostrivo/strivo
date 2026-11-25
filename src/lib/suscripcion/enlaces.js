// src/lib/suscripcion/enlaces.js
// Las direcciones de fuera que enseñan el muro y Tu perfil (SPEC_25), en un
// solo sitio. Se abren como enlaces normales: sin `allowNavigation`, Capacitor
// se las da al sistema.

/** La pantalla de suscripciones de Apple. */
export const URL_SUSCRIPCIONES = 'https://apps.apple.com/account/subscriptions'

/** Los Términos: el EULA estándar de Apple (DP-25.23). */
export const URL_TERMINOS = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'

/**
 * El aviso de privacidad (tarea A9). **Vacía mientras no exista**: el enlace
 * no se pinta y `ios:build` lo avisa. Hace falta antes de enviar a revisión.
 */
export const URL_PRIVACIDAD = ''
