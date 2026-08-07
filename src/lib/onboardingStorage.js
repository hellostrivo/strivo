// src/lib/onboardingStorage.js
// Persistencia del onboarding (local-first, RN-02).
//
// Por qué localStorage y no IndexedDB: no existe todavía una cuenta, así que el
// perfil aún no se puede escribir con saveUserProfile() de @lib/db.
// Al cerrar el flujo completo (P11) el borrador se convierte en UserProfile
// y se guarda en IndexedDB. Mientras tanto, nada de lo escrito se pierde:
// cada paso persiste al instante y sin red.
//
// Excepción deliberada: lo que se escribe en P5 sí baja a IndexedDB en el
// momento (ver savePrimeraVictoria). Es el primer registro real de la persona
// y guardarlo es la promesa de esa pantalla; esperar a que haya cuenta la
// rompería.

import { saveVictory, getUserProfile, saveUserProfile } from '@lib/db'
import { normalizeGender } from '@lib/gender'
import { todayKey } from '@lib/timeSlot'
import { getCurrentUserId, getLocalUserId } from '@lib/user'

const DRAFT_KEY = 'strivo.onboarding.draft'
const DONE_KEY  = 'strivo.onboarding.done'

// Versión del esquema del onboarding (§1.4). Sube cuando cambia la numeración o
// la forma de las pantallas; un borrador de una versión anterior se migra al
// arrancar, en silencio y sin perder nada.
//   1 → orden original (P2 motivo, P3 identidad, P3B, P3C, P4 nombre)
//   2 → orden nuevo (P2 nombre, P2A género, P3 motivo, P4 identidad, P4B, P4C)
//   3 → P3 pregunta qué se busca: ids en vez de textos (§6.8)
export const ONBOARDING_SCHEMA_VERSION = 3

export const emptyDraft = {
  schemaVersion: ONBOARDING_SCHEMA_VERSION,
  nombre: '',               // P2  — opcional
  gender: null,             // P2A — null = sin respuesta → modo neutro (§2.2)
  reasons: [],              // P3  — ids de @lib/reasons (0..N)
  reasonOther: null,        // P3  — texto libre si se eligió "otro"; máx 80
  identidadCentral: '',     // P4  — frase sin el prefijo "Soy alguien que…"
  identidadCentralFuente: null, // P4 — 'chip:<id>' | 'libre' | null (§7.8)
  areas: [],                // P4B — tipos de área elegidos (0..N)
  identidadesArea: {},      // P4C — { [tipo]: texto sin prefijo }, opcional
  primeraVictoria: null,    // P5  — { texto, fecha } una vez guardada
  horaDespertar: '07:00',   // P6  — vienen puestas: seguir sin tocarlas es válido
  horaDormir: '23:00',      // P6
  habitosManana: [],        // P7  — [{ id, texto, areaId, momento }]
  habitosNoche: [],         // P8  — igual, con momento 'noche'
  recordatorios: null,      // P9  — { activos, permiso } una vez resuelto
  cuenta: null,             // P10 — { uid, correo, proveedor } si se creó
}

// Migración de un borrador de una versión anterior (§1.4).
//
// Se conserva lo capturado que sigue existiendo y se descarta el resto: los
// campos que ya no están en `emptyDraft` desaparecieron con su pantalla (los
// motivos viejos de P3, por ejemplo, eran textos y ahora son ids: no hay
// equivalencia que inventar). Cualquier rastro del paso en el que se quedó la
// sesión también se va: con la numeración nueva apuntaría al lugar equivocado.
//
// Es silenciosa a propósito: nadie ve un aviso de que algo cambió.
export function migrateDraft(guardado) {
  const previo   = guardado ?? {}
  const migrado  = { ...emptyDraft }

  for (const clave of Object.keys(emptyDraft)) {
    if (clave !== 'schemaVersion' && previo[clave] !== undefined) {
      migrado[clave] = previo[clave]
    }
  }

  return migrado
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return { ...emptyDraft }

    const guardado = JSON.parse(raw)
    if (guardado?.schemaVersion === ONBOARDING_SCHEMA_VERSION) {
      return { ...emptyDraft, ...guardado }
    }

    const migrado = migrateDraft(guardado)
    saveDraft(migrado)
    return migrado
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

// ─── P2A — el género ─────────────────────────────────────────────────────────
// Baja a IndexedDB en el momento de elegir, no al pulsar Continuar (§5.9): es
// el dato del que depende cómo le habla la app a la persona, y cerrar la
// pestaña entre una cosa y la otra no puede costarle volver a contestarlo.
//
// La fila del perfil todavía está a medias (solo userId y gender). No pasa nada:
// hasta P11 nadie la lee más que el motor de lenguaje, y P11 la completa.
export async function saveGenero(gender) {
  const userId   = getCurrentUserId()
  const anterior = await getUserProfile(userId)
  const perfil   = { ...(anterior ?? {}), userId, gender: normalizeGender(gender) }
  await saveUserProfile(perfil)
  return perfil
}

// ─── P5 — la primera cosa buena ──────────────────────────────────────────────
// Se guarda como Victory ya lograda (§7.2): es algo que pasó, no algo por hacer.
// areaId = null → "General", hereda la identidad central (§5.1.1).
//
// El id es determinista: volver atrás y guardar de nuevo actualiza la misma
// fila en vez de crear otra (criterio 3 — sincroniza después sin duplicarse).
export async function savePrimeraVictoria(texto) {
  const userId   = getLocalUserId()
  const victoria = {
    id:       `${userId}_primera`,
    userId,
    fecha:    todayKey(),
    texto,
    areaId:   null,
    estado:   'lograda',
    origen:   'onboarding',
    creadoEn: new Date().toISOString(),
  }
  await saveVictory(victoria)
  return victoria
}
