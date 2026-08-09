// src/lib/user.js
// Quién es el dueño de las filas locales.
//
// Strivo se usa antes de tener cuenta: P2A escribe el género y P7 y P8 crean
// hábitos reales. Todo eso se guarda bajo un id local que se genera solo. Si más
// tarde se crea cuenta (P10), el id de la cuenta pasa a ser el vigente y las
// filas escritas antes se reasignan (ver @lib/onboardingProfile). Nada de lo
// registrado sin cuenta se pierde ni se vuelve a pedir.

const LOCAL_KEY   = 'strivo.localUserId'
const ACCOUNT_KEY = 'strivo.accountUserId'

export function getLocalUserId() {
  try {
    const existing = localStorage.getItem(LOCAL_KEY)
    if (existing) return existing
    const id = `local-${newId()}`
    localStorage.setItem(LOCAL_KEY, id)
    return id
  } catch {
    // Sin almacenamiento no hay continuidad entre sesiones, pero la de ahora funciona
    return 'local'
  }
}

export function getAccountUserId() {
  try {
    return localStorage.getItem(ACCOUNT_KEY)
  } catch {
    return null
  }
}

export function setAccountUserId(uid) {
  try {
    localStorage.setItem(ACCOUNT_KEY, uid)
  } catch {
    // Persistir es best-effort: nunca puede interrumpir el flujo
  }
}

// El id con el que se escribe hoy: el de la cuenta si existe, el local si no.
export function getCurrentUserId() {
  return getAccountUserId() ?? getLocalUserId()
}

export function newId() {
  // randomUUID no existe en contextos no seguros (http en LAN, WebViews viejos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
