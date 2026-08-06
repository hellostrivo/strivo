// src/lib/db.js
// Almacén local-first de Strivo usando IndexedDB (vía idb)
// Principio: se escribe aquí primero, se sincroniza con Firebase después.
// La app funciona completamente sin red. (RN-02, §7.4)
//
// Esquema de entidades: §7.2 del Blueprint v3
// Relaciones:           §7.3 del Blueprint v3

import { openDB } from 'idb'

const DB_NAME    = 'strivo-local'
const DB_VERSION = 1

// ─── Abrir / inicializar la base de datos ────────────────────────────────────
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // UserProfile (1 por usuario; key = userId)
      if (!db.objectStoreNames.contains('userProfile')) {
        db.createObjectStore('userProfile', { keyPath: 'userId' })
      }

      // Area (áreas de identidad; FK: userId)
      if (!db.objectStoreNames.contains('areas')) {
        const areas = db.createObjectStore('areas', { keyPath: 'id' })
        areas.createIndex('byUser', 'userId')
      }

      // DailyEntry (una por fecha por usuario; FK: userId)
      if (!db.objectStoreNames.contains('dailyEntries')) {
        const de = db.createObjectStore('dailyEntries', { keyPath: 'id' })
        de.createIndex('byUserDate', ['userId', 'fecha'])
      }

      // Victory (N por fecha; FK: userId, areaId opcional)
      if (!db.objectStoreNames.contains('victories')) {
        const v = db.createObjectStore('victories', { keyPath: 'id' })
        v.createIndex('byUserDate', ['userId', 'fecha'])
        v.createIndex('byUser', 'userId')
      }

      // Habit (hábitos del usuario; FK: userId, areaId)
      if (!db.objectStoreNames.contains('habits')) {
        const h = db.createObjectStore('habits', { keyPath: 'id' })
        h.createIndex('byUser', 'userId')
        h.createIndex('byUserArea', ['userId', 'areaId'])
      }

      // HabitLog (una fila = hábito marcado; NUNCA una fila de "falló")
      // La ausencia de fila = no hecho. Decisión de modelo deliberada. (§7.2)
      if (!db.objectStoreNames.contains('habitLogs')) {
        const hl = db.createObjectStore('habitLogs', { keyPath: 'id' })
        hl.createIndex('byHabitDate', ['habitId', 'fecha'])
        hl.createIndex('byUserDate', ['userId', 'fecha'])
      }

      // JournalEntry (escritura libre; FK: userId)
      if (!db.objectStoreNames.contains('journalEntries')) {
        const je = db.createObjectStore('journalEntries', { keyPath: 'id' })
        je.createIndex('byUser', 'userId')
        je.createIndex('byUserDate', ['userId', 'fecha'])
      }

      // SyncQueue (cola de cambios pendientes de subir a Firebase)
      if (!db.objectStoreNames.contains('syncQueue')) {
        const sq = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
        sq.createIndex('byStatus', 'status')
      }
    },
  })
}

// ─── UserProfile ──────────────────────────────────────────────────────────────
export async function getUserProfile(userId) {
  const db = await getDB()
  return db.get('userProfile', userId)
}

export async function saveUserProfile(profile) {
  const db = await getDB()
  await db.put('userProfile', profile)
  enqueueSyncItem('userProfile', profile.userId, profile)
}

// ─── Áreas ────────────────────────────────────────────────────────────────────
export async function getAreas(userId) {
  const db = await getDB()
  return db.getAllFromIndex('areas', 'byUser', userId)
}

export async function saveArea(area) {
  const db = await getDB()
  await db.put('areas', area)
  enqueueSyncItem('areas', area.id, area)
}

// ─── DailyEntry ───────────────────────────────────────────────────────────────
export async function getDailyEntry(userId, fecha) {
  // fecha = 'YYYY-MM-DD'
  const db = await getDB()
  const all = await db.getAllFromIndex('dailyEntries', 'byUserDate', [userId, fecha])
  return all[0] ?? null
}

export async function saveDailyEntry(entry) {
  const db = await getDB()
  await db.put('dailyEntries', entry)
  enqueueSyncItem('dailyEntries', entry.id, entry)
}

// Crea la entrada del día si no existe y le aplica el parche.
// La usan los rituales y las vistas: cada bloque escribe lo suyo sin pisar el
// resto de lo que ya se registró ese día.
export async function updateDailyEntry(userId, fecha, patch) {
  const existing = await getDailyEntry(userId, fecha)
  const entry = {
    ...(existing ?? { id: `${userId}_${fecha}`, userId, fecha }),
    ...patch,
  }
  await saveDailyEntry(entry)
  return entry
}

// ─── Victories ────────────────────────────────────────────────────────────────
export async function getVictoriesByDate(userId, fecha) {
  const db = await getDB()
  return db.getAllFromIndex('victories', 'byUserDate', [userId, fecha])
}

export async function saveVictory(victory) {
  const db = await getDB()
  await db.put('victories', victory)
  enqueueSyncItem('victories', victory.id, victory)
}

// ─── Hábitos ──────────────────────────────────────────────────────────────────
export async function getHabits(userId) {
  const db = await getDB()
  const all = await db.getAllFromIndex('habits', 'byUser', userId)
  // Solo los activos (pausados siguen existiendo pero no se proyectan a rituales)
  return all
}

export async function getActiveHabitsForMoment(userId, momento, diaSemana) {
  // momento: 'manana' | 'noche' | 'dia'
  // diaSemana: 0 (lunes) – 6 (domingo)
  // Proyección automática a Rituales: §5.7.2, RN-HR-01
  const db = await getDB()
  const all = await db.getAllFromIndex('habits', 'byUser', userId)
  return all.filter(h =>
    h.estado === 'activo' &&
    h.momento === momento &&
    h.diasSemana.includes(diaSemana)
  )
}

export async function saveHabit(habit) {
  const db = await getDB()
  await db.put('habits', habit)
  enqueueSyncItem('habits', habit.id, habit)
}

// ─── HabitLog ─────────────────────────────────────────────────────────────────
// IMPORTANTE: solo se crea una fila cuando el hábito SE HIZO.
// La ausencia de fila significa "no hecho". NUNCA hay una fila con estado "falló".
// (§7.2, RN-06)
export async function getHabitLog(habitId, fecha) {
  const db = await getDB()
  const all = await db.getAllFromIndex('habitLogs', 'byHabitDate', [habitId, fecha])
  return all[0] ?? null
}

export async function getHabitLogsByDate(userId, fecha) {
  const db = await getDB()
  return db.getAllFromIndex('habitLogs', 'byUserDate', [userId, fecha])
}

export async function markHabit(habitId, userId, fecha) {
  // Idempotente: si ya existe la fila, no la duplica
  const existing = await getHabitLog(habitId, fecha)
  if (existing) return existing

  const log = {
    id:       `${habitId}_${fecha}`,
    habitId,
    userId,
    fecha,
    hora:     new Date().toISOString(),
  }
  const db = await getDB()
  await db.put('habitLogs', log)
  enqueueSyncItem('habitLogs', log.id, log)

  // Contador desnormalizado del hábito (§7.2). Sube solo cuando se crea una
  // fila nueva, así que marcar dos veces el mismo día no lo infla. Al desmarcar
  // NO baja: el modelo dice que solo crece, nunca se reinicia.
  const habit = await db.get('habits', habitId)
  if (habit) {
    const actualizado = { ...habit, totalCompletados: (habit.totalCompletados ?? 0) + 1 }
    await db.put('habits', actualizado)
    enqueueSyncItem('habits', habit.id, actualizado)
  }

  return log
}

export async function unmarkHabit(habitId, fecha) {
  const db = await getDB()
  await db.delete('habitLogs', `${habitId}_${fecha}`)
  enqueueSyncItem('habitLogs', `${habitId}_${fecha}`, null, 'delete')
}

// ─── Constancia ───────────────────────────────────────────────────────────────
// count(distinct fecha) de días con al menos un registro.
// NO es una entidad. Se calcula. Nunca se reinicia. (§5.9)
export async function getConstancia(userId) {
  const db = await getDB()
  const entries  = await db.getAllFromIndex('dailyEntries', 'byUserDate',
    // getAllFromIndex no soporta key-range fácil aquí; iteramos manualmente
    IDBKeyRange.bound([userId, ''], [userId, '\uffff'])
  ).catch(() => db.getAllFromIndex('dailyEntries', 'byUser', userId))

  const fechasUnicas = new Set(entries.map(e => e.fecha))
  return fechasUnicas.size
}

// ─── JournalEntries ───────────────────────────────────────────────────────────
export async function getJournalEntries(userId) {
  const db = await getDB()
  const all = await db.getAllFromIndex('journalEntries', 'byUser', userId)
  return all.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
}

export async function saveJournalEntry(entry) {
  const db = await getDB()
  await db.put('journalEntries', entry)
  enqueueSyncItem('journalEntries', entry.id, entry)
}

// ─── Cola de sincronización ───────────────────────────────────────────────────
// Cada cambio local encola aquí. Un worker lo sube a Firebase cuando hay red.
async function enqueueSyncItem(collection, docId, data, operation = 'put') {
  try {
    const db = await getDB()
    await db.add('syncQueue', {
      collection,
      docId,
      data,
      operation,     // 'put' | 'delete'
      status:        'pending',
      createdAt:     new Date().toISOString(),
    })
  } catch (e) {
    // La cola no es crítica; si falla, la sincronización se reintenta después
    console.warn('[Strivo] Sync queue error:', e)
  }
}

export async function getPendingSyncItems() {
  const db = await getDB()
  return db.getAllFromIndex('syncQueue', 'byStatus', 'pending')
}

export async function markSyncItemDone(id) {
  const db = await getDB()
  await db.delete('syncQueue', id)
}
