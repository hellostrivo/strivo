// src/lib/onboardingProfile.js
// Convierte el borrador del onboarding en las entidades reales de §7.2:
// UserProfile + Area(s) + Habit(s). Ocurre al llegar a P11.
//
// Todo se escribe con id determinista, así que volver atrás y llegar otra vez
// actualiza las mismas filas en vez de duplicarlas (criterio 3).
//
// Si en P10 se creó cuenta, el id de la cuenta pasa a ser el vigente y lo que
// se escribió antes bajo el id local se reasigna: la Victory de P5 sigue siendo
// suya, con su fecha, sin pedir nada otra vez.

import { getDB, saveUserProfile, saveArea, saveHabit } from '@lib/db'
import { getLocalUserId, setAccountUserId } from '@lib/user'
import { normalizeGender } from '@lib/gender'
import { AREAS } from '@lib/areas'

const TODOS_LOS_DIAS = [0, 1, 2, 3, 4, 5, 6]
const DIA_TERMINA_A  = '03:00'

// Stores cuyas filas llevan userId. Antes de P10 solo puede existir la Victory
// de P5, pero la lista está completa para cuando el registro llegue más tarde.
const STORES_CON_USUARIO = [
  'victories',
  'dailyEntries',
  'habits',
  'habitLogs',
  'journalEntries',
]

const areaRowId = (userId, tipo) => `${userId}_area_${tipo}`

export async function finishOnboarding(draft) {
  const localUserId = getLocalUserId()
  const uid         = draft.cuenta?.uid ?? null
  const userId      = uid ?? localUserId

  if (uid) {
    setAccountUserId(uid)
    await reasignarFilas(localUserId, uid)
    // El perfil se vuelve a escribir entero unas líneas más abajo bajo el id de
    // la cuenta. Lo que se borra aquí es la fila a medias que P2A dejó bajo el
    // id local: su clave es el userId, así que no se reasigna sola.
    await borrarPerfilLocal(localUserId)
  }

  await saveUserProfile(perfilDesde(draft, userId))

  for (const tipo of draft.areas) {
    await saveArea(areaDesde(draft, userId, tipo))
  }

  for (const habito of [...draft.habitosManana, ...draft.habitosNoche]) {
    await saveHabit(habitoDesde(habito, userId))
  }

  return userId
}

function perfilDesde(draft, userId) {
  const ahora = new Date().toISOString()
  return {
    userId,
    nombre:           draft.nombre,
    // Lo contestado en P2A. Se guarda tal cual; `genderMode` no se persiste
    // porque se deriva (§2.2) y guardarlo duplicaría la fuente de verdad.
    gender:           normalizeGender(draft.gender),
    identidadCentral: draft.identidadCentral,
    // El historial arranca con la primera versión abierta (§5.1.1): editar la
    // identidad cierra esta entrada y abre otra, nunca sobrescribe.
    identidadCentralHistorial: [
      { texto: draft.identidadCentral, desde: ahora, hasta: null },
    ],
    horaDespertar: draft.horaDespertar,
    horaDormir:    draft.horaDormir,
    diaTerminaA:   DIA_TERMINA_A,
    // Lo que se vino a buscar (§6.8): ids de @lib/reasons, y el texto libre
    // aparte. Guardar el id y no la etiqueta permite reescribir el copy sin
    // tocar los perfiles ya guardados.
    reasons:       [...draft.reasons],
    reasonOther:   draft.reasonOther?.trim() || null,
    recordatorios: draft.recordatorios ?? { activos: false, permiso: 'default' },
    cuenta:        draft.cuenta ?? null,
    creadoEn:      ahora,
  }
}

function areaDesde(draft, userId, tipo) {
  const area = AREAS.find(a => a.tipo === tipo)
  return {
    id:     areaRowId(userId, tipo),
    userId,
    tipo,
    nombre: area?.nombre ?? tipo,
    color:  area?.color,
    identidadArea: draft.identidadesArea[tipo] ?? null,
    estado: 'activa',
  }
}

function habitoDesde(habito, userId) {
  return {
    id:     `${userId}_habito_${habito.id}`,
    userId,
    nombre: habito.texto,
    // areaId apunta a la fila del área; null = "General" (§5.1.1)
    areaId: habito.areaId ? areaRowId(userId, habito.areaId) : null,
    momento: habito.momento,
    diasSemana: TODOS_LOS_DIAS,
    estado: 'activo',
    totalCompletados: 0,
    origen: 'onboarding',
  }
}

async function borrarPerfilLocal(localUserId) {
  const db = await getDB()
  await db.delete('userProfile', localUserId)
}

// Mueve las filas del id local al id de la cuenta. Se hace con transacción por
// store y no con las funciones de @lib/db porque hay que borrar la fila vieja:
// el id la contiene y quedaría apuntando a un dueño que ya no existe.
async function reasignarFilas(desde, hacia) {
  if (desde === hacia) return
  const db = await getDB()

  for (const store of STORES_CON_USUARIO) {
    const tx    = db.transaction(store, 'readwrite')
    const filas = await tx.store.getAll()

    for (const fila of filas) {
      if (fila.userId !== desde) continue
      await tx.store.delete(fila.id)
      await tx.store.put({
        ...fila,
        id: String(fila.id).replace(desde, hacia),
        userId: hacia,
      })
    }
    await tx.done
  }
  // La cola de sincronización conserva las entradas con el id viejo. Todavía no
  // hay worker que las suba; cuando lo haya, tendrá que reasignarlas también.
}
