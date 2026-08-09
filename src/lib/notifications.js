// src/lib/notifications.js
// Permiso de avisos (P9).
//
// En el MVP los recordatorios son locales del dispositivo, no push (§8.12,
// Fase 1). Aquí solo se pide el permiso; programar los dos avisos del día es
// trabajo del módulo de notificaciones, que lee horaDespertar y horaDormir del
// perfil.
//
// Negar el permiso no rompe nada y no se vuelve a insistir: es una preferencia,
// no un requisito.

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * @returns {Promise<'granted'|'denied'|'default'|'unsupported'>}
 */
export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    // Safari antiguo usa callback en vez de promesa; se trata como negado
    return 'denied'
  }
}
