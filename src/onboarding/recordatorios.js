// src/onboarding/recordatorios.js
// P6 — los dos avisos del día, si se quieren.
//
// **Lo que este módulo hace y lo que todavía no.** Aquí se pide el permiso del
// navegador y se guarda la respuesta; **la entrega de los avisos a su hora no
// está construida**. Una PWA estática no puede despertar sola: para que un
// aviso llegue a las 07:00 hace falta push —servidor que lo envíe y service
// worker que lo reciba—, y en iOS además que la app esté instalada en la
// pantalla de inicio. Está anotado como deuda en CLAUDE.md y decidido así con
// el propietario del producto.
//
// **El permiso no es la preferencia.** Concederlo es dejar que la app pueda
// avisar; quererlo es otra cosa, y se guarda aparte en
// `preferences.remindersEnabled`. Sin esa distinción, apagar los avisos
// obligaría a ir a los ajustes del sistema a retirar un permiso.
//
// Ninguna salida de aquí es un error: ni el "no" del dispositivo, ni el
// dispositivo que no sabe hacerlo (RN-EST-04). Nada vibra y nada se pone en
// rojo.

/** Las cuatro situaciones posibles, y ninguna es un fallo. */
export const ESTADOS = Object.freeze({
  sinSoporte: 'sin_soporte',
  sinPedir: 'sin_pedir',
  concedido: 'concedido',
  denegado: 'denegado',
})

/** ¿Este dispositivo sabe mostrar avisos? */
export function haySoporte() {
  return typeof window !== 'undefined' && typeof window.Notification === 'function'
}

/** En qué situación está el permiso ahora mismo, sin pedir nada. */
export function estadoActual() {
  if (!haySoporte()) return ESTADOS.sinSoporte
  const permiso = window.Notification.permission
  if (permiso === 'granted') return ESTADOS.concedido
  if (permiso === 'denied') return ESTADOS.denegado
  return ESTADOS.sinPedir
}

/**
 * Pide el permiso y devuelve en qué quedó.
 *
 * Nunca lanza: un navegador que rechace la llamada deja el paso igual que un
 * "no", y quedarse con la pantalla rota por preguntar sería lo contrario de lo
 * que este paso es.
 */
export async function pedirPermiso() {
  if (!haySoporte()) return ESTADOS.sinSoporte
  try {
    const respuesta = await window.Notification.requestPermission()
    if (respuesta === 'granted') return ESTADOS.concedido
    if (respuesta === 'denied') return ESTADOS.denegado
    return ESTADOS.sinPedir
  } catch {
    return ESTADOS.denegado
  }
}

/** ¿Quedaron activados? Es lo que se guarda en las preferencias. */
export function quedanActivados(estado) {
  return estado === ESTADOS.concedido
}
