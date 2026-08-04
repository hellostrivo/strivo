// src/lib/onboardingStorage.js
// Borrador local del onboarding (local-first, RN-02).
//
// Por qué localStorage y no IndexedDB: hasta P4 no existe todavía un userId,
// así que el perfil aún no se puede escribir con saveUserProfile() de @lib/db.
// Al cerrar el flujo completo (P11) el borrador se convierte en UserProfile
// y se guarda en IndexedDB. Mientras tanto, nada de lo escrito se pierde:
// cada paso persiste al instante y sin red.

const DRAFT_KEY = 'strivo.onboarding.draft'
const DONE_KEY  = 'strivo.onboarding.done'

export const emptyDraft = {
  motivos: [],           // P2  — de las opciones ofrecidas (0..N)
  motivosPropios: [],    // P2  — escritos por la persona (0..N)
  identidadCentral: '',  // P3  — frase sin el prefijo "Alguien que…"
  areas: [],             // P3B — tipos de área elegidos (0..N)
  identidadesArea: {},   // P3C — { [tipo]: texto sin prefijo }, opcional
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return { ...emptyDraft }
    return { ...emptyDraft, ...JSON.parse(raw) }
  } catch {
    // Si el almacenamiento no está disponible, el flujo sigue en memoria
    return { ...emptyDraft }
  }
}

export function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Persistir es best-effort: nunca puede interrumpir el flujo
  }
}

export function isOnboardingComplete() {
  try {
    return localStorage.getItem(DONE_KEY) === 'true'
  } catch {
    return false
  }
}

export function markOnboardingComplete() {
  try {
    localStorage.setItem(DONE_KEY, 'true')
  } catch {
    // Ver arriba
  }
}
