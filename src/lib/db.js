// src/lib/db.js
// Almacén local-first de Strivo usando IndexedDB (vía idb)
// Principio: se escribe aquí primero, se sincroniza con Firebase después.
// La app funciona completamente sin red. (RN-02, §7.4)
//
// Esquema de entidades: §7.2 del Blueprint v3
// Relaciones:           §7.3 del Blueprint v3

import { openDB } from 'idb'
import { areasActivas, cabeOtraArea, LimiteDeAreasError } from '@lib/areas'

const DB_NAME    = 'strivo-local'
// 1 → esquema inicial (§7.2)
// 2 → UserProfile.gender (§2.2 del documento de cambios): lenguaje adaptativo
// 3 → appFlags: banderas del dispositivo, no del usuario (§3.3, hasSeenIntro)
// 4 → se retira lo que capturaba P5, que ya no existe (§14.4)
// 5 → se deduplican las marcas de hábito y se recalcula su contador (§26.3)
const DB_VERSION = 5

// ─── Abrir / inicializar la base de datos ────────────────────────────────────
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, { upgrade: upgradeSchema })
}

// Se exporta para poder probar las migraciones contra una base desechable, sin
// tocar la del navegador (ver tests/genero.test.js).
export function upgradeSchema(db, oldVersion, newVersion, tx) {
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

  // AppFlag (banderas de este dispositivo: si ya se vio la apertura, etc.)
  // No llevan userId: describen la instalación, no a la persona.
  if (!db.objectStoreNames.contains('appFlags')) {
    db.createObjectStore('appFlags', { keyPath: 'key' })
  }

  // v2 — los perfiles escritos antes de P2A no tienen `gender`. Se les pone
  // null explícito: la app lee esa ausencia como "sin respuesta" y usa la
  // variante neutra (§2.2). Nadie tiene que volver a contestar nada.
  if (oldVersion > 0 && oldVersion < 2) {
    const perfiles = tx.objectStore('userProfile')
    perfiles.openCursor().then(function siguiente(cursor) {
      if (!cursor) return
      if (cursor.value.gender === undefined) {
        cursor.update({ ...cursor.value, gender: null })
      }
      return cursor.continue().then(siguiente)
    })
  }

  // v4 — P5 pedía una primera cosa buena antes de que existiera cuenta y la
  // guardaba como Victory con `origen: 'onboarding'`. La pantalla se retiró
  // (§14) y con ella el dato: dejar filas de una pantalla que ya no existe
  // sería arrastrar un campo muerto por el resto del desarrollo.
  //
  // Solo se borra lo que escribió esa pantalla. Todo lo demás que haya en
  // `victories` es de la persona y no se toca.
  if (oldVersion > 0 && oldVersion < 4) {
    const victorias = tx.objectStore('victories')
    victorias.openCursor().then(function siguiente(cursor) {
      if (!cursor) return
      if (cursor.value.origen === 'onboarding') cursor.delete()
      return cursor.continue().then(siguiente)
    })
  }

  // v5 — el contador de cada hábito iba por ×5 (§26). Se rehace desde los
  // registros, que son la verdad: un hábito se ha hecho tantos días como marcas
  // distintas tiene.
  //
  // Dos cosas, en este orden:
  //   1. Si hubiera dos marcas del mismo hábito y día, se conserva la primera.
  //      Con la clave actual (`habitId_fecha`) eso no puede pasar, pero podría
  //      llegar de la sincronización, así que la migración lo contempla.
  //   2. `totalCompletados` pasa a ser el número de marcas que quedan.
  //
  // Esto NO toca la Constancia: se calcula sobre `dailyEntries` y cuenta días
  // con actividad, no marcas de hábito (RN-06). Deduplicar aquí no puede
  // reiniciar la constancia de nadie.
  if (oldVersion > 0 && oldVersion < 5) {
    const logs    = tx.objectStore('habitLogs')
    const habitos = tx.objectStore('habits')
    const vistos  = new Set()
    const porHabito = new Map()

    logs.openCursor().then(function siguiente(cursor) {
      if (!cursor) {
        // Ya se sabe cuántos días quedan por hábito: se escribe el contador
        return habitos.openCursor().then(function siguienteHabito(cursorHabito) {
          if (!cursorHabito) return
          const dias = porHabito.get(cursorHabito.value.id) ?? 0
          if (cursorHabito.value.totalCompletados !== dias) {
            cursorHabito.update({ ...cursorHabito.value, totalCompletados: dias })
          }
          return cursorHabito.continue().then(siguienteHabito)
        })
      }

      const { habitId, fecha } = cursor.value
      const pareja = `${habitId}__${fecha}`

      if (vistos.has(pareja)) {
        cursor.delete()
      } else {
        vistos.add(pareja)
        porHabito.set(habitId, (porHabito.get(habitId) ?? 0) + 1)
      }

      return cursor.continue().then(siguiente)
    })
  }
}

// ─── Banderas del dispositivo ─────────────────────────────────────────────────
// Lo que sabe esta instalación, no lo que sabe la persona: si ya se vio la
// apertura, por ejemplo. No se sincronizan ni entran en la cola de subida.
export async function getFlag(key, porDefecto = null) {
  try {
    const db   = await getDB()
    const fila = await db.get('appFlags', key)
    return fila ? fila.value : porDefecto
  } catch {
    // Sin almacén, la app sigue: la bandera vale su valor por defecto
    return porDefecto
  }
}

export async function setFlag(key, value) {
  try {
    const db = await getDB()
    await db.put('appFlags', { key, value })
  } catch {
    // Guardar una bandera nunca puede interrumpir nada
  }
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

// El máximo de 3 áreas activas se valida aquí y no solo en la interfaz (§8.5-bis):
// ninguna ruta de escritura puede dejar un perfil con cuatro. Pausar o archivar
// nunca se rechaza —soltar un área siempre tiene que ser posible— y lo que se
// escribe conserva su identidad de área, sus hábitos y su historial.
export async function saveArea(area) {
  if (area.estado === 'activa') {
    const yaActivas = areasActivas(await getAreas(area.userId))
      .filter(otra => otra.id !== area.id)

    if (!cabeOtraArea(yaActivas.length)) throw new LimiteDeAreasError()
  }

  const db = await getDB()
  await db.put('areas', area)
  enqueueSyncItem('areas', area.id, area)
}

// Las identidades por área de una persona, con el `id` interno del área como
// clave (§10.15: el `profile.areaIdentities` de la especificación). Se leen de
// las filas de área, que es donde viven, e incluyen las de las áreas inactivas:
// soltar un área no borra lo que se escribió sobre ella.
export async function getAreaIdentities(userId) {
  const areas = await getAreas(userId)
  return Object.fromEntries(areas.map(area => [area.tipo, area.identidadArea ?? null]))
}

// ─── DailyEntry ───────────────────────────────────────────────────────────────
export async function getDailyEntry(userId, fecha) {
  // fecha = 'YYYY-MM-DD'
  const db = await getDB()
  const all = await db.getAllFromIndex('dailyEntries', 'byUserDate', [userId, fecha])
  return all[0] ?? null
}

// Todas las entradas de un usuario entre dos fechas (rango inclusivo).
// La usa el Historial para pintar un mes de una sola lectura.
export async function getDailyEntriesInRange(userId, desde, hasta) {
  const db = await getDB()
  return db.getAllFromIndex(
    'dailyEntries',
    'byUserDate',
    IDBKeyRange.bound([userId, desde], [userId, hasta])
  )
}

export async function getVictoriesInRange(userId, desde, hasta) {
  const db = await getDB()
  return db.getAllFromIndex(
    'victories',
    'byUserDate',
    IDBKeyRange.bound([userId, desde], [userId, hasta])
  )
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

export async function getHabit(habitId) {
  const db = await getDB()
  return db.get('habits', habitId)
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

// Todas las marcas de un hábito entre dos fechas, para la cuadrícula de 90 días
// del detalle (§5.7). Rango inclusivo por ambos extremos.
export async function getHabitLogsInRange(habitId, desde, hasta) {
  const db = await getDB()
  return db.getAllFromIndex(
    'habitLogs',
    'byHabitDate',
    IDBKeyRange.bound([habitId, desde], [habitId, hasta])
  )
}

// Marcar es un interruptor, no un contador (§26.3). Toda la operación —mirar si
// ya está marcado, escribir la fila y ajustar el contador— ocurre dentro de una
// sola transacción. Fuera de ella, dos toques seguidos leían los dos "todavía no
// está" y sumaban los dos: la fila seguía siendo una, pero el contador iba por
// ×5. Ese era el error.
//
// La clave de la fila es `${habitId}_${fecha}`, así que la pareja (hábito, día)
// es única por construcción: no puede haber dos marcas del mismo día.
export async function markHabit(habitId, userId, fecha) {
  const db = await getDB()
  const id = `${habitId}_${fecha}`
  const tx = db.transaction(['habitLogs', 'habits'], 'readwrite')

  const yaEstaba = await tx.objectStore('habitLogs').get(id)
  if (yaEstaba) {
    await tx.done
    return yaEstaba
  }

  const log = { id, habitId, userId, fecha, hora: new Date().toISOString() }
  await tx.objectStore('habitLogs').put(log)

  // Contador desnormalizado del hábito (§7.2): cuántos días se ha registrado.
  // Sube solo cuando de verdad se creó la fila.
  const habitos = tx.objectStore('habits')
  const habit   = await habitos.get(habitId)
  const actualizado = habit
    ? { ...habit, totalCompletados: (habit.totalCompletados ?? 0) + 1 }
    : null
  if (actualizado) await habitos.put(actualizado)

  await tx.done

  enqueueSyncItem('habitLogs', log.id, log)
  if (actualizado) enqueueSyncItem('habits', actualizado.id, actualizado)

  return log
}

// Desmarcar corrige un error de toque, así que devuelve el contador a donde
// estaba: si no, marcar y desmarcar tres veces dejaría ×3 en un solo día. Nunca
// baja de cero, y no toca ningún otro día.
//
// Ojo: esto no es la Constancia. La Constancia cuenta días con actividad en
// `dailyEntries` y no depende de este contador (RN-06).
export async function unmarkHabit(habitId, fecha) {
  const db = await getDB()
  const id = `${habitId}_${fecha}`
  const tx = db.transaction(['habitLogs', 'habits'], 'readwrite')

  const existia = await tx.objectStore('habitLogs').get(id)
  if (!existia) {
    await tx.done
    return
  }

  await tx.objectStore('habitLogs').delete(id)

  const habitos = tx.objectStore('habits')
  const habit   = await habitos.get(habitId)
  const actualizado = habit
    ? { ...habit, totalCompletados: Math.max(0, (habit.totalCompletados ?? 0) - 1) }
    : null
  if (actualizado) await habitos.put(actualizado)

  await tx.done

  enqueueSyncItem('habitLogs', id, null, 'delete')
  if (actualizado) enqueueSyncItem('habits', actualizado.id, actualizado)
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
