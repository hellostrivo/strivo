// src/formia/habitos.js
// Lógica de H1, H2 y H3 (SPEC_04). Todo lo que se puede decidir sin pintar:
// cómo se agrupa la lista, qué cuenta como constancia y qué pasa al marcar.
//
// RN-DB4-01 — Este módulo no lee `lumia/`. Un hábito no aparece en ninguna
// superficie de Lumia, en ningún estado (§C3.5, CA-3).
//
// RN-06 — La constancia es `count(distinct fecha)`: una consulta derivada, no
// un contador guardado. Solo sube, nunca se reinicia y es imposible que se
// rompa por un error de sincronización.
//
// Lo que **no** hay aquí, y no es un olvido: días de la semana y recordatorio.
// §5.7 los describía en v3.1, pero el modelo canónico de v4.1 (§C5.2) no los
// recoge y el validador de SPEC_02 rechaza un campo fuera de la lista. En
// Fase 1, todo hábito activo cuenta para hoy.

import { AREA_CATALOG, AREA_IDS, IDENTITY_CENTRAL, formia, shared, strivoDateKey } from '@/lib/db'

// La cuenta de RN-06 vive en un solo sitio (`src/lib/constancia.js`). Aquí se
// reexporta para que las pantallas de hábitos la sigan importando de un lugar
// natural, pero la implementación no está duplicada.
export {
  constanciaDe,
  fechasDe,
  marcadosEn,
  ultimasFechas,
  ultimosNDias,
} from '@/lib/constancia'

/** Orden de los momentos dentro de un grupo. `null` va al final. */
const ORDEN_CONTEXTO = { manana: 0, noche: 1 }

export function ordenDeContexto(context) {
  return ORDEN_CONTEXTO[context] ?? 2
}

/** "alguien que crece" → "Alguien que crece". Solo presentación. */
export function capitalizar(texto) {
  const limpio = String(texto ?? '')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

// ─── Agrupación de H1 ─────────────────────────────────────────────────────────

export function esActivo(habit) {
  return (habit.state ?? 'activo') === 'activo'
}

/**
 * Agrupa la lista **por identidad**, que es el cambio conceptual de H1
 * (SPEC_04 §4): en Fase 0 se ordenaba por momento del día porque servía a un
 * ritual; ahora se ordena por quién estás construyendo. El momento sobrevive
 * como etiqueta de cada fila y como la barra de progreso de arriba (§C3.5).
 *
 * Orden de los grupos: la identidad central primero —siempre existe y es la
 * que sostiene todo—, después las áreas elegidas en su orden de catálogo, y al
 * final las áreas que ya no están elegidas pero conservan hábitos.
 *
 * RN-04 / RN-DB4-08 — Un hábito de un área quitada **sigue apareciendo** y no
 * cambia de identidad solo. Su grupo se marca como no activo, en neutro, sin
 * sugerir que haya nada que arreglar (RN-ID-05).
 *
 * @returns {Array<{key, tipo, areaId, titulo, color, activa, habitos}>}
 */
export function agruparPorIdentidad(habits, areas, central) {
  const activos = habits.filter(esActivo)
  const ordenados = [...activos].sort(compararHabitos)
  const grupos = []

  const deCentral = ordenados.filter((habit) => habit.identityRef === IDENTITY_CENTRAL)
  if (deCentral.length > 0) {
    grupos.push({
      key: IDENTITY_CENTRAL,
      tipo: 'central',
      areaId: null,
      titulo: capitalizar(central ?? ''),
      color: null,
      activa: true,
      habitos: deCentral,
    })
  }

  const porArea = AREA_IDS.map((areaId) => ({
    areaId,
    area: areas?.[areaId],
    habitos: ordenados.filter((habit) => habit.identityRef === areaId),
  }))
    .filter(({ habitos }) => habitos.length > 0)
    .map(({ areaId, area, habitos }) => ({
      key: areaId,
      tipo: 'area',
      areaId,
      titulo: null, // El nombre lo pone la pantalla desde el copy.
      color: area?.color ?? AREA_CATALOG[areaId].color,
      activa: area?.selected === true,
      orden: area?.order ?? AREA_CATALOG[areaId].order,
      habitos,
    }))
    .sort((a, b) => Number(b.activa) - Number(a.activa) || a.orden - b.orden)

  grupos.push(...porArea)

  // RN-DB4-08 — Un hábito cuyo `identityRef` no tiene destino no se descarta ni
  // se repara en silencio: se enseña aparte para que lo resuelva su dueño.
  const porRevisar = ordenados.filter(
    (habit) =>
      habit.identityRef !== IDENTITY_CENTRAL && !AREA_IDS.includes(habit.identityRef),
  )
  if (porRevisar.length > 0) {
    grupos.push({
      key: 'por-revisar',
      tipo: 'revision',
      areaId: null,
      titulo: null,
      color: null,
      activa: true,
      habitos: porRevisar,
    })
  }

  return grupos
}

function compararHabitos(a, b) {
  const porMomento = ordenDeContexto(a.context) - ordenDeContexto(b.context)
  if (porMomento !== 0) return porMomento
  return String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''))
}

/**
 * Progreso del día por momento, para la barra que se llena.
 *
 * RN-FO-HAB-01 — Esto no convierte la lista en una secuencia: no hay principio
 * ni fin, no hay botón que "complete" el conjunto y no pasa nada si se queda a
 * medias. Es una lectura, no una meta.
 *
 * RN-05 — Solo aparecen los momentos que tienen hábitos. Un momento vacío no se
 * enseña: no hay nada que echar en falta.
 */
export function progresoPorMomento(habits, marcados) {
  return ['manana', 'noche']
    .map((context) => {
      const delMomento = habits.filter((habit) => esActivo(habit) && habit.context === context)
      return {
        context,
        total: delMomento.length,
        hechos: delMomento.filter((habit) => marcados.has(habit.id)).length,
      }
    })
    .filter((momento) => momento.total > 0)
}

// ─── Acciones sobre la capa de datos ──────────────────────────────────────────

/**
 * Todo lo que H1 necesita, en una lectura.
 *
 * `hoy` sale de `diaTerminaA` del perfil y no de la medianoche del sistema
 * (RN-DB-01): quien marca a la 01:30 con el día terminando a las 03:00 sigue
 * marcando en el día anterior.
 */
export async function cargarHabitos(uid) {
  const [identity, habits, logs, diaTerminaA] = await Promise.all([
    formia.getIdentity(uid),
    formia.listHabits(uid),
    formia.listHabitLogs(uid),
    shared.getDiaTerminaA(uid),
  ])
  return {
    central: identity?.central ?? null,
    areas: identity?.areas ?? null,
    habits,
    logs,
    hoy: strivoDateKey(diaTerminaA),
  }
}

/**
 * RN-DB4-05 — Crear sin `identityRef` se rechaza en la capa de datos, no solo
 * en la interfaz. La pantalla evita llegar aquí sin identidad (RN-FO-H3-01),
 * pero la puerta está cerrada por dentro igualmente.
 */
export async function crearHabito(uid, habito) {
  await formia.createHabit(uid, habito)
  return { estado: await cargarHabitos(uid) }
}

/**
 * RN-FO-H3-03 — Editar permite **cambiar** de identidad, nunca quitarla, y
 * cambiarla conserva todo el historial: los logs viven en `habitLogs` con su
 * `habitId`, así que no se mueve ni uno.
 */
export async function actualizarHabito(uid, habitId, patch) {
  await formia.updateHabit(uid, habitId, patch)
  return { estado: await cargarHabitos(uid) }
}

/**
 * Marcar y desmarcar. Un toque, sin modal y sin preguntas.
 *
 * RN-01 — Como toda la pantalla lee del mismo estado, marcar en el detalle se
 * ve en la lista y al revés, sin sincronizar nada a mano.
 * Marcar cinco veces el mismo día deja **un** registro: la clave es
 * `{habitId, date}` (SPEC_02).
 */
export async function alternarMarca(uid, habitId, fecha, marcado) {
  if (marcado) await formia.unmarkHabit(uid, habitId, fecha)
  else await formia.markHabit(uid, habitId, fecha)
  return { estado: await cargarHabitos(uid) }
}

/**
 * RN-HB-02 — Pausar y archivar conservan todo el historial. No se borra ni un
 * registro: el hábito deja de estar en la lista activa y nada más.
 */
export async function cambiarEstado(uid, habitId, state) {
  await formia.updateHabit(uid, habitId, { state })
  return { estado: await cargarHabitos(uid) }
}

/** Hábitos fuera de la vista activa, con su historia intacta. */
export function habitosPorEstado(habits, state) {
  return habits.filter((habit) => (habit.state ?? 'activo') === state)
}
